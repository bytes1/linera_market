#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use linera_sdk::{
    contract::ContractRuntime,
    linera_base_types::{
        AccountOwner, Amount, ApplicationId, ChainId, Timestamp, WithContractAbi, Account as FungibleAccount
    },
    views::{RootView, View},
    Contract,
};

use num_bigint::BigUint;
use num_traits::ToPrimitive;

use truemarket::{
    Fees, Message, Operation, TruemarketAbi, MarketState, MAX_FEE, MAX_OUTCOMES,
    MINIMUM_REALITIO_TIMEOUT, FEE_DENOMINATOR,
};

use self::state::{Market, MarketOutcome, TruemarketState};

pub struct TruemarketContract {
    state: TruemarketState,
    runtime: ContractRuntime<Self>,
}

linera_sdk::contract!(TruemarketContract);

impl WithContractAbi for TruemarketContract {
    type Abi = TruemarketAbi;
}

impl Contract for TruemarketContract {
    type Message = Message;
    type Parameters = ();
    type InstantiationArgument = ();
    type EventValue = ();

    async fn load(runtime: ContractRuntime<Self>) -> Self {
        let state = TruemarketState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        TruemarketContract { state, runtime }
    }

    async fn instantiate(&mut self, _argument: Self::InstantiationArgument) {
        self.runtime.application_parameters();
    }

    async fn execute_operation(&mut self, operation: Self::Operation) -> Self::Response {
        let current_chain_id = self.runtime.chain_id();
        let market_chain_id = self.runtime.application_creator_chain_id();

        match operation {
            Operation::CreateMarket {
                value, closes_at, outcomes, token, distribution, question, image,
                arbitrator, buy_fees, sell_fees, treasury, distributor, realitio_timeout, manager,
            } => {
                self.create_market(
                    value, closes_at, outcomes, token, distribution, question, image,
                    arbitrator, buy_fees, sell_fees, treasury, distributor, realitio_timeout, manager,
                ).await;
            }
            Operation::Buy {
                market_id,
                outcome_id,
                min_outcome_shares_to_buy,
                value,
                token, // <--- New parameter
            } => {
                let buyer = self.runtime.authenticated_signer().expect("Authenticated signer required");

                if current_chain_id == market_chain_id {
                    // LOCAL BUY (Same Chain)
                    // The `token` param is ignored here in favor of the one in state, 
                    // but we could verify they match if we wanted.
                    self.buy(
                        market_id,
                        outcome_id,
                        min_outcome_shares_to_buy,
                        buyer,
                        value,
                        current_chain_id, // Receipt goes to self
                    ).await;
                } else {
                    // REMOTE BUY (User Chain -> Market Chain)
                    // We MUST use the `token` passed in arguments because we might not have state
                    self.buy_remote(
                        market_chain_id,
                        market_id,
                        outcome_id,
                        min_outcome_shares_to_buy,
                        buyer,
                        value,
                        current_chain_id, // Return chain ID
                        token, // Pass the token ID explicitly
                    ).await;
                }
            }
        }
    }

    async fn execute_message(&mut self, message: Self::Message) {
        match message {
            Message::Buy {
                market_id,
                outcome_id,
                min_outcome_shares_to_buy,
                owner,
                value,
                return_chain_id,
            } => {
                // Runs on Market Chain
                assert_eq!(
                    self.runtime.chain_id(),
                    self.runtime.application_creator_chain_id(),
                    "Message only valid on market creator chain"
                );

                self.buy(
                    market_id,
                    outcome_id,
                    min_outcome_shares_to_buy,
                    owner,
                    value,
                    return_chain_id,
                ).await;
            }
            Message::ShareMinted {
                market_id,
                outcome_id,
                amount,
            } => {
                // Runs on User Chain (Receipt)
                let market_chain_id = self.runtime.application_creator_chain_id();
                assert_eq!(
                    self.runtime.message_origin_chain_id(),
                    Some(market_chain_id),
                    "Fake receipt detected"
                );

                let key = (market_id, outcome_id);
                // Handle empty state safely
                let current_shares = self.state.my_shares.get(&key).await.expect("View error").unwrap_or(0);
                
                let new_total = current_shares.checked_add(amount).expect("Share overflow");
                self.state.my_shares.insert(&key, new_total).expect("Failed to save local shares");
            }
        }
    }

    async fn store(mut self) {
        self.state.save().await.expect("Failed to save state");
    }
}

impl TruemarketContract {
    // ----- Operations -----

    async fn buy_remote(
        &mut self,
        market_chain_id: ChainId,
        market_id: u64,
        outcome_id: u32,
        min_outcome_shares_to_buy: Amount,
        buyer: AccountOwner,
        value: Amount,
        return_chain_id: ChainId,
        token: ApplicationId,
    ) {
        let token_app_id = token.with_abi::<my_fungible::MyFungibleAbi>();

        // 1. PUSH TOKENS (User Chain -> Market Chain)
        // We transfer to the Application's account on the Market Chain
        let target_account = FungibleAccount {
            chain_id: market_chain_id,
            owner: self.runtime.application_id().into(),
        };
        
        // This runs on User Chain, so it CAN call the transfer
        let transfer = my_fungible::Operation::Transfer {
            owner: buyer,
            amount: value,
            target_account,
        };
        self.runtime.call_application(true, token_app_id, &transfer);

        // 2. SEND INSTRUCTION (User Chain -> Market Chain)
        let message = Message::Buy {
            market_id,
            outcome_id,
            min_outcome_shares_to_buy,
            owner: buyer,
            value,
            return_chain_id,
        };
        self.runtime
            .prepare_message(message)
            .with_authentication()
            .send_to(market_chain_id);
    }

    async fn buy(
        &mut self,
        market_id: u64,
        outcome_id: u32,
        min_outcome_shares_to_buy: Amount,
        buyer: AccountOwner,
        value: Amount,
        recipient_chain_id: ChainId,
    ) {
        let mut market = self.state.markets.get(&market_id).await
            .expect("State error").expect("Market not found");
            
        let token_app_id = market.token.with_abi::<my_fungible::MyFungibleAbi>();

        // 1. HANDLE FUNDS
        // If this is a local operation (no message origin), we need to pull funds.
        // If this is a remote message, funds were PUSHED in buy_remote, so we skip this.
        if self.runtime.message_origin_chain_id().is_none() {
            self.receive_tokens(token_app_id, buyer, value);
        }

        // 2. LOGIC
        assert_eq!(market.state, MarketState::Open, "Market not open");
        assert!(!market.paused, "Market paused");
        assert!(outcome_id < market.outcome_count, "Invalid outcome");

        let value_units = Self::amount_to_units(value);
        let min_shares_units = Self::amount_to_units(min_outcome_shares_to_buy);

        let shares_bought = self.calc_buy_amount(&market, value_units, outcome_id);
        assert!(shares_bought >= min_shares_units, "Slippage: not enough shares");

        // Fees
        let fee_amount = (value_units * market.buy_fees.fee as u128) / FEE_DENOMINATOR;
        let treasury_fee = (value_units * market.buy_fees.treasury_fee as u128) / FEE_DENOMINATOR;
        let distributor_fee = (value_units * market.buy_fees.distributor_fee as u128) / FEE_DENOMINATOR;

        let value_minus_fees = value_units
            .checked_sub(fee_amount).expect("U")
            .checked_sub(treasury_fee).expect("U")
            .checked_sub(distributor_fee).expect("Fee underflow");

        market.fee_accumulator += fee_amount;
        self.add_shares_to_market(&mut market, value_minus_fees);

        let outcome = &mut market.outcomes[outcome_id as usize];
        outcome.shares_available -= shares_bought;
        market.shares_available -= shares_bought;

        // Global Ledger Update
        let key = (market_id, outcome_id, buyer);
        let user_shares = self.state.market_shares.get(&key).await.expect("E").unwrap_or(0);
        self.state.market_shares.insert(&key, user_shares + shares_bought).expect("Save");

        // Fee Payouts
        if treasury_fee > 0 {
            self.send_tokens(token_app_id, market.treasury, Self::units_to_amount(treasury_fee));
        }
        if distributor_fee > 0 {
            self.send_tokens(token_app_id, market.distributor, Self::units_to_amount(distributor_fee));
        }

        self.state.markets.insert(&market_id, market).expect("Save market");

        // 3. SEND RECEIPT
        let current_chain = self.runtime.chain_id();
        if recipient_chain_id == current_chain {
            let local_key = (market_id, outcome_id);
            let current = self.state.my_shares.get(&local_key).await.expect("E").unwrap_or(0);
            self.state.my_shares.insert(&local_key, current + shares_bought).expect("Save local");
        } else {
            let msg = Message::ShareMinted {
                market_id,
                outcome_id,
                amount: shares_bought,
            };
            self.runtime
                .prepare_message(msg)
                .with_authentication()
                .send_to(recipient_chain_id);
        }
    }

    // ----- Helpers (Same as before) -----

    fn amount_to_units(amount: Amount) -> u128 { u128::from(amount) }
    fn units_to_amount(units: u128) -> Amount { Amount::from_attos(units) }

    fn validate_fees(fees: &Fees) {
        assert!(fees.fee <= MAX_FEE);
        assert!(fees.treasury_fee <= MAX_FEE);
        assert!(fees.distributor_fee <= MAX_FEE);
    }

    fn receive_tokens(&mut self, token: ApplicationId<my_fungible::MyFungibleAbi>, from: AccountOwner, amount: Amount) {
        let app_owner: AccountOwner = self.runtime.application_id().into();
        let target_account = FungibleAccount {
            chain_id: self.runtime.chain_id(),
            owner: app_owner,
        };
        let transfer = my_fungible::Operation::Transfer {
            owner: from,
            amount,
            target_account,
        };
        self.runtime.call_application(true, token, &transfer);
    }

    fn send_tokens(&mut self, token: ApplicationId<my_fungible::MyFungibleAbi>, to: AccountOwner, amount: Amount) {
        if amount.is_zero() { return; }
        let target_account = FungibleAccount {
            chain_id: self.runtime.chain_id(),
            owner: to,
        };
        let app_owner: AccountOwner = self.runtime.application_id().into();
        let transfer = my_fungible::Operation::Transfer {
            owner: app_owner,
            amount,
            target_account,
        };
        self.runtime.call_application(true, token, &transfer);
    }

    async fn create_market(
        &mut self,
        value: Amount,
        closes_at: Timestamp,
        outcomes: u32,
        token: ApplicationId,
        distribution: Vec<u64>,
        question: String,
        image: String,
        arbitrator: AccountOwner,
        buy_fees: Fees,
        sell_fees: Fees,
        treasury: AccountOwner,
        distributor: AccountOwner,
        realitio_timeout: u32,
        manager: AccountOwner,
    ) {
        let _ = distribution;
        let creator = self.runtime.authenticated_signer().expect("Auth required");

        assert!(!value.is_zero());
        self.runtime.assert_before(closes_at);
        assert!(outcomes >= 2 && outcomes <= MAX_OUTCOMES);
        Self::validate_fees(&buy_fees);
        Self::validate_fees(&sell_fees);

        let fungible_id = token.with_abi::<my_fungible::MyFungibleAbi>();
        self.receive_tokens(fungible_id, creator, value);

        let market_id = *self.state.market_index.get();
        let question_id = format!("q_{}_{}", market_id, question);

        let mut market = Market {
            id: market_id,
            closes_at_timestamp: closes_at,
            balance: Amount::ZERO,
            liquidity: 0,
            shares_available: 0,
            state: MarketState::Open,
            buy_fees,
            sell_fees,
            treasury,
            distributor,
            fee_accumulator: 0,
            question,
            question_id,
            arbitrator,
            realitio_timeout,
            outcome_count: outcomes,
            outcomes: Vec::new(),
            token,
            manager,
            creator,
            paused: false,
            image,
        };

        for i in 0..outcomes {
            market.outcomes.push(MarketOutcome {
                id: i,
                shares_total: 0,
                shares_available: 0,
            });
        }

        let value_units = Self::amount_to_units(value);
        self.add_initial_liquidity(&mut market, value_units);

        self.state.markets.insert(&market_id, market).expect("Save market");
        self.state.market_index.set(market_id + 1);
    }

    fn add_initial_liquidity(&self, market: &mut Market, value_units: u128) {
        market.liquidity += value_units;
        market.balance = market.balance.try_add(Self::units_to_amount(value_units)).expect("Over");
        for outcome in &mut market.outcomes {
            outcome.shares_available += value_units;
            outcome.shares_total += value_units;
            market.shares_available += value_units;
        }
    }

    fn add_shares_to_market(&self, market: &mut Market, amount_units: u128) {
        for outcome in &mut market.outcomes {
            outcome.shares_available += amount_units;
            outcome.shares_total += amount_units;
            market.shares_available += amount_units;
        }
        market.balance = market.balance.try_add(Self::units_to_amount(amount_units)).expect("Over");
    }

    fn calc_buy_amount(&self, market: &Market, amount_units: u128, outcome_id: u32) -> u128 {
        let buy_pool = market.outcomes[outcome_id as usize].shares_available;
        let mut ending_balance = BigUint::from(buy_pool);

        for (i, outcome) in market.outcomes.iter().enumerate() {
            if i as u32 != outcome_id {
                let shares = BigUint::from(outcome.shares_available);
                let denom = &shares + BigUint::from(amount_units);
                let num = &ending_balance * &shares;
                ending_balance = (num + &denom - BigUint::from(1u32)) / denom;
            }
        }
        let ending_u128 = ending_balance.to_u128().expect("Overflow");
        buy_pool.checked_add(amount_units).expect("Over").checked_sub(ending_u128).expect("Under")
    }
}
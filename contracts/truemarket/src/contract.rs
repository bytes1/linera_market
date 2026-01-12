#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;
use std::str::FromStr;
use linera_sdk::{
    contract::ContractRuntime,
    linera_base_types::{
        AccountOwner, Amount, ApplicationId, ChainId, Timestamp, WithContractAbi, Account as FungibleAccount
    },
    views::{RootView, View},
    Contract,
};

use num_bigint::BigUint;
use num_traits::{ToPrimitive, Zero};


use truemarket::{
    Fees, Message, Operation, TruemarketAbi, MarketState, FEE_DENOMINATOR,
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
                market_id, outcome_id, min_outcome_shares_to_buy, value, token,
            } => {
                let buyer = self.runtime.authenticated_signer().expect("Auth required");
                if current_chain_id == market_chain_id {
                    let market = self.state.markets.get(&market_id).await.expect("View").expect("Market not found");
                    let token_app = market.token.with_abi::<my_fungible::MyFungibleAbi>();
                    self.receive_tokens(token_app, buyer, value);
                    
                    self.buy_internal(market_id, outcome_id, min_outcome_shares_to_buy, buyer, value, current_chain_id).await;
                } else {
                    self.buy_remote(market_chain_id, market_id, outcome_id, min_outcome_shares_to_buy, buyer, value, current_chain_id, token).await;
                }
            }
            Operation::Sell {
                market_id, outcome_id, shares, token: _
            } => {
                let owner = self.runtime.authenticated_signer().expect("Auth required");
                let shares_u128 = u128::from(shares);
                if current_chain_id == market_chain_id {
                    self.sell(market_id, outcome_id, shares_u128, owner, current_chain_id).await;
                } else {
                    self.sell_remote(market_chain_id, market_id, outcome_id, shares_u128, owner, current_chain_id).await;
                }
            }
            Operation::Resolve { market_id, winning_outcome } => {
                 self.resolve(market_id, winning_outcome).await;
            }
            Operation::Claim { market_id, token: _ } => {
                let owner = self.runtime.authenticated_signer().expect("Auth required");
                if current_chain_id == market_chain_id {
                    self.claim(market_id, owner, current_chain_id).await;
                } else {
                    self.claim_remote(market_chain_id, market_id, owner, current_chain_id).await;
                }
            }
            Operation::TestRemoteTransfer { token, amount, target_chain, target_owner, sender } => {
                let msg = Message::TestRemoteTransfer {
                    token,
                    amount,
                    target_chain,
                    target_owner,
                    sender,
                };
                self.runtime.prepare_message(msg).with_authentication().send_to(market_chain_id);
            }
        }
    }

    async fn execute_message(&mut self, message: Self::Message) {
        if self.runtime.message_origin_chain_id() != Some(self.runtime.application_creator_chain_id()) 
           && self.runtime.chain_id() != self.runtime.application_creator_chain_id() {
             return; 
        }

        match message {
            Message::Buy { market_id, outcome_id, min_outcome_shares_to_buy, owner, value, return_chain_id } => {
                if self.runtime.chain_id() == self.runtime.application_creator_chain_id() {
                    self.buy_internal(market_id, outcome_id, min_outcome_shares_to_buy, owner, value, return_chain_id).await;
                }
            }
            Message::Sell { market_id, outcome_id, shares, owner, return_chain_id } => {
                if self.runtime.chain_id() == self.runtime.application_creator_chain_id() {
                    self.sell(market_id, outcome_id, shares, owner, return_chain_id).await;
                }
            }
            Message::Claim { market_id, owner, return_chain_id } => {
                if self.runtime.chain_id() == self.runtime.application_creator_chain_id() {
                    self.claim(market_id, owner, return_chain_id).await;
                }
            }
            Message::ShareMinted { market_id, outcome_id, amount } => {
                let key = (market_id, outcome_id);
                let current_shares = self.state.my_shares.get(&key).await.expect("View").unwrap_or(0);
                self.state.my_shares.insert(&key, current_shares.saturating_add(amount)).expect("Save");
            }
            Message::ShareBurnt { market_id, outcome_id, amount } => {
                // Kept for consistency, though sell_remote updates optimistically now.
                let key = (market_id, outcome_id);
                let current_shares = self.state.my_shares.get(&key).await.expect("View").unwrap_or(0);
                self.state.my_shares.insert(&key, current_shares.saturating_sub(amount)).expect("Save");
            }
            Message::TestRemoteTransfer { token, amount, target_chain, target_owner, sender } => {
                if self.runtime.chain_id() == self.runtime.application_creator_chain_id() {
                    let token_app = token.with_abi::<my_fungible::MyFungibleAbi>();
                    let target_account = FungibleAccount { 
                        chain_id: target_chain, 
                        owner: target_owner 
                    };
                    let op = my_fungible::Operation::Transfer {
                        owner: sender, 
                        amount,
                        target_account,
                    };
                    self.runtime.call_application(true, token_app, &op);
                }
            }
        }
    }

    async fn store(mut self) {
        self.state.save().await.expect("Failed to save state");
    }
}

impl TruemarketContract {
    async fn buy_internal(
        &mut self, market_id: u64, outcome_id: u32, min_shares: Amount, buyer: AccountOwner, value: Amount, return_chain: ChainId
    ) {
        let market_opt = self.state.markets.get(&market_id).await.expect("View");
        let mut market = match market_opt {
            Some(m) => m,
            None => panic!("Market not found"),
        };
        
        assert_eq!(market.state, MarketState::Open, "Market not open");
        assert!(!market.paused, "Market paused");

        let val_units = Self::amount_to_units(value);
        let bought = self.calc_buy_amount(&market, val_units, outcome_id);
        
        assert!(bought >= Self::amount_to_units(min_shares), "Slippage too high");

        let fees = market.buy_fees.clone();
        let fee_amt = (val_units * fees.fee as u128) / FEE_DENOMINATOR;
        let t_fee = (val_units * fees.treasury_fee as u128) / FEE_DENOMINATOR;
        let d_fee = (val_units * fees.distributor_fee as u128) / FEE_DENOMINATOR;
        let net_val = val_units.saturating_sub(fee_amt).saturating_sub(t_fee).saturating_sub(d_fee);
        
        market.fee_accumulator += fee_amt;
        self.add_shares_to_market(&mut market, net_val);

        if (outcome_id as usize) < market.outcomes.len() {
            let outcome = &mut market.outcomes[outcome_id as usize];
            outcome.shares_available = outcome.shares_available.saturating_sub(bought);
        }
        market.shares_available = market.shares_available.saturating_sub(bought);

        let key = (market_id, outcome_id, buyer);
        let u_shares = self.state.market_shares.get(&key).await.expect("View").unwrap_or(0);
        self.state.market_shares.insert(&key, u_shares + bought).expect("Save");

        let token_app = market.token.with_abi::<my_fungible::MyFungibleAbi>();
        let current_chain = self.runtime.chain_id();

        if t_fee > 0 { self.send_tokens(token_app, market.treasury, Self::units_to_amount(t_fee), current_chain); }
        if d_fee > 0 { self.send_tokens(token_app, market.distributor, Self::units_to_amount(d_fee), current_chain); }

        self.state.markets.insert(&market_id, market).expect("Save");

        if return_chain == current_chain {
             let l_key = (market_id, outcome_id);
             let curr = self.state.my_shares.get(&l_key).await.expect("View").unwrap_or(0);
             self.state.my_shares.insert(&l_key, curr + bought).expect("Save");
        } else {
             let msg = Message::ShareMinted { market_id, outcome_id, amount: bought };
             self.runtime.prepare_message(msg).with_authentication().send_to(return_chain);
        }
    }

  async fn sell(
        &mut self, market_id: u64, outcome_id: u32, shares: u128, owner: AccountOwner, return_chain: ChainId
    ) {
        let market_opt = self.state.markets.get(&market_id).await.expect("View");
        let mut market = match market_opt {
            Some(m) => m,
            None => panic!("Market not found"),
        };
        
        let key = (market_id, outcome_id, owner);
        let u_shares = self.state.market_shares.get(&key).await.expect("View").unwrap_or(0);
        
        assert!(u_shares >= shares, "Insufficient shares");

        let payout = self.calc_sell_amount(&market, shares, outcome_id);
        
        let fees = market.sell_fees.clone();
        let fee_amt = (payout * fees.fee as u128) / FEE_DENOMINATOR;
        let t_fee = (payout * fees.treasury_fee as u128) / FEE_DENOMINATOR;
        let d_fee = (payout * fees.distributor_fee as u128) / FEE_DENOMINATOR;
        
        let net = payout.saturating_sub(fee_amt).saturating_sub(t_fee).saturating_sub(d_fee);

        if (outcome_id as usize) < market.outcomes.len() {
            let outcome = &mut market.outcomes[outcome_id as usize];
            outcome.shares_available = outcome.shares_available.saturating_add(shares);
        }
        market.shares_available = market.shares_available.saturating_add(shares);
        
        let payout_amt = Amount::from_attos(net);
        
        market.balance = market.balance.try_sub(payout_amt).unwrap_or(Amount::ZERO);
        market.fee_accumulator += fee_amt;
        
        let token_app = market.token.with_abi::<my_fungible::MyFungibleAbi>();
        let current_chain = self.runtime.chain_id();

        if t_fee > 0 { 
            self.send_tokens(token_app, market.treasury, Self::units_to_amount(t_fee), current_chain);
            if market.balance >= Self::units_to_amount(t_fee) { market.balance = market.balance.try_sub(Self::units_to_amount(t_fee)).unwrap(); }
        }
        if d_fee > 0 { 
            self.send_tokens(token_app, market.distributor, Self::units_to_amount(d_fee), current_chain); 
            if market.balance >= Self::units_to_amount(d_fee) { market.balance = market.balance.try_sub(Self::units_to_amount(d_fee)).unwrap(); }
        }

        self.state.markets.insert(&market_id, market).expect("Save");
        self.state.market_shares.insert(&key, u_shares - shares).expect("Save");

     

       
        let target = FungibleAccount { 
            chain_id: return_chain, 
            owner: owner 
        };
        
      
        let app_owner: AccountOwner = self.runtime.application_id().into();

        let op = my_fungible::Operation::Transfer { 
            owner: app_owner, 
            amount: payout_amt, 
            target_account: target 
        };
        
        

        self.runtime.call_application(true, token_app, &op);

        if return_chain == current_chain {
             let l_key = (market_id, outcome_id);
             let curr = self.state.my_shares.get(&l_key).await.expect("View").unwrap_or(0);
             self.state.my_shares.insert(&l_key, curr.saturating_sub(shares)).expect("Save");
        } 
    }

    async fn claim(&mut self, market_id: u64, owner: AccountOwner, return_chain: ChainId) {
        let market_opt = self.state.markets.get(&market_id).await.expect("View");
        let market = match market_opt {
            Some(m) => m,
            None => panic!("Market not found"), 
        };

        assert_eq!(market.state, MarketState::Resolved, "Market not resolved");
        let winner = market.winning_outcome.expect("Winner not set");
        
        let key = (market_id, winner, owner);
        let shares = self.state.market_shares.get(&key).await.expect("View").unwrap_or(0);
        if shares == 0 { return; }

        let token_app = market.token.with_abi::<my_fungible::MyFungibleAbi>();
        self.state.market_shares.insert(&key, 0).expect("Save");
        
        self.send_tokens(token_app, owner, Self::units_to_amount(shares), return_chain);

        let current_chain = self.runtime.chain_id();
        if return_chain == current_chain {
             let l_key = (market_id, winner);
             self.state.my_shares.insert(&l_key, 0).expect("Save");
        } else {
             let msg = Message::ShareBurnt { market_id, outcome_id: winner, amount: shares };
             self.runtime.prepare_message(msg).with_authentication().send_to(return_chain);
        }
    }

    async fn resolve(&mut self, market_id: u64, winning_outcome: u32) {
        let market_opt = self.state.markets.get(&market_id).await.expect("View");
        let mut market = match market_opt { Some(m) => m, None => panic!("Market not found") };
        let signer = self.runtime.authenticated_signer().expect("Auth");
        assert_eq!(signer, market.creator, "Unauthorized");
        assert!(winning_outcome < market.outcome_count, "Invalid outcome");
        
        market.state = MarketState::Resolved;
        market.winning_outcome = Some(winning_outcome);
        self.state.markets.insert(&market_id, market).expect("Save");
    }

    async fn buy_remote(
        &mut self, market_chain: ChainId, market_id: u64, outcome_id: u32, min_shares: Amount, buyer: AccountOwner, value: Amount, return_chain: ChainId, token: ApplicationId
    ) {
        let token_app = token.with_abi::<my_fungible::MyFungibleAbi>();
        
        // FIXED: Use .into()
        let app_owner: AccountOwner = self.runtime.application_id().into();
        let target = FungibleAccount { chain_id: market_chain, owner: app_owner };
        
        let transfer = my_fungible::Operation::Transfer { owner: buyer, amount: value, target_account: target };
        self.runtime.call_application(true, token_app, &transfer);
        
        let msg = Message::Buy { market_id, outcome_id, min_outcome_shares_to_buy: min_shares, owner: buyer, value, return_chain_id: return_chain };
        self.runtime.prepare_message(msg).with_authentication().send_to(market_chain);
    }

    async fn sell_remote(
        &mut self, market_chain: ChainId, market_id: u64, outcome_id: u32, shares: u128, owner: AccountOwner, return_chain: ChainId
    ) {
        let key = (market_id, outcome_id);
        let curr = self.state.my_shares.get(&key).await.expect("View").unwrap_or(0);
        if curr < shares { panic!("Insufficient shares"); }
        
        // --- FIXED: Optimistic Update (Subtract immediately) ---
        self.state.my_shares.insert(&key, curr - shares).expect("Save");
        
        let msg = Message::Sell { market_id, outcome_id, shares, owner, return_chain_id: return_chain };
        self.runtime.prepare_message(msg).with_authentication().send_to(market_chain);
    }

    async fn claim_remote(&mut self, market_chain: ChainId, market_id: u64, owner: AccountOwner, return_chain: ChainId) {
        let msg = Message::Claim { market_id, owner, return_chain_id: return_chain };
        self.runtime.prepare_message(msg).with_authentication().send_to(market_chain);
    }

    fn calc_buy_amount(&self, market: &Market, amount_units: u128, outcome_id: u32) -> u128 {
        if outcome_id as usize >= market.outcomes.len() { return 0; }
        let buy_pool_u128 = market.outcomes[outcome_id as usize].shares_available;
        let mut ending_balance = BigUint::from(buy_pool_u128);
        let amount_big = BigUint::from(amount_units);
        for (i, outcome) in market.outcomes.iter().enumerate() {
            if i as u32 != outcome_id {
                let shares = BigUint::from(outcome.shares_available);
                let denom = &shares + &amount_big;
                if denom.is_zero() { continue; }
                let num = &ending_balance * &shares;
                ending_balance = (num + &denom - 1u32) / denom;
            }
        }
        let theoretical_pool = BigUint::from(buy_pool_u128) + amount_big;
        if ending_balance > theoretical_pool { return 0; }
        let result_big = theoretical_pool - ending_balance;
        if result_big > BigUint::from(u128::MAX) { u128::MAX } else { result_big.to_u128().unwrap_or(0) }
    }

    fn calc_sell_amount(&self, market: &Market, shares_to_sell: u128, outcome_id: u32) -> u128 {
        let mut low = 0u128;
        let mut high = u128::from(market.balance); 
        let mut result = 0u128;
        for _ in 0..100 {
            if low > high { break; }
            let mid = (low + high) / 2;
            if mid == 0 { low = 1; continue; }
            let shares_for_mid = self.calc_buy_amount(market, mid, outcome_id);
            if shares_for_mid == shares_to_sell { return mid; } 
            else if shares_for_mid < shares_to_sell { result = mid; low = mid + 1; } 
            else { high = mid - 1; }
        }
        result
    }

    fn receive_tokens(&mut self, token: ApplicationId<my_fungible::MyFungibleAbi>, from: AccountOwner, amount: Amount) {
        
        let app_owner: AccountOwner = self.runtime.application_id().into();
        let target = FungibleAccount { chain_id: self.runtime.chain_id(), owner: app_owner };
        
        let op = my_fungible::Operation::Transfer { owner: from, amount, target_account: target };
        self.runtime.call_application(true, token, &op);
    }
    
    fn send_tokens(&mut self, token: ApplicationId<my_fungible::MyFungibleAbi>, to: AccountOwner, amount: Amount, target_chain: ChainId) {
        if amount.is_zero() { return; }
        let target = FungibleAccount { chain_id: target_chain, owner: to };
        
        
        let app_owner: AccountOwner = self.runtime.application_id().into();

        let op = my_fungible::Operation::Transfer { owner: app_owner, amount, target_account: target };
        self.runtime.call_application(true, token, &op);
    }

    fn amount_to_units(amount: Amount) -> u128 { u128::from(amount) }
    fn units_to_amount(units: u128) -> Amount { Amount::from_attos(units) }
    fn add_shares_to_market(&self, market: &mut Market, amount: u128) {
        for outcome in &mut market.outcomes {
            outcome.shares_available += amount;
            outcome.shares_total += amount;
            market.shares_available += amount;
        }
        market.balance = market.balance.try_add(Self::units_to_amount(amount)).unwrap_or(Amount::MAX);
    }
    
    async fn create_market(
        &mut self, value: Amount, closes_at: Timestamp, outcomes: u32, token: ApplicationId, distribution: Vec<u64>, question: String, image: String, arbitrator: AccountOwner, buy_fees: Fees, sell_fees: Fees, treasury: AccountOwner, distributor: AccountOwner, realitio_timeout: u32, manager: AccountOwner
    ) {
        let _ = distribution;
        let creator = self.runtime.authenticated_signer().expect("Auth");
        let token_app = token.with_abi::<my_fungible::MyFungibleAbi>();
        self.receive_tokens(token_app, creator, value);
        let id = *self.state.market_index.get();
        let mut market = Market {
            id, closes_at_timestamp: closes_at, balance: Amount::ZERO, liquidity: 0, shares_available: 0,
            state: MarketState::Open, buy_fees, sell_fees, treasury, distributor, fee_accumulator: 0,
            question: question.clone(), question_id: format!("q_{}_{}", id, question), arbitrator,
            realitio_timeout, outcome_count: outcomes, outcomes: Vec::new(), token, manager, creator,
            paused: false, image, winning_outcome: None
        };
        for i in 0..outcomes { market.outcomes.push(MarketOutcome { id: i, shares_total: 0, shares_available: 0 }); }
        let val_units = Self::amount_to_units(value);
        market.liquidity += val_units;
        market.balance = market.balance.try_add(value).unwrap();
        self.add_shares_to_market(&mut market, val_units);
        self.state.markets.insert(&id, market).expect("Save");
        self.state.market_index.set(id + 1);
    }
}
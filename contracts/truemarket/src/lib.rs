use async_graphql::{Request, Response, SimpleObject, InputObject};
use linera_sdk::{
    graphql::GraphQLMutationRoot,
    linera_base_types::{ContractAbi, ServiceAbi, Amount, ApplicationId, AccountOwner, Timestamp, ChainId},
};
use serde::{Deserialize, Serialize};

pub struct TruemarketAbi;

impl ContractAbi for TruemarketAbi {
    type Operation = Operation;
    type Response = ();
}

impl ServiceAbi for TruemarketAbi {
    type Query = Request;
    type QueryResponse = Response;
}

#[derive(Debug, Deserialize, Serialize, GraphQLMutationRoot)]
pub enum Operation {
    CreateMarket {
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
    },
    Buy {
        market_id: u64,
        outcome_id: u32,
        min_outcome_shares_to_buy: Amount,
        value: Amount,
        // ADDED: Required so the User Chain knows what token to send
        token: ApplicationId, 
    },
}

#[derive(Debug, Deserialize, Serialize)]
pub enum Message {
    Buy {
        market_id: u64,
        outcome_id: u32,
        min_outcome_shares_to_buy: Amount,
        owner: AccountOwner,
        value: Amount,
        // Added to support receipts
        return_chain_id: ChainId, 
    },
    // Receipt message sent back to the user
    ShareMinted {
        market_id: u64,
        outcome_id: u32,
        amount: u128,
    }
}

#[derive(
    Debug, Deserialize, Serialize, Clone, Default, SimpleObject, InputObject
)]
pub struct Fees {
    pub fee: u64,
    pub treasury_fee: u64,
    pub distributor_fee: u64,
}

#[derive(Debug, Deserialize, Serialize, Clone, Copy, PartialEq, Eq, async_graphql::Enum)]
pub enum MarketState {
    Open,
    Closed,
    Resolved,
}

pub const MAX_OUTCOMES: u32 = 32;
pub const MAX_FEE: u64 = 500;
pub const MINIMUM_REALITIO_TIMEOUT: u32 = 3600;
pub const FEE_DENOMINATOR: u128 = 10_000;
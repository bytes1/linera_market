use serde::{Deserialize, Serialize};

use linera_sdk::views::{linera_views, MapView, RegisterView, RootView, ViewStorageContext};
use linera_sdk::linera_base_types::{ApplicationId, AccountOwner, Timestamp, Amount};

use truemarket::{Fees, MarketState};

#[derive(RootView)]
#[view(context = ViewStorageContext)]
pub struct TruemarketState {
    /// Total number of markets created.
    #[view(default)]
    pub market_index: RegisterView<u64>,

    /// Storage for Market details.
    #[view(default)]
    pub markets: MapView<u64, Market>,

    /// User shares: (Market ID, Outcome ID, AccountOwner) -> Share Amount
    #[view(default)]
    pub market_shares: MapView<(u64, u32, AccountOwner), u128>,

    #[view(default)]
    pub my_shares: MapView<(u64, u32), u128>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Market {
    pub id: u64,
    pub closes_at_timestamp: Timestamp,
    pub balance: Amount,
    pub liquidity: u128,
    pub shares_available: u128,
    pub state: MarketState,

    pub buy_fees: Fees,
    pub sell_fees: Fees,
    pub treasury: AccountOwner,
    pub distributor: AccountOwner,
    pub fee_accumulator: u128,

    pub question: String,
    pub question_id: String,
    pub arbitrator: AccountOwner,
    pub realitio_timeout: u32,

    pub outcome_count: u32,
    pub outcomes: Vec<MarketOutcome>,

    pub token: ApplicationId,
    pub manager: AccountOwner,
    pub creator: AccountOwner,
    pub paused: bool,
    pub image: String,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct MarketOutcome {
    pub id: u32,
    pub shares_total: u128,
    pub shares_available: u128,
}

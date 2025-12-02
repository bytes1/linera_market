#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use std::sync::Arc;

use async_graphql::{
    Context, EmptySubscription, Object, Request, Response, Schema, SimpleObject,
};
use linera_sdk::{
    graphql::GraphQLMutationRoot, linera_base_types::WithServiceAbi, views::View, Service,
    ServiceRuntime,
};

use truemarket::{Operation, TruemarketAbi, MarketState, MAX_OUTCOMES};

use self::state::{Market, TruemarketState};

pub struct TruemarketService {
    state: Arc<TruemarketState>,
    runtime: Arc<ServiceRuntime<Self>>,
}

linera_sdk::service!(TruemarketService);

impl WithServiceAbi for TruemarketService {
    type Abi = TruemarketAbi;
}

impl Service for TruemarketService {
    type Parameters = ();

    async fn new(runtime: ServiceRuntime<Self>) -> Self {
        let state = TruemarketState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        TruemarketService {
            state: Arc::new(state),
            runtime: Arc::new(runtime),
        }
    }

    async fn handle_query(&self, request: Request) -> Response {
        let schema = Schema::build(
            QueryRoot,
            Operation::mutation_root(self.runtime.clone()),
            EmptySubscription,
        )
        .data(self.state.clone())
        .finish();

        schema.execute(request).await
    }
}

/// What we expose over GraphQL for a market
#[derive(SimpleObject)]
struct MarketView {
    id: u64,
    question: String,
    image: String,
    outcome_count: u32,
    state: MarketState,
}

#[derive(SimpleObject)]
struct ShareView {
    market_id: u64,
    outcome_id: u32,
    amount: String, 
}

struct QueryRoot;

#[Object]
impl QueryRoot {
    async fn api_version(&self) -> &str {
        "truemarket-v0.1.0"
    }

    async fn market(
        &self,
        ctx: &Context<'_>,
        id: u64,
    ) -> async_graphql::Result<Option<MarketView>> {
        let state = ctx.data::<Arc<TruemarketState>>()?;
        let maybe = state
            .markets
            .get(&id)
            .await
            .map_err(|e| async_graphql::Error::new(format!("Failed to load market: {e}")))?;

        Ok(maybe.map(|m: Market| MarketView {
            id: m.id,
            question: m.question,
            image: m.image,
            outcome_count: m.outcome_count,
            state: m.state,
        }))
    }

    /// Fetch the authenticated user's shares
    async fn my_shares(
        &self,
        ctx: &Context<'_>,
        market_id: u64,
    ) -> async_graphql::Result<Vec<ShareView>> {
        let state = ctx.data::<Arc<TruemarketState>>()?;
        let mut results = Vec::new();

        // FIX: We cannot load `state.markets.get(&market_id)` here because
        // the User Chain doesn't have the market definition.
        // Instead, we blindly check all possible outcome slots.
        
        for outcome_id in 0..MAX_OUTCOMES {
            let key = (market_id, outcome_id);
            
            // Check if we have shares for this outcome
            let amount = state
                .my_shares
                .get(&key)
                .await
                .map_err(|e| async_graphql::Error::new(format!("E: {e}")))?
                .unwrap_or(0);

            if amount > 0 {
                results.push(ShareView {
                    market_id,
                    outcome_id,
                    amount: amount.to_string(),
                });
            }
        }

        Ok(results)
    }
}
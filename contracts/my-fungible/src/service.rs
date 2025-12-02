#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use std::sync::Arc;

use async_graphql::{EmptySubscription, Object, Request, Response, Schema};
use linera_sdk::{
    graphql::GraphQLMutationRoot, Service,
    ServiceRuntime,
    linera_base_types::{AccountOwner, Amount, WithServiceAbi},
    views::{MapView, View}
};

use my_fungible::Operation;

use self::state::MyFungibleState;

// FIX 1A: Derive Clone since all fields (Arc<T>) are cloneable.
#[derive(Clone)] 
pub struct MyFungibleService {
    state: Arc<MyFungibleState>,
    runtime: Arc<ServiceRuntime<Self>>,
}

linera_sdk::service!(MyFungibleService);

impl WithServiceAbi for MyFungibleService {
    type Abi = my_fungible::MyFungibleAbi;
}

impl Service for MyFungibleService {
    type Parameters = ();

    async fn new(runtime: ServiceRuntime<Self>) -> Self {
        let state = MyFungibleState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        MyFungibleService {
            state: Arc::new(state),
            runtime: Arc::new(runtime),
        }
    }

    // FIX 2: Use concrete Request/Response types for handle_query
    async fn handle_query(&self, request: Request) -> Response {
        Schema::build(
            self.clone(), // FIX 1B: MyFungibleService is now Clone
            Operation::mutation_root(self.runtime.clone()),
            EmptySubscription,
        )
        .finish()
        .execute(request)
        .await
    }
}


#[Object]
impl MyFungibleService {
    // Query to get the balance of a specific account owner.
    async fn balance(&self, owner: AccountOwner) -> Amount {
        // Accessing the MapView inside the Arc and querying the balance.
        // This is a much more common and safer GraphQL query pattern than returning the MapView reference.
        self.state.accounts
            .get(&owner)
            .await
            .expect("Failed to read from MapView")
            .unwrap_or_default() // Return 0 if the account is not found
    }
}
use async_graphql::{Request, Response};
use linera_sdk::{
    graphql::GraphQLMutationRoot,
    linera_base_types::{ContractAbi, ServiceAbi,AccountOwner,Amount,Account},
};
use serde::{Deserialize, Serialize};

pub struct MyFungibleAbi;

impl ContractAbi for MyFungibleAbi {
    type Operation = Operation;
    type Response = ();
}

impl ServiceAbi for MyFungibleAbi {
    type Query = Request;
    type QueryResponse = Response;
}

#[derive(Debug, Deserialize, Serialize, GraphQLMutationRoot)]
pub enum Operation {
    Transfer{owner: AccountOwner, amount:Amount, target_account:Account},
    Mint {
        owner: AccountOwner,
        amount: Amount,
    },
}

#[derive(Debug, Deserialize, Serialize)]
pub enum Message{
    Credit {
        owner:AccountOwner,
        amount: Amount
    }
}


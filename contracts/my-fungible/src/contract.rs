#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use linera_sdk::{
    linera_base_types::{WithContractAbi,AccountOwner,Amount,Account},
    views::{RootView, View},
    Contract, ContractRuntime,
};
use std::str::FromStr;
use my_fungible::{Operation,Message};

use self::state::MyFungibleState;

pub struct MyFungibleContract {
    state: MyFungibleState,
    runtime: ContractRuntime<Self>,
}

linera_sdk::contract!(MyFungibleContract);

impl WithContractAbi for MyFungibleContract {
    type Abi = my_fungible::MyFungibleAbi;
}

impl Contract for MyFungibleContract {
    type Message = Message;
    type Parameters = ();
    type InstantiationArgument = ();
    type EventValue = ();

    async fn load(runtime: ContractRuntime<Self>) -> Self {
        let state = MyFungibleState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        MyFungibleContract { state, runtime }
    }

    async fn instantiate(&mut self, argument: Self::InstantiationArgument) {
        let amount:Amount= Amount::from_str("1_000_000").unwrap();
        if let Some(owner)=self.runtime.authenticated_signer(){
            self.state.initialize_accounts(owner,amount).await;
        }
       
    }

    async fn execute_operation(&mut self, operation: Self::Operation) -> Self::Response {
        match operation {
           Operation::Transfer { owner, amount, target_account } => {
            self.check_account_authentication(owner);
            self.state.debit(owner,amount).await;
            self.finish_transfer_to_account(amount,target_account).await;
        }
        // NEW: Handle Minting
            Operation::Mint { owner, amount } => {
                // Ensure only the user can mint for themselves (optional security check)
                // or allow open minting. Here we just credit the requested owner.
                self.state.credit(owner, amount).await;
            }

        }
    }

    async fn execute_message(&mut self, _message: Self::Message) {
        match _message{
            Message::Credit{amount, owner}=>{
                self.state.credit(owner,amount).await;
            }
        }
    }

    async fn store(mut self) {
        self.state.save().await.expect("Failed to save state");
    }
}

impl MyFungibleContract{
    fn check_account_authentication(&mut self , owner:AccountOwner){
        assert_eq!(
            self.runtime.authenticated_signer(),Some(owner),"Incorrect authentication"
        )
    }

    async fn finish_transfer_to_account(&mut self, amount: Amount, account: Account){
        if account.chain_id==self.runtime.chain_id(){
            self.state.credit(account.owner,amount).await;
        }else{
            let message=Message::Credit{
                owner:account.owner,
                amount
            };
            self.runtime.prepare_message(message).with_authentication().send_to(account.chain_id);
        }
    }
}

// #[cfg(test)]
// mod tests {
//     use futures::FutureExt as _;
//     use linera_sdk::{util::BlockingWait, views::View, Contract, ContractRuntime};

//     use my_fungible::Operation;

//     use super::{MyFungibleContract, MyFungibleState};

//     #[test]
//     fn operation() {
//         let initial_value = 10u64;
//         let mut app = create_and_instantiate_app(initial_value);

//         let increment = 10u64;

//         let _response = app
//             .execute_operation(Operation::Increment { value: increment })
//             .now_or_never()
//             .expect("Execution of application operation should not await anything");

//         assert_eq!(*app.state.value.get(), initial_value + increment);
//     }

//     fn create_and_instantiate_app(initial_value: u64) -> MyFungibleContract {
//         let runtime = ContractRuntime::new().with_application_parameters(());
//         let mut contract = MyFungibleContract {
//             state: MyFungibleState::load(runtime.root_view_storage_context())
//                 .blocking_wait()
//                 .expect("Failed to read from mock key value store"),
//             runtime,
//         };

//         contract
//             .instantiate(initial_value)
//             .now_or_never()
//             .expect("Initialization of application state should not await anything");

//         assert_eq!(*contract.state.value.get(), initial_value);

//         contract
//     }
// }

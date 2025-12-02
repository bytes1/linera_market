use linera_sdk::views::{linera_views, RegisterView,MapView,RootView, ViewStorageContext};
use linera_sdk::{
    linera_base_types::{AccountOwner,Amount},
};
#[derive(RootView, async_graphql::SimpleObject)]
#[view(context = ViewStorageContext)]
pub struct MyFungibleState {
    pub accounts: MapView<AccountOwner,Amount>,
    // Add fields here.
}

impl MyFungibleState{
    pub async fn initialize_accounts(&mut self,account:AccountOwner,amount:Amount){
        self.accounts.insert(&account,amount).expect("Error inserting")
    }

    pub async fn balance(&self,account:&AccountOwner)->Amount{
        self.accounts.get(account).await.expect("failed to get balance").unwrap_or(Amount::ZERO)

    }

    pub async fn credit(&mut self, account:AccountOwner,amount:Amount){
        let mut balance=self.balance(&account).await;
        balance.saturating_add_assign(amount);
        self.accounts.insert(&account,balance).expect("failed to insert");
    }

    pub async fn debit(&mut self, account: AccountOwner, amount: Amount){
        let mut balance=self.balance(&account).await;
        balance.try_sub_assign(amount).expect("insufficent balance");
        self.accounts.insert(&account,balance).expect("failed to update balance");
    }
}

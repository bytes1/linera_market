// lib/data.ts

export interface Market {
  market_id: number;
  market_title: string;
  category: "Crypto" | "Politics" | "Sports" | "Entertainment";
  outcome_a: string;
  outcome_b: string;
  yesPercentage: number;
  noPercentage: number;
  volume: string;
  participants: number;
  deadline: string;
  marketType: string;
  currency: string;
  market_data: string;
  image: string;
  isFlashMarket?: boolean;
  isClosed?: boolean;
  cardStyle?: "image" | "text"; // <-- NEW: To control card style
}

export const data: Market[] = [
{
    market_id: 0,
    market_title: "Will Linera launch its mainnet before Dec 2026?",
    category: "Crypto",
    outcome_a: "YES",
    outcome_b: "NO",
    yesPercentage: 50,
    noPercentage: 50,
    volume: "0k",
    participants: 0,
    deadline: "Dec 31, 2026",
    marketType: "Binary",
    currency: "LUSD",
    market_data: `Blockchain Prediction: Will Linera launch its mainnet before December 31, 2026?\n\n**Market Dates:**\n\n- **Market Opening:** From the moment of publication.\n- **Market Lock:** December 31, 2026, at 11:59 PM UTC.\n- **Resolution Deadline:** Within 48 hours after the lock period OR once verifiable confirmation of the Linera mainnet launch is available.\n\n**Resolution Rules:**\n\n- The market resolves to **YES** if Linera’s mainnet launch is officially confirmed **on or before December 31, 2026**.\n- The market resolves to **NO** if no such official confirmation is available by the deadline.\n\n**Verification Sources:**\n\nOfficial confirmation must come from one or more of the following:\n- Official Linera website (linera.io)\n- Linera GitHub repository\n- Official announcements from Linera Foundation or verified Linera Core team accounts (Twitter/X, Medium, etc.)\n- Documented on-chain deployment or infrastructure release proving mainnet status\n\n**Market Cancellation Conditions:**\n\nThis market will be canceled if:\n\n- Linera publicly announces the cancellation or indefinite delay of mainnet deployment.\n- No reliable information is available from verifiable official sources within the resolution window.\n- Linera is rebranded, merged, or absorbed into another project such that the resolution criteria can no longer be applied consistently.\n\nIn case of cancellation, all positions will be redeemable at the fair value of the last recorded state of open positions. This may result in either profit or loss based on entry price and market direction.\n\n␟"Linera Mainnet Before Dec 2026"␟"No Mainnet Before Dec 2026"␟Blockchain;;
[https://linera.io;Linera Official]`,
    image: "https://ipfs.io/ipfs/bafkreiaelv5h7h7nvzaf2bku6jbiyd3p7dgqeasjhjhmumax2fo4pq3quu",
    cardStyle: "image",
}

  ,
  {
    market_id: 1,
    market_title: "Gold vs ETH - Which hits $5K first?",
    category: "Crypto",
    outcome_a: "Gold",
    outcome_b: "ETH",
    yesPercentage: 50,
    noPercentage: 50,
    volume: "0",
    participants: 2,
    deadline: "Dec 31, 2025",
    marketType: "Binary",
    currency: "LUSD",
    market_data: `Gold vs ETH - Which hits $5K first?;**Market Details:**\n\n- **Market Close:** This market will only be closed once a resolution is achieved.\n- **Resolution Deadline:** The resolution will be determined as soon as an outcome is reached.\n- **Market Target:** $5,000.00.\n\n**Resolution Criteria:**\n\nThe market resolves based on which asset first **reaches or exceeds the Market Target:**\n\n- **“ETH”** if Ethereum (ETH/USDT) price on Binance hits or exceeds the Market Target.\n- **“GOLD”** if Gold (XAU/USD) price on TradingView hits or exceeds the Market Target.\n\n**Resolution Details:**\n\n- ETH price will be tracked using **Binance’s ETH/USDT spot chart:**\n\n<https://www.binance.com/en/trade/ETH_USDT?type=spot>\n\n- GOLD price will be tracked using **TradingView’s XAU/USD chart (OANDA):**\n\n<https://www.tradingview.com/chart/?symbol=OANDA%3AXAUUSD>\n\n- The **1-minute candle close price** (“C”) will be used to confirm when a target is hit.\n\n***Tie-breaker rules:***\n\n- If both assets reach or exceed $5,000 **within the same 1-minute candle**, the first to hit the mark will be determined using finer candle data (e.g., second or tick data) from their respective platforms.\n- Price spikes or brief wick touches that do not close above $5,000 will **not** count as a hit — only a candle **close** value is valid.\n\n**Cancellation and Invalidity Conditions:**\n\n- Either Binance or TradingView becomes unavailable, unreliable, or experiences major disruptions.\n- Price data for either ETH or GOLD cannot be verified during the market period.\n- Any significant technical issue prevents proper tracking or confirmation of the target hit.\n\n*In case of cancellation, participants may claim their stakes at the current market value of their open positions at the time of cancellation. This could result in a profit or a loss depending on the price of their outstanding shares.*␟"Gold","ETH"␟Crypto,Economy;;https://www.binance.com/en/trade/ETH_USDT?type=spot;Binance / TradingView␟`,
    image:
      "https://ipfs.io/ipfs/QmQfWHShio7K1Ev6BtTEA4CBC55VJRAPmXRkS6wwzhhiSb",
    cardStyle: "image", // <-- NEW: Standard image card
  }, // SBET PRICE: Pump to $22 or Dump to $12?
  // Will Donald Trump visit China in 2025?



];

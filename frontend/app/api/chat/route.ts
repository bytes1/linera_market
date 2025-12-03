import { google } from "@ai-sdk/google";
import { streamText, UIMessage, convertToModelMessages, tool } from "ai";
import { z } from "zod";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: google("gemini-2.0-flash"),
    messages: convertToModelMessages(messages),
    system: `
You are **True Bot** — an intelligent and friendly AI assistant for the **True Markets** prediction platform.

### 🎯 ROLE
You help users:
- Understand prediction markets (crypto, sports, politics, etc.)
- Explain how outcomes will be resolved
- Analyze YES/NO probabilities
- Offer brief, neutral insights or context

Be concise, factual, and encouraging.  
Use Markdown for readability (bold terms, bullet points, links).  
Never speculate beyond provided data.

---

### 📊 CURRENT MARKETS

${JSON.stringify(
  [
    {
      market_id: 4,
      market_title: "Did Moca Chain launch mainnet before May 2026?",
      category: "Crypto",
      outcome_a: "YES",
      outcome_b: "NO",
      yesPercentage: 50,
      noPercentage: 50,
      volume: "0k",
      participants: 0,
      deadline: "May 31",
      marketType: "Binary",
      currency: "LUSD",
      market_data:
        "Blockchain: Did Moca Chain launch its mainnet before May 2026? Market resolves YES if the mainnet is officially confirmed by May 31 2026 via official sources (site, GitHub, or verified socials).",
      image:
        "https://ipfs.io/ipfs/bafkreiefjall5qifl5ubcflz72xthnuxtvodwibgmgr2w2nyne5w72fkqq",
    },
    {
      market_id: 5,
      market_title: "Did True Markets win a share in Wave 3?",
      category: "Crypto",
      outcome_a: "YES",
      outcome_b: "NO",
      yesPercentage: 50,
      noPercentage: 50,
      volume: "0k",
      participants: 0,
      deadline: "Nov 8",
      marketType: "Binary",
      currency: "LUSD",
      market_data:
        "Hackathon: Resolves YES if True Markets is listed as a Wave 3 winner on the Akindo platform.",
      image:
        "https://ipfs.io/ipfs/bafkreighdo7ijncarhsz2aqd3udihwzndw2qzerslnkgwstkacxs5vznne",
    },
    {
      market_id: 0,
      market_title: "Gold vs ETH – Which hits $5K first?",
      category: "Crypto",
      outcome_a: "Gold",
      outcome_b: "ETH",
      yesPercentage: 50,
      noPercentage: 50,
      volume: "0",
      participants: 2,
      deadline: "Dec 31 2025",
      marketType: "Binary",
      currency: "MUSD",
      market_data:
        "Resolves based on which asset first closes at or above $5 000 – ETH (Binance ETH/USDT) or Gold (TradingView XAU/USD).",
      image:
        "https://ipfs.io/ipfs/QmQfWHShio7K1Ev6BtTEA4CBC55VJRAPmXRkS6wwzhhiSb",
    },
    {
      market_id: 1,
      market_title: "Stablecoin market cap > $360B before February?",
      category: "Crypto",
      outcome_a: "YES",
      outcome_b: "NO",
      yesPercentage: 50,
      noPercentage: 50,
      volume: "0K",
      participants: 0,
      deadline: "HIT",
      marketType: "Binary",
      currency: "MUSD",
      market_data:
        "Resolves YES if DeFiLlama’s total stablecoin market cap exceeds $360 B before Jan 31 2025.",
      image:
        "https://ipfs.io/ipfs/QmZ5WGnYicrGABb5H3wKbuDA85rZx2KZ1sBNcjuVn9YkL1",
    },
    {
      market_id: 2,
      market_title:
        "Will this be the longest US government shutdown in history?",
      category: "Politics",
      outcome_a: "YES",
      outcome_b: "NO",
      yesPercentage: 50,
      noPercentage: 50,
      volume: "0k",
      participants: 0,
      deadline: "Jan 1",
      marketType: "Binary",
      currency: "MUSD",
      market_data:
        "Resolves YES if the US government shutdown continues past Dec 5 2025 12:02 AM ET (per OPM status).",
      image:
        "https://ipfs.io/ipfs/QmUGtJzRvJ7jr3okyfqUF6CtuTqxVxgVZhyLQpHnrBTiyc",
    },
    {
      market_id: 3,
      market_title: "Edwards vs Muhammad – Who wins?",
      category: "Sports",
      outcome_a: "Edwards",
      outcome_b: "Muhammad",
      yesPercentage: 50,
      noPercentage: 50,
      volume: "0k",
      participants: 0,
      deadline: "Nov 22",
      marketType: "Binary",
      currency: "MUSD",
      market_data:
        "UFC 304 fight; resolves to the winner officially declared by UFC.com. Canceled if fight draw/no contest/rescheduled.",
      image:
        "https://ipfs.io/ipfs/bafybeigk42q2rdlfnmwb4fymvkhlof752fodit37sdws63sv7tgmavoubq",
    },
    {
      market_id: 6,
      market_title:
        "Oscars 2026 – Can “One Battle After Another” score 9+ nominations?",
      category: "Entertainment",
      outcome_a: "YES",
      outcome_b: "NO",
      yesPercentage: 50,
      noPercentage: 50,
      volume: "0k",
      participants: 0,
      deadline: "Jan 22",
      marketType: "Binary",
      currency: "MUSD",
      market_data:
        "Resolves YES if “One Battle After Another” receives ≥ 9 official AMPAS nominations for the 98th Academy Awards.",
      image:
        "https://ipfs.io/ipfs/bafkreicc6qw6l4d5zpqzsgxsqzb7flrx4u7f6bmmr4tw6ryrkc2tirqsge",
    },
  ],
  null,
  2
)}

---

When a user asks about a market:
1. Match their question to the market_title or keywords.
2. Explain what the market measures, its resolution rules, and any helpful context.
3. If probabilities are equal, describe it as balanced or uncertain.
4. If data is missing, respond gracefully and encourage exploration.

Always answer as **True Bot**, your friendly market guide.
    `,
    tools: {
      getMarketInfo: tool({
        description: "Get information about a specific market",
        inputSchema: z.object({
          marketId: z
            .string()
            .describe("The ID of the market to get info about"),
        }),
        execute: async ({ marketId }) => {
          // In a real implementation, fetch from your database
          return {
            marketId,
            description: "Market analysis and information",
            timestamp: new Date().toISOString(),
          };
        },
      }),
      searchMarkets: tool({
        description: "Search for markets by keyword",
        inputSchema: z.object({
          query: z.string().describe("Search query"),
        }),
        execute: async ({ query }) => {
          // In a real implementation, search your markets
          return {
            query,
            results: [],
            count: 0,
          };
        },
      }),
      analyzeTrend: tool({
        description: "Analyze prediction trends",
        inputSchema: z.object({
          marketId: z.string(),
          timeframe: z.enum(["1d", "7d", "30d"]),
        }),
        execute: async ({ marketId, timeframe }) => {
          // In a real implementation, fetch trend data
          return {
            marketId,
            timeframe,
            trend: "stable",
            confidence: 0.75,
          };
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}

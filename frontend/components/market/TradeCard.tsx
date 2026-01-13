"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import type { Market } from "@/lib/data";
import { TimelineCard } from "./TimelineCard";
import { Loader2, Wallet, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// --- LINERA IMPORTS ---
import { useLinera } from "@/lib/contexts/LineraContext";

// --- APP CONFIGURATION ---
const MARKET_APP_ID = "24d72c5934ae215760d7c8ae2fc8e74e3513e7316b0725d63f2427657d589d3d";
const TOKEN_APP_ID = "ef212919b5e422081a41442135ef58dec723426edd4f177b146c81b7891c3c65";

interface ShareData {
  marketId: number;
  amount: string; 
  outcomeId: number;
}

// --- HELPER FUNCTIONS FOR DECIMALS (18 Decimals) ---
const formatFromChain = (value: string | number): number => {
  const val = Number(value);
  if (isNaN(val)) return 0;
  return val / 10 ** 18;
};

// Not currently used but good to keep for future atomic unit conversions
const formatToChain = (value: string): string => {
  if (!value) return "0";
  return (parseFloat(value) * 10 ** 18).toLocaleString('fullwide', { useGrouping: false });
};

export const TradeCard = ({ market }: { market: Market }) => {
  const [isClient, setIsClient] = useState(false);
  
  // --- LINERA STATE ---
  const { client, isConnected, owner, connect, isReady } = useLinera();
  const [balance, setBalance] = useState<string>("0"); // Stores human-readable balance
  const [userShares, setUserShares] = useState<ShareData[]>([]);
  
  // Transaction States
  const [isBuying, setIsBuying] = useState(false);
  const [isSelling, setIsSelling] = useState(false); // NEW: Sell state
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Contract Refs
  const marketContract = useRef<any>(null);
  const tokenContract = useRef<any>(null);

  // UI State
  const [tradeMode, setTradeMode] = useState("buy");
  const [outcome, setOutcome] = useState("yes");
  const [amountStr, setAmountStr] = useState("");

  // Hydration fix
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 1. Initialize Contracts & Fetch Data
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      if (!client) {
        marketContract.current = null;
        tokenContract.current = null;
        return;
      }
      
      if (!isConnected || !owner) return;
      
      setIsLoadingData(true);

      try {
        if (!marketContract.current) {
          marketContract.current = await client.application(MARKET_APP_ID);
        }
        if (!tokenContract.current) {
          tokenContract.current = await client.application(TOKEN_APP_ID);
        }

        if (cancelled) return;

        await Promise.all([fetchBalance(), fetchShares()]);
      } catch (err) {
        console.error("Failed to load Linera contracts:", err);
      } finally {
        if (!cancelled) setIsLoadingData(false);
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [client, isConnected, owner, market.market_id]);

  // 2. Fetch Balance Helper
  const fetchBalance = async () => {
    if (!tokenContract.current || !owner) return;
    try {
      const query = `{ balance(owner: "${owner}") }`;
      const response = await tokenContract.current.query(`{ "query": ${JSON.stringify(query)} }`);
      const parsed = typeof response === "string" ? JSON.parse(response) : response;
      setBalance(parsed?.data?.balance ?? "0");
    } catch (err) {
      console.error("Fetch balance error:", err);
      setBalance("0");
    }
  };

  // 3. Fetch Shares Helper
  const fetchShares = async () => {
    if (!marketContract.current) return;
    try {
      const query = `{ myShares(marketId: ${market.market_id}) { marketId, amount, outcomeId } }`;
      const response = await marketContract.current.query(`{ "query": ${JSON.stringify(query)} }`);
      
      const parsed = typeof response === "string" ? JSON.parse(response) : response;
      const rawShares = parsed?.data?.myShares ?? [];

      const formattedShares = rawShares.map((share: any) => ({
        ...share,
        amount: formatFromChain(share.amount).toString()
      }));
  
      setUserShares(formattedShares);
    } catch (err) {
      console.error("Fetch shares error:", err);
    }
  };

  // 4. Handle Buy Mutation
  const handleBuy = async () => {
    if (!marketContract.current || !amountStr) return;
    setIsBuying(true);

    const outcomeId = outcome === "yes" ? 0 : 1;

    const mutation = `
      mutation {
        buy(
          marketId: ${market.market_id}
          outcomeId: ${outcomeId}
          minOutcomeSharesToBuy: "0"
          value: "${amountStr}"
          token: "${TOKEN_APP_ID}"
        )
      }
    `;

    try {
      await marketContract.current.query(`{ "query": ${JSON.stringify(mutation)} }`);
      await Promise.all([fetchBalance(), fetchShares()]);
      setAmountStr(""); 
      alert("Buy Successful!");
    } catch (err: any) {
      console.error("Buy failed:", err);
      handleTxError(err);
    } finally {
      setIsBuying(false);
    }
  };

  // 5. Handle Sell Mutation (NEW)
  const handleSell = async () => {
    if (!marketContract.current || !amountStr) return;
    setIsSelling(true);

    const outcomeId = outcome === "yes" ? 0 : 1;
    
    // Explicitly format the market owner as an Application Owner string
    const marketOwnerString = `Application:${MARKET_APP_ID}`;

    const mutation = `
      mutation {
        sell(
          marketId: ${market.market_id}
          outcomeId: ${outcomeId}
          shares: "${amountStr}"
          token: "ef212919b5e422081a41442135ef58dec723426edd4f177b146c81b7891c3c65"
        )
      }
    `;

    try {
      await marketContract.current.query(`{ "query": ${JSON.stringify(mutation)} }`);
      await Promise.all([fetchBalance(), fetchShares()]);
      setAmountStr(""); 
      alert("Sell Successful!");
    } catch (err: any) {
      console.error("Sell failed:", err);
      handleTxError(err);
    } finally {
      setIsSelling(false);
    }
  };

  const handleTxError = (err: any) => {
    if (err.toString().includes("Unsupported dynamic application load")) {
      alert(
        "Error: Token Contract not ready.\n\nPlease go to the Faucet page and 'Mint' tokens first to initialize the Token application on your chain."
      );
    } else {
      alert("Transaction failed. Check console for details.");
    }
  };

  // --- DERIVED STATE ---
  
  const { yesOwned, noOwned } = useMemo(() => {
    let y = 0;
    let n = 0;
    userShares.forEach((s) => {
      if (s.outcomeId === 0) y += parseFloat(s.amount);
      if (s.outcomeId === 1) n += parseFloat(s.amount);
    });
    return { yesOwned: y.toFixed(2), noOwned: n.toFixed(2) };
  }, [userShares]);

  const selectedSharesOwned = outcome === "yes" ? yesOwned : noOwned;

  // Logic checks
  const currentAmount = parseFloat(amountStr) || 0;
  const insufficientBalance = parseFloat(balance) < currentAmount;
  const insufficientShares = parseFloat(selectedSharesOwned) < currentAmount;

  // --- RENDER ACTION BUTTON ---
  const renderActionButton = () => {
    if (!isClient) {
      return (
        <Button size="lg" className="w-full h-12 text-base" disabled>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        </Button>
      );
    }

    if (!isReady) {
       return (
        <Button size="lg" className="w-full h-12 text-base" disabled>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Initializing Linera...
        </Button>
      );
    }

    if (!isConnected) {
      return (
        <Button size="lg" className="w-full h-12 text-base" onClick={() => connect()}>
          <Wallet className="mr-2 h-4 w-4" />
          Connect Linera Wallet
        </Button>
      );
    }

    if (isBuying || isSelling) {
      return (
        <Button size="lg" className="w-full h-12 text-base" disabled>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </Button>
      );
    }

    if (currentAmount <= 0) {
      return (
        <Button size="lg" className="w-full h-12 text-base" disabled>
          Enter Amount
        </Button>
      );
    }

    // --- SELL BUTTON LOGIC ---
    if (tradeMode === "sell") {
      if (insufficientShares) {
        return (
          <Button size="lg" className="w-full h-12 text-base" variant="destructive" disabled>
            Insufficient Shares
          </Button>
        );
      }
      return (
        <Button
          size="lg"
          className="w-full h-12 text-base bg-red-500 hover:bg-red-600"
          onClick={handleSell}
        >
          Sell {outcome === "yes" ? market.outcome_a : market.outcome_b} Shares
        </Button>
      );
    }

    // --- BUY BUTTON LOGIC ---
    if (insufficientBalance) {
      return (
        <Button size="lg" className="w-full h-12 text-base" variant="destructive" disabled>
          Insufficient Balance
        </Button>
      );
    }

    return (
      <Button
        size="lg"
        className="w-full h-12 text-base"
        onClick={handleBuy}
        style={{
          backgroundColor: outcome === "yes" ? "rgb(6 182 212)" : "rgb(219 39 119)",
        }}
      >
        Buy {outcome === "yes" ? market.outcome_a : market.outcome_b}
      </Button>
    );
  };

  return (
    <Card className="sticky top-8">
      <Tabs value={tradeMode} onValueChange={setTradeMode}>
        <CardHeader className="p-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy">Buy</TabsTrigger>
            <TabsTrigger value="sell">Sell</TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 px-4 pb-4">
          
          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {market.yesPercentage}%
              </span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {market.noPercentage}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-gradient-to-r from-green-400 via-purple-500 to-pink-500" />
          </div>

          {/* Outcome Toggles */}
          <ToggleGroup
            type="single"
            value={outcome}
            onValueChange={(val) => { if (val) setOutcome(val); }}
            className="grid grid-cols-2 gap-2"
          >
            <ToggleGroupItem
              value="yes"
              className="h-12 flex justify-between data-[state=on]:bg-cyan-100 data-[state=on]:text-cyan-900 border border-slate-200 dark:border-slate-700 data-[state=on]:border-cyan-300 dark:data-[state=on]:border-cyan-700"
            >
              <span>{market.outcome_a}</span>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="no"
              className="h-12 flex justify-between data-[state=on]:bg-pink-100 data-[state=on]:text-pink-900 border border-slate-200 dark:border-slate-700 data-[state=on]:border-pink-300 dark:data-[state=on]:border-pink-700"
            >
              <span>{market.outcome_b}</span>
            </ToggleGroupItem>
          </ToggleGroup>

          {/* Amount Input */}
          <div className="relative">
            <label htmlFor="amount" className="text-sm font-medium">
              {tradeMode === 'sell' ? 'Shares to Sell' : 'Amount'}
            </label>
            <Input
              id="amount"
              type="number"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              placeholder="0.00"
              className="h-12 text-base pr-20"
              min="0"
            />
            
            {/* Contextual Right Element */}
            <div className="absolute right-3 top-[2.1rem] flex items-center gap-2">
               {tradeMode === 'sell' && (
                  <button 
                    onClick={() => setAmountStr(selectedSharesOwned)}
                    className="text-xs font-semibold text-cyan-600 hover:text-cyan-800 uppercase"
                  >
                    Max
                  </button>
               )}
               <span className="text-sm font-medium text-slate-500">
                  {tradeMode === 'sell' ? 'Shares' : 'Tokens'}
               </span>
            </div>

            {/* Balance / Shares Display Top Right */}
            {isClient && isConnected && (
              <div className="absolute right-0 top-0 text-xs text-slate-500">
                {tradeMode === 'buy' ? (
                   <span>Balance: {isLoadingData ? "..." : parseFloat(balance).toFixed(2)}</span>
                ) : (
                   <span>Available: {isLoadingData ? "..." : selectedSharesOwned}</span>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Stats Summary */}
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">
                Your Shares ({outcome === "yes" ? "Yes" : "No"})
              </span>
              <span className="font-medium text-slate-900 dark:text-slate-50">
                {isConnected ? (isLoadingData ? "..." : selectedSharesOwned) : "-"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                Fee
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Standard network fee applies.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </span>
              <span className="font-medium text-slate-900 dark:text-slate-50">
                ~0%
              </span>
            </div>
          </div>

          {/* ACTION BUTTON */}
          {renderActionButton()}

        </CardContent>
      </Tabs>

      <Separator />

      <CardFooter className="p-4">
        <TimelineCard market={market} />
      </CardFooter>
    </Card>
  );
};
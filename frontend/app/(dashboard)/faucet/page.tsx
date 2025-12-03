"use client";

import { useState, useEffect, useRef } from "react";
import { useLinera } from "@/lib/contexts/LineraContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Coins, Wallet } from "lucide-react";
import { Input } from "@/components/ui/input";

const TOKEN_APP_ID = "be1a7aa71f6dd4018a2ec800ebb14ac5b7b927f25d969e6667d26624691de823";

export default function FaucetPage() {
  const { client, isConnected, owner, connect, isReady } = useLinera();
  
  const [balance, setBalance] = useState<string>("0");
  const [isMinting, setIsMinting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const tokenContract = useRef<any>(null);

  // 1. Initialize Contract & Fetch Balance
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      if (!client || !isConnected || !owner) return;
      setIsLoadingData(true);

      try {
        if (!tokenContract.current) {
          tokenContract.current = await client.application(TOKEN_APP_ID);
        }
        
        if (cancelled) return;
        await fetchBalance();
      } catch (err) {
        console.error("Failed to load Token contract:", err);
      } finally {
        if (!cancelled) setIsLoadingData(false);
      }
    };

    init();

    return () => { cancelled = true; };
  }, [client, isConnected, owner]);

  // 2. Helper: Fetch Balance
  const fetchBalance = async () => {
    if (!tokenContract.current || !owner) return;
    try {
      const query = `{ balance(owner: "${owner}") }`;
      const response = await tokenContract.current.query(`{ "query": ${JSON.stringify(query)} }`);
      const parsed = typeof response === "string" ? JSON.parse(response) : response;
      setBalance(parsed?.data?.balance ?? "0");
    } catch (err) {
      console.error("Fetch balance error:", err);
    }
  };

  // 3. Handle Mint Mutation
  const handleMint = async () => {
    if (!tokenContract.current || !owner) return;
    setIsMinting(true);
    setStatus(null);

    // Mutation provided by user
    const mutation = `
      mutation {
        mint(
          owner: "${owner}"
          amount: "100"
        )
      }
    `;

    try {
      await tokenContract.current.query(`{ "query": ${JSON.stringify(mutation)} }`);
      setStatus("Success! +100 Tokens minted.");
      await fetchBalance();
    } catch (err: any) {
      console.error("Mint failed:", err);
      setStatus("Minting failed. See console.");
    } finally {
      setIsMinting(false);
    }
  };

  // --- RENDER HELPERS ---
  
  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="container max-w-md py-20">
        <Card className="text-center">
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
            <CardDescription>
              You need to connect your Linera wallet to access the faucet.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
             <Button onClick={() => connect()} size="lg">
                <Wallet className="mr-2 h-4 w-4" />
                Connect Linera
             </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-xl py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Token Faucet</h1>
        <p className="text-muted-foreground">
          Mint free test tokens to trade on the Prediction Market.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-yellow-500" />
              Test Token
            </CardTitle>
            <div className="text-sm font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
               {TOKEN_APP_ID.slice(0, 8)}...{TOKEN_APP_ID.slice(-6)}
            </div>
          </div>
          <CardDescription>
            Get 100 tokens per click.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Balance Display */}
          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg border border-dashed text-center">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
              Your Balance
            </h3>
            <div className="text-4xl font-black text-slate-800 dark:text-slate-100">
              {isLoadingData ? (
                <Loader2 className="h-8 w-8 animate-spin mx-auto opacity-20" />
              ) : (
                balance
              )}
            </div>
          </div>

          {/* Status Message */}
          {status && (
            <div className={`text-sm text-center p-2 rounded ${status.includes("failed") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
              {status}
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button 
            className="w-full h-12 text-lg" 
            onClick={handleMint} 
            disabled={isMinting || isLoadingData}
          >
            {isMinting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Minting...
              </>
            ) : (
              "Mint 100 Tokens"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
"use client";

import { useState, useEffect, useRef } from "react";
import { useLinera } from "@/lib/contexts/LineraContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, RefreshCw } from "lucide-react";

const APP_ID = process.env.NEXT_PUBLIC_LINERA_APPLICATION_ID ?? "b8f961b7887a618ac648e257113edb3edf60ce4ec1e710b08913dac2e574f3ed";

export default function LineraTestCounter() {
  const { client, isConnected, owner } = useLinera();
  
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<{ height: number; hash: string }[]>([]);

  const counterRef = useRef<any>(null);

  // 1. Initialize Contract & Fetch Data
  useEffect(() => {
    let cancelled = false;

    const initContract = async () => {
      if (!client || !isConnected) return;

      try {
        // Load the application interface
        const counter = await client.frontend().application(APP_ID);
        counterRef.current = counter;

        if (cancelled) return;
        
        // Initial Fetch
        await fetchCount();

        // Subscribe to notifications
        client.onNotification((n: any) => {
          if (cancelled) return;
          console.log("Notification:", n);
          
          if (n?.reason?.NewBlock) {
            const block = n.reason.NewBlock;
            setLogs((prev) => [{ height: block.height, hash: block.hash }, ...prev]);
            fetchCount(); // Auto-refresh count
          }
        });

      } catch (err: any) {
        console.error(err);
        if (!cancelled) setError("Failed to load application");
      }
    };

    initContract();

    return () => {
      cancelled = true;
    };
  }, [client, isConnected]);

  // 2. Fetch Helper
  const fetchCount = async () => {
    if (!counterRef.current) return;
    try {
      const response = await counterRef.current.query('{ "query": "query { value }" }');
      // Handle potential string response from older SDK versions
      const parsed = typeof response === "string" ? JSON.parse(response) : response;
      setCount(parsed.data.value);
    } catch (err) {
      console.error("Query Error:", err);
    }
  };

  // 3. Increment Mutation
  const handleIncrement = async () => {
    if (!counterRef.current) return;
    setLoading(true);
    setError(null);

    try {
      await counterRef.current.query('{ "query": "mutation { increment(value: 1) }" }');
      // Note: We don't need to manually fetchCount() here because the 
      // onNotification listener will trigger it when the block is committed.
    } catch (err: any) {
      console.error("Mutation Error:", err);
      setError(err?.message ?? "Failed to increment");
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          Please connect your Linera wallet to test the counter.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Counter Application</span>
            <span className="text-sm font-normal text-muted-foreground font-mono">
               {APP_ID.slice(0, 8)}...
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Count Display */}
          <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed">
            <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-2">Current Value</h3>
            <div className="text-6xl font-black text-primary">
              {count !== null ? count : <Loader2 className="h-10 w-10 animate-spin mx-auto opacity-20" />}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex flex-col gap-2">
            <Button 
              size="lg" 
              onClick={handleIncrement} 
              disabled={loading || count === null}
              className="w-full text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing Block...
                </>
              ) : (
                <>
                  Increment Counter (+1)
                </>
              )}
            </Button>
            {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</p>}
          </div>

        </CardContent>
      </Card>

      {/* Logs Display */}
      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Block History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
              {logs.map((log, i) => (
                <div key={i} className="flex justify-between text-xs font-mono bg-muted p-2 rounded">
                  <span className="text-blue-600 font-bold">Block {log.height}</span>
                  <span className="text-muted-foreground truncate ml-4">{log.hash}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Copy,
  Star,
  CircleDollarSign,
  Trophy,
  Search,
  Loader2,
  Wallet,
} from "lucide-react";

// --- LINERA IMPORTS ---
import { useLinera } from "@/lib/contexts/LineraContext";

// Use the same Token App ID from your Faucet/TradeCard
const TOKEN_APP_ID = "be1a7aa71f6dd4018a2ec800ebb14ac5b7b927f25d969e6667d26624691de823";

// Helper to truncate address
const truncateAddress = (address: string) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Sub-component for stat cards
function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  isLoading = false,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  isLoading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-8 w-16 animate-pulse rounded-md bg-muted" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

// Sub-component when wallet is not connected
function ConnectWalletPrompt({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center p-4 md:p-8">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Profile Page</CardTitle>
          <CardDescription>
            Please connect your Linera wallet to view your profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onConnect} size="lg" className="w-full">
             <Wallet className="mr-2 h-4 w-4" />
             Connect Wallet
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProfilePage() {
  const [isClient, setIsClient] = useState(false);
  
  // --- LINERA HOOKS ---
  const { isConnected, owner, client, connect, isReady } = useLinera();
  const [balance, setBalance] = useState<string>("0");
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  
  const tokenContract = useRef<any>(null);

  // Hydration Fix
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch Balance Logic
  useEffect(() => {
    let cancelled = false;

    const fetchBalance = async () => {
      if (!client || !isConnected || !owner) return;
      setIsBalanceLoading(true);
      try {
        // Load contract if needed
        if (!tokenContract.current) {
          tokenContract.current = await client.frontend().application(TOKEN_APP_ID);
        }
        
        // Query balance
        const query = `{ balance(owner: "${owner}") }`;
        const response = await tokenContract.current.query(`{ "query": ${JSON.stringify(query)} }`);
        const parsed = typeof response === "string" ? JSON.parse(response) : response;
        
        if (!cancelled) {
          setBalance(parsed?.data?.balance ?? "0");
        }
      } catch (err) {
        console.error("Failed to fetch balance:", err);
      } finally {
        if (!cancelled) setIsBalanceLoading(false);
      }
    };

    if (isReady && isConnected) {
      fetchBalance();
    }

    return () => { cancelled = true; };
  }, [client, isConnected, owner, isReady]);

  // --- RENDER LOGIC ---

  if (!isClient || !isReady) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center p-4 md:p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isConnected) {
    return <ConnectWalletPrompt onConnect={() => connect()} />;
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* === TOP HEADER SECTION === */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 space-y-4 md:space-y-0">
          {/* User Info */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="" alt="User" />
              <AvatarFallback className="text-xl font-semibold bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                {owner?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                User Profile
              </h1>
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-muted-foreground font-mono truncate max-w-[200px] md:max-w-none">
                  {owner}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => navigator.clipboard.writeText(owner!)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 w-full md:w-auto">
            <StatCard
              title="Points"
              subtitle="Reward Pts"
              value="0"
              icon={Star}
            />
            <StatCard
              title="Tokens"
              subtitle="Linera Test Tokens"
              value={balance}
              icon={CircleDollarSign}
              isLoading={isBalanceLoading}
            />
            <StatCard
              title="Rank"
              subtitle="Global Rank"
              value="#"
              icon={Trophy}
            />
          </div>
        </header>

        {/* === MAIN CONTENT TABS === */}
        <Card>
          <CardContent className="p-4 md:p-6">
            <Tabs defaultValue="portfolio" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="portfolio">
                {/* Filters */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
                  <div className="relative w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search positions..."
                      className="pl-10 w-full md:w-80"
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Market</TableHead>
                        <TableHead>Outcome</TableHead>
                        <TableHead>Shares</TableHead>
                        <TableHead>Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={4} className="h-48 text-center text-muted-foreground">
                          No active positions found. (Fetch logic pending)
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="history">
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                  Transaction history coming soon.
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
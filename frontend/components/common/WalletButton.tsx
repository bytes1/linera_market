"use client";

import { useState, useEffect } from "react";
import { LogOut, User, Wallet, Loader2 } from "lucide-react"; // Ensure Loader2 is imported
import Link from "next/link";
import { useLinera } from "@/lib/contexts/LineraContext"; 
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const truncateAddress = (address: string) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export function WalletButton() {
  const [isClient, setIsClient] = useState(false);
  // Local state to track the "Click -> Connect" process
  const [isConnecting, setIsConnecting] = useState(false);
  
  const { connect, disconnect, isConnected, owner, chainId, isReady, error } = useLinera();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Wrapper to handle the async connection animation
  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connect();
    } finally {
      // Whether it succeeds or fails, stop the spinner.
      // If success, the component re-renders into the "Connected" view anyway.
      setIsConnecting(false);
    }
  };

  // 1. Server/Hydration Guard
  if (!isClient) {
    return (
      <Button disabled>
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  // 2. WASM Loading State (Before Linera is ready)
  if (!isReady) {
    return (
      <Button disabled variant="secondary">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Initializing Core...
      </Button>
    );
  }

  // 3. Connected State
  if (isConnected && owner) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="rounded-full border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" alt="@user" />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-medium">
                {owner.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="end">
          <DropdownMenuLabel>Linera Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-default">
              <span className="text-xs text-muted-foreground">Owner Address</span>
              <span className="font-mono text-xs w-full truncate bg-muted p-1 rounded">
                {truncateAddress(owner)}
              </span>
            </DropdownMenuItem>
            
            <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-default">
              <span className="text-xs text-muted-foreground">Chain ID</span>
              <span className="font-mono text-xs w-full truncate bg-muted p-1 rounded">
                {chainId ? truncateAddress(chainId) : "Fetching..."}
              </span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link href="/profile" className="flex items-center cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={disconnect} className="text-red-600 focus:text-red-600 cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // 4. Disconnected / Connecting State
  return (
    <div className="flex flex-col items-end gap-2">
      {error && (
        <span className="text-xs text-red-500 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded">
          {error}
        </span>
      )}
      
      <Button 
        onClick={handleConnect} 
        disabled={isConnecting} // Disable button while connecting
      >
        {isConnecting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="mr-2 h-4 w-4" />
            Connect Linera
          </>
        )}
      </Button>
    </div>
  );
}
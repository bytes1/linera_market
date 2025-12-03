"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { MetaMask } from "@linera/signer";

// Helper to bypass Webpack for the browser client
const dynamicImport = (path: string) =>
  (new Function("p", "return import(p);"))(path) as Promise<any>;

interface LineraContextType {
  isReady: boolean;      
  isConnected: boolean;  
  owner: string | null;  
  chainId: string | null;
  error: string | null;
  client: any | null;    
  connect: () => Promise<void>;
  disconnect: () => void;
}

const LineraContext = createContext<LineraContextType | undefined>(undefined);

export function LineraProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [owner, setOwner] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clientRef = useRef<any>(null);
  const lineraModule = useRef<any>(null);

  // 1. Initialize WASM logic on mount
  useEffect(() => {
    const initWasm = async () => {
      try {
        const linera = await dynamicImport("/js/@linera/client/linera.js");
        await linera.default(); 
        lineraModule.current = linera;
        setIsReady(true);
        console.log("Linera WASM initialized");
      } catch (err: any) {
        console.error("Failed to load Linera WASM:", err);
        setError("Failed to load Linera Core");
      }
    };
    initWasm();
  }, []);

  // 2. Auto-Connect Effect
  useEffect(() => {
    // Only attempt auto-connect if WASM is ready AND we have a stored session
    if (isReady && localStorage.getItem("linera_auto_connect") === "true") {
      connect(true); // pass true to indicate "silent" mode (optional logic)
    }
  }, [isReady]);

  // 3. Connect Logic
  const connect = async (isAuto = false) => {
    if (!lineraModule.current) return;
    setError(null);

    try {
      const linera = lineraModule.current;
      const faucetUrl = process.env.NEXT_PUBLIC_LINERA_FAUCET_URL ?? "https://faucet.testnet-conway.linera.net";

      // Initialize Faucet
      const faucet = await new linera.Faucet(faucetUrl);
      
      // Connect to MetaMask
      const signer = new MetaMask();
      
      // This will prompt if not already connected, or resolve instantly if trusted
      const addr = await signer.address(); 
      setOwner(addr);

      // Create Wallet & Claim Chain
      // Note: This operation can take a moment.
      const wallet = await faucet.createWallet();
      const chain = await faucet.claimChain(wallet, addr);
      setChainId(chain);

      // Create Client
      const client = await new linera.Client(wallet, signer,false);
      clientRef.current = client;

      // SUCCESS: Set State & Persist
      setIsConnected(true);
      localStorage.setItem("linera_auto_connect", "true");

    } catch (err: any) {
      console.error(err);
      // If auto-connect fails (e.g. user locked metamask), clear the storage
      if (isAuto) {
         localStorage.removeItem("linera_auto_connect");
      }
      setError(err?.message ?? "Failed to connect wallet");
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setOwner(null);
    setChainId(null);
    clientRef.current = null;
    // Remove persistence flag
    localStorage.removeItem("linera_auto_connect");
  };

  return (
    <LineraContext.Provider
      value={{
        isReady,
        isConnected,
        owner,
        chainId,
        error,
        client: clientRef.current,
        connect,
        disconnect,
      }}
    >
      {children}
    </LineraContext.Provider>
  );
}

export const useLinera = () => {
  const context = useContext(LineraContext);
  if (!context) {
    throw new Error("useLinera must be used within a LineraProvider");
  }
  return context;
};
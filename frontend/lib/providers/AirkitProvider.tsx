"use client";

import { AirService } from "@mocanetwork/airkit";
import { memo, useEffect, useMemo, useState } from "react";
import { AirkitContext } from "../contexts/AirkitContext";
import { env } from "../env";
import { useAccount } from "wagmi";

// Default options for Airkit initialization
export const defaultAirkitOptions: Parameters<
  typeof AirService.prototype.init
>[0] = {
  buildEnv: env.NEXT_PUBLIC_BUILD_ENV,
  enableLogging: true,
  skipRehydration: false,
};

export const AirkitProvider = memo(
  ({ children }: { children: React.ReactNode }) => {
    // 1. Get the connection status from Wagmi, not just isConnected
    const { status } = useAccount();

    // Create the service instance
    const airService = useMemo(() => {
      return new AirService({
        partnerId: env.NEXT_PUBLIC_PARTNER_ID,
      });
    }, []);

    const [isInitialized, setIsInitialized] = useState(false);

    // 2. This effect now depends on the wallet's connection status
    useEffect(() => {
      const init = async () => {
        try {
          console.log("Airkit: Wallet connected, initializing service...");
          await airService.init(defaultAirkitOptions);
          setIsInitialized(true);
        } catch (error) {
          console.error("Error initializing Airkit", error);
        }
      };

      const cleanup = () => {
        console.log("Airkit: Wallet disconnected, cleaning up service...");
        airService.cleanUp();
        setIsInitialized(false);
      };

      // 3. Use the 'status' property for more robust logic
      if (status === "connected" && !airService.isInitialized) {
        // Wallet is fully connected, and service is not initialized -> run init.
        init();
      } else if (status === "disconnected" && airService.isInitialized) {
        // Wallet is disconnected, and service is initialized -> run cleanup.
        cleanup();
      }

      // By using 'status', we implicitly do nothing during
      // 'connecting' or 'reconnecting' states, which is correct.
    }, [status, airService]); // 4. Depend on 'status' instead of 'isConnected'

    // Clean up on unmount
    useEffect(() => {
      return () => {
        void airService.cleanUp();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <AirkitContext.Provider value={{ airService, isInitialized }}>
        {children}
      </AirkitContext.Provider>
    );
  }
);

AirkitProvider.displayName = "AirkitProvider";

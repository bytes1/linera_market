import { AirService } from "@mocanetwork/airkit";
import { createContext } from "react";

export interface AirkitContextState {
  airService: AirService;
  isInitialized: boolean;
}

export const AirkitContext = createContext<AirkitContextState | null>(null);

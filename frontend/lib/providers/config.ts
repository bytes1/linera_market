import { http, createConfig } from "wagmi";
import { mocaTestnet } from "../chains"; // Import your custom chain
import { airConnector } from "@mocanetwork/airkit-connector";

const connectors = [
  airConnector({
    buildEnv: "sandbox",
    enableLogging: true,
    partnerId: "8a222988-f7f8-42d3-9b39-543d93d6fb16",
  }),
];

export const config = createConfig({
  chains: [mocaTestnet], // Only mocaTestnet
  transports: {
    [mocaTestnet.id]: http(), // Only transport for mocaTestnet
  },
  connectors,
});

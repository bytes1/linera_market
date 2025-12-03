// lib/abi/VerificationABI.ts
export const verificationABI = [
  {
    inputs: [
      { internalType: "address", name: "sender", type: "address" },
      { internalType: "uint64", name: "requestId", type: "uint64" },
    ],
    name: "isProofVerified",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

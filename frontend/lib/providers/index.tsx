"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { LineraProvider } from "@/lib/contexts/LineraContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

export const Providers: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <LineraProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </LineraProvider>
  );
};
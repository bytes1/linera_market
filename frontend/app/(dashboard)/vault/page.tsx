"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wallet, Construction } from "lucide-react";
import { useLinera } from "@/lib/contexts/LineraContext";
import { Button } from "@/components/ui/button";

export default function VaultPage() {
  const { isConnected, connect } = useLinera();

  return (
    <div className="container py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Liquidity Vaults</h1>
        <p className="text-muted-foreground">
          Earn yield by providing liquidity to prediction markets.
        </p>
      </div>

      <Card className="max-w-md mx-auto text-center">
        <CardHeader>
          <div className="mx-auto bg-muted p-3 rounded-full w-fit mb-4">
            <Construction className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle>Vaults are coming to Linera</CardTitle>
          <CardDescription>
            We are currently migrating our Vault contracts to the Linera microchain.
            Check back soon for high-yield opportunities!
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isConnected && (
            <Button onClick={() => connect()} className="mt-4" variant="outline">
              <Wallet className="mr-2 h-4 w-4" />
              Connect Linera Wallet
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
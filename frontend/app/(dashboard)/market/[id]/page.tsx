// app/(dashboard)/market/[id]/page.tsx
"use client";

import { data as allMarkets } from "@/lib/data";
import { notFound } from "next/navigation";
import React from "react";

// Import components from the new `components/market` directory
import { MarketHeader } from "@/components/market/MarketHeader";
import { MarketChart } from "@/components/market/MarketChart";
import { MarketRules } from "@/components/market/MarketRules";
import { MarketOpinions } from "@/components/market/MarketOpinions";
import { TradeCard } from "@/components/market/TradeCard";

// Helper function to get data.
function getMarketById(id: string) {
  return allMarkets.find((m) => m.market_id.toString() === id);
}

/**
 * Parses your specific market_data string format
 */
function parseMarketData(dataString: string) {
  try {
    const parts = dataString.split("␟");
    const mainDescription = parts[0] || "";
    const metadata = parts[2] ? parts[2].split(";") : [];

    return {
      mainDescription: mainDescription.trim(),
      categories: metadata[0] || "",
      sourceLink: metadata[2] || "#",
      sourceName: metadata[3] || "View Source",
    };
  } catch (error) {
    console.error("Failed to parse market data:", error);
    return {
      mainDescription: "Error loading market details.",
      categories: "",
      sourceLink: "#",
      sourceName: "N/A",
    };
  }
}

// ---------------------------
// --- THE MAIN PAGE ---
// ---------------------------

export default function MarketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = React.use(params);
  const market = getMarketById(resolvedParams.id);

  if (!market) {
    notFound();
  }

  const details = parseMarketData(market.market_data);

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Left Column (Market Details) */}
        <div className="flex-1 min-w-0">
          <MarketHeader market={market} />
          <MarketChart market={market} />
          <MarketRules details={details} />
          <MarketOpinions />
        </div>

        {/* Right Column (Trading Card) */}
        <div className="w-full lg:w-[380px] flex-shrink-0">
          <TradeCard market={market} />
        </div>
      </div>
    </div>
  );
}

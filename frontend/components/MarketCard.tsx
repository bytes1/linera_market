// components/MarketCard.tsx
import Image from "next/image";
import type { Market } from "@/lib/data"; // Adjust path to your data.ts
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CircleDollarSign, Clock } from "lucide-react";

export const MarketCard = ({ market }: { market: Market }) => {
  // Default to 'image' style if not specified
  const style = market.cardStyle || "image";

  return (
    <Card className="flex flex-col w-full h-full relative rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
      {/* --- MODIFIED: Conditional Image Section --- */}
      {style === "image" && (
        <div className="relative w-full h-32 flex-shrink-0 overflow-hidden">
          <Image
            src={market.image || "/placeholder.svg"}
            alt={market.market_title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />

          {/* Flash Market Badge */}
          {market.isFlashMarket && (
            <Badge className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full border-none shadow-lg">
              🔥 Flash Market
            </Badge>
          )}
        </div>
      )}
      {/* --- END MODIFIED --- */}

      {/* Content Section - Added h-full and flex-col */}
      <div className="flex flex-col gap-4 p-4 h-full">
        {/* Title */}
        <h3 className="font-semibold text-lg line-clamp-2 text-slate-900 dark:text-slate-50">
          {market.market_title}
        </h3>

        {/* --- NEW: Spacer for 'text' style cards --- */}
        {/* This pushes the content to the bottom, aligning it with image cards */}
        {style === "text" && <div className="flex-grow" />}
        {/* --- END NEW --- */}

        {/* Progress Bar and Percentages (Unchanged) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {market.yesPercentage}%
            </span>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {market.noPercentage}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-gradient-to-r from-green-400 via-purple-500 to-pink-500" />
        </div>

        {/* Button Styles (Unchanged) */}
        <div className="flex gap-2">
          <Button
            className="flex-1 bg-cyan-100 text-cyan-800 hover:bg-cyan-200 dark:bg-cyan-900/50 dark:text-cyan-300 dark:hover:bg-cyan-900/70 h-10 text-sm font-bold rounded-lg transition-colors uppercase tracking-wide"
            variant="ghost"
          >
            {market.outcome_a}
          </Button>
          <Button
            className="flex-1 bg-pink-100 text-pink-800 hover:bg-pink-200 dark:bg-pink-900/50 dark:text-pink-300 dark:hover:bg-pink-900/70 h-10 text-sm font-bold rounded-lg transition-colors uppercase tracking-wide"
            variant="ghost"
          >
            {market.outcome_b}
          </Button>
        </div>

        {/* Stats Footer (Unchanged) */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="flex -space-x-1">
                <div className="w-4 h-4 rounded-full bg-emerald-500/60 border border-slate-300 dark:border-slate-700"></div>
                <div className="w-4 h-4 rounded-full bg-purple-500/60 border border-slate-300 dark:border-slate-700"></div>
              </div>
              <span className="text-slate-600 dark:text-slate-400 ml-1">
                +{market.participants}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1 font-medium">
              <CircleDollarSign className="w-3.5 h-3.5" />
              {market.currency}
              {market.volume}
            </span>
            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              {market.deadline}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

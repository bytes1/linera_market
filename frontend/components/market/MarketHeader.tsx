// components/market/MarketHeader.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
// Added AlertTriangle to imports
import { CalendarDays, ChevronLeft, AlertTriangle } from "lucide-react";
import type { Market } from "@/lib/data";

export const MarketHeader = ({ market }: { market: Market }) => (
  <div className="mb-4">
    <Link
      href="/market"
      className="flex items-center gap-1 text-sm text-sky-500 hover:text-sky-600 mb-2"
    >
      <ChevronLeft className="w-4 h-4" />
      Markets
    </Link>
    
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
        <Image
          src={market.image}
          alt={market.market_title}
          width={48}
          height={48}
          className="w-full h-full object-cover rounded-lg"
          unoptimized
        />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          {market.market_title}
        </h1>
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <CalendarDays className="w-3.5 h-3.5" />
          <span>Closes {market.deadline}</span>
        </div>
      </div>
    </div>

    {/* Message Block */}
    {/* <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-amber-800 dark:text-amber-200">
        The True Market Node is currently inactive. You can still place a bet, and it will be processed when the node becomes active.
      </p>
    </div> */}
  </div>
);
// components/market/MarketHeader.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ChevronLeft } from "lucide-react";
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
  </div>
);

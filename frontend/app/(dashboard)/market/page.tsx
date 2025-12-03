// app/(dashboard)/market/page.tsx
"use client";

import { useState, useMemo } from "react";
import { MarketCard } from "@/components/MarketCard";
import { data as allMarkets } from "@/lib/data";
import Link from "next/link";
import { X, Filter } from "lucide-react";
import { AIChat } from "@/components/AIChat";

type CategoryFilter =
  | "All"
  | "Crypto"
  | "Politics"
  | "Sports"
  | "Entertainment";
type SortBy = "newest" | "trending" | "volume";

export default function MarketPage() {
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>("All");
  const [sortBy, setSortBy] = useState<SortBy>("trending");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter and sort markets
  const filteredMarkets = useMemo(() => {
    let filtered = allMarkets;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (market) => market.category === selectedCategory
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((market) =>
        market.market_title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    const sorted = [...filtered];
    if (sortBy === "trending") {
      sorted.sort((a, b) => {
        const aVolume = parseInt(a.volume) || 0;
        const bVolume = parseInt(b.volume) || 0;
        return bVolume - aVolume;
      });
    } else if (sortBy === "newest") {
      sorted.reverse();
    } else if (sortBy === "volume") {
      sorted.sort((a, b) => {
        const aVolume = parseInt(a.volume) || 0;
        const bVolume = parseInt(b.volume) || 0;
        return bVolume - aVolume;
      });
    }

    return sorted;
  }, [selectedCategory, sortBy, searchTerm]);

  const categoryColors: Record<CategoryFilter, string> = {
    All: "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50",
    Crypto: "bg-pink-100 dark:bg-pink-900/30 text-pink-900 dark:text-pink-100",
    Sports: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-900 dark:text-cyan-100",
    Politics:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100",
    Entertainment:
      "bg-orange-100 dark:bg-orange-900/30 text-orange-900 dark:text-orange-100",
  };

  const categoryIcons: Record<CategoryFilter, string> = {
    All: "🎯",
    Crypto: "₿",
    Sports: "🏈",
    Politics: "🏛️",
    Entertainment: "🎬",
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2">
          Explore Markets
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Discover {allMarkets.length} prediction markets
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search markets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Filter & Sort Bar */}
      <div className="mb-6 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-2 mr-2 whitespace-nowrap">
            <Filter size={16} /> Category:
          </span>
          <div className="flex flex-wrap gap-2">
            {(
              ["All", "Crypto", "Politics", "Sports", "Entertainment"] as const
            ).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
                  selectedCategory === category
                    ? `${categoryColors[category]} ring-2 ring-offset-2 dark:ring-offset-slate-950`
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <span className="text-sm">{categoryIcons[category]}</span>
                {category}
                {selectedCategory === category &&
                  filteredMarkets.length > 0 && (
                    <span className="ml-1 text-xs bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded-full">
                      {filteredMarkets.length}
                    </span>
                  )}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Dropdown & Clear Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="trending">Trending</option>
              <option value="newest">Newest</option>
              <option value="volume">Volume</option>
            </select>
          </div>

          {/* Clear Filters */}
          {(selectedCategory !== "All" || searchTerm) && (
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSearchTerm("");
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm"
              title="Clear all filters"
            >
              <X size={16} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6 text-sm text-slate-600 dark:text-slate-400">
        {searchTerm ? (
          <>
            Showing {filteredMarkets.length} result
            {filteredMarkets.length !== 1 ? "s" : ""} for `{searchTerm}`
          </>
        ) : (
          <>
            Showing {filteredMarkets.length} of {allMarkets.length} markets
          </>
        )}
      </div>

      {/* Markets Grid */}
      {filteredMarkets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredMarkets.map((market) => {
            const cardClasses = [
              "rounded-lg",
              "outline-none",
              "focus-visible:ring-2",
              "focus-visible:ring-emerald-500",
              "focus-visible:ring-offset-2",
              "dark:focus-visible:ring-offset-slate-950",
              "transition-all",
              "duration-300",
            ];

            return (
              <Link
                href={`/market/${market.market_id}`}
                key={market.market_id}
                className={cardClasses.join(" ")}
              >
                <MarketCard market={market} />
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-lg mb-4">
            {searchTerm
              ? `No markets found for "${searchTerm}"`
              : `No markets found in ${selectedCategory}`}
          </p>
          <button
            onClick={() => {
              setSelectedCategory("All");
              setSearchTerm("");
            }}
            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
      <AIChat />
    </div>
  );
}

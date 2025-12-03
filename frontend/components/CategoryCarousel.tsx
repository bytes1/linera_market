// components/CategoryCarousel.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Category {
  id: string;
  name: string;
  color: string;
  bgGradient: string;
  icon: string;
  description: string;
}

const categories: Category[] = [
  {
    id: "crypto",
    name: "Crypto",
    color: "from-pink-400 to-pink-600",
    bgGradient: "bg-gradient-to-br from-pink-500/20 to-pink-600/20",
    icon: "₿",
    description: "Bitcoin, Ethereum & altcoins",
  },
  {
    id: "sports",
    name: "Sports",
    color: "from-cyan-400 to-cyan-600",
    bgGradient: "bg-gradient-to-br from-cyan-500/20 to-cyan-600/20",
    icon: "🏈",
    description: "NFL, NBA, soccer & more",
  },
  {
    id: "politics",
    name: "Politics",
    color: "from-purple-400 to-purple-600",
    bgGradient: "bg-gradient-to-br from-purple-500/20 to-purple-600/20",
    icon: "🏛️",
    description: "Elections & policy outcomes",
  },

  {
    id: "gaming",
    name: "Gaming",
    color: "from-yellow-400 to-yellow-600",
    bgGradient: "bg-gradient-to-br from-yellow-500/20 to-yellow-600/20",
    icon: "🎮",
    description: "Esports & game events",
  },
];

export function CategoryCarousel() {
  const [scrollPosition, setScrollPosition] = useState(0);

  const scroll = (direction: "left" | "right") => {
    const container = document.getElementById("category-scroll");
    if (container) {
      const scrollAmount = 320;
      const newPosition =
        direction === "left"
          ? Math.max(0, scrollPosition - scrollAmount)
          : scrollPosition + scrollAmount;

      container.scrollTo({
        left: newPosition,
        behavior: "smooth",
      });

      setScrollPosition(newPosition);
    }
  };

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Explore by Category
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Browse prediction markets by topic
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        <div
          id="category-scroll"
          className="flex gap-4 overflow-x-auto scroll-smooth pb-2 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-slate-200 [&::-webkit-scrollbar-thumb]:bg-slate-400 dark:[&::-webkit-scrollbar-track]:bg-slate-700 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600"
        >
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/markets?category=${category.id}`}
              className="flex-shrink-0 w-72"
            >
              <div
                className={`h-40 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer 
                  bg-gradient-to-br ${category.color} bg-opacity-10 
                  border border-opacity-20 border-current
                  dark:border-opacity-10`}
              >
                <div className="h-full flex flex-col justify-between">
                  {/* Top Section */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-1">
                        {category.name}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {category.description}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Section with Icon */}
                  <div className="flex items-end justify-between">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Browse Markets
                    </span>
                    <span className="text-3xl">{category.icon}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

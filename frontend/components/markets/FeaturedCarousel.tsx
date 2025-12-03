"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Pause, Play, Trophy, Users, TrendingUp, Zap } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";

const randomImages = [
  "/ethereum-blockchain-market.jpg",
  "/bitcoin-cryptocurrency-trading.jpg",
  "/bitcoin-price-chart.jpg",
  "/artificial-intelligence-technology.jpg",
  "/tech-stocks-market.jpg",
  "/space-exploration-rocket.jpg",
];

const events = [
  {
    id: 1,
    title: "True Markets '25",
    subtitle: "Predict to win millions of Points",
    image: randomImages[0],
    accentColor: "from-emerald-500 to-teal-500",
    stats: [
      { label: "Prize Pool", value: "500M Points", icon: Trophy },
      { label: "Top Prize", value: "100M Points", icon: Zap },
      { label: "Total Winners", value: "150", icon: Users },
    ],
  },
  {
    id: 2,
    title: "ETH Futures Market",
    subtitle: "Will ETH break $10,000 this year?",
    image: randomImages[1],
    accentColor: "from-blue-500 to-cyan-500",
    stats: [
      { label: "Total Volume", value: "$1.2B", icon: TrendingUp },
      { label: "Traders", value: "25K", icon: Users },
    ],
  },
  {
    id: 3,
    title: "Bitcoin Milestone",
    subtitle: "Will BTC reach new all-time highs?",
    image: randomImages[2],
    accentColor: "from-orange-500 to-amber-500",
    stats: [
      { label: "Total Volume", value: "$2.5B", icon: TrendingUp },
      { label: "Traders", value: "45K", icon: Users },
    ],
  },
  {
    id: 4,
    title: "AI Revolution Market",
    subtitle: "Predict the next major AI breakthrough",
    image: randomImages[3],
    accentColor: "from-purple-500 to-pink-500",
    stats: [
      { label: "Total Volume", value: "$800M", icon: TrendingUp },
      { label: "Traders", value: "15K", icon: Users },
    ],
  },
  {
    id: 5,
    title: "Tech Giants Battle",
    subtitle: "Who will lead the tech industry?",
    image: randomImages[4],
    accentColor: "from-indigo-500 to-blue-500",
    stats: [
      { label: "Total Volume", value: "$1.8B", icon: TrendingUp },
      { label: "Traders", value: "32K", icon: Users },
    ],
  },
  {
    id: 6,
    title: "Space Exploration",
    subtitle: "Next major space milestone",
    image: randomImages[5],
    accentColor: "from-violet-500 to-purple-500",
    stats: [
      { label: "Total Volume", value: "$600M", icon: TrendingUp },
      { label: "Traders", value: "12K", icon: Users },
    ],
  },
];

export function PredictionCarousel() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [hoveredCard, setHoveredCard] = React.useState(false);
  const { theme } = useTheme();

  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  React.useEffect(() => {
    if (!api) {
      return;
    }
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
    api.on("autoplay:play", () => setIsPlaying(true));
    api.on("autoplay:stop", () => setIsPlaying(false));
  }, [api]);

  const togglePlay = React.useCallback(() => {
    const autoplay = plugin.current;
    if (!autoplay) return;
    if (isPlaying) {
      autoplay.stop();
    } else {
      autoplay.play(true);
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const isDark = theme === "dark";

  return (
    <div className="w-full px-8 mx-auto mt-8">
      <Carousel setApi={setApi} className="w-full" plugins={[plugin.current]}>
        <CarouselContent>
          {events.map((event) => (
            <CarouselItem key={event.id}>
              <Card
                className="border-none overflow-hidden shadow-2xl"
                onMouseEnter={() => setHoveredCard(true)}
                onMouseLeave={() => setHoveredCard(false)}
              >
                <CardContent className="relative flex h-[450px] items-end justify-center p-0 group">
                  {/* Background Image with Scale Effect */}
                  <div className="absolute inset-0 overflow-hidden">
                    <img
                      src={event.image || "/placeholder.svg"}
                      alt={event.title}
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>

                  {/* Enhanced Gradient Overlay */}
                  <div
                    className={`absolute inset-0 ${
                      isDark
                        ? "bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/20"
                        : "bg-gradient-to-t from-black/90 via-black/60 to-black/20"
                    } transition-opacity duration-300`}
                  />

                  {/* Accent Gradient Bar */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${event.accentColor}`}
                  />

                  {/* Content Container with Glassmorphism */}
                  <div className="relative w-full p-8">
                    {/* Stats Cards with Glassmorphism */}
                    <div className="flex items-center justify-between gap-6 mb-6">
                      {event.stats.map((stat, idx) => (
                        <div
                          key={stat.label}
                          className={`flex-1 backdrop-blur-xl ${
                            isDark ? "bg-white/5" : "bg-white/10"
                          } rounded-2xl p-4 border ${
                            isDark ? "border-white/10" : "border-white/20"
                          } transition-all duration-300 hover:scale-105 hover:${
                            isDark ? "bg-white/10" : "bg-white/20"
                          }`}
                          style={{
                            animationDelay: `${idx * 100}ms`,
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-xl bg-gradient-to-br ${event.accentColor}`}
                            >
                              <stat.icon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="text-xs text-white/60 font-medium uppercase tracking-wider">
                                {stat.label}
                              </p>
                              <p className="text-lg font-bold text-white">
                                {stat.value}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Title Section with CTA */}
                    <div
                      className={`backdrop-blur-xl ${
                        isDark ? "bg-white/5" : "bg-white/10"
                      } rounded-2xl p-6 border ${
                        isDark ? "border-white/10" : "border-white/20"
                      } flex items-center justify-between`}
                    >
                      <div className="flex-1">
                        <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">
                          {event.title}
                        </h3>
                        <p className="text-base text-white/70 font-medium">
                          {event.subtitle}
                        </p>
                      </div>
                      <Button
                        size="lg"
                        className={`shrink-0 ml-6 px-8 py-6 text-base font-bold bg-gradient-to-r ${event.accentColor} text-white border-none shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 hover:brightness-110`}
                      >
                        <Zap className="mr-2 h-5 w-5" />
                        Predict Now
                      </Button>
                    </div>
                  </div>

                  {/* Corner Accent */}
                  <div
                    className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${event.accentColor} opacity-20 blur-3xl`}
                  />
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Enhanced Navigation Buttons */}
        <CarouselPrevious
          className={`absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 border-2 backdrop-blur-xl transition-all duration-300 hover:scale-110 ${
            isDark
              ? "text-white bg-white/10 border-white/20 hover:bg-white/20"
              : "text-white bg-black/20 border-white/30 hover:bg-black/30"
          }`}
        />
        <CarouselNext
          className={`absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 border-2 backdrop-blur-xl transition-all duration-300 hover:scale-110 ${
            isDark
              ? "text-white bg-white/10 border-white/20 hover:bg-white/20"
              : "text-white bg-black/20 border-white/30 hover:bg-black/30"
          }`}
        />
      </Carousel>

      {/* Enhanced Controls */}
      <div
        className={`flex justify-center items-center gap-4 mt-6 ${
          isDark ? "text-white" : "text-black"
        }`}
      >
        <button
          onClick={togglePlay}
          className={`p-2 rounded-full backdrop-blur-xl transition-all duration-300 hover:scale-110 ${
            isDark
              ? "bg-white/10 hover:bg-white/20 text-white"
              : "bg-black/10 hover:bg-black/20 text-black"
          }`}
          aria-label={isPlaying ? "Pause autoplay" : "Start autoplay"}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </button>

        <div className="flex justify-center gap-2">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                current === index + 1
                  ? isDark
                    ? "bg-white w-8"
                    : "bg-black w-8"
                  : isDark
                  ? "bg-white/30 w-2 hover:bg-white/50"
                  : "bg-black/30 w-2 hover:bg-black/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { Moon, Sun, Search, User, Wallet } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// 1. Import useEffect and useState
import { useEffect, useState } from "react";

import { WalletButton } from "@/components/common/WalletButton";

export default function Header() {
  const { setTheme, theme } = useTheme();

  // 2. Add the `mounted` state
  const [mounted, setMounted] = useState(false);

  // 3. Set mounted to true only on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 md:px-6 w-full">
        {/* Left container (Search) */}
        <div className="container flex items-center flex-1 max-w-2xl px-0">
          <div className="relative flex-1 hidden md:flex">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search markets..." className="pl-10 w-full" />
          </div>
        </div>

        {/* Actions RIGHT aligned */}
        <div className="flex gap-2 items-center ml-auto">
          {mounted && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  {theme === "dark" ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <WalletButton />
        </div>
      </div>
    </header>
  );
}

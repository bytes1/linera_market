"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Home,
  Trophy,
  ChevronLeft,
  Menu,
  FileText,
  Droplet,
  IdCard,
  DollarSign,
  Vault,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon; // ✅ Proper icon type
}

const mainNavigation: NavItem[] = [
  { name: "Markets", href: "/market", icon: Home },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  // { name: "Vault", href: "/vault", icon: Vault },
  // { name: "Credential", href: "/credential", icon: IdCard },
  // { name: "Trader Vault", href: "/trader-vault", icon: DollarSign },
  { name: "Faucet", href: "/faucet", icon: Droplet },
];

const bottomNavigation: NavItem[] = [
  // { name: "Docs", href: "/docs", icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setIsOpen(false);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setIsOpen((prev) => !prev);

  const renderNavItem = (item: NavItem) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 whitespace-nowrap",
          isActive
            ? "bg-primary text-primary-foreground shadow-lg"
            : "text-foreground hover:bg-accent hover:text-accent-foreground"
        )}
        onClick={() => {
          if (isMobile) setIsOpen(false);
        }}
      >
        <Icon size={20} className="flex-shrink-0" /> {/* ✅ Fixed */}
        {isOpen && <span className="font-medium">{item.name}</span>}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="fixed left-4 top-20 z-50 md:hidden"
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Mobile overlay */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:sticky left-0 top-0 h-screen bg-card border-r border-border transition-all duration-300 z-40 flex flex-col",
          isOpen ? "w-64" : "w-20"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          {isOpen && (
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              True Market
            </h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hidden md:flex"
          >
            <ChevronLeft
              className={cn(
                "h-5 w-5 transition-transform duration-300",
                !isOpen && "rotate-180"
              )}
            />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-hide space-y-1 p-3">
          {mainNavigation.map(renderNavItem)}
        </nav>

        {/* Bottom links */}
        <nav className="overflow-y-auto scrollbar-hide space-y-1 p-3 border-t border-border">
          {bottomNavigation.map(renderNavItem)}
        </nav>
      </aside>
    </>
  );
}

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils"; // Make sure you have this util from shadcn
import {
  User,
  Link,
  Wallet,
  Settings as SettingsIcon,
  Upload,
} from "lucide-react";
import React from "react";

// --- Sidebar Navigation Component ---
// You can move this to its own file if you prefer
function SettingsSidebar() {
  const [activeTab, setActiveTab] = React.useState("profile");

  // In a real app, you would use <Link> from next/link
  // and manage active state based on the current pathname.
  const navItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "connections", label: "Connections", icon: Link },
    { id: "wallets", label: "Wallets", icon: Wallet },
    { id: "advanced", label: "Advanced", icon: SettingsIcon },
  ];

  return (
    <nav className="flex flex-col gap-1">
      <h2 className="px-4 py-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
        Settings
      </h2>
      {navItems.map((item) => (
        <Button
          key={item.id}
          variant="ghost"
          onClick={() => setActiveTab(item.id)}
          className={cn(
            "w-full justify-start gap-2",
            activeTab === item.id && "bg-muted text-foreground"
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Button>
      ))}
    </nav>
  );
}

// --- Main Settings Page ---
export default function SettingsPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r py-6 pr-4 pl-2 md:pl-4">
        <SettingsSidebar />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-2xl">
          {/* Header */}
          <header className="mb-6">
            <h1 className="text-2xl font-bold">Profile</h1>
            <p className="text-muted-foreground">
              Manage your profile and preferences here.
            </p>
          </header>

          <Separator />

          {/* Form Content */}
          <div className="space-y-8 py-8">
            {/* Avatar Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <Label className="w-full md:w-32">Avatar</Label>
              <div className="flex flex-1 items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/path-to-avatar.png" />
                  <AvatarFallback className="text-xl font-semibold bg-gradient-to-br from-purple-500 to-blue-500">
                    0x
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
                <p className="text-sm text-muted-foreground">
                  JPG, GIF or PNG. 1MB Max.
                </p>
              </div>
            </div>

            {/* Username Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <Label htmlFor="username" className="w-full md:w-32">
                Username
              </Label>
              <div className="flex-1">
                <Input
                  id="username"
                  defaultValue="0x1C22...3CEE"
                  className="max-w-sm"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Can only contain alphanumeric characters, underscores, and
                  dashes.
                </p>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-4">
              <div className="w-full md:w-32"></div> {/* Spacer */}
              <div className="flex-1">
                <Button>Save</Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

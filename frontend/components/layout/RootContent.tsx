"use client";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

interface RootContentProps {
  children: React.ReactNode;
}

export default function RootContent({ children }: RootContentProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 bg-background overflow-auto">{children}</main>
      </div>
    </div>
  );
}

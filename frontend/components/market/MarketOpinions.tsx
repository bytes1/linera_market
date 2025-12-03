// components/market/MarketOpinions.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const MarketOpinions = () => (
  <div>
    <h2 className="text-xl font-semibold mb-3">Opinions</h2>
    <Tabs defaultValue="opinions">
      <TabsList>
        <TabsTrigger value="opinions">Opinions (0)</TabsTrigger>
        <TabsTrigger value="holders">Holders</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="news">News</TabsTrigger>
      </TabsList>
      <TabsContent value="opinions">
        <Card>
          <CardContent className="p-4">
            <div className="w-full h-24 bg-slate-100 dark:bg-slate-800 rounded-md flex items-center justify-center text-slate-500">
              [Comment Section Placeholder]
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
);

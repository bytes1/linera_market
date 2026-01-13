// frontend/components/market/MarketOpinions.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLinera } from "@/lib/contexts/LineraContext";
import { createClient } from "@supabase/supabase-js";


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const MarketOpinions = ({ marketId }: { marketId: string }) => {
  const { isConnected, owner } = useLinera();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);


  const fetchComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("market_id", marketId)
      .order("created_at", { ascending: false });
    if (data) setComments(data);
  };

  useEffect(() => {
    fetchComments();
  }, [marketId]);

  const handlePost = async () => {
    if (!newComment.trim() || !owner) return;
    setLoading(true);

  
    await supabase.from("profiles").upsert({ address: owner }, { onConflict: "address" });

    
    const { error } = await supabase.from("comments").insert({
      market_id: marketId,
      user_address: owner,
      content: newComment,
    });

    if (!error) {
      setNewComment("");
      fetchComments();
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Opinions</h2>
      <Tabs defaultValue="opinions">
        <TabsList>
          <TabsTrigger value="opinions">Opinions ({comments.length})</TabsTrigger>
          <TabsTrigger value="holders">Holders</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="opinions" className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              {isConnected ? (
                <div className="flex gap-2">
                  <Input 
                    placeholder="Share your opinion..." 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <Button onClick={handlePost} disabled={loading}>
                    {loading ? "Posting..." : "Post"}
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground bg-slate-50 dark:bg-slate-900 p-3 rounded">
                  Connect your wallet to share an opinion.
                </p>
              )}

              <div className="space-y-4 mt-4">
                {comments.map((c) => (
                  <div key={c.id} className="border-b border-slate-100 dark:border-slate-800 pb-2">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span className="font-mono">
                        {c.user_address.slice(0, 6)}...{c.user_address.slice(-4)}
                      </span>
                      <span>{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm">{c.content}</p>
                  </div>
                ))}
                {comments.length === 0 && (
                  <div className="text-center py-8 text-slate-400 italic text-sm">
                    No opinions yet. Be the first to comment!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
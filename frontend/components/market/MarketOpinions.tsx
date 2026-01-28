"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLinera } from "@/lib/contexts/LineraContext";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const MarketOpinions = ({ marketId }: { marketId: string }) => {
  const { isConnected, owner } = useLinera();
  const [comments, setComments] = useState<any[]>([]);
  const [holders, setHolders] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    // Fetch Comments
    const { data: cData } = await supabase
      .from("comments")
      .select("*")
      .eq("market_id", marketId)
      .order("created_at", { ascending: false });
    if (cData) setComments(cData);

    // Fetch Holders
    const { data: hData } = await supabase
      .from("market_holdings")
      .select("*")
      .eq("market_id", marketId)
      .gt("shares_amount", 0)
      .order("shares_amount", { ascending: false });
    if (hData) setHolders(hData);
  };

  useEffect(() => {
    fetchData();
  }, [marketId]);

  const handlePost = async () => {
    if (!newComment.trim() || !owner) return;
    setLoading(true);
    await supabase.from("profiles").upsert({ address: owner });
    const { error } = await supabase.from("comments").insert({
      market_id: marketId,
      user_address: owner,
      content: newComment,
    });
    if (!error) {
      setNewComment("");
      fetchData();
    }
    setLoading(false);
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-3">Market Insights</h2>
      <Tabs defaultValue="opinions">
        <TabsList>
          <TabsTrigger value="opinions">Opinions ({comments.length})</TabsTrigger>
          <TabsTrigger value="holders">Holders ({holders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="opinions" className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              {isConnected ? (
                <div className="flex gap-2">
                  <Input placeholder="Share an opinion..." value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                  <Button onClick={handlePost} disabled={loading}>Post</Button>
                </div>
              ) : <p className="text-sm text-muted-foreground">Connect wallet to comment.</p>}
              <div className="space-y-4">
                {comments.map((c) => (
                  <div key={c.id} className="border-b pb-2">
                    <p className="text-xs text-slate-500">{c.user_address.slice(0, 6)}...{c.user_address.slice(-4)}</p>
                    <p className="text-sm">{c.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="holders">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">User</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead className="text-right pr-4">Shares</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {holders.map((h, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono text-xs pl-4">{h.user_address.slice(0, 6)}...{h.user_address.slice(-4)}</TableCell>
                    <TableCell><span className={h.outcome === 'YES' ? 'text-cyan-600' : 'text-pink-600'}>{h.outcome}</span></TableCell>
                    <TableCell className="text-right pr-4">{Number(h.shares_amount).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
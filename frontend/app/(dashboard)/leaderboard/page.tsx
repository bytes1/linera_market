"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { leaderboardData, LeaderboardEntry } from "@/lib/leaderboard-data";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils"; // Make sure you have this util from shadcn

// Helper function to format large numbers with commas
const formatNumber = (num: number) => {
  return new Intl.NumberFormat("en-US").format(num);
};

// Reusable component for the info icons in the table header
const InfoTooltip = ({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center justify-end gap-1.5 cursor-help">
          {children}
          <Info className="h-3 w-3 text-muted-foreground" />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen w-full bg-background text-foreground p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <Select defaultValue="szn2">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select season" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="szn2">SZN 2</SelectItem>
              <SelectItem value="szn1">SZN 1</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <h2 className="text-lg text-muted-foreground mb-8">SZN 2 (122k)</h2>

        {/* Leaderboard Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Rank</TableHead>
                <TableHead>Username</TableHead>
                <TableHead className="text-right">
                  <InfoTooltip label="S Score explained">S SCORE</InfoTooltip>
                </TableHead>
                <TableHead className="text-right">
                  <InfoTooltip label="Ref Score explained">
                    REF SCORE
                  </InfoTooltip>
                </TableHead>
                <TableHead className="text-right">
                  <InfoTooltip label="PTS Score explained">
                    PTS SCORE
                  </InfoTooltip>
                </TableHead>
                <TableHead className="text-right">
                  <InfoTooltip label="Multiplier explained">
                    MULTIPLIER
                  </InfoTooltip>
                </TableHead>
                <TableHead className="text-right">
                  <InfoTooltip label="Total Score explained">
                    TOTAL SCORE
                  </InfoTooltip>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboardData.map((entry: LeaderboardEntry) => (
                <TableRow
                  key={entry.rank}
                  className={cn(
                    // This applies the blue highlight for the user's row
                    entry.isUser &&
                      "bg-blue-900/50 hover:bg-blue-900/60 data-[state=selected]:bg-blue-900/50"
                  )}
                >
                  <TableCell className="font-medium">
                    {formatNumber(entry.rank)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={entry.avatar} alt={entry.username} />
                        <AvatarFallback>{entry.avatarFallback}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{entry.username}</span>
                      {entry.isUser && (
                        <Badge
                          variant="outline"
                          className="text-blue-300 border-blue-300"
                        >
                          Your position
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(entry.sScore)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(entry.refScore)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(entry.ptsScore)}
                  </TableCell>
                  <TableCell className="text-right">
                    {entry.multiplier}
                  </TableCell>
                  <TableCell className="text-right font-medium text-lg">
                    {formatNumber(entry.totalScore)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

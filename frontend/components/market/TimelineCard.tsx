// components/market/TimelineCard.tsx
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Market } from "@/lib/data";
import { Clock, CheckCircle } from "lucide-react";

export const TimelineCard = ({ market }: { market: Market }) => (
  <Accordion type="single" collapsible defaultValue="item-1">
    <AccordionItem value="item-1" className="border-b-0">
      <AccordionTrigger className="text-base font-semibold text-slate-900 dark:text-slate-50">
        Timeline
      </AccordionTrigger>
      <AccordionContent className="pt-2">
        <div className="flex flex-col gap-4 text-sm">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900 text-sky-600 dark:text-sky-300 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                Market published
              </span>
              <p className="text-slate-500 dark:text-slate-400">
                December 3, 2025 11:11 PM
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                Market closes
              </span>
              <p className="text-slate-500 dark:text-slate-400">
                {market.deadline}
              </p>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
);

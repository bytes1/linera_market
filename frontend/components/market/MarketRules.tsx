// components/market/MarketRules.tsx
"use client";

import ReactMarkdown from "react-markdown";

// Define the prop type explicitly
type MarketRulesProps = {
  details: {
    mainDescription: string;
    sourceLink: string;
    sourceName: string;
  };
};

export const MarketRules = ({ details }: MarketRulesProps) => (
  <div className="mb-6">
    <h2 className="text-xl font-semibold mb-3">Rules</h2>

    <div className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm space-y-4">
      <ReactMarkdown
        components={{
          a: ({ node, ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-500 hover:underline"
            />
          ),
          ul: ({ node, ...props }) => (
            <ul {...props} className="list-disc pl-5 space-y-2" />
          ),
          ol: ({ node, ...props }) => (
            <ol {...props} className="list-decimal pl-5 space-y-2" />
          ),
          strong: ({ node, ...props }) => (
            <strong
              {...props}
              className="font-semibold text-slate-800 dark:text-slate-200"
            />
          ),
          em: ({ node, ...props }) => <em {...props} className="italic" />,
        }}
      >
        {details.mainDescription}
      </ReactMarkdown>
    </div>

    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
      <h3 className="text-base font-semibold mb-2">Resolution Source</h3>
      <a
        href={details.sourceLink}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sky-500 hover:underline text-sm"
      >
        {details.sourceName}
      </a>
    </div>
  </div>
);

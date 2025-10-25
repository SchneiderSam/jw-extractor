'use client';

import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function UsageInfoTooltip() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className="inline-flex items-center justify-center w-5 h-5 rounded-full hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Usage information"
            type="button"
          >
            <Info className="w-4 h-4 text-muted-foreground" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs p-3">
          <div className="space-y-2">
            <p className="text-sm">Extract clean Markdown content from jw.org and wol.jw.org articles</p>
            <p className="text-sm text-muted-foreground">
              Perfect for AI assistants like ChatGPT, Claude, or Cursor
            </p>
            <p className="text-sm text-muted-foreground">
              Use extracted content as context for deeper analysis
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}


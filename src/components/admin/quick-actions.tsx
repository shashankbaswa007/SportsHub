"use client";

import { memo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Download, Zap } from 'lucide-react';

interface QuickActionsProps {
  onScrollToCreate: () => void;
  onExport: () => void;
  matchCount: number;
  liveCount: number;
}

export const QuickActions = memo(function QuickActions({
  onScrollToCreate,
  onExport,
  matchCount,
  liveCount,
}: QuickActionsProps) {
  return (
    <Card className="glass p-3 bg-foreground/[0.02] border-foreground/10">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 mr-auto">
          <Zap className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-xs font-semibold text-foreground/50">Quick Actions</span>
        </div>

        <Button
          size="sm"
          className="h-8 text-xs gap-1.5 bg-foreground/10 hover:bg-foreground/15 text-foreground/80"
          onClick={onScrollToCreate}
        >
          <Plus className="h-3.5 w-3.5" />
          New Match
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs gap-1.5 border-foreground/10 hover:bg-foreground/10 text-foreground/60"
          onClick={onExport}
        >
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>

        {liveCount > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-500/10 border border-red-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-[11px] font-semibold text-red-400">{liveCount} Live</span>
          </div>
        )}

        <div className="text-[11px] text-foreground/25 tabular-nums">
          {matchCount} total matches
        </div>
      </div>
    </Card>
  );
});

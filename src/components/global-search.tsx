"use client";

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppData } from '@/lib/data-context';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Trophy, Users, Zap, Calendar, ArrowRight } from 'lucide-react';
import { SportIcon } from '@/components/sport-icon';
import type { Match, Team } from '@/lib/types';

interface SearchResult {
  type: 'match' | 'team';
  id: string;
  title: string;
  subtitle: string;
  sport: string;
  status?: string;
  href: string;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { matches, teams, teamsById } = useAppData();

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [open]);

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) return [];

    const items: SearchResult[] = [];

    // Search matches
    for (const match of matches) {
      const tA = teamsById.get(match.teamAId);
      const tB = teamsById.get(match.teamBId);
      const teamAName = tA?.name ?? '';
      const teamBName = tB?.name ?? '';
      const matchTitle = `${teamAName} vs ${teamBName}`;

      if (
        matchTitle.toLowerCase().includes(q) ||
        match.sport.toLowerCase().includes(q) ||
        match.venue?.toLowerCase().includes(q) ||
        match.status.toLowerCase().includes(q)
      ) {
        items.push({
          type: 'match',
          id: match.id,
          title: matchTitle,
          subtitle: `${match.sport} · ${match.venue || 'TBD'}`,
          sport: match.sport,
          status: match.status,
          href: `/match/${match.id}`,
        });
      }
      if (items.length >= 20) break;
    }

    // Search teams
    for (const team of teams) {
      if (team.name.toLowerCase().includes(q) || team.sport.toLowerCase().includes(q)) {
        items.push({
          type: 'team',
          id: team.id,
          title: team.name,
          subtitle: team.sport,
          sport: team.sport,
          href: `/teams`,
        });
      }
      if (items.length >= 30) break;
    }

    return items;
  }, [query, matches, teams, teamsById]);

  const handleSelect = useCallback((result: SearchResult) => {
    setOpen(false);
    router.push(result.href);
  }, [router]);

  const statusColor = (s?: string) => {
    if (s === 'LIVE') return 'bg-red-500/10 text-red-400 border-red-500/20';
    if (s === 'UPCOMING') return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    return 'bg-green-500/10 text-green-400 border-green-500/20';
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white/50 hover:text-white/70 text-sm group"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-white/30 group-hover:text-white/50">
          ⌘K
        </kbd>
      </button>

      {/* Search Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[560px] p-0 gap-0 glass-strong border-white/10 overflow-hidden">
          <DialogTitle className="sr-only">Search</DialogTitle>
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
            <Search className="h-5 w-5 text-white/40 shrink-0" />
            <Input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search matches, teams, sports..."
              className="border-0 bg-transparent text-white placeholder:text-white/30 focus-visible:ring-0 focus-visible:ring-offset-0 h-10 text-base"
            />
            <kbd className="hidden sm:inline-flex px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-white/30 shrink-0">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] sm:max-h-[400px] overflow-y-auto p-2">
            {query.trim().length < 2 ? (
              <div className="flex flex-col items-center justify-center py-12 text-white/30">
                <Search className="h-10 w-10 mb-3 opacity-20" />
                <p className="text-sm font-medium">Type to search</p>
                <p className="text-xs mt-1">Search matches, teams, and sports</p>
              </div>
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-white/30">
                <p className="text-sm font-medium">No results found</p>
                <p className="text-xs mt-1">Try a different search term</p>
              </div>
            ) : (
              <div className="space-y-1">
                {results.map(result => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition-all text-left group"
                  >
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:bg-white/10 transition-all shrink-0">
                      {result.type === 'match' ? (
                        <Zap className="h-4 w-4 text-white/50" />
                      ) : (
                        <Users className="h-4 w-4 text-white/50" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white/90 truncate group-hover:text-white transition-colors">
                        {result.title}
                      </p>
                      <p className="text-xs text-white/40 truncate">{result.subtitle}</p>
                    </div>
                    {result.status && (
                      <Badge className={`text-[10px] shrink-0 ${statusColor(result.status)}`}>
                        {result.status}
                      </Badge>
                    )}
                    <ArrowRight className="h-3.5 w-3.5 text-white/20 group-hover:text-white/50 shrink-0 transition-colors" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

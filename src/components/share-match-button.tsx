"use client";

import { useCallback, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Match, Team } from '@/lib/types';
import { useState } from 'react';

interface ShareMatchButtonProps {
  match: Match;
  teamA: Team;
  teamB: Team;
}

export const ShareMatchButton = memo(function ShareMatchButton({ match, teamA, teamB }: ShareMatchButtonProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const getShareText = useCallback(() => {
    const score = match.status === 'UPCOMING'
      ? 'Starting soon!'
      : `${match.teamAScore} - ${match.teamBScore}`;

    const statusEmoji = match.status === 'LIVE' ? '🔴 LIVE' : match.status === 'COMPLETED' ? '✅ Final' : '📅 Upcoming';

    return `${statusEmoji} | ${match.sport}\n${teamA.name} ${score} ${teamB.name}\n${match.venue ? `📍 ${match.venue}` : ''}\n\nFollow live on SportsHub!`;
  }, [match, teamA, teamB]);

  const handleShare = useCallback(async () => {
    const text = getShareText();
    const url = typeof window !== 'undefined' ? window.location.href : '';

    // Try Web Share API first
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${teamA.name} vs ${teamB.name} - ${match.sport}`,
          text,
          url,
        });
        return;
      } catch (err: any) {
        // User cancelled or share failed — fall through to clipboard
        if (err.name === 'AbortError') return;
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      toast({ title: 'Copied!', description: 'Match details copied to clipboard.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Error', description: 'Failed to copy to clipboard.', variant: 'destructive' });
    }
  }, [getShareText, teamA, teamB, match, toast]);

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-9 text-white/50 hover:text-white/80 gap-1.5"
      onClick={handleShare}
    >
      {copied ? <Check className="h-4 w-4 text-green-400" /> : <Share2 className="h-4 w-4" />}
      <span className="hidden sm:inline text-sm">{copied ? 'Copied' : 'Share'}</span>
    </Button>
  );
});

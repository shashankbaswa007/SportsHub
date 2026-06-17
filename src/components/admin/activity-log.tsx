"use client";

import { memo, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Clock, Plus, Edit } from 'lucide-react';
import type { Match, Team } from '@/lib/types';

interface ActivityLogProps {
  matches: Match[];
  teamsById: Map<string, Team>;
}

interface Activity {
  id: string;
  type: 'match_created' | 'match_live' | 'match_completed';
  title: string;
  subtitle: string;
  timestamp: number;
  icon: typeof Plus;
  color: string;
}

export const ActivityLog = memo(function ActivityLog({ matches, teamsById }: ActivityLogProps) {
  const activities = useMemo(() => {
    const items: Activity[] = [];

    matches.forEach(m => {
      const teamA = teamsById.get(m.teamAId);
      const teamB = teamsById.get(m.teamBId);
      const matchLabel = `${teamA?.name || '?'} vs ${teamB?.name || '?'}`;

      if (m.status === 'COMPLETED') {
        items.push({
          id: `${m.id}-completed`,
          type: 'match_completed',
          title: 'Match Completed',
          subtitle: `${matchLabel} — ${m.teamAScore}-${m.teamBScore}`,
          timestamp: new Date(m.startTime).getTime(),
          icon: Edit,
          color: 'text-emerald-400',
        });
      } else if (m.status === 'LIVE') {
        items.push({
          id: `${m.id}-live`,
          type: 'match_live',
          title: 'Match Started',
          subtitle: matchLabel,
          timestamp: new Date(m.startTime).getTime(),
          icon: Clock,
          color: 'text-red-400',
        });
      } else {
        items.push({
          id: `${m.id}-created`,
          type: 'match_created',
          title: 'Match Scheduled',
          subtitle: `${matchLabel} — ${m.sport}`,
          timestamp: new Date(m.startTime).getTime(),
          icon: Plus,
          color: 'text-blue-400',
        });
      }
    });

    return items.sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);
  }, [matches, teamsById]);

  if (activities.length === 0) {
    return null;
  }

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Card className="glass p-4 sm:p-5 bg-white/[0.02] border-white/10">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-4 w-4 text-white/40" />
        <h3 className="font-bold text-white/80 text-sm">Recent Activity</h3>
        <Badge variant="secondary" className="text-[10px] ml-auto">{activities.length}</Badge>
      </div>

      <ScrollArea className="h-[300px] pr-2">
        <div className="space-y-1">
          {activities.map((activity, i) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/[0.03] transition-colors group"
            >
              <div className="flex flex-col items-center mt-1">
                <div className={`p-1 rounded-md bg-white/5 ${activity.color}`}>
                  <activity.icon className="h-3 w-3" />
                </div>
                {i < activities.length - 1 && (
                  <div className="w-px h-6 bg-white/5 mt-1" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white/70 group-hover:text-white/90 transition-colors">
                  {activity.title}
                </p>
                <p className="text-[11px] text-white/35 truncate">{activity.subtitle}</p>
              </div>

              <span className="text-[10px] text-white/20 shrink-0 tabular-nums">
                {formatTime(activity.timestamp)}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
});

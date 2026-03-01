"use client";

import React, { useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, Table as TableIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { PointsTableItem, Match } from '@/lib/types';

interface ExportResultsProps {
  /** Leaderboard data by sport */
  leaderboard?: PointsTableItem[];
  /** Completed matches */
  matches?: Match[];
  /** Name for the downloaded file */
  filename?: string;
  /** Sport name for labeling */
  sportName?: string;
  /** Map of teamId to team name */
  teamNames?: Map<string, string>;
}

/** Escape HTML special characters to prevent XSS in generated HTML */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function ExportResults({
  leaderboard,
  matches,
  filename = 'sports-hub-export',
  sportName = 'All',
  teamNames,
}: ExportResultsProps) {
  const { toast } = useToast();

  const exportCSV = useCallback(() => {
    const rows: string[][] = [];

    if (leaderboard && leaderboard.length > 0) {
      rows.push(['Rank', 'Team', 'Played', 'Won', 'Lost', 'Drawn', 'Points']);
      for (const item of leaderboard) {
        rows.push([
          String(item.rank),
          item.teamName,
          String(item.played),
          String(item.won),
          String(item.lost),
          String(item.drawn),
          String(item.points),
        ]);
      }
    }

    if (matches && matches.length > 0) {
      if (rows.length > 0) rows.push([]); // blank separator line
      rows.push(['Sport', 'Team A', 'Score A', 'Team B', 'Score B', 'Status', 'Venue', 'Date']);
      for (const m of matches) {
        const teamAName = teamNames?.get(m.teamAId) ?? m.teamAId;
        const teamBName = teamNames?.get(m.teamBId) ?? m.teamBId;
        rows.push([
          m.sport,
          teamAName,
          String(m.teamAScore),
          teamBName,
          String(m.teamBScore),
          m.status,
          m.venue || '',
          m.startTime ? new Date(m.startTime).toLocaleDateString() : '',
        ]);
      }
    }

    if (rows.length === 0) {
      toast({ title: 'No Data', description: 'Nothing to export.', variant: 'destructive' });
      return;
    }

    const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    download(blob, `${filename}.csv`);
    toast({ title: 'CSV Exported', description: `${filename}.csv has been downloaded.` });
  }, [leaderboard, matches, filename, teamNames, toast]);

  const exportPDF = useCallback(() => {
    // Generate a simple HTML-based printable PDF (no external library needed)
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({ title: 'Blocked', description: 'Please allow popups to export PDF.', variant: 'destructive' });
      return;
    }

    let html = `
<!DOCTYPE html>
<html>
<head>
  <title>${escapeHtml(sportName)} Results - SportsHub</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; padding: 40px; color: #111; }
    h1 { font-size: 24px; margin-bottom: 8px; }
    h2 { font-size: 18px; margin: 24px 0 12px; color: #333; }
    p.sub { font-size: 12px; color: #666; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e5e5e5; font-size: 13px; }
    th { background: #f5f5f5; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
    tr:nth-child(even) { background: #fafafa; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .bold { font-weight: 700; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>SportsHub — ${escapeHtml(sportName)} Results</h1>
  <p class="sub">Exported on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
`;

    if (leaderboard && leaderboard.length > 0) {
      html += `<h2>Standings</h2><table>
        <thead><tr><th>Rank</th><th>Team</th><th class="text-center">P</th><th class="text-center">W</th><th class="text-center">L</th><th class="text-center">D</th><th class="text-right">PTS</th></tr></thead>
        <tbody>`;
      for (const item of leaderboard) {
        html += `<tr><td class="bold">${escapeHtml(String(item.rank))}</td><td class="bold">${escapeHtml(item.teamName)}</td><td class="text-center">${item.played}</td><td class="text-center">${item.won}</td><td class="text-center">${item.lost}</td><td class="text-center">${item.drawn}</td><td class="text-right bold">${item.points}</td></tr>`;
      }
      html += `</tbody></table>`;
    }

    if (matches && matches.length > 0) {
      html += `<h2>Match Results</h2><table>
        <thead><tr><th>Sport</th><th>Team A</th><th class="text-center">Score</th><th>Team B</th><th class="text-center">Score</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>`;
      for (const m of matches) {
        const teamAName = teamNames?.get(m.teamAId) ?? m.teamAId;
        const teamBName = teamNames?.get(m.teamBId) ?? m.teamBId;
        html += `<tr><td>${escapeHtml(m.sport)}</td><td class="bold">${escapeHtml(teamAName)}</td><td class="text-center bold">${m.teamAScore}</td><td class="bold">${escapeHtml(teamBName)}</td><td class="text-center bold">${m.teamBScore}</td><td>${escapeHtml(m.status)}</td><td>${m.startTime ? new Date(m.startTime).toLocaleDateString() : ''}</td></tr>`;
      }
      html += `</tbody></table>`;
    }

    html += `</body></html>`;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };

    toast({ title: 'PDF Ready', description: 'Print dialog opened for PDF export.' });
  }, [leaderboard, matches, sportName, teamNames, toast]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-white/10 hover:bg-white/10 text-white/70 hover:text-white">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass border-white/10">
        <DropdownMenuItem onClick={exportCSV} className="gap-2 cursor-pointer text-white/70 hover:text-white">
          <TableIcon className="h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportPDF} className="gap-2 cursor-pointer text-white/70 hover:text-white">
          <FileText className="h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

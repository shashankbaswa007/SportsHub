"use client";

import { useState, useCallback, useRef, memo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, AlertCircle, CheckCircle2, Loader2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { getOrCreateTeam, addPlayerToTeam, sports } from '@/lib/data-client';
import type { SportName } from '@/lib/types';

interface ParsedRow {
  teamName: string;
  sport: SportName;
  playerName: string;
}

function parseCSV(text: string): { rows: ParsedRow[]; errors: string[] } {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const rows: ParsedRow[] = [];
  const errors: string[] = [];

  if (lines.length < 2) {
    errors.push('CSV must have at least a header row and one data row.');
    return { rows, errors };
  }

  // Validate header
  const header = lines[0]!.toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''));
  const teamIdx = header.findIndex(h => h === 'team' || h === 'team name' || h === 'teamname');
  const sportIdx = header.findIndex(h => h === 'sport');
  const playerIdx = header.findIndex(h => h === 'player' || h === 'player name' || h === 'playername');

  if (teamIdx === -1 || sportIdx === -1 || playerIdx === -1) {
    errors.push('CSV must have columns: Team, Sport, Player. Found: ' + header.join(', '));
    return { rows, errors };
  }

  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i]!.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    const teamName = cells[teamIdx]?.trim() || '';
    const sportRaw = cells[sportIdx]?.trim() || '';
    const playerName = cells[playerIdx]?.trim() || '';

    if (!teamName || !sportRaw || !playerName) {
      errors.push(`Row ${i + 1}: Missing required field.`);
      continue;
    }

    // Match sport name (case-insensitive, flexible)
    const matchedSport = sports.find(s => s.toLowerCase() === sportRaw.toLowerCase());
    if (!matchedSport) {
      errors.push(`Row ${i + 1}: Unknown sport "${sportRaw}". Valid: ${sports.join(', ')}`);
      continue;
    }

    rows.push({ teamName, sport: matchedSport, playerName });
  }

  return { rows, errors };
}

export const CSVImport = memo(function CSVImport() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<ParsedRow[] | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ teams: number; players: number } | null>(null);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportResult(null);

    const text = await file.text();
    const { rows, errors } = parseCSV(text);

    setPreview(rows);
    setParseErrors(errors);

    if (rows.length === 0 && errors.length > 0) {
      toast({ title: 'Parse Error', description: errors[0], variant: 'destructive' });
    }
  }, [toast]);

  const handleImport = useCallback(async () => {
    if (!preview || preview.length === 0 || !firestore) return;

    setImporting(true);
    const teamCache = new Map<string, string>(); // "name|sport" → teamId
    let teamsCreated = 0;
    let playersCreated = 0;

    try {
      for (const row of preview) {
        const cacheKey = `${row.teamName}|${row.sport}`;
        let teamId = teamCache.get(cacheKey);

        if (!teamId) {
          const result = await getOrCreateTeam(firestore, row.teamName, row.sport);
          if (!result.success || !result.teamId) {
            toast({ title: 'Error', description: result.error || 'Failed to create team.', variant: 'destructive' });
            continue;
          }
          teamId = result.teamId;
          teamCache.set(cacheKey, teamId);
          teamsCreated++;
        }

        await addPlayerToTeam(firestore, teamId, row.playerName, row.sport);
        playersCreated++;
      }

      setImportResult({ teams: teamsCreated, players: playersCreated });
      setPreview(null);
      toast({
        title: 'Import Complete',
        description: `Created ${teamsCreated} teams and ${playersCreated} players.`,
      });
    } catch (err: any) {
      toast({ title: 'Import Failed', description: err.message, variant: 'destructive' });
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [preview, firestore, toast]);

  const handleDownloadTemplate = useCallback(() => {
    const csv = 'Team,Sport,Player\nTeam Alpha,Football,John Doe\nTeam Alpha,Football,Jane Smith\nTeam Beta,Basketball,Mike Brown\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'teams-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleCancel = useCallback(() => {
    setPreview(null);
    setParseErrors([]);
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  // Unique teams in preview
  const previewTeams = preview
    ? [...new Set(preview.map(r => `${r.teamName} (${r.sport})`))].length
    : 0;

  return (
    <Card className="glass p-4 sm:p-5 bg-white/[0.02] border-white/10">
      <div className="flex items-center gap-2 mb-4">
        <Upload className="h-4 w-4 text-white/40" />
        <h3 className="font-bold text-white/80 text-sm">Import from CSV</h3>
      </div>

      <div className="space-y-4">
        {/* File input + template download */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileSelect}
              className="hidden"
              id="csv-import-input"
            />
            <Button
              variant="outline"
              className="w-full border-white/10 hover:bg-white/10 text-white/70 h-10"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
            >
              <FileText className="h-4 w-4 mr-2" />
              Select CSV File
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white/40 hover:text-white/60 text-xs h-10"
            onClick={handleDownloadTemplate}
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Download Template
          </Button>
        </div>

        {/* Parse Errors */}
        {parseErrors.length > 0 && (
          <div className="space-y-1 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            {parseErrors.slice(0, 5).map((err, i) => (
              <div key={i} className="flex items-start gap-2">
                <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                <span className="text-xs text-red-400">{err}</span>
              </div>
            ))}
            {parseErrors.length > 5 && (
              <p className="text-xs text-red-400/60">... and {parseErrors.length - 5} more errors</p>
            )}
          </div>
        )}

        {/* Preview */}
        {preview && preview.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
                {previewTeams} teams
              </Badge>
              <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                {preview.length} players
              </Badge>
            </div>

            <div className="max-h-48 overflow-y-auto rounded-lg border border-white/10 divide-y divide-white/5">
              {preview.slice(0, 20).map((row, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2 text-xs">
                  <span className="text-white/30 w-5 tabular-nums">{i + 1}</span>
                  <span className="text-white/70 flex-1 truncate">{row.playerName}</span>
                  <span className="text-white/50 truncate">{row.teamName}</span>
                  <Badge variant="outline" className="text-[10px] border-white/10 text-white/40">{row.sport}</Badge>
                </div>
              ))}
              {preview.length > 20 && (
                <div className="px-3 py-2 text-xs text-white/30 text-center">
                  ... {preview.length - 20} more rows
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-10"
                onClick={handleImport}
                disabled={importing}
              >
                {importing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import {preview.length} Players
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="border-white/10 hover:bg-white/10 text-white/60 h-10"
                onClick={handleCancel}
                disabled={importing}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Success result */}
        {importResult && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <span className="text-sm text-green-400">
              Imported {importResult.teams} teams and {importResult.players} players successfully!
            </span>
          </div>
        )}

        {/* Help text */}
        <p className="text-[11px] text-white/25 leading-relaxed">
          CSV format: <code className="text-white/35">Team,Sport,Player</code> — one player per row.
          Duplicate team names in the same sport will be merged.
        </p>
      </div>
    </Card>
  );
});

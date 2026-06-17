'use client';

import Link from 'next/link';
import { Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a2e] via-[#141452] to-[#0a0a2e] flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-white/5 border border-white/10">
            <Trophy className="h-12 w-12 text-amber-400" />
          </div>
        </div>
        <div>
          <h1 className="text-6xl font-bold text-white mb-2">404</h1>
          <h2 className="text-xl font-semibold text-white/80">Page Not Found</h2>
          <p className="text-white/50 mt-2">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <Button asChild variant="outline" className="border-white/20 hover:bg-white/10 text-white">
          <Link href="/overview">Back to Overview</Link>
        </Button>
      </div>
    </div>
  );
}

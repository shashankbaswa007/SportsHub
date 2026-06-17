
"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { useFirebase } from '@/firebase';
import { clearAdminCache } from '@/lib/admin-check';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Home, Settings, LogOut, Flame, ShieldCheck, Users, Trophy } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { motion } from "framer-motion"
import { DataProvider } from '@/lib/data-context';
import { GlobalSearch } from '@/components/global-search';
import { ConnectionBanner } from '@/components/connection-banner';
import { ErrorBoundary } from '@/components/error-boundary';
import { ThemeToggle } from '@/components/theme-toggle';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { auth } = useFirebase();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const user = window.localStorage.getItem('sports-hub-user');
      if (!user) {
        router.replace('/');
        return;
      }
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Sign out error:', e);
    }
    clearAdminCache();
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('sports-hub-user');
      window.localStorage.removeItem('sports-hub-role');
      window.sessionStorage.removeItem('sports-hub-verified-admin');
    }
    router.replace('/');
  };

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-white/5 bg-[#0D0D0D]">
        <SidebarHeader className="p-6 border-b border-white/5">
          <Link href="/overview" className="flex items-center gap-3 group">
            <div className="relative">
              <Flame className="h-9 w-9 text-white/90 group-hover:text-white transition-colors" />
              <div className="absolute inset-0 blur-xl opacity-0 group-hover:opacity-100 transition-opacity bg-orange-500/30" />
            </div>
            <span className="font-headline text-2xl font-black group-data-[collapsible=icon]:hidden text-white/90 group-hover:text-white transition-colors">
              SportsHub
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="px-3 py-6">
          <SidebarMenu className="space-y-2">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith('/overview')}
                tooltip={{ children: 'Overview' }}
                className="group relative px-4 py-3 rounded-lg transition-all duration-300 hover:bg-white/5 data-[active=true]:bg-white/10 data-[active=true]:text-white text-white/60"
              >
                <Link href="/overview" className="flex items-center gap-3">
                  <Home className="h-5 w-5 transition-transform group-hover:scale-110" />
                  <span className="font-medium">Overview</span>
                  {pathname.startsWith('/overview') && (
                    <motion.div 
                      layoutId="activeIndicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-white/80 to-white/40 rounded-r"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith('/teams')}
                tooltip={{ children: 'Teams' }}
                className="group relative px-4 py-3 rounded-lg transition-all duration-300 hover:bg-white/5 data-[active=true]:bg-white/10 data-[active=true]:text-white text-white/60"
              >
                <Link href="/teams" className="flex items-center gap-3">
                  <Users className="h-5 w-5 transition-transform group-hover:scale-110" />
                  <span className="font-medium">Teams</span>
                  {pathname.startsWith('/teams') && (
                    <motion.div 
                      layoutId="activeIndicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-white/80 to-white/40 rounded-r"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith('/leaderboard')}
                tooltip={{ children: 'Leaderboards' }}
                className="group relative px-4 py-3 rounded-lg transition-all duration-300 hover:bg-white/5 data-[active=true]:bg-white/10 data-[active=true]:text-white text-white/60"
              >
                <Link href="/leaderboard" className="flex items-center gap-3">
                  <Trophy className="h-5 w-5 transition-transform group-hover:scale-110" />
                  <span className="font-medium">Leaderboards</span>
                  {pathname.startsWith('/leaderboard') && (
                    <motion.div 
                      layoutId="activeIndicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-white/80 to-white/40 rounded-r"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith('/admin')}
                    tooltip={{ children: 'Admin' }}
                    className="group relative px-4 py-3 rounded-lg transition-all duration-300 hover:bg-white/5 data-[active=true]:bg-white/10 data-[active=true]:text-white text-white/60"
                  >
                    <Link href="/admin" className="flex items-center gap-3">
                      <ShieldCheck className="h-5 w-5 transition-transform group-hover:scale-110" />
                      <span className="font-medium">Admin</span>
                      {pathname.startsWith('/admin') && (
                        <motion.div 
                          layoutId="activeIndicator"
                          className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-white/80 to-white/40 rounded-r"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith('/settings')}
                tooltip={{ children: 'Settings' }}
                className="group relative px-4 py-3 rounded-lg transition-all duration-300 hover:bg-white/5 data-[active=true]:bg-white/10 data-[active=true]:text-white text-white/60"
              >
                <Link href="/settings" className="flex items-center gap-3">
                  <Settings className="h-5 w-5 transition-transform group-hover:scale-110" />
                  <span className="font-medium">Settings</span>
                  {pathname.startsWith('/settings') && (
                    <motion.div 
                      layoutId="activeIndicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-white/80 to-white/40 rounded-r"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-white/5">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={handleLogout} 
                tooltip={{ children: 'Logout' }}
                className="group px-4 py-3 rounded-lg transition-all duration-300 hover:bg-red-500/10 text-white/60 hover:text-red-400"
              >
                <LogOut className="h-5 w-5 transition-transform group-hover:scale-110" />
                <span className="font-medium">Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-background">
        <ConnectionBanner />
        <DataProvider>
        <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center gap-4 border-b border-white/5 bg-[#0D0D0D]/80 backdrop-blur-xl px-3 sm:px-6">
            <SidebarTrigger className="lg:hidden border-white/10 hover:bg-white/5 text-white/80 hover:text-white" />
            <div className="flex-1 flex items-center justify-center lg:justify-start gap-3">
              <span className="font-headline text-lg font-bold text-white/90 lg:hidden">SportsHub</span>
              <GlobalSearch />
            </div>
            <ThemeToggle />
        </header>
        <main className="flex-1 overflow-auto px-3 sm:px-6 py-4 sm:py-8 pb-20 lg:pb-8">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
        </main>
        </DataProvider>
        
        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-white/10 bg-[#0D0D0D]/95 backdrop-blur-xl">
          <div className="flex items-center justify-around px-2 py-3">
            <Link
              href="/overview"
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                pathname.startsWith('/overview')
                  ? 'text-white bg-white/10'
                  : 'text-white/60 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              <Home className="h-5 w-5" />
              <span className="text-xs font-medium">Home</span>
            </Link>
            
            <Link
              href="/teams"
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                pathname.startsWith('/teams')
                  ? 'text-white bg-white/10'
                  : 'text-white/60 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              <Users className="h-5 w-5" />
              <span className="text-xs font-medium">Teams</span>
            </Link>
            
            <Link
              href="/leaderboard"
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                pathname.startsWith('/leaderboard')
                  ? 'text-white bg-white/10'
                  : 'text-white/60 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              <Trophy className="h-5 w-5" />
              <span className="text-xs font-medium">Leaderboard</span>
            </Link>
            
            <Link
                href="/admin"
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                  pathname.startsWith('/admin')
                    ? 'text-white bg-white/10'
                    : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                <ShieldCheck className="h-5 w-5" />
                <span className="text-xs font-medium">Admin</span>
              </Link>
            
            <Link
              href="/settings"
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                pathname.startsWith('/settings')
                  ? 'text-white bg-white/10'
                  : 'text-white/60 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              <Settings className="h-5 w-5" />
              <span className="text-xs font-medium">Settings</span>
            </Link>
          </div>
        </nav>
      </SidebarInset>
    </SidebarProvider>
  );
}

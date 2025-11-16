
"use client";

import { sports } from '@/lib/data-client';
import { SportIcon } from '@/components/sport-icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Force dynamic rendering to prevent build-time errors with Firebase
export const dynamic = 'force-dynamic';
import { User, Loader2, Users, Trophy } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { Team, Player } from '@/lib/types';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2
        }
    }
};

const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" }
    }
};

const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
        opacity: 1, 
        scale: 1,
        transition: { duration: 0.4, ease: "easeOut" }
    }
};

// Sport accent colors matching match-card.tsx
const sportAccents: Record<string, { 
    border: string; 
    glow: string; 
    text: string;
    bg: string;
}> = {
    'Football': { border: 'border-emerald-500/40', glow: 'shadow-[0_0_25px_rgba(16,185,129,0.2)]', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    'Basketball': { border: 'border-orange-500/40', glow: 'shadow-[0_0_25px_rgba(249,115,22,0.2)]', text: 'text-orange-400', bg: 'bg-orange-500/10' },
    'Volleyball': { border: 'border-yellow-500/40', glow: 'shadow-[0_0_25px_rgba(234,179,8,0.2)]', text: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    'Cricket': { border: 'border-blue-500/40', glow: 'shadow-[0_0_25px_rgba(59,130,246,0.2)]', text: 'text-blue-400', bg: 'bg-blue-500/10' },
    'Throwball': { border: 'border-purple-500/40', glow: 'shadow-[0_0_25px_rgba(168,85,247,0.2)]', text: 'text-purple-400', bg: 'bg-purple-500/10' },
    'Badminton (Singles)': { border: 'border-rose-500/40', glow: 'shadow-[0_0_25px_rgba(244,63,94,0.2)]', text: 'text-rose-400', bg: 'bg-rose-500/10' },
    'Badminton (Doubles)': { border: 'border-rose-500/40', glow: 'shadow-[0_0_25px_rgba(244,63,94,0.2)]', text: 'text-rose-400', bg: 'bg-rose-500/10' },
    'Table Tennis (Singles)': { border: 'border-pink-500/40', glow: 'shadow-[0_0_25px_rgba(236,72,153,0.2)]', text: 'text-pink-400', bg: 'bg-pink-500/10' },
    'Table Tennis (Doubles)': { border: 'border-pink-500/40', glow: 'shadow-[0_0_25px_rgba(236,72,153,0.2)]', text: 'text-pink-400', bg: 'bg-pink-500/10' },
    'Kabaddi': { border: 'border-amber-500/40', glow: 'shadow-[0_0_25px_rgba(245,158,11,0.2)]', text: 'text-amber-400', bg: 'bg-amber-500/10' },
};

export default function TeamsPage() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const firestore = useFirestore();

    useEffect(() => {
        const unsubTeams = onSnapshot(collection(firestore, "teams"), (snap) => {
            setTeams(snap.docs.map(doc => ({id: doc.id, ...doc.data() as Omit<Team, 'id'>})));
            setLoading(false);
        });
        const unsubPlayers = onSnapshot(collection(firestore, "players"), (snap) => {
            setPlayers(snap.docs.map(doc => ({id: doc.id, ...doc.data() as Omit<Player, 'id'>})));
        });

        return () => {
            unsubTeams();
            unsubPlayers();
        };
    }, [firestore]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-10 w-10 animate-spin text-white/20" />
            </div>
        );
    }

    return (
        <motion.div 
            className="space-y-10"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Premium Header */}
            <motion.header variants={sectionVariants} className="relative">
                <div className="absolute -top-4 -left-4 w-24 sm:w-32 h-24 sm:h-32 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="relative space-y-3 sm:space-y-4">
                    <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-gradient">
                        Teams & Players
                    </h1>
                    <p className="text-white/60 text-sm sm:text-base lg:text-lg max-w-2xl">
                        Explore all competing teams and their rosters organized by sport
                    </p>

                    {/* Stats Summary */}
                    <div className="flex flex-wrap gap-2 sm:gap-4 pt-3 sm:pt-4">
                        <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white/5 border border-white/10">
                            <Trophy className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-yellow-400" />
                            <span className="text-xs sm:text-sm text-white/70">{sports.length} Sports</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white/5 border border-white/10">
                            <Users className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-blue-400" />
                            <span className="text-xs sm:text-sm text-white/70">{teams.length} Teams</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white/5 border border-white/10">
                            <User className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-green-400" />
                            <span className="text-xs sm:text-sm text-white/70">{players.length} Players</span>
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* Teams Grid by Sport */}
            <div className="space-y-8 sm:space-y-12">
                <AnimatePresence>
                    {sports.map((sport) => {
                        const sportTeams = teams.filter(t => t.sport === sport);
                        if (sportTeams.length === 0) return null;

                        const accent = (sportAccents[sport] || sportAccents['Football'])!;

                        return (
                            <motion.section 
                                key={sport}
                                variants={sectionVariants}
                                className="space-y-4 sm:space-y-6"
                            >
                                {/* Sport Header with Accent */}
                                <div className={`flex items-center gap-2 sm:gap-4 pb-3 sm:pb-4 border-b ${accent.border.replace('border-', 'border-b-')}`}>
                                    <div className={`p-2 sm:p-3 rounded-xl ${accent.bg} border-2 ${accent.border}`}>
                                        <SportIcon sport={sport} className={`h-5 sm:h-6 lg:h-7 w-5 sm:w-6 lg:w-7 ${accent.text}`} />
                                    </div>
                                    <div>
                                        <h2 className={`font-headline text-xl sm:text-2xl lg:text-3xl font-black ${accent.text}`}>{sport}</h2>
                                        <p className="text-white/50 text-xs sm:text-sm">{sportTeams.length} team{sportTeams.length !== 1 ? 's' : ''} competing</p>
                                    </div>
                                </div>

                                {/* Teams Grid */}
                                <motion.div 
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                                    variants={containerVariants}
                                >
                                    {sportTeams.map((team, idx) => {
                                        const teamPlayers = players.filter(p => p.teamId === team.id);
                                        return (
                                            <motion.div
                                                key={team.id}
                                                variants={cardVariants}
                                                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                            >
                                                <Card className={`
                                                    glass border-2 ${accent.border}
                                                    hover:${accent.glow}
                                                    transition-all duration-300
                                                    h-full
                                                    group
                                                    overflow-hidden
                                                `}>
                                                    {/* Top accent line */}
                                                    <div className={`h-1 ${accent.bg} opacity-60`} />
                                                    
                                                    <CardHeader className="p-3 sm:p-4 pb-3 sm:pb-4">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <CardTitle className="font-headline text-lg sm:text-xl lg:text-2xl font-bold text-white/95 group-hover:text-white transition-colors">
                                                                {team.name}
                                                            </CardTitle>
                                                            <div className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full ${accent.bg} border ${accent.border} shrink-0`}>
                                                                <span className={`text-xs font-bold ${accent.text}`}>
                                                                    {teamPlayers.length}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </CardHeader>
                                                    
                                                    <CardContent className="p-3 sm:p-4 pt-0">
                                                        {teamPlayers.length > 0 ? (
                                                            <ul className="space-y-2 sm:space-y-3">
                                                                {teamPlayers.map(player => (
                                                                    <motion.li 
                                                                        key={player.id} 
                                                                        className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all group/player"
                                                                        whileHover={{ x: 4 }}
                                                                    >
                                                                        <div className={`p-1 sm:p-1.5 rounded-lg ${accent.bg} border ${accent.border} group-hover/player:scale-110 transition-transform`}>
                                                                            <User className={`h-3.5 sm:h-4 w-3.5 sm:w-4 ${accent.text}`} />
                                                                        </div>
                                                                        <span className="font-medium text-white/90 group-hover/player:text-white transition-colors text-sm sm:text-base">
                                                                            {player.name}
                                                                        </span>
                                                                    </motion.li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-white/40">
                                                                <Users className="h-10 sm:h-12 w-10 sm:w-12 mb-2 sm:mb-3 opacity-20" />
                                                                <p className="text-sm">No players listed</p>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            </motion.section>
                        );
                    })}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

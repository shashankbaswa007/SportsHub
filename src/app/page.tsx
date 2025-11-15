
"use client";

import { AuthForm } from "@/components/auth-form";
import { Flame } from "lucide-react";
import { motion } from "framer-motion";

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

const contentVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
  visible: { 
    opacity: 1, 
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, delay: 0.2, ease: "easeOut" }
  }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.98, filter: "blur(8px)" },
  visible: { 
    opacity: 1, 
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.6, delay: 0.4, ease: "easeOut" }
  }
};

export default function AuthenticationPage() {
  return (
    <motion.main 
      className="relative flex min-h-screen items-center justify-center p-6 overflow-hidden" 
      style={{ background: '#0C0C0C' }}
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary Orb - Top Left */}
        <motion.div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
            filter: 'blur(60px)'
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Secondary Orb - Bottom Right */}
        <motion.div
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)',
            filter: 'blur(60px)'
          }}
          animate={{
            x: [0, -30, 0],
            y: [0, -50, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Tertiary Orb - Center */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, transparent 70%)',
            filter: 'blur(80px)'
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Subtle Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%)'
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left: Minimalistic Branding */}
        <motion.div 
          className="space-y-8 px-8"
          variants={contentVariants}
        >
          {/* Logo & Title */}
          <div className="space-y-6">
            <motion.div 
              className="inline-flex items-center gap-5 p-5 rounded-2xl glass border border-white/10"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative">
                <Flame className="h-14 w-14 text-white" />
                <div className="absolute inset-0 blur-lg bg-white/30" />
              </div>
              <div>
                <h1 className="font-headline text-6xl font-black tracking-tight text-gradient">
                  SportsHub
                </h1>
                <p className="text-base text-white/60 font-light">Central</p>
              </div>
            </motion.div>

            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-white/90 leading-tight">
                Welcome Back
              </h2>
              <p className="text-white/50 text-lg leading-relaxed max-w-md">
                Sign in to access live matches, analytics, and tournament management.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right: Premium Auth Card with Enhanced Glassmorphism */}
        <motion.div 
          className="flex items-center justify-center px-8"
          variants={cardVariants}
        >
        <div className="relative w-full max-w-md">

          {/* Multiple layered gradient glows for maximum shine */}
          <div className="absolute -inset-8 rounded-3xl bg-gradient-to-br from-white/25 via-white/10 to-white/20 blur-3xl opacity-60 animate-pulse" 
               style={{ animationDuration: '3s' }} />
          
          <div className="absolute -inset-6 rounded-3xl bg-gradient-to-tr from-white/30 via-transparent to-white/30 blur-2xl opacity-70" />
          
          <div className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-white/20 via-white/5 to-white/15 blur-xl opacity-80" />

          {/* Spotlight effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/10 via-transparent to-transparent opacity-40" />

          <div className="relative rounded-2xl border-2 border-white/20
                          bg-gradient-to-br from-white/10 via-white/5 to-white/8 backdrop-blur-xl
                          shadow-[0_0_80px_rgba(255,255,255,0.15),0_0_40px_rgba(255,255,255,0.1)]
                          p-6">
            <AuthForm />
          </div>
        </div>
        </motion.div>
      </div>
    </motion.main>
  );
}

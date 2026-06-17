"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, ChevronLeft, Compass, Sparkles, PlusCircle, Trophy, Users, Edit, Trash2, UserPlus, Filter, MapPin, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TourStep {
  /** CSS selector for the target element to highlight */
  target: string;
  /** Title of this tour step */
  title: string;
  /** Description text */
  description: string;
  /** Icon component to show next to the title */
  icon?: React.ReactNode;
  /** Preferred tooltip position relative to target */
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    target: '[data-tour="welcome"]',
    title: 'Welcome to Admin Dashboard',
    description:
      'This is your control center for managing the entire SportsHub tournament. Here you can create matches, manage teams, and handle player rosters. Let\'s walk through each section.',
    icon: <Sparkles className="h-5 w-5 text-amber-400" />,
    position: 'bottom',
  },
  {
    target: '[data-tour="create-match"]',
    title: 'Create New Match',
    description:
      'Use this form to schedule new matches. Select a sport first, then pick or create teams using the smart search — just start typing a team name. Set the match status, date/time, and venue.',
    icon: <PlusCircle className="h-5 w-5 text-emerald-400" />,
    position: 'bottom',
  },
  {
    target: '[data-tour="create-match-teams"]',
    title: 'Smart Team Selection',
    description:
      'The team fields support both selection and creation. Type an existing team name to select it, or enter a new name to create a team on the fly. Teams are scoped per sport.',
    icon: <Users className="h-5 w-5 text-blue-400" />,
    position: 'bottom',
  },
  {
    target: '[data-tour="manage-matches"]',
    title: 'Manage Existing Matches',
    description:
      'View and manage all scheduled matches here. You can filter by sport using the filter buttons, edit match status inline, or delete matches. Click on a match card to navigate to its detail page for live scoring.',
    icon: <Trophy className="h-5 w-5 text-yellow-400" />,
    position: 'top',
  },
  {
    target: '[data-tour="match-actions"]',
    title: 'Match Actions',
    description:
      'Each match card shows the current score and status. Use the pencil icon to edit match status inline, or the trash icon to permanently delete a match. Click the match card itself to go to the match detail page where you can update player stats and set scores.',
    icon: <Edit className="h-5 w-5 text-orange-400" />,
    position: 'top',
  },
  {
    target: '[data-tour="manage-teams"]',
    title: 'Manage Teams & Players',
    description:
      'This section lists all teams grouped by sport. You can rename players, remove them, delete entire teams, or add new players. Use the sport filter to narrow down the view.',
    icon: <Users className="h-5 w-5 text-purple-400" />,
    position: 'top',
  },
  {
    target: '[data-tour="team-players"]',
    title: 'Player Management',
    description:
      'Each team card shows its roster. Click the pencil icon next to a player to rename them, or the red icon to remove them. Use the "Add Player" button at the bottom to add new players to any team.',
    icon: <UserPlus className="h-5 w-5 text-cyan-400" />,
    position: 'top',
  },
];

const STORAGE_KEY = 'sports-hub-admin-tour-completed';

interface AdminTourProps {
  /** Whether to auto-start the tour for first-time admins */
  autoStart?: boolean;
  /** Callback when tour is completed or dismissed */
  onComplete?: () => void;
}

export function AdminTour({ autoStart = true, onComplete }: AdminTourProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-start tour if never completed
  useEffect(() => {
    if (autoStart && mounted) {
      const completed = localStorage.getItem(STORAGE_KEY);
      if (!completed) {
        // Delay slightly to let the page render
        const timer = setTimeout(() => setIsActive(true), 800);
        return () => clearTimeout(timer);
      }
    }
    return undefined;
  }, [autoStart, mounted]);

  const updateTargetRect = useCallback(() => {
    if (!isActive) return;
    const step = TOUR_STEPS[currentStep];
    if (!step) return;
    const el = document.querySelector(step.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [isActive, currentStep]);

  // Observe target element and update rect on changes
  useEffect(() => {
    if (!isActive) return undefined;

    updateTargetRect();

    const step = TOUR_STEPS[currentStep];
    if (!step) return undefined;
    const el = document.querySelector(step.target);

    // Scroll element into view
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Re-measure after scroll
      const timer = setTimeout(updateTargetRect, 400);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isActive, currentStep, updateTargetRect]);

  // Handle window resize/scroll
  useEffect(() => {
    if (!isActive) return;

    const handler = () => updateTargetRect();
    window.addEventListener('resize', handler);
    window.addEventListener('scroll', handler, true);
    return () => {
      window.removeEventListener('resize', handler);
      window.removeEventListener('scroll', handler, true);
    };
  }, [isActive, updateTargetRect]);

  const endTour = useCallback((markComplete: boolean) => {
    setIsActive(false);
    setCurrentStep(0);
    setTargetRect(null);
    if (markComplete) {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
    onComplete?.();
  }, [onComplete]);

  const nextStep = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      endTour(true);
    }
  }, [currentStep, endTour]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') endTour(false);
      if (e.key === 'ArrowRight' || e.key === 'Enter') nextStep();
      if (e.key === 'ArrowLeft') prevStep();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isActive, endTour, nextStep, prevStep]);

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const step = TOUR_STEPS[currentStep] as TourStep | undefined;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  // Calculate tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    if (!targetRect || !step) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' } as React.CSSProperties;

    const padding = 16;
    const tooltipWidth = 400;
    const tooltipHeight = 240;
    const pos = step.position || 'bottom';
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    let top = 0;
    let left = 0;

    switch (pos) {
      case 'bottom':
        top = targetRect.bottom + padding;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case 'top':
        top = targetRect.top - tooltipHeight - padding;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.left - tooltipWidth - padding;
        break;
      case 'right':
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.right + padding;
        break;
    }

    // Clamp to viewport
    if (left < padding) left = padding;
    if (left + tooltipWidth > viewportW - padding) left = viewportW - tooltipWidth - padding;
    if (top < padding) top = padding;
    if (top + tooltipHeight > viewportH - padding) {
      // Flip to top if can't fit at bottom
      top = targetRect.top - tooltipHeight - padding;
      if (top < padding) top = padding;
    }

    return { top, left, position: 'fixed' };
  };

  // "Take a Tour" trigger button
  const TriggerButton = (
    <Button
      onClick={startTour}
      variant="outline"
      size="sm"
      className="gap-2 border-white/10 hover:bg-white/10 hover:border-white/20 text-white/70 hover:text-white transition-all"
    >
      <Compass className="h-4 w-4" />
      <span>Take a Tour</span>
    </Button>
  );

  if (!mounted) return TriggerButton;

  const overlay = isActive && step
    ? createPortal(
        <AnimatePresence>
          {isActive && (
            <>
              {/* Backdrop overlay with hole cutout via clip-path */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-[9998]"
                style={{
                  background: 'rgba(0, 0, 0, 0.7)',
                  ...(targetRect
                    ? {
                        clipPath: `polygon(
                          0% 0%, 0% 100%, 
                          ${targetRect.left - 8}px 100%, 
                          ${targetRect.left - 8}px ${targetRect.top - 8}px, 
                          ${targetRect.right + 8}px ${targetRect.top - 8}px, 
                          ${targetRect.right + 8}px ${targetRect.bottom + 8}px, 
                          ${targetRect.left - 8}px ${targetRect.bottom + 8}px, 
                          ${targetRect.left - 8}px 100%, 
                          100% 100%, 100% 0%
                        )`,
                      }
                    : {}),
                }}
                onClick={() => endTour(false)}
              />

              {/* Highlight ring around target */}
              {targetRect && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="fixed z-[9999] pointer-events-none rounded-xl"
                  style={{
                    top: targetRect.top - 8,
                    left: targetRect.left - 8,
                    width: targetRect.width + 16,
                    height: targetRect.height + 16,
                    boxShadow:
                      '0 0 0 2px rgba(168, 85, 247, 0.5), 0 0 20px rgba(168, 85, 247, 0.15), 0 0 40px rgba(168, 85, 247, 0.05)',
                    border: '2px solid rgba(168, 85, 247, 0.4)',
                  }}
                />
              )}

              {/* Tooltip card */}
              <motion.div
                ref={tooltipRef}
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.25, delay: 0.1 }}
                className="fixed z-[10000] w-[min(400px,calc(100vw-32px))]"
                style={getTooltipStyle()}
                onClick={e => e.stopPropagation()}
              >
                <div className="rounded-xl border border-white/15 bg-[#1a1a1a]/95 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden">
                  {/* Progress bar */}
                  <div className="h-1 bg-white/5">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%`,
                      }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                  </div>

                  <div className="p-5">
                    {/* Step indicator */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {step.icon}
                        <span className="text-xs font-semibold tracking-widest text-white/40 uppercase">
                          Step {currentStep + 1} of {TOUR_STEPS.length}
                        </span>
                      </div>
                      <button
                        onClick={() => endTour(false)}
                        className="p-1 rounded-md hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
                        aria-label="Close tour"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-white/90 mb-2 font-headline">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-white/60 leading-relaxed mb-5">
                      {step.description}
                    </p>

                    {/* Navigation */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => endTour(false)}
                        className="text-xs text-white/30 hover:text-white/60 transition-colors font-medium"
                      >
                        Skip Tour
                      </button>

                      <div className="flex items-center gap-2">
                        {/* Dot indicators */}
                        <div className="flex items-center gap-1 mr-3">
                          {TOUR_STEPS.map((_, i) => (
                            <div
                              key={i}
                              className={`h-1.5 rounded-full transition-all duration-300 ${
                                i === currentStep
                                  ? 'w-4 bg-purple-400'
                                  : i < currentStep
                                  ? 'w-1.5 bg-white/30'
                                  : 'w-1.5 bg-white/10'
                              }`}
                            />
                          ))}
                        </div>

                        {!isFirstStep && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={prevStep}
                            className="h-8 px-3 text-white/60 hover:text-white hover:bg-white/10"
                          >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back
                          </Button>
                        )}

                        <Button
                          size="sm"
                          onClick={nextStep}
                          className="h-8 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold shadow-lg shadow-purple-500/20"
                        >
                          {isLastStep ? (
                            'Finish'
                          ) : (
                            <>
                              Next
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )
    : null;

  return (
    <>
      {TriggerButton}
      {overlay}
    </>
  );
}

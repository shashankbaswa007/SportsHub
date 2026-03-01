'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  collection, query, where, getDocs, doc, updateDoc, addDoc, setDoc,
  serverTimestamp, deleteDoc,
} from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import { useFirebase, useFirestore } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Shield, Loader2, CheckCircle2, XCircle, Chrome, Mail, ArrowLeft, PartyPopper, Clock,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface InviteData {
  id: string;
  email: string;
  name?: string;
  invitedBy: string;
  invitedByName?: string;
  status: 'pending' | 'accepted' | 'expired';
  token: string;
  expiresAt: string;
}

export default function InviteAcceptPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { auth } = useFirebase();
  const firestore = useFirestore();
  const { toast } = useToast();

  const token = searchParams.get('token');

  const [invite, setInvite] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);

  // Look up the invite by token
  useEffect(() => {
    if (!token || !firestore) {
      setError('Invalid invite link. No token provided.');
      setLoading(false);
      return;
    }

    const lookupInvite = async () => {
      try {
        const q = query(
          collection(firestore, 'admin_invites'),
          where('token', '==', token),
        );
        const snap = await getDocs(q);

        if (snap.empty) {
          setError('This invite link is invalid or has been cancelled.');
          setLoading(false);
          return;
        }

        const docSnap = snap.docs[0]!;
        const data = docSnap.data() as Omit<InviteData, 'id'>;
        const inviteData: InviteData = { id: docSnap.id, ...data };

        // Check if already accepted
        if (inviteData.status === 'accepted') {
          setAccepted(true);
          setInvite(inviteData);
          setLoading(false);
          return;
        }

        // Check expiry
        if (inviteData.expiresAt && new Date(inviteData.expiresAt) < new Date()) {
          setError('This invite has expired. Please ask the admin to send a new invitation.');
          setLoading(false);
          return;
        }

        if (inviteData.status !== 'pending') {
          setError('This invite is no longer valid.');
          setLoading(false);
          return;
        }

        setInvite(inviteData);
      } catch (err) {
        console.error('Failed to look up invite:', err);
        setError('Failed to load invite. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    lookupInvite();
  }, [token, firestore]);

  const handleAccept = async () => {
    if (!invite || !firestore || !auth.currentUser) {
      // If not logged in, redirect to login
      if (!auth.currentUser) {
        toast({
          variant: 'destructive',
          title: 'Not Logged In',
          description: 'Please log in with your College ID first, then come back to this link.',
        });
        router.push('/');
        return;
      }
      return;
    }

    setAccepting(true);

    try {
      // Use a secondary Firebase Auth instance to verify Google identity
      // without disrupting the College ID session
      const secondaryApp = getApps().find(a => a.name === 'invite-verify')
        || initializeApp(firebaseConfig, 'invite-verify');
      const secondaryAuth = getAuth(secondaryApp);

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(secondaryAuth, provider);
      const googleEmail = result.user.email?.toLowerCase();

      // Sign out of secondary instance immediately
      await secondaryAuth.signOut();

      if (!googleEmail) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not get email from Google account.' });
        setAccepting(false);
        return;
      }

      // Verify the Google email matches the invited email
      if (googleEmail !== invite.email.toLowerCase()) {
        toast({
          variant: 'destructive',
          title: 'Email Mismatch',
          description: `This invite is for ${invite.email}, but you signed in with ${googleEmail}. Please use the correct Google account.`,
        });
        setAccepting(false);
        return;
      }

      // Accept the invite: add to admin_emails + admin_emails_lookup
      await addDoc(collection(firestore, 'admin_emails'), {
        email: googleEmail,
        name: invite.name || googleEmail.split('@')[0],
        addedBy: invite.invitedBy,
        addedAt: serverTimestamp(),
      });

      await setDoc(doc(firestore, 'admin_emails_lookup', googleEmail), {
        addedBy: invite.invitedBy,
        addedAt: serverTimestamp(),
      });

      // Mark the invite as accepted
      await updateDoc(doc(firestore, 'admin_invites', invite.id), {
        status: 'accepted',
        acceptedAt: serverTimestamp(),
      });

      // Store verified admin email in session
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('sports-hub-verified-admin', googleEmail);
      }

      setAccepted(true);
      toast({
        title: 'Welcome, Admin!',
        description: `You now have admin access as ${googleEmail}.`,
      });
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        // User closed popup, do nothing
      } else {
        console.error('Accept invite error:', err);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to accept invite. Please try again.' });
      }
    } finally {
      setAccepting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-amber-400 mx-auto" />
          <p className="text-white/50 text-sm">Loading invite...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <Card className="glass-strong border-red-500/20 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500/50 to-red-600/50" />
            <CardContent className="p-8 text-center space-y-4">
              <div className="p-4 rounded-full bg-red-500/10 w-fit mx-auto">
                <XCircle className="h-10 w-10 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white/90">Invalid Invite</h2>
              <p className="text-white/50 text-sm">{error}</p>
              <Button asChild variant="outline" className="border-white/10 hover:bg-white/10 gap-2">
                <Link href="/overview">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Overview
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Already accepted
  if (accepted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="max-w-md w-full"
        >
          <Card className="glass-strong border-green-500/20 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-green-500/50 to-emerald-500/50" />
            <CardContent className="p-8 text-center space-y-4">
              <div className="p-4 rounded-full bg-green-500/10 w-fit mx-auto">
                <PartyPopper className="h-10 w-10 text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-white/90">Invite Accepted!</h2>
              <p className="text-white/50 text-sm">
                You now have admin access. Head to the admin panel to manage the tournament.
              </p>
              <div className="flex gap-3 justify-center">
                <Button asChild className="bg-amber-600 hover:bg-amber-500 gap-2">
                  <Link href="/admin">
                    <Shield className="h-4 w-4" />
                    Go to Admin Panel
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Pending invite — show accept UI
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <Card className="glass-strong border-amber-500/20 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500/50 via-orange-500/50 to-red-500/50" />
          <CardHeader className="text-center pb-2 space-y-3">
            <div className="p-4 rounded-full bg-amber-500/10 w-fit mx-auto">
              <Mail className="h-10 w-10 text-amber-400" />
            </div>
            <CardTitle className="font-headline text-2xl font-bold text-white/95">
              Admin Invitation
            </CardTitle>
            <CardDescription className="text-white/50 text-sm">
              {invite?.invitedByName || invite?.invitedBy} has invited you to become an admin on CBIT SportsHub
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-2 space-y-6">
            {/* Invite details */}
            <div className="bg-white/[0.03] rounded-lg p-4 space-y-3 border border-white/5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/40">Invited Email</span>
                <span className="text-white/80 font-medium">{invite?.email}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/40">Invited By</span>
                <span className="text-white/60">{invite?.invitedByName || invite?.invitedBy}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/40">Status</span>
                <Badge variant="outline" className="text-[10px] border-yellow-500/30 text-yellow-400 gap-1">
                  <Clock className="h-3 w-3" />
                  Pending
                </Badge>
              </div>
            </div>

            {/* Accept instructions */}
            <div className="text-center space-y-2">
              <p className="text-xs text-white/40">
                To accept, verify your identity by signing in with your Google account ({invite?.email}).
              </p>
            </div>

            {/* Accept Button */}
            <Button
              onClick={handleAccept}
              disabled={accepting}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white gap-2 py-6 text-base"
            >
              {accepting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Chrome className="h-5 w-5" />
              )}
              {accepting ? 'Verifying...' : 'Accept with Google'}
            </Button>

            <Button asChild variant="ghost" className="w-full text-white/30 hover:text-white/50">
              <Link href="/overview">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to overview
              </Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

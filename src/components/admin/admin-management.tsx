'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import {
  collection, addDoc, deleteDoc, doc, setDoc, onSnapshot,
  serverTimestamp, query, where, getDocs,
} from 'firebase/firestore';
import { useFirestore, useFirebase } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Shield, Trash2, Mail, Loader2, UserPlus, Crown, Clock, Send, CheckCircle2, XCircle,
} from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AdminEntry {
  id: string;
  email: string;
  name?: string;
  addedBy: string;
  addedAt: unknown;
}

interface InviteEntry {
  id: string;
  email: string;
  name?: string;
  invitedBy: string;
  invitedByName?: string;
  status: 'pending' | 'accepted' | 'expired';
  token: string;
  createdAt: unknown;
  expiresAt: unknown;
}

function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  for (let i = 0; i < 32; i++) {
    token += chars[array[i]! % chars.length];
  }
  return token;
}

function getAppBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'https://shruti-sports-hub.web.app';
}

export const AdminManagement = memo(function AdminManagement() {
  const firestore = useFirestore();
  const { auth } = useFirebase();
  const { toast } = useToast();
  const [admins, setAdmins] = useState<AdminEntry[]>([]);
  const [invites, setInvites] = useState<InviteEntry[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // The current user's linked/verified Google email
  const currentGoogleEmail =
    auth.currentUser?.providerData.find((p) => p.providerId === 'google.com')?.email
    ?? (typeof window !== 'undefined' ? window.sessionStorage.getItem('sports-hub-verified-admin') : null)
    ?? auth.currentUser?.email
    ?? '';

  // Listen to admin_emails collection
  useEffect(() => {
    if (!firestore) return;
    const unsub = onSnapshot(
      collection(firestore, 'admin_emails'),
      (snap) => {
        const list: AdminEntry[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<AdminEntry, 'id'>),
        }));
        setAdmins(list.sort((a, b) => a.email.localeCompare(b.email)));
      },
      (error) => console.error('Failed to load admin list:', error),
    );
    return unsub;
  }, [firestore]);

  // Listen to admin_invites collection
  useEffect(() => {
    if (!firestore) return;
    const unsub = onSnapshot(
      collection(firestore, 'admin_invites'),
      (snap) => {
        const list: InviteEntry[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<InviteEntry, 'id'>),
        }));
        setInvites(list.sort((a, b) => {
          const order = { pending: 0, accepted: 1, expired: 2 };
          return (order[a.status] ?? 3) - (order[b.status] ?? 3);
        }));
      },
      (error) => console.error('Failed to load invites:', error),
    );
    return unsub;
  }, [firestore]);

  const handleInvite = useCallback(async () => {
    if (!firestore) return;
    const email = newEmail.trim().toLowerCase();

    if (!email || !email.endsWith('@gmail.com')) {
      toast({ variant: 'destructive', title: 'Invalid Email', description: 'Please enter a valid Gmail address.' });
      return;
    }

    if (admins.some((a) => a.email === email)) {
      toast({ variant: 'destructive', title: 'Already an Admin', description: `${email} is already an admin.` });
      return;
    }

    if (invites.some((i) => i.email === email && i.status === 'pending')) {
      toast({ variant: 'destructive', title: 'Already Invited', description: `A pending invite already exists for ${email}.` });
      return;
    }

    setIsInviting(true);
    try {
      const token = generateToken();
      const name = newName.trim() || email.split('@')[0];
      const inviterName =
        auth.currentUser?.displayName
        || currentGoogleEmail.split('@')[0]
        || 'Admin';

      await addDoc(collection(firestore, 'admin_invites'), {
        email,
        name,
        invitedBy: currentGoogleEmail,
        invitedByName: inviterName,
        status: 'pending',
        token,
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });

      const inviteUrl = `${getAppBaseUrl()}/admin/invite?token=${token}`;

      const subject = encodeURIComponent(`You're invited to be an admin on CBIT SportsHub`);
      const body = encodeURIComponent(
        `Hi ${name},\n\n` +
        `${inviterName} has invited you to become an admin on CBIT SportsHub.\n\n` +
        `Click the link below to accept the invitation:\n` +
        `${inviteUrl}\n\n` +
        `This invite expires in 7 days.\n\n` +
        `— CBIT SportsHub Team`
      );

      const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(email)}&su=${subject}&body=${body}`;
      window.open(gmailUrl, '_blank');

      toast({
        title: 'Invite Created',
        description: `Gmail compose opened for ${email}. Send the email to complete the invitation.`,
      });
      setNewEmail('');
      setNewName('');
    } catch (error) {
      console.error('Failed to create invite:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to create invite. Please try again.' });
    } finally {
      setIsInviting(false);
    }
  }, [firestore, newEmail, newName, admins, invites, currentGoogleEmail, auth.currentUser, toast]);

  const handleCancelInvite = useCallback(async (id: string, email: string) => {
    if (!firestore) return;
    setCancellingId(id);
    try {
      await deleteDoc(doc(firestore, 'admin_invites', id));
      toast({ title: 'Invite Cancelled', description: `Invitation for ${email} has been cancelled.` });
    } catch (error) {
      console.error('Failed to cancel invite:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to cancel invite.' });
    } finally {
      setCancellingId(null);
    }
  }, [firestore, toast]);

  const handleRevoke = useCallback(async (id: string, email: string) => {
    if (!firestore) return;

    if (email === currentGoogleEmail?.toLowerCase()) {
      toast({ variant: 'destructive', title: 'Cannot Remove Yourself', description: 'You cannot revoke your own admin access.' });
      return;
    }

    setDeletingId(id);
    try {
      await deleteDoc(doc(firestore, 'admin_emails', id));
      await deleteDoc(doc(firestore, 'admin_emails_lookup', email.toLowerCase()));
      toast({ title: 'Admin Removed', description: `${email} no longer has admin access.` });
    } catch (error) {
      console.error('Failed to remove admin:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to remove admin.' });
    } finally {
      setDeletingId(null);
    }
  }, [firestore, currentGoogleEmail, toast]);

  const pendingInvites = invites.filter((i) => i.status === 'pending');

  return (
    <Card className="glass-strong border-white/10 hover:border-white/20 transition-all overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500/50 via-orange-500/50 to-red-500/50" />
      <CardHeader className="pb-4 space-y-2 p-4 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Shield className="h-4 sm:h-5 w-4 sm:w-5 text-amber-400" />
          </div>
          <CardTitle className="font-headline text-xl sm:text-2xl font-bold text-white/95">Admin Management</CardTitle>
          <Badge variant="secondary" className="text-[10px] ml-auto bg-white/5 text-white/50">
            {admins.length} admin{admins.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        <CardDescription className="text-white/50 text-xs sm:text-sm">
          Send email invitations to grant admin access. Invitees will receive a Gmail with an accept link.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
        {/* Invite Form */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="Gmail address"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 flex-1"
            type="email"
          />
          <Input
            placeholder="Name (optional)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 sm:w-40"
          />
          <Button
            onClick={handleInvite}
            disabled={isInviting || !newEmail.trim()}
            className="bg-amber-600 hover:bg-amber-500 gap-1.5 shrink-0"
          >
            {isInviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send Invite
          </Button>
        </div>

        {/* Tabs: Current Admins & Pending Invites */}
        <Tabs defaultValue="admins" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10">
            <TabsTrigger value="admins" className="data-[state=active]:bg-white/10 text-xs sm:text-sm">
              Active Admins ({admins.length})
            </TabsTrigger>
            <TabsTrigger value="invites" className="data-[state=active]:bg-white/10 text-xs sm:text-sm relative">
              Invitations ({invites.length})
              {pendingInvites.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-[9px] text-black font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {pendingInvites.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Active Admins Tab */}
          <TabsContent value="admins" className="mt-3 space-y-2">
            {admins.length === 0 ? (
              <div className="text-center py-8 text-white/20 text-sm">
                <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No admins configured yet. Send an invite above.
              </div>
            ) : (
              admins.map((admin) => (
                <div
                  key={admin.id}
                  className={`flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all ${
                    deletingId === admin.id ? 'opacity-50' : ''
                  }`}
                >
                  <div className="p-2 rounded-full bg-amber-500/10 shrink-0">
                    <Mail className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/80 truncate">
                      {admin.name || admin.email.split('@')[0]}
                    </p>
                    <p className="text-xs text-white/30 truncate">{admin.email}</p>
                  </div>

                  {admin.email === currentGoogleEmail?.toLowerCase() ? (
                    <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400 shrink-0 gap-1">
                      <Crown className="h-3 w-3" />
                      You
                    </Badge>
                  ) : (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 hover:bg-red-500/10 text-white/30 hover:text-red-400 shrink-0"
                          disabled={deletingId === admin.id}
                        >
                          {deletingId === admin.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="glass-strong border-white/10">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white/90">Remove Admin?</AlertDialogTitle>
                          <AlertDialogDescription className="text-white/60">
                            <strong>{admin.email}</strong> will lose all admin access immediately.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-white/10 hover:bg-white/10">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-500"
                            onClick={() => handleRevoke(admin.id, admin.email)}
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              ))
            )}
          </TabsContent>

          {/* Invitations Tab */}
          <TabsContent value="invites" className="mt-3 space-y-2">
            {invites.length === 0 ? (
              <div className="text-center py-8 text-white/20 text-sm">
                <Send className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No invitations sent yet. Use the form above to invite admins.
              </div>
            ) : (
              invites.map((invite) => (
                <div
                  key={invite.id}
                  className={`flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all ${
                    cancellingId === invite.id ? 'opacity-50' : ''
                  }`}
                >
                  <div className={`p-2 rounded-full shrink-0 ${
                    invite.status === 'pending' ? 'bg-yellow-500/10' :
                    invite.status === 'accepted' ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}>
                    {invite.status === 'pending' ? (
                      <Clock className="h-4 w-4 text-yellow-400" />
                    ) : invite.status === 'accepted' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/80 truncate">
                      {invite.name || invite.email.split('@')[0]}
                    </p>
                    <p className="text-xs text-white/30 truncate">{invite.email}</p>
                    <p className="text-[10px] text-white/20 mt-0.5">
                      Invited by {invite.invitedByName || invite.invitedBy}
                    </p>
                  </div>

                  <Badge
                    variant="outline"
                    className={`text-[10px] shrink-0 ${
                      invite.status === 'pending'
                        ? 'border-yellow-500/30 text-yellow-400'
                        : invite.status === 'accepted'
                        ? 'border-green-500/30 text-green-400'
                        : 'border-red-500/30 text-red-400'
                    }`}
                  >
                    {invite.status === 'pending' ? 'Pending' :
                     invite.status === 'accepted' ? 'Accepted' : 'Expired'}
                  </Badge>

                  {invite.status === 'pending' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 hover:bg-red-500/10 text-white/30 hover:text-red-400 shrink-0"
                          disabled={cancellingId === invite.id}
                        >
                          {cancellingId === invite.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="glass-strong border-white/10">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white/90">Cancel Invite?</AlertDialogTitle>
                          <AlertDialogDescription className="text-white/60">
                            The invitation for <strong>{invite.email}</strong> will be revoked.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-white/10 hover:bg-white/10">Keep</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-500"
                            onClick={() => handleCancelInvite(invite.id, invite.email)}
                          >
                            Cancel Invite
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>

        <p className="text-[11px] text-white/15 mt-2">
          Invited users will receive a Gmail with an accept link. Once they accept, they&apos;ll gain admin access.
        </p>
      </CardContent>
    </Card>
  );
});

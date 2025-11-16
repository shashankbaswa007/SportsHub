
"use client"

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock, Shield, CheckCircle2, User, Mail, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

export default function SettingsPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const onSubmit = (values: z.infer<typeof passwordSchema>) => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            console.log(values);
            toast({
                title: 'Password Updated',
                description: 'Your password has been changed successfully.',
            });
            form.reset();
            setIsLoading(false);
        }, 1000);
    };

    return (
        <motion.div 
            className="space-y-6 sm:space-y-8 max-w-5xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Premium Header */}
            <motion.div variants={itemVariants} className="relative">
                <div className="absolute -top-4 -left-4 w-24 sm:w-32 h-24 sm:h-32 bg-white/5 rounded-full blur-3xl" />
                <div className="relative">
                    <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gradient">Settings</h1>
                    <p className="text-white/60 text-sm sm:text-base lg:text-lg mt-2">Manage your account preferences and security</p>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <Card className="glass border-white/10 hover:border-white/20 transition-all group">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="p-2 sm:p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 group-hover:bg-blue-500/20 transition-all">
                                <Shield className="h-5 sm:h-6 w-5 sm:w-6 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-white/50">Security Level</p>
                                <p className="text-lg sm:text-xl font-bold text-white/90">High</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass border-white/10 hover:border-white/20 transition-all group">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="p-2 sm:p-3 rounded-xl bg-green-500/10 border border-green-500/20 group-hover:bg-green-500/20 transition-all">
                                <CheckCircle2 className="h-5 sm:h-6 w-5 sm:w-6 text-green-400" />
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-white/50">Account Status</p>
                                <p className="text-lg sm:text-xl font-bold text-white/90">Active</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass border-white/10 hover:border-white/20 transition-all group">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="p-2 sm:p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 group-hover:bg-purple-500/20 transition-all">
                                <Bell className="h-5 sm:h-6 w-5 sm:w-6 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-xs sm:text-sm text-white/50">Notifications</p>
                                <p className="text-lg sm:text-xl font-bold text-white/90">Enabled</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Password Change Card */}
            <motion.div variants={itemVariants}>
                <Card className="glass-strong border-white/10 hover:border-white/20 transition-all overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-pink-500/50" />
                    <CardHeader className="pb-4 sm:pb-6 space-y-2 p-4 sm:p-6">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="p-2 sm:p-2.5 rounded-xl bg-white/5 border border-white/10">
                                <Lock className="h-4 sm:h-5 w-4 sm:w-5 text-white/70" />
                            </div>
                            <CardTitle className="font-headline text-xl sm:text-2xl font-bold text-white/95">Change Password</CardTitle>
                        </div>
                        <CardDescription className="text-white/60 text-xs sm:text-sm">
                            Update your password to keep your account secure. Make sure it's strong and unique.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                                <FormField
                                    control={form.control}
                                    name="currentPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-white/90 font-semibold text-sm">Current Password</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="password" 
                                                    {...field} 
                                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/20 focus:bg-white/10 h-10 sm:h-12 rounded-xl transition-all text-sm sm:text-base"
                                                    placeholder="Enter your current password"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="newPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-white/90 font-semibold text-sm">New Password</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="password" 
                                                    {...field} 
                                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/20 focus:bg-white/10 h-10 sm:h-12 rounded-xl transition-all text-sm sm:text-base"
                                                    placeholder="Enter your new password"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-white/90 font-semibold text-sm">Confirm New Password</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="password" 
                                                    {...field} 
                                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/20 focus:bg-white/10 h-10 sm:h-12 rounded-xl transition-all text-sm sm:text-base"
                                                    placeholder="Confirm your new password"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                                    <Button 
                                        type="submit" 
                                        className="w-full h-10 sm:h-12 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-2xl border border-white/10 hover:border-white/20 text-sm sm:text-base"
                                        style={{
                                            background: 'linear-gradient(135deg, #1C1C1C 0%, #2A2A2A 100%)'
                                        }}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Updating...
                                            </>
                                        ) : (
                                            'Update Password'
                                        )}
                                    </Button>
                                </motion.div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Account Info Card */}
            
        </motion.div>
    );
}
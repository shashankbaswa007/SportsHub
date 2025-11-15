
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFirebase } from '@/firebase';
import { FirebaseError } from 'firebase/app';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { handleFirebaseError } from '@/firebase/error-handler';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ElectricBorder from './ElectricBorder';

const usernameSchema = z.string().regex(/^1601\d{8}$/, "Username must be a 12-digit ID starting with 1601.");

const loginSchema = z.object({
  username: usernameSchema,
  password: z.string().min(1, "Password is required."),
});

const signupSchema = z.object({
  username: usernameSchema,
});

const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_ID;
const DEFAULT_USER_PASSWORD = process.env.NEXT_PUBLIC_DEFAULT_USER_PASSWORD;

export function AuthForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { auth } = useFirebase();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { username: "" },
  });

  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      setIsLoading(true);
      const email = `${values.username}@sportshub.edu`;
      const isAdmin = values.username === ADMIN_ID;
      
      try {
        // For admin login, check if password matches admin ID
        if (isAdmin && values.password !== ADMIN_ID) {
          toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: 'Invalid admin credentials.',
          });
          return;
        }

        await signInWithEmailAndPassword(auth, email, values.password);
        
        // Login successful
        toast({
          title: 'Login Successful',
          description: isAdmin ? 'Welcome, Admin!' : 'Welcome back!',
        });
        
        localStorage.setItem('sports-hub-user', values.username);
        localStorage.setItem('sports-hub-role', isAdmin ? 'admin' : 'user');
        
        router.push(isAdmin ? '/admin' : '/overview');
      } catch (error) {
        if (error instanceof FirebaseError) {
          switch (error.code) {
            case 'auth/invalid-credential':
            case 'auth/wrong-password':
              toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: 'Invalid username or password.',
              });
              break;
            case 'auth/user-not-found':
              toast({
                variant: 'destructive',
                title: 'Account Not Found',
                description: 'No account found with this username. Please sign up first.',
              });
              break;
            case 'auth/too-many-requests':
              toast({
                variant: 'destructive',
                title: 'Too Many Attempts',
                description: 'Too many failed login attempts. Please try again later.',
              });
              break;
            default:
              throw error;
          }
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSignupSubmit = async (values: z.infer<typeof signupSchema>) => {
    try {
      setIsLoading(true);
      const email = `${values.username}@sportshub.edu`;
      const password = values.username; // Using username as initial password

      // Always try to create a new user first
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        
        toast({
          title: 'Signup Successful',
          description: 'Your account has been created. Your initial password is your username.',
        });

        // Sign in the user immediately after creating account
        await signInWithEmailAndPassword(auth, email, password);
        
        localStorage.setItem('sports-hub-user', values.username);
        localStorage.setItem('sports-hub-role', 'user');
        
        router.push('/overview');
      } catch (error) {
        if (error instanceof FirebaseError) {
          switch (error.code) {
            case 'auth/email-already-in-use':
              toast({
                variant: 'destructive',
                title: 'Account Already Exists',
                description: 'This username is already registered. Please login instead.',
              });
              setActiveTab('login');
              break;
            case 'auth/invalid-email':
              toast({
                variant: 'destructive',
                title: 'Invalid Username',
                description: 'Please enter a valid 12-digit ID starting with 1601.',
              });
              break;
            case 'auth/weak-password':
              toast({
                variant: 'destructive',
                title: 'Weak Password',
                description: 'The password must be at least 6 characters long.',
              });
              break;
            default:
              throw error;
          }
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const cardVariants = {
      hidden: { opacity: 0, scale: 0.98, filter: "blur(6px)" },
      visible: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.5, ease: "easeOut" } }
  };
  
  const buttonVariants = {
    hover: { scale: 1.02, transition: { duration: 0.2 } },
    tap: { scale: 0.98 }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Multiple Gradient Glow Layers for Enhanced Highlight */}
      <div className="relative">
        {/* Outermost Gradient Glow */}
        <div className="absolute -inset-4 bg-gradient-to-br from-white/20 via-white/5 to-white/10 rounded-3xl blur-2xl opacity-60" />
        
        {/* Secondary Gradient Glow */}
        <div className="absolute -inset-2 bg-gradient-to-tr from-white/15 via-transparent to-white/15 rounded-2xl blur-xl opacity-80" />
        
        {/* ElectricBorder Wrapper */}
        <ElectricBorder 
          color="#ffffff" 
          speed={1.2} 
          chaos={0.4} 
          thickness={1.5} 
          style={{ borderRadius: 20 }}
        >
          {/* Main Minimal Glass Container */}
          <div 
            className="relative backdrop-blur-xl rounded-[20px] overflow-hidden"
            style={{
              background: 'rgba(12, 12, 12, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {/* Top Subtle Gradient Accent */}
            <div 
              className="h-px w-full" 
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)'
              }}
            />
            
            {/* Inner Gradient Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 pointer-events-none" />
            
            {/* Tabs Navigation */}
            <Tabs defaultValue="login" className="w-full" onValueChange={setActiveTab}>
              <div className="px-6 pt-5 pb-3">
                <TabsList className="grid w-full grid-cols-2 bg-white/5 backdrop-blur-sm p-1 h-auto rounded-lg border border-white/10">
                  <TabsTrigger 
                    value="login" 
                    className="rounded-md data-[state=active]:bg-white/15 data-[state=active]:text-white text-white/40 transition-all font-medium py-2 text-sm hover:text-white/60"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup" 
                    className="rounded-md data-[state=active]:bg-white/15 data-[state=active]:text-white text-white/40 transition-all font-medium py-2 text-sm hover:text-white/60"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <motion.div key={activeTab} variants={cardVariants} initial="hidden" animate="visible">
                <TabsContent value="login" className="mt-0 px-6 pb-6 pt-2">
                  <div className="space-y-5">
                    <div className="text-center space-y-1">
                      <h3 className="font-headline text-xl font-bold text-white">Welcome</h3>
                      <p className="text-white/40 text-xs">Sign in to continue</p>
                    </div>
                    
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white/60 font-medium text-xs">Student ID</FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <Input 
                                    placeholder="1601..." 
                                    {...field} 
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-white/30 focus:bg-white/8 h-11 rounded-lg transition-all group-hover:border-white/15 text-sm"
                                  />
                                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-white/3 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white/60 font-medium text-xs">Password</FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <Input 
                                    type="password" 
                                    placeholder="••••••••" 
                                    {...field} 
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-white/30 focus:bg-white/8 h-11 rounded-lg transition-all group-hover:border-white/15 text-sm"
                                  />
                                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-white/3 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" className="pt-2">
                          <Button 
                            type="submit" 
                            className="w-full h-11 text-white font-semibold rounded-lg transition-all relative overflow-hidden group border-0"
                            style={{
                              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)',
                              boxShadow: '0 4px 24px rgba(255, 255, 255, 0.1)'
                            }}
                            disabled={isLoading}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 bg-white/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="relative z-10 text-sm">
                              {isLoading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin inline-block" />
                                  Signing in...
                                </>
                              ) : (
                                'Sign In'
                              )}
                            </span>
                          </Button>
                        </motion.div>
                      </form>
                    </Form>
                  </div>
                </TabsContent>
                
                <TabsContent value="signup" className="mt-0 px-6 pb-6 pt-2">
                  <div className="space-y-5">
                    <div className="text-center space-y-1">
                      <h3 className="font-headline text-xl font-bold text-white">Create Account</h3>
                      <p className="text-white/40 text-xs">Enter your student ID</p>
                    </div>
                    
                    <Form {...signupForm}>
                      <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                        <FormField
                          control={signupForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white/60 font-medium text-xs">Student ID</FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <Input 
                                    placeholder="1601..." 
                                    {...field} 
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-white/30 focus:bg-white/8 h-11 rounded-lg transition-all group-hover:border-white/15 text-sm"
                                  />
                                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-white/3 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                          <p className="text-xs text-white/50">Password will be set to your Student ID</p>
                        </div>
                        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" className="pt-2">
                          <Button 
                            type="submit" 
                            className="w-full h-11 text-white font-semibold rounded-lg transition-all relative overflow-hidden group border-0"
                            style={{
                              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)',
                              boxShadow: '0 4px 24px rgba(255, 255, 255, 0.1)'
                            }}
                            disabled={isLoading}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 bg-white/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="relative z-10 text-sm">
                              {isLoading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin inline-block" />
                                  Creating account...
                                </>
                              ) : (
                                'Create Account'
                              )}
                            </span>
                          </Button>
                        </motion.div>
                      </form>
                    </Form>
                  </div>
                </TabsContent>
              </motion.div>
            </Tabs>
          </div>
        </ElectricBorder>
      </div>
    </div>
  );
}

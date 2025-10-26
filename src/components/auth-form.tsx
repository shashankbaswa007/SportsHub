
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

const ADMIN_ID = '160123771030';

export function AuthForm() {
  const router = useRouter();
  const { toast } = useToast();
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

  const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    setTimeout(() => {
      const isAdmin = values.username === ADMIN_ID && values.password === ADMIN_ID;
      const isUser = values.password === 'password123' || values.password === values.username;

      if (isAdmin || isUser) {
        toast({
          title: 'Login Successful',
          description: isAdmin ? 'Welcome, Admin!' : 'Welcome back!',
        });
        localStorage.setItem('sports-hub-user', values.username);
        router.push(isAdmin ? '/admin' : '/overview');
      } else {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'Invalid username or password.',
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  const onSignupSubmit = (values: z.infer<typeof signupSchema>) => {
    setIsLoading(true);
    setTimeout(() => {
      toast({
        title: 'Signup Successful',
        description: 'Your account has been created. Your password is your username.',
      });
      localStorage.setItem('sports-hub-user', values.username);
      router.push('/overview');
      setIsLoading(false);
    }, 1000);
  };
  
  const cardVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeInOut" } }
  };
  
  const glassmorphismStyle = "bg-card/30 backdrop-blur-lg border border-border/20 shadow-xl rounded-xl text-card-foreground";

  return (
    <Tabs defaultValue="login" className="w-full max-w-sm" onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-2 bg-black/10 backdrop-blur-md border-black/20">
        <TabsTrigger value="login" className="data-[state=active]:bg-black/80 data-[state=active]:text-white text-black/70">Login</TabsTrigger>
        <TabsTrigger value="signup" className="data-[state=active]:bg-black/80 data-[state=active]:text-white text-black/70">Sign Up</TabsTrigger>
      </TabsList>
       <motion.div key={activeTab} variants={cardVariants} initial="hidden" animate="visible">
          <TabsContent value="login" className="mt-0">
            <ElectricBorder color="#FFFFFF" speed={1} chaos={0.5} thickness={2} style={{ borderRadius: 12 }}>
              <Card className={glassmorphismStyle}>
                <CardHeader className="text-center">
                  <CardTitle className="font-headline text-card-foreground">Welcome Back</CardTitle>
                  <CardDescription className="text-card-foreground/70">Enter your credentials to access your account.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4 text-left">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-card-foreground/80">Username</FormLabel>
                            <FormControl>
                              <Input placeholder="1601..." {...field} className="bg-white/50 border-black/20 text-black placeholder:text-black/50 focus:ring-black" />
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
                            <FormLabel className="text-card-foreground/80">Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} className="bg-white/50 border-black/20 text-black placeholder:text-black/50 focus:ring-black" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full bg-black text-white hover:bg-black/80" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Login
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </ElectricBorder>
          </TabsContent>
          <TabsContent value="signup" className="mt-0">
             <ElectricBorder color="#7df9ff" speed={1} chaos={0.5} thickness={2} style={{ borderRadius: 12 }}>
              <Card className={glassmorphismStyle}>
                <CardHeader className="text-center">
                  <CardTitle className="font-headline text-card-foreground">Create Account</CardTitle>
                  <CardDescription className="text-card-foreground/70">
                    Enter your 12-digit college ID. Your password will be your ID.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...signupForm}>
                    <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4 text-left">
                      <FormField
                        control={signupForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-card-foreground/80">Username</FormLabel>
                            <FormControl>
                              <Input placeholder="1601..." {...field} className="bg-white/50 border-black/20 text-black placeholder:text-black/50 focus:ring-black" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full bg-black text-white hover:bg-black/80" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sign Up
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </ElectricBorder>
          </TabsContent>
       </motion.div>
    </Tabs>
  );
}

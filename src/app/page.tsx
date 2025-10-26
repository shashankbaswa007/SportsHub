
"use client";

import { useState } from 'react';
import { AuthForm } from "@/components/auth-form";
import { Flame } from "lucide-react";

export default function AuthenticationPage() {

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 animated-gradient">
      <div className="relative z-10 flex flex-col items-center space-y-4 text-center">
        <div className="flex items-center justify-center space-x-2 text-black">
          <Flame className="h-10 w-10" />
          <h1 className="font-headline text-4xl font-bold tracking-tighter">SportsHub Central</h1>
        </div>
        <p className="text-black/80 font-semibold">Where Passion Meets the Game</p>
        <AuthForm />
      </div>
    </main>
  );
}

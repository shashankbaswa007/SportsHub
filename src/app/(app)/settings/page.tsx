
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';


export default function SettingsPage() {

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <div>
                <h1 className="font-headline text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage your account and preferences.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Change Password</CardTitle>
                    <CardDescription>Password management is not yet available. This feature requires Firebase Authentication to be fully integrated.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Contact your administrator if you need to update your credentials.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Appearance</CardTitle>
                    <CardDescription>Customize the look and feel of the application.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <p className="text-base font-medium">Theme</p>
                        </div>
                        <ThemeToggle />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

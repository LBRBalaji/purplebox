
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Cookie, X } from 'lucide-react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { cn } from '@/lib/utils';

type Consent = {
    necessary: boolean;
    preferences: boolean;
};

export function CookieBanner() {
    const [consent, setConsent] = useState<Consent | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [localPreferences, setLocalPreferences] = useState<Consent>({
        necessary: true,
        preferences: true,
    });

    useEffect(() => {
        setMounted(true);
        try {
            const storedConsent = localStorage.getItem('cookie_consent');
            if (storedConsent) {
                setConsent(JSON.parse(storedConsent));
            } else {
                setIsVisible(true);
            }
        } catch (e) {
            console.error("Could not parse cookie consent from localStorage", e);
            setIsVisible(true);
        }
    }, []);

    const handleSavePreferences = () => {
        setConsent(localPreferences);
        localStorage.setItem('cookie_consent', JSON.stringify(localPreferences));
        setIsDialogOpen(false);
        setIsVisible(false);
    };

    const handleAcceptAll = () => {
        const allAccepted = { necessary: true, preferences: true };
        setConsent(allAccepted);
        localStorage.setItem('cookie_consent', JSON.stringify(allAccepted));
        setIsVisible(false);
    };

    const handleRejectAll = () => {
        const onlyNecessary = { necessary: true, preferences: false };
        setConsent(onlyNecessary);
        localStorage.setItem('cookie_consent', JSON.stringify(onlyNecessary));
        setIsVisible(false);
    };
    
    useEffect(() => {
        if (consent?.preferences) {
            // Apply preference-based functionality, e.g. themes or language
        }
    }, [consent]);


    if (!mounted || !isVisible) {
        return null;
    }

    return (
        <>
            <div className="fixed bottom-0 inset-x-0 z-50 p-4 animate-in slide-in-from-bottom-5">
                 <Card className="max-w-4xl mx-auto shadow-2xl relative">
                     <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={handleRejectAll}
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </Button>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Cookie className="h-5 w-5 text-primary"/> We use cookies
                        </CardTitle>
                        <CardDescription>
                            We use essential cookies to make our site work. With your consent, we may also use preference cookies to enhance your experience.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex-col sm:flex-row gap-2">
                        <Button className="w-full sm:w-auto" onClick={handleAcceptAll}>Accept All</Button>
                        <Button className="w-full sm:w-auto" variant="outline" onClick={() => setIsDialogOpen(true)}>Manage Cookies</Button>
                        <Button className="w-full sm:w-auto" variant="secondary" onClick={handleRejectAll}>Reject All</Button>
                    </CardFooter>
                </Card>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cookie Preferences</DialogTitle>
                        <DialogDescription>
                            Manage your cookie settings here. You can read our full <Link href="/cookie-policy" className="underline">Cookie Policy</Link> for more details.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                             <div className="space-y-0.5">
                                <Label htmlFor="necessary-cookies">Essential Cookies</Label>
                                <p className="text-xs text-muted-foreground">Required for the website to function properly.</p>
                            </div>
                            <Switch id="necessary-cookies" checked disabled />
                        </div>
                         <div className="flex items-center justify-between rounded-lg border p-4">
                             <div className="space-y-0.5">
                                <Label htmlFor="preference-cookies">Preference Cookies</Label>
                                <p className="text-xs text-muted-foreground">Remember your choices and preferences.</p>
                            </div>
                            <Switch 
                                id="preference-cookies"
                                checked={localPreferences.preferences} 
                                onCheckedChange={(checked) => setLocalPreferences(prev => ({...prev, preferences: checked}))}
                             />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSavePreferences}>Save Preferences</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

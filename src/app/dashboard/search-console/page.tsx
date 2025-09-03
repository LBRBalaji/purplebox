
'use client';
import * as React from 'react';
import { useData } from '@/contexts/data-context';
import { useAuth } from '@/contexts/auth-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ListingSchema, DemandSchema } from '@/lib/schema';
import type { User } from '@/contexts/auth-context';
import Link from 'next/link';
import { Building, ClipboardList, Search, User as UserIcon, X, ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

type SearchResult = {
    listings: ListingSchema[];
    demands: DemandSchema[];
    users: User[];
}

function ResultCard({ title, icon: Icon, children, count }: { title: string, icon: React.ElementType, children: React.ReactNode, count: number}) {
    if (count === 0) return null;
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    {title}
                    <Badge variant="secondary" className="ml-2">{count}</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {children}
            </CardContent>
        </Card>
    )
}

export default function SearchConsolePage() {
    const { listings, demands } = useData();
    const { users: allUsers } = useAuth();
    const [searchTerm, setSearchTerm] = React.useState('');
    const [results, setResults] = React.useState<SearchResult | null>(null);
    const [searched, setSearched] = React.useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) {
            setResults(null);
            setSearched(false);
            return;
        }

        const lowerCaseSearch = searchTerm.toLowerCase();
        
        let foundListings: ListingSchema[] = [];
        let foundDemands: DemandSchema[] = [];
        let foundUsers: User[] = [];

        // Search Users by name or email
        foundUsers = Object.values(allUsers).filter(u => 
            u.userName.toLowerCase().includes(lowerCaseSearch) || 
            u.companyName.toLowerCase().includes(lowerCaseSearch) ||
            u.email.toLowerCase().includes(lowerCaseSearch)
        );
        const foundUserEmails = new Set(foundUsers.map(u => u.email));

        // Search Listings by ID or Name
        foundListings = listings.filter(l => 
            l.listingId.toLowerCase().includes(lowerCaseSearch) || 
            l.name.toLowerCase().includes(lowerCaseSearch) ||
            foundUserEmails.has(l.developerId)
        );
        
        // Search Demands by ID or user association
        foundDemands = demands.filter(d => 
            d.demandId.toLowerCase().includes(lowerCaseSearch) ||
            foundUserEmails.has(d.userEmail)
        );

        setResults({
            listings: foundListings,
            demands: foundDemands,
            users: foundUsers
        });
        setSearched(true);
    }
    
    const clearSearch = () => {
        setSearchTerm('');
        setResults(null);
        setSearched(false);
    }

    return (
        <main className="container mx-auto p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold font-headline tracking-tight">Admin Search Console</h1>
                    <p className="text-muted-foreground mt-2">
                        Enter a Listing ID, Customer Name/Email, or Provider Name to track all related data.
                    </p>
                </div>
                
                <form onSubmit={handleSearch} className="flex gap-2 mb-8">
                    <Input 
                        placeholder="Search by ID, name, or email..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="text-lg h-12"
                    />
                    {searchTerm && <Button type="button" variant="ghost" size="icon" onClick={clearSearch}><X className="h-5 w-5"/></Button>}
                    <Button type="submit" size="lg"><Search className="mr-2 h-5 w-5" /> Search</Button>
                </form>

                {searched && results && (
                    <div className="space-y-6">
                        <ResultCard title="Users" icon={UserIcon} count={results.users.length}>
                            {results.users.map(user => (
                                <div key={user.email} className="p-3 border rounded-md">
                                    <p className="font-semibold">{user.userName} - <span className="font-normal text-muted-foreground">{user.companyName}</span></p>
                                    <p className="text-sm">{user.email}</p>
                                    <Badge variant={user.role === 'SuperAdmin' ? 'secondary' : 'outline'}>{user.role}</Badge>
                                </div>
                            ))}
                        </ResultCard>

                         <ResultCard title="Listings" icon={Building} count={results.listings.length}>
                            {results.listings.map(listing => (
                                <div key={listing.listingId} className="p-3 border rounded-md flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{listing.name}</p>
                                        <p className="text-sm text-muted-foreground">{listing.listingId} - {listing.location}</p>
                                        <Badge variant={listing.status === 'approved' ? 'default' : 'secondary'}>{listing.status}</Badge>
                                    </div>
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/listings/${listing.listingId}`} target="_blank">View <ArrowRight className="ml-2 h-4 w-4"/></Link>
                                    </Button>
                                </div>
                            ))}
                        </ResultCard>

                         <ResultCard title="Demands" icon={ClipboardList} count={results.demands.length}>
                            {results.demands.map(demand => (
                                <div key={demand.demandId} className="p-3 border rounded-md flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{demand.demandId}</p>
                                        <p className="text-sm text-muted-foreground">{demand.size.toLocaleString()} sq.ft in {demand.locationName || demand.location}</p>
                                    </div>
                                     <Button asChild variant="outline" size="sm">
                                        <Link href={`/dashboard?editDemandId=${demand.demandId}`} target="_blank">View <ArrowRight className="ml-2 h-4 w-4"/></Link>
                                    </Button>
                                </div>
                            ))}
                        </ResultCard>

                        {results.listings.length === 0 && results.demands.length === 0 && results.users.length === 0 && (
                            <Card className="text-center p-12">
                                <CardTitle>No Results Found</CardTitle>
                                <CardDescription>Your search for "{searchTerm}" did not match any records.</CardDescription>
                            </Card>
                        )}
                    </div>
                )}

            </div>
        </main>
    );
}

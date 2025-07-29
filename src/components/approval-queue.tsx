
'use client';

import * as React from 'react';
import { useData, type Submission } from '@/contexts/data-context';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Check, Info, ListChecks, Percent, ThumbsDown, ThumbsUp, X, MapPin, Scaling, CalendarCheck, HandCoins, Zap, ShieldCheck, Truck, Flame } from 'lucide-react';
import { Separator } from './ui/separator';

const priorityLabels: { [key: string]: string } = {
  size: 'Size',
  location: 'Location',
  ceilingHeight: 'Ceiling Height',
  docks: 'Docks',
  readiness: 'Readiness',
  approvals: 'Approvals',
  fireNoc: 'Fire NOC',
  power: 'Power',
  fireSafety: 'Fire Safety',
};

const ScoreDisplay = ({ label, score, icon: Icon }: { label: string, score: number, icon: React.ElementType }) => {
    const displayScore = Math.round(score * 100);
    const colorClass = displayScore >= 85 ? 'text-green-600' : displayScore >= 60 ? 'text-amber-600' : 'text-red-600';
    
    return (
        <div className="flex justify-between items-center text-sm">
            <p className="font-medium flex items-center gap-2"><Icon className="h-4 w-4 text-muted-foreground" /> {label}</p>
            <p className={`font-bold ${colorClass}`}>{displayScore}%</p>
        </div>
    );
};


export function ApprovalQueue() {
    const { demands, submissions, updateSubmissionStatus } = useData();
    const { toast } = useToast();
    const [pendingSubmissions, setPendingSubmissions] = React.useState<Submission[]>([]);

    React.useEffect(() => {
        const pending = submissions.filter(s => s.status === 'Pending');
        setPendingSubmissions(pending);
    }, [submissions]);

    const handleApproval = (propertyId: string, isApproved: boolean) => {
        const newStatus = isApproved ? 'Approved' : 'Rejected';
        updateSubmissionStatus(propertyId, newStatus);
        toast({
            title: `Submission ${isApproved ? 'Approved' : 'Rejected'}`,
            description: `The property match ${propertyId} has been updated.`,
        });
    };

    if (pendingSubmissions.length === 0) {
        return (
            <Card className="mt-8 text-center p-12">
                <CardTitle className="flex items-center justify-center gap-2">
                    <Check className="h-6 w-6 text-green-500" />
                    Approval Queue is Empty
                </CardTitle>
                <CardDescription className="mt-2">There are no pending property submissions to review.</CardDescription>
            </Card>
        );
    }

    return (
        <div className="mt-8 space-y-6">
            <div className="mb-8">
                <h2 className="text-3xl font-bold font-headline tracking-tight">Submissions for Approval</h2>
                <p className="text-muted-foreground mt-2">
                    Review property submissions from providers and approve or reject them.
                </p>
            </div>
            {pendingSubmissions.map(submission => {
                const demand = demands.find(d => d.demandId === submission.demandId);
                if (!demand) return null;

                const breakdown = submission.matchResult.scoreBreakdown;

                return (
                    <Card key={submission.property.propertyId}>
                        <CardHeader>
                             <CardTitle>Review Submission for Demand: <span className="text-primary">{submission.demandId}</span></CardTitle>
                             <CardDescription>
                                Submitted by: <span className="font-medium">{submission.property.userCompanyName} ({submission.property.userName})</span>
                             </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Demand Side */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg">Customer Demand</h3>
                                    <div className="p-4 border rounded-md bg-secondary/50 space-y-3">
                                        <p><strong>Property Type:</strong> {demand.propertyType}</p>
                                        <p><strong>Location:</strong> {demand.locationName || demand.location} (within {demand.radius}km)</p>
                                        <p><strong>Size:</strong> {demand.size.toLocaleString()} sq. ft.</p>
                                        <p><strong>Readiness:</strong> {demand.readiness}</p>
                                        {demand.preferences?.nonCompromisable && demand.preferences.nonCompromisable.length > 0 && (
                                            <div className="text-sm space-y-2 pt-2">
                                            <p className="font-semibold flex items-center gap-1.5"><ListChecks className="h-4 w-4" /> Priorities:</p>
                                            <div className="flex flex-wrap gap-1.5 pl-1">
                                                {demand.preferences.nonCompromisable.map(item => <Badge key={item} variant="outline" className="font-normal">{priorityLabels[item] || item}</Badge>)}
                                            </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* Property Side */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg">Submitted Property ({submission.property.propertyId})</h3>
                                    <div className="p-4 border rounded-md space-y-3">
                                        <p><strong>Location:</strong> {submission.property.isLocationConfirmed ? <span className="text-green-600 font-semibold">Confirmed by Provider</span> : <span className="text-red-600 font-semibold">Not Confirmed</span>}</p>
                                        <p><strong>Size:</strong> {submission.property.size.toLocaleString()} sq. ft.</p>
                                        <p><strong>Readiness:</strong> {submission.property.readinessToOccupy}</p>
                                        <p><strong>Ceiling Height:</strong> {submission.property.ceilingHeight} ft</p>
                                        <p><strong>Docks:</strong> {submission.property.docks}</p>
                                        <p><strong>Rent:</strong> ₹{submission.property.rentPerSft}/sft</p>
                                    </div>
                                </div>
                            </div>
                             {/* AI Analysis */}
                             <div className="mt-6">
                                <h3 className="font-semibold text-lg mb-2">AI Match Analysis</h3>
                                <div className="p-4 border rounded-md bg-primary/5 space-y-4">
                                     <div className="flex items-center gap-3">
                                        <Badge className="text-lg py-1 px-4">
                                            <Percent className="mr-2 h-4 w-4"/>
                                            {(submission.matchResult.overallScore * 100).toFixed(0)}% Overall Match
                                        </Badge>
                                        <p className="text-sm text-muted-foreground italic line-clamp-2">{submission.matchResult.justification}</p>
                                     </div>
                                     <Separator />
                                     <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
                                        <ScoreDisplay label="Location" score={breakdown.location} icon={MapPin} />
                                        <ScoreDisplay label="Size" score={breakdown.size} icon={Scaling} />
                                        <ScoreDisplay label="Amenities" score={breakdown.amenities} icon={Truck} />
                                        <ScoreDisplay label="Commercials" score={breakdown.commercials} icon={HandCoins} />
                                        <ScoreDisplay label="Power" score={breakdown.power} icon={Zap} />
                                        <ScoreDisplay label="Fire Safety" score={breakdown.fireSafety} icon={Flame} />
                                        <ScoreDisplay label="Approvals" score={breakdown.approvals} icon={ShieldCheck} />
                                     </div>
                                </div>
                             </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-3">
                            <Button variant="destructive" onClick={() => handleApproval(submission.property.propertyId, false)}>
                                <ThumbsDown className="mr-2" /> Reject
                            </Button>
                            <Button onClick={() => handleApproval(submission.property.propertyId, true)}>
                                <ThumbsUp className="mr-2" /> Approve
                            </Button>
                        </CardFooter>
                    </Card>
                )
            })}
        </div>
    );
}

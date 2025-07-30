
'use client';

import * as React from 'react';
import { useData, type Submission } from '@/contexts/data-context';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Check, Info, ListChecks, Percent, ThumbsDown, ThumbsUp, X, MapPin, Scaling, CalendarCheck, HandCoins, Zap, ShieldCheck, Truck, Flame, Building, Construction } from 'lucide-react';
import { Separator } from './ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Progress } from './ui/progress';
import { cn } from '@/lib/utils';


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
                const scoreItems = [
                    {
                        criterion: "Location",
                        demand: `${demand.locationName} (within ${demand.radius}km)`,
                        property: submission.property.isLocationConfirmed ? "Confirmed by Provider" : "Not Confirmed",
                        score: breakdown.location
                    },
                    {
                        criterion: "Size (Sq. Ft.)",
                        demand: `${demand.size.toLocaleString()}`,
                        property: `${submission.property.size.toLocaleString()}`,
                        score: breakdown.size
                    },
                    {
                        criterion: "Building Type",
                        demand: `${demand.buildingType}${demand.floorPreference ? ` (${demand.floorPreference})` : ''}`,
                        property: `${submission.property.buildingType} (${submission.property.floor})`,
                         score: (breakdown.amenities) // This is a blended score
                    },
                    {
                        criterion: "Ceiling Height",
                        demand: `${demand.ceilingHeight || 'N/A'} ${demand.ceilingHeightUnit || 'ft'}`,
                        property: `${submission.property.ceilingHeight} ft`,
                        score: breakdown.amenities // This is a blended score
                    },
                    {
                        criterion: "Docks",
                        demand: `${demand.docks || 'N/A'}`,
                        property: `${submission.property.docks}`,
                        score: breakdown.amenities // This is a blended score
                    },
                    {
                        criterion: "Power (kVA)",
                        demand: `${demand.powerMin || '...'} - ${demand.powerMax || '...'}`,
                        property: `${submission.property.availablePower}`,
                        score: breakdown.power
                    },
                    {
                        criterion: "Approvals",
                        demand: demand.preferences.approvals || 'Good to have',
                        property: submission.property.approvalStatus,
                        score: breakdown.approvals
                    },
                    {
                        criterion: "Fire Safety (NOC)",
                        demand: demand.preferences.fireNoc || 'Good to have',
                        property: submission.property.fireNoc,
                        score: breakdown.fireSafety
                    },
                ];


                return (
                    <Card key={submission.property.propertyId}>
                        <CardHeader>
                             <CardTitle>Review Submission for Demand: <span className="text-primary">{submission.demandId}</span></CardTitle>
                             <CardDescription>
                                Submitted by: <span className="font-medium">{submission.property.userCompanyName} ({submission.property.userName})</span>
                             </CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="mt-6">
                                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                                    <Percent className="h-5 w-5 text-primary" />
                                    AI Match Scorecard
                                </h3>
                                <div className="p-4 border rounded-md bg-primary/5 space-y-4">
                                     <div className="flex items-center gap-3">
                                        <Badge className="text-lg py-1 px-4">
                                            <Percent className="mr-2 h-4 w-4"/>
                                            {(submission.matchResult.overallScore * 100).toFixed(0)}% Overall Match
                                        </Badge>
                                        <p className="text-sm text-muted-foreground italic line-clamp-2">{submission.matchResult.justification}</p>
                                     </div>
                                     <Separator />
                                     <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-1/4">Criterion</TableHead>
                                                <TableHead>Customer Requirement</TableHead>
                                                <TableHead>Property Specification</TableHead>
                                                <TableHead className="text-right w-[100px]">Match</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {scoreItems.map(item => {
                                                const score = Math.round(item.score * 100);
                                                const scoreColor = score > 85 ? 'bg-green-500' : score > 60 ? 'bg-amber-500' : 'bg-red-500';
                                                
                                                return (
                                                    <TableRow key={item.criterion}>
                                                        <TableCell className="font-semibold">{item.criterion}</TableCell>
                                                        <TableCell>{item.demand}</TableCell>
                                                        <TableCell>{item.property}</TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center gap-2 justify-end">
                                                                <span className="font-bold text-sm">{score}%</span>
                                                                <Progress value={score} className={cn("h-2 w-12", scoreColor)} indicatorClassName={scoreColor} />
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                        </TableBody>
                                     </Table>
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

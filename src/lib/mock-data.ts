export type SubmissionStatus = "Pending" | "Shortlisted" | "Rejected";

export const mockDemands = [
  {
    demandId: 'ACME-1689345',
    userEmail: 'user@example.com',
    propertyType: 'Warehouse',
    location: 'Mumbai, India',
    radius: '20',
    size: '100000',
    ceilingHeight: '40',
    docks: '12',
    description: 'Urgent requirement for a large warehouse with high ceilings and 10+ docks near the port.',
    preferences: {
      nonCompromisable: ['size', 'docks'],
    },
  },
  {
    demandId: 'TECHCORP-1689346',
    userEmail: 'user@example.com',
    propertyType: 'Office Space',
    location: 'Bangalore, India',
    radius: '10',
    size: '25000',
    ceilingHeight: '12',
    docks: '0',
    description: 'A-grade office building with modern amenities, good connectivity, and parking for 50 cars.',
    preferences: {
      nonCompromisable: ['location'],
    },
  },
  {
    demandId: 'RETAILCO-1689347',
    userEmail: 'anotheruser@example.com',
    propertyType: 'Retail Showroom',
    location: 'Delhi, India',
    radius: '5',
    size: '5000',
    ceilingHeight: '15',
    docks: '0',
    description: 'High-street retail location with heavy footfall, large glass frontage, and high visibility.',
    preferences: {
      nonCompromisable: ['location', 'approvals'],
    },
  },
    {
    demandId: 'GLOBAL-1689348',
    userEmail: 'anotheruser@example.com',
    propertyType: 'Industrial Building',
    location: 'Chennai, India',
    radius: '25',
    size: '250000',
    ceilingHeight: '50',
    docks: '20',
    description: 'Industrial facility for manufacturing, requiring heavy power load and effluent treatment plant.',
    preferences: {
      nonCompromisable: ['size', 'power', 'fireSafety'],
    },
  },
];


export const myDemands = [
  {
    demandId: 'TECHCORP-1689346',
    propertyType: 'Office Space',
    location: 'Bangalore, India',
    size: '25,000 Sq. Ft.',
    matches: [
      {
        propertyId: 'PS-12345',
        propertyName: 'Prestige Tech Park',
        size: '26,000 Sq. Ft.',
        rent: '₹85/sft',
        image: 'https://placehold.co/600x400.png',
        dataAiHint: 'modern office',
        matchScore: 0.92,
        justification: 'Excellent match on size and location. The amenities are a very close fit to the description.',
      },
      {
        propertyId: 'PS-67890',
        propertyName: 'Global Tech Village',
        size: '24,500 Sq. Ft.',
        rent: '₹80/sft',
        image: 'https://placehold.co/600x400.png',
        dataAiHint: 'corporate building',
        matchScore: 0.85,
        justification: 'Good match on size, but slightly outside the preferred radius. Meets most feature requirements.',
      }
    ],
  },
  {
    demandId: 'MYCOMPANY-1689349',
    propertyType: 'Warehouse',
    location: 'Chennai, India',
    size: '50,000 Sq. Ft.',
    matches: [],
  },
];


export const mockSubmissions = [
    {
        demandId: 'TECHCORP-1689346',
        demandDetails: {
          propertyType: 'Office Space',
          location: 'Bangalore, India',
        },
        properties: [
          {
            propertyId: 'PS-12345',
            propertyName: 'Prestige Tech Park',
            status: 'Shortlisted' as SubmissionStatus,
            matchScore: 0.92,
          },
          {
            propertyId: 'PS-67890',
            propertyName: 'Global Tech Village',
            status: 'Pending' as SubmissionStatus,
            matchScore: 0.85,
          },
        ],
    },
    {
        demandId: 'ACME-1689345',
        demandDetails: {
          propertyType: 'Warehouse',
          location: 'Mumbai, India',
        },
        properties: [
          {
            propertyId: 'PS-ABCDE',
            propertyName: 'Industrial Unit, Guindy',
            status: 'Rejected' as SubmissionStatus,
            matchScore: 0.45,
          },
        ],
    },
    {
        demandId: 'RETAILCO-1689347',
        demandDetails: {
            propertyType: 'Retail Showroom',
            location: 'Delhi, India',
        },
        properties: [],
    }
];

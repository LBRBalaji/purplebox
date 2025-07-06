export type SubmissionStatus = "Pending" | "Shortlisted" | "Rejected";

export const mockDemands = [
  {
    demandId: 'ACME-1689345',
    userEmail: 'user@example.com',
    companyName: 'ACME Corp',
    userName: 'John Doe',
    userPhone: '123-456-7890',
    propertyType: 'Warehouse',
    location: '12.9716, 77.5946',
    radius: 20,
    size: 100000,
    readiness: 'Immediate',
    ceilingHeight: 40,
    docks: 12,
    description: 'Urgent requirement for a large warehouse with high ceilings and 10+ docks near the port.',
    preferences: {
      nonCompromisable: ['size', 'docks'],
    },
  },
  {
    demandId: 'TECHCORP-1689346',
    userEmail: 'user@example.com',
    companyName: 'TechCorp',
    userName: 'Jane Smith',
    userPhone: '123-456-7890',
    propertyType: 'Industrial Building',
    location: '13.0827, 80.2707',
    radius: 10,
    size: 25000,
    readiness: 'Within 90 Days',
    ceilingHeight: 25,
    docks: 4,
    description: 'Need an industrial building for a light assembly line. Good connectivity is a must.',
    preferences: {
      nonCompromisable: ['location'],
    },
  },
  {
    demandId: 'RETAILCO-1689347',
    userEmail: 'anotheruser@example.com',
    companyName: 'RetailCo',
    userName: 'Peter Jones',
    userPhone: '123-456-7890',
    propertyType: 'Warehouse',
    location: '28.6139, 77.2090',
    radius: 15,
    size: 15000,
    readiness: 'Immediate',
    ceilingHeight: 20,
    docks: 2,
    description: 'Looking for a warehouse for e-commerce fulfillment in the city center. Must be ready for immediate occupation.',
    preferences: {
      nonCompromisable: ['location', 'readiness'],
    },
  },
    {
    demandId: 'GLOBAL-1689348',
    userEmail: 'anotheruser@example.com',
    companyName: 'Global Industries',
    userName: 'Mary Williams',
    userPhone: '123-456-7890',
    propertyType: 'Industrial Building',
    location: '13.0827, 80.2707',
    radius: 25,
    size: 250000,
    readiness: 'BTS',
    ceilingHeight: 50,
    docks: 20,
    description: 'Industrial facility for manufacturing, requiring heavy power load and effluent treatment plant.',
    preferences: {
      nonCompromisable: ['size', 'power', 'fireSafety'],
    },
  },
];


export const myDemands = [
  {
    demandId: 'TECHCORP-1689346',
    propertyType: 'Industrial Building',
    location: 'Bangalore, India',
    size: 25000,
    matches: [
      {
        propertyId: 'PS-12345',
        propertyName: 'Prestige Tech Park',
        size: 26000,
        rent: '₹85/sft',
        image: 'https://placehold.co/600x400.png',
        dataAiHint: 'modern office',
        matchScore: 0.92,
        justification: 'Excellent match on size and location. The amenities are a very close fit to the description.',
      },
      {
        propertyId: 'PS-67890',
        propertyName: 'Global Tech Village',
        size: 24500,
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
    size: 50000,
    matches: [],
  },
];


export const mockSubmissions = [
    {
        demandId: 'TECHCORP-1689346',
        demandDetails: {
          propertyType: 'Industrial Building',
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
            propertyType: 'Warehouse',
            location: 'Delhi, India',
        },
        properties: [],
    }
];

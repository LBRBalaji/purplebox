export type SubmissionStatus = "Pending" | "Shortlisted" | "Rejected";

export const mockDemands = [
  {
    demandId: 'ACME-1689345',
    propertyType: 'Warehouse',
    location: 'Mumbai, India',
    size: '100,000 Sq. Ft.',
    description: 'Urgent requirement for a large warehouse with high ceilings and 10+ docks near the port.',
    preferences: {
      isPropertyTypeNonCompromisable: true,
      isSizeNonCompromisable: true,
      isLocationNonCompromisable: false,
    },
  },
  {
    demandId: 'TECHCORP-1689346',
    propertyType: 'Office Space',
    location: 'Bangalore, India',
    size: '25,000 Sq. Ft.',
    description: 'A-grade office building with modern amenities, good connectivity, and parking for 50 cars.',
    preferences: {
      isPropertyTypeNonCompromisable: true,
      isSizeNonCompromisable: false,
      isLocationNonCompromisable: true,
    },
  },
  {
    demandId: 'RETAILCO-1689347',
    propertyType: 'Retail Showroom',
    location: 'Delhi, India',
    size: '5,000 Sq. Ft.',
    description: 'High-street retail location with heavy footfall, large glass frontage, and high visibility.',
    preferences: {
      isPropertyTypeNonCompromisable: true,
      isSizeNonCompromisable: true,
      isLocationNonCompromisable: true,
    },
  },
    {
    demandId: 'GLOBAL-1689348',
    propertyType: 'Industrial Building',
    location: 'Chennai, India',
    size: '250,000 Sq. Ft.',
    description: 'Industrial facility for manufacturing, requiring heavy power load and effluent treatment plant.',
    preferences: {
      isPropertyTypeNonCompromisable: false,
      isSizeNonCompromisable: true,
      isLocationNonCompromisable: false,
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

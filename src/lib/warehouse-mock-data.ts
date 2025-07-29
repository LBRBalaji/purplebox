
import { type WarehouseSchema } from "./schema";

export const warehouses: WarehouseSchema[] = [
  {
    id: 'WH-001',
    title: 'Modern Logistics Hub in Oragadam',
    isActive: true,
    address: {
        line1: 'Industrial Estate',
        city: 'Oragadam',
        state: 'Tamil Nadu',
        postalCode: '602105',
    },
    generalizedLocation: { lat: 12.83, lng: 79.95 },
    size: 150000,
    readiness: 'Ready for Occupancy',
    specifications: {
        ceilingHeight: 45,
        docks: 20,
        officeSpace: true,
        flooringType: 'FM2 Grade',
    },
    imageUrls: [
        'https://placehold.co/600x400.png',
        'https://placehold.co/600x400.png',
        'https://placehold.co/600x400.png',
    ],
  },
  {
    id: 'WH-002',
    title: 'Grade-A Warehouse near Sriperumbudur',
    isActive: true,
    address: {
        line1: 'SIPCOT Industrial Park',
        city: 'Sriperumbudur',
        state: 'Tamil Nadu',
        postalCode: '602105',
    },
    generalizedLocation: { lat: 12.96, lng: 79.95 },
    size: 250000,
    readiness: 'Under Construction',
    specifications: {
        ceilingHeight: 50,
        docks: 30,
        officeSpace: true,
        flooringType: 'Heavy Duty',
    },
    imageUrls: [
        'https://placehold.co/600x400.png',
        'https://placehold.co/600x400.png',
    ],
  },
  {
    id: 'WH-003',
    title: 'Compact Warehouse in Guindy',
    isActive: false, // This one is inactive
    address: {
        line1: 'Guindy Industrial Estate',
        city: 'Chennai',
        state: 'Tamil Nadu',
        postalCode: '600032',
    },
    generalizedLocation: { lat: 13.0102, lng: 80.2156 },
    size: 50000,
    readiness: 'Ready for Occupancy',
    specifications: {
        ceilingHeight: 25,
        docks: 5,
        officeSpace: true,
        flooringType: 'Standard',
    },
    imageUrls: [
        'https://placehold.co/600x400.png',
    ],
  },
  {
    id: 'WH-004',
    title: 'Large Distribution Center in Bhiwandi',
    isActive: true,
    address: {
        line1: 'Mumbai-Nashik Highway',
        city: 'Bhiwandi',
        state: 'Maharashtra',
        postalCode: '421302',
    },
    generalizedLocation: { lat: 19.30, lng: 73.06 },
    size: 500000,
    readiness: 'Ready for Occupancy',
    specifications: {
        ceilingHeight: 40,
        docks: 50,
        officeSpace: true,
        flooringType: 'FM2 Grade',
    },
    imageUrls: [
        'https://placehold.co/600x400.png',
        'https://placehold.co/600x400.png',
        'https://placehold.co/600x400.png',
        'https://placehold.co/600x400.png',
    ],
  },
    {
    id: 'WH-005',
    title: 'E-commerce Fulfillment Center, Hosur',
    isActive: true,
    address: {
        line1: 'Industrial Area',
        city: 'Hosur',
        state: 'Tamil Nadu',
        postalCode: '635109',
    },
    generalizedLocation: { lat: 12.75, lng: 77.82 },
    size: 120000,
    readiness: 'Available in 3 months',
    specifications: {
        ceilingHeight: 40,
        docks: 15,
        officeSpace: false,
        flooringType: 'Standard',
    },
    imageUrls: [
        'https://placehold.co/600x400.png',
        'https://placehold.co/600x400.png',
    ],
  },
];


import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertGoogleDriveLink(url: string): string {
  if (!url || typeof url !== 'string') {
    return 'https://placehold.co/800x600/210D42/FFFFFF?text=Invalid+URL';
  }
  
  // This function is no longer strictly necessary if all uploads are local,
  // but we'll keep it for any legacy data that might still use GDrive links.
  const driveRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  const match = url.match(driveRegex);

  if (match && match[1]) {
    const fileId = match[1];
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }

  // If it's already a local URL or another direct link, return as is.
  return url;
}

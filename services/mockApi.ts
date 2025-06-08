// src/services/mockApi.ts

import { LeakReport } from '@/types';

export const fetchReports = async (): Promise<LeakReport[]> => {
  try {
    // Replace the IP with your actual machine IP running the mock server
    const response = await fetch('http://192.168.8.121:3000/reports');
    
    if (!response.ok) {
      throw new Error(`Mock API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform raw data to ensure date fields are Date objects
    const reports: LeakReport[] = data.map((item: any) => ({
      ...item,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
      resolvedAt: item.resolvedAt ? new Date(item.resolvedAt) : undefined,
    }));

    return reports;

  } catch (error) {
    console.error('Failed to fetch mock reports:', error);
    return [];
  }
};

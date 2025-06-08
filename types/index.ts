export interface User {
  id: string;
  email: string;
  role: 'resident' | 'maintenance' | 'admin';
  displayName?: string;
  phoneNumber?: string;
  createdAt: Date;
}

export interface LeakReport {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  images: string[];
  status: 'pending' | 'assigned' | 'in-progress' | 'resolved' | 'closed';
  assignedTo?: string;
  assignedToName?: string;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

export type RootTabParamList = {
  index: undefined;
  report: undefined;
  map: undefined;
  profile: undefined;
};
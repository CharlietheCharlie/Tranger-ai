
export interface Activity {
  id: string;
  title: string;
  description?: string;
  startTime?: string; // HH:mm
  duration?: number; // minutes
  location?: string;
  cost?: number;
  tags?: string[];
  notes?: string;
}

export interface Day {
  id: string;
  date: string; // ISO date string
  activities: Activity[];
}

export interface Comment {
  id: string;
  text: string;
  authorId?: string | null;
  author?: User;
  tempAuthorId?: string | null;
  createdAt: string;
  activityId?: string; // Optional: Linked to specific activity
  imageUrl?: string;
}

export interface Itinerary {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  coverImage?: string;
  creatorId?: string | null;
  creator?: User;
  tempCreatorId?: string | null;
  days: Day[];
  collaborators: Collaborator[];
  comments: Comment[]; // Trip-level comments
}

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export type ViewMode = 'dashboard' | 'editor';

// For Drag and Drop
export type ActiveDragItem = {
  type: 'ACTIVITY' | 'DAY';
  id: string;
  data: Activity | Day;
  parentId?: string; // For activities, the day ID
};

export interface Collaborator {
  userId: string;
  itineraryId: string;
  user: User;
}
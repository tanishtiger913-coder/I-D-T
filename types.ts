export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // stored in mock db, not returned in session usually
  role: UserRole;
  preferencesLocked: boolean; // For students
}

export interface PreferenceOption {
  id: number; // 1-12
  title: string;
  description: string;
}

export interface Group {
  id: string;
  batchNumber: number; // 1-4
  optionId: number; // 1-12
  name: string;
  memberIds: string[];
  isLocked: boolean; // True if 6 members
}

export const PROJECT_SECTIONS = [
  { id: 1, label: 'Week 1–3' },
  { id: 2, label: 'Week 4–5' },
  { id: 3, label: 'Week 6–8' },
  { id: 4, label: 'Week 9–11' },
  { id: 5, label: 'Week 12–14' },
  { id: 6, label: 'Week 15–16' },
];

export interface SectionUpload {
  studentId: string;
  sectionId: number;
  fileName: string;
  fileUrl: string; // Mock URL
  uploadedAt: string;
  remark?: string; // Admin remark
}

export interface ChatMessage {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: number;
}

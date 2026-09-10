export interface Course {
  id: string;
  name: string;
  color: string;
  topics: Topic[];
  icon: string;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  courseId: string;
  noteCount: number;
  lastUpdated: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  courseId: string;
  topicId: string;
  type: 'text' | 'link' | 'code' | 'formula';
  description: string;
  tags: string[];
  color: string;
  isFavorite: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  linkedNoteIds: string[];
  fileIds: string[];
  aiSummary?: string;
}

export interface Homework {
  id: string;
  title: string;
  description: string;
  courseId: string;
  topicId: string;
  dueDate: string;
  dueTime: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'overdue';
  completedAt: string | null;
  fileIds: string[];
  notes: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  courseId: string;
  topicId: string;
  date: string;
  time: string;
  isRecurring: boolean;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'deferred';
  completedAt: string | null;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  category: 'study' | 'project' | 'research' | 'sport' | 'break' | 'notes' | 'exam';
  courseId: string;
  color: string;
  description: string;
}

export interface PDFFile {
  id: string;
  name: string;
  courseId: string;
  topicId: string;
  size: string;
  uploadedAt: string;
  updatedAt: string;
  description: string;
  tags: string[];
  isFavorite: boolean;
  isArchived: boolean;
  linkedNoteIds: string[];
}

export interface FileItem {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'txt' | 'image' | 'presentation' | 'other';
  size: string;
  courseId: string;
  topicId: string;
  uploadedAt: string;
  updatedAt: string;
  noteId: string | null;
  homeworkId: string | null;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'paused';
  progress: number;
  courseId: string;
  topicId: string;
  taskIds: string[];
  fileIds: string[];
  noteIds: string[];
  createdAt: string;
}

export interface Exam {
  id: string;
  name: string;
  courseId: string;
  topicId: string;
  date: string;
  time: string;
  type: 'quiz' | 'midterm' | 'final' | 'practice';
  note: string;
  result: number | null;
  topics: string[];
  createdAt: string;
}

export interface StudySession {
  id: string;
  courseId: string;
  topicId: string;
  startTime: string;
  endTime: string;
  duration: number;
  notes: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'homework' | 'exam' | 'task' | 'calendar' | 'file' | 'general';
  isRead: boolean;
  createdAt: string;
  linkTo: string;
}

export interface UserSettings {
  username: string;
  theme: 'dark' | 'light';
  notifications: boolean;
  storageUsed: number;
  storageTotal: number;
}

// New types for auth and chat
export type Grade = '9' | '10' | '11' | '12';
export type Section = 'A' | 'B' | 'C' | 'D' | 'E';
export type ClassCode = `${Grade}${Section}`;

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  grade: Grade;
  section: Section;
  classCode: ClassCode;
  avatar: string;
  createdAt: string;
  bio: string;
}

export interface ChatMessage {
  id: string;
  classCode: ClassCode;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
  type: 'text' | 'system';
}

export interface ChatGroup {
  classCode: ClassCode;
  name: string;
  memberCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
}

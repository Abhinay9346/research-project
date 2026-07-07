export type Role = 'chairman' | 'guide' | 'scholar' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
  avatarUrl?: string;
}

export interface Scholar {
  id: string;
  name: string;
  email: string;
  department: string;
  guideId: string;
  guideName: string;
  researchArea: string;
  registrationDate: string;
  status: 'active' | 'submitted' | 'completed' | 'on_leave';
  progress: number;
  milestones: Milestone[];
  achievements: string[];
  publicationsCount: number;
  weeklyLogsCount: number;
}

export interface Milestone {
  id: string;
  title: string;
  targetDate: string;
  completedDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
}

export interface WeeklyLog {
  id: string;
  scholarId: string;
  scholarName: string;
  guideId?: string;
  weekDate: string;
  researchWork: string;
  hoursWorked: number;
  problemsFaced: string;
  futurePlan: string;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'revision';
  guideComment?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export interface Publication {
  id: string;
  scholarId: string;
  scholarName: string;
  title: string;
  doi: string;
  journal: string;
  conference?: string;
  issn?: string;
  indexing: string[];
  apcPaid: boolean;
  journalLink: string;
  status: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'published' | 'rejected';
  acceptanceLetterUrl?: string;
  paperUrl?: string;
  verified: boolean;
  publishedDate?: string;
}

export interface CommitteeMeeting {
  id: string;
  scholarId: string;
  scholarName: string;
  title: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  agenda: string;
  minutes?: string;
  recommendations?: string;
  attendees: string[];
  minutesUrl?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  scholarsCount: number;
  guidesCount: number;
  publicationsCount: number;
  hod: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: 'low' | 'medium' | 'high';
  author: string;
}

export interface Notification {
  id: string;
  type: 'meeting' | 'log' | 'publication' | 'deadline' | 'system';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface ResearchProject {
  id: string;
  scholarId: string;
  projectTitle: string;
  projectDescription: string;
  researchDomain: string;
  technologiesUsed: string[];
  majorContributions: string;
  relatedPublications: string;
  progressPercentage: number;
  uploadedReports: string[];
  thesisStatus: 'not_started' | 'in_progress' | 'submitted' | 'under_review' | 'approved' | 'rejected';
}

export interface GuideExplanation {
  id: string;
  scholarId: string;
  guideName: string;
  reasonForDelay: string;
  challengesFaced: string;
  currentProgress: string;
  expectedCompletionDate?: string;
  additionalRemarks: string;
  digitalSignature: string;
  updatedAt: string;
}

export interface ChairmanReview {
  id: string;
  scholarId: string;
  observation: string;
  comments: string;
  recommendations: string;
  requiredActions: string;
  newDeadline?: string;
  reviewStatus: 'accepted' | 'continue_research' | 'needs_immediate_attention' | 'extension_recommended' | 'extension_rejected';
  chairmanName: string;
  updatedAt: string;
}

import type {
  Scholar,
  WeeklyLog,
  Publication,
  CommitteeMeeting,
  Department,
  Announcement,
  Notification,
} from './types';



export const mockDepartments: Department[] = [
  { id: 'd1', name: 'Computer Science & Engineering', code: 'CSE', scholarsCount: 48, guidesCount: 12, publicationsCount: 156, hod: 'Prof. Rajesh Kumar' },
  { id: 'd2', name: 'Electronics & Communication', code: 'ECE', scholarsCount: 52, guidesCount: 14, publicationsCount: 134, hod: 'Prof. S. Menon' },
  { id: 'd3', name: 'Mechanical Engineering', code: 'ME', scholarsCount: 41, guidesCount: 11, publicationsCount: 98, hod: 'Prof. A. Gupta' },
  { id: 'd4', name: 'Electrical Engineering', code: 'EE', scholarsCount: 38, guidesCount: 10, publicationsCount: 112, hod: 'Prof. R. Singh' },
  { id: 'd5', name: 'Civil Engineering', code: 'CE', scholarsCount: 34, guidesCount: 9, publicationsCount: 76, hod: 'Prof. M. Reddy' },
  { id: 'd6', name: 'Chemical Engineering', code: 'CH', scholarsCount: 29, guidesCount: 8, publicationsCount: 64, hod: 'Prof. K. Nair' },
];

export const mockScholars: Scholar[] = [
  {
    id: 's1', name: 'Arun Patel', email: 'scholar@iit.edu', department: 'CSE',
    guideId: 'u2', guideName: 'Dr. Priya Sharma', researchArea: 'Machine Learning for Medical Imaging',
    registrationDate: '2022-08-15', status: 'active', progress: 62,
    milestones: [
      { id: 'm1', title: 'Coursework Completion', targetDate: '2023-06-30', completedDate: '2023-05-18', status: 'completed' },
      { id: 'm2', title: 'Comprehensive Exam', targetDate: '2023-12-15', completedDate: '2023-11-22', status: 'completed' },
      { id: 'm3', title: 'Proposal Defense', targetDate: '2024-06-30', completedDate: '2024-05-10', status: 'completed' },
      { id: 'm4', title: 'Mid-Seminar', targetDate: '2025-03-15', status: 'in_progress' },
      { id: 'm5', title: 'Open Defense', targetDate: '2026-08-15', status: 'pending' },
    ],
    achievements: ['Best Paper Award - ICML 2024', 'Travel Grant - IEEE', 'Patent Filed (2024)'],
    publicationsCount: 4, weeklyLogsCount: 87,
  },
  {
    id: 's2', name: 'Sneha Reddy', email: 'sneha@iit.edu', department: 'CSE',
    guideId: 'u2', guideName: 'Dr. Priya Sharma', researchArea: 'Natural Language Processing',
    registrationDate: '2021-12-01', status: 'active', progress: 78,
    milestones: [
      { id: 'm1', title: 'Coursework Completion', targetDate: '2022-10-30', completedDate: '2022-09-15', status: 'completed' },
      { id: 'm2', title: 'Comprehensive Exam', targetDate: '2023-04-15', completedDate: '2023-03-20', status: 'completed' },
      { id: 'm3', title: 'Proposal Defense', targetDate: '2023-10-30', completedDate: '2023-10-05', status: 'completed' },
      { id: 'm4', title: 'Mid-Seminar', targetDate: '2024-06-15', completedDate: '2024-05-28', status: 'completed' },
      { id: 'm5', title: 'Open Defense', targetDate: '2025-06-15', status: 'in_progress' },
    ],
    achievements: ['ACL 2023 Outstanding Paper', 'Google PhD Fellowship Nominee'],
    publicationsCount: 7, weeklyLogsCount: 124,
  },
  {
    id: 's3', name: 'Vikram Singh', email: 'vikram@iit.edu', department: 'CSE',
    guideId: 'u2', guideName: 'Dr. Priya Sharma', researchArea: 'Distributed Systems',
    registrationDate: '2023-01-10', status: 'active', progress: 34,
    milestones: [
      { id: 'm1', title: 'Coursework Completion', targetDate: '2023-11-30', completedDate: '2023-11-12', status: 'completed' },
      { id: 'm2', title: 'Comprehensive Exam', targetDate: '2024-06-15', status: 'in_progress' },
      { id: 'm3', title: 'Proposal Defense', targetDate: '2025-01-15', status: 'pending' },
      { id: 'm4', title: 'Mid-Seminar', targetDate: '2025-09-15', status: 'pending' },
      { id: 'm5', title: 'Open Defense', targetDate: '2027-01-15', status: 'pending' },
    ],
    achievements: ['Best Demo Award - SIGCOMM 2024'],
    publicationsCount: 2, weeklyLogsCount: 45,
  },
  {
    id: 's4', name: 'Ananya Iyer', email: 'ananya@iit.edu', department: 'CSE',
    guideId: 'u2', guideName: 'Dr. Priya Sharma', researchArea: 'Computer Vision',
    registrationDate: '2020-07-20', status: 'submitted', progress: 95,
    milestones: [
      { id: 'm1', title: 'Coursework Completion', targetDate: '2021-06-30', completedDate: '2021-05-10', status: 'completed' },
      { id: 'm2', title: 'Comprehensive Exam', targetDate: '2021-12-15', completedDate: '2021-11-18', status: 'completed' },
      { id: 'm3', title: 'Proposal Defense', targetDate: '2022-06-30', completedDate: '2022-05-22', status: 'completed' },
      { id: 'm4', title: 'Mid-Seminar', targetDate: '2023-03-15', completedDate: '2023-02-28', status: 'completed' },
      { id: 'm5', title: 'Open Defense', targetDate: '2025-01-15', completedDate: '2024-12-20', status: 'completed' },
    ],
    achievements: ['CVPR Best Paper Honorable Mention', '2 Patents Granted', 'IBM PhD Fellowship'],
    publicationsCount: 11, weeklyLogsCount: 198,
  },
];

export const mockWeeklyLogs: WeeklyLog[] = [
  {
    id: 'wl1', scholarId: 's1', scholarName: 'Arun Patel', weekDate: '2025-06-30',
    researchWork: 'Implemented U-Net architecture for tumor segmentation. Trained on BraTS dataset with 5-fold cross-validation. Achieved 89% Dice coefficient.',
    hoursWorked: 42, problemsFaced: 'GPU memory constraints with 3D volumes. Resolved by patch-based training.',
    futurePlan: 'Experiment with attention mechanisms and transformer-based models.',
    approvalStatus: 'pending', submittedAt: '2025-07-01T10:00:00Z',
  },
  {
    id: 'wl2', scholarId: 's1', scholarName: 'Arun Patel', weekDate: '2025-06-23',
    researchWork: 'Literature review on transformer-based segmentation models. Identified 12 relevant papers for comparative study.',
    hoursWorked: 38, problemsFaced: 'Limited availability of annotated 3D medical datasets.',
    futurePlan: 'Begin implementation of Swin-UNETR model.',
    approvalStatus: 'approved', guideComment: 'Good progress. Focus on data augmentation strategies next.',
    submittedAt: '2025-06-24T09:00:00Z', reviewedAt: '2025-06-25T14:00:00Z',
  },
  {
    id: 'wl3', scholarId: 's1', scholarName: 'Arun Patel', weekDate: '2025-06-16',
    researchWork: 'Data preprocessing pipeline for BraTS 2024 dataset. Normalized intensities, handled missing slices.',
    hoursWorked: 40, problemsFaced: 'Inconsistent slice thickness across MRI scans.',
    futurePlan: 'Complete U-Net baseline implementation.',
    approvalStatus: 'approved', guideComment: 'Solid preprocessing work. Document the pipeline for reproducibility.',
    submittedAt: '2025-06-17T11:00:00Z', reviewedAt: '2025-06-18T16:00:00Z',
  },
  {
    id: 'wl4', scholarId: 's2', scholarName: 'Sneha Reddy', weekDate: '2025-06-30',
    researchWork: 'Fine-tuned LLaMA-3 on domain-specific corpus. Evaluated on custom benchmark for clinical NER.',
    hoursWorked: 45, problemsFaced: 'Catastrophic forgetting in multi-task setting.',
    futurePlan: 'Explore LoRA adapters for task-specific tuning.',
    approvalStatus: 'pending', submittedAt: '2025-07-01T08:00:00Z',
  },
  {
    id: 'wl5', scholarId: 's3', scholarName: 'Vikram Singh', weekDate: '2025-06-30',
    researchWork: 'Designed consensus protocol for geo-distributed key-value store. Ran preliminary benchmarks on AWS.',
    hoursWorked: 36, problemsFaced: 'Network latency variance affecting quorum stability.',
    futurePlan: 'Implement adaptive timeout mechanism.',
    approvalStatus: 'revision', guideComment: 'Need more rigorous evaluation. Add comparison with Raft and Paxos baselines.',
    submittedAt: '2025-06-30T15:00:00Z', reviewedAt: '2025-07-02T10:00:00Z',
  },
  {
    id: 'wl6', scholarId: 's2', scholarName: 'Sneha Reddy', weekDate: '2025-06-23',
    researchWork: 'Submitted camera-ready version to EMNLP. Finalized supplementary materials.',
    hoursWorked: 41, problemsFaced: 'Page limit constraints for system description.',
    futurePlan: 'Begin work on multilingual extension.',
    approvalStatus: 'approved', guideComment: 'Excellent. Congratulations on the acceptance!',
    submittedAt: '2025-06-24T12:00:00Z', reviewedAt: '2025-06-25T09:00:00Z',
  },
];

export const mockPublications: Publication[] = [
  {
    id: 'p1', scholarId: 's1', scholarName: 'Arun Patel',
    title: 'Attention-Enhanced U-Net for Brain Tumor Segmentation in Multi-Modal MRI',
    doi: '10.1109/TMI.2024.1234567', journal: 'IEEE Transactions on Medical Imaging',
    issn: '0278-0062', indexing: ['SCI', 'SCIE', 'Scopus', 'Web of Science'],
    apcPaid: false, journalLink: 'https://ieeexplore.ieee.org/...',
    status: 'published', verified: true, publishedDate: '2024-09-15',
  },
  {
    id: 'p2', scholarId: 's1', scholarName: 'Arun Patel',
    title: 'Transformer-Based Approaches for Medical Image Analysis: A Comprehensive Survey',
    doi: '10.1145/3696444', journal: 'ACM Computing Surveys',
    issn: '0360-0300', indexing: ['SCI', 'SCIE', 'Scopus', 'UGC CARE'],
    apcPaid: true, journalLink: 'https://dl.acm.org/...',
    status: 'accepted', verified: true,
  },
  {
    id: 'p3', scholarId: 's1', scholarName: 'Arun Patel',
    title: 'Self-Supervised Pre-training for 3D Medical Image Segmentation',
    doi: '', journal: 'Conference on Computer Vision and Pattern Recognition',
    conference: 'CVPR 2025', indexing: ['Scopus'],
    apcPaid: false, journalLink: 'https://cvpr.thecvf.com/...',
    status: 'under_review', verified: false,
  },
  {
    id: 'p4', scholarId: 's2', scholarName: 'Sneha Reddy',
    title: 'Domain-Adaptive Fine-tuning of Large Language Models for Clinical NER',
    doi: '10.18653/v1/2024.emnlp-main.123', journal: 'EMNLP 2024',
    conference: 'EMNLP', indexing: ['Scopus', 'ACL Anthology'],
    apcPaid: false, journalLink: 'https://aclanthology.org/...',
    status: 'published', verified: true, publishedDate: '2024-11-12',
  },
  {
    id: 'p5', scholarId: 's2', scholarName: 'Sneha Reddy',
    title: 'Multilingual Clinical Text Understanding via Cross-Lingual Transfer',
    doi: '10.1162/tacl_a_00678', journal: 'Transactions of the Association for Computational Linguistics',
    issn: '2307-387X', indexing: ['SCI', 'SCIE', 'Scopus', 'UGC CARE', 'Web of Science'],
    apcPaid: true, journalLink: 'https://direct.mit.edu/...',
    status: 'published', verified: true, publishedDate: '2024-03-20',
  },
  {
    id: 'p6', scholarId: 's3', scholarName: 'Vikram Singh',
    title: 'Geo-Distributed Consensus: An Adaptive Approach',
    doi: '', journal: 'ACM SIGCOMM',
    conference: 'SIGCOMM 2025', indexing: ['Scopus'],
    apcPaid: false, journalLink: 'https://conferences.sigcomm.org/...',
    status: 'submitted', verified: false,
  },
];

export const mockMeetings: CommitteeMeeting[] = [
  {
    id: 'mt1', scholarId: 's1', scholarName: 'Arun Patel',
    title: 'Mid-Seminar Review', date: '2025-07-15', time: '14:00',
    status: 'scheduled', agenda: 'Review progress on tumor segmentation research. Discuss transformer model results and plan for defense preparation.',
    attendees: ['Dr. Priya Sharma', 'Prof. Rajesh Kumar', 'Dr. A. Verma', 'Dr. S. Nair'],
  },
  {
    id: 'mt2', scholarId: 's2', scholarName: 'Sneha Reddy',
    title: 'Pre-Defense Committee Meeting', date: '2025-07-22', time: '10:00',
    status: 'scheduled', agenda: 'Final review of thesis chapters. Discuss publication strategy and timeline for open defense.',
    attendees: ['Dr. Priya Sharma', 'Prof. Rajesh Kumar', 'Dr. M. Krishnan', 'Dr. R. Iyer'],
  },
  {
    id: 'mt3', scholarId: 's4', scholarName: 'Ananya Iyer',
    title: 'Thesis Submission Review', date: '2024-12-10', time: '15:00',
    status: 'completed', agenda: 'Final thesis review before submission.',
    minutes: 'Committee approved thesis for submission. Minor revisions suggested in Chapter 4 regarding experimental setup clarity.',
    recommendations: '1. Add comparison table with SOTA methods. 2. Include ablation study details. 3. Update references.',
    attendees: ['Dr. Priya Sharma', 'Prof. Rajesh Kumar', 'Dr. A. Verma', 'Dr. S. Nair'],
  },
];

export const mockAnnouncements: Announcement[] = [
  { id: 'a1', title: 'Mid-Seminar Schedule Released', content: 'The mid-seminar schedule for July 2025 has been published. All scholars must confirm their slot by July 10.', date: '2025-07-03', priority: 'high', author: 'Chairman Office' },
  { id: 'a2', title: 'Weekly Log Submission Reminder', content: 'Scholars are reminded to submit weekly logs by Monday 9 AM. Late submissions require prior approval from guide.', date: '2025-07-01', priority: 'medium', author: 'Research Office' },
  { id: 'a3', title: 'New Publication Policy', content: 'Updated APC reimbursement policy effective August 2025. Please review the guidelines on the portal.', date: '2025-06-28', priority: 'medium', author: 'Admin Office' },
];

export const mockNotifications: Notification[] = [
  { id: 'n1', type: 'log', title: 'Weekly Log Pending Review', message: 'Arun Patel submitted a weekly log awaiting your review.', date: '2025-07-01', read: false },
  { id: 'n2', type: 'meeting', title: 'Committee Meeting Tomorrow', message: 'Mid-Seminar Review for Arun Patel scheduled for July 15 at 2 PM.', date: '2025-07-14', read: false },
  { id: 'n3', type: 'publication', title: 'Publication Verified', message: 'Your publication in IEEE TMI has been verified by the research office.', date: '2025-06-20', read: true },
  { id: 'n4', type: 'deadline', title: 'Thesis Submission Deadline', message: 'Sneha Reddy - thesis submission deadline approaching on August 30.', date: '2025-06-15', read: true },
];

export const monthlyLogData = [
  { month: 'Jan', logs: 18, approved: 16, pending: 2 },
  { month: 'Feb', logs: 20, approved: 19, pending: 1 },
  { month: 'Mar', logs: 22, approved: 20, pending: 2 },
  { month: 'Apr', logs: 19, approved: 17, pending: 2 },
  { month: 'May', logs: 21, approved: 19, pending: 2 },
  { month: 'Jun', logs: 24, approved: 21, pending: 3 },
  { month: 'Jul', logs: 6, approved: 3, pending: 3 },
];

export const publicationTrendData = [
  { year: '2021', publications: 42, citations: 128 },
  { year: '2022', publications: 58, citations: 214 },
  { year: '2023', publications: 71, citations: 386 },
  { year: '2024', publications: 89, citations: 612 },
  { year: '2025', publications: 34, citations: 287 },
];

export const departmentComparisonData = [
  { dept: 'CSE', scholars: 48, publications: 156 },
  { dept: 'ECE', scholars: 52, publications: 134 },
  { dept: 'ME', scholars: 41, publications: 98 },
  { dept: 'EE', scholars: 38, publications: 112 },
  { dept: 'CE', scholars: 34, publications: 76 },
  { dept: 'CH', scholars: 29, publications: 64 },
];

export const indexingDistribution = [
  { name: 'SCI/SCIE', value: 42, color: 'hsl(var(--chart-1))' },
  { name: 'Scopus', value: 78, color: 'hsl(var(--chart-2))' },
  { name: 'UGC CARE', value: 56, color: 'hsl(var(--chart-3))' },
  { name: 'ESCI', value: 28, color: 'hsl(var(--chart-4))' },
  { name: 'Others', value: 14, color: 'hsl(var(--chart-5))' },
];

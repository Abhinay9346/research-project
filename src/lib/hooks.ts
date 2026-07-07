import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import type { WeeklyLog, Publication, CommitteeMeeting, Announcement } from './types';

interface RawWeeklyLog {
  id: string;
  scholar_id: string;
  scholar_name: string;
  guide_id: string | null;
  week_date: string;
  research_work: string;
  hours_worked: number;
  problems_faced: string;
  future_plan: string;
  approval_status: WeeklyLog['approvalStatus'];
  guide_comment: string | null;
  submitted_at: string;
  reviewed_at: string | null;
}

interface RawPublication {
  id: string;
  scholar_id: string;
  scholar_name: string;
  title: string;
  doi: string;
  journal: string;
  conference: string;
  issn: string;
  indexing: string[];
  apc_paid: boolean;
  journal_link: string;
  status: Publication['status'];
  verified: boolean;
  published_date: string | null;
}

interface RawMeeting {
  id: string;
  scholar_id: string;
  scholar_name: string;
  title: string;
  meeting_date: string;
  meeting_time: string;
  status: CommitteeMeeting['status'];
  agenda: string;
  minutes: string;
  recommendations: string;
  attendees: string[];
}

interface RawAnnouncement {
  id: string;
  title: string;
  content: string;
  priority: Announcement['priority'];
  author: string;
  created_at: string;
}

function mapLog(r: RawWeeklyLog): WeeklyLog {
  return {
    id: r.id,
    scholarId: r.scholar_id,
    scholarName: r.scholar_name,
    guideId: r.guide_id || undefined,
    weekDate: r.week_date,
    researchWork: r.research_work,
    hoursWorked: r.hours_worked,
    problemsFaced: r.problems_faced,
    futurePlan: r.future_plan,
    approvalStatus: r.approval_status,
    guideComment: r.guide_comment || undefined,
    submittedAt: r.submitted_at,
    reviewedAt: r.reviewed_at || undefined,
  };
}

function mapPub(r: RawPublication): Publication {
  return {
    id: r.id,
    scholarId: r.scholar_id,
    scholarName: r.scholar_name,
    title: r.title,
    doi: r.doi,
    journal: r.journal,
    conference: r.conference || undefined,
    issn: r.issn || undefined,
    indexing: r.indexing || [],
    apcPaid: r.apc_paid,
    journalLink: r.journal_link,
    status: r.status,
    verified: r.verified,
    publishedDate: r.published_date || undefined,
  };
}

function mapMeeting(r: RawMeeting): CommitteeMeeting {
  return {
    id: r.id,
    scholarId: r.scholar_id,
    scholarName: r.scholar_name,
    title: r.title,
    date: r.meeting_date,
    time: r.meeting_time,
    status: r.status,
    agenda: r.agenda,
    minutes: r.minutes || undefined,
    recommendations: r.recommendations || undefined,
    attendees: r.attendees || [],
  };
}

function mapAnnouncement(r: RawAnnouncement): Announcement {
  return {
    id: r.id,
    title: r.title,
    content: r.content,
    priority: r.priority,
    author: r.author,
    date: r.created_at,
  };
}

export function useWeeklyLogs() {
  const [logs, setLogs] = useState<WeeklyLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('weekly_logs')
        .select('*')
        .order('week_date', { ascending: false });
      if (!error && data) {
        setLogs((data as unknown as RawWeeklyLog[]).map(mapLog));
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return { logs, loading, refetch: fetchLogs };
}

export function usePublications() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPublications = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('publications')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setPublications((data as unknown as RawPublication[]).map(mapPub));
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPublications();
  }, [fetchPublications]);

  return { publications, loading, refetch: fetchPublications };
}

export function useMeetings() {
  const [meetings, setMeetings] = useState<CommitteeMeeting[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('committee_meetings')
        .select('*')
        .order('meeting_date', { ascending: true });
      if (!error && data) {
        setMeetings((data as unknown as RawMeeting[]).map(mapMeeting));
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  return { meetings, loading, refetch: fetchMeetings };
}

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setAnnouncements((data as unknown as RawAnnouncement[]).map(mapAnnouncement));
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  return { announcements, loading, refetch: fetchAnnouncements };
}

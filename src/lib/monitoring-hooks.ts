import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import type { ResearchProject, GuideExplanation, ChairmanReview } from './types';

interface RawResearchProject {
  id: string;
  scholar_id: string;
  project_title: string;
  project_description: string;
  research_domain: string;
  technologies_used: string[];
  major_contributions: string;
  related_publications: string;
  progress_percentage: number;
  uploaded_reports: string[];
  thesis_status: ResearchProject['thesisStatus'];
}

interface RawGuideExplanation {
  id: string;
  scholar_id: string;
  guide_name: string;
  reason_for_delay: string;
  challenges_faced: string;
  current_progress: string;
  expected_completion_date: string | null;
  additional_remarks: string;
  digital_signature: string;
  updated_at: string;
}

interface RawChairmanReview {
  id: string;
  scholar_id: string;
  observation: string;
  comments: string;
  recommendations: string;
  required_actions: string;
  new_deadline: string | null;
  review_status: ChairmanReview['reviewStatus'];
  chairman_name: string;
  updated_at: string;
}

function mapProject(r: RawResearchProject): ResearchProject {
  return {
    id: r.id,
    scholarId: r.scholar_id,
    projectTitle: r.project_title,
    projectDescription: r.project_description,
    researchDomain: r.research_domain,
    technologiesUsed: r.technologies_used || [],
    majorContributions: r.major_contributions,
    relatedPublications: r.related_publications,
    progressPercentage: r.progress_percentage,
    uploadedReports: r.uploaded_reports || [],
    thesisStatus: r.thesis_status,
  };
}

function mapExplanation(r: RawGuideExplanation): GuideExplanation {
  return {
    id: r.id,
    scholarId: r.scholar_id,
    guideName: r.guide_name,
    reasonForDelay: r.reason_for_delay,
    challengesFaced: r.challenges_faced,
    currentProgress: r.current_progress,
    expectedCompletionDate: r.expected_completion_date || undefined,
    additionalRemarks: r.additional_remarks,
    digitalSignature: r.digital_signature,
    updatedAt: r.updated_at,
  };
}

function mapReview(r: RawChairmanReview): ChairmanReview {
  return {
    id: r.id,
    scholarId: r.scholar_id,
    observation: r.observation,
    comments: r.comments,
    recommendations: r.recommendations,
    requiredActions: r.required_actions,
    newDeadline: r.new_deadline || undefined,
    reviewStatus: r.review_status,
    chairmanName: r.chairman_name,
    updatedAt: r.updated_at,
  };
}

export function useResearchProjects() {
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('research_projects').select('*');
      if (!error && data) {
        setProjects((data as unknown as RawResearchProject[]).map(mapProject));
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);
  return { projects, loading, refetch: fetchProjects };
}

export function useGuideExplanations() {
  const [explanations, setExplanations] = useState<GuideExplanation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExplanations = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('guide_explanations').select('*');
      if (!error && data) {
        setExplanations((data as unknown as RawGuideExplanation[]).map(mapExplanation));
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchExplanations(); }, [fetchExplanations]);
  return { explanations, loading, refetch: fetchExplanations };
}

export function useChairmanReviews() {
  const [reviews, setReviews] = useState<ChairmanReview[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('chairman_reviews').select('*').order('updated_at', { ascending: false });
      if (!error && data) {
        setReviews((data as unknown as RawChairmanReview[]).map(mapReview));
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);
  return { reviews, loading, refetch: fetchReviews };
}

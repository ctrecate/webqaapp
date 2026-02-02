export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface IssuesFound {
  text: string;
  images: string[];
}

export interface ChecklistSection {
  sectionId: string;
  sectionTitle: string;
  items: ChecklistItem[];
  issuesFound: IssuesFound;
  completed: boolean;
}

export interface ChecklistCategory {
  category: string;
  sections: ChecklistSection[];
}

export interface PrioritySummary {
  critical: string[];
  high: string[];
  medium: string[];
  low: string[];
}

export interface QAReport {
  id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  website_name: string;
  url: string;
  date_reviewed: string;
  reviewer_name: string;
  priority_level: 'low' | 'medium' | 'high';
  checklist_data: ChecklistCategory[];
  overall_rating?: 'excellent' | 'good' | 'fair' | 'poor';
  priority_summary: PrioritySummary;
  next_steps: string[];
  status: 'draft' | 'completed';
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Revision {
  id: string;
  qa_report_id: string;
  revised_by: string;
  revised_at: string;
  changes: any;
  revision_note: string | null;
}

export interface Comment {
  id: string;
  qa_report_id: string;
  user_id: string;
  section_key: string;
  comment_text: string;
  created_at: string;
}


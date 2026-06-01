// ============================================================================
// Core Entities (P0)
// ============================================================================

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  category: string;
  type: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'paused' | 'abandoned';
  health_score: number;
  xp_earned: number;
  onboarding_completed?: boolean;
  availability?: Record<string, any>;
  template?: string;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  goal_id: string;
  title: string;
  description: string;
  target_date: string;
  status: 'pending' | 'in_progress' | 'completed';
  xp_value: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  milestone_id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  xp_value: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// DSA Module Entities (P1)
// ============================================================================

export interface DSAProblem {
  id: string;
  sheet_topic: string;
  sheet_subtopic?: string;
  title: string;
  striver_order: number;
  platform_link?: string;
}

export interface DSAProgress {
  id: string;
  user_id: string;
  problem_id: string;
  goal_id: string;
  status: 'unsolved' | 'attempted' | 'solved' | 'revision';
  my_difficulty?: 'easy' | 'medium' | 'hard';
  time_taken_mins?: number;
  solved_at?: string;
  submission_link?: string;
  video_solution_link?: string;
  approach_notes?: string;
  key_insight?: string;
  revision_flag: boolean;
  revision_count: number;
  last_revised_at?: string;
  xp_awarded: number;
  problem: DSAProblem;
  created_at: string;
  updated_at: string;
}

export interface DSASheetRow {
  progress_id: string;
  problem: DSAProblem;
  status: 'unsolved' | 'attempted' | 'solved' | 'revision';
  my_difficulty?: 'easy' | 'medium' | 'hard';
  time_taken_mins?: number;
  revision_flag: boolean;
  revision_count: number;
  xp_awarded: number;
}

export interface DSASubtopicGroup {
  subtopic: string;
  rows: DSASheetRow[];
}

export interface DSATopicGroup {
  topic: string;
  total: number;
  solved: number;
  subtopics: DSASubtopicGroup[];
}

export interface TopicStat {
  total: number;
  solved: number;
  attempted: number;
  percent: number;
}

export interface DSASheetSummary {
  total: number;
  solved: number;
  attempted: number;
  revision: number;
  unsolved: number;
  percent_solved: number;
  by_topic: Record<string, TopicStat>;
}

// ============================================================================
// Notes Module Entities (P1)
// ============================================================================

export interface NotePage {
  id: string;
  goal_id: string;
  title: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface NoteBlock {
  id: string;
  page_id: string;
  type: string;
  content: Record<string, any>;
  sort_order: number;
  created_at: string;
}

export interface NotePageWithBlocks extends NotePage {
  blocks: NoteBlock[];
}

// ============================================================================
// API Payloads
// ============================================================================

export interface DSAProgressUpdate {
  status?: 'unsolved' | 'attempted' | 'solved' | 'revision';
  my_difficulty?: 'easy' | 'medium' | 'hard';
  time_taken_mins?: number;
  approach_notes?: string;
  key_insight?: string;
  revision_flag?: boolean;
}

export interface NoteBlockData {
  type: string;
  content: Record<string, any>;
  sort_order?: number;
}

export interface SaveBlocksRequest {
  blocks: NoteBlockData[];
}

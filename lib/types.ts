export type WorkspaceType = 'concurso' | 'faculdade' | 'taf' | 'custom';

export interface UserProfile {
  id: string;
  name: string | null;
  prefs: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  owner_id: string;
  name: string;
  type: WorkspaceType;
  active: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  workspace_id: string;
  name: string;
  color: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  subject_id: string;
  parent_id: string | null;
  name: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  workspace_id: string;
  subject_id: string | null;
  topic_id: string | null;
  statement: string;
  choices: string[];
  answer_correct: number | null;
  answer_user: number | null;
  spent_seconds: number;
  source: string | null;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard' | null;
  created_at: string;
  updated_at: string;
}

export interface Reading {
  id: string;
  workspace_id: string;
  subject_id: string | null;
  isbn: string | null;
  title: string;
  author: string | null;
  publisher: string | null;
  cover_url: string | null;
  stars: number | null;
  review: string | null;
  comments: string | null;
  date_published: string | null;
  created_at: string;
  updated_at: string;
}

export interface TafTraining {
  id: string;
  workspace_id: string;
  training_date: string;
  kind: 'caminhada' | 'corrida' | 'circuito' | 'forca';
  distance_m: number;
  time_s: number;
  modality: string;
  pushups: number;
  situps: number;
  bar_time_s: number;
  jump_cm: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  workspace_id: string;
  user_id: string;
  session_type: 'study' | 'reading' | 'training';
  start_at: string;
  end_at: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ISBNBookData {
  isbn: string;
  title: string;
  authors: string[];
  publisher: string;
  image: string;
  date_published: string;
}

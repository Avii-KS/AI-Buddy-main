export interface Student {
  id: string;
  name: string;
  age?: number;
  grade?: string;
  curriculum: string;
  preferred_language: string;
  learning_style?: string;
  created_at: string;
  last_active: string;
}

export interface Query {
  id: string;
  student_id: string;
  query_text: string;
  detected_intent?: string;
  detected_language?: string;
  detected_age_group?: string;
  detected_subject?: string;
  complexity_level?: string;
  created_at: string;
}

export interface Response {
  id: string;
  query_id: string;
  template_used?: string;
  response_text: string;
  generation_time_ms: number;
  tokens_used: number;
  created_at: string;
}

export interface Feedback {
  id?: string;
  response_id: string;
  rating?: number;
  thumbs_up?: boolean;
  comment?: string;
  time_spent_seconds?: number;
  follow_up_asked?: boolean;
  activity_completed?: boolean;
}

export interface PromptTemplate {
  id: string;
  template_name: string;
  intent_type: string;
  language: string;
  age_group?: string;
  template_content: string;
  version: number;
  is_active: boolean;
  performance_score: number;
}

export interface ClassificationResult {
  intent: string;
  language: string;
  ageGroup: string;
  subject: string;
  complexity: string;
  confidence: number;
}

export interface AnalyticsSummary {
  date: string;
  total_queries: number;
  unique_students: number;
  avg_rating: number;
  avg_response_time_ms: number;
  follow_up_rate: number;
  activity_completion_rate: number;
}

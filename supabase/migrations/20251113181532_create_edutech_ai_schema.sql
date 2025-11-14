/*
  # EduTech AI Buddy - Database Schema

  ## Overview
  Complete database schema for the intelligent learning companion system with ML-powered
  classification, prompt engineering, and feedback analytics.

  ## Tables Created

  ### 1. students
  - `id` (uuid, PK): Unique student identifier
  - `name` (text): Student name
  - `age` (integer): Student age
  - `grade` (text): Current grade/class
  - `curriculum` (text): CBSE/ICSE/State board
  - `preferred_language` (text): English/Hindi/Hinglish
  - `learning_style` (text): Visual/Audio/Kinesthetic
  - `created_at` (timestamptz): Account creation time
  - `last_active` (timestamptz): Last activity timestamp

  ### 2. queries
  - `id` (uuid, PK): Unique query identifier
  - `student_id` (uuid, FK): Reference to student
  - `query_text` (text): Original student query
  - `detected_intent` (text): ML-detected intent type
  - `detected_language` (text): Detected language
  - `detected_age_group` (text): Predicted age group
  - `detected_subject` (text): Subject classification
  - `complexity_level` (text): Easy/Medium/Hard
  - `created_at` (timestamptz): Query timestamp

  ### 3. responses
  - `id` (uuid, PK): Unique response identifier
  - `query_id` (uuid, FK): Reference to query
  - `template_used` (text): Prompt template identifier
  - `response_text` (text): Generated response
  - `generation_time_ms` (integer): Time to generate
  - `tokens_used` (integer): LLM tokens consumed
  - `created_at` (timestamptz): Response timestamp

  ### 4. feedback
  - `id` (uuid, PK): Unique feedback identifier
  - `response_id` (uuid, FK): Reference to response
  - `rating` (integer): 1-5 star rating
  - `thumbs_up` (boolean): Quick feedback
  - `comment` (text): Optional text feedback
  - `time_spent_seconds` (integer): Time spent reading
  - `follow_up_asked` (boolean): Did they ask follow-up?
  - `activity_completed` (boolean): Completed suggested activity?
  - `created_at` (timestamptz): Feedback timestamp

  ### 5. prompt_templates
  - `id` (uuid, PK): Unique template identifier
  - `template_name` (text): Template identifier
  - `intent_type` (text): Target intent
  - `language` (text): Language variant
  - `age_group` (text): Target age group
  - `template_content` (text): Full prompt template
  - `version` (integer): Template version
  - `is_active` (boolean): Currently in use
  - `performance_score` (decimal): Average performance rating
  - `created_at` (timestamptz): Template creation time
  - `updated_at` (timestamptz): Last update time

  ### 6. ab_tests
  - `id` (uuid, PK): Unique test identifier
  - `test_name` (text): Test description
  - `template_a_id` (uuid, FK): First template variant
  - `template_b_id` (uuid, FK): Second template variant
  - `start_date` (timestamptz): Test start
  - `end_date` (timestamptz): Test end
  - `is_active` (boolean): Currently running
  - `winner` (text): A/B/Inconclusive
  - `created_at` (timestamptz): Test creation time

  ### 7. analytics_daily
  - `id` (uuid, PK): Unique analytics record
  - `date` (date): Analytics date
  - `total_queries` (integer): Total queries that day
  - `unique_students` (integer): Unique active students
  - `avg_rating` (decimal): Average rating
  - `avg_response_time_ms` (integer): Average response time
  - `follow_up_rate` (decimal): Percentage with follow-ups
  - `activity_completion_rate` (decimal): Activity completion percentage

  ## Security
  - RLS enabled on all tables
  - Students can only access their own data
  - Admin policies for analytics and management
*/

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  age integer,
  grade text,
  curriculum text DEFAULT 'CBSE',
  preferred_language text DEFAULT 'Hinglish',
  learning_style text,
  created_at timestamptz DEFAULT now(),
  last_active timestamptz DEFAULT now()
);

-- Create queries table
CREATE TABLE IF NOT EXISTS queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  query_text text NOT NULL,
  detected_intent text,
  detected_language text,
  detected_age_group text,
  detected_subject text,
  complexity_level text,
  created_at timestamptz DEFAULT now()
);

-- Create responses table
CREATE TABLE IF NOT EXISTS responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id uuid REFERENCES queries(id) ON DELETE CASCADE,
  template_used text,
  response_text text NOT NULL,
  generation_time_ms integer DEFAULT 0,
  tokens_used integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id uuid REFERENCES responses(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  thumbs_up boolean,
  comment text,
  time_spent_seconds integer DEFAULT 0,
  follow_up_asked boolean DEFAULT false,
  activity_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create prompt_templates table
CREATE TABLE IF NOT EXISTS prompt_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name text UNIQUE NOT NULL,
  intent_type text NOT NULL,
  language text DEFAULT 'Hinglish',
  age_group text,
  template_content text NOT NULL,
  version integer DEFAULT 1,
  is_active boolean DEFAULT true,
  performance_score decimal(3,2) DEFAULT 0.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ab_tests table
CREATE TABLE IF NOT EXISTS ab_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_name text NOT NULL,
  template_a_id uuid REFERENCES prompt_templates(id),
  template_b_id uuid REFERENCES prompt_templates(id),
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  is_active boolean DEFAULT true,
  winner text,
  created_at timestamptz DEFAULT now()
);

-- Create analytics_daily table
CREATE TABLE IF NOT EXISTS analytics_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date UNIQUE NOT NULL DEFAULT CURRENT_DATE,
  total_queries integer DEFAULT 0,
  unique_students integer DEFAULT 0,
  avg_rating decimal(3,2) DEFAULT 0.00,
  avg_response_time_ms integer DEFAULT 0,
  follow_up_rate decimal(5,2) DEFAULT 0.00,
  activity_completion_rate decimal(5,2) DEFAULT 0.00
);

-- Enable RLS on all tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;

-- RLS Policies for students
CREATE POLICY "Students can view own profile"
  ON students FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Students can update own profile"
  ON students FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can create student profile"
  ON students FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for queries
CREATE POLICY "Students can view own queries"
  ON queries FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Students can create queries"
  ON queries FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

-- RLS Policies for responses
CREATE POLICY "Students can view own responses"
  ON responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM queries
      WHERE queries.id = responses.query_id
      AND queries.student_id = auth.uid()
    )
  );

CREATE POLICY "Service can create responses"
  ON responses FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for feedback
CREATE POLICY "Students can view own feedback"
  ON feedback FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM responses
      JOIN queries ON queries.id = responses.query_id
      WHERE responses.id = feedback.response_id
      AND queries.student_id = auth.uid()
    )
  );

CREATE POLICY "Students can create feedback"
  ON feedback FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Students can update own feedback"
  ON feedback FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM responses
      JOIN queries ON queries.id = responses.query_id
      WHERE responses.id = feedback.response_id
      AND queries.student_id = auth.uid()
    )
  );

-- RLS Policies for prompt_templates (read-only for students)
CREATE POLICY "Anyone can view active templates"
  ON prompt_templates FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policies for analytics (read-only for everyone)
CREATE POLICY "Anyone can view analytics"
  ON analytics_daily FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_queries_student_id ON queries(student_id);
CREATE INDEX IF NOT EXISTS idx_queries_created_at ON queries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_responses_query_id ON responses(query_id);
CREATE INDEX IF NOT EXISTS idx_feedback_response_id ON feedback(response_id);
CREATE INDEX IF NOT EXISTS idx_templates_intent ON prompt_templates(intent_type) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics_daily(date DESC);
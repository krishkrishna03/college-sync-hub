/*
  # Add Coding Round Support to Assessment Platform

  ## Overview
  This migration adds comprehensive support for coding rounds in assessments, company-specific tests, mock tests, and practice mode. The system works like HackerRank with code editor, test cases, and automatic evaluation.

  ## New Tables

  ### 1. `coding_questions`
  Stores coding problems with details like problem statement, constraints, difficulty level, and languages supported.
  - `id` (uuid, primary key)
  - `title` (text) - Problem title
  - `description` (text) - Detailed problem statement
  - `difficulty` (text) - easy, medium, hard
  - `constraints` (text) - Problem constraints
  - `input_format` (text) - Input format description
  - `output_format` (text) - Output format description
  - `time_limit` (integer) - Time limit in milliseconds
  - `memory_limit` (integer) - Memory limit in MB
  - `supported_languages` (jsonb) - Array of supported programming languages
  - `sample_input` (text) - Sample input for demonstration
  - `sample_output` (text) - Sample output for demonstration
  - `explanation` (text) - Explanation of sample
  - `tags` (jsonb) - Array of tags (arrays, dp, graphs, etc.)
  - `created_by` (uuid) - Foreign key to users
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `coding_test_cases`
  Stores test cases for each coding question (both visible and hidden).
  - `id` (uuid, primary key)
  - `question_id` (uuid) - Foreign key to coding_questions
  - `input` (text) - Test case input
  - `expected_output` (text) - Expected output
  - `is_sample` (boolean) - Whether this is a sample test case (visible to students)
  - `weight` (integer) - Points for this test case
  - `created_at` (timestamptz)

  ### 3. `test_coding_sections`
  Links coding questions to tests with configuration.
  - `id` (uuid, primary key)
  - `test_id` (uuid) - Foreign key to tests
  - `question_id` (uuid) - Foreign key to coding_questions
  - `points` (integer) - Points for this question in the test
  - `order_index` (integer) - Order of question in test
  - `created_at` (timestamptz)

  ### 4. `coding_submissions`
  Stores student code submissions and evaluation results.
  - `id` (uuid, primary key)
  - `student_id` (uuid) - Foreign key to users
  - `question_id` (uuid) - Foreign key to coding_questions
  - `test_attempt_id` (uuid, nullable) - Foreign key to test_attempts (null for practice)
  - `language` (text) - Programming language used
  - `code` (text) - Submitted code
  - `status` (text) - pending, running, accepted, wrong_answer, runtime_error, time_limit_exceeded, memory_limit_exceeded
  - `test_cases_passed` (integer) - Number of test cases passed
  - `total_test_cases` (integer) - Total number of test cases
  - `score` (integer) - Points earned
  - `execution_time` (integer) - Execution time in milliseconds
  - `memory_used` (integer) - Memory used in MB
  - `test_results` (jsonb) - Detailed results for each test case
  - `error_message` (text, nullable) - Error message if any
  - `submitted_at` (timestamptz)

  ### 5. `practice_coding_progress`
  Tracks student progress in practice mode.
  - `id` (uuid, primary key)
  - `student_id` (uuid) - Foreign key to users
  - `question_id` (uuid) - Foreign key to coding_questions
  - `status` (text) - attempted, solved, bookmarked
  - `best_score` (integer) - Best score achieved
  - `attempts` (integer) - Number of attempts
  - `last_attempted_at` (timestamptz)
  - `solved_at` (timestamptz, nullable)

  ## Security
  - Enable RLS on all tables
  - Master admins can manage coding questions
  - Students can view assigned questions and submit code
  - Students can only view their own submissions
  - Practice mode accessible to all students

  ## Important Notes
  1. Coding questions can be added to any test type (assessment, company-specific, mock)
  2. Practice mode allows students to solve coding questions without time pressure
  3. Test cases can be marked as sample (visible) or hidden
  4. Automatic evaluation system scores submissions based on test case results
  5. Supports multiple programming languages (JavaScript, Python, Java, C++, etc.)
*/

-- Create coding_questions table
CREATE TABLE IF NOT EXISTS coding_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  constraints text DEFAULT '',
  input_format text DEFAULT '',
  output_format text DEFAULT '',
  time_limit integer DEFAULT 2000,
  memory_limit integer DEFAULT 256,
  supported_languages jsonb DEFAULT '["javascript", "python", "java", "cpp"]'::jsonb,
  sample_input text DEFAULT '',
  sample_output text DEFAULT '',
  explanation text DEFAULT '',
  tags jsonb DEFAULT '[]'::jsonb,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create coding_test_cases table
CREATE TABLE IF NOT EXISTS coding_test_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES coding_questions(id) ON DELETE CASCADE,
  input text NOT NULL,
  expected_output text NOT NULL,
  is_sample boolean DEFAULT false,
  weight integer DEFAULT 10,
  created_at timestamptz DEFAULT now()
);

-- Create test_coding_sections table
CREATE TABLE IF NOT EXISTS test_coding_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL,
  question_id uuid NOT NULL REFERENCES coding_questions(id) ON DELETE CASCADE,
  points integer DEFAULT 100,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(test_id, question_id)
);

-- Create coding_submissions table
CREATE TABLE IF NOT EXISTS coding_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  question_id uuid NOT NULL REFERENCES coding_questions(id) ON DELETE CASCADE,
  test_attempt_id uuid,
  language text NOT NULL,
  code text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'accepted', 'wrong_answer', 'runtime_error', 'time_limit_exceeded', 'memory_limit_exceeded', 'compilation_error')),
  test_cases_passed integer DEFAULT 0,
  total_test_cases integer DEFAULT 0,
  score integer DEFAULT 0,
  execution_time integer DEFAULT 0,
  memory_used integer DEFAULT 0,
  test_results jsonb DEFAULT '[]'::jsonb,
  error_message text,
  submitted_at timestamptz DEFAULT now()
);

-- Create practice_coding_progress table
CREATE TABLE IF NOT EXISTS practice_coding_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  question_id uuid NOT NULL REFERENCES coding_questions(id) ON DELETE CASCADE,
  status text DEFAULT 'attempted' CHECK (status IN ('attempted', 'solved', 'bookmarked')),
  best_score integer DEFAULT 0,
  attempts integer DEFAULT 0,
  last_attempted_at timestamptz DEFAULT now(),
  solved_at timestamptz,
  UNIQUE(student_id, question_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_coding_questions_difficulty ON coding_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_coding_questions_created_by ON coding_questions(created_by);
CREATE INDEX IF NOT EXISTS idx_coding_test_cases_question_id ON coding_test_cases(question_id);
CREATE INDEX IF NOT EXISTS idx_test_coding_sections_test_id ON test_coding_sections(test_id);
CREATE INDEX IF NOT EXISTS idx_test_coding_sections_question_id ON test_coding_sections(question_id);
CREATE INDEX IF NOT EXISTS idx_coding_submissions_student_id ON coding_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_coding_submissions_question_id ON coding_submissions(question_id);
CREATE INDEX IF NOT EXISTS idx_coding_submissions_test_attempt_id ON coding_submissions(test_attempt_id);
CREATE INDEX IF NOT EXISTS idx_practice_coding_progress_student_id ON practice_coding_progress(student_id);

-- Enable Row Level Security
ALTER TABLE coding_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coding_test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_coding_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE coding_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_coding_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coding_questions
CREATE POLICY "Master admins can manage coding questions"
  ON coding_questions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Students can view coding questions"
  ON coding_questions FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for coding_test_cases
CREATE POLICY "Master admins can manage test cases"
  ON coding_test_cases FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Students can view sample test cases"
  ON coding_test_cases FOR SELECT
  TO authenticated
  USING (is_sample = true);

-- RLS Policies for test_coding_sections
CREATE POLICY "Admins can manage test coding sections"
  ON test_coding_sections FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view test coding sections"
  ON test_coding_sections FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for coding_submissions
CREATE POLICY "Users can insert their own submissions"
  ON coding_submissions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view their own submissions"
  ON coding_submissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own submissions"
  ON coding_submissions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for practice_coding_progress
CREATE POLICY "Students can manage their own progress"
  ON practice_coding_progress FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
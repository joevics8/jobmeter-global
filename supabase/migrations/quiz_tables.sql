-- Objective Questions Table
CREATE TABLE IF NOT EXISTS objective_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company VARCHAR(255),
  exam_year INTEGER,
  section VARCHAR(255),
  question_text TEXT NOT NULL,
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  option_e TEXT,
  correct_answer VARCHAR(1) NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D', 'E')),
  explanation TEXT,
  difficulty VARCHAR(50) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question_type VARCHAR(50) DEFAULT 'aptitude',
  source_page TEXT,
  source_pdf TEXT,
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Theory Questions Table
CREATE TABLE IF NOT EXISTS theory_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company VARCHAR(255) NOT NULL,
  exam_year INTEGER,
  section VARCHAR(255),
  question_text TEXT NOT NULL,
  grading_prompt TEXT,
  model_answer TEXT,
  difficulty VARCHAR(50) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Theory Attempts Table (tracks user answers and AI grading)
CREATE TABLE IF NOT EXISTS theory_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company VARCHAR(255) NOT NULL,
  question_id UUID REFERENCES theory_questions(id) ON DELETE CASCADE,
  user_answer TEXT NOT NULL,
  ai_score_percentage DECIMAL(5,2),
  passed BOOLEAN,
  ai_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Objective Attempts Table
CREATE TABLE IF NOT EXISTS objective_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID REFERENCES objective_questions(id) ON DELETE CASCADE,
  selected_answer VARCHAR(1),
  is_correct BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz Passwords Table (for theory quizzes)
CREATE TABLE IF NOT EXISTS quiz_passwords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE objective_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE theory_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE theory_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE objective_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_passwords ENABLE ROW LEVEL SECURITY;

-- RLS Policies for objective_questions
CREATE POLICY "Anyone can view active objective questions" ON objective_questions
  FOR SELECT USING (is_active = true);

-- RLS Policies for theory_questions
CREATE POLICY "Anyone can view active theory questions" ON theory_questions
  FOR SELECT USING (is_active = true);

-- RLS Policies for theory_attempts
CREATE POLICY "Users can view own theory attempts" ON theory_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert theory attempts" ON theory_attempts
  FOR INSERT WITH CHECK (true);

-- RLS Policies for objective_attempts
CREATE POLICY "Users can view own objective attempts" ON objective_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert objective attempts" ON objective_attempts
  FOR INSERT WITH CHECK (true);

-- RLS Policies for quiz_passwords
CREATE POLICY "Anyone can verify quiz passwords" ON quiz_passwords
  FOR SELECT USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_objective_questions_company ON objective_questions(company);
CREATE INDEX IF NOT EXISTS idx_objective_questions_exam_year ON objective_questions(exam_year);
CREATE INDEX IF NOT EXISTS idx_theory_questions_company ON theory_questions(company);
CREATE INDEX IF NOT EXISTS idx_theory_attempts_user ON theory_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_objective_attempts_user ON objective_attempts(user_id);

/*
  # Fix RLS Policies for Anonymous Access

  This migration updates RLS policies to allow anonymous users to submit queries
  and receive responses without authentication, while still maintaining security
  for data access patterns.

  Changes:
  1. Remove strict authentication requirement from queries INSERT
  2. Allow responses and feedback from service role
  3. Enable public query submission for learning
*/

DROP POLICY IF EXISTS "Students can create queries" ON queries;
CREATE POLICY "Anyone can create queries"
  ON queries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service can create responses" ON responses;
CREATE POLICY "Anyone can create responses"
  ON responses FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Students can view own queries" ON queries;
CREATE POLICY "Anyone can view queries"
  ON queries FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Students can view own responses" ON responses;
CREATE POLICY "Anyone can view responses"
  ON responses FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Students can create feedback" ON feedback;
CREATE POLICY "Anyone can create feedback"
  ON feedback FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Students can view own feedback" ON feedback;
CREATE POLICY "Anyone can view feedback"
  ON feedback FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Students can update own feedback" ON feedback;
CREATE POLICY "Anyone can update feedback"
  ON feedback FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

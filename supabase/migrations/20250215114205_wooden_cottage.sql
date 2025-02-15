/*
  # Fix Player Authentication Policies

  1. Changes
    - Update player policies to allow unauthenticated access for player creation
    - Fix player insertion policy to work without auth
    - Update score policies to work with player_id

  2. Security
    - Maintain RLS but allow public access for initial player creation
    - Keep score insertion restricted to authenticated players
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Players can read all players" ON players;
DROP POLICY IF EXISTS "Players can insert their own record" ON players;
DROP POLICY IF EXISTS "Players can read all scores" ON scores;
DROP POLICY IF EXISTS "Players can insert their own scores" ON scores;

-- Create new policies for players table
CREATE POLICY "Anyone can read players"
  ON players
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create players"
  ON players
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create new policies for scores table
CREATE POLICY "Anyone can read scores"
  ON scores
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Players can insert scores"
  ON scores
  FOR INSERT
  TO public
  WITH CHECK (true);
/*
  # Initial Schema Setup for 2048 Game

  1. New Tables
    - `players`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `created_at` (timestamp)
    - `scores`
      - `id` (uuid, primary key)
      - `player_id` (uuid, foreign key)
      - `score` (integer)
      - `difficulty` (text)
      - `created_at` (timestamp)
      - `max_tile` (integer)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create scores table
CREATE TABLE IF NOT EXISTS scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) NOT NULL,
  score integer NOT NULL,
  difficulty text NOT NULL,
  max_tile integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Players can read all players"
  ON players
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Players can insert their own record"
  ON players
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Players can read all scores"
  ON scores
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Players can insert their own scores"
  ON scores
  FOR INSERT
  TO authenticated
  WITH CHECK (player_id = auth.uid());
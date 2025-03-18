/*
  # Create movies table

  1. New Tables
    - `movies`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `genre` (text, not null)
      - `rating` (text, not null)
      - `created_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `movies` table
    - Add policies for:
      - Public read access
      - Public write access (for demo purposes)
*/

-- Create the movies table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'movies') THEN
    CREATE TABLE movies (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      genre text NOT NULL,
      rating text NOT NULL,
      created_at timestamptz DEFAULT now()
    );

    -- Enable RLS
    ALTER TABLE movies ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Allow public read access"
      ON movies
      FOR SELECT
      TO public
      USING (true);

    CREATE POLICY "Allow public insert access"
      ON movies
      FOR INSERT
      TO public
      WITH CHECK (true);
  END IF;
END $$;
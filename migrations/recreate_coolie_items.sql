-- Recreate coolie_items table for bilingual support
DROP TABLE IF EXISTS coolie_items;

CREATE TABLE coolie_items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name_english TEXT NOT NULL,
  name_tamil TEXT,
  type TEXT DEFAULT 'coolie'
);

-- Re-enable RLS (if needed)
-- ALTER TABLE coolie_items ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Public Access" ON coolie_items FOR ALL USING (true);

-- Sample Data
INSERT INTO coolie_items (name_english, name_tamil) VALUES 
('Warping', 'ஒண்டி தடை செய்ய கூலி'),
('Twisting', 'மூன்று இழை சப்புரி செய்ய கூலி');

-- Add new fields to readings table
ALTER TABLE readings 
ADD COLUMN IF NOT EXISTS read_date DATE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'quero_ler' CHECK (status IN ('quero_ler', 'lendo', 'lido'));

-- Add index for status filtering
CREATE INDEX IF NOT EXISTS idx_readings_status ON readings(status);
CREATE INDEX IF NOT EXISTS idx_readings_read_date ON readings(read_date DESC);

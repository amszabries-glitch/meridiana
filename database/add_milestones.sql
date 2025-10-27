-- =============================================
-- Meilenstein-System für Projekte
-- Phase 2.3.3: Meilenstein-Tracking
-- =============================================

-- Tabelle für Meilensteine
CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  target_date TIMESTAMP,
  completed_date TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'overdue'
  priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(255),
  notes TEXT,
  order_index INTEGER DEFAULT 0
);

-- Index für schnelle Abfragen nach Projekt
CREATE INDEX IF NOT EXISTS idx_milestones_project_id 
ON milestones(project_id);

-- Index für schnelle Sortierung nach Status und Datum
CREATE INDEX IF NOT EXISTS idx_milestones_status 
ON milestones(status);

CREATE INDEX IF NOT EXISTS idx_milestones_target_date 
ON milestones(target_date);

-- =============================================
-- Trigger für updated_at
-- =============================================

CREATE OR REPLACE FUNCTION update_milestone_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ 
BEGIN
  DROP TRIGGER IF EXISTS milestone_updated_at_trigger ON milestones;
  
  CREATE TRIGGER milestone_updated_at_trigger
    BEFORE UPDATE ON milestones
    FOR EACH ROW
    EXECUTE FUNCTION update_milestone_updated_at();
END $$;

-- =============================================
-- Trigger für Status-updates (completed_date)
-- =============================================

CREATE OR REPLACE FUNCTION update_milestone_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Wenn Status auf completed gesetzt wird, setze completed_date
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_date = NOW();
  END IF;
  
  -- Wenn Status von completed entfernt wird, entferne completed_date
  IF NEW.status != 'completed' AND OLD.status = 'completed' THEN
    NEW.completed_date = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ 
BEGIN
  DROP TRIGGER IF EXISTS milestone_completion_trigger ON milestones;
  
  CREATE TRIGGER milestone_completion_trigger
    BEFORE UPDATE ON milestones
    FOR EACH ROW
    EXECUTE FUNCTION update_milestone_completion();
END $$;

-- =============================================
-- RLS (Row Level Security) Policies
-- =============================================

-- Policy für Lese-Zugriff
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'milestones' 
    AND policyname = 'Allow read access to milestones'
  ) THEN
    CREATE POLICY "Allow read access to milestones"
    ON milestones
    FOR SELECT
    USING (true);
  END IF;
END $$;

-- Policy für Insert
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'milestones' 
    AND policyname = 'Allow insert for milestones'
  ) THEN
    CREATE POLICY "Allow insert for milestones"
    ON milestones
    FOR INSERT
    WITH CHECK (true);
  END IF;
END $$;

-- Policy für Update
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'milestones' 
    AND policyname = 'Allow update for milestones'
  ) THEN
    CREATE POLICY "Allow update for milestones"
    ON milestones
    FOR UPDATE
    USING (true);
  END IF;
END $$;

-- Policy für Delete
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'milestones' 
    AND policyname = 'Allow delete for milestones'
  ) THEN
    CREATE POLICY "Allow delete for milestones"
    ON milestones
    FOR DELETE
    USING (true);
  END IF;
END $$;

-- =============================================
-- Nützliche Views für Analytics
-- =============================================

-- View für Meilenstein-Übersicht pro Projekt
CREATE OR REPLACE VIEW milestone_overview AS
SELECT 
  m.id,
  m.project_id,
  p.name as project_name,
  m.name as milestone_name,
  m.description,
  m.target_date,
  m.completed_date,
  m.status,
  m.priority,
  CASE 
    WHEN m.status = 'completed' THEN 'completed'
    WHEN m.target_date < NOW() AND m.status != 'completed' THEN 'overdue'
    WHEN m.status = 'in_progress' THEN 'in_progress'
    ELSE 'pending'
  END as calculated_status,
  EXTRACT(EPOCH FROM (COALESCE(m.completed_date, NOW()) - m.target_date)) as days_offset,
  m.created_at,
  m.updated_at
FROM milestones m
LEFT JOIN projects p ON m.project_id = p.id
ORDER BY m.project_id, m.order_index, m.target_date;

-- View für Meilenstein-Statistiken
CREATE OR REPLACE VIEW milestone_statistics AS
SELECT 
  project_id,
  COUNT(*) as total_milestones,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_milestones,
  COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_milestones,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_milestones,
  COUNT(*) FILTER (WHERE target_date < NOW() AND status != 'completed') as overdue_milestones,
  ROUND(COUNT(*) FILTER (WHERE status = 'completed')::numeric / NULLIF(COUNT(*), 0) * 100, 2) as completion_percentage,
  AVG(EXTRACT(EPOCH FROM (completed_date - target_date))) as avg_completion_offset_seconds
FROM milestones
GROUP BY project_id;

-- =============================================
-- Hinweise für den Developer
-- =============================================

COMMENT ON TABLE milestones IS 
'Meilensteine für Projekte - Trackt wichtige Zwischenziele';

COMMENT ON FUNCTION update_milestone_completion() IS 
'Automatische Funktion zum Setzen von completed_date bei Status-Änderung zu completed';

COMMENT ON VIEW milestone_overview IS 
'Vollständige Übersicht aller Meilensteine mit berechneten Statuswerten';

COMMENT ON VIEW milestone_statistics IS 
'Statistiken für Meilensteine pro Projekt (Completion-Rate, etc.)';


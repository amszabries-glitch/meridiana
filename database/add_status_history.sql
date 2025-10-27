-- =============================================
-- Status History Tracking für Projekte
-- Phase 2.3.2: Status-Verlauf Tracking
-- =============================================

-- Tabelle für Status-Änderungs-Historie
CREATE TABLE IF NOT EXISTS project_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_at TIMESTAMP DEFAULT NOW(),
  changed_by VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index für schnelle Abfragen nach Projekt
CREATE INDEX IF NOT EXISTS idx_project_status_history_project_id 
ON project_status_history(project_id);

-- Index für schnelle Sortierung nach Datum
CREATE INDEX IF NOT EXISTS idx_project_status_history_changed_at 
ON project_status_history(changed_at DESC);

-- =============================================
-- Trigger für automatisches Tracking
-- =============================================

-- Funktion zum Erstellen des History-Eintrags
CREATE OR REPLACE FUNCTION track_project_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Nur History-Eintrag erstellen, wenn sich der Status geändert hat
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO project_status_history (
      project_id,
      old_status,
      new_status,
      changed_at,
      changed_by,
      notes
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      NOW(),
      current_user::text,
      CONCAT('Status geändert von "', OLD.status, '" zu "', NEW.status, '"')
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger erstellen (mit DO-Block für sichere Existenz-Prüfung)
DO $$ 
BEGIN
  -- Trigger löschen falls er existiert
  DROP TRIGGER IF EXISTS project_status_history_trigger ON projects;
  
  -- Neuer Trigger erstellen
  CREATE TRIGGER project_status_history_trigger
    AFTER UPDATE ON projects
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION track_project_status_change();
END $$;

-- =============================================
-- RLS (Row Level Security) Policies
-- =============================================

-- Policy für Lese-Zugriff auf eigene Projekte (für spätere Authentifizierung)
DO $$ 
BEGIN
  -- Policy nur erstellen wenn sie nicht existiert
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'project_status_history' 
    AND policyname = 'Allow read access to project status history'
  ) THEN
    CREATE POLICY "Allow read access to project status history"
    ON project_status_history
    FOR SELECT
    USING (true);
  END IF;
END $$;

-- Policy für Insert (alle können History-Einträge erstellen)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'project_status_history' 
    AND policyname = 'Allow insert for status history'
  ) THEN
    CREATE POLICY "Allow insert for status history"
    ON project_status_history
    FOR INSERT
    WITH CHECK (true);
  END IF;
END $$;

-- =============================================
-- Nützliche Views für Analytics
-- =============================================

-- View für Status-Übergänge (welche Status-Wechsel kommen am häufigsten vor)
CREATE OR REPLACE VIEW status_transitions AS
SELECT 
  old_status,
  new_status,
  COUNT(*) as transition_count,
  AVG(EXTRACT(EPOCH FROM (changed_at - created_at))) as avg_time_in_seconds
FROM project_status_history
WHERE old_status IS NOT NULL
GROUP BY old_status, new_status
ORDER BY transition_count DESC;

-- View für Projekte mit allen Status-Änderungen
CREATE OR REPLACE VIEW project_status_timeline AS
SELECT 
  p.id as project_id,
  p.name as project_name,
  p.company_name,
  psh.old_status,
  psh.new_status,
  psh.changed_at,
  psh.notes,
  LAG(psh.new_status) OVER (PARTITION BY p.id ORDER BY psh.changed_at) as previous_status
FROM projects p
LEFT JOIN project_status_history psh ON p.id = psh.project_id
ORDER BY p.name, psh.changed_at DESC;

-- =============================================
-- Hinweise für den Developer
-- =============================================

COMMENT ON TABLE project_status_history IS 
'Trackt alle Status-Änderungen von Projekten für vollständige Historie';

COMMENT ON FUNCTION track_project_status_change() IS 
'Automatische Funktion zum Erstellen von History-Einträgen bei Status-Änderungen';

COMMENT ON VIEW status_transitions IS 
'Zeigt welche Status-Wechsel am häufigsten vorkommen (für Analytics)';

COMMENT ON VIEW project_status_timeline IS 
'Vollständige Timeline aller Status-Änderungen pro Projekt';


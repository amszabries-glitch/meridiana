-- Update the CHECK constraint on projects.status to allow new phases

DO $$ DECLARE
  cons_name text;
BEGIN
  SELECT c.conname INTO cons_name
  FROM pg_constraint c
  JOIN pg_class t ON t.oid = c.conrelid
  JOIN pg_namespace n ON n.oid = t.relnamespace
  WHERE t.relname = 'projects'
    AND c.contype = 'c'
    AND pg_get_constraintdef(c.oid) ILIKE '%status%IN%';

  IF cons_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE projects DROP CONSTRAINT %I', cons_name);
  END IF;

  ALTER TABLE projects
    ADD CONSTRAINT projects_status_check
    CHECK (status IN (
      'lead',
      'offer_submitted',
      'negotiation',
      'offer_accepted',
      'contract_finalized',
      'creditors_meeting',
      'closed'
    ));
END $$;



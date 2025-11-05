-- Update CHECK constraint for project_contacts.role to allow all used roles
-- Run this migration in Supabase SQL editor or via psql

ALTER TABLE project_contacts
  DROP CONSTRAINT IF EXISTS project_contacts_role_check;

ALTER TABLE project_contacts
  ADD CONSTRAINT project_contacts_role_check
  CHECK (role IN (
    'primary',
    'secondary',
    'buyer',
    'insolvency_admin',
    'broker',
    'lawyer',
    'advisor',
    'seller',
    'general'
  ));



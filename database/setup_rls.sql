-- Meridiana CRM - Row Level Security Setup
-- All users see the same data (shared database)

-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE available_shells ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_contacts ENABLE ROW LEVEL SECURITY;

-- Drop existing "allow all" policies
DROP POLICY IF EXISTS "Allow all operations on projects" ON projects;
DROP POLICY IF EXISTS "Allow all operations on contacts" ON contacts;
DROP POLICY IF EXISTS "Allow all operations on project_contacts" ON project_contacts;
DROP POLICY IF EXISTS "Allow all operations on documents" ON documents;
DROP POLICY IF EXISTS "Allow all operations on document_versions" ON document_versions;
DROP POLICY IF EXISTS "Allow all operations on project_status_history" ON project_status_history;
DROP POLICY IF EXISTS "Allow all operations on milestones" ON milestones;
DROP POLICY IF EXISTS "Allow all operations on available_shells" ON available_shells;

-- Projects: Authenticated users can do everything with their own projects
CREATE POLICY "Authenticated users can manage projects" ON projects
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Contacts: Authenticated users can manage all contacts
CREATE POLICY "Authenticated users can manage contacts" ON contacts
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Documents: Authenticated users can manage documents
CREATE POLICY "Authenticated users can manage documents" ON documents
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Document Versions: Authenticated users can manage versions
CREATE POLICY "Authenticated users can manage document_versions" ON document_versions
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Project Status History: Authenticated users can manage history
CREATE POLICY "Authenticated users can manage project_status_history" ON project_status_history
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Milestones: Authenticated users can manage milestones
CREATE POLICY "Authenticated users can manage milestones" ON milestones
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Available Shells: Authenticated users can manage available shells
CREATE POLICY "Authenticated users can manage available_shells" ON available_shells
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Project Contacts: Authenticated users can manage project-contacts
CREATE POLICY "Authenticated users can manage project_contacts" ON project_contacts
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');


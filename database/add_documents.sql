-- Meridiana CRM - Document Management Extension
-- This script adds document management tables to existing database

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Documents Table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  category VARCHAR(100) DEFAULT 'general' CHECK (category IN ('legal', 'financial', 'technical', 'marketing', 'general')),
  tags TEXT[],
  description TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  uploaded_by VARCHAR(255),
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document Versions Table
CREATE TABLE IF NOT EXISTS document_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER NOT NULL,
  change_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for documents
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_contact_id ON documents(contact_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);
CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON document_versions(document_id);

-- RLS for documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for documents
DO $$
BEGIN
    -- Check if policy exists before creating
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'documents' 
        AND policyname = 'Allow all operations on documents'
    ) THEN
        CREATE POLICY "Allow all operations on documents" ON documents FOR ALL USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'document_versions' 
        AND policyname = 'Allow all operations on document_versions'
    ) THEN
        CREATE POLICY "Allow all operations on document_versions" ON document_versions FOR ALL USING (true);
    END IF;
END $$;

-- Function to automatically update updated_at timestamp (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for document updated_at
DO $$
BEGIN
    -- Check if trigger exists before creating
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_documents_updated_at'
    ) THEN
        CREATE TRIGGER update_documents_updated_at 
            BEFORE UPDATE ON documents 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Sample documents (only if no documents exist)
INSERT INTO documents (name, file_name, file_path, file_size, file_type, mime_type, category, tags, description, project_id) 
SELECT 
  'TechCorp Due Diligence Report', 
  'techcorp_dd_2024.pdf', 
  '/documents/techcorp_dd_2024.pdf', 
  2048576, 
  'pdf', 
  'application/pdf', 
  'legal', 
  ARRAY['due-diligence', 'legal', 'techcorp'], 
  'Due Diligence Bericht für TechCorp AG Börsenmantel', 
  (SELECT id FROM projects WHERE name = 'TechCorp AG - Börsenmantel' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM documents LIMIT 1);

INSERT INTO documents (name, file_name, file_path, file_size, file_type, mime_type, category, tags, description, project_id) 
SELECT 
  'FinanceGroup Financial Statements', 
  'financegroup_fs_2024.xlsx', 
  '/documents/financegroup_fs_2024.xlsx', 
  1024000, 
  'xlsx', 
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
  'financial', 
  ARRAY['financial', 'statements', 'financegroup'], 
  'Finanzberichte FinanceGroup SE', 
  (SELECT id FROM projects WHERE name = 'FinanceGroup SE - Börsenmantel' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM documents LIMIT 1);

INSERT INTO documents (name, file_name, file_path, file_size, file_type, mime_type, category, tags, description, project_id) 
SELECT 
  'StartupXYZ Pitch Deck', 
  'startupxyz_pitch.pptx', 
  '/documents/startupxyz_pitch.pptx', 
  5120000, 
  'pptx', 
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', 
  'marketing', 
  ARRAY['pitch', 'presentation', 'startup'], 
  'Pitch Deck für StartupXYZ AG', 
  (SELECT id FROM projects WHERE name = 'StartupXYZ AG - Börsenmantel' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM documents LIMIT 1);

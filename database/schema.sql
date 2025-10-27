-- Meridiana CRM Database Schema - Document Management Extension
-- This script adds document management tables to existing database

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Check if documents table already exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents') THEN
        -- Documents Table
        CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('lead', 'offer_submitted', 'negotiation', 'offer_accepted', 'closed')),
  has_buyer BOOLEAN DEFAULT FALSE,
  has_down_payment BOOLEAN DEFAULT FALSE,
  purchase_price DECIMAL(15,2),
  selling_price DECIMAL(15,2),
  next_steps TEXT,
  timeline VARCHAR(100),
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contacts Table
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  company VARCHAR(255),
  position VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project-Contact Junction Table
CREATE TABLE project_contacts (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  role VARCHAR(100) DEFAULT 'primary' CHECK (role IN ('primary', 'secondary', 'buyer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (project_id, contact_id)
);

-- Indexes for better performance
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at);
CREATE INDEX idx_contacts_name ON contacts(name);
CREATE INDEX idx_project_contacts_project_id ON project_contacts(project_id);

-- Row Level Security (RLS) - Enable for all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow all operations for now (will be restricted later with authentication)
CREATE POLICY "Allow all operations on projects" ON projects FOR ALL USING (true);
CREATE POLICY "Allow all operations on contacts" ON contacts FOR ALL USING (true);
CREATE POLICY "Allow all operations on project_contacts" ON project_contacts FOR ALL USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on projects table
CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO projects (name, company_name, status, has_buyer, has_down_payment, purchase_price, selling_price, next_steps, timeline, probability) VALUES
('TechCorp AG - Börsenmantel', 'TechCorp AG', 'negotiation', true, true, 2500000, 3200000, 'Due Diligence abschließen', 'Q2 2024', 85),
('FinanceGroup SE - Börsenmantel', 'FinanceGroup SE', 'offer_submitted', true, false, 4500000, 5800000, 'Kapitalerhöhung vorbereiten', 'Q3 2024', 70),
('StartupXYZ AG - Börsenmantel', 'StartupXYZ AG', 'lead', false, false, 1200000, 1500000, 'Interessenten für Reverse Merger finden', 'Q4 2024', 30),
('BankCorp AG - Börsenmantel', 'BankCorp AG', 'offer_accepted', true, true, 3200000, 4100000, 'Börsengang vorbereiten', 'Q1 2024', 95),
('MedTech AG - Börsenmantel', 'MedTech AG', 'closed', true, true, 1800000, 2350000, 'Projekt erfolgreich abgeschlossen', 'Abgeschlossen', 100);

INSERT INTO contacts (name, email, phone, company, position) VALUES
('Dr. Michael Weber', 'm.weber@techcorp.com', '+49 89 123456', 'TechCorp AG', 'CEO'),
('Sarah Müller', 's.mueller@financegroup.com', '+49 69 234567', 'FinanceGroup SE', 'CFO'),
('Thomas Schmidt', 't.schmidt@startupxyz.com', '+49 40 345678', 'StartupXYZ AG', 'Founder'),
('Anna Fischer', 'a.fischer@bankcorp.com', '+49 30 456789', 'BankCorp AG', 'Investment Director'),
('Markus Klein', 'm.klein@medtech.com', '+49 711 567890', 'MedTech AG', 'Managing Director');

-- Documents Table
CREATE TABLE documents (
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
CREATE TABLE document_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER NOT NULL,
  change_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for documents
CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_documents_contact_id ON documents(contact_id);
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_created_at ON documents(created_at);
CREATE INDEX idx_document_versions_document_id ON document_versions(document_id);

-- RLS for documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for documents
CREATE POLICY "Allow all operations on documents" ON documents FOR ALL USING (true);
CREATE POLICY "Allow all operations on document_versions" ON document_versions FOR ALL USING (true);

-- Trigger for document updated_at
CREATE TRIGGER update_documents_updated_at 
    BEFORE UPDATE ON documents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Link contacts to projects
INSERT INTO project_contacts (project_id, contact_id, role) VALUES
((SELECT id FROM projects WHERE name = 'TechCorp AG - Börsenmantel'), (SELECT id FROM contacts WHERE name = 'Dr. Michael Weber'), 'primary'),
((SELECT id FROM projects WHERE name = 'FinanceGroup SE - Börsenmantel'), (SELECT id FROM contacts WHERE name = 'Sarah Müller'), 'primary'),
((SELECT id FROM projects WHERE name = 'StartupXYZ AG - Börsenmantel'), (SELECT id FROM contacts WHERE name = 'Thomas Schmidt'), 'primary'),
((SELECT id FROM projects WHERE name = 'BankCorp AG - Börsenmantel'), (SELECT id FROM contacts WHERE name = 'Anna Fischer'), 'primary'),
((SELECT id FROM projects WHERE name = 'MedTech AG - Börsenmantel'), (SELECT id FROM contacts WHERE name = 'Markus Klein'), 'primary');

-- Sample documents
INSERT INTO documents (name, file_name, file_path, file_size, file_type, mime_type, category, tags, description, project_id) VALUES
('TechCorp Due Diligence Report', 'techcorp_dd_2024.pdf', '/documents/techcorp_dd_2024.pdf', 2048576, 'pdf', 'application/pdf', 'legal', ARRAY['due-diligence', 'legal', 'techcorp'], 'Due Diligence Bericht für TechCorp AG Börsenmantel', (SELECT id FROM projects WHERE name = 'TechCorp AG - Börsenmantel')),
('FinanceGroup Financial Statements', 'financegroup_fs_2024.xlsx', '/documents/financegroup_fs_2024.xlsx', 1024000, 'xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'financial', ARRAY['financial', 'statements', 'financegroup'], 'Finanzberichte FinanceGroup SE', (SELECT id FROM projects WHERE name = 'FinanceGroup SE - Börsenmantel')),
('StartupXYZ Pitch Deck', 'startupxyz_pitch.pptx', '/documents/startupxyz_pitch.pptx', 5120000, 'pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'marketing', ARRAY['pitch', 'presentation', 'startup'], 'Pitch Deck für StartupXYZ AG', (SELECT id FROM projects WHERE name = 'StartupXYZ AG - Börsenmantel'));

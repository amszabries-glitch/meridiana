-- Add Insolvency Administrator Contact Fields to Projects Table
-- This adds fields to track bankruptcy administrator contacts for Börsenmäntel

DO $$
BEGIN
    -- Add insolvency_admin_name field
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'insolvency_admin_name') THEN
        ALTER TABLE projects ADD COLUMN insolvency_admin_name VARCHAR(255);
        COMMENT ON COLUMN projects.insolvency_admin_name IS 'Name of the bankruptcy administrator';
    END IF;
    
    -- Add insolvency_admin_email field
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'insolvency_admin_email') THEN
        ALTER TABLE projects ADD COLUMN insolvency_admin_email VARCHAR(255);
        COMMENT ON COLUMN projects.insolvency_admin_email IS 'Email of the bankruptcy administrator';
    END IF;
    
    -- Add insolvency_admin_phone field
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'insolvency_admin_phone') THEN
        ALTER TABLE projects ADD COLUMN insolvency_admin_phone VARCHAR(50);
        COMMENT ON COLUMN projects.insolvency_admin_phone IS 'Phone number of the bankruptcy administrator';
    END IF;
    
    -- Add insolvency_admin_company field
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'insolvency_admin_company') THEN
        ALTER TABLE projects ADD COLUMN insolvency_admin_company VARCHAR(255);
        COMMENT ON COLUMN projects.insolvency_admin_company IS 'Company of the bankruptcy administrator';
    END IF;
    
    -- Add insolvency_court field
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'insolvency_court') THEN
        ALTER TABLE projects ADD COLUMN insolvency_court VARCHAR(255);
        COMMENT ON COLUMN projects.insolvency_court IS 'Insolvency court handling the case';
    END IF;
    
    -- Add insolvency_case_number field
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'insolvency_case_number') THEN
        ALTER TABLE projects ADD COLUMN insolvency_case_number VARCHAR(100);
        COMMENT ON COLUMN projects.insolvency_case_number IS 'Case number at the insolvency court';
    END IF;
    
    -- Add insolvency_filing_date field
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'insolvency_filing_date') THEN
        ALTER TABLE projects ADD COLUMN insolvency_filing_date DATE;
        COMMENT ON COLUMN projects.insolvency_filing_date IS 'Date when insolvency was filed';
    END IF;
    
END $$;

-- Update sample data with insolvency administrator information
UPDATE projects SET
    insolvency_admin_name = 'Dr. Michael Schneider',
    insolvency_admin_email = 'm.schneider@insolvenzkanzlei.de',
    insolvency_admin_phone = '+49 30 12345678',
    insolvency_admin_company = 'Schneider & Partner Insolvenzverwaltung',
    insolvency_court = 'Amtsgericht Berlin',
    insolvency_case_number = 'IN 123/2023',
    insolvency_filing_date = '2023-01-15'
WHERE name = 'TechCorp AG - Börsenmantel';

UPDATE projects SET
    insolvency_admin_name = 'RA Sarah Klein',
    insolvency_admin_email = 's.klein@wirtschaftsanwaelte-muenchen.de',
    insolvency_admin_phone = '+49 89 23456789',
    insolvency_admin_company = 'Klein Wirtschaftsanwälte GmbH',
    insolvency_court = 'Amtsgericht München',
    insolvency_case_number = 'IN 456/2023',
    insolvency_filing_date = '2023-03-20'
WHERE name = 'FinanceGroup SE - Börsenmantel';

UPDATE projects SET
    insolvency_admin_name = 'Michael Hahn',
    insolvency_admin_email = 'm.hahn@hamburg-insolvenz.de',
    insolvency_admin_phone = '+49 40 34567890',
    insolvency_admin_company = 'Hahn & Partner Insolvenzverwaltung',
    insolvency_court = 'Amtsgericht Hamburg',
    insolvency_case_number = 'IN 789/2023',
    insolvency_filing_date = '2023-05-10'
WHERE name = 'StartupXYZ AG - Börsenmantel';

UPDATE projects SET
    insolvency_admin_name = 'Dr. Anna Berger',
    insolvency_admin_email = 'a.berger@insolvenz-frankfurt.de',
    insolvency_admin_phone = '+49 69 45678901',
    insolvency_admin_company = 'Berger Insolvenz Service',
    insolvency_court = 'Amtsgericht Frankfurt',
    insolvency_case_number = 'IN 012/2024',
    insolvency_filing_date = '2024-02-14'
WHERE name = 'BankCorp AG - Börsenmantel';

UPDATE projects SET
    insolvency_admin_name = 'Thomas Wiedemann',
    insolvency_admin_email = 't.wiedemann@stuttgart-insolvenz.de',
    insolvency_admin_phone = '+49 711 56789012',
    insolvency_admin_company = 'Wiedemann Treuhand GmbH',
    insolvency_court = 'Amtsgericht Stuttgart',
    insolvency_case_number = 'IN 345/2024',
    insolvency_filing_date = '2024-04-22'
WHERE name = 'MedTech AG - Börsenmantel';


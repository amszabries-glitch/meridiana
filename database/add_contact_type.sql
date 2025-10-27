-- Meridiana CRM - Add Contact Type
-- This script adds a contact_type field to the contacts table

-- Add contact_type column to contacts table
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS contact_type VARCHAR(100) DEFAULT 'general' 
  CHECK (contact_type IN ('general', 'insolvency_admin', 'broker', 'lawyer', 'buyer', 'seller', 'advisor'));

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_contact_type ON contacts(contact_type);

-- Update existing contacts with 'general' type if they don't have one set
UPDATE contacts SET contact_type = 'general' WHERE contact_type IS NULL;

-- Add comment
COMMENT ON COLUMN contacts.contact_type IS 'Type of contact: general, insolvency_admin, broker, lawyer, buyer, seller, advisor';


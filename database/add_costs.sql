-- Add Cost Management Fields to Projects Table
-- This extends the projects table with detailed cost tracking for Börsenmäntel transactions

-- Add cost fields to projects table
DO $$ BEGIN
    -- Check if column exists before adding
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'legal_fees') THEN
        ALTER TABLE projects ADD COLUMN legal_fees DECIMAL(15,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'due_diligence_costs') THEN
        ALTER TABLE projects ADD COLUMN due_diligence_costs DECIMAL(15,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'broker_commission') THEN
        ALTER TABLE projects ADD COLUMN broker_commission DECIMAL(5,2) DEFAULT 0;
        COMMENT ON COLUMN projects.broker_commission IS 'Broker commission in percentage (0-100)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'exchange_fees') THEN
        ALTER TABLE projects ADD COLUMN exchange_fees DECIMAL(15,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'monthly_listing_fee') THEN
        ALTER TABLE projects ADD COLUMN monthly_listing_fee DECIMAL(15,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'annual_compliance_costs') THEN
        ALTER TABLE projects ADD COLUMN annual_compliance_costs DECIMAL(15,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'annual_accounting_costs') THEN
        ALTER TABLE projects ADD COLUMN annual_accounting_costs DECIMAL(15,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'holding_period_months') THEN
        ALTER TABLE projects ADD COLUMN holding_period_months INTEGER DEFAULT 12;
        COMMENT ON COLUMN projects.holding_period_months IS 'Expected holding period in months';
    END IF;
    
END $$;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_costs ON projects(purchase_price, selling_price);

-- Create a view for cost calculations
CREATE OR REPLACE VIEW project_costs_view AS
SELECT 
    id,
    name,
    company_name,
    purchase_price,
    selling_price,
    legal_fees,
    due_diligence_costs,
    broker_commission,
    exchange_fees,
    monthly_listing_fee,
    annual_compliance_costs,
    annual_accounting_costs,
    holding_period_months,
    -- Calculate total transaction costs
    (legal_fees + due_diligence_costs + exchange_fees + (purchase_price * COALESCE(broker_commission, 0) / 100)) AS total_transaction_costs,
    -- Calculate total operational costs for holding period
    ((monthly_listing_fee + annual_compliance_costs / 12 + annual_accounting_costs / 12) * COALESCE(holding_period_months, 12)) AS total_operational_costs,
    -- Calculate total investment (purchase + transaction + operational)
    (purchase_price + 
     (legal_fees + due_diligence_costs + exchange_fees + (purchase_price * COALESCE(broker_commission, 0) / 100)) + 
     ((monthly_listing_fee + annual_compliance_costs / 12 + annual_accounting_costs / 12) * COALESCE(holding_period_months, 12))) AS total_investment,
    -- Calculate net profit
    (selling_price - (
        purchase_price + 
        (legal_fees + due_diligence_costs + exchange_fees + (purchase_price * COALESCE(broker_commission, 0) / 100)) + 
        ((monthly_listing_fee + annual_compliance_costs / 12 + annual_accounting_costs / 12) * COALESCE(holding_period_months, 12))
    )) AS net_profit,
    -- Calculate net ROI
    CASE 
        WHEN (purchase_price + 
              (legal_fees + due_diligence_costs + exchange_fees + (purchase_price * COALESCE(broker_commission, 0) / 100)) + 
              ((monthly_listing_fee + annual_compliance_costs / 12 + annual_accounting_costs / 12) * COALESCE(holding_period_months, 12))) > 0 
        THEN (((selling_price - (
                purchase_price + 
                (legal_fees + due_diligence_costs + exchange_fees + (purchase_price * COALESCE(broker_commission, 0) / 100)) + 
                ((monthly_listing_fee + annual_compliance_costs / 12 + annual_accounting_costs / 12) * COALESCE(holding_period_months, 12))
            )) / (purchase_price + 
                (legal_fees + due_diligence_costs + exchange_fees + (purchase_price * COALESCE(broker_commission, 0) / 100)) + 
                ((monthly_listing_fee + annual_compliance_costs / 12 + annual_accounting_costs / 12) * COALESCE(holding_period_months, 12)))) * 100)
        ELSE 0
    END AS net_roi,
    created_at,
    updated_at
FROM projects;

-- Update sample data with cost information
UPDATE projects SET
    legal_fees = 50000,
    due_diligence_costs = 75000,
    broker_commission = 2.5,
    exchange_fees = 25000,
    monthly_listing_fee = 5000,
    annual_compliance_costs = 60000,
    annual_accounting_costs = 45000,
    holding_period_months = 18
WHERE name = 'TechCorp AG - Börsenmantel';

UPDATE projects SET
    legal_fees = 85000,
    due_diligence_costs = 120000,
    broker_commission = 3.0,
    exchange_fees = 40000,
    monthly_listing_fee = 7500,
    annual_compliance_costs = 90000,
    annual_accounting_costs = 70000,
    holding_period_months = 24
WHERE name = 'FinanceGroup SE - Börsenmantel';

UPDATE projects SET
    legal_fees = 25000,
    due_diligence_costs = 40000,
    broker_commission = 2.0,
    exchange_fees = 15000,
    monthly_listing_fee = 3000,
    annual_compliance_costs = 40000,
    annual_accounting_costs = 35000,
    holding_period_months = 12
WHERE name = 'StartupXYZ AG - Börsenmantel';

UPDATE projects SET
    legal_fees = 60000,
    due_diligence_costs = 95000,
    broker_commission = 2.8,
    exchange_fees = 32000,
    monthly_listing_fee = 6500,
    annual_compliance_costs = 75000,
    annual_accounting_costs = 55000,
    holding_period_months = 15
WHERE name = 'BankCorp AG - Börsenmantel';

UPDATE projects SET
    legal_fees = 35000,
    due_diligence_costs = 55000,
    broker_commission = 2.2,
    exchange_fees = 18000,
    monthly_listing_fee = 4000,
    annual_compliance_costs = 50000,
    annual_accounting_costs = 38000,
    holding_period_months = 10
WHERE name = 'MedTech AG - Börsenmantel';


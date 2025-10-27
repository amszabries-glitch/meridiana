-- Add Table for Available Shells Market Data
-- This table stores available shell company listings in the DACH region

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Check if available_shells table already exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'available_shells') THEN
        CREATE TABLE available_shells (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(255) NOT NULL,
            exchange VARCHAR(50) NOT NULL CHECK (exchange IN ('XETRA', 'MUNICH', 'BERLIN', 'HANSE', 'OTHER')),
            sector VARCHAR(100),
            market_cap DECIMAL(15,2),
            shares_outstanding INTEGER,
            listing_date DATE,
            status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'negotiation', 'reserved', 'sold')),
            asking_price DECIMAL(15,2),
            last_trade_date DATE,
            contact_email VARCHAR(255),
            contact_phone VARCHAR(50),
            notes TEXT,
            broker_name VARCHAR(255),
            broker_contact VARCHAR(255),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create indexes for better query performance
        CREATE INDEX idx_available_shells_status ON available_shells(status);
        CREATE INDEX idx_available_shells_exchange ON available_shells(exchange);
        CREATE INDEX idx_available_shells_market_cap ON available_shells(market_cap);
        CREATE INDEX idx_available_shells_created_at ON available_shells(created_at);

        -- Row Level Security (RLS)
        ALTER TABLE available_shells ENABLE ROW LEVEL SECURITY;

        -- RLS Policies - Allow all operations for now
        CREATE POLICY "Allow all operations on available_shells" ON available_shells FOR ALL USING (true);

        -- Function to automatically update updated_at timestamp
        CREATE TRIGGER update_available_shells_updated_at 
            BEFORE UPDATE ON available_shells 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();

        -- Insert sample data
        INSERT INTO available_shells (name, exchange, sector, market_cap, shares_outstanding, listing_date, status, asking_price, last_trade_date, contact_email, broker_name, notes) VALUES
        ('TechVenture AG', 'XETRA', 'Technology', 2500000, 1000000, '2019-03-15', 'available', 2850000, '2025-01-10', 'anfrage@shelltech.de', 'TechShell Brokers', 'Wird regelmäßig gehandelt, gut strukturiert'),
        ('Industrial Partners SE', 'MUNICH', 'Industrial', 4500000, 1500000, '2018-11-22', 'available', 5200000, '2025-01-08', 'contact@industrial.de', 'Munich Shell Market', 'Solid history, clean structure'),
        ('Finance Group AG', 'BERLIN', 'Finance', 3200000, 2500000, '2020-06-10', 'negotiation', 3700000, '2025-01-15', 'inquiry@financegroup.de', 'Berlin Capital Partners', 'In active discussions with 2 interested parties'),
        ('Green Energy SE', 'XETRA', 'Energy', 1800000, 800000, '2021-09-05', 'available', 2100000, '2025-01-05', 'green@energy.de', 'Energy Shell Brokers', 'Clean energy focus, good for ESG projects'),
        ('Digital Solutions AG', 'HANSE', 'Digital', 3800000, 1200000, '2017-12-20', 'reserved', 4200000, '2025-01-12', 'digital@solutions.de', 'Hanseatic Shell Corp', 'Currently reserved for specific buyer');

        COMMENT ON TABLE available_shells IS 'Stores information about available shell companies in the DACH region';
        COMMENT ON COLUMN available_shells.status IS 'Status: available, negotiation, reserved, sold';
        COMMENT ON COLUMN available_shells.exchange IS 'Stock exchange: XETRA, MUNICH, BERLIN, HANSE, OTHER';
        COMMENT ON COLUMN available_shells.market_cap IS 'Current market capitalization in EUR';
        COMMENT ON COLUMN available_shells.asking_price IS 'Asking price by broker/owner in EUR';
    END IF;
END $$;


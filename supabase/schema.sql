-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE deal_status AS ENUM ('lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost');
CREATE TYPE deal_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE activity_type AS ENUM ('call', 'email', 'meeting', 'note', 'task');
CREATE TYPE contact_role AS ENUM ('primary', 'secondary', 'decision_maker', 'influencer');
CREATE TYPE user_role AS ENUM ('admin', 'user');

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contacts table
CREATE TABLE contacts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  position TEXT,
  notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create deals table
CREATE TABLE deals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status deal_status DEFAULT 'lead',
  priority deal_priority DEFAULT 'medium',
  value DECIMAL(15,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  actual_close_date DATE,
  source TEXT,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create deal_contacts junction table
CREATE TABLE deal_contacts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  role contact_role DEFAULT 'primary',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(deal_id, contact_id)
);

-- Create activities table
CREATE TABLE activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  type activity_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_deals_priority ON deals(priority);
CREATE INDEX idx_deals_assigned_to ON deals(assigned_to);
CREATE INDEX idx_deals_created_by ON deals(created_by);
CREATE INDEX idx_deals_expected_close_date ON deals(expected_close_date);
CREATE INDEX idx_contacts_created_by ON contacts(created_by);
CREATE INDEX idx_activities_deal_id ON activities(deal_id);
CREATE INDEX idx_activities_contact_id ON activities(contact_id);
CREATE INDEX idx_activities_created_by ON activities(created_by);
CREATE INDEX idx_activities_scheduled_at ON activities(scheduled_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Contacts policies
CREATE POLICY "Users can view all contacts" ON contacts FOR SELECT USING (true);
CREATE POLICY "Users can insert contacts" ON contacts FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own contacts" ON contacts FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete own contacts" ON contacts FOR DELETE USING (auth.uid() = created_by);

-- Deals policies
CREATE POLICY "Users can view all deals" ON deals FOR SELECT USING (true);
CREATE POLICY "Users can insert deals" ON deals FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own deals" ON deals FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete own deals" ON deals FOR DELETE USING (auth.uid() = created_by);

-- Deal contacts policies
CREATE POLICY "Users can view deal contacts" ON deal_contacts FOR SELECT USING (true);
CREATE POLICY "Users can insert deal contacts" ON deal_contacts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM deals WHERE id = deal_id AND created_by = auth.uid())
);
CREATE POLICY "Users can update deal contacts" ON deal_contacts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM deals WHERE id = deal_id AND created_by = auth.uid())
);
CREATE POLICY "Users can delete deal contacts" ON deal_contacts FOR DELETE USING (
  EXISTS (SELECT 1 FROM deals WHERE id = deal_id AND created_by = auth.uid())
);

-- Activities policies
CREATE POLICY "Users can view all activities" ON activities FOR SELECT USING (true);
CREATE POLICY "Users can insert activities" ON activities FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own activities" ON activities FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete own activities" ON activities FOR DELETE USING (auth.uid() = created_by);

-- Create views for analytics
CREATE VIEW deal_analytics AS
SELECT 
  status,
  COUNT(*) as count,
  SUM(value) as total_value,
  AVG(value) as avg_value,
  AVG(probability) as avg_probability
FROM deals
GROUP BY status;

CREATE VIEW monthly_deals AS
SELECT 
  DATE_TRUNC('month', created_at) as month,
  status,
  COUNT(*) as count,
  SUM(value) as total_value
FROM deals
GROUP BY DATE_TRUNC('month', created_at), status
ORDER BY month DESC;

-- Create function to get dashboard stats
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'totalDeals', (SELECT COUNT(*) FROM deals),
    'activeDeals', (SELECT COUNT(*) FROM deals WHERE status NOT IN ('closed_won', 'closed_lost')),
    'closedWon', (SELECT COUNT(*) FROM deals WHERE status = 'closed_won'),
    'closedLost', (SELECT COUNT(*) FROM deals WHERE status = 'closed_lost'),
    'totalValue', (SELECT COALESCE(SUM(value), 0) FROM deals WHERE status = 'closed_won'),
    'averageDealSize', (SELECT COALESCE(AVG(value), 0) FROM deals WHERE status = 'closed_won'),
    'winRate', (
      CASE 
        WHEN (SELECT COUNT(*) FROM deals WHERE status IN ('closed_won', 'closed_lost')) > 0 
        THEN ROUND(
          (SELECT COUNT(*) FROM deals WHERE status = 'closed_won')::DECIMAL / 
          (SELECT COUNT(*) FROM deals WHERE status IN ('closed_won', 'closed_lost')) * 100, 2
        )
        ELSE 0 
      END
    ),
    'pipelineValue', (SELECT COALESCE(SUM(value * probability / 100), 0) FROM deals WHERE status NOT IN ('closed_won', 'closed_lost'))
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

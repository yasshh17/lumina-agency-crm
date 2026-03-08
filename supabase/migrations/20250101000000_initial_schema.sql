-- 1B. Create Tables
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  status TEXT DEFAULT 'lead' CHECK (status IN ('lead','prospect','client','churned')),
  source TEXT DEFAULT 'direct' CHECK (source IN ('referral','website','social','direct','event')),
  notes TEXT
);

CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  title TEXT NOT NULL,
  value NUMERIC(12,2) DEFAULT 0,
  stage TEXT DEFAULT 'discovery' CHECK (stage IN ('discovery','proposal','negotiation','closed_won','closed_lost')),
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  expected_close DATE,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  type TEXT NOT NULL CHECK (type IN ('call','email','meeting','note','task')),
  description TEXT NOT NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  completed BOOLEAN DEFAULT false,
  due_date TIMESTAMPTZ
);

-- 1C. Enable RLS & Permissive Policies
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to anon" ON contacts FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to anon" ON deals FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to anon" ON activities FOR ALL TO anon USING (true) WITH CHECK (true);

-- 1D. Seed Data
INSERT INTO contacts (name, email, phone, company, status, source) VALUES
('Sarah Jenkins', 'sarah@apexbrands.com', '555-0101', 'Apex Brands', 'client', 'referral'),
('Michael Chen', 'm.chen@meridian.io', '555-0102', 'Meridian Health', 'prospect', 'website'),
('Elena Rodriguez', 'elena@vanguard.media', '555-0103', 'Vanguard Media', 'lead', 'social'),
('David Wilson', 'd.wilson@nexus-tech.com', '555-0104', 'Nexus Tech', 'client', 'direct'),
('Jessica Taylor', 'j.taylor@lumina-retail.com', '555-0105', 'Lumina Retail', 'prospect', 'event'),
('Robert Miller', 'r.miller@horizon-logistics.com', '555-0106', 'Horizon Logistics', 'churned', 'website'),
('Amanda White', 'a.white@stellar-creative.com', '555-0107', 'Stellar Creative', 'client', 'referral'),
('James Bond', 'j.bond@mi6.gov', '555-0007', 'Universal Exports', 'lead', 'direct'),
('Linda Park', 'l.park@zenith-apps.com', '555-0109', 'Zenith Apps', 'prospect', 'social'),
('Kevin Adams', 'k.adams@peak-performance.com', '555-0110', 'Peak Performance', 'client', 'event');

INSERT INTO deals (title, value, stage, contact_id) VALUES
('Q2 Social Campaign', 45000, 'proposal', (SELECT id FROM contacts WHERE company = 'Apex Brands')),
('Brand Refresh Package', 25000, 'negotiation', (SELECT id FROM contacts WHERE company = 'Meridian Health')),
('SEO Retainer 2025', 12000, 'discovery', (SELECT id FROM contacts WHERE company = 'Vanguard Media')),
('Global Launch Event', 150000, 'closed_won', (SELECT id FROM contacts WHERE company = 'Nexus Tech')),
('Content Strategy Audit', 8500, 'discovery', (SELECT id FROM contacts WHERE company = 'Lumina Retail')),
('PPC Management', 15000, 'closed_lost', (SELECT id FROM contacts WHERE company = 'Horizon Logistics')),
('Influencer Partnership', 32000, 'proposal', (SELECT id FROM contacts WHERE company = 'Stellar Creative')),
('Mobile App Marketing', 60000, 'negotiation', (SELECT id FROM contacts WHERE company = 'Zenith Apps'));

INSERT INTO activities (type, description, contact_id, deal_id, completed) VALUES
('call', 'Initial discovery call for Q2 campaign', (SELECT id FROM contacts WHERE company = 'Apex Brands'), (SELECT id FROM deals WHERE title = 'Q2 Social Campaign'), true),
('email', 'Sent proposal for brand refresh', (SELECT id FROM contacts WHERE company = 'Meridian Health'), (SELECT id FROM deals WHERE title = 'Brand Refresh Package'), true),
('meeting', 'Strategy session for SEO retainer', (SELECT id FROM contacts WHERE company = 'Vanguard Media'), (SELECT id FROM deals WHERE title = 'SEO Retainer 2025'), false),
('task', 'Draft contract for Global Launch', (SELECT id FROM contacts WHERE company = 'Nexus Tech'), (SELECT id FROM deals WHERE title = 'Global Launch Event'), true),
('note', 'Client prefers minimalist design aesthetic', (SELECT id FROM contacts WHERE company = 'Lumina Retail'), NULL, true),
('email', 'Follow up on influencer partnership', (SELECT id FROM contacts WHERE company = 'Stellar Creative'), (SELECT id FROM deals WHERE title = 'Influencer Partnership'), false),
('call', 'Discussed budget constraints', (SELECT id FROM contacts WHERE company = 'Zenith Apps'), (SELECT id FROM deals WHERE title = 'Mobile App Marketing'), true),
('meeting', 'Final review of PPC performance', (SELECT id FROM contacts WHERE company = 'Horizon Logistics'), (SELECT id FROM deals WHERE title = 'PPC Management'), true),
('task', 'Prepare Q3 roadmap', (SELECT id FROM contacts WHERE company = 'Apex Brands'), NULL, false),
('email', 'Introductory email to new lead', (SELECT id FROM contacts WHERE company = 'Universal Exports'), NULL, true),
('call', 'Check-in call with Peak Performance', (SELECT id FROM contacts WHERE company = 'Peak Performance'), NULL, true),
('note', 'Interested in video production services', (SELECT id FROM contacts WHERE company = 'Vanguard Media'), NULL, true);

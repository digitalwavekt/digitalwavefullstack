-- Create company_projects table
CREATE TABLE company_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT,
    status TEXT,
    image_url TEXT,
    project_url TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_company_projects_modtime
    BEFORE UPDATE ON company_projects
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Insert 10 required seed projects
INSERT INTO company_projects (title, slug, description, category, status, project_url, display_order) VALUES
('Digital Wave AI Student Project Delivery Platform', 'ai-student-project-delivery', 'AI-powered student project delivery system where students can purchase internship/project packages, log in with the same email, track project status, access scope, documentation, viva questions, installation guide, PPT, and final delivery assets after admin approval.', 'AI Platform', 'In Development', '', 1),
('DiggiAssist', 'diggiassist', 'India-focused on-demand local service provider ecosystem connecting customers with verified service providers. Includes provider onboarding, admin verification, service booking, future wallet, merchandise, and expansion-ready modules.', 'Service Marketplace', 'In Development', 'https://diggiassist.digitalwaveitsolution.online/', 2),
('Krishi Suraksha AI Grid', 'krishi-suraksha-ai-grid', 'AI-powered agriculture safety and monitoring platform designed for crop protection, smart alerts, farmer assistance, and scalable cloud-ready deployment.', 'Agriculture AI', 'In Development', '', 3),
('PVChat', 'pvchat', 'Real-time chat application with modern messaging experience, group chat support, user-focused UI, and scalable communication features.', 'Communication', 'In Development', '', 4),
('LeadFlow for Designers', 'leadflow-designers', 'Lead generation marketplace for designers with client/designer/admin roles, real-time updates, AI lead scoring, credits/payment system, and production-ready marketplace architecture.', 'Lead Marketplace', 'In Development', '', 5),
('Farmer Products Website', 'farmer-products', 'A brand website for government-authorized farmer products, helping customers discover quality, effective-cost spices and food products directly from farmer-focused sources.', 'Farmer Products', 'Live', 'https://fpo.digitalwaveitsolution.online', 6),
('Trading Bot / Forex AI Bot', 'trading-forex-ai-bot', 'AI-assisted trading research bot concept that reads market data and news signals, supports safe decision workflows, and is planned with strict risk controls before any live trading.', 'FinTech / Trading Research', 'Planning', '', 7),
('Emergency First-Aid Guide App', 'emergency-first-aid', 'Offline-first India-focused first-aid guide app with step-by-step emergency instructions, categories for burns, poisoning, accidents, rural emergencies, women/child safety, and disaster support.', 'Health / Emergency', 'Planning', '', 8),
('Digital Wave AI Ops / AI Agents Control System', 'ai-ops-control-system', 'Internal AI agents and automation system for managing Digital Wave projects, API workflows, task execution, and intelligent project operations.', 'AI Operations', 'In Development', '', 9),
('Society / Ledger / Audit / S3 Upload System', 'admin-system-ledger', 'Secure management system with audit logs, file upload workflows, AWS S3 storage, role-based permissions, and production-focused admin operations.', 'Admin System', 'Internal', '', 10);

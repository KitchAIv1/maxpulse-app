-- Health Conversations & Symptom Tracking Schema
-- MVP1: AI Coach Health-Focused Implementation
-- HIPAA Compliant with audit trails and encryption support

-- ============================================
-- Health Conversations Table
-- ============================================
CREATE TABLE IF NOT EXISTS health_conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    session_id TEXT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    ended_at TIMESTAMPTZ,
    conversation_type TEXT DEFAULT 'general' CHECK (conversation_type IN ('general', 'symptom', 'wellness_check', 'follow_up')),
    summary TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Symptom Reports Table
-- ============================================
CREATE TABLE IF NOT EXISTS symptom_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    conversation_id UUID REFERENCES health_conversations(id) ON DELETE CASCADE,
    symptom_type TEXT NOT NULL CHECK (symptom_type IN ('physical', 'mental', 'emotional', 'sleep', 'energy', 'pain', 'digestive', 'respiratory', 'other')),
    symptom_description TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe', 'critical')),
    duration_days INTEGER,
    duration_description TEXT,
    affected_areas TEXT[],
    triggers TEXT[],
    relieving_factors TEXT[],
    associated_symptoms TEXT[],
    frequency TEXT CHECK (frequency IN ('constant', 'intermittent', 'occasional', 'rare')),
    onset_date DATE,
    reported_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    health_context JSONB,
    ai_analysis JSONB,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    requires_medical_attention BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Health Recommendations Table
-- ============================================
CREATE TABLE IF NOT EXISTS health_recommendations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    conversation_id UUID REFERENCES health_conversations(id) ON DELETE CASCADE,
    symptom_report_id UUID REFERENCES symptom_reports(id) ON DELETE CASCADE,
    recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('lifestyle', 'natural', 'medical_referral', 'product', 'behavioral', 'dietary', 'exercise', 'sleep_hygiene')),
    recommendation_text TEXT NOT NULL,
    reasoning TEXT,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    evidence_based BOOLEAN DEFAULT TRUE,
    sources TEXT[],
    contraindications TEXT[],
    expected_timeline TEXT,
    compliance_checked BOOLEAN DEFAULT TRUE,
    compliance_region TEXT[] DEFAULT ARRAY['USA', 'UAE'],
    disclaimer_shown BOOLEAN DEFAULT FALSE,
    user_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Product Recommendations Table
-- ============================================
CREATE TABLE IF NOT EXISTS product_recommendations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    conversation_id UUID REFERENCES health_conversations(id) ON DELETE CASCADE,
    health_recommendation_id UUID REFERENCES health_recommendations(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    product_type TEXT NOT NULL CHECK (product_type IN ('supplement', 'wellness_device', 'fitness_equipment', 'sleep_aid', 'nutrition', 'therapy_tool', 'other')),
    product_description TEXT,
    product_category TEXT,
    product_image_url TEXT,
    product_link TEXT,
    price_range TEXT,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    reasoning TEXT,
    benefits TEXT[],
    user_consent_required BOOLEAN DEFAULT TRUE,
    user_consent_given BOOLEAN DEFAULT FALSE,
    consent_given_at TIMESTAMPTZ,
    shown_to_user BOOLEAN DEFAULT FALSE,
    shown_at TIMESTAMPTZ,
    user_clicked BOOLEAN DEFAULT FALSE,
    clicked_at TIMESTAMPTZ,
    user_purchased BOOLEAN DEFAULT FALSE,
    purchased_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- User Consent Preferences Table
-- ============================================
CREATE TABLE IF NOT EXISTS user_consent_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    product_recommendations_enabled BOOLEAN DEFAULT FALSE,
    data_sharing_enabled BOOLEAN DEFAULT FALSE,
    ai_analysis_enabled BOOLEAN DEFAULT TRUE,
    health_data_retention_days INTEGER DEFAULT 365,
    marketing_consent BOOLEAN DEFAULT FALSE,
    research_consent BOOLEAN DEFAULT FALSE,
    third_party_sharing BOOLEAN DEFAULT FALSE,
    consent_version TEXT DEFAULT '1.0',
    consent_given_at TIMESTAMPTZ,
    consent_updated_at TIMESTAMPTZ,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Audit Trail Table (HIPAA Compliance)
-- ============================================
CREATE TABLE IF NOT EXISTS health_data_audit_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('create', 'read', 'update', 'delete', 'export', 'share')),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action_details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    performed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_health_conversations_user_id ON health_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_health_conversations_session_id ON health_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_health_conversations_started_at ON health_conversations(started_at DESC);

CREATE INDEX IF NOT EXISTS idx_symptom_reports_user_id ON symptom_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_symptom_reports_conversation_id ON symptom_reports(conversation_id);
CREATE INDEX IF NOT EXISTS idx_symptom_reports_reported_at ON symptom_reports(reported_at DESC);
CREATE INDEX IF NOT EXISTS idx_symptom_reports_severity ON symptom_reports(severity);

CREATE INDEX IF NOT EXISTS idx_health_recommendations_user_id ON health_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_health_recommendations_conversation_id ON health_recommendations(conversation_id);
CREATE INDEX IF NOT EXISTS idx_health_recommendations_symptom_report_id ON health_recommendations(symptom_report_id);

CREATE INDEX IF NOT EXISTS idx_product_recommendations_user_id ON product_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_product_recommendations_conversation_id ON product_recommendations(conversation_id);
CREATE INDEX IF NOT EXISTS idx_product_recommendations_consent_given ON product_recommendations(user_consent_given);

CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON health_data_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_performed_at ON health_data_audit_log(performed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_record ON health_data_audit_log(table_name, record_id);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================
ALTER TABLE health_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_consent_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_data_audit_log ENABLE ROW LEVEL SECURITY;

-- Health Conversations Policies
CREATE POLICY "Users can view own health conversations" ON health_conversations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health conversations" ON health_conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health conversations" ON health_conversations
    FOR UPDATE USING (auth.uid() = user_id);

-- Symptom Reports Policies
CREATE POLICY "Users can view own symptom reports" ON symptom_reports
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own symptom reports" ON symptom_reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own symptom reports" ON symptom_reports
    FOR UPDATE USING (auth.uid() = user_id);

-- Health Recommendations Policies
CREATE POLICY "Users can view own health recommendations" ON health_recommendations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health recommendations" ON health_recommendations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health recommendations" ON health_recommendations
    FOR UPDATE USING (auth.uid() = user_id);

-- Product Recommendations Policies
CREATE POLICY "Users can view own product recommendations" ON product_recommendations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own product recommendations" ON product_recommendations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own product recommendations" ON product_recommendations
    FOR UPDATE USING (auth.uid() = user_id);

-- User Consent Preferences Policies
CREATE POLICY "Users can view own consent preferences" ON user_consent_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consent preferences" ON user_consent_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own consent preferences" ON user_consent_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- Audit Log Policies (read-only for users)
CREATE POLICY "Users can view own audit logs" ON health_data_audit_log
    FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- Automatic Timestamp Updates
-- ============================================
CREATE TRIGGER update_health_conversations_updated_at BEFORE UPDATE ON health_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_symptom_reports_updated_at BEFORE UPDATE ON symptom_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_recommendations_updated_at BEFORE UPDATE ON health_recommendations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_recommendations_updated_at BEFORE UPDATE ON product_recommendations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_consent_preferences_updated_at BEFORE UPDATE ON user_consent_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Audit Trail Trigger Function
-- ============================================
CREATE OR REPLACE FUNCTION log_health_data_access()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO health_data_audit_log (
        user_id,
        action_type,
        table_name,
        record_id,
        action_details
    ) VALUES (
        COALESCE(NEW.user_id, OLD.user_id),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        jsonb_build_object(
            'old', to_jsonb(OLD),
            'new', to_jsonb(NEW)
        )
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER audit_symptom_reports AFTER INSERT OR UPDATE OR DELETE ON symptom_reports
    FOR EACH ROW EXECUTE FUNCTION log_health_data_access();

CREATE TRIGGER audit_health_recommendations AFTER INSERT OR UPDATE OR DELETE ON health_recommendations
    FOR EACH ROW EXECUTE FUNCTION log_health_data_access();

-- ============================================
-- Comments for Documentation
-- ============================================
COMMENT ON TABLE health_conversations IS 'Stores AI coach chat sessions with health focus';
COMMENT ON TABLE symptom_reports IS 'Detailed symptom tracking with AI analysis';
COMMENT ON TABLE health_recommendations IS 'AI-generated health recommendations with compliance checks';
COMMENT ON TABLE product_recommendations IS 'Product suggestions with user consent tracking';
COMMENT ON TABLE user_consent_preferences IS 'User consent management for HIPAA compliance';
COMMENT ON TABLE health_data_audit_log IS 'Audit trail for all health data access (HIPAA requirement)';


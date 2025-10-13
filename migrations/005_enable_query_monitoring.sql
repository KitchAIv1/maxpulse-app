-- Migration: Enable query performance monitoring
-- Date: October 13, 2025
-- Purpose: Enable pg_stat_statements and set performance guardrails

-- Enable query monitoring extension
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Set performance guardrails
ALTER SYSTEM SET statement_timeout = '30s';
ALTER SYSTEM SET idle_in_transaction_session_timeout = '60s';

-- Reload configuration to apply settings
SELECT pg_reload_conf();

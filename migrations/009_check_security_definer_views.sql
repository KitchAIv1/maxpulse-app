-- Migration: Check and list SECURITY DEFINER views for manual review
-- Date: October 13, 2025
-- Purpose: Identify SECURITY DEFINER views that need attention

-- Check all views with SECURITY DEFINER property
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE schemaname = 'public'
AND definition ILIKE '%SECURITY DEFINER%';

-- Show the specific problematic views
SELECT 
    'daily_analytics_summary' as view_name,
    'SECURITY DEFINER - bypasses RLS' as issue,
    'Review and recreate without SECURITY DEFINER if possible' as action
UNION ALL
SELECT 
    'distributor_performance' as view_name,
    'SECURITY DEFINER - bypasses RLS' as issue,
    'Review and recreate without SECURITY DEFINER if possible' as action;

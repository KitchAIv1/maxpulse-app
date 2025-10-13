-- Migration: Investigate Security Definer views
-- Date: October 13, 2025
-- Purpose: Examine the problematic SECURITY DEFINER views to understand their purpose

-- Check the definition of daily_analytics_summary view
SELECT 
    'daily_analytics_summary' as view_name,
    definition
FROM pg_views 
WHERE viewname = 'daily_analytics_summary' 
AND schemaname = 'public';

-- Check the definition of distributor_performance view  
SELECT 
    'distributor_performance' as view_name,
    definition
FROM pg_views 
WHERE viewname = 'distributor_performance' 
AND schemaname = 'public';

-- Check what tables these views access
SELECT DISTINCT
    v.view_name,
    t.table_name as accessed_table
FROM information_schema.view_table_usage t
JOIN information_schema.views v ON v.table_name = t.view_name
WHERE v.table_name IN ('daily_analytics_summary', 'distributor_performance')
AND v.table_schema = 'public'
ORDER BY v.view_name, t.table_name;

-- 002_india_disaster_types_and_defaults.sql
-- Migration: Add CYCLONE and HEATWAVE to disaster_type ENUM if needed, and set default geography indexes

ALTER TABLE disaster_alerts
MODIFY COLUMN disaster_type ENUM('FLOOD', 'FIRE', 'EARTHQUAKE', 'STORM', 'CHEMICAL', 'CYCLONE', 'HEATWAVE', 'OTHER') NOT NULL;

ALTER TABLE incidents
MODIFY COLUMN disaster_type ENUM('FLOOD', 'FIRE', 'EARTHQUAKE', 'STORM', 'CHEMICAL', 'CYCLONE', 'HEATWAVE', 'OTHER') NOT NULL;

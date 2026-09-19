-- Disaster Alert and Community Response App
-- Seed Data Script
-- Populates realistic records for development, testing, and demonstration

USE disaster_response_db;

-- Clear existing data in reverse foreign key order
DELETE FROM response_records;
DELETE FROM volunteers;
DELETE FROM safe_locations;
DELETE FROM emergency_requests;
DELETE FROM incidents;
DELETE FROM disaster_alerts;
DELETE FROM users;

-- Reset Auto Increment values
ALTER TABLE response_records AUTO_INCREMENT = 1;
ALTER TABLE volunteers AUTO_INCREMENT = 1;
ALTER TABLE safe_locations AUTO_INCREMENT = 1;
ALTER TABLE emergency_requests AUTO_INCREMENT = 1;
ALTER TABLE incidents AUTO_INCREMENT = 1;
ALTER TABLE disaster_alerts AUTO_INCREMENT = 1;
ALTER TABLE users AUTO_INCREMENT = 1;

-- ==========================================
-- 1. SEED USERS
-- Passwords are bcrypt hashes for 'password123' ($2a$10$e8W/X0A/H1B3c7j7899Xze.8J3H4i8Y998u3828s1919)
-- ==========================================
INSERT INTO users (id, full_name, email, password_hash, phone, role, is_active) VALUES
(1, 'System Administrator', 'admin@disasterapp.org', '$2a$10$e8W/X0A/H1B3c7j7899Xze.8J3H4i8Y998u3828s1919', '+15550001111', 'ADMIN', TRUE),
(2, 'Sarah Jenkins (EOC Coordinator)', 'sarah.j@disasterapp.org', '$2a$10$e8W/X0A/H1B3c7j7899Xze.8J3H4i8Y998u3828s1919', '+15550002222', 'ADMIN', TRUE),
(3, 'John Doe (Citizen)', 'john.doe@example.com', '$2a$10$e8W/X0A/H1B3c7j7899Xze.8J3H4i8Y998u3828s1919', '+15551112233', 'CITIZEN', TRUE),
(4, 'Maria Garcia (Citizen)', 'maria.g@example.com', '$2a$10$e8W/X0A/H1B3c7j7899Xze.8J3H4i8Y998u3828s1919', '+15552223344', 'CITIZEN', TRUE),
(5, 'Robert Chen (Citizen)', 'robert.chen@example.com', '$2a$10$e8W/X0A/H1B3c7j7899Xze.8J3H4i8Y998u3828s1919', '+15553334455', 'CITIZEN', TRUE),
(6, 'Dr. Alex Vance (EMT Volunteer)', 'alex.vance@responder.org', '$2a$10$e8W/X0A/H1B3c7j7899Xze.8J3H4i8Y998u3828s1919', '+15554445566', 'VOLUNTEER', TRUE),
(7, 'David Miller (Rescue Tech)', 'david.m@responder.org', '$2a$10$e8W/X0A/H1B3c7j7899Xze.8J3H4i8Y998u3828s1919', '+15555556677', 'VOLUNTEER', TRUE),
(8, 'Elena Rostova (Logistics Specialist)', 'elena.r@responder.org', '$2a$10$e8W/X0A/H1B3c7j7899Xze.8J3H4i8Y998u3828s1919', '+15556667788', 'VOLUNTEER', TRUE);

-- ==========================================
-- 2. SEED DISASTER ALERTS
-- ==========================================
INSERT INTO disaster_alerts (id, title, disaster_type, severity, affected_location, description, status, created_by) VALUES
(1, 'Critical River Flash Flood Warning', 'FLOOD', 'CRITICAL', 'Downtown Riverfront & Lower East Sector', 'Rapidly rising water levels along the main river basin following heavy rainfall. Residents in low-lying zones must evacuate to elevated ground immediately.', 'ACTIVE', 1),
(2, 'Wildfire Evacuation Advisory', 'FIRE', 'HIGH', 'Northern Pine Ridge & Hillside Heights', 'Fast-moving brush fire spreading southwards due to high wind gusts. Prepare emergency grab-and-go kits and monitor local broadcasts.', 'ACTIVE', 2),
(3, 'Severe Thunderstorm & High Winds', 'STORM', 'MEDIUM', 'Metropolitan County Area', 'Severe weather system approaching with wind gusts up to 60mph and potential hail. Secure outdoor property and stay indoors.', 'ACTIVE', 1),
(4, 'Chemical Tanker Spill Warning (Resolved)', 'CHEMICAL', 'HIGH', 'Industrial Zone Highway 9 Junction', 'Hazardous material leak contained by HAZMAT response team. Air quality safety confirmed.', 'RESOLVED', 2);

-- ==========================================
-- 3. SEED INCIDENTS
-- ==========================================
INSERT INTO incidents (id, reporter_id, disaster_type, location, latitude, longitude, severity, description, status) VALUES
(1, 3, 'FLOOD', 'Intersection of 5th Ave and Water Street', 37.77490000, -122.41940000, 'CRITICAL', 'Water depth reached 3 feet. Multiple vehicles stalled on road.', 'IN_PROGRESS'),
(2, 4, 'FIRE', '1420 Hillside Terrace', 37.78330000, -122.41670000, 'HIGH', 'Transformer explosion caused brush fire near residential structures.', 'VERIFIED'),
(3, 5, 'STORM', 'Oakwood Community Park Entrance', 37.76500000, -122.43000000, 'MEDIUM', 'Large oak tree collapsed, blocking main two-lane access road and tearing down power lines.', 'REPORTED'),
(4, 3, 'OTHER', 'Westside Shopping Plaza', 37.75000000, -122.40000000, 'LOW', 'Minor localized street flooding due to clogged storm drains.', 'RESOLVED');

-- ==========================================
-- 4. SEED EMERGENCY REQUESTS
-- ==========================================
INSERT INTO emergency_requests (id, requester_id, request_type, priority, location, people_affected, contact_phone, description, status) VALUES
(1, 3, 'RESCUE', 'CRITICAL', '842 Riverfront Lane, Apt 2B', 3, '+15551112233', 'Water surrounds ground floor. Two elderly residents and one infant require boat evacuation.', 'ASSIGNED'),
(2, 4, 'MEDICAL', 'HIGH', '1420 Hillside Terrace', 1, '+15552223344', 'Individual suffered minor smoke inhalation from nearby brush fire. Needs medical checkup.', 'IN_PROGRESS'),
(3, 5, 'FOOD_WATER', 'MEDIUM', 'Oakwood High School Assembly Hall', 12, '+15553334455', 'Stranded community group requiring clean drinking water and emergency rations.', 'PENDING'),
(4, 3, 'SHELTER', 'LOW', 'Westside Transit Hub', 2, '+15551112233', 'Family needing temporary overnight shelter due to power outages.', 'FULFILLED');

-- ==========================================
-- 5. SEED SAFE LOCATIONS
-- ==========================================
INSERT INTO safe_locations (id, name, address, capacity, current_occupancy, facilities, status, contact_phone, created_by) VALUES
(1, 'Central High School Emergency Shelter', '500 Education Way, Sector 1', 300, 120, 'Medical Station, Emergency Generator, Hot Meals, Pet Friendly, Wheelchair Access', 'OPEN', '+15559001000', 1),
(2, 'Civic Center Evacuation Complex', '100 Municipal Plaza', 500, 480, 'Full Medical Post, Showers, Family Units, Wi-Fi, Generator Power', 'OPEN', '+15559002000', 2),
(3, 'Northside Community Gym', '782 North Boundary Road', 150, 150, 'Sleeping Cots, Basic First Aid, Water Distribution Point', 'FULL', '+15559003000', 1),
(4, 'Westside St. Jude Relief Center', '320 Hope Street', 200, 0, 'Food Kitchen, Supplies Distribution, Clothing', 'CLOSED', '+15559004000', 2);

-- ==========================================
-- 6. SEED VOLUNTEERS
-- ==========================================
INSERT INTO volunteers (id, user_id, skills, operating_area, availability_status) VALUES
(1, 6, 'First Aid, Triage, Paramedic, CPR Certified', 'Downtown & Riverfront District', 'BUSY'),
(2, 7, 'Swiftwater Rescue, Boat Operator, Search & Rescue', 'Riverfront & Flood Zone A', 'BUSY'),
(3, 8, 'Food Logistics, Supply Distribution, Truck Driving (CDL)', 'Metropolitan Area Wide', 'AVAILABLE');

-- ==========================================
-- 7. SEED RESPONSE RECORDS
-- ==========================================
INSERT INTO response_records (id, volunteer_id, incident_id, request_id, action_taken, status, assigned_at, completed_at) VALUES
(1, 2, 1, 1, 'Dispatched inflatable rescue craft to 842 Riverfront Lane. Evacuating 3 residents.', 'IN_PROGRESS', NOW(), NULL),
(2, 1, 2, 2, 'Arrived on scene at Hillside Terrace. Administered oxygen treatment for smoke inhalation.', 'IN_PROGRESS', NOW(), NULL),
(3, 3, NULL, 4, 'Coordinated temporary shelter placement at Central High Shelter for displaced family.', 'COMPLETED', NOW() - INTERVAL 5 HOUR, NOW() - INTERVAL 4 HOUR);

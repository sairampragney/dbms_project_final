-- Initial Seed Data for Development and Testing Environment (India Localized)
-- Default Geography: Hyderabad, Telangana & Pan-India

USE disaster_response_db;

-- 1. USERS TABLE SEED (Passwords are bcrypt hashes for 'password123')
INSERT INTO users (id, full_name, email, password_hash, phone, role, is_active) VALUES
(1, 'System Administrator', 'admin@disasterapp.org', '$2a$10$e8W/X0A/H1B3c7j7899Xze.8J3H4i8Y998u3828s1919', '+91 98765 00001', 'ADMIN', TRUE),
(2, 'Sarah Jenkins (EOC Coordinator)', 'sarah.j@disasterapp.org', '$2a$10$e8W/X0A/H1B3c7j7899Xze.8J3H4i8Y998u3828s1919', '+91 98765 00002', 'ADMIN', TRUE),
(3, 'John Doe (Citizen)', 'john.doe@example.com', '$2a$10$e8W/X0A/H1B3c7j7899Xze.8J3H4i8Y998u3828s1919', '+91 98765 11111', 'CITIZEN', TRUE),
(4, 'Maria Garcia (Citizen)', 'maria.g@example.com', '$2a$10$e8W/X0A/H1B3c7j7899Xze.8J3H4i8Y998u3828s1919', '+91 98765 22222', 'CITIZEN', TRUE),
(5, 'Robert Chen (Citizen)', 'robert.chen@example.com', '$2a$10$e8W/X0A/H1B3c7j7899Xze.8J3H4i8Y998u3828s1919', '+91 98765 33333', 'CITIZEN', TRUE),
(6, 'Dr. Alex Vance (EMT Volunteer)', 'alex.vance@responder.org', '$2a$10$e8W/X0A/H1B3c7j7899Xze.8J3H4i8Y998u3828s1919', '+91 98765 44444', 'VOLUNTEER', TRUE),
(7, 'David Miller (Rescue Tech)', 'david.m@responder.org', '$2a$10$e8W/X0A/H1B3c7j7899Xze.8J3H4i8Y998u3828s1919', '+91 98765 55555', 'VOLUNTEER', TRUE),
(8, 'Elena Rostova (Logistics Specialist)', 'elena.r@responder.org', '$2a$10$e8W/X0A/H1B3c7j7899Xze.8J3H4i8Y998u3828s1919', '+91 98765 66666', 'VOLUNTEER', TRUE)
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), phone = VALUES(phone);

-- 2. DISASTER ALERTS TABLE SEED
INSERT INTO disaster_alerts (id, title, alert_type, severity, affected_location, description, status, created_by) VALUES
(1, 'Severe Urban Flooding Flash Advisory', 'FLOOD', 'HIGH', 'Musi River Basin & Begumpet, Hyderabad, Telangana', 'Flash flooding expected along low-lying Musi riverbanks and Begumpet railway underpasses due to heavy rainfall. Evacuate low-lying areas immediately.', 'ACTIVE', 1),
(2, 'Cyclonic Weather Warning', 'CYCLONE', 'CRITICAL', 'Visakhapatnam & Coastal Andhra Pradesh', 'Severe Cyclonic Storm approaching North Andhra coast with gusty winds up to 110 km/h. Coastal communities should move to safe shelters.', 'ACTIVE', 1),
(3, 'Heavy Thunderstorm & Lightning Warning', 'STORM', 'MEDIUM', 'Warangal & Hanamkonda District, Telangana', 'Severe weather system causing power outages and tree falls. Stay indoors and away from electrical poles.', 'ACTIVE', 2),
(4, 'Heatwave Advisory', 'HEATWAVE', 'LOW', 'Vijayawada & Guntur, Andhra Pradesh', 'Extreme daytime temperatures exceeding 43°C expected. Stay hydrated and avoid outdoor exposure during peak hours.', 'RESOLVED', 2)
ON DUPLICATE KEY UPDATE title = VALUES(title), affected_location = VALUES(affected_location), description = VALUES(description);

-- 3. INCIDENTS TABLE SEED
INSERT INTO incidents (id, reporter_id, title, disaster_type, severity, location, latitude, longitude, description, status) VALUES
(1, 3, 'Waterlogging and Trapped Commuters', 'FLOOD', 'HIGH', 'Ameerpet Metro Station Junction, Hyderabad', 17.4375, 78.4483, 'Musi tributary water accumulation over 3 feet deep. Multiple light vehicles stalled.', 'IN_PROGRESS'),
(2, 4, 'Short Circuit Electrical Fire', 'FIRE', 'MEDIUM', 'Secunderabad Station Road market complex', 17.4399, 78.4983, 'Transformer spark caused small commercial fire. Local fire tenders dispatched.', 'VERIFIED'),
(3, 5, 'Tree Uprooted Blocking Main Road', 'STORM', 'LOW', 'Banjara Hills Road No. 12, Hyderabad', 17.4156, 78.4347, 'Large banyan tree fallen across roadway blocking traffic.', 'REPORTED')
ON DUPLICATE KEY UPDATE title = VALUES(title), location = VALUES(location), description = VALUES(description);

-- 4. EMERGENCY REQUESTS TABLE SEED
INSERT INTO emergency_requests (id, requester_id, request_type, priority, location, people_affected, contact_phone, description, status) VALUES
(1, 3, 'RESCUE', 'CRITICAL', 'Nizamapet Colony, Road No 3, Hyderabad', 3, '+91 98765 11111', 'Flood water surrounds ground floor. Two elderly residents and one infant require boat evacuation.', 'ASSIGNED'),
(2, 4, 'MEDICAL', 'HIGH', 'Old City, Charminar Sector, Hyderabad', 1, '+91 98765 22222', 'Individual suffered minor smoke inhalation from nearby fire. Needs medical checkup.', 'IN_PROGRESS'),
(3, 5, 'FOOD_WATER', 'MEDIUM', 'Kukatpally Housing Board Assembly Hall', 12, '+91 98765 33333', 'Stranded community group requiring clean drinking water and emergency rations.', 'PENDING'),
(4, 3, 'SHELTER', 'LOW', 'Secunderabad Railway Station Transit Area', 2, '+91 98765 11111', 'Family needing temporary overnight shelter due to power outages.', 'FULFILLED')
ON DUPLICATE KEY UPDATE location = VALUES(location), contact_phone = VALUES(contact_phone), description = VALUES(description);

-- 5. SAFE LOCATIONS TABLE SEED
INSERT INTO safe_locations (id, name, address, capacity, current_occupancy, facilities, status, contact_phone, managed_by) VALUES
(1, 'Central Government Indoor Sports Complex Shelter', 'LB Stadium Road, Abids, Hyderabad', 300, 120, 'Medical Station, Emergency Generator, Hot Meals, Wheelchair Access', 'OPEN', '+91 98765 90001', 1),
(2, 'Gachibowli Community Evacuation Center', '100 Feet Road, Gachibowli, Hyderabad', 500, 480, 'Full Medical Post, Showers, Family Units, Wi-Fi, Generator Power', 'OPEN', '+91 98765 90002', 2),
(3, 'Secunderabad Public Gym Shelter', 'MG Road, Near Clock Tower, Secunderabad', 150, 150, 'Sleeping Cots, Basic First Aid, Water Distribution Point', 'FULL', '+91 98765 90003', 1),
(4, 'Malkajgiri Community Relief Center', 'Vani Nagar, Malkajgiri, Hyderabad', 200, 0, 'Food Kitchen, Supplies Distribution, Clothing', 'CLOSED', '+91 98765 90004', 2)
ON DUPLICATE KEY UPDATE name = VALUES(name), address = VALUES(address), contact_phone = VALUES(contact_phone);

-- 6. VOLUNTEERS TABLE SEED
INSERT INTO volunteers (id, user_id, skills, availability, current_location, assigned_task) VALUES
(1, 6, 'EMT First Responder, Triage, Paramedic', 'AVAILABLE', 'Ameerpet Emergency Post', NULL),
(2, 7, 'Swiftwater Search & Rescue, Boat Operator', 'BUSY', 'Nizamapet Evacuation Sector', 'Assigned to Boat Rescue Team 1'),
(3, 8, 'Logistics, Supply Chain, Food Distribution', 'AVAILABLE', 'Central Warehouse Abids', NULL)
ON DUPLICATE KEY UPDATE skills = VALUES(skills), current_location = VALUES(current_location);

-- 7. RESPONSE RECORDS TABLE SEED
INSERT INTO response_records (id, incident_id, request_id, responder_id, action_taken, status) VALUES
(1, 1, 1, 7, 'Deployed swiftwater inflatable rescue boat to evacuee residence in Nizamapet.', 'IN_PROGRESS'),
(2, 2, 2, 6, 'Provided oxygen therapy and first aid treatment at Secunderabad triage point.', 'COMPLETED')
ON DUPLICATE KEY UPDATE action_taken = VALUES(action_taken);

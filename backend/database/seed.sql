-- ==============================================================================
-- Student Digital ID Card System - Database Seed Data
-- Dialect: PostgreSQL (14+)
-- Default password for all seed users: "password123"
-- Hash: $2a$10$rCzC0iE8VwZJ.33pEskg0.fT1061i8t2yY7hY1vXFomvQ93f4/X3q
-- ==============================================================================

-- 1. DEMO INSTITUTES
INSERT INTO institutes (id, name, code, logo_url, address, phone, email, website, status)
VALUES 
(
    'a0000000-0000-0000-0000-000000000001',
    'Apex Institute of Science & Technology',
    'AIST',
    'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=150&auto=format&fit=crop&q=80',
    '100 Innovation Boulevard, Tech District, CA 94107',
    '+1 (555) 234-5678',
    'admin@aist.edu',
    'https://aist.edu',
    'ACTIVE'
),
(
    'a0000000-0000-0000-0000-000000000002',
    'Metropolitan Polytechnic University',
    'MPU',
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=150&auto=format&fit=crop&q=80',
    '450 University Way, Metropolitan City, NY 10001',
    '+1 (555) 876-5432',
    'info@mpu.edu',
    'https://mpu.edu',
    'ACTIVE'
)
ON CONFLICT (code) DO NOTHING;

-- 2. DEPARTMENTS (AIST)
INSERT INTO departments (id, institute_id, code, name, description, head_of_department, is_active)
VALUES
(
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'CST',
    'Computer Science & Technology',
    'Focuses on software engineering, cloud computing, artificial intelligence, and network systems.',
    'Dr. Evelyn Vance',
    true
),
(
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'EEE',
    'Electrical & Electronic Engineering',
    'Power systems, embedded electronics, robotics, and signal processing.',
    'Prof. Marcus Aurelius Sterling',
    true
),
(
    'b0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'ME',
    'Mechanical Engineering',
    'Thermodynamics, mechanical design, automotive systems, and advanced materials.',
    'Dr. Sarah Chen',
    true
),
(
    'b0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000001',
    'CE',
    'Civil & Environmental Technology',
    'Structural engineering, hydraulics, urban transit design, and construction technology.',
    'Eng. Robert Thorne',
    true
)
ON CONFLICT (institute_id, code) DO NOTHING;

-- 3. ACADEMIC SESSIONS
INSERT INTO academic_sessions (id, institute_id, name, start_date, end_date, is_current, is_active)
VALUES
(
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    '2024-2025',
    '2024-09-01',
    '2025-06-30',
    false,
    true
),
(
    'c0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    '2025-2026',
    '2025-09-01',
    '2026-06-30',
    true,
    true
),
(
    'c0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    '2026-2027',
    '2026-09-01',
    '2027-06-30',
    false,
    true
)
ON CONFLICT DO NOTHING;

-- 4. DEMO STUDENTS
INSERT INTO students (id, institute_id, student_id_number, first_name, last_name, email, phone, date_of_birth, blood_group, department_id, session_id, current_semester, status, photo_url, emergency_contact, address, admission_date)
VALUES
(
    'd0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'STU-2025-1001',
    'Alexander',
    'Wright',
    'student@aist.edu',
    '+1 (555) 101-2001',
    '2004-03-15',
    'O+',
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000002',
    '5th Semester',
    'ACTIVE',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=240&auto=format&fit=crop&q=80',
    'Arthur Wright (Father): +1 555-900-1111',
    '742 Evergreen Terrace, Tech Park, CA',
    '2023-08-20'
),
(
    'd0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'STU-2025-1002',
    'Sophia',
    'Martinez',
    'sophia.m@aist.edu',
    '+1 (555) 101-2002',
    '2003-11-22',
    'A+',
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000002',
    '6th Semester',
    'ACTIVE',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&auto=format&fit=crop&q=80',
    'Elena Martinez (Mother): +1 555-900-2222',
    '124 Elmwood Avenue, Silicon Hills, CA',
    '2023-08-20'
),
(
    'd0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'STU-2025-1003',
    'Liam',
    'Patel',
    'liam.p@aist.edu',
    '+1 (555) 101-2003',
    '2004-07-09',
    'B+',
    'b0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000002',
    '3rd Semester',
    'ACTIVE',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
    'Dev Patel (Brother): +1 555-900-3333',
    '88 Grand Lake Boulevard, Oakland, CA',
    '2024-08-15'
),
(
    'd0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000001',
    'STU-2025-1004',
    'Chloe',
    'Kowalski',
    'chloe.k@aist.edu',
    '+1 (555) 101-2004',
    '2005-01-18',
    'AB+',
    'b0000000-0000-0000-0000-000000000003',
    'c0000000-0000-0000-0000-000000000002',
    '1st Semester',
    'ACTIVE',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=240&auto=format&fit=crop&q=80',
    'Jan Kowalski (Father): +1 555-900-4444',
    '33 Marina Boulevard, San Francisco, CA',
    '2025-08-10'
)
ON CONFLICT (institute_id, student_id_number) DO NOTHING;

-- 5. DEMO USERS
INSERT INTO users (id, full_name, email, password_hash, role, status, institute_id, student_id, department_id, avatar_url, email_verified_at)
VALUES
(
    'e0000000-0000-0000-0000-000000000001',
    'System Super Administrator',
    'superadmin@system.edu',
    '$2b$10$gjThfjlGTiZgEMC6qKTOpu2xHtLwzz2tLPoNBYc1ndAZ2R7SIc0pS',
    'SUPER_ADMIN',
    'ACTIVE',
    NULL,
    NULL,
    NULL,
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    NOW()
),
(
    'e0000000-0000-0000-0000-000000000002',
    'Dr. Eleanor Roosevelt',
    'admin@aist.edu',
    '$2b$10$Q5..80/8RY6eMKPY9DBQJuTtuYyRjT8xqxvnUJReuW16mNApnJt4i',
    'INSTITUTE_ADMIN',
    'ACTIVE',
    'a0000000-0000-0000-0000-000000000001',
    NULL,
    NULL,
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    NOW()
),
(
    'e0000000-0000-0000-0000-000000000003',
    'Prof. Marcus Aurelius Sterling',
    'teacher@aist.edu',
    '$2b$10$JWxECKHe76SzQBDoQDBJm.x8AytB1uaxgfm1KNipv2RSpATIJFaFe',
    'TEACHER',
    'ACTIVE',
    'a0000000-0000-0000-0000-000000000001',
    NULL,
    'b0000000-0000-0000-0000-000000000001',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    NOW()
),
(
    'e0000000-0000-0000-0000-000000000004',
    'Alexander Wright',
    'student@aist.edu',
    '$2b$10$E8Jldt2d26V9zv7qYaieH.RXuGcrBunjsH0RlxRDLgXBk7G0CTQLm',
    'STUDENT',
    'ACTIVE',
    'a0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=240&auto=format&fit=crop&q=80',
    NOW()
),
(
    'e0000000-0000-0000-0000-000000000005',
    'Campus Security Officer Jones',
    'verifier@aist.edu',
    '$2b$10$pqxJzD8yZ.kXpFPtykcyMechJqx/CiS2mhQhg.27gaDnl7VS1luvy',
    'VERIFIER',
    'ACTIVE',
    'a0000000-0000-0000-0000-000000000001',
    NULL,
    NULL,
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    NOW()
),
(
    'e0000000-0000-0000-0000-000000000006',
    'Apex Administrator',
    'admin@apex.edu',
    '$2b$10$Q5..80/8RY6eMKPY9DBQJuTtuYyRjT8xqxvnUJReuW16mNApnJt4i',
    'INSTITUTE_ADMIN',
    'ACTIVE',
    'a0000000-0000-0000-0000-000000000001',
    NULL,
    NULL,
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    NOW()
),
(
    'e0000000-0000-0000-0000-000000000007',
    'Alex Student',
    'alex@apex.edu',
    '$2b$10$E8Jldt2d26V9zv7qYaieH.RXuGcrBunjsH0RlxRDLgXBk7G0CTQLm',
    'STUDENT',
    'ACTIVE',
    'a0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=240&auto=format&fit=crop&q=80',
    NOW()
),
(
    'e0000000-0000-0000-0000-000000000008',
    'Super Admin Cloud',
    'super@educloud.org',
    '$2b$10$gjThfjlGTiZgEMC6qKTOpu2xHtLwzz2tLPoNBYc1ndAZ2R7SIc0pS',
    'SUPER_ADMIN',
    'ACTIVE',
    NULL,
    NULL,
    NULL,
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- 6. TEACHERS TABLE
INSERT INTO teachers (id, user_id, institute_id, department_id, employee_id, first_name, last_name, phone, designation, staff_role, status)
VALUES
(
    'f0000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'EMP-AIST-042',
    'Marcus',
    'Sterling',
    '+1 (555) 333-8899',
    'Associate Professor & Head of Lab',
    'Faculty Member',
    'ACTIVE'
)
ON CONFLICT (institute_id, employee_id) DO NOTHING;

-- 7. STUDENT ID CARDS
INSERT INTO student_id_cards (id, student_id, institute_id, card_number, version, issue_date, expiry_date, status, verification_token, verification_token_hash, theme, qr_url)
VALUES
(
    '10000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'IDC-AIST-2025-001',
    1,
    '2025-09-01',
    '2027-08-31',
    'ACTIVE',
    'tok_alexander_wright_aist_2025_sec99',
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    'navy',
    '/verify/tok_alexander_wright_aist_2025_sec99'
),
(
    '10000000-0000-0000-0000-000000000002',
    'd0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'IDC-AIST-2025-002',
    1,
    '2025-09-01',
    '2027-08-31',
    'ACTIVE',
    'tok_sophia_martinez_aist_2025_sec88',
    '872e4e50ce9990d8b041330c47c9ddd11bec6b503ae9386a99da8584e9bb12c4',
    'emerald',
    '/verify/tok_sophia_martinez_aist_2025_sec88'
)
ON CONFLICT (card_number) DO NOTHING;

-- 8. ID CARD APPLICATIONS
INSERT INTO id_card_applications (id, student_id, institute_id, application_type, status, reason, reviewed_by, reviewed_at)
VALUES
(
    '20000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'NEW',
    'PENDING',
    'Fresh admission enrollment ID card issuance request.',
    NULL,
    NULL
),
(
    '20000000-0000-0000-0000-000000000002',
    'd0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000001',
    'NEW',
    'PENDING',
    'Initial student identification card application.',
    NULL,
    NULL
)
ON CONFLICT DO NOTHING;

-- 9. NOTIFICATIONS
INSERT INTO notifications (id, user_id, institute_id, title, message, type, is_read)
VALUES
(
    '30000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000001',
    'Digital ID Card Ready',
    'Your Official Student Digital ID Card has been approved and issued. You can view and download it now.',
    'SUCCESS',
    false
),
(
    '30000000-0000-0000-0000-000000000002',
    'e0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000001',
    'Academic Session Updated',
    'The 2025-2026 Academic Session has officially commenced.',
    'INFO',
    true
)
ON CONFLICT DO NOTHING;

-- 10. AUDIT LOGS
INSERT INTO audit_logs (id, user_id, institute_id, action, target_type, target_id, details, ip_address)
VALUES
(
    '40000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'CREATE_ID_CARD',
    'student_id_cards',
    '10000000-0000-0000-0000-000000000001',
    'Issued digital ID card IDC-AIST-2025-001 for student Alexander Wright (STU-2025-1001)',
    '127.0.0.1'
)
ON CONFLICT DO NOTHING;

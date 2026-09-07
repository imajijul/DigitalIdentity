-- ==============================================================================
-- Student Digital ID Card System - Database Schema
-- Dialect: PostgreSQL (14+)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- ENUM TYPES
-- ==============================================================================
CREATE TYPE user_role AS ENUM (
    'SUPER_ADMIN',
    'INSTITUTE_ADMIN',
    'TEACHER',
    'STUDENT',
    'VERIFIER'
);

CREATE TYPE user_status AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED'
);

CREATE TYPE institute_status AS ENUM (
    'ACTIVE',
    'INACTIVE'
);

CREATE TYPE student_status AS ENUM (
    'ACTIVE',
    'GRADUATED',
    'SUSPENDED',
    'DROPPED'
);

CREATE TYPE id_card_status AS ENUM (
    'ACTIVE',
    'EXPIRED',
    'REVOKED',
    'SUSPENDED'
);

CREATE TYPE application_type AS ENUM (
    'NEW',
    'REPLACEMENT',
    'RENEWAL'
);

CREATE TYPE application_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'CANCELLED'
);

CREATE TYPE verification_result AS ENUM (
    'VALID',
    'INVALID',
    'EXPIRED',
    'REVOKED',
    'SUSPICIOUS'
);

-- ==============================================================================
-- 1. INSTITUTES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS institutes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    logo_url TEXT,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    status institute_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

-- ==============================================================================
-- 2. DEPARTMENTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    head_of_department VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_dept_institute_code UNIQUE (institute_id, code)
);

-- ==============================================================================
-- 3. ACADEMIC SESSIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS academic_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 4. STUDENTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE RESTRICT,
    student_id_number VARCHAR(100) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    date_of_birth DATE,
    blood_group VARCHAR(10),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    session_id UUID REFERENCES academic_sessions(id) ON DELETE SET NULL,
    current_semester VARCHAR(50) NOT NULL DEFAULT '1st Semester',
    status student_status NOT NULL DEFAULT 'ACTIVE',
    photo_url TEXT,
    emergency_contact VARCHAR(100),
    address TEXT,
    admission_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_student_institute_number UNIQUE (institute_id, student_id_number)
);

-- ==============================================================================
-- 5. USERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'STUDENT',
    status user_status NOT NULL DEFAULT 'ACTIVE',
    institute_id UUID REFERENCES institutes(id) ON DELETE SET NULL,
    student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    avatar_url TEXT,
    email_verified_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);

-- ==============================================================================
-- 6. TEACHERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE RESTRICT,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    employee_id VARCHAR(100) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    designation VARCHAR(150) NOT NULL DEFAULT 'Lecturer',
    staff_role VARCHAR(100) DEFAULT 'Teaching Staff',
    status user_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_teacher_institute_employee UNIQUE (institute_id, employee_id)
);

-- ==============================================================================
-- 7. STUDENT ID CARDS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS student_id_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE RESTRICT,
    card_number VARCHAR(100) NOT NULL UNIQUE,
    version INTEGER NOT NULL DEFAULT 1,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE NOT NULL,
    status id_card_status NOT NULL DEFAULT 'ACTIVE',
    verification_token VARCHAR(255) NOT NULL UNIQUE,
    verification_token_hash VARCHAR(255) NOT NULL,
    revoked_reason TEXT,
    theme VARCHAR(50) NOT NULL DEFAULT 'navy',
    qr_url TEXT,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 8. ID CARD APPLICATIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS id_card_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE RESTRICT,
    application_type application_type NOT NULL DEFAULT 'NEW',
    status application_status NOT NULL DEFAULT 'PENDING',
    reason TEXT,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 9. VERIFICATION LOGS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS verification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    card_id UUID REFERENCES student_id_cards(id) ON DELETE SET NULL,
    institute_id UUID REFERENCES institutes(id) ON DELETE SET NULL,
    token_identifier VARCHAR(255) NOT NULL,
    verification_result verification_result NOT NULL DEFAULT 'VALID',
    verified_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(100),
    user_agent TEXT,
    device_type VARCHAR(50),
    location VARCHAR(100),
    is_suspicious BOOLEAN NOT NULL DEFAULT false,
    metadata JSONB
);

-- ==============================================================================
-- 10. AUDIT LOGS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    institute_id UUID REFERENCES institutes(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(100) NOT NULL,
    target_id VARCHAR(100),
    details TEXT,
    metadata JSONB,
    ip_address VARCHAR(100),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 11. NOTIFICATIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    institute_id UUID REFERENCES institutes(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'INFO',
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 12. USER SESSIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(255) NOT NULL,
    ip_address VARCHAR(100),
    user_agent TEXT,
    device_name VARCHAR(100),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 13. PASSWORD RESET TOKENS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 14. EMAIL VERIFICATION TOKENS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_institute ON users(institute_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE INDEX IF NOT EXISTS idx_students_institute ON students(institute_id);
CREATE INDEX IF NOT EXISTS idx_students_number ON students(student_id_number);
CREATE INDEX IF NOT EXISTS idx_students_department ON students(department_id);
CREATE INDEX IF NOT EXISTS idx_students_session ON students(session_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);

CREATE INDEX IF NOT EXISTS idx_id_cards_student ON student_id_cards(student_id);
CREATE INDEX IF NOT EXISTS idx_id_cards_institute ON student_id_cards(institute_id);
CREATE INDEX IF NOT EXISTS idx_id_cards_number ON student_id_cards(card_number);
CREATE INDEX IF NOT EXISTS idx_id_cards_status ON student_id_cards(status);
CREATE INDEX IF NOT EXISTS idx_id_cards_token ON student_id_cards(verification_token);
CREATE INDEX IF NOT EXISTS idx_id_cards_token_hash ON student_id_cards(verification_token_hash);

CREATE INDEX IF NOT EXISTS idx_teachers_institute ON teachers(institute_id);
CREATE INDEX IF NOT EXISTS idx_teachers_employee ON teachers(employee_id);

CREATE INDEX IF NOT EXISTS idx_applications_student ON id_card_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_institute ON id_card_applications(institute_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON id_card_applications(status);

CREATE INDEX IF NOT EXISTS idx_verification_logs_card ON verification_logs(card_id);
CREATE INDEX IF NOT EXISTS idx_verification_logs_institute ON verification_logs(institute_id);
CREATE INDEX IF NOT EXISTS idx_verification_logs_result ON verification_logs(verification_result);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_institute ON audit_logs(institute_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);

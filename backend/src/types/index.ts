export type UserRole = 'SUPER_ADMIN' | 'INSTITUTE_ADMIN' | 'TEACHER' | 'STUDENT' | 'VERIFIER';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type InstituteStatus = 'ACTIVE' | 'INACTIVE';
export type StudentStatus = 'ACTIVE' | 'GRADUATED' | 'SUSPENDED' | 'DROPPED';
export type IdCardStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'SUSPENDED';
export type ApplicationType = 'NEW' | 'REPLACEMENT' | 'RENEWAL';
export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type VerificationResult = 'VALID' | 'INVALID' | 'EXPIRED' | 'REVOKED' | 'SUSPICIOUS';

export interface User {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  status: UserStatus;
  institute_id: string | null;
  student_id: string | null;
  department_id: string | null;
  avatar_url: string | null;
  email_verified_at: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Institute {
  id: string;
  name: string;
  code: string;
  logo_url: string | null;
  address: string | null;
  phone: string | null;
  email: string;
  website: string | null;
  status: InstituteStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Department {
  id: string;
  institute_id: string;
  code: string;
  name: string;
  description: string | null;
  head_of_department: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AcademicSession {
  id: string;
  institute_id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  institute_id: string;
  student_id_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  date_of_birth: string | null;
  blood_group: string | null;
  department_id: string | null;
  session_id: string | null;
  current_semester: string;
  status: StudentStatus;
  photo_url: string | null;
  emergency_contact: string | null;
  address: string | null;
  admission_date: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  // Joins
  department_name?: string;
  department_code?: string;
  session_name?: string;
  institute_name?: string;
  active_card_number?: string;
  card_status?: IdCardStatus;
}

export interface Teacher {
  id: string;
  user_id: string | null;
  institute_id: string;
  department_id: string | null;
  employee_id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  designation: string;
  staff_role: string | null;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  department_name?: string;
}

export interface StudentIdCard {
  id: string;
  student_id: string;
  institute_id: string;
  card_number: string;
  version: number;
  issue_date: string;
  expiry_date: string;
  status: IdCardStatus;
  verification_token: string;
  verification_token_hash: string;
  revoked_reason: string | null;
  theme: string;
  qr_url: string | null;
  revoked_at: string | null;
  created_at: string;
  updated_at: string;
  // Joins
  student_name?: string;
  student_id_number?: string;
  photo_url?: string;
  blood_group?: string;
  current_semester?: string;
  department_name?: string;
  session_name?: string;
  institute_name?: string;
  institute_logo_url?: string;
}

export interface IdCardApplication {
  id: string;
  student_id: string;
  institute_id: string;
  application_type: ApplicationType;
  status: ApplicationStatus;
  reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joins
  student_name?: string;
  student_id_number?: string;
  department_name?: string;
}

export interface VerificationLog {
  id: string;
  student_id: string | null;
  card_id: string | null;
  institute_id: string | null;
  token_identifier: string;
  verification_result: VerificationResult;
  verified_at: string;
  ip_address: string | null;
  user_agent: string | null;
  device_type: string | null;
  location: string | null;
  is_suspicious: boolean;
  metadata: any;
  student_name?: string;
  card_number?: string;
  institute_name?: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  institute_id: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  details: string | null;
  metadata: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  institute_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  instituteId: string | null;
  studentId?: string | null;
}


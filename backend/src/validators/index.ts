export interface ValidationError {
  field: string;
  message: string;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateStudentInput(data: any): { isValid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  if (!data.first_name || typeof data.first_name !== 'string' || data.first_name.trim().length === 0) {
    errors.push({ field: 'first_name', message: 'First name is required' });
  }

  if (!data.last_name || typeof data.last_name !== 'string' || data.last_name.trim().length === 0) {
    errors.push({ field: 'last_name', message: 'Last name is required' });
  }

  if (!data.email || !validateEmail(data.email)) {
    errors.push({ field: 'email', message: 'A valid email address is required' });
  }

  if (!data.current_semester || typeof data.current_semester !== 'string') {
    errors.push({ field: 'current_semester', message: 'Current semester is required' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateLoginInput(data: any): { isValid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  if (!data.email || !validateEmail(data.email)) {
    errors.push({ field: 'email', message: 'Valid email is required' });
  }

  if (!data.password || typeof data.password !== 'string' || data.password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateSignupInput(data: any): { isValid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  if (!data.full_name || typeof data.full_name !== 'string' || data.full_name.trim().length === 0) {
    errors.push({ field: 'full_name', message: 'Full name is required' });
  }

  if (!data.email || !validateEmail(data.email)) {
    errors.push({ field: 'email', message: 'Valid email is required' });
  }

  if (!data.password || typeof data.password !== 'string' || data.password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  // If hash is a demo hash or bcrypt hash
  try {
    return await bcrypt.compare(password, hash);
  } catch (err) {
    return false;
  }
}


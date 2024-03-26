import { hash, compare } from 'bcryptjs';

export async function generateHash(password: string): Promise<string> {
  return await hash(password, 10);
}

export async function validateHash(
  password: string | undefined,
  hash: string | undefined | null,
): Promise<boolean> {
  if (!password || !hash) return Promise.resolve(false);

  return compare(password, hash);
}

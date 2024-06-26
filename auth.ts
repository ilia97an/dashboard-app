import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { getDB } from '@/app/lib/db';
import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcryptjs';

const {db, pgp} = getDB();

async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await db.any(`SELECT * FROM users WHERE email=$(email)`, {email:email});
    return user[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) return null;
          
          console.log('debug auth.ts');
          console.log(user);
          console.log(password);
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user;
        }
        
        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
});

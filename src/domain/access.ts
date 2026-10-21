import { z } from 'zod';

/** Public fixtures for the frontend demo, never production credentials. */
export const demoAccounts = [
  {
    id: 'admin',
    role: 'admin',
    name: 'Administrador',
    initials: 'AD',
    email: 'admin@savepoint.demo',
    username: 'admin',
    password: 'Admin123!',
  },
  {
    id: 'user',
    role: 'user',
    name: 'Roberto García',
    initials: 'RG',
    email: 'usuario@savepoint.demo',
    username: 'usuario',
    password: 'Usuario123!',
  },
] as const;

export type DemoAccount = (typeof demoAccounts)[number];

export const adminSettingsSchema = z.object({
  announcement: z.string().trim().max(180),
  marketplaceEnabled: z.boolean(),
  simulationsEnabled: z.boolean(),
});
export type AdminSettings = z.infer<typeof adminSettingsSchema>;

export const defaultAdminSettings: AdminSettings = {
  announcement: '',
  marketplaceEnabled: true,
  simulationsEnabled: true,
};

export function authenticateDemo(identifier: string, password: string): DemoAccount | null {
  const normalized = identifier.trim().toLowerCase();
  return (
    demoAccounts.find(
      (account) =>
        (account.email === normalized || account.username === normalized) &&
        account.password === password,
    ) ?? null
  );
}

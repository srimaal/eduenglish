export type FirebaseWebConfig = { apiKey: string; authDomain: string; projectId: string; appId: string };
export type AccountUser = { id: string; name: string; email: string };
export type AccountSession = { configured: boolean; user: AccountUser | null; firebase: FirebaseWebConfig | null };

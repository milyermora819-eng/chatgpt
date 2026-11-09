const ACCOUNTS_KEY = 'lounge.accounts';
const CURRENT_KEY = 'lounge.currentAccount';

function readAccountIds(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export function listAccountIds(): string[] {
  return readAccountIds();
}

export function keepAccounts(ids: string[]): void {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(ids));
}

export function getCurrentAccountId(): string | null {
  return localStorage.getItem(CURRENT_KEY);
}

export function setCurrentAccountId(id: string | null): void {
  if (id) localStorage.setItem(CURRENT_KEY, id);
  else localStorage.removeItem(CURRENT_KEY);
}

export function rememberAccount(id: string): void {
  const ids = readAccountIds();
  if (!ids.includes(id)) keepAccounts([...ids, id]);
  setCurrentAccountId(id);
}

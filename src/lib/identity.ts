const MEMBER_ID_KEY = 'chat.memberId';

export function getStoredMemberId(): string | null {
  return localStorage.getItem(MEMBER_ID_KEY);
}

export function storeMemberId(id: string): void {
  localStorage.setItem(MEMBER_ID_KEY, id);
}

export function clearStoredMemberId(): void {
  localStorage.removeItem(MEMBER_ID_KEY);
}

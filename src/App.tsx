import { useEffect, useState } from 'react';
import ChatShell from '@/components/ChatShell';
import Onboarding from '@/components/Onboarding';
import { fetchMembersByIds } from '@/lib/api/members';
import { errorMessage } from '@/lib/errors';
import {
  getCurrentAccountId,
  keepAccounts,
  listAccountIds,
  rememberAccount,
  setCurrentAccountId,
} from '@/lib/identity';
import type { Member } from '@/lib/types';

function App() {
  const [member, setMember] = useState<Member | null>(null);
  const [savedAccounts, setSavedAccounts] = useState<Member[]>([]);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [bootError, setBootError] = useState<string | null>(null);

  useEffect(() => {
    const storedIds = listAccountIds();
    fetchMembersByIds(storedIds)
      .then((found) => {
        const accounts = storedIds
          .map((id) => found.find((account) => account.id === id))
          .filter((account): account is Member => Boolean(account));
        keepAccounts(accounts.map((account) => account.id));
        const currentId = getCurrentAccountId();
        setSavedAccounts(accounts);
        setMember(accounts.find((account) => account.id === currentId) ?? null);
      })
      .catch((err: unknown) => setBootError(errorMessage(err, 'Could not reach Lounge. Please refresh the page.')))
      .finally(() => setBootstrapping(false));
  }, []);

  if (bootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <p className="text-sm text-zinc-400">Loading Lounge...</p>
      </div>
    );
  }

  if (bootError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-6">
        <p className="text-sm text-red-400">{bootError}</p>
      </div>
    );
  }

  if (!member) {
    return (
      <Onboarding
        savedAccounts={savedAccounts}
        onCreated={(created) => {
          rememberAccount(created.id);
          setSavedAccounts((accounts) => [...accounts.filter((account) => account.id !== created.id), created]);
          setMember(created);
        }}
        onSelectAccount={(account) => {
          rememberAccount(account.id);
          setMember(account);
        }}
      />
    );
  }

  return (
    <ChatShell
      member={member}
      onMemberChange={(updated) => {
        setMember(updated);
        setSavedAccounts((accounts) => accounts.map((account) => (account.id === updated.id ? updated : account)));
      }}
      onSwitchAccount={() => {
        setCurrentAccountId(null);
        setMember(null);
      }}
    />
  );
}

export default App;

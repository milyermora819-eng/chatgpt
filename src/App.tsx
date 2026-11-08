import { useEffect, useState } from 'react';
import ChatShell from '@/components/ChatShell';
import Onboarding from '@/components/Onboarding';
import { fetchMember } from '@/lib/api/members';
import { errorMessage } from '@/lib/errors';
import { clearStoredMemberId, getStoredMemberId } from '@/lib/identity';
import type { Member } from '@/lib/types';

function App() {
  const [member, setMember] = useState<Member | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [bootError, setBootError] = useState<string | null>(null);

  useEffect(() => {
    const storedId = getStoredMemberId();
    if (!storedId) {
      setBootstrapping(false);
      return;
    }
    fetchMember(storedId)
      .then((found) => {
        if (!found) clearStoredMemberId();
        setMember(found);
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
    return <Onboarding onCreated={setMember} />;
  }

  return (
    <ChatShell
      member={member}
      onMemberChange={setMember}
      onSignOut={() => setMember(null)}
    />
  );
}

export default App;

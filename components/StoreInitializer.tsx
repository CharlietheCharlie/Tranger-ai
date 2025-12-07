'use client';

import { useSession } from 'next-auth/react';
import { useStore } from '../services/store';
import { useEffect, useRef } from 'react';
import { User } from '../types';
import { getTempUserId, clearTempUserId } from '../lib/client-utils';
import { useQueryClient } from '@tanstack/react-query';

export function StoreInitializer() {
  const { data: session, status } = useSession();
  const { setCurrentUser } = useStore();
  const queryClient = useQueryClient();

  const hasMergedRef = useRef(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      hasMergedRef.current = false;
    }
  }, [status]);

  useEffect(() => {
    if (!session?.user) return;
    if (hasMergedRef.current) return;

    hasMergedRef.current = true;

    const tempUserId = getTempUserId();

    const user: User = {
      id: session.user.id!,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
    };

    setCurrentUser(user);

    if (!tempUserId) return;

    async function merge() {
      try {
        const res = await fetch('/api/user/merge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tempUserId }),
        });

        if (!res.ok) {
          console.error('Failed to merge anonymous data:', await res.json());
        }

        await queryClient.invalidateQueries({
          queryKey: ['itineraries'],
        });
      } catch (err) {
        console.error('Merge failed:', err);
      } finally {
        clearTempUserId();
      }
    }

    merge();
  }, [session, status, setCurrentUser, queryClient]);

  return null;
}

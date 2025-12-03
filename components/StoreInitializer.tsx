'use client';

import { useSession } from 'next-auth/react';
import { useStore } from '../services/store';
import { useEffect } from 'react';
import { User } from '../types';
import { getTempUserId, clearTempUserId } from '../lib/client-utils'; // Import tempUserId utilities
import { useQueryClient } from '@tanstack/react-query';

export function StoreInitializer() {
  const { data: session } = useSession();
  const { setCurrentUser } = useStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Ensure tempUserId exists for anonymous users
    const currentTempUserId = getTempUserId(); 

    async function handleMerge() {
      if (session?.user) {
        const user: User = {
          id: session.user.id!,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        };
        setCurrentUser(user);

        // If a tempUserId existed before login, attempt to merge
        if (currentTempUserId) {
          try {
            const response = await fetch('/api/user/merge', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ tempUserId: currentTempUserId }),
            });

            if (!response.ok) {
              console.error('Failed to merge anonymous data:', await response.json());
            }
            // Invalidate and refetch queries that might be affected by the merge
            await queryClient.invalidateQueries({ queryKey: ['itineraries'] });
          } catch (error) {
            console.error('Error during anonymous data merge:', error);
          } finally {
            clearTempUserId(); // Always clear tempUserId after attempted merge, as it's no longer needed
          }
        }
      } 
    }

    handleMerge();
  }, [session, setCurrentUser]);

  return null;
}

import React from 'react';
import { Collaborator } from '../types';
import { motion } from 'framer-motion';

interface CollaboratorCursorsProps {
  collaborators: Collaborator[];
}

export const CollaboratorCursors: React.FC<CollaboratorCursorsProps> = ({ collaborators }) => {
  // In a real app, we would subscribe to websocket cursor positions.
  // Here we just show their avatars in the header to imply presence.
  return (
    <div className="flex -space-x-2 overflow-hidden">
      {collaborators.map((user) => (
        <motion.div
            key={user.userId}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative inline-block h-8 w-8 rounded-full ring-2 ring-white cursor-pointer`}
            title={user.user.name || user.user.email || 'Collaborator'} 
        >
          <img 
            className="h-full w-full rounded-full object-cover"
            src={user.user.image || 'https://www.gravatar.com/avatar?d=mp'}
            alt={user.user.name || user.user.email || 'Collaborator'}
          />
          {/* {user.isOnline && (
            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white" />
          )} */}
        </motion.div>
      ))}
      <button className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-2 ring-white hover:bg-gray-200 text-xs text-gray-500 font-medium">
        +
      </button>
    </div>
  );
};

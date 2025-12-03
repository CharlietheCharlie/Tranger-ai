
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Comment, User } from '../types';

interface AddCommentData {
  itineraryId: string;
  text: string;
  activityId?: string;
  imageUrl?: string;
}

async function addComment(commentData: AddCommentData) {
  const response = await fetch('/api/comments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commentData),
  });

  if (!response.ok) {
    throw new Error('Failed to add comment');
  }
  return response.json();
}

export function useAddComment() {
  const queryClient = useQueryClient();
  return useMutation<Comment, Error, AddCommentData>({
    mutationFn: addComment,
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['itinerary', vars.itineraryId] });
    },
  });
}

interface AddCollaboratorData {
  itineraryId: string;
  email: string;
}

async function addCollaborator({ itineraryId, email }: AddCollaboratorData) {
  const response = await fetch(`/api/itineraries/${itineraryId}/collaborators`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error('Failed to add collaborator');
  }
  return response.json();
}

export function useAddCollaborator() {
  const queryClient = useQueryClient();
  return useMutation<User[], Error, AddCollaboratorData>({ // Collaborators are array of Users
    mutationFn: addCollaborator,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itineraries'] }); // Invalidate itineraries to refetch collaborators
    },
  });
}


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

async function createInvite(itineraryId: string) {
  const res = await fetch("/api/invite", {
    method: "POST",
    body: JSON.stringify({ itineraryId }),
  });

  if (!res.ok) throw new Error("Failed to create invite");

  return res.json(); 
}

export function useCreateInvite() {
  return useMutation({
    mutationFn: createInvite,
  });
}
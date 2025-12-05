
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Comment, User } from '../types';

interface AddCommentData {
  itineraryId: string;
  text: string;
  activityId?: string;
  imageUrl?: string;
}

interface ItineraryComment extends Comment {
  author: User; // Assuming author is always included
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
      // Invalidate the specific comments query for the itinerary
      queryClient.invalidateQueries({ queryKey: ['comments', vars.itineraryId] });
    },
  });
}

async function getItineraryComments(itineraryId: string): Promise<ItineraryComment[]> {
  const response = await fetch(`/api/itineraries/${itineraryId}/comments`);
  if (!response.ok) {
    throw new Error('Failed to fetch itinerary comments');
  }
  return response.json();
}

export function useItineraryComments(itineraryId: string) {
  return useQuery<ItineraryComment[], Error>({
    queryKey: ['comments', itineraryId],
    queryFn: () => getItineraryComments(itineraryId),
    enabled: !!itineraryId, // Only run the query if itineraryId is available
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
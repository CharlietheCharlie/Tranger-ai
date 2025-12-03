
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Activity, Day } from '../types';
import { getTempUserId } from '@/lib/client-utils';
import { g } from 'vitest/dist/suite-dWqIFb_-.js';

interface AddActivityData {
  itineraryId: string;
  dayId: string;
  activity: Omit<Activity, 'id'>;
}

function getHeaders() {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  const tempUserId = getTempUserId();
  if (tempUserId) {
    headers['x-temp-user-id'] = tempUserId;
  }
  return headers;
}

async function addActivity({ itineraryId, dayId, activity }: AddActivityData) {
  const response = await fetch(`/api/itineraries/${itineraryId}/days/${dayId}/activities`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(activity),
  });

  if (!response.ok) {
    throw new Error('Failed to add activity');
  }
  return response.json();
}

export function useAddActivity() {
  const queryClient = useQueryClient();
  return useMutation<Activity, Error, AddActivityData>({
    mutationFn: addActivity,
    onSuccess: (_data, { itineraryId }) => {
      queryClient.invalidateQueries({ queryKey: ["itinerary", itineraryId] });
    }
  });
}

interface UpdateActivityData {
  itineraryId: string;
  activityId: string;
  updates: Partial<Activity>;
}

async function updateActivity({ activityId, updates }: UpdateActivityData) {
  
  const response = await fetch(`/api/activities/${activityId}`, {
    method: 'PATCH',
    headers : getHeaders(),
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error('Failed to update activity');
  }
  return response.json();
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();
  return useMutation<Activity, Error, UpdateActivityData>({
    mutationFn: updateActivity,
    onSuccess: (updated, _vars) => {
      queryClient.invalidateQueries({ 
        queryKey: ["itinerary", _vars.itineraryId] 
      });
    }
  });
}

interface MoveActivityData {
  itineraryId: string;
  activityId: string;
  targetDayId: string;
}

async function moveActivity({ activityId, targetDayId }: MoveActivityData) {
  const response = await fetch(`/api/activities/${activityId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ dayId: targetDayId }),
  });

  if (!response.ok) {
    throw new Error('Failed to move activity');
  }
  return response.json();
}

export function useMoveActivity() {
  const queryClient = useQueryClient();
  return useMutation<Activity, Error, MoveActivityData>({
    mutationFn: moveActivity,
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ 
        queryKey: ["itinerary", vars.itineraryId] 
      });
    }
  });
}

async function deleteActivity({ activityId }: { activityId: string }) {
  const response = await fetch(`/api/activities/${activityId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete activity');
  }
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { activityId: string, itineraryId: string }>({
    mutationFn: deleteActivity,
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ 
        queryKey: ["itinerary", vars.itineraryId] 
      });
    }
  });
}

interface ReorderDaysData {
  itineraryId: string;
  orderedDayIds: string[];
}

async function reorderDays({ itineraryId, orderedDayIds }: ReorderDaysData) {
  const response = await fetch(`/api/itineraries/${itineraryId}/days`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ orderedDayIds }),
  });

  if (!response.ok) {
    throw new Error('Failed to reorder days');
  }
}

export function useReorderDays() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, ReorderDaysData>({
    mutationFn: reorderDays,
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ 
        queryKey: ["itinerary", vars.itineraryId] 
      });
    }
  });
}

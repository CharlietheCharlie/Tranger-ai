import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Itinerary } from "../types";
import { getTempUserId } from "../lib/client-utils"; // Import getTempUserId

async function fetchItineraries(): Promise<Itinerary[]> {
  const headers: HeadersInit = {};
  const tempUserId = getTempUserId();
  if (tempUserId) {
    headers["x-temp-user-id"] = tempUserId;
  }

  const response = await fetch("/api/itineraries", { headers });
  if (!response.ok) {
    throw new Error("Failed to fetch itineraries");
  }
  return response.json();
}

export function useItineraries() {
  return useQuery<Itinerary[], Error>({
    queryKey: ["itineraries"],
    queryFn: fetchItineraries,
  });
}

async function fetchItineraryById(id: string): Promise<Itinerary> {
  const headers: HeadersInit = {};
  const tempUserId = getTempUserId();
  if (tempUserId) {
    headers["x-temp-user-id"] = tempUserId;
  }

  const response = await fetch(`/api/itineraries/${id}`, { headers });
  if (!response.ok) {
    throw new Error("Failed to fetch itinerary");
  }
  return response.json();
}

export function useItinerary(itineraryId: string) {
  return useQuery<Itinerary, Error>({
    queryKey: ["itinerary", itineraryId],
    queryFn: () => fetchItineraryById(itineraryId),
    enabled: !!itineraryId, // Only run the query if itineraryId is truthy
  });
}

async function createItinerary(newItineraryData: Omit<Itinerary, "id">) {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  const tempUserId = getTempUserId();
  if (tempUserId) {
    headers["x-temp-user-id"] = tempUserId;
  }

  const response = await fetch("/api/itineraries", {
    method: "POST",
    headers,
    body: JSON.stringify(newItineraryData),
  });

  if (!response.ok) {
    throw new Error("Failed to create itinerary");
  }
  return response.json();
}

export function useCreateItinerary() {
  const queryClient = useQueryClient();
  return useMutation<Itinerary, Error, Omit<Itinerary, "id">>({
    mutationFn: createItinerary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itineraries"] });
    },
  });
}

async function updateItinerary({
  id,
  updates,
}: {
  id: string;
  updates: Partial<Itinerary>;
}) {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  const tempUserId = getTempUserId();
  if (tempUserId) {
    headers["x-temp-user-id"] = tempUserId;
  }

  const response = await fetch(`/api/itineraries/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error("Failed to update itinerary");
  }
  return response.json();
}

export function useUpdateItinerary() {
  const queryClient = useQueryClient();
  return useMutation<
    Itinerary,
    Error,
    { id: string; updates: Partial<Itinerary> }
  >({
    mutationFn: updateItinerary,
    onSuccess: (updatedItinerary) => {
      queryClient.invalidateQueries({ queryKey: ["itineraries"] });
      queryClient.invalidateQueries({
        queryKey: ["itinerary", updatedItinerary.id],
      });
    },
  });
}

async function deleteItinerary(id: string) {
  const headers: HeadersInit = {};
  const tempUserId = getTempUserId();
  if (tempUserId) {
    headers["x-temp-user-id"] = tempUserId;
  }

  const response = await fetch(`/api/itineraries/${id}`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to delete itinerary");
  }
}

export function useDeleteItinerary() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteItinerary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itineraries"] });
    },
  });
}

async function reorderItineraries(orderedItineraryIds: string[]) {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  const tempUserId = getTempUserId();
  if (tempUserId) {
    headers["x-temp-user-id"] = tempUserId;
  }

  const response = await fetch("/api/itineraries/reorder", {
    method: "PATCH",
    headers,
    body: JSON.stringify({ orderedItineraryIds }),
  });

  if (!response.ok) {
    throw new Error("Failed to reorder itineraries");
  }
}

export function useReorderItineraries() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ newOrder }: { newOrder: Itinerary[] }) => {
      const ids = newOrder.map((it) => it.id);
      return reorderItineraries(ids);
    },
    // Optimistic update
    onMutate: async ({ newOrder }) => {
      await queryClient.cancelQueries({ queryKey: ["itineraries"] });

      const previous =
        queryClient.getQueryData<Itinerary[]>(["itineraries"]);

      // Replace only the order, but preserve other fields
      const merged = newOrder.map((it) => ({
        ...(previous?.find((p) => p.id === it.id) ?? it),
        id: it.id, // ensure correct id
      }));

      queryClient.setQueryData(["itineraries"], merged);

      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(["itineraries"], ctx.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["itineraries"] });
    },
  });
}


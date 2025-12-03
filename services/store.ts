import { create } from "zustand";
import { Itinerary, User } from "../types";

interface AppState {
  currentItineraryId: string;
  currentUser: User | null;

  // UI Actions
  setCurrentUser: (user: User) => void;
  selectItinerary: (id: string) => void;

}

export const useStore = create<AppState>((set) => ({
  currentItineraryId: "",
  currentUser: null,

  // UI Actions
  setCurrentUser: (user) => set({ currentUser: user }),
  selectItinerary: (id) => set({ currentItineraryId: id }),
}));

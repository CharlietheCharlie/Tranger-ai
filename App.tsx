"use client";

import React, { useState, useEffect, useRef } from "react";
import { useStore } from "./services/store";
import { ItineraryBoard } from "./components/ItineraryBoard";
import { TripGeneratorModal } from "./components/TripGeneratorModal";
import { CommentsSidebar } from "./components/CommentsSidebar";
import { EditActivityModal } from "./components/EditActivityModal";
import { EditItineraryModal } from "./components/EditItineraryModal";
import { InviteModal } from "./components/InviteModal";
import { Dashboard } from "./components/Dashboard";
import { Activity } from "./types";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { useItinerary } from "./services/itineraryService";
import ItinerarySkeleton from "./components/ItinerarySkeleton";
import { useRouter } from "next/navigation";
import { Navbar } from "./components/Navbar";

const App = () => {
  const { currentItineraryId, selectItinerary } = useStore();
  const t = useTranslations("App");
  const locale = useLocale();
  const router = useRouter();
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isEditTripOpen, setIsEditTripOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<{
    activity?: Activity | null;
    dayId: string;
  } | null>(null);

  const {
    data: currentItinerary,
    isLoading: isLoadingItinerary,
    isFetching: isFetchingItinerary,
    isError: isErrorItinerary,
  } = useItinerary(currentItineraryId);

  const toggleLanguage = () => {
    let newLocale: string;
    if (locale === "en") newLocale = "zh-TW";
    else if (locale === "zh-TW") newLocale = "ja";
    else newLocale = "en";
    router.push(`/${newLocale}`);
  };

  const getLangLabel = (l: string) => {
    switch (l) {
      case "zh-TW":
        return "繁體";
      case "ja":
        return "JP";
      default:
        return "EN";
    }
  };

  // Profile dropdown
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Loading states
  if (currentItineraryId && isLoadingItinerary) return <ItinerarySkeleton />;
  if (currentItineraryId && isErrorItinerary)
    return <div>Error loading itinerary.</div>;

  return (
    <div className="h-screen w-screen bg-[#F8FAFC] flex flex-col overflow-hidden text-slate-900 font-sans">
      {/* Navbar */}
      <Navbar
        currentItinerary={currentItinerary}
        currentItineraryId={currentItineraryId}
        selectItinerary={selectItinerary}
        toggleLanguage={toggleLanguage}
        getLangLabel={getLangLabel}
        isCommentsOpen={isCommentsOpen}
        setIsCommentsOpen={setIsCommentsOpen}
        setIsInviteOpen={setIsInviteOpen}
        setIsEditTripOpen={setIsEditTripOpen}
      />

      {/* Main */}
      <main className="flex-1 overflow-hidden relative flex">
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {!currentItineraryId ? (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="h-full"
              >
                <Dashboard
                  onSelectItinerary={selectItinerary}
                  onNewTrip={() => setIsGeneratorOpen(true)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="editor"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full"
              >
                {currentItinerary && (
                  <ItineraryBoard
                    itinerary={currentItinerary}
                    isFetching={isFetchingItinerary}
                    onActivityClick={(activity, dayId) =>
                      setEditingActivity({ activity, dayId })
                    }
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {currentItinerary && (
          <CommentsSidebar
            isOpen={isCommentsOpen}
            onClose={() => setIsCommentsOpen(false)}
            itineraryId={currentItinerary.id}
          />
        )}
      </main>

      {/* Modals */}
      <TripGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onItineraryCreated={selectItinerary}
      />

      {currentItinerary && (
        <>
          <EditItineraryModal
            isOpen={isEditTripOpen}
            onClose={() => setIsEditTripOpen(false)}
            itinerary={currentItinerary}
          />

          <InviteModal
            isOpen={isInviteOpen}
            onClose={() => setIsInviteOpen(false)}
            itineraryId={currentItinerary.id}
          />
        </>
      )}

      {editingActivity && currentItineraryId && (
        <EditActivityModal
          isOpen={!!editingActivity}
          onClose={() => setEditingActivity(null)}
          activity={editingActivity.activity}
          dayId={editingActivity.dayId}
          itineraryId={currentItineraryId}
        />
      )}
    </div>
  );
};

export default App;

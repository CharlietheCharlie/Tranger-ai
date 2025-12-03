"use client";

import React, { useState, useEffect, useRef } from "react";
import { useStore } from "./services/store";
import { ItineraryBoard } from "./components/ItineraryBoard";
import { CollaboratorCursors } from "./components/CollaboratorCursors";
import { TripGeneratorModal } from "./components/TripGeneratorModal";
import { CommentsSidebar } from "./components/CommentsSidebar";
import { EditActivityModal } from "./components/EditActivityModal";
import { EditItineraryModal } from "./components/EditItineraryModal";
import { InviteModal } from "./components/InviteModal";
import { Dashboard } from "./components/Dashboard";
import { Activity } from "./types";
import {
  Map,
  Share2,
  ChevronLeft,
  MessageSquare,
  Settings,
  Globe,
  User,
  LayoutDashboard,
  CreditCard,
  LogIn,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { useSession, signIn, signOut } from "next-auth/react";
import { useItinerary } from "./services/itineraryService";
import ItinerarySkeleton from "./components/ItinerarySkeleton";
import { useRouter } from "next/navigation";
import Image from "next/image";

const App = () => {
  const { currentItineraryId, selectItinerary } = useStore();
  const t = useTranslations("App");
  const locale = useLocale();
  const router = useRouter();
  const { data: session } = useSession();
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
      <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 md:px-10 shrink-0 z-20 relative">
        {/* LEFT SIDE */}
        <div className="flex items-center gap-4 overflow-hidden">
          {currentItineraryId ? (
            <button
              onClick={() => {
                selectItinerary("");
                setIsCommentsOpen(false);
              }}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
            >
              <ChevronLeft size={22} />
            </button>
          ) : (
            <div className="bg-slate-900 p-2.5 rounded-lg text-white shrink-0 shadow-sm">
              <Map size={20} strokeWidth={2} />
            </div>
          )}

          <div className="min-w-0 flex flex-col">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight truncate">
              {currentItinerary ? currentItinerary.name : t("appTitle")}
            </h1>
            {currentItinerary && (
              <p className="text-xs text-slate-500 flex items-center gap-1 truncate font-medium mt-0.5">
                {currentItinerary.destination} —{" "}
                {t("days", { count: currentItinerary.days?.length })}
              </p>
            )}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          {/* Language */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200 transition-colors"
          >
            <Globe size={14} />
            {getLangLabel(locale)}
          </button>

          {currentItinerary && (
            <>
              <div className="hidden md:block">
                <CollaboratorCursors
                  collaborators={currentItinerary.collaborators}
                />
              </div>

              <button
                onClick={() => setIsInviteOpen(true)}
                className="hidden md:flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-md transition-all shadow-sm"
              >
                <Share2 size={14} />
                {t("invite")}
              </button>

              <button
                onClick={() => setIsCommentsOpen(!isCommentsOpen)}
                className={`p-2.5 rounded-full transition-all relative ${isCommentsOpen ? "bg-slate-100 text-slate-900" : "hover:bg-slate-100 text-slate-500"}`}
              >
                <MessageSquare size={18} />
                {currentItinerary.comments.length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
                )}
              </button>

              <button
                onClick={() => setIsEditTripOpen(true)}
                className="p-2.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <Settings size={18} />
              </button>
            </>
          )}

          {/* ---------------- PROFILE DROPDOWN ---------------- */}
          <div className="relative ml-2" ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={`h-10 w-10 rounded-full border-2 shadow-sm overflow-hidden transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                isProfileOpen
                  ? "ring-2 ring-offset-2 ring-indigo-500 border-indigo-500"
                  : "border-white hover:border-slate-200"
              }`}
            >
              <Image
                width={40}
                height={40}
                src={
                  session?.user?.image ??
                  "https://www.gravatar.com/avatar?d=mp&f=y"
                }
                alt={session?.user?.name ?? "Guest"}
                className="w-full h-full object-cover bg-slate-100"
              />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100/50 p-2 z-50 ring-1 ring-slate-900/5">
                {session ? (
                  <>
                    {/* Top user section */}
                    <div className="p-3 bg-slate-50/50 rounded-xl mb-1 border border-slate-100">
                      <div className="flex items-center gap-3">
                        <Image
                          width={40}
                          height={40}
                          alt={session.user?.name!}
                          src={session.user?.image!}
                          className="w-10 h-10 rounded-full border shadow-sm"
                        />
                        <div className="overflow-hidden">
                          <p className="font-bold text-slate-900 text-sm truncate">
                            {session.user?.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {session.user?.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="h-px bg-slate-100 my-1 mx-2" />

                    <div className="p-1">
                      <button
                        onClick={() => signOut()}
                        className="flex items-center gap-3 w-full p-2.5 text-sm font-bold text-rose-600 rounded-lg hover:bg-rose-50"
                      >
                        <LogOut size={16} />
                        {t("signOut")}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-1">
                    <div className="text-center p-4 pb-6">
                      <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-600">
                        <User size={24} />
                      </div>
                      <h3 className="font-bold text-slate-900">
                        {t("signInRequired")}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 px-4">
                        {t("signInRequiredDesc")}
                      </p>
                    </div>

                    <button
                      onClick={() => signIn("google")}
                      className="flex items-center justify-center gap-2 w-full p-3 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 active:scale-[0.98] shadow-md"
                    >
                      <LogIn size={16} />
                      {t("signInWithGoogle")}
                    </button>

                    <p className="text-[10px] text-center text-slate-400 mt-3 mb-1">
                      {t("terms")}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* ---------------- END PROFILE DROPDOWN ---------------- */}
        </div>
      </header>

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

"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  Globe,
  Share2,
  MessageSquare,
  Settings,
  User,
  LogOut,
  LogIn,
  Map,
} from "lucide-react";
import { CollaboratorCursors } from "./CollaboratorCursors";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { signIn, signOut, useSession } from "next-auth/react";
import { Itinerary } from "../types";

interface NavbarProps {
  currentItinerary: Itinerary | undefined;
  currentItineraryId: string | null;
  selectItinerary: (id: string) => void;
  toggleLanguage: () => void;
  getLangLabel: (locale: string) => string;

  isCommentsOpen: boolean;
  setIsCommentsOpen: (open: boolean) => void;

  setIsInviteOpen: (open: boolean) => void;
  setIsEditTripOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentItinerary,
  currentItineraryId,
  selectItinerary,
  toggleLanguage,
  getLangLabel,
  isCommentsOpen,
  setIsCommentsOpen,
  setIsInviteOpen,
  setIsEditTripOpen,
}) => {
  const t = useTranslations("App");
  const locale = useLocale();
  const { data: session } = useSession();

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

  return (
    <header className="h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-3 md:px-10 shrink-0 z-20 relative transition-all">
      {/* ---------- LEFT ---------- */}
      <div className="flex items-center gap-2 md:gap-4 overflow-hidden flex-1 mr-2 leading-tight md:leading-normal">
        {currentItineraryId ? (
          <button
            onClick={() => {
              selectItinerary("");
              setIsCommentsOpen(false);
            }}
            className="p-1.5 md:p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 shrink-0"
          >
            <ChevronLeft size={20} className="md:w-[22px] md:h-[22px]" />
          </button>
        ) : (
          <div className="bg-slate-900 p-2 md:p-2.5 rounded-lg text-white shrink-0 shadow-sm">
            <Map size={18} className="md:w-5 md:h-5" strokeWidth={2} />
          </div>
        )}

        <div className="min-w-0 flex flex-col justify-center">
          <h1 className="text-base md:text-xl font-bold text-slate-900 tracking-tight truncate leading-tight">
            {currentItinerary ? currentItinerary.name : t("appTitle")}
          </h1>

          {currentItinerary && (
            <p className="text-[10px] md:text-xs text-slate-500 flex items-center gap-1 truncate font-medium mt-0.5">
              {currentItinerary.destination}
              <span className="hidden sm:inline">
                — {t("days", { count: currentItinerary.days?.length })}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* ---------- RIGHT ---------- */}
      <div className="flex items-center gap-1 md:gap-4 shrink-0 max-w-fit">
        {/* Language */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-slate-100 text-slate-600 text-xs font-bold border border-transparent md:border-slate-200 transition-colors"
        >
          <Globe size={16} />
          <span className="md:inline">{getLangLabel(locale)}</span>
        </button>

        {currentItinerary && (
          <>
            <div className="hidden lg:block">
              <CollaboratorCursors
                collaborators={currentItinerary.collaborators}
              />
            </div>

            <div className="flex items-center gap-0.5 md:gap-2">
              <button
                onClick={() => setIsInviteOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-md transition-all shadow-sm"
              >
                <Share2 size={14} />
                <span className="hidden lg:inline">{t("invite")}</span>
              </button>

              <button
                onClick={() => setIsCommentsOpen(!isCommentsOpen)}
                className={`p-2 md:p-2.5 rounded-full transition-all relative ${
                  isCommentsOpen
                    ? "bg-slate-100 text-slate-900"
                    : "hover:bg-slate-100 text-slate-500"
                }`}
              >
                <MessageSquare size={18} />
                {currentItinerary.comments.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 md:top-2 md:right-2 w-1.5 md:w-2 h-1.5 md:h-2 bg-rose-500 rounded-full ring-2 ring-white" />
                )}
              </button>

              <button
                onClick={() => setIsEditTripOpen(true)}
                className="p-2 md:p-2.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <Settings size={18} />
              </button>
            </div>
          </>
        )}

        {/* ---------- PROFILE MENU ---------- */}
        <div className="relative ml-1 md:ml-2" ref={profileMenuRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`h-8 w-8 md:h-10 md:w-10 rounded-full border-2 shadow-sm overflow-hidden transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
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
                  {/* ⭐ MOBILE ONLY: Invite people here ⭐ */}
                  {currentItinerary && (
                    <div className="p-1 md:hidden">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          setIsInviteOpen(true);
                        }}
                        className="flex items-center gap-3 w-full p-2.5 text-sm font-bold text-slate-700 rounded-lg hover:bg-slate-50"
                      >
                        <Share2 size={16} />
                        {t("invite")}
                      </button>
                    </div>
                  )}
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
      </div>
    </header>
  );
};

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2, Check, AlertCircle, MapPin, CalendarDays, Plane,
  ShieldCheck, UserPlus
} from "lucide-react";

export default function InviteClient({
  status: initialStatus,
  token,
  trip,
}: {
  status: "ready" | "error" | "joining" | "success";
  token?: string;
  trip?: any;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [error, setError] = useState("");

  async function handleAccept() {
    if (!token) return;

    setStatus("joining");

    const res = await fetch("/api/invite/accept", {
      method: "POST",
      body: JSON.stringify({ token }),
    });

    if (!res.ok) {
      setStatus("error");
      setError("Failed to join.");
      return;
    }

    setStatus("success");
    setTimeout(() => {
      router.push('/');
    }, 1200);
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <AlertCircle className="w-14 h-14 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold">Invalid Invite</h2>
          <p className="text-slate-500 mt-2">{error || "This link is invalid."}</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900">

      {/* LOGO */}
      <header className="h-20 flex items-center justify-center">
        <div className="flex items-center gap-2.5">
          <div className="bg-slate-900 text-white p-2 rounded-lg shadow-md">
            <Plane size={20} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight">Tranger</span>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 flex items-center justify-center p-4 pb-20">
        <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">

          {/* Cover */}
          <div className="relative h-48">
            <img src={trip.imageUrl} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

            {/* Avatar Badge */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <div className="relative">
                <img
                  src={trip.inviter.avatarUrl}
                  className="w-16 h-16 rounded-full border-[4px] border-white shadow-lg"
                />
                <div className="absolute bottom-0 right-0 bg-emerald-500 text-white p-1 rounded-full border-2 border-white">
                  <UserPlus size={10} strokeWidth={3} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-10 pb-8 px-8 text-center">

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[11px] font-bold uppercase mb-3">
              <ShieldCheck size={12} />
              Secure Invite
            </div>

            <h1 className="text-2xl font-extrabold mb-2">{trip.name}</h1>

            <p className="text-slate-500 text-sm mb-6 max-w-[280px] mx-auto">
              <span className="font-semibold">{trip.inviter.name}</span> has invited you to collaborate.
            </p>

            {/* Trip Detail Blocks */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <div className="bg-slate-50 p-3 rounded-xl border flex flex-col items-center gap-1">
                <MapPin className="text-indigo-500 w-5 h-5" />
                <span className="text-xs">{trip.location}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border flex flex-col items-center gap-1">
                <CalendarDays className="text-indigo-500 w-5 h-5" />
                <span className="text-xs">{trip.dates}</span>
              </div>
            </div>

            {/* Buttons */}
            {status === "success" ? (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-700 flex items-center justify-center gap-2">
                <Check size={20} />
                Joined Successfully!
              </div>
            ) : (
              <button
                onClick={handleAccept}
                disabled={status === "joining"}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {status === "joining" ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Joining…
                  </>
                ) : (
                  "Accept Invitation"
                )}
              </button>
            )}
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-400 font-medium">
        © 2025 Tranger Inc.
      </footer>
    </div>
  );
}

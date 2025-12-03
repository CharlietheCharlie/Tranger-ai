import React, { useState, useEffect, useRef } from "react";
import { X, MapPin, ExternalLink, AlertTriangle, Loader2 } from "lucide-react";
import { Activity, Day, Itinerary } from "../types";
import { useTranslations } from "next-intl";
import { useUpdateActivity, useAddActivity } from "../services/activityService";
import { useItineraries } from "@/services/itineraryService";

interface EditActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity?: Activity | null;
  dayId: string;
  itineraryId: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0")
);
const MINUTES = ["00", "15", "30", "45"];

const DEFAULT_ACTIVITY = {
  title: "",
  tags: [],
  cost: 0,
  duration: 60,
  startTime: "09:00",
  notes: "",
  location: "",
};

export const EditActivityModal: React.FC<EditActivityModalProps> = ({
  isOpen,
  onClose,
  activity,
  dayId,
  itineraryId,
}) => {
  const t = useTranslations("EditActivityModal");
  const { data: itineraries = [], isLoading } = useItineraries();
  const updateActivityMutation = useUpdateActivity();
  const addActivityMutation = useAddActivity();
  const [formData, setFormData] = useState<Partial<Activity>>(DEFAULT_ACTIVITY);

  const [locationSearch, setLocationSearch] = useState("");
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (activity) {
        setFormData({ ...activity, tags: activity.tags || [] });
        setLocationSearch(activity.location || "");
      } else {
        setFormData(DEFAULT_ACTIVITY);
        setLocationSearch("");
      }
      setError(null);
    }
  }, [activity, isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowLocationSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const checkTimeConflict = (startTime: string, duration: number) => {
    const trip = itineraries.find((i: Itinerary) => i.id === itineraryId);
    const day = trip?.days.find((d: Day) => d.id === dayId);

    if (!day) return false;

    const getMinutes = (timeStr: string) => {
      const [h, m] = timeStr.split(":").map(Number);
      return h * 60 + m;
    };

    const newStart = getMinutes(startTime);
    const newEnd = newStart + duration;
    return day.activities.some((act) => {
      if (activity && act.id === activity.id) return false;
      if (!act.startTime || !act.duration) return false;

      const actStart = getMinutes(act.startTime);
      const actEnd = actStart + act.duration;

      return newStart < actEnd && newEnd > actStart;
    });
  };

  const handleSave = async () => {
    const startTime = formData.startTime || "09:00";
    const duration = formData.duration || 60;
    const isNew = !activity;

    if (checkTimeConflict(startTime, duration)) {
      setError(t("timeConflict"));
      return;
    }

    try {
      if (isNew) {
        await addActivityMutation.mutateAsync({
          itineraryId,
          dayId,
          activity: {
            ...DEFAULT_ACTIVITY,
            ...formData,
            location: locationSearch,
            startTime,
            duration,
            title: formData.title || "New Activity",
          },
        });
      } else {
        await updateActivityMutation.mutateAsync({
          activityId: activity.id,
          itineraryId,
          updates: {
            ...formData,
            location: locationSearch,
            startTime,
            duration,
            tags: formData.tags || [],
          },
        });
      }
      onClose();
    } catch (err) {
      console.error("Failed to save activity:", err);
      setError("Failed to save activity. Please try again.");
    }
  };

  const handleTimeChange = (type: "hour" | "minute", value: string) => {
    setError(null);
    const current = formData.startTime || "09:00";
    const [h, m] = current.split(":");
    const newTime = type === "hour" ? `${value}:${m}` : `${h}:${value}`;
    setFormData({ ...formData, startTime: newTime });
  };

  const openGoogleMapsSearch = () => {
    if (locationSearch) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationSearch)}`,
        "_blank"
      );
    }
  };

  const mockSuggestions =
    locationSearch.length > 2
      ? [
          {
            name: locationSearch,
            address: "Custom Location",
            type: "Point of Interest",
            rating: 4.5,
            image: `https://source.unsplash.com/100x100/?${encodeURIComponent(locationSearch)}`,
          },
          {
            name: `${locationSearch} Cafe`,
            address: "123 Main Street",
            type: "Food",
            rating: 4.8,
            image: `https://source.unsplash.com/100x100/?cafe`,
          },
          {
            name: `${locationSearch} Park`,
            address: "Greenway Blvd",
            type: "Park",
            rating: 4.2,
            image: `https://source.unsplash.com/100x100/?park`,
          },
        ]
      : [];

  const [currentHour, currentMinute] = (formData.startTime || "09:00").split(
    ":"
  );
  const isSaving =
    updateActivityMutation.isPending || addActivityMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-900/40 backdrop-blur-sm md:p-4">
      <div className="bg-white rounded-t-xl md:rounded-lg w-full max-w-lg shadow-xl flex flex-col max-h-[95vh] h-[90vh] md:h-auto overflow-hidden animate-in slide-in-from-bottom-8 md:zoom-in duration-300 border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0 bg-white">
          <div>
            <h3 className="font-bold text-xl text-slate-900">
              {activity ? t("editActivity") : t("addActivity")}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto space-y-8 flex-1 bg-slate-50/50">
          {/* Title */}
          <div className="border-b border-slate-200 focus-within:border-slate-900 transition-colors pb-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
              {t("title")}
            </label>
            <input
              type="text"
              value={formData.title || ""}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full text-lg font-medium text-slate-900 placeholder-slate-400 outline-none bg-transparent"
              placeholder="Activity Name"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Time */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                {t("time")}
              </label>
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <select
                    value={currentHour}
                    onChange={(e) => handleTimeChange("hour", e.target.value)}
                    className="w-full appearance-none bg-white border border-slate-200 text-slate-900 text-sm rounded-md focus:border-slate-900 outline-none p-2.5 shadow-sm"
                  >
                    {HOURS.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
                <span className="text-slate-400">:</span>
                <div className="relative flex-1">
                  <select
                    value={currentMinute}
                    onChange={(e) => handleTimeChange("minute", e.target.value)}
                    className="w-full appearance-none bg-white border border-slate-200 text-slate-900 text-sm rounded-md focus:border-slate-900 outline-none p-2.5 shadow-sm"
                  >
                    {MINUTES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                {t("duration")} (min)
              </label>
              <input
                type="number"
                value={formData.duration || ""}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    duration: parseInt(e.target.value),
                  });
                  setError(null);
                }}
                className="w-full bg-white border border-slate-200 text-slate-900 text-sm p-2.5 outline-none focus:border-slate-900 rounded-md shadow-sm"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-rose-600 text-xs font-medium bg-rose-50 p-3 rounded-md border border-rose-100">
              <AlertTriangle size={14} />
              {error}
            </div>
          )}

          {/* Location */}
          <div className="relative" ref={wrapperRef}>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
              {t("location")}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1 group">
                <input
                  type="text"
                  value={locationSearch}
                  onChange={(e) => {
                    setLocationSearch(e.target.value);
                    setShowLocationSuggestions(true);
                  }}
                  onFocus={() => setShowLocationSuggestions(true)}
                  placeholder="Add location..."
                  className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-200 text-slate-900 outline-none focus:border-slate-900 transition-colors rounded-md shadow-sm"
                />
                <MapPin
                  size={16}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                {showLocationSuggestions && locationSearch.length > 2 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white shadow-xl border border-slate-200 z-20 rounded-md">
                    {mockSuggestions.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setLocationSearch(item.name);
                          setFormData({ ...formData, location: item.name });
                          setShowLocationSuggestions(false);
                        }}
                        className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50 last:border-0"
                      >
                        <div className="w-8 h-8 bg-slate-200 rounded-sm opacity-80" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900 truncate text-sm">
                            {item.name}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={openGoogleMapsSearch}
                disabled={!locationSearch}
                className="p-2.5 border border-slate-200 rounded-md text-slate-400 hover:text-slate-900 hover:border-slate-400 transition-colors bg-white"
              >
                <ExternalLink size={18} />
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
              {t("notes")}
            </label>
            <textarea
              rows={4}
              value={formData.notes || ""}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Add details..."
              className="w-full bg-white p-3 text-sm text-slate-900 placeholder-slate-400 outline-none border border-slate-200 focus:border-slate-900 resize-none rounded-md shadow-sm"
            />
          </div>

          {/* Cost & Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                {t("cost")}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  $
                </span>
                <input
                  type="number"
                  value={formData.cost || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cost: parseFloat(e.target.value),
                    })
                  }
                  className="w-full pl-7 py-2.5 bg-white border border-slate-200 focus:border-slate-900 outline-none rounded-md shadow-sm text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                {t("tags")}
              </label>
              <input
                type="text"
                value={formData.tags?.join(", ") || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tags: e.target.value.split(",").map((t) => t.trim()),
                  })
                }
                placeholder="e.g. Food, Walking"
                className="w-full py-2.5 px-3 bg-white border border-slate-200 focus:border-slate-900 outline-none rounded-md shadow-sm text-sm"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-500 font-medium hover:text-slate-900 transition-colors text-sm"
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-slate-900 text-white font-medium hover:bg-slate-800 transition-all rounded-md shadow-sm text-sm w-24 flex items-center justify-center"
          >
            {isSaving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : activity ? (
              t("save")
            ) : (
              t("add")
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

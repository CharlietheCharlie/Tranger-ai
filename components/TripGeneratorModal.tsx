import React, { useState } from "react";
import { X, Sparkles, Loader2, Plus, Check, Calendar } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import {
  useCreateItinerary,
  useUpdateItinerary,
} from "../services/itineraryService"; // Import react-query hooks
import { Itinerary, Day } from "../types";
import { useSession } from "next-auth/react"; // Import useSession
import { getTempUserId } from "../lib/client-utils"; // Import getTempUserId
import { CityAutocomplete } from "./CityAutoComplete";
import { AnimatedLoadingText } from "./AnimatedLoadingText";

interface TripGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItineraryCreated?: (itineraryId: string) => void;
}

export const TripGeneratorModal: React.FC<TripGeneratorModalProps> = ({
  isOpen,
  onClose,
  onItineraryCreated,
}) => {
  const t = useTranslations("TripGeneratorModal");
  const locale = useLocale();
  const { data: session } = useSession(); // Get session
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [daysCount, setDaysCount] = useState(3);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [useAI, setUseAI] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const createItineraryMutation = useCreateItinerary();
  const updateItineraryMutation = useUpdateItinerary();

  if (!isOpen) return null;

  const handleAddCity = (cityString: string) => {
    if (cityString && !selectedDestinations.includes(cityString)) {
      setSelectedDestinations([...selectedDestinations, cityString]);
      setSearchTerm("");
    }
  };

  const handleRemoveCity = (city: string) => {
    selectedDestinations.length === 1
      ? setError("Please enter at least one destination.")
      : setError("");
    setSelectedDestinations(selectedDestinations.filter((c) => c !== city));
  };

  const handleGenerate = async () => {
    if (selectedDestinations.length === 0) {
      setError("Please enter at least one destination.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const destString = selectedDestinations.join(", ");

      // Construct days data for initial itinerary creation
      const daysData: Day[] = [];
      for (let i = 0; i < daysCount; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        daysData.push({
          id: i.toString(),
          date: date.toISOString().split("T")[0],
          activities: [],
        });
      }

      // Prepare headers with tempUserId if anonymous
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (!session?.user) {
        headers["x-temp-user-id"] = getTempUserId();
      }

      const newItineraryData: Omit<Itinerary, "id"> = {
        name: `Trip to ${destString}`,
        destination: destString,
        startDate: startDate,
        endDate: daysData[daysData.length - 1].date,
        days: daysData,
        collaborators: [],
        comments: [],
        // creatorId and tempCreatorId will be set in the API based on session or x-temp-user-id header
      };

      let generatedData: Partial<Itinerary> = {};
      if (useAI) {
        const response = await fetch("/api/generate-trip", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            destinations: selectedDestinations,
            daysCount,
            lang: locale,
          }),
        });
        if (!response.ok) {
          throw new Error("Failed to generate trip using AI.");
        }
        generatedData = await response.json();
      }

      const createdItinerary: Itinerary =
        await createItineraryMutation.mutateAsync(newItineraryData);
      // If AI generated data exists, update the itinerary
      if (useAI && generatedData) {
        await updateItineraryMutation.mutateAsync({
          id: createdItinerary.id,
          updates: generatedData,
        });
      }

      onClose();
      setSelectedDestinations([]);
      setDaysCount(3);
      setUseAI(true);
      setStartDate(new Date().toISOString().split("T")[0]);
      setError("");
      if (onItineraryCreated) {
        onItineraryCreated(createdItinerary.id);
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate trip. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isGenerating =
    loading ||
    createItineraryMutation.isPending ||
    updateItineraryMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-900/40 backdrop-blur-sm md:p-4">
      <div className="bg-white rounded-t-xl md:rounded-lg w-full max-w-lg shadow-xl flex flex-col max-h-[90vh] h-[90vh] md:h-auto overflow-hidden animate-in slide-in-from-bottom-8 md:zoom-in duration-300 border border-slate-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {useAI ? t("newTrip") : t("createManual")}
            </h2>
            <p className="text-sm text-slate-500 mt-1">{t("enterDetails")}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 p-2 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto flex-1 bg-slate-50/50">
          {/* Destination Selection */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700">
              {t("destination")}
            </label>

            <div className="flex flex-wrap gap-2 min-h-[32px]">
              {selectedDestinations.length === 0 && !searchTerm && (
                <div className="text-sm text-slate-400">{t("whereGoing")}</div>
              )}
              {selectedDestinations.map((city) => (
                <span
                  key={city}
                  className="inline-flex items-center gap-2 pl-3 pr-2 py-1.5 bg-slate-900 text-white rounded-full text-sm font-medium shadow-sm"
                >
                  {city}
                  <button
                    onClick={() => handleRemoveCity(city)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>

            <CityAutocomplete
              selectedDestinations={selectedDestinations}
              onSelect={(cityString) => handleAddCity(cityString)}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Start Date */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                {t("startDate")}
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-md text-slate-900 focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none shadow-sm"
                />
                <Calendar
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                {t("duration")}
              </label>
              <div className="flex items-center gap-4 h-[46px]">
                <input
                  type="range"
                  min="1"
                  max="14"
                  value={daysCount}
                  onChange={(e) => setDaysCount(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                />
                <span className="font-bold text-slate-900 w-16 text-right">
                  {t("days", { count: daysCount })}
                </span>
              </div>
            </div>
          </div>

          {/* AI Toggle */}
          <div
            onClick={() => setUseAI(!useAI)}
            className={`relative p-0.5 rounded-lg cursor-pointer transition-all duration-300 ${
              useAI
                ? "bg-gradient-to-r from-blue-500 to-purple-600 shadow-md"
                : "bg-slate-200"
            }`}
          >
            <div
              className={`flex items-center justify-between p-4 rounded-[6px] transition-all duration-300 ${
                useAI ? "bg-white/95" : "bg-slate-50 opacity-80"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-2 rounded-full ${useAI ? "bg-blue-100 text-blue-600" : "bg-slate-200 text-slate-500"}`}
                >
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4
                    className={`font-bold ${useAI ? "text-slate-900" : "text-slate-500"}`}
                  >
                    {t("useAI")}
                  </h4>
                  <p className="text-xs text-slate-500">{t("aiDesc")}</p>
                </div>
              </div>
              <div
                className={`w-6 h-6 border flex items-center justify-center transition-colors rounded-full ${
                  useAI
                    ? "bg-blue-500 border-blue-500 text-white"
                    : "border-slate-300 text-transparent"
                }`}
              >
                <Check size={14} />
              </div>
            </div>
          </div>

          {error && (
            <div className="text-rose-600 text-sm py-2 px-3 bg-rose-50 rounded-md">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-white shrink-0 z-20">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || selectedDestinations.length === 0}
            className={`w-full py-4 font-bold rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.99] flex items-center justify-center gap-2 text-white shadow-md ${
              useAI
                ? "bg-gradient-to-r from-blue-600 to-purple-600"
                : "bg-slate-900"
            }`}
          >
            {isGenerating ? (
              useAI ? (
                <AnimatedLoadingText isGenerating={isGenerating} />
              ) : (
                <Loader2 size={18} className="animate-spin" />
              )
            ) : (
              <>
                {useAI ? <Sparkles size={18} /> : <Plus size={18} />}
                <span>{useAI ? t("generate") : t("createManual")}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

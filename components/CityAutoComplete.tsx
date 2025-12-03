import React, { useState, useMemo, useEffect, useRef } from "react";
import { Search, Plus, Globe } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useFetchCityData } from "@/services/geoNamesService";
import useDebounce from "@/hooks/useDebounce";
interface CityAutocompleteProps {
  onSelect: (value: string) => void;
  selectedDestinations: string[];
}

export function CityAutocomplete({
  onSelect,
  selectedDestinations,
}: CityAutocompleteProps) {
  const locale = useLocale();
  const t = useTranslations("CityAutocomplete");
  const [inputValue, setInputValue] = useState("");
  const [openDropdown, setOpenDropdown] = useState(false);

  // Debounce 防止每次打字都呼叫 API
  const debouncedValue = useDebounce(inputValue, 250);

  const { data: cities = [] } = useFetchCityData(debouncedValue, locale);

  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCities = useMemo(() => {
    if (!debouncedValue) return [];
  
    const filtered = cities.filter(
      (c) => !selectedDestinations.includes(`${c.name}, ${c.country}`)
    );
  
    // 去重
    return Array.from(
      new Map(filtered.map((c) => [`${c.name}-${c.country}`, c])).values()
    );
  }, [debouncedValue, cities, selectedDestinations]);

  // 控制開關
  useEffect(() => {
    setOpenDropdown(
      debouncedValue.length > 0 && filteredCities.length > 0
    );
  }, [debouncedValue, filteredCities]);

  // 點選城市
  const handleSelectCity = (city: { name: string; country: string }) => {
    onSelect(`${city.name}, ${city.country}`);
    setInputValue("");
    setOpenDropdown(false);
  };

  return (
    <div className="relative group z-20">
      {/* Input */}
      <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-3">
        <Search size={18} className="text-slate-400" />
      </div>

      <input
        ref={inputRef}
        type="text"
        placeholder={t("addCity")}
        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-md text-slate-900 placeholder-slate-400 focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all shadow-sm"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onFocus={() => inputValue && filteredCities.length > 0 && setOpenDropdown(true)}
        onKeyDown={(e) => e.key === "Escape" && setOpenDropdown(false)}
      />

      {/* 下拉選單 */}
      {openDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-md shadow-xl max-h-60 overflow-y-auto z-30 animate-in fade-in">
          {filteredCities.map((city) => (
            <button
              key={`${city.name}-${city.country}`}
              className="w-full text-left p-3 hover:bg-slate-50 flex items-center gap-4 transition-colors group/item border-b border-slate-50 last:border-0"
              onClick={() => handleSelectCity(city)}
            >
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900">{city.name}</h4>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Globe size={10} />
                  {city.country}
                </div>
              </div>

              <Plus
                size={16}
                className="text-slate-300 group-hover/item:text-slate-900"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

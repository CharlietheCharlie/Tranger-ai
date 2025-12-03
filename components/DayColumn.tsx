import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Day, Activity } from "../types";
import { ActivityCard } from "./ActivityCard";
import { Plus, GripVertical, CalendarDays } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useDeleteActivity } from "../services/activityService"; // Import react-query hook
import { format, Locale } from "date-fns";
import { enUS, zhTW, ja } from "date-fns/locale";

interface DayColumnProps {
  day: Day;
  itineraryId: string;
  onActivityClick?: (a: Activity, did: string) => void;
  onAddActivity?: (dayId: string) => void;
}

const localeMap: { [key: string]: Locale } = {
  en: enUS,
  "zh-TW": zhTW,
  jp: ja,
};

export const DayColumn: React.FC<DayColumnProps> = ({
  day,
  itineraryId,
  onActivityClick,
  onAddActivity,
}) => {
  const deleteActivityMutation = useDeleteActivity(); // Use the mutation hook
  const t = useTranslations("DayColumn");
  const locale = useLocale();

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging: isColumnDragging,
  } = useSortable({
    id: day.id,
    data: {
      type: "DAY",
      day,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isColumnDragging ? 0.3 : 1,
  };

  const dateObj = new Date(day.date);
  const dateFnsLocale = localeMap[locale] || enUS;

  // Format based on locale preference
  const formattedDate = format(dateObj, "MMM d", { locale: dateFnsLocale });
  const weekday = format(dateObj, "EEEE", { locale: dateFnsLocale });
  const fullDate = format(dateObj, "PPPP", { locale: dateFnsLocale });

  return (
    <div
      ref={setSortableRef}
      style={style}
      className="flex flex-col min-w-[85vw] w-[85vw] md:min-w-[340px] md:w-[340px] snap-center shrink-0 bg-white rounded-lg border border-slate-200 max-h-full h-full relative"
    >
      {/* Header */}
      <div
        className="p-5 border-b border-slate-100 flex justify-between items-start bg-white sticky top-0 z-10 group cursor-grab active:cursor-grabbing rounded-t-lg"
        {...attributes}
        {...listeners}
      >
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className="font-bold text-xl text-slate-900 leading-none capitalize">
              {formattedDate}
            </h3>
            <span className="text-sm text-slate-400 font-medium capitalize">
              {weekday}
            </span>
          </div>
          {/* Fallback visual indicator if needed */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full w-fit">
            <CalendarDays size={12} />
            <span>{fullDate}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <GripVertical
            size={14}
            className="text-slate-200 group-hover:text-slate-400 transition-colors"
          />
          <span className="text-[10px] font-bold text-rose-600 border border-rose-100 bg-rose-50 px-2 py-0.5 rounded-sm">
            {day.activities.length}
          </span>
        </div>
      </div>

      {/* Activity List */}
      <div className="flex-1 p-4 overflow-y-auto min-h-[150px] bg-slate-50/50">
        <SortableContext
          id={day.id}
          items={day.activities.map((a) => a.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-3 pb-10">
            {day.activities.length === 0 && (
              <div className="h-32 border border-dashed border-slate-200 rounded-sm flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
                <span className="font-medium text-lg opacity-50">
                  {t("unscheduled")}
                </span>
              </div>
            )}
            {day.activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                dayId={day.id}
                onDelete={() => deleteActivityMutation.mutateAsync({itineraryId, activityId: activity.id})}
                onClick={() => onActivityClick?.(activity, day.id)}
              />
            ))}
          </div>
        </SortableContext>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100 bg-white rounded-b-lg">
        <button
          onClick={() => onAddActivity?.(day.id)}
          className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-[0.15em] text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-sm transition-all border border-dashed border-slate-200 hover:border-slate-400"
        >
          <Plus size={14} />
          {t("addEntry")}
        </button>
      </div>
    </div>
  );
};

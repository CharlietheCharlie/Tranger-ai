import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { Activity } from '../types';

interface ActivityCardProps {
  activity: Activity;
  dayId: string;
  onDelete?: () => void;
  onClick?: () => void;
  isDeleting?: boolean; // New prop for loading state
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, dayId, onDelete, onClick, isDeleting }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: activity.id,
    data: {
      type: 'ACTIVITY',
      activity,
      dayId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const handleLocationClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activity.location) {
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location)}`, '_blank');
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative bg-white p-5 rounded-md border-l-4 border-y border-r border-slate-200 border-l-slate-300 hover:border-l-rose-500 transition-all cursor-grab active:cursor-grabbing touch-none select-none hover:shadow-lg mb-2"
    >
      <div 
        {...attributes} 
        {...listeners}
        className="h-full w-full"
        onClick={(e) => {
            onClick?.();
        }}
      >
        <div className="flex justify-between items-start mb-3">
            <h4 className="font-serif font-medium text-lg text-slate-900 leading-tight pr-6 line-clamp-2 italic">{activity.title}</h4>
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.();
                }}
                onPointerDown={(e) => e.stopPropagation()}
                disabled={isDeleting}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition-all p-1 -mt-1 -mr-1 flex items-center justify-center"
            >
                {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            </button>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-sans tracking-wide mb-3 uppercase">
            {activity.startTime && (
                <span className="font-bold text-slate-700">{activity.startTime}</span>
            )}
            {activity.duration && (
                <span className="opacity-60">{activity.duration} min</span>
            )}
             {activity.cost !== undefined && activity.cost > 0 && (
                <span className="text-slate-900 font-bold border-b border-slate-200 pb-0.5">${activity.cost}</span>
            )}
        </div>

        {activity.location && (
            <button 
                onClick={handleLocationClick}
                onPointerDown={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-600 hover:underline transition-colors group/loc mb-3 w-full text-left font-serif italic"
            >
                <span className="truncate">{activity.location}</span>
                <ExternalLink size={10} className="opacity-0 group-hover/loc:opacity-100 transition-opacity" />
            </button>
        )}

        <div className="flex items-center gap-2 overflow-hidden flex-wrap">
            {activity.tags?.map(tag => ( // Split tags string for rendering
            <span key={tag} className="px-2 py-1 bg-slate-50 text-slate-600 text-[9px] rounded-sm uppercase tracking-widest border border-slate-100">
                {tag}
            </span>
            ))}
        </div>
      </div>
    </div>
  );
};
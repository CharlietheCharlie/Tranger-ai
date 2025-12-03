import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Itinerary } from '../types';
import { useTranslations } from 'next-intl';

interface ItineraryCardProps {
  itinerary: Itinerary;
  onClick: (id: string) => void;
}

export const ItineraryCard: React.FC<ItineraryCardProps> = ({ itinerary, onClick }) => {
  const t = useTranslations("ItineraryCard");
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: itinerary.id,
    data: {
        type: 'ITINERARY',
        itinerary
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const coverImage = itinerary.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group bg-white rounded-lg overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 relative touch-none select-none h-[340px] flex flex-col"
    >
      <div 
        {...attributes} 
        {...listeners}
        onClick={() => {
            if(!isDragging) onClick(itinerary.id);
        }}
        className="cursor-pointer h-full flex flex-col"
      >
        <div className="h-52 bg-slate-100 relative overflow-hidden">
            <img 
                src={coverImage} 
                alt={itinerary.destination} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
            
            <div className="absolute bottom-6 left-6 z-10">
                <h3 className="font-bold text-2xl text-white leading-none tracking-tight">
                    {itinerary.name}
                </h3>
            </div>
            
            <div className="absolute top-6 right-6 z-10 bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-bold text-slate-900 rounded-sm shadow-sm uppercase tracking-wide">
               {t('days', { count: itinerary.days.length })}
            </div>
        </div>
        
        <div className="p-6 flex-1 flex flex-col justify-between bg-white">
            <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
                    {itinerary.destination}
                </p>
                <div className="h-0.5 w-8 bg-slate-200 mb-4" />
            </div>

            <div className="flex justify-between items-end">
                <span className="text-sm text-slate-600 font-medium">
                    {new Date(itinerary.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <div className="flex -space-x-2">
                    {itinerary.collaborators.slice(0,3).map((c, i) => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-slate-200 shadow-sm" title={c.user.name || c.user.email || 'Collaborator'}>
                             <img src={c.user?.image || 'https://www.gravatar.com/avatar?d=mp'} className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { ItineraryCard } from './ItineraryCard';
import { Plus, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useItineraries, useReorderItineraries } from '../services/itineraryService'; // Import the new hooks
import DashboardSkeleton from './DashboardSkeleton';

interface DashboardProps {
  onSelectItinerary: (id: string) => void;
  onNewTrip: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectItinerary, onNewTrip }) => {
  const { data: itineraries, isLoading, isError } = useItineraries(); // Use the new hook for itineraries
  const reorderItinerariesMutation = useReorderItineraries(); // Use the reorder mutation hook
  const t = useTranslations("Dashboard");
  const [searchTerm, setSearchTerm] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const filteredItineraries = (itineraries || []).filter(i =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && itineraries) {
      const oldIndex = itineraries.findIndex((i) => i.id === active.id);
      const newIndex = itineraries.findIndex((i) => i.id === over?.id);
      
      const newOrder = [...itineraries];
      const [movedItem] = newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, movedItem);

      await reorderItinerariesMutation.mutateAsync({ newOrder });
    }
    setActiveId(null);
  };

  const activeItinerary = (itineraries || []).find(i => i.id === activeId);

  if (isLoading || !itineraries) return <DashboardSkeleton  />;
  if (isError) return <div>Error loading itineraries.</div>;

  return (
    <div className="h-full p-6 md:p-12 overflow-y-auto bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="space-y-2">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900">{t('myTrips')}</h2>
                <p className="text-slate-500 text-lg">{t('manageAdventures')}</p>
            </div>
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
                 <div className="relative w-full md:w-auto group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder={t('searchPlaceholder')}
                        className="w-full md:w-72 pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-md text-sm focus:ring-1 focus:ring-slate-400 focus:border-slate-400 outline-none shadow-sm transition-all placeholder-slate-400 text-slate-900"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
                 <button
                    onClick={onNewTrip}
                    className="group relative flex items-center justify-center gap-2 px-6 py-2.5 rounded-md font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98] w-full md:w-auto overflow-hidden bg-slate-900 text-white"
                 >
                    <Plus size={18} />
                    {t('newTrip')}
                </button>
            </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredItineraries.map(i => i.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
              {filteredItineraries.map((trip) => (
                <ItineraryCard
                    key={trip.id}
                    itinerary={trip}
                    onClick={onSelectItinerary}
                />
              ))}

              <button
                onClick={onNewTrip}
                className="h-[340px] border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-400 hover:bg-slate-50 transition-all gap-4 group cursor-pointer"
              >
                 <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 text-slate-400 group-hover:text-slate-900">
                    <Plus size={24} />
                 </div>
                 <span className="font-medium text-lg">{t('createEmptyTrip')}</span>
              </button>
            </div>
          </SortableContext>

          <DragOverlay>
            {activeItinerary ? (
                <div className="opacity-90 rotate-2 scale-105 shadow-2xl">
                     <ItineraryCard itinerary={activeItinerary} onClick={() => {}} />
                </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};
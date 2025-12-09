

import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
  DropAnimation,
  MouseSensor,
  TouchSensor,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Itinerary, Activity, Day } from '../types';
import { DayColumn } from './DayColumn';
import { ActivityCard } from './ActivityCard';
import { useReorderDays, useMoveActivity, useReorderActivities } from '../services/activityService';
import { Loader2 } from 'lucide-react';

interface ItineraryBoardProps {
  itinerary: Itinerary;
  isFetching: boolean;
  onActivityClick?: (activity: Activity | null, dayId: string) => void;
}

const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
};

export const ItineraryBoard: React.FC<ItineraryBoardProps> = ({ itinerary, isFetching, onActivityClick }) => {
  const reorderDaysMutation = useReorderDays();
  const moveActivityMutation = useMoveActivity();
  const reorderActivitiesMutation = useReorderActivities();
  
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'ACTIVITY' | 'DAY' | null>(null);
  const [activeItem, setActiveItem] = useState<Activity | Day | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const isUpdating = isFetching || reorderDaysMutation.isPending || moveActivityMutation.isPending || reorderActivitiesMutation.isPending;

  const handleAddActivity = (dayId: string) => {
    onActivityClick?.(null, dayId);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const type = active.data.current?.type;
    
    setActiveId(active.id as string);
    setActiveType(type);

    if (type === 'ACTIVITY') {
        setActiveItem(active.data.current?.activity);
    } else if (type === 'DAY') {
        setActiveItem(active.data.current?.day);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
        resetState();
        return;
    }

    if (active.id === over.id) {
        resetState();
        return;
    }

    if (activeType === 'DAY') {
        const oldIndex = itinerary.days.findIndex(d => d.id === active.id);
        const newIndex = itinerary.days.findIndex(d => d.id === over.id);
        
        if (oldIndex !== newIndex) {
            const orderedDayIds = arrayMove(itinerary.days, oldIndex, newIndex).map(d => d.id);
            await reorderDaysMutation.mutateAsync({ itineraryId: itinerary.id, orderedDayIds });
        }
    }

    if (activeType === 'ACTIVITY') {
        const sourceDay = itinerary.days.find(d => d.activities.some(a => a.id === active.id));
        const overDay = itinerary.days.find(d => d.id === over.id || d.activities.some(a => a.id === over.id));

        if (sourceDay && overDay) {
            const sourceActivityIndex = sourceDay.activities.findIndex(a => a.id === active.id);
            const sourceActivity = sourceDay.activities[sourceActivityIndex];
            
            let overActivityIndex = overDay.activities.findIndex(a => a.id === over.id);
            if (over.data.current?.type === 'DAY') {
                overActivityIndex = overDay.activities.length;
            }

            if (sourceDay.id === overDay.id) {
                // Reordering within the same day
                const reorderedActivities = arrayMove(sourceDay.activities, sourceActivityIndex, overActivityIndex);
                const orderedActivityIds = reorderedActivities.map(a => a.id);
                await reorderActivitiesMutation.mutateAsync({
                    itineraryId: itinerary.id,
                    dayId: sourceDay.id,
                    orderedActivityIds
                });
            } else {
                // Moving to a different day
                await moveActivityMutation.mutateAsync({
                    itineraryId: itinerary.id,
                    activityId: sourceActivity.id,
                    targetDayId: overDay.id,
                    position: overActivityIndex,
                });
            }
        }
    }

    resetState();
  };

  const resetState = () => {
      setActiveId(null);
      setActiveType(null);
      setActiveItem(null);
  };

  return (
    <div className="relative h-full">
      {isUpdating && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50" data-testid="loader">
          <Loader2 size={48} className="text-slate-900 animate-spin" />
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex h-full gap-4 md:gap-6 p-4 md:p-6 overflow-x-auto bg-white/50 no-scrollbar snap-x snap-mandatory">
          <SortableContext items={itinerary.days.map(d => d.id)} strategy={horizontalListSortingStrategy}>
              {itinerary.days.map((day) => (
              <DayColumn 
                  key={day.id} 
                  day={day} 
                  itineraryId={itinerary.id} 
                  onActivityClick={onActivityClick} 
                  onAddActivity={handleAddActivity}
              />
              ))}
          </SortableContext>
          
          {/* Spacer for easier scrolling to the end on mobile */}
          <div className="w-4 shrink-0 md:hidden" />
        </div>

        <DragOverlay dropAnimation={dropAnimationConfig}>
          {activeType === 'ACTIVITY' && activeItem ? (
            <div className="opacity-90 rotate-2 scale-105 cursor-grabbing w-[300px]">
                <ActivityCard activity={activeItem as Activity} dayId="overlay" />
            </div>
          ) : null}
          {activeType === 'DAY' && activeItem ? (
              <div className="opacity-90 rotate-2 scale-105 cursor-grabbing h-[600px]">
                  <DayColumn day={activeItem as Day} itineraryId={itinerary.id} />
              </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};


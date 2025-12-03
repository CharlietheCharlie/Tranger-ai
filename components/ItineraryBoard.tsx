

import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Itinerary, Activity, Day } from '../types';
import { DayColumn } from './DayColumn';
import { ActivityCard } from './ActivityCard';
import { useReorderDays, useMoveActivity } from '../services/activityService'; // Import react-query hooks

interface ItineraryBoardProps {
  itinerary: Itinerary;
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

export const ItineraryBoard: React.FC<ItineraryBoardProps> = ({ itinerary, onActivityClick }) => {
  const reorderDaysMutation = useReorderDays();
  const moveActivityMutation = useMoveActivity();
  
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'ACTIVITY' | 'DAY' | null>(null);
  const [activeItem, setActiveItem] = useState<Activity | Day | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 5,
        }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

    if (activeType === 'DAY') {
        if (active.id !== over.id) {
            const oldIndex = itinerary.days.findIndex(d => d.id === active.id);
            const newIndex = itinerary.days.findIndex(d => d.id === over.id);
            
            const newOrder = [...itinerary.days];
            const [movedDay] = newOrder.splice(oldIndex, 1);
            newOrder.splice(newIndex, 0, movedDay);
            const orderedDayIds = newOrder.map(day => day.id);

            try {
                await reorderDaysMutation.mutateAsync({ itineraryId: itinerary.id, orderedDayIds });
            } catch (error) {
                console.error('Failed to reorder days:', error);
            }
        }
    }

    if (activeType === 'ACTIVITY') {
        const activeIdStr = active.id as string;
        const overIdStr = over.id as string;
        
        const sourceDay = itinerary.days.find(d => d.activities.some(a => a.id === activeIdStr));
        let targetDay = itinerary.days.find(d => d.id === overIdStr) || 
                        itinerary.days.find(d => d.activities.some(a => a.id === overIdStr));

        if (sourceDay && targetDay) {
            const activeActivityIndex = sourceDay.activities.findIndex(a => a.id === activeIdStr);
            let overIndex = targetDay.activities.findIndex(a => a.id === overIdStr);
            
            if (over.data.current?.type === 'DAY') {
                overIndex = targetDay.activities.length;
            }

            if (sourceDay.id !== targetDay.id || activeActivityIndex !== overIndex) {
                if (overIndex === -1) overIndex = targetDay.activities.length;
                try {
                    await moveActivityMutation.mutateAsync({ 
                        itineraryId: itinerary.id,
                        activityId: activeIdStr, 
                        targetDayId: targetDay.id 
                    });
                } catch (error) {
                    console.error('Failed to move activity:', error);
                }
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
  );
};


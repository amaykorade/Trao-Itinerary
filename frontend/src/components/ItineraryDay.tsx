'use client';

import { useEffect, useState } from 'react';
import type { Activity, DayPlan } from '@/lib/types';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';

interface ItineraryDayProps {
  day: DayPlan;
  readOnly?: boolean;
  onRemove: (activityId: string) => void;
  onRegenerate: (day: number) => void;
  onAdd: (day: number) => void;
  onReorder: (day: number, activityIds: string[]) => void;
  busy?: boolean;
}

interface SortableActivityProps {
  activity: Activity;
  index: number;
  busy?: boolean;
  onRemove: (activityId: string) => void;
}

function SortableActivity({ activity, index, busy, onRemove }: SortableActivityProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: activity.id,
    disabled: busy,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex gap-3 rounded-xl border bg-white p-4 transition-colors sm:gap-4 ${
        isDragging
          ? 'z-10 border-teal-300 bg-teal-50/50 shadow-md ring-2 ring-teal-200'
          : 'border-slate-100 hover:border-teal-100 hover:bg-teal-50/30'
      }`}
    >
      <button
        type="button"
        className={`flex h-8 w-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50 ${
          isDragging ? 'cursor-grabbing' : ''
        }`}
        aria-label={`Drag to reorder ${activity.title}`}
        disabled={busy}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-500">
        {index + 1}
      </span>

      <div className="min-w-0 flex-1">
        <p className="font-medium text-slate-900">{activity.title}</p>
        {activity.description && (
          <p className="mt-1 text-sm leading-relaxed text-slate-600">{activity.description}</p>
        )}
        {activity.category && (
          <span className="mt-2 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-600">
            {activity.category}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => onRemove(activity.id)}
        disabled={busy}
        className="shrink-0 self-start rounded-lg p-2 text-slate-400 opacity-100 transition-all hover:bg-red-50 hover:text-red-600 sm:opacity-0 sm:group-hover:opacity-100 disabled:opacity-50"
        aria-label={`Remove ${activity.title}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function ReadOnlyActivity({ activity, index }: { activity: Activity; index: number }) {
  return (
    <div className="flex gap-3 rounded-xl border border-slate-100 bg-white p-4 sm:gap-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-500">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-slate-900">{activity.title}</p>
        {activity.description && (
          <p className="mt-1 text-sm leading-relaxed text-slate-600">{activity.description}</p>
        )}
        {activity.category && (
          <span className="mt-2 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-600">
            {activity.category}
          </span>
        )}
      </div>
    </div>
  );
}

export default function ItineraryDay({
  day,
  readOnly,
  onRemove,
  onRegenerate,
  onAdd,
  onReorder,
  busy,
}: ItineraryDayProps) {
  const [activities, setActivities] = useState(day.activities);

  useEffect(() => {
    setActivities(day.activities);
  }, [day.activities]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = activities.findIndex((activity) => activity.id === active.id);
    const newIndex = activities.findIndex((activity) => activity.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(activities, oldIndex, newIndex);
    setActivities(reordered);
    onReorder(day.day, reordered.map((activity) => activity.id));
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
            Day {day.day}
          </p>
          <h3 className="text-lg font-semibold text-slate-900">
            {day.title || `Day ${day.day}`}
          </h3>
        </div>
        <div className="flex gap-2">
          {!readOnly && (
            <>
              <Button variant="outline" size="sm" onClick={() => onAdd(day.day)} disabled={busy}>
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
              <Button variant="outline" size="sm" onClick={() => onRegenerate(day.day)} disabled={busy}>
                <RefreshCw className="h-3.5 w-3.5" />
                Regenerate
              </Button>
            </>
          )}
        </div>
      </div>

      <CardBody className="space-y-3 p-4 sm:p-5">
        {activities.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-400">
            No activities yet. Add one or regenerate this day.
          </p>
        ) : readOnly ? (
          <div className="space-y-3">
            {day.activities.map((activity, index) => (
              <ReadOnlyActivity key={activity.id} activity={activity} index={index} />
            ))}
          </div>
        ) : (
          <>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={activities.map((activity) => activity.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {activities.map((activity, index) => (
                    <SortableActivity
                      key={activity.id}
                      activity={activity}
                      index={index}
                      busy={busy}
                      onRemove={onRemove}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </>
        )}
      </CardBody>
    </Card>
  );
}

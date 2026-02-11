"use client"

import { Column, JobApplication } from '@/lib/models/models.types';
import { Award, Calendar, CheckCircle2, Mic, MoreHorizontal, MoreVertical, Trash2, XCircle } from 'lucide-react';
import React, { act, useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import CreateJobAppicationDialog from './create-job-dialog';
import { Button } from './ui/button';
import JobApplicationCard from './job-application-card';
import { useBoard } from '@/lib/hooks/useBoards';
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors, useDroppable, DragStartEvent, DragEndEvent, DragOverlay } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { set } from 'mongoose';


interface KanbanBoardProps {
  board: any;
  userId: string;
}

interface ColumnConfig {
  color: string;
  icon: React.ReactNode;
}

const COLUMN_CONFIG: Array<ColumnConfig> = [
  { color: "bg-gray-500", icon: <Calendar className='h-4 w-4' /> },
  { color: "bg-blue-500", icon: <CheckCircle2 className='h-4 w-4' /> },
  { color: "bg-green-500", icon: <Mic className='h-4 w-4' /> },
  { color: "bg-yellow-500", icon: <Award className='h-4 w-4' /> },
  { color: "bg-red-500", icon: <XCircle className='h-4 w-4' /> },
];

function DroppableColumn({ column, config, boardId, sortedColumns, moveJob }: { column: Column; config: ColumnConfig; boardId: string, sortedColumns: Column[], moveJob?: (jobId: string, columnId: string, order: number) => Promise<void> }) {
  const { setNodeRef, isOver } = useDroppable({
    id: column._id,
    data: {
      type: "column",
      columnId: column._id,
    }
  });
  // console.log("Rendering column:", column);
  const sortedJobs = column.jobApplications.sort((a, b) => a.order - b.order) || [];

  return (
    <Card className='min-w-[300px] flex-shrink-0 shadow-md p-0 mt-4'>
      <CardHeader className={`${config.color} text-white rounded-t-lg pb-3 pt-3`}>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            {config.icon}
            <CardTitle className='text-white text-base font-semibold'>
              {column.name}
            </CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className='bg-transparent'>
                <MoreVertical className='h-4 w-4 bg-transparent' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='end'>
              <DropdownMenuItem className='text-destructive'>
                <Trash2 className='mr-2 h-4 w-4' />
                Delete Column
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent
        ref={setNodeRef}
        className={`space-y-2 pt-4 bg-gray-50/50 min-h-[400px] rounded-b-lg transition-all duration-200 ${isOver ? "ring-2 ring-blue-500 bg-blue-50/30" : ""
          }`}
      >
        <SortableContext items={sortedJobs.map(job => job._id)} strategy={verticalListSortingStrategy}>
          {sortedJobs.map((job: any, key) => (
            <SortableJobCard
              key={key}
              job={{ ...job, columnId: job.columnId || column._id }}
              columns={sortedColumns}
              onMove={moveJob}
            />
          ))}
        </SortableContext>
        <CreateJobAppicationDialog columnId={column._id} boardId={boardId} />
      </CardContent>
    </Card>
  )
}

function SortableJobCard({ job, columns, onMove }: { job: JobApplication, columns: Column[], onMove?: (jobId: string, columnId: string, order: number) => Promise<void> }) {
  const {
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
    setNodeRef } = useSortable({
      id: job._id,
      data: {
        type: "job",
        job
      },
      transition: {
        duration: 300,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
    });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 300ms cubic-bezier(0.25, 1, 0.5, 1)',
    opacity: isDragging ? 0.3 : 1,
    cursor: "grab",
  };

  return (
    <div ref={setNodeRef} style={style} >
      <JobApplicationCard job={job} columns={columns} onMove={onMove} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  )
}



const KanbanBoard = ({ board, userId }: KanbanBoardProps) => {
  //const columns = board?.columns || [];

  const [activeId, setActiveId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const { columns, moveJob } = useBoard(board);

  const sortedColumns = columns?.sort((a, b) => a.order - b.order) || [];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  async function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over || !board._id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    let draggedJob: JobApplication | null = null;
    let sourceColumn: Column | null = null;
    let sourceIndex = -1;

    for (const column of columns) {
      const jobs = column.jobApplications.sort((a, b) => a.order - b.order) || [];
      const jobIndex = jobs.findIndex(job => job._id === activeId);
      if (jobIndex !== -1) {
        draggedJob = jobs[jobIndex];
        sourceColumn = column;
        sourceIndex = jobIndex;
        break;
      }
    }

    if (!draggedJob || !sourceColumn) return;

    const targetColumn = sortedColumns.find(col => col._id === overId);
    const targetJob = sortedColumns
      .flatMap(col => col.jobApplications)
      .find(job => job._id === overId);

    let targetCoplumnId: string;
    let newOrder: number;

    if (targetColumn) {
      targetCoplumnId = targetColumn._id;
      const jobsInTarget = targetColumn.jobApplications
        .filter((j) => j._id !== activeId)
        .sort((a, b) => a.order - b.order) || [];
      newOrder = jobsInTarget.length;
    }
    else if (targetJob) {
      const targetJobColumn = sortedColumns.find(col => col.jobApplications.some(job => job._id === targetJob._id));
      targetCoplumnId = targetJob.columnId || targetJobColumn?._id || "";
      if (!targetCoplumnId) return;

      const targetColumnObj = sortedColumns.find(col => col._id === targetCoplumnId);
      if (!targetColumnObj) return;

      const allJobsInTargetOriginal =
        targetColumnObj.jobApplications.sort((a, b) => a.order - b.order) || [];

      const allJobsInTargetFiltered =
        allJobsInTargetOriginal.filter(j => j._id !== activeId) || [];

      const targetIndexInFiltered = allJobsInTargetFiltered.findIndex(j => j._id === overId);

      if (targetIndexInFiltered !== -1) {
        // Check if we're dragging within the same column
        if (sourceColumn._id === targetCoplumnId) {
          // Same column drag
          const targetIndexInOriginal = allJobsInTargetOriginal.findIndex(j => j._id === overId);
          if (sourceIndex < targetIndexInOriginal) {
            // Dragging down - place after target
            newOrder = targetIndexInFiltered + 1;
          } else {
            // Dragging up - place at target position
            newOrder = targetIndexInFiltered;
          }
        } else {
          // Different column - place at target position
          newOrder = targetIndexInFiltered;
        }
      } else {
        // Target not found, place at end
        newOrder = allJobsInTargetFiltered.length;
      }
    }
    else {
      return;
    }

    if(!targetCoplumnId) return;

    await moveJob(activeId, targetCoplumnId, newOrder);


  }
  const activeJob = sortedColumns.flatMap(col => col.jobApplications || []).find(job => job._id === activeId);
  return (
    <>
      {!isMounted ? (
        <div className="space-y-4">
          <div className="flex gap-4 overflow-x-auto pb-4">
            {
              columns.map((col, key) => {
                const config = COLUMN_CONFIG[key] || {
                  color: "bg-gray-500",
                  icon: <Calendar className='h-4 w-4' />
                };
                return (
                  <Card key={key} className='min-w-[300px] flex-shrink-0 shadow-md p-0 mt-4'>
                    <CardHeader className={`${config.color} text-white rounded-t-lg pb-3 pt-3`}>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          {config.icon}
                          <CardTitle className='text-white text-base font-semibold'>
                            {col.name}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-4 bg-gray-50/50 min-h-[400px] rounded-b-lg">
                      {col.jobApplications.sort((a, b) => a.order - b.order).map((job: any, jobKey) => (
                        <JobApplicationCard 
                          key={jobKey} 
                          job={{ ...job, columnId: job.columnId || col._id }} 
                          columns={sortedColumns} 
                        />
                      ))}
                      <CreateJobAppicationDialog columnId={col._id} boardId={board._id} />
                    </CardContent>
                  </Card>
                );
              })
            }
          </div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}>
          <div className="space-y-4">
            <div className="flex gap-4 overflow-x-auto pb-4">
              {
                columns.map((col, key) => {
                  const config = COLUMN_CONFIG[key] || {
                    color: "bg-gray-500",
                    icon: <Calendar className='h-4 w-4' />
                  };
                  return <DroppableColumn
                    key={key}
                    column={col}
                    config={config}
                    boardId={board._id}
                    sortedColumns={sortedColumns}
                    moveJob={moveJob} />
                })
              }

            </div>
          </div>

          <DragOverlay dropAnimation={{
            duration: 300,
            easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
          }}>
            {activeJob ? (
              <div className="rotate-2 scale-105 transition-all shadow-2xl">
                <JobApplicationCard job={activeJob} columns={sortedColumns} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </>
  )
}

export default KanbanBoard
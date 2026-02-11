"use client"

import { Column, JobApplication } from '@/lib/models/models.types';
import { Award, Calendar, CheckCircle2, Mic, MoreHorizontal, MoreVertical, Trash2, XCircle } from 'lucide-react';
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import CreateJobAppicationDialog from './create-job-dialog';
import { Button } from './ui/button';
import JobApplicationCard from './job-application-card';
import { useBoard } from '@/lib/hooks/useBoards';
import { DndContext } from '@dnd-kit/core';

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
  const {setNodeRef, isOver} = useDropable({
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
        className={`space-y-2 pt-4 bg-gray-50/50 min-h-[400px] rounded-b-lg ${
          isOver ? "ring-2 ring-blue-500" : ""
        }`}
      >
        <SortableContext>
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
  return (
    <div>
      <JobApplicationCard job={job} columns={columns} onMove={onMove} />
    </div>
  )
}

const KanbanBoard = ({ board, userId }: KanbanBoardProps) => {
  //const columns = board?.columns || [];

  const { columns, moveJob } = useBoard(board);

  const sortedColumns = columns?.sort((a, b) => a.order - b.order) || [];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  async function handleDragStart(){

  }

  async function handleDragEnd(){
    
  }

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCorners} 
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}>
      <div>
        <div>
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
    </DndContext>
  )
}

export default KanbanBoard
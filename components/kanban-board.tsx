"use client"

import { Column } from '@/lib/models/models.types';
import { Award, Calendar, CheckCircle2, Mic, MoreHorizontal, MoreVertical, Trash2, XCircle } from 'lucide-react';
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import CreateJobAppicationDialog from './create-job-dialog';
import { Button } from './ui/button';

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

function DroppableColumn({ column, config, boardId }: { column: Column; config: ColumnConfig; boardId: string }) {
  // console.log("Rendering column:", column);
  return (
    <Card className='min-w-[300px] flex-shrink-0 shadow-md p-0'>
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

      <CardContent className='space-y-2 pt-4 bg-gray-50/50 min-h-[400px] rounded-b-lg'>
        <CreateJobAppicationDialog columnId={column._id} boardId={boardId} />
      </CardContent>
    </Card>
  )
}

const KanbanBoard = ({ board, userId }: KanbanBoardProps) => {
 
  const columns = board?.columns || [];
  return (
    <>
      <div>
        <div>
          {
            columns.map((col, key) => {
              const config = COLUMN_CONFIG[key] || {
                color: "bg-gray-500",
                icon: <Calendar className='h-4 w-4' />
              };
              return <DroppableColumn key={key} column={col} config={config} boardId={board._id} />
            })
          }

        </div>
      </div>
    </>
  )
}

export default KanbanBoard
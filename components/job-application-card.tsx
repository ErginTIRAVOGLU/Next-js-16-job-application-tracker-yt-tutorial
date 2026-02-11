"use client"

import { Column, JobApplication } from '@/lib/models/models.types'
import React, { useState } from 'react'
import { Card, CardContent } from './ui/card';
import { Edit2, ExternalLink, MoreVertical, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';
import { deleteJobApplication, updateJobApplication } from '@/lib/actions/job-applications';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

interface JobApplicationCardProps {
    job: JobApplication;
    columns: Column[];
    onMove?: (jobId: string, columnId: string, order: number) => Promise<void>;
}

const JobApplicationCard = ({ job, columns, onMove }: JobApplicationCardProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        company: job.company,
        position: job.position,
        location: job.location || '',
        notes: job.notes || '',
        salary: job.salary || '',
        jobUrl: job.jobUrl || '',
        columnId: job.columnId || '',
        tags: job.tags ? job.tags.join(', ') : '',
        description: job.description || '',
    });

    async function handleUpdate() {
        try {
            const result = await updateJobApplication(job._id, {
                ...formData,
                tags: formData.tags
                    .split(',')
                    .map(tag => tag.trim())
                    .filter(tag => tag.length > 0),
            });
            if (result.error) {
                console.error("Error updating job application:", result.error);
            } else {
                console.log("Job application updated successfully");
                setIsEditing(false);
            }
        } catch (error) {
            console.error("Error updating job application:", error);
        }

    }

    async function handleDelete() {
        try {
            const result = await deleteJobApplication(job._id);
            if (result.error) {
                console.error("Error deleting job application:", result.error);
            } else {
                console.log("Job application deleted successfully");
            }
        } catch (error) {
            console.error("Error deleting job application:", error);
        }
    }


    async function handleMove(newColumnId: string) {
        try {
            // Use optimistic update if available
            if (onMove) {
                await onMove(job._id, newColumnId, 0);
            } else {
                // Fallback to direct server call
                const result = await updateJobApplication(job._id, { columnId: newColumnId });
                if (result.error) {
                    console.error("Error moving job application:", result.error);
                } else {
                    console.log("Job application moved successfully");
                }
            }
        } catch (error) {
            console.error("Error moving job application:", error);
        }
    }

    return (
        <>
            <Card className='cursor-pointer transition-shadow hover:shadow-lg bg-white group shadow-sm'>
                <CardContent className='p-4'>
                    <div className='flex items-start justify-between gap-2'>
                        <div className='flex-1 min-w-0'>
                            <h3 className='font-semibold text-sm mb-1'>{job.position}</h3>
                            <p className='text-xs text-muted-foreground mb-2'>{job.company}</p>
                            {job.description && (
                                <p className='text-xs text-muted-foreground mb-2 line-clamp-2'>{job.description}</p>
                            )}
                            {job.tags && job.tags.length > 0 && (
                                <div className='flex flex-wrap gap-1 mb-2'>
                                    {job.tags.map((tag, index) => (
                                        <span className='px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' key={index} >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                            {job.jobUrl && (
                                <a 
                                    href={job.jobUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    onClick={(e) => e.stopPropagation()} 
                                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                                    aria-label={`Open ${job.position} at ${job.company} in new tab`}
                                >
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            )}
                        </div>

                        <div className="flex items-start gap-1">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                        <Edit2 className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                    {
                                        columns.length > 1 && (
                                            <>
                                                {
                                                    columns
                                                        .filter((c) => c._id !== job.columnId)
                                                        .map((column, key) => (
                                                            <DropdownMenuItem key={key} onClick={() => handleMove(column._id)}>
                                                                Move to {column.name}
                                                            </DropdownMenuItem>
                                                        ))}
                                            </>
                                        )
                                    }
                                    <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isEditing} onOpenChange={setIsEditing}>

                <DialogContent className='max-w-2xl'>
                    <DialogHeader>
                        <DialogTitle>Edit Job Application</DialogTitle>
                        <DialogDescription>Update your job application details</DialogDescription>
                    </DialogHeader>
                    <form
                        className='space-y-4'
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleUpdate();
                        }}
                    >
                        <div className='space-y-4'>
                            <div className='grid grid-cols-2 gap-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor="company">Company *</Label>
                                    <Input id="company" value={formData.company} required onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor="position">Position *</Label>
                                    <Input id="position" value={formData.position} required onChange={(e) => setFormData({ ...formData, position: e.target.value })} />
                                </div>
                            </div>
                            <div className='grid grid-cols-2 gap-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor="location">Location</Label>
                                    <Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor="salary">Salary</Label>
                                    <Input id="salary" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} placeholder='e.g., $100k - $150k' />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="jobUrl">Job URL</Label>
                                <Input id="jobUrl" value={formData.jobUrl} onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })} placeholder='e.g., https://www.example.com/job' />
                            </div>
                            <div>
                                <Label htmlFor="tags">Tags (comma separated)</Label>
                                <Input id="tags" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder='e.g., JavaScript, React, Node.js' />
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder='e.g., Frontend Developer position at XYZ Company' />
                            </div>
                            <div>
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea id="notes" rows={4} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder='e.g., Follow up with recruiter next week' />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type='button' variant={"outline"} onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button type='submit'>Save Changes</Button>
                        </DialogFooter>
                    </form>

                </DialogContent>
            </Dialog>
        </>
    )
}

export default JobApplicationCard
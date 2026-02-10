import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

interface CreateJobAppicationDialogProps {
    columnId: string;
    boardId: string;
}

const CreateJobAppicationDialog = ({ columnId, boardId }: CreateJobAppicationDialogProps) => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant='outline' className='mb-4 justify-start text-muted-foreground border-dashed border-2'>
                    <Plus className='mr-2 h-4 w-4' />
                    Add Job
                </Button>
            </DialogTrigger>
            <DialogContent className='max-w-2xl'>
                <DialogHeader>
                    <DialogTitle>Add Job Application</DialogTitle>
                    <DialogDescription>Track a new job application</DialogDescription>
                </DialogHeader>
                <form className='space-y-4'>
                    <div className='space-y-4'>
                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label htmlFor="company">Company *</Label>
                                <Input id="company" required />
                            </div>
                            <div className='space-y-2'>
                                <Label htmlFor="position">Position *</Label>
                                <Input id="position" required />
                            </div>
                        </div>
                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label htmlFor="location">Location</Label>
                                <Input id="location" />
                            </div>
                            <div className='space-y-2'>
                                <Label htmlFor="salary">Salary</Label>
                                <Input id="salary" placeholder='e.g., $100k - $150k' />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="jobUrl">Job URL</Label>
                            <Input id="jobUrl" placeholder='e.g., https://www.example.com/job' />
                        </div>
                        <div>
                            <Label htmlFor="tags">Tags (comma separated)</Label>
                            <Input id="tags" placeholder='e.g., JavaScript, React, Node.js' />
                        </div>
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" rows={3} placeholder='e.g., Frontend Developer position at XYZ Company' />
                        </div>
                        <div>
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea id="notes" rows={4} placeholder='e.g., Follow up with recruiter next week' />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type='button' variant={"outline"}>Cancel</Button>
                        <Button type='submit'>Add Application</Button>
                    </DialogFooter>
                </form>

            </DialogContent>
        </Dialog>
    )
}

export default CreateJobAppicationDialog
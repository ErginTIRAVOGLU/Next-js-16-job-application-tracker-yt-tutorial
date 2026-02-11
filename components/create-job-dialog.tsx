import React, { FormEvent, SyntheticEvent, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { boolean } from 'better-auth';
import { create } from 'domain';
import { createJobApplication } from '@/lib/actions/job-applications';

interface CreateJobApplicationDialogProps {
    columnId: string;
    boardId: string;
}

const INITIAL_FORM_DATA = {
    company: '',
    position: '',
    location: '',
    notes: '',
    salary: '',
    jobUrl: '',
    tags: '',
    description: '',
};

const CreateJobApplicationDialog = ({ columnId, boardId }: CreateJobApplicationDialogProps) => {
    const [open, setOpen] = useState<boolean>(false);
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);

    async function handleSubmit(event: SyntheticEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        try {

            const result = await createJobApplication({ ...formData, columnId, boardId, tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) });
            if (!result.error) {
                setFormData(INITIAL_FORM_DATA);
                setOpen(false);
            }
            else {

                console.error('Error creating job application:', result.error);
            }
        } catch (error) {
            console.error('Error creating job application:', error);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
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
                <form className='space-y-4' onSubmit={handleSubmit}>
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
                        <Button type='button' variant={"outline"} onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type='submit'>Add Application</Button>
                    </DialogFooter>
                </form>

            </DialogContent>
        </Dialog>
    )
}

export default CreateJobApplicationDialog
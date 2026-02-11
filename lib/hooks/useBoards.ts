"use client";

import { useEffect, useState } from "react";
import { Board, Column, JobApplication } from "../models/models.types";
import { updateJobApplication } from "../actions/job-applications";

export function useBoard(initialBoard?: Board | null) {
    const [board, setBoard] = useState<Board | null>(initialBoard || null);
    const [columns, setColumns] = useState<Column[]>(initialBoard?.columns || []);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialBoard) {
            setBoard(initialBoard);
            setColumns(initialBoard.columns || []);
        }
    }, [initialBoard]);

    async function moveJob(
        jobApplicationId: string,
        newColumnId: string,
        newOrder: number
    ) {
        // Store previous state for rollback
        const previousColumns = [...columns];

        try {
            // Find the job and its current column
            let jobToMove: JobApplication | null = null;
            let oldColumnId: string | null = null;

            for (const column of columns) {
                const foundJob = column.jobApplications?.find(
                    (job) => job._id === jobApplicationId
                );
                if (foundJob) {
                    jobToMove = foundJob;
                    oldColumnId = column._id;
                    break;
                }
            }

            if (!jobToMove || !oldColumnId) {
                setError("Job application not found");
                return;
            }

            // Update local state optimistically
            const updatedColumns = columns.map((column) => {
                if (column._id === oldColumnId) {
                    // Remove from old column
                    return {
                        ...column,
                        jobApplications: column.jobApplications?.filter(
                            (job) => job._id !== jobApplicationId
                        ) || [],
                    };
                }
                if (column._id === newColumnId) {
                    // Add to new column at specified order
                    const updatedJobs = [...(column.jobApplications || [])];
                    updatedJobs.splice(newOrder, 0, jobToMove);
                    return {
                        ...column,
                        jobApplications: updatedJobs,
                    };
                }
                return column;
            });

            setColumns(updatedColumns);

            // Persist to server
            const result = await updateJobApplication(jobApplicationId, {
                columnId: newColumnId,
                order: newOrder,
            });

            if (result.error) {
                // Rollback on error
                setColumns(previousColumns);
                setError(result.error);
            } else {
                setError(null);
            }
        } catch (err) {
            // Rollback on exception
            setColumns(previousColumns);
            setError(err instanceof Error ? err.message : "Failed to move job application");
        }
    }

    return { board, columns, error, moveJob };
}
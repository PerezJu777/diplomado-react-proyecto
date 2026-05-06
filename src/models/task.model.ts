import { z } from 'zod';

export interface Task {
  id: number;
  name: string;
  done: boolean;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export const schemaTask = z.object({
  name: z.string().min(3, 'El nombre de la tarea debe tener al menos 3 caracteres'),
});

export type TaskFormValues = z.infer<typeof schemaTask>;

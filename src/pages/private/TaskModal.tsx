import { useState, useActionState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
} from '@mui/material';
import { schemaTask, type TaskFormValues, type Task } from '../../models';
import { createInitialState, handleZodErros } from '../../helpers/form.helper';
import type { ActionState } from '../../interfaces';

//import { useNavigate } from 'react-router-dom'; 
import { useAlert, useAuth, useAxios } from '../../hooks';

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  taskToEdit?: Task | null;
}

export const TaskModal = ({ open, onClose, onSuccess, taskToEdit }: TaskModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Utilizando las librerías solicitadas
  const { showAlert } = useAlert();
  const { token } = useAuth();
  const axios = useAxios();
  //const navigate = useNavigate();

  const handleSubmit = async (
    _state: ActionState<TaskFormValues>,
    formData: FormData
  ): Promise<ActionState<TaskFormValues>> => {
    setIsSubmitting(true);
    const rawData: TaskFormValues = {
      name: formData.get('name') as string,
    };
    
    try {
      // Validate form data
      const data = schemaTask.parse(rawData);

      if (token) {
        if (taskToEdit) {
          await axios.put(`/tasks/${taskToEdit.id}`, data);
          showAlert('Tarea actualizada exitosamente', 'success');
        } else {
          await axios.post('/tasks', data);
          showAlert('Tarea creada exitosamente', 'success');
        }
      }

      if (onSuccess) onSuccess();
      onClose(); // Close on success
      
      return createInitialState<TaskFormValues>();
    } catch (error: unknown) {
      const err = handleZodErros(error, rawData);
      showAlert(err.message || 'Error al guardar la tarea', 'error');
      return err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const [state, formAction] = useActionState(
    handleSubmit,
    createInitialState<TaskFormValues>()
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{taskToEdit ? 'Editar Tarea' : 'Nueva Tarea'}</DialogTitle>
      {/* Usamos key para forzar que el formulario se resetee cuando cambia la tarea */}
      <form action={formAction} key={taskToEdit ? taskToEdit.id : 'new'}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            name="name"
            label="Nombre de la tarea"
            type="text"
            fullWidth
            variant="outlined"
            defaultValue={state.formData?.name ?? taskToEdit?.name ?? ''}
            error={!!state.errors?.name}
            helperText={state.errors?.name?.[0] || ' '}
            disabled={isSubmitting}
          />
          {state.message && (
            <p style={{ color: 'red', marginTop: '8px' }}>{state.message}</p>
          )}
          
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting} color="inherit">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            Guardar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

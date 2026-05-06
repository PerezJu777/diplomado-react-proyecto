import { useState, useEffect, useCallback } from 'react';
import { 
  Fab, Typography, Container,
  List, ListItem, ListItemText, IconButton, Chip, Paper, Box, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { TaskModal } from './TaskModal';
import { env } from '../../config/env';
import type { Task } from '../../models';

import { useAlert, useAuth, useAxios } from '../../hooks';

export const TaskPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const { token } = useAuth();
  const axios = useAxios();
  const { showAlert } = useAlert();

  const fetchTasks = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await axios.get(`${env.API_URL}/tasks`, {
        params: { limit: 100 } // Fetch more tasks if needed
      });
      setTasks(response.data.data);
    } catch (err: unknown) {
      console.error('Error al cargar tareas:', err);
      showAlert((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Error al cargar las tareas', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, axios, showAlert]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTasks();
  }, [fetchTasks]);

  const handleOpenModal = (task?: Task) => {
    setTaskToEdit(task || null);
    setModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setTaskToEdit(null);
    setModalOpen(false);
  };



  const handleDeleteTask = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar esta tarea?')) return;
    try {
      await axios.delete(`${env.API_URL}/tasks/${id}`);
      setTasks((prev) => prev.filter(t => t.id !== id));
      showAlert('Tarea eliminada correctamente', 'success');
    } catch (err: unknown) {
      showAlert((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Error al eliminar la tarea', 'error');
    }
  };

  const handleToggleStatus = async (task: Task) => {
    try {
      await axios.patch(`${env.API_URL}/tasks/${task.id}`, 
        { done: !task.done }
      );
      // Update local state directly for fast feedback
      setTasks((prev) => prev.map(t => t.id === task.id ? { ...t, done: !t.done } : t));
    } catch (err: unknown) {
      showAlert((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Error al cambiar el estado', 'error');
    }
  };

  return (
    <Container sx={{ py: 4, position: 'relative', minHeight: '80vh' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Mis Tareas
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : tasks.length > 0 ? (
        <Paper elevation={2} sx={{ mt: 3, p: 2 }}>
          <List>
            {tasks.map((task) => (
              <ListItem
                key={task.id}
                divider
                secondaryAction={
                  <Box>
                    <IconButton edge="end" aria-label="edit" onClick={() => handleOpenModal(task)} sx={{ mr: 1, color: 'primary.main' }}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteTask(task.id)} sx={{ color: 'error.main' }}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <IconButton edge="start" onClick={() => handleToggleStatus(task)} sx={{ mr: 2 }}>
                  {task.done ? <CheckCircleIcon color="success" /> : <RadioButtonUncheckedIcon color="action" />}
                </IconButton>
                
                <ListItemText
                  primary={
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        textDecoration: task.done ? 'line-through' : 'none',
                        color: task.done ? 'text.secondary' : 'text.primary',
                        fontWeight: task.done ? 'normal' : 'medium'
                      }}
                    >
                      {task.name}
                    </Typography>
                  }
                  secondary={
                    <Chip 
                      label={task.done ? "FINALIZADA" : "PENDIENTE"} 
                      size="small" 
                      color={task.done ? "success" : "warning"}
                      variant={task.done ? "filled" : "outlined"}
                      sx={{ mt: 0.5 }}
                    />
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      ) : (
        <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>No hay tareas creadas. Añade una para comenzar.</Typography>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={() => handleOpenModal()}
        sx={{ position: 'fixed', bottom: 32, right: 32 }}
      >
        <AddIcon />
      </Fab>

      {/* Add/Edit Task Modal */}
      <TaskModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSuccess={fetchTasks}
        taskToEdit={taskToEdit}
      />

    </Container>
  );
};
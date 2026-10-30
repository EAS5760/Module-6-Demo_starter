import { useState } from 'react';
import { Alert, Box, Button, Chip, Container, Divider, Stack, TextField, Typography } from '@mui/material';
import { TaskGrid } from './components/TaskGrid';
import { ResponsiveSummary } from './components/ResponsiveSummary';
import { apiRequest, useApi } from './api';

const sampleTasks = [
  { _id: 'sample-1', title: 'Prepare the responsive layout', completed: false },
  { _id: 'sample-2', title: 'Review the Task API', completed: true },
  { _id: 'sample-3', title: 'Record the coding demos', completed: false }
];
export function App() {
  const [tasks, setTasks] = useState(useApi ? [] : sampleTasks);
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [register, setRegister] = useState(false);
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const completed = tasks.filter(task => task.completed).length;

  async function action(work) {
    setBusy(true); setError('');
    try { await work(); }
    catch (err) {
      setError(err.message);
      if (err.status === 401) { setToken(''); setTasks([]); }
    } finally { setBusy(false); }
  }
  const refresh = async (currentToken = token) => {
    setTasks(await apiRequest('/tasks', { token: currentToken }));
  };
  const authenticate = event => {
    event.preventDefault();
    action(async () => {
      if (register) await apiRequest('/register', { method: 'POST', body: { email, password } });
      const data = await apiRequest('/login', { method: 'POST', body: { email, password } });
      setToken(data.token); setPassword('');
      await refresh(data.token);
    });
  };
  const addTask = event => {
    event.preventDefault();
    action(async () => {
      if (useApi) {
        await apiRequest('/tasks', { method: 'POST', token, body: { title } });
        await refresh();
      } else {
        const cleanTitle = title.trim();
        if (!cleanTitle || cleanTitle.length > 100) throw new Error('Use a title with 1–100 characters.');
        setTasks(current => [...current, { _id: crypto.randomUUID(), title: cleanTitle, completed: false }]);
      }
      setTitle('');
    });
  };
  const toggleTask = task => action(async () => {
    if (useApi) {
      await apiRequest(`/tasks/${task._id}`, { method: 'PATCH', token, body: { completed: !task.completed } });
      await refresh();
    } else setTasks(current => current.map(item => item._id === task._id ? { ...item, completed: !item.completed } : item));
  });
  const deleteTask = task => action(async () => {
    if (useApi) {
      await apiRequest(`/tasks/${task._id}`, { method: 'DELETE', token });
      await refresh();
    } else setTasks(current => current.filter(item => item._id !== task._id));
  });
  const ready = !useApi || Boolean(token);
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box component="header" sx={{ mb: 4 }}>
        <Typography variant="overline" sx={{ letterSpacing: 2 }}>A little progress, every day</Typography>
        <Typography component="h1" variant="h3" sx={{ fontWeight: 700, mb: 1 }}>My Task Dashboard</Typography>
        <Typography color="text.secondary">Make space for what comes next.</Typography>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} role="alert">{error}</Alert>}
      {useApi && !token && <Box component="form" onSubmit={authenticate} sx={{ mb: 4, maxWidth: 420 }}>
        <Typography component="h2" variant="h5" sx={{ mb: 2 }}>{register ? 'Create an account' : 'Welcome back'}</Typography>
        <Stack spacing={2}>
          <TextField label="Email" type="email" required value={email} autoComplete="email" onChange={e => setEmail(e.target.value)} />
          <TextField label="Password" type="password" required value={password} autoComplete={register ? 'new-password' : 'current-password'} onChange={e => setPassword(e.target.value)} inputProps={{ minLength: 8 }} />
          <Button type="submit" variant="contained" disabled={busy}>{register ? 'Register and sign in' : 'Sign in'}</Button>
          <Button type="button" onClick={() => setRegister(value => !value)} disabled={busy}>{register ? 'Already have an account? Sign in' : 'Create an account'}</Button>
        </Stack>
      </Box>}
      {ready && <>
        <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <Chip label={`${tasks.length - completed} upcoming`} /><Chip label={`${completed} completed`} variant="outlined" />
          {useApi && <Button disabled={busy} onClick={() => action(() => refresh())}>Refresh</Button>}
          {useApi && <Button disabled={busy} onClick={() => { setToken(''); setTasks([]); }}>Sign out</Button>}
        </Stack>
        <Box component="form" onSubmit={addTask} sx={{ mb: 4 }}>
          <Stack spacing={2}>
            <TextField label="New task" value={title} onChange={e => setTitle(e.target.value)} required inputProps={{ maxLength: 100 }} fullWidth />
            <Button type="submit" variant="contained" disabled={busy} sx={{ alignSelf: 'flex-start' }}>Add task</Button>
          </Stack>
        </Box>
        <Typography component="h2" variant="h5" sx={{ mb: 2 }}>Your tasks</Typography>
        <TaskGrid tasks={tasks} busy={busy} onToggle={toggleTask} onDelete={deleteTask} />
      </>}
      <Divider sx={{ mt: 4 }} />
      <ResponsiveSummary />
    </Container>
  );
}

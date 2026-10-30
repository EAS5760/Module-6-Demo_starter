import { Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';

export function TaskGrid({ tasks, busy, onToggle, onDelete }) {
  if (tasks.length === 0) return <Typography>No tasks yet. Add your first task above.</Typography>;
  return (
    <Grid container spacing={2}>
      {tasks.map(task => (
        // DEMO 2 TODO: change size to {{ xs: 12, sm: 6, md: 4 }}.
        <Grid
  key={task._id}
  size={{ xs: 12, sm: 6, md: 4 }}
>
          <Card
  variant="outlined"
  sx={{
    height: "100%",
    bgcolor: {
      xs: "primary.light",
      md: "background.paper"
    }
  }}
>
            {/* DEMO 2 TODO: responsive padding: p: { xs: 2, md: 3 }. */}
            <CardContent
  sx={{
    p: { xs: 2, md: 3 }
  }}
>
              <Chip size="small" label={task.completed ? 'Completed' : 'Upcoming'}
                color={task.completed ? 'success' : 'default'} sx={{ mb: 2 }} />
              <Typography component="h3" variant="h6" sx={{ overflowWrap: 'anywhere' }}>{task.title}</Typography>
              <Box sx={{ mt: 3 }}>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  <Button size="small" disabled={busy} onClick={() => onToggle(task)}>
                    {task.completed ? 'Mark upcoming' : 'Mark complete'}
                  </Button>
                  <Button size="small" color="error" disabled={busy} onClick={() => onDelete(task)}>Delete</Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

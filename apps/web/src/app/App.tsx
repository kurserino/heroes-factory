import { CssBaseline, Container, ThemeProvider, Typography, createTheme } from '@mui/material';
import { HeroList } from '../features/heroes/components/HeroList';

const theme = createTheme();

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Hero Management
        </Typography>
        <HeroList />
      </Container>
    </ThemeProvider>
  );
}

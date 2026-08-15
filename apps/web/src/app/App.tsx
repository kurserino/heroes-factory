import { CssBaseline, Container, ThemeProvider, Typography, createTheme } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/pt-br';
import { HeroList } from '../features/heroes/components/HeroList';

const theme = createTheme({
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
  palette: {
    primary: {
      main: '#002aad',
    },
    error: {
      main: '#d82e3d',
    },
    background: {
      default: '#faf4f0',
      paper: '#ffffff',
    },
  },
  components: {
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 999,
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': {
            color: '#4568c5',
          },
          '&.Mui-checked + .MuiSwitch-track': {
            backgroundColor: '#4568c5',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
      variants: [
        {
          props: { variant: 'outlined' },
          style: ({ theme }) => ({
            borderColor: theme.palette.grey[400],
            color: theme.palette.grey[700],
            '&:hover': {
              borderColor: theme.palette.grey[600],
              backgroundColor: theme.palette.grey[50],
            },
          }),
        },
      ],
    },
  },
});

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider
        dateAdapter={AdapterDayjs}
        adapterLocale="pt-br"
        localeText={{ fieldYearPlaceholder: () => 'AAAA' }}
      >
        <CssBaseline />
        <Container
          maxWidth="xl"
          sx={{ py: 4, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
        >
          <Typography variant="h4" component="h1" color="primary" align="center" gutterBottom>
            Heróis
          </Typography>
          <HeroList />
        </Container>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

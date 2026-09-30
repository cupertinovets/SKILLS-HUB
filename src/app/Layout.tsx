import {
  AppBar,
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CategoryIcon from '@mui/icons-material/Category';
import SavingsIcon from '@mui/icons-material/Savings';
import RepeatIcon from '@mui/icons-material/Repeat';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { NavLink, Outlet } from 'react-router-dom';

const DRAWER_WIDTH = 240;

const NAV_ITEMS = [
  { to: '/', label: 'Дашборд', icon: <DashboardIcon /> },
  { to: '/transactions', label: 'Операции', icon: <ReceiptLongIcon /> },
  { to: '/categories', label: 'Категории', icon: <CategoryIcon /> },
  { to: '/budgets', label: 'Бюджеты', icon: <SavingsIcon /> },
  { to: '/recurring', label: 'Повторяющиеся', icon: <RepeatIcon /> },
  { to: '/settings', label: 'Настройки', icon: <SettingsIcon /> },
];

export function Layout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        color="default"
        sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}
        elevation={0}
      >
        <Toolbar>
          <AccountBalanceWalletIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="div">
            Трекер доходов и расходов
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Divider />
        <List>
          {NAV_ITEMS.map((item) => (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              end={item.to === '/'}
              sx={{
                '&.active': {
                  bgcolor: 'action.selected',
                  color: 'primary.main',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: `calc(100% - ${DRAWER_WIDTH}px)` }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}

import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Container,
  ListItemButton,
  Toolbar, // Import Toolbar
  AppBar, // Import AppBar
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import ListIcon from '@mui/icons-material/List';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AddBoxIcon from '@mui/icons-material/AddBox';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { Margin } from '@mui/icons-material';

interface LayoutProps {
  children: React.ReactNode;
}

const drawerWidth = 240;

const menuItems = [
  { text: 'Coins', icon: <AttachMoneyIcon />, path: '/' },
  { text: 'Transactions', icon: <ListIcon />, path: '/transactions' },
  { text: 'Add Coin', icon: <AddBoxIcon />, path: '/add-coin' },
  { text: 'Add Transaction', icon: <AccountBalanceWalletIcon />, path: '/add-transaction' },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
       <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            CryptoTracker
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar /> {/* Thêm Toolbar vào đây */}
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                selected={location.pathname === item.path}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: `${drawerWidth}px`, // Thêm marginLeft bằng chiều rộng Drawer
          mt: `50px`
        }}
      >
          <Container maxWidth="lg" >
            {children}
          </Container>
        </Box>

        <Box component="footer" sx={{ p: 2, bgcolor: 'background.paper', width: '100%' }}>
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} CryptoTracker. All rights reserved.
          </Typography>
        </Box>
    </Box>
  );
};

export default Layout;
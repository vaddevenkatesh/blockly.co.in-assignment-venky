import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Search from '@mui/icons-material/Search';
import Notifications from '@mui/icons-material/Notifications';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import TextField from '@mui/material/TextField';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { keyframes } from '@emotion/react';
import { styled } from '@mui/material/styles';

// Define keyframe animations
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideIn = keyframes`
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
`;

// Styled components
const AnimatedTypography = styled(Typography)`
  animation: ${fadeIn} 1s ease-out;
`;

const AnimatedDrawer = styled(Drawer)`
  animation: ${slideIn} 0.5s ease-out;
`;

function Header({ title }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const toggleDrawer = (open) => () => {
        setDrawerOpen(open);
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="sticky" sx={{ transition: 'background-color 0.3s ease' }}>
                <Toolbar>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            sx={{ mr: 2 }}
                            onClick={toggleDrawer(true)}
                        >
                            <MenuIcon />
                        </IconButton>

                        <AnimatedDrawer
                            anchor='left'
                            open={drawerOpen}
                            onClose={toggleDrawer(false)}
                        >
                            <List>
                                <ListItem button>Home</ListItem>
                                <ListItem button>About</ListItem>
                                <ListItem button>Contact</ListItem>
                                {/* Add more items as needed */}
                            </List>
                        </AnimatedDrawer>

                        <AnimatedTypography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            {title}
                        </AnimatedTypography>
                    </Box>

                    <TextField
                        variant="outlined"
                        size="small"
                        placeholder="Search…"
                        sx={{ mr: 2, bgcolor: 'background.paper' }}
                        InputProps={{
                            startAdornment: (
                                <IconButton sx={{ p: 1 }}>
                                    <Search />
                                </IconButton>
                            ),
                        }}
                    />

                    <IconButton
                        size="large"
                        aria-label="notifications"
                        color="inherit"
                        sx={{ mr: 2 }}
                    >
                        <Notifications />
                    </IconButton>

                    <IconButton
                        size="large"
                        aria-label="account of current user"
                        aria-controls="menu-appbar"
                        aria-haspopup="true"
                        onClick={handleMenu}
                        color="inherit"
                    >
                        <AccountCircle />
                    </IconButton>

                    <Menu
                        id="menu-appbar"
                        anchorEl={anchorEl}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                    >
                        <MenuItem onClick={handleClose}>Profile</MenuItem>
                        <MenuItem onClick={handleClose}>My account</MenuItem>
                        <MenuItem onClick={handleClose}>Logout</MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>
        </Box>
    );
}

export default Header;

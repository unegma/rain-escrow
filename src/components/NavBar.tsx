import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Web3ConnectionButtons from '../components/Web3ConnectionButtons';

export default function NavBar({string}: {string?: string}) {
  return (
    <Box component="div" sx={{ flexGrow: 1 }} className="navBar" >
      <AppBar position="fixed" color="transparent">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {!string ? 'Rain Protocol Escrow' : string}
          </Typography>
          <Web3ConnectionButtons className='connect-button' />
        </Toolbar>
      </AppBar>
    </Box>
  )
}

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Modal as ModalMaterial } from '@mui/material';
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import Console from '../various/Console';
import Warning from "../various/Warning";
import {TransactionsChartClaim} from "../various/TransactionsChartClaim";

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

type modalProps = {
  modalOpen: boolean, setModalOpen: any, buttonLock: any,
  initiateClaim: any,
  consoleData: string,
  consoleColor: string
}

export default function EscrowClaimModal({
    modalOpen, setModalOpen,
    buttonLock,
    initiateClaim, consoleData, consoleColor
  } : modalProps )
{
  function handleClose() {
    setModalOpen(false)
  }

  return (
      <ModalMaterial
        open={modalOpen}
        onClose={handleClose}
        className="the-modal"
      >
        <Box component="div" sx={style}>
          <HighlightOffIcon className="closeModalButton" onClick={() => { setModalOpen(false)}}/>
          <br/>

          <TransactionsChartClaim /> <br/>
          <Warning /><br/>
          <Console consoleData={consoleData} consoleColor={consoleColor} /><br/>

          <div className="buttons-box">
            <Button disabled={buttonLock} className="fifty-percent-button" variant="outlined" onClick={() => {setModalOpen(false)}}>Close</Button>
            <Button disabled={buttonLock} className="fifty-percent-button" variant="contained" onClick={initiateClaim}>Get Tokens!</Button>
          </div>

        </Box>
      </ModalMaterial>
  );
}

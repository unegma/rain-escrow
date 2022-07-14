import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Modal as ModalMaterial } from '@mui/material';
import {Bar} from "react-chartjs-2";

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '30vw',
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

export default function Modal({
    modalOpen, setModalOpen,
    buttonLock,
    initiateClaim, consoleData, consoleColor
  } : modalProps )
{


  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Upcoming Transaction Cost Ratios (Estimated MATIC Ratios based on costs at: 2022-05-30T15:32:44Z)',
      },
    },
  };


  const data = {
    labels: [`Tx1: Claim Tokens`],
    datasets: [
      {
        label: '',
        data: [1],
        backgroundColor: 'rgba(0, 0, 0, 0)',
      },
      {
        label: '',
        data: [0.00927434], // todo base it on dynamic matic costs
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: '',
        data: [1],
        backgroundColor: 'rgba(0, 0, 0, 0)',
      }
    ],
  };

  function handleClose() {
    setModalOpen(false)
  }

  return (
      <ModalMaterial
        open={modalOpen}
        onClose={handleClose}
      >
        <Box component="div" sx={style}>
          <br/>
          <Bar options={options} data={data} />
          <br/>

          { consoleColor === 'red' && (
            <Typography className="modalTextRed">{consoleData}</Typography>
          )}

          { consoleColor === 'green' && (
            <Typography className="modalTextGreen">{consoleData}</Typography>
          )}

          <br/>

          <div className="buttons-box">
            <Button disabled={buttonLock} className="fifty-percent-button" variant="outlined" onClick={() => {setModalOpen(false)}}>Close</Button>
            <Button disabled={buttonLock} className="fifty-percent-button" variant="contained" onClick={initiateClaim}>Get Tokens!</Button>
          </div>

        </Box>
      </ModalMaterial>
  );
}

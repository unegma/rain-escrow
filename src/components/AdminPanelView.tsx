import NavBar from "./NavBar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Input from "@mui/material/Input";
import Button from "@mui/material/Button";
import {Bar} from "react-chartjs-2";
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// const displayedImage = 'https://assets.unegma.net/unegma.work/rain-shoe-sale.unegma.work/shoe-voucher.jpg'
const displayedImage = 'https://assets.unegma.net/unegma.work/rain-erc20-faucet.unegma.work/faucet.jpg';

type adminPanelProps = {
  adminConfigPage: number
  reserveName: string, handleChangeReserveName: any,
  reserveSymbol: string, handleChangeReserveSymbol: any,
  reserveInitialSupply: any, handleChangeReserveInitialSupply: any,
  resetToDefault: any, setAdminConfigPage: any,
  buttonLock: any, deployToken: any
}

export default function AdminPanelView({
  adminConfigPage,
  reserveName, handleChangeReserveName,
  reserveSymbol, handleChangeReserveSymbol,
  reserveInitialSupply, handleChangeReserveInitialSupply,
  resetToDefault, setAdminConfigPage,
  buttonLock, deployToken
  } : adminPanelProps)
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
        text: 'Upcoming Transaction Costs (Estimated MATIC)',
      },
    },
  };

  const data = {
    labels: ['Tx1: Deploy Token'],
    datasets: [
      {
        label: '',
        data: [1],
        backgroundColor: 'rgba(0, 0, 0, 0)',
      },
      {
        label: '',
        data: [0.01268265], // todo base it on dynamic matic costs
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: '',
        data: [1],
        backgroundColor: 'rgba(0, 0, 0, 0)',
      }
    ],
  };

  return (
    <>
      <NavBar />

      <Box
        className="admin-form"
        component="form"
        sx={{
          '& > :not(style)': { m: 1 },
        }}
        noValidate
        autoComplete="off"
      >

        <Typography variant="h4" component="h2" color="black" align="center">
          Configure Faucet Deployment
        </Typography>
        <Typography color="black" align="center">
          A Short Demo of a Rain Protocol ERC20 Faucet
        </Typography>

        <Typography color="black" align="center">
          <a href="https://rain-shoe-sale.unegma.work" target="_blank">These can be used as 'Reserve Tokens' here</a>
        </Typography>

        <img hidden={!(adminConfigPage !== 1)} className="mainImage" src={displayedImage} alt="#" />

        { adminConfigPage === 0 && (
          <>
            <Typography variant="h5" component="h3" color="black">
              (Page 1/2)
            </Typography>

            <FormControl variant="standard">
              <InputLabel className="input-box-label" htmlFor="component-helper">Reserve Token Name</InputLabel>
              <Input
                id="component-helper"
                value={reserveName}
                onChange={handleChangeReserveName}
              />
            </FormControl>


            <FormControl variant="standard">
              <InputLabel className="input-box-label" htmlFor="component-helper">Reserve Token Symbol</InputLabel>
              <Input
                id="component-helper"
                value={reserveSymbol}
                onChange={handleChangeReserveSymbol}
              />
            </FormControl>

            <FormControl variant="standard">
              <InputLabel className="input-box-label" htmlFor="component-helper">Amount a Faucet User will Receive</InputLabel>
              <Input
                id="component-helper"
                value={reserveInitialSupply}
                onChange={handleChangeReserveInitialSupply}
              />
            </FormControl>

            <div className="buttons-box">
              <Button className="fifty-percent-button" variant="outlined" onClick={() => {resetToDefault()}}>Reset</Button>
              <Button className="fifty-percent-button" variant="contained" onClick={() => {setAdminConfigPage(adminConfigPage+1)}}>Next</Button>
            </div>
          </>
        )}

        { adminConfigPage === 1 && (
          <>
            <Bar options={options} data={data} />;

            <Typography variant="h5" component="h3" color="black">
              (Page 2/2)
            </Typography>

            <Typography color="red">
              Please make sure you are connected to Mumbai Matic testnet.
            </Typography>

            <Typography color="black">
              Ratios and costs based on tests taken around the following time: 2022-06-29T05:50:00Z
            </Typography>


            <Typography color="black">
              Please be aware, this example does not have strict checking, and so you will not recover the cost of network fees (gas) if a deployment fails.
            </Typography>

            <div className="buttons-box">
              <Button className="fifty-percent-button" variant="outlined" onClick={() => {setAdminConfigPage(adminConfigPage-1)}}>Previous</Button>
              <Button className="fifty-percent-button" disabled={buttonLock} variant="contained" onClick={() => {deployToken()}}>Deploy</Button>
            </div>
          </>
        )}
      </Box>
    </>
  )
}

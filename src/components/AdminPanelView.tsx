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

const displayedImage = 'https://assets.unegma.net/unegma.work/rain-escrow-example.unegma.work/vault.jpg';

type adminPanelProps = {
  adminConfigPage: number, setAdminConfigPage: any, resetToDefault: any
  saleAddress: string, handleChangeSaleAddress: any,
  tokenName: string, handleChangeTokenName: any,
  tokenSymbol: string, handleChangeTokenSymbol: any,
  // tokenInitialSupply: any, handleChangeTokenInitialSupply: any,
  // , setAdminConfigPage: any,
  buttonLock: any, deploy: any
}

export default function AdminPanelView({
  adminConfigPage, setAdminConfigPage, resetToDefault,
  saleAddress, handleChangeSaleAddress,
  tokenName, handleChangeTokenName,
  tokenSymbol, handleChangeTokenSymbol,
  // tokenInitialSupply, handleChangeTokenInitialSupply,
  // , setAdminConfigPage,
  buttonLock, deploy
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
          Configure Escrow Deposit
        </Typography>
        <Typography color="black" align="center">
          A Short Demo of Rain Protocol Escrow Usage
        </Typography>

        <Typography color="black" align="center">
          This demo can be used for distributing extra tokens to those who participated in a <a href="https://rain-shoe-sale.unegma.work" target="_blank">Rain Sale such as this one</a>
        </Typography>

        <img hidden={!(adminConfigPage !== 1)} className="mainImage" src={displayedImage} alt="#" />

        { adminConfigPage === 0 && (
          <>
            <Typography variant="h5" component="h3" color="black">
              (Page 1/2)
            </Typography>

            <FormControl variant="standard">
              <InputLabel className="input-box-label" htmlFor="component-helper">Sale to Link to</InputLabel>
              <Input
                id="component-helper"
                value={saleAddress}
                onChange={handleChangeSaleAddress}
              />
            </FormControl>


            <FormControl variant="standard">
              <InputLabel className="input-box-label" htmlFor="component-helper">Token (to give to Sale participants) Name</InputLabel>
              <Input
                id="component-helper"
                value={tokenName}
                onChange={handleChangeTokenName}
              />
            </FormControl>

            <FormControl variant="standard">
              <InputLabel className="input-box-label" htmlFor="component-helper">Token (to give to Sale participants) Symbol</InputLabel>
              <Input
                id="component-helper"
                value={tokenSymbol}
                onChange={handleChangeTokenSymbol}
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
              <Button className="fifty-percent-button" disabled={buttonLock} variant="contained" onClick={() => {deploy()}}>Deploy</Button>
            </div>
          </>
        )}
      </Box>
    </>
  )
}

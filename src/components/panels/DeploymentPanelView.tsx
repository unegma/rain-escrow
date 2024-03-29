import styled from 'styled-components';
import NavBar from "../layout/NavBar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Input from "@mui/material/Input";
import Button from "@mui/material/Button";
import React from "react";
import Warning from "../various/Warning";
import {TransactionsChartDeploy} from "../various/TransactionsChartDeploy";
const ESCROW_EXAMPLE = process.env.REACT_APP_ESCROW_EXAMPLE;

const GITHUB_LINK = process.env.REACT_APP_GITHUB_URL;
const SALE_BASE_URL = process.env.REACT_APP_SALE_BASE_URL;
const CDN_BASE_URL = process.env.REACT_APP_CDN_BASE_URL;

const displayedImage = `${CDN_BASE_URL}/ticket.png?h=1`;
const ImageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: black;
  position: relative;
  
  p {
    text-align: center;
    display: block;
    position: absolute;
    color: black;
    font-size: 70%;
    padding-left: 5%;
  }
  
  .mini {
    font-size: 50%;
  }
`

type adminPanelProps = {
  adminConfigPage: number, setAdminConfigPage: any, resetToDefault: any
  saleAddress: string, handleChangeSaleAddress: any,
  tokenName: string, handleChangeTokenName: any,
  tokenSymbol: string, handleChangeTokenSymbol: any,
  saleTokenSymbol: string, saleName: string, buttonLock: any, deploy: any
}

// todo rename from admin panel
export default function DeploymentPanelView({
  adminConfigPage, setAdminConfigPage, resetToDefault,
  saleAddress, handleChangeSaleAddress,
  tokenName, handleChangeTokenName,
  tokenSymbol, handleChangeTokenSymbol, saleTokenSymbol, saleName,
  buttonLock, deploy
  } : adminPanelProps)
{

  return (
    <>
      <NavBar string={`Configure Escrow`} />
      <p className={'github github--firstview'}><a href={`${GITHUB_LINK}`} target="_blank">(Github Link)</a></p>

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
          Configure Escrow
        </Typography>

        { adminConfigPage !== 1 && (
          <>
            <Typography color="black" align="center">
              <a className="bullet" href="https://youtu.be/4aIbUDuW9CM" target="_blank">Rain Protocol Examples Intro Video</a><br/>
              <a className="bullet" href="https://docs.rainprotocol.xyz">Docs at: docs.rainprotocol.xyz</a><br/>
              <a className="bullet" href={`${ESCROW_EXAMPLE}`} target="_blank">Example Escrow: inStore15PercentOffVoucher (iSV15)</a>

              <br/><br/>
            </Typography>

            <hr/>

            <Typography color="black" align="center">
              <a href={`${SALE_BASE_URL}/${saleAddress}`} target="_blank">Holders of '{saleTokenSymbol}'</a> will be able to claim new Tokens configured on this panel.<br/>
              (<b className='red'><a className='red' href={`${SALE_BASE_URL}/${saleAddress}`} target="_blank">{saleName} Sale</a> must have ended successfully</b>, <a className='red' href={`${SALE_BASE_URL}/${saleAddress}/dashboard`} target="_blank">see Sale Dashboard</a>).
            </Typography>

            <hr/>

            <ImageContainer className="display-image">
              <img hidden={!(adminConfigPage !== 1)} className="mainImage" src={displayedImage} alt="#" />
              <p>{tokenSymbol}<br/>Token<br/><span className='mini'>{tokenName}</span></p>
            </ImageContainer>
          </>
        )}


        { adminConfigPage === 0 && (
          <>
            <Typography variant="h5" component="h3" color="black">
              (Page 1/2)
            </Typography>

            <FormControl variant="standard">
              <InputLabel className="input-box-label" htmlFor="component-helper">Sale Address ({saleName} Sale) <a className='red' href={`${SALE_BASE_URL}/${saleAddress}/dashboard`} target="_blank"><b className="red">(must have ended successfully)</b></a></InputLabel>
              <Input
                id="component-helper"
                value={saleAddress}
                onChange={handleChangeSaleAddress}
              />
            </FormControl>


            <FormControl variant="standard">
              <InputLabel className="input-box-label" htmlFor="component-helper">Token Name</InputLabel>
              <Input
                id="component-helper"
                value={tokenName}
                onChange={handleChangeTokenName}
              />
            </FormControl>

            <FormControl variant="standard">
              <InputLabel className="input-box-label" htmlFor="component-helper">Token Symbol (claimable by {saleTokenSymbol} holders)</InputLabel>
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
            <TransactionsChartDeploy />

            <Typography variant="h5" component="h3" color="black">
              (Page 2/2)
            </Typography>

            <Warning />

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

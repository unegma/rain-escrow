import React, {useEffect, useState} from 'react';
import {
  Route, Routes
} from "react-router-dom";
import {Signer} from "ethers";
import {CircularProgress} from "@mui/material";
import DeploymentPanelView from "./components/panels/DeploymentPanelView";
import ClaimView from "./components/panels/ClaimView";
import EscrowDashboardView from "./components/panels/EscrowDashboardView";
import {useWeb3React} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import {getDataFromSubgraph, getSaleData} from "../src/helpers/subgraphCalls";
import {deploy, initiateClaim} from "./helpers/web3Functions";

/**
 * App
 */
function App() {

  /** State Config **/

  const context = useWeb3React<Web3Provider>(); // todo check because this web3provider is from ethers
  const { connector, library, chainId, account, activate, deactivate, active, error }: any = context;

  // high level
  const [signer, setSigner] = useState<Signer|undefined>(undefined);
  const [escrowAddress, setEscrowAddress] = React.useState(""); // this is now retrieved from the url
  const [claimComplete, setClaimComplete] = React.useState(false);
  const [consoleData, setConsoleData] = React.useState("");
  const [consoleColor, setConsoleColor] = React.useState('red');

  // page controls
  const [buttonLock, setButtonLock] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adminConfigPage, setAdminConfigPage] = useState(0);
  const [claimView, setClaimView] = React.useState(false); // show claim or admin view (if there is a claim address in the url)
  const [modalOpen, setModalOpen] = React.useState(false);

  // all these from .env will be replaced by calls to blockchain within the getTokenData function when faucetView is set to true
  const [saleAddress, setSaleAddress] = React.useState(process.env.REACT_APP_SALE_ADDRESS as string);
  const [tokenInitialSupply, setTokenInitialSupply] = useState(process.env.REACT_APP_TOKEN_INITIAL_SUPPLY as string);
  const [tokenDecimals, setTokenDecimals] = useState(process.env.REACT_APP_TOKEN_ERC20_DECIMALS as string);
  const [tokenName, setTokenName] = React.useState(process.env.REACT_APP_TOKEN_NAME as string);
  const [tokenSymbol, setTokenSymbol] = React.useState(process.env.REACT_APP_TOKEN_SYMBOL as string);

  // // a bit isolated because not taken from .env and only used in the Claim (and got from getSaleData())
  const [tokenAddress, setTokenAddress] = useState("");
  const [depositorAddress, setDepositorAddress] = useState("");
  const [subgraphData, setSubgraphData] = useState(undefined);
  const [saleName, setSaleName] = useState("");
  const [saleTokenSymbol, setSaleTokenSymbol] = useState("");

  // these must be the same as the above in .env
  function resetToDefault() {
    setSaleAddress(process.env.REACT_APP_SALE_ADDRESS as string);
    setTokenDecimals(process.env.REACT_APP_TOKEN_ERC20_DECIMALS as string);
    setTokenInitialSupply(process.env.REACT_APP_TOKEN_INITIAL_SUPPLY as string);
    setTokenName(process.env.REACT_APP_TOKEN_NAME as string);
    setTokenSymbol(process.env.REACT_APP_TOKEN_SYMBOL as string);
  }

  /** UseEffects **/

  // run once on render and check url parameters
  useEffect(() => {
    let queryString = new URLSearchParams(window.location.search);
    let eParam = queryString.get('e');
    let sParam = queryString.get('s');
    let dParam = queryString.get('d');
    let tParam = queryString.get('t');

    if (
      (typeof sParam !== 'undefined' && sParam) &&
      (typeof dParam !== 'undefined' && dParam) &&
      (typeof tParam !== 'undefined' && tParam)
    ) {
      // TODO MIGHT NOT BE THE DEPOSITOR ADDRESS
      console.log(`escrowAddress is ${eParam}, saleAddress is ${sParam}, depositorAddress is ${dParam}, tokenAddress is ${tParam}`) // why logged twice: https://stackoverflow.com/questions/60971185/why-does-create-react-app-initialize-twice

      setClaimView(true);
      setSaleAddress(sParam);
      setDepositorAddress(dParam);
      setTokenAddress(tParam);
    }

    if (
      (typeof sParam !== 'undefined' && sParam)
    ) {
      setSaleAddress(sParam);
    }
  },[]);

  useEffect(() => {
    if (escrowAddress && signer) {
      getDataFromSubgraph(
        claimView, escrowAddress, saleAddress, depositorAddress, tokenAddress, setClaimView, setButtonLock, setLoading,
        subgraphData, setSubgraphData
      );
    }
  },[escrowAddress, saleAddress, depositorAddress, tokenAddress, claimView]);

  useEffect(() => {
    setSigner(library?.getSigner());
  }, [library, account]);

  useEffect(() => {
    getSaleData(saleAddress,setSaleName,setSaleTokenSymbol);
  },[saleAddress]);

  /** Handle Form Inputs **/

  const handleChangeSaleAddress = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSaleAddress(event.target.value);
  }
  const handleChangeTokenName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTokenName(event.target.value);
  }
  const handleChangeTokenSymbol = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTokenSymbol(event.target.value);
  }

  /** View **/

  return (
    <div className="rootContainer">

      { loading && (
        <div className="deploying"><CircularProgress /></div>
      )}

      <Routes>
        <Route
          key={'home'}
          path="/"
          element={
            <DeploymentPanelView
              tokenName={tokenName}
              handleChangeTokenName={handleChangeTokenName} tokenSymbol={tokenSymbol}
              handleChangeTokenSymbol={handleChangeTokenSymbol} adminConfigPage={adminConfigPage}
              setAdminConfigPage={setAdminConfigPage} resetToDefault={resetToDefault} buttonLock={buttonLock}
              handleChangeSaleAddress={handleChangeSaleAddress} saleAddress={saleAddress}
              saleTokenSymbol={saleTokenSymbol} saleName={saleName}
              deploy={() => deploy(
                signer,account,setButtonLock,setLoading,tokenName,tokenSymbol,tokenInitialSupply,tokenDecimals,
                saleAddress
              )}
            />
          }
        />

        <Route
          key={'escrow'}
          path="/:id"
          element={
            <ClaimView
              consoleData={consoleData} consoleColor={consoleColor} modalOpen={modalOpen}
              setModalOpen={setModalOpen} buttonLock={buttonLock} tokenAddress={tokenAddress}
              setEscrowAddress={setEscrowAddress} claimView={claimView}
              initiateClaim={() => initiateClaim(
                signer, account, setButtonLock,setLoading,setConsoleData,setConsoleColor,setClaimComplete,tokenAddress
              )}
            />
          }
        />

        <Route
          key={'escrow-dashboard'}
          path="/:id/dashboard"
          element={
            <EscrowDashboardView
              setEscrowAddress={setEscrowAddress}
            />
          }
        />

        <Route
          path="*"
          element={
            <main style={{ padding: "1rem" }}>
              <p className='black'>There's nothing here!</p>
            </main>
          }
        />
      </Routes>

    </div>
  );
}

export default App;

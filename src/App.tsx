import React, {useEffect, useState} from 'react';
import {
  Route, Routes, useParams
} from "react-router-dom";
import {ethers, Signer} from "ethers";
import * as rainSDK from "rain-sdk";
import { connect } from "./connect.js"; // a very basic web3 connection implementation
import {CircularProgress} from "@mui/material";
import DeploymentPanelView from "./components/DeploymentPanelView";
import ClaimView from "./components/ClaimView";
import EscrowDashboardView from "./components/EscrowDashboardView";
import {useWeb3React} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";

declare var process : {
  env: {
    REACT_APP_CHAIN_ID: string
    REACT_APP_SALE_ADDRESS: string
    REACT_APP_TOKEN_NAME: string
    REACT_APP_TOKEN_SYMBOL: string
    REACT_APP_TOKEN_INITIAL_SUPPLY: string
    REACT_APP_TOKEN_ERC20_DECIMALS: string
    REACT_APP_BASE_URL: string
  }
}

const SUBGRAPH_ENDPOINT = rainSDK.AddressBook.getSubgraphEndpoint(parseInt(process.env.REACT_APP_CHAIN_ID));

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
  // const [showClaim, setShowClaim] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);

  // all these from .env will be replaced by calls to blockchain within the getTokenData function when faucetView is set to true
  const [saleAddress, setSaleAddress] = React.useState(process.env.REACT_APP_SALE_ADDRESS);
  const [tokenInitialSupply, setTokenInitialSupply] = useState(process.env.REACT_APP_TOKEN_INITIAL_SUPPLY);
  const [tokenDecimals, setTokenDecimals] = useState(process.env.REACT_APP_TOKEN_ERC20_DECIMALS);
  const [tokenName, setTokenName] = React.useState(process.env.REACT_APP_TOKEN_NAME);
  const [tokenSymbol, setTokenSymbol] = React.useState(process.env.REACT_APP_TOKEN_SYMBOL);

  // // a bit isolated because not taken from .env and only used in the Claim (and got from getSaleData())
  const [tokenAddress, setTokenAddress] = useState("");
  const [depositorAddress, setDepositorAddress] = useState("");
  const [subgraphData, setSubgraphData] = useState(undefined);

  // these must be the same as the above in .env
  function resetToDefault() {
    setSaleAddress(process.env.REACT_APP_SALE_ADDRESS);
    setTokenDecimals(process.env.REACT_APP_TOKEN_ERC20_DECIMALS);
    setTokenInitialSupply(process.env.REACT_APP_TOKEN_INITIAL_SUPPLY);
    setTokenName(process.env.REACT_APP_TOKEN_NAME);
    setTokenSymbol(process.env.REACT_APP_TOKEN_SYMBOL);
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
      // (typeof eParam !== 'undefined' && eParam) &&
      (typeof sParam !== 'undefined' && sParam) &&
      (typeof dParam !== 'undefined' && dParam) &&
      (typeof tParam !== 'undefined' && tParam)
    ) {
      // TODO MIGHT NOT BE THE DEPOSITOR ADDRESS
      console.log(`escrowAddress is ${eParam}, saleAddress is ${sParam}, depositorAddress is ${dParam}, tokenAddress is ${tParam}`) // why logged twice: https://stackoverflow.com/questions/60971185/why-does-create-react-app-initialize-twice

      setClaimView(true);
      // setEscrowAddress(eParam);
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

  // todo check this section because it is different in all frontends
  // this relies on the above
  useEffect(() => {
    // todo check this still works with new url parameter (NEWLY ADDED, MAY NOT BE NEEDED,, IE THE IF STATEMENT)
    if (escrowAddress && signer) {
      getDataFromSubgraph();
    }
  },[escrowAddress, saleAddress, depositorAddress, tokenAddress, claimView]);

  // // basic connection to web3 wallet
  // useEffect(() => {
  //   makeWeb3Connection(); // todo test what happens if not signed in
  // },[]);

  useEffect(() => {
    setSigner(library?.getSigner());
    // setAddress(account); // todo check that definitely not needed now
  }, [library, account]);

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
  const handleChangeTokenInitialSupply = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTokenInitialSupply(event.target.value);
  }

  /** Functions **/

  // async function makeWeb3Connection() {
  //   try {
  //     const {signer, address} = await connect(); // get the signer and account address using a very basic connection implementation
  //     setSigner(signer);
  //     setAddress(address);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }

  // todo remove this, it is all got from the subgraph
  // /**
  //  * Get Token Data from blockchain instead of .env
  //  * THIS WILL ALL BE AS IF THERE IS NO .ENV ON SALE LOAD
  //  */
  // async function getEscrowData() {
  //   try {
  //     // @ts-ignore
  //     // const escrowContract = new rainSDK.EmissionsERC20(tokenAddress, signer);
  //     // console.log(tokenContract);
  //
  //     // setReserveTokenAddress(reserve.address);
  //     // setReserveName(await tokenContract.name());
  //     // setReserveSymbol(await tokenContract.symbol());
  //     // setReserveDecimals((await tokenContract.decimals()).toString());
  //
  //     // console.log(`Shoes in Sale: ${amountOfShoes}`); // todo check if this changes when they are bought
  //     // setRedeemableInitialSupply(amountOfShoes.toString()); // TODO THIS SHOULD BE REMAINING SHOES NOT TOTAL SUPPLY
  //
  //     setShowClaim(true);
  //   } catch(err) {
  //     console.log('Error getting data', err);
  //   }
  // }

  /**
   * Deploy
   */
  async function deploy() {
    setButtonLock(true);
    setLoading(true);

    const emissionsERC20Config = {
      allowDelegatedClaims: false, // can mint on behalf of someone else
      erc20Config: {
        name: tokenName,
        symbol: tokenSymbol,
        distributor: account, // initialSupply is given to the distributor during the deployment of the emissions contract
        initialSupply: ethers.utils.parseUnits(process.env.REACT_APP_TOKEN_INITIAL_SUPPLY.toString(), process.env.REACT_APP_TOKEN_ERC20_DECIMALS), // TODO CHECK UNDERSTANDING HOW TO LIMIT CORRECTLY, AND TO WHERE THIS GOES ON DEPLOYING THE CONTRACT (distributor?)
      },
      vmStateConfig: {
        // setting to 0 will fix intitial supply when the claim function is called
        constants: [0], // mint 1 at a time (infinitely), if set to 10, will mint 10 at a time, no more no less (infinitely)
        sources: [
          ethers.utils.concat([
            rainSDK.utils.op(rainSDK.Sale.Opcodes.VAL, 0),
          ]),
        ],
        stackLength: 1,
        argumentsLength: 0,
      },
    };

    try {
      console.log(`Deploying and Minting ERC20 Token with the following parameters:`, emissionsERC20Config);
      // @ts-ignore
      const emissionsErc20 = await rainSDK.EmissionsERC20.deploy(signer, emissionsERC20Config);

      // todo claim function will mint another token (in addition to initial supply)??
      const emissionsERC20Address = emissionsErc20.address;

      console.log(`Result: deployed emissionsErc20, with address: ${emissionsERC20Address} and sent you ${process.env.REACT_APP_TOKEN_INITIAL_SUPPLY} tokens.`, emissionsErc20);
      console.log('Info: to see the tokens in your Wallet, add a new token with the address above..');

      console.log(`Info: Adding Token (${emissionsERC20Address}) to Escrow and linking to Sale (${saleAddress}).`);
      console.log('Info: be aware that, due to the open nature of blockchains, anyone can create an Escrow for any Sale.', 'orange');

      // @ts-ignore
      const redeemableERC20ClaimEscrow = await rainSDK.RedeemableERC20ClaimEscrow.get(saleAddress, emissionsERC20Address, signer);
      const escrowAddress = redeemableERC20ClaimEscrow.address;
      console.log(`Result: initialised redeemableERC20ClaimEscrow, with address ${escrowAddress}`);
      console.log(redeemableERC20ClaimEscrow);
      console.log(`Info: Connecting to ${emissionsERC20Config.erc20Config.name} ERC20 token (${emissionsERC20Address}) for approval of spend of ${process.env.REACT_APP_TOKEN_INITIAL_SUPPLY} ${emissionsERC20Config.erc20Config.symbol}`);
      const approveTransaction = await emissionsErc20.approve(
        redeemableERC20ClaimEscrow.address,
        ethers.utils.parseUnits(process.env.REACT_APP_TOKEN_INITIAL_SUPPLY.toString(), process.env.REACT_APP_TOKEN_ERC20_DECIMALS)
      );
      const approveReceipt = await approveTransaction.wait();
      console.info(approveReceipt);
      console.log(`Info: depositing token into Escrow:`, escrowAddress);
      const depositTransaction = await redeemableERC20ClaimEscrow.deposit( // change to pending deposit if sale is running, need to 'sweep' afterwards to move tokens from pending to deposit
        ethers.utils.parseUnits(process.env.REACT_APP_TOKEN_INITIAL_SUPPLY.toString(), process.env.REACT_APP_TOKEN_ERC20_DECIMALS)
      );
      const depositReceipt = await depositTransaction.wait();

      console.log('Result: Deposit complete.');
      console.info(depositReceipt);

      console.log(`Redirecting to Claim`); // todo will probably need to add the amount here as a second parameter
      window.location.replace(`${window.location.origin}/${escrowAddress}?s=${saleAddress}&d=${account}&t=${emissionsERC20Address}`);
    } catch (err) {
      console.log(err);
      setLoading(false);
      setButtonLock(false);
      alert('Failed Deployment.');
    }
  }

  /**
   * Get Data from Subgraph
   */
  async function getDataFromSubgraph() {
    try {
      if (!(claimView && escrowAddress && saleAddress && depositorAddress && tokenAddress)) return;
      // todo check if token address can be one of the query inputs
      // todo DOES IT NEED TIME TO ADD THE TOKEN EVENT TO THE SUBGRAPH?? (NOTHING COMING UP WHEN PASSING IN emissionsErc20Address)
      // todo--question what is the difference between tokenAmount and redeemableSupply?
      console.log('Info: fetching deposit data from Subgraph with endpoint:');
      console.log(SUBGRAPH_ENDPOINT);
      console.log(`escrowAddress is ${escrowAddress}, saleAddress is ${saleAddress}, depositorAddress is ${depositorAddress}, tokenAddress is ${tokenAddress}`) // why logged twice: https://stackoverflow.com/questions/60971185/why-does-create-react-app-initialize-twice

      // depositorAddress are the same in this example as we are using the same wallet for everything
      // TODO IS 'DEPOSITORADDRESS' ADDRESS IF SOMEONE ELSE IS CLAIMING? SURELY THEY DIDN'T 'DEPOSIT' ANYTHING
      let subgraphData = await fetch(SUBGRAPH_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
          query {
            redeemableEscrowDeposits(where: 
              {iSaleAddress:"${saleAddress.toLowerCase()}", escrowAddress: "${escrowAddress.toLowerCase()}", depositorAddress: "${depositorAddress.toLowerCase()}", tokenAddress: "${tokenAddress.toLowerCase()}"}
            ) {
              id
              token {
                id
                decimals
                name
                symbol
              }
              tokenAmount
              redeemableSupply
            }
          }
        `
        })
      });

      // the response will then come back as promise, the data of which will need to be accessed as such:
      subgraphData = await subgraphData.json();
      console.log(subgraphData);

      // @ts-ignore
      subgraphData = subgraphData.data.redeemableEscrowDeposits[0]; // should only be one here anyway. // todo--question is there potential for 'too quick' to cause it not to exist yet in the subgraph?
      if (subgraphData === undefined) throw new Error('NO_SUBGRAPH_DATA');

      console.log(`Result: data from subgraph with endpoint ${SUBGRAPH_ENDPOINT}:`);

      // @ts-ignore
      setSubgraphData(subgraphData);

      // setShowClaim(true); // todo removed this, but test how it works with it (could use it for showing the sale view, but no shoes, or could just hide the whole sale view)_
      setClaimView(true);
    } catch (err) {
      console.log(err);
      setLoading(false);
      setButtonLock(false);
      alert('Could not find relevant Data.');
    }
  }

  /**
   * Called within the modal for making a claim
   * THIS MUST NOT BE SHOWN BEFORE getEscrowData() HAS FINISHED OR THE DATA WILL BE FROM .ENV
   */
  async function initiateClaim() {
    setButtonLock(true);
    setLoading(true);
    //
    try {
      // @ts-ignore
      const redeemableERC20ClaimEscrow = await rainSDK.RedeemableERC20ClaimEscrow.get(saleAddress, tokenAddress, signer);

      const withdrawTransaction = await redeemableERC20ClaimEscrow.withdraw(
        // @ts-ignore
        subgraphData.redeemableSupply // each deposit captures the rTKN supply when being submitted on-chain (because the supply of rTKN can change at anytime by holders burning), so when calling withdraw, we need to pass rTKN supply at the time of that specific deposit to be able to perform the withdraw
      );
      console.info(withdrawTransaction);
      const withdrawReceipt = await withdrawTransaction.wait();
      console.log(`Result: withdrawal complete (please check your wallet to make sure you have the token, you may need to add the address for the token ${tokenAddress}):`);
      console.info(withdrawReceipt);

      setConsoleData(`Complete! You can view your tokens in your wallet by adding: ${tokenAddress}`);
      setConsoleColor(`green`); // todo add to struct
      setClaimComplete(true);
      setButtonLock(false); // don't set to true to disincentive users from continuing to click it
      setLoading(false);
    } catch(err) {
      setLoading(false);
      setButtonLock(false);
      setConsoleData(`Claim Failed (Check console for more data).`);
      setConsoleColor(`red`); // todo add to struct
      console.log(`Info: Something went wrong:`, err);
    }
  }

  /** Various **/

  /** View **/

  return (
    <div className="rootContainer">

      { loading && (
        <div className="deploying"><CircularProgress /></div>
      )}

      {/*if nothing is set, show admin panel*/}
      {/*{ !claimView && (*/}
      {/*  <AdminPanelView*/}
      {/*    tokenName={tokenName}*/}
      {/*    handleChangeTokenName={handleChangeTokenName} tokenSymbol={tokenSymbol}*/}
      {/*    handleChangeTokenSymbol={handleChangeTokenSymbol}*/}
      {/*    // tokenInitialSupply={tokenInitialSupply}*/}
      {/*    // handleChangeTokenInitialSupply={handleChangeTokenInitialSupply}*/}
      {/*    adminConfigPage={adminConfigPage}*/}
      {/*    setAdminConfigPage={setAdminConfigPage}*/}
      {/*    resetToDefault={resetToDefault}*/}
      {/*    buttonLock={buttonLock} deploy={deploy}*/}
      {/*    handleChangeSaleAddress={handleChangeSaleAddress} saleAddress={saleAddress}/>*/}
      {/*)}*/}

      {/*{ claimView && (*/}
      {/*  <TokenView*/}
      {/*    consoleData={consoleData} consoleColor={consoleColor} initiateClaim={initiateClaim}*/}
      {/*    // tokenName={tokenName}*/}
      {/*    // tokenSymbol={tokenSymbol}*/}
      {/*    modalOpen={modalOpen}*/}
      {/*    // tokenInitialSupply={tokenInitialSupply}*/}
      {/*    setModalOpen={setModalOpen} buttonLock={buttonLock} tokenAddress={tokenAddress}*/}
      {/*  />*/}
      {/*)}*/}


      <Routes>
        <Route
          key={'home'}
          path="/"
          element={
            <DeploymentPanelView
              tokenName={tokenName}
              handleChangeTokenName={handleChangeTokenName} tokenSymbol={tokenSymbol}
              handleChangeTokenSymbol={handleChangeTokenSymbol}
              // tokenInitialSupply={tokenInitialSupply}
              // handleChangeTokenInitialSupply={handleChangeTokenInitialSupply}
              adminConfigPage={adminConfigPage}
              setAdminConfigPage={setAdminConfigPage}
              resetToDefault={resetToDefault}
              buttonLock={buttonLock} deploy={deploy}
              handleChangeSaleAddress={handleChangeSaleAddress} saleAddress={saleAddress}/>
          }
        />

        <Route
          key={'escrow'}
          path="/:id"
          element={
            <ClaimView
              consoleData={consoleData} consoleColor={consoleColor} initiateClaim={initiateClaim}
              // tokenName={tokenName}
              // tokenSymbol={tokenSymbol}
              modalOpen={modalOpen}
              // tokenInitialSupply={tokenInitialSupply}
              setModalOpen={setModalOpen} buttonLock={buttonLock} tokenAddress={tokenAddress}
              setEscrowAddress={setEscrowAddress} claimView={claimView} BASE_URL={process.env.REACT_APP_BASE_URL}
            />
          }
        />

        <Route
          key={'escrow-dashboard'}
          path="/:id/dashboard"
          element={
            <EscrowDashboardView
              // consoleData={consoleData} consoleColor={consoleColor} initiateClaim={initiateClaim}
              // reserveName={reserveName} reserveSymbol={reserveSymbol} modalOpen={modalOpen}
              // reserveInitialSupply={reserveInitialSupply}
              // setModalOpen={setModalOpen} buttonLock={buttonLock} tokenAddress={tokenAddress}
              // setTokenAddress={setTokenAddress} faucetView={faucetView}
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

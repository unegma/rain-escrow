import React, {useEffect, useState} from 'react';
import {ethers, Signer} from "ethers";
import * as rainSDK from "rain-sdk";
import { connect } from "./connect.js"; // a very basic web3 connection implementation
import {CircularProgress} from "@mui/material";
import AdminPanelView from "./components/AdminPanelView";
import TokenView from "./components/TokenView";

declare var process : {
  env: {
    REACT_APP_CHAIN_ID: string
    REACT_APP_SALE_ADDRESS: string
    REACT_APP_TOKEN_NAME: string
    REACT_APP_TOKEN_SYMBOL: string
    REACT_APP_TOKEN_INITIAL_SUPPLY: string
    REACT_APP_TOKEN_ERC20_DECIMALS: string
  }
}

const SUBGRAPH_ENDPOINT = rainSDK.AddressBook.getSubgraphEndpoint(parseInt(process.env.REACT_APP_CHAIN_ID));

/**
 * App
 */
function App() {

  /** State Config **/

  // high level
  const [signer, setSigner] = useState<Signer|undefined>(undefined);
  const [address, setAddress] = useState("");
  const [claimAddress, setClaimAddress] = React.useState("");
  const [consoleData, setConsoleData] = React.useState("");
  const [consoleColor, setConsoleColor] = React.useState('red');

  // page controls
  const [buttonLock, setButtonLock] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adminConfigPage, setAdminConfigPage] = useState(0);
  const [claimView, setClaimView] = React.useState(false); // show claim or admin view (if there is a claim address in the url)
  const [showClaim, setShowClaim] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);

  // all these from .env will be replaced by calls to blockchain within the getTokenData function when faucetView is set to true
  const [saleAddress, setSaleAddress] = React.useState(process.env.REACT_APP_SALE_ADDRESS);
  const [tokenInitialSupply, setTokenInitialSupply] = useState(process.env.REACT_APP_TOKEN_INITIAL_SUPPLY);
  const [tokenDecimals, setTokenDecimals] = useState(process.env.REACT_APP_TOKEN_ERC20_DECIMALS);
  const [tokenName, setTokenName] = React.useState(process.env.REACT_APP_TOKEN_NAME);
  const [tokenSymbol, setTokenSymbol] = React.useState(process.env.REACT_APP_TOKEN_SYMBOL);

  // // a bit isolated because not taken from .env and only used in the Claim (and got from getSaleData())
  const [tokenAddress, setTokenAddress] = useState("");

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
    let tParam = queryString.get('c');

    if (typeof tParam !== 'undefined' && tParam) {
      console.log(`claimAddress is ${tParam}`) // why logged twice: https://stackoverflow.com/questions/60971185/why-does-create-react-app-initialize-twice
      setClaimView(true);
      setClaimAddress(tParam);
    }
  },[]);

  // basic connection to web3 wallet
  useEffect(() => {
    makeWeb3Connection(); // todo test what happens if not signed in
  },[]);

  // this relies on useEffect above to get tokenAddress from url // todo may be able to merge this one with the above one
  useEffect(() => {
    if (claimAddress && signer) {
      getEscrowData();
    }
  }, [claimAddress, signer]); // only get sale data when signer and saleAddress have been loaded // monitor saleComplete so that the amount displayed on the button is updated when the sale is finished

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

  async function makeWeb3Connection() {
    try {
      const {signer, address} = await connect(); // get the signer and account address using a very basic connection implementation
      setSigner(signer);
      setAddress(address);
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * Get Token Data from blockchain instead of .env
   * THIS WILL ALL BE AS IF THERE IS NO .ENV ON SALE LOAD
   */
  async function getEscrowData() {
    try {
      // @ts-ignore
      // const escrowContract = new rainSDK.EmissionsERC20(tokenAddress, signer);
      // console.log(tokenContract);

      // setReserveTokenAddress(reserve.address);
      // setReserveName(await tokenContract.name());
      // setReserveSymbol(await tokenContract.symbol());
      // setReserveDecimals((await tokenContract.decimals()).toString());

      // console.log(`Shoes in Sale: ${amountOfShoes}`); // todo check if this changes when they are bought
      // setRedeemableInitialSupply(amountOfShoes.toString()); // TODO THIS SHOULD BE REMAINING SHOES NOT TOTAL SUPPLY

      setShowClaim(true);
    } catch(err) {
      console.log('Error getting data', err);
    }
  }

  /**
   * Deploy
   */
  async function deploy() {
    setButtonLock(true);
    setLoading(true);
    //
    // const emissionsERC20Config = {
    //   allowDelegatedClaims: false, // can mint on behalf of someone else
    //   erc20Config: {
    //     name: reserveName,
    //     symbol: reserveSymbol,
    //     distributor: address, // initialSupply is given to the distributor during the deployment of the emissions contract
    //     initialSupply: ethers.utils.parseUnits("0", reserveDecimals), // todo change this to 0 if possible, or tell the deployer that they will get an amoujnt of tokens
    //   },
    //   vmStateConfig: {
    //     // todo should really change 'initialSupply' to now be 'faucetSupply' or something
    //     constants: [ethers.utils.parseUnits(reserveInitialSupply, reserveDecimals)], // mint a set amount at a time (infinitely), if set to 10, will mint 10 at a time, no more no less (infinitely)
    //     sources: [
    //       ethers.utils.concat([
    //         rainSDK.utils.op(rainSDK.Sale.Opcodes.VAL, 0),
    //       ]),
    //     ],
    //     stackLength: 1,
    //     argumentsLength: 0,
    //   },
    // };

    try {
      // console.log(`Deploying and Minting ERC20 Token with the following parameters:`, emissionsERC20Config);
      // @ts-ignore
      // const emissionsErc20 = await rainSDK.EmissionsERC20.deploy(signer, emissionsERC20Config);
      // todo claim function will mint another token (in addition to initial supply)??
      // const emissionsERC20Address = emissionsErc20.address;
      // console.log(`Result: deployed emissionsErc20, with address: ${emissionsERC20Address} and sent you ${reserveInitialSupply} tokens.`, emissionsErc20);
      // console.log('Info: to see the tokens in your Wallet, add a new token with the address above. ALSO, REMEMBER TO NOTE DOWN THIS ADDRESS, AS IT WILL BE USED AS RESERVE_TOKEN IN FUTURE TUTORIALS.');
      //
      // console.log(`Redirecting to Token Faucet: ${emissionsERC20Address}`);
      // window.location.replace(`${window.location.origin}?t=${emissionsERC20Address}`);
    } catch (err) {
      console.log(err);
      setLoading(false);
      setButtonLock(false);
      alert('Failed Deployment.');
    }
  }

  /**
   * Deposit to Escrow
   */
  async function depositToEscrow() {
    try {

    } catch (err) {

    }
  }


  /**
   * Get Data from Subgraph
   */
  async function getDataFromSubgraph() {
    try {
      // todo check if token address can be one of the query inputs
      // todo DOES IT NEED TIME TO ADD THE TOKEN EVENT TO THE SUBGRAPH?? (NOTHING COMING UP WHEN PASSING IN emissionsErc20Address)
      // todo--question what is the difference between tokenAmount and redeemableSupply?
      console.log('> Info: fetching deposit data from Subgraph with endpoint:');
      console.log(SUBGRAPH_ENDPOINT, 'blue');
      // depositorAddress are the same in this example as we are using the same wallet for everything
      let subgraphData = await fetch(SUBGRAPH_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
          query {
            redeemableEscrowDeposits(where: 
              {iSaleAddress:"${saleAddress}", escrowAddress: "${claimAddress}", depositorAddress: "${address}", tokenAddress: "${tokenAddress}"}
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

      // @ts-ignore
      subgraphData = subgraphData.data.redeemableEscrowDeposits[0]; // should only be one here anyway. // todo--question is there potential for 'too quick' to cause it not to exist yet in the subgraph?
      if (subgraphData === undefined) throw new Error('NO_SUBGRAPH_DATA');

      // console.log(`> Result: data from subgraph with endpoint ${SUBGRAPH_ENDPOINT}:`);
      return subgraphData;
    } catch (err) {

    }
  }

  /**
   * Called within the modal for making a claim
   * THIS MUST NOT BE SHOWN BEFORE getEscrowData() HAS FINISHED OR THE DATA WILL BE FROM .ENV
   */
  // async function initiateClaim() {
  //   setButtonLock(true);
  //   setLoading(true);
  //   //
  //   try {
  //     // @ts-ignore
  //     const emissionsErc20 = new rainSDK.EmissionsERC20(tokenAddress, signer);
  //
  //     // TODO FIGURE OUT WHAT IS HAPPENING WITH ADDRESSZERO
  //     const claimTransaction = await emissionsErc20.claim(address, ethers.constants.AddressZero);
  //     const claimReceipt = await claimTransaction.wait();
  //     console.log('Success', claimReceipt);
  //
  //     // setConsoleData(`Complete! You can view the ${reserveSymbol} in your wallet by adding: ${tokenAddress}`);
  //     // setConsoleColor(`green`); // todo add to struct
  //   //   setSaleComplete(true);
  //   //   setButtonLock(false); // don't set to true to disincentive users from continuing to click it
  //     setLoading(false);
  //   } catch(err) {
  //     setLoading(false);
  //     setButtonLock(false);
  //     setConsoleData(`Claim Failed (Check console for more data).`);
  //     setConsoleColor(`red`); // todo add to struct
  //     console.log(`Info: Something went wrong:`, err);
  //   }
  // }

  /** Various **/

  /** View **/

  return (
    <div className="rootContainer">

      { loading && (
        <div className="deploying"><CircularProgress /></div>
      )}

      {/*if nothing is set, show admin panel*/}
      { !claimView && (
        <AdminPanelView
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
      )}

      { claimView && (
        <TokenView
          // consoleData={consoleData} consoleColor={consoleColor} initiateClaim={initiateClaim}
          // tokenName={tokenName} tokenSymbol={tokenSymbol} modalOpen={modalOpen}
          // tokenInitialSupply={tokenInitialSupply}
          setModalOpen={setModalOpen} buttonLock={buttonLock} tokenAddress={tokenAddress}
        />
      )}

    </div>
  );
}

export default App;

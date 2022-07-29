import {ethers} from "ethers";
import * as rainSDK from "rain-sdk";

const WARNING_MESSAGE="Are you connected with your Web3 Wallet? (Click the button at the top right)!";

/**
 * Deploy
 */
export async function deploy(
  signer: any, account: string, setButtonLock: any, setLoading: any, tokenName: string, tokenSymbol: string,
  tokenInitialSupply: string, tokenDecimals: string, saleAddress: string
) {
  try {
    if (account === "" || typeof account === 'undefined') {
      alert(WARNING_MESSAGE);
      return;
    }

    setButtonLock(true);
    setLoading(true);

    const emissionsERC20Config = {
      allowDelegatedClaims: false, // can mint on behalf of someone else
      erc20Config: {
        name: tokenName,
        symbol: tokenSymbol,
        distributor: account, // initialSupply is given to the distributor during the deployment of the emissions contract
        initialSupply: ethers.utils.parseUnits(tokenInitialSupply, tokenDecimals), // TODO CHECK UNDERSTANDING HOW TO LIMIT CORRECTLY, AND TO WHERE THIS GOES ON DEPLOYING THE CONTRACT (distributor?)
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

    console.log(`Deploying and Minting ERC20 Token with the following parameters:`, emissionsERC20Config);
    // @ts-ignore
    const emissionsErc20 = await rainSDK.EmissionsERC20.deploy(signer, emissionsERC20Config);

    // todo claim function will mint another token (in addition to initial supply)??
    const emissionsERC20Address = emissionsErc20.address;

    console.log(`Result: deployed emissionsErc20, with address: ${emissionsERC20Address} and sent you ${tokenInitialSupply} tokens.`, emissionsErc20);
    console.log('Info: to see the tokens in your Wallet, add a new token with the address above..');

    console.log(`Info: Adding Token (${emissionsERC20Address}) to Escrow and linking to Sale (${saleAddress}).`);
    console.log('Info: be aware that, due to the open nature of blockchains, anyone can create an Escrow for any Sale.', 'orange');

    // @ts-ignore
    const redeemableERC20ClaimEscrow = await rainSDK.RedeemableERC20ClaimEscrow.get(saleAddress, emissionsERC20Address, signer);
    const escrowAddress = redeemableERC20ClaimEscrow.address;
    console.log(`Result: initialised redeemableERC20ClaimEscrow, with address ${escrowAddress}`);
    console.log(redeemableERC20ClaimEscrow);
    console.log(`Info: Connecting to ${emissionsERC20Config.erc20Config.name} ERC20 token (${emissionsERC20Address}) for approval of spend of ${tokenInitialSupply} ${emissionsERC20Config.erc20Config.symbol}`);
    const approveTransaction = await emissionsErc20.approve(
      redeemableERC20ClaimEscrow.address,
      ethers.utils.parseUnits(tokenInitialSupply, tokenDecimals)
    );
    const approveReceipt = await approveTransaction.wait();
    console.info(approveReceipt);
    console.log(`Info: depositing token into Escrow:`, escrowAddress);
    const depositTransaction = await redeemableERC20ClaimEscrow.deposit( // change to pending deposit if sale is running, need to 'sweep' afterwards to move tokens from pending to deposit
      ethers.utils.parseUnits(tokenInitialSupply, tokenDecimals)
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
 * Called within the modal for making a claim
 * THIS MUST NOT BE SHOWN BEFORE getEscrowData() HAS FINISHED OR THE DATA WILL BE FROM .ENV
 */
export async function initiateClaim(
  signer: any, account: string, setButtonLock: any, setLoading: any, setConsoleData: any, setConsoleColor: any, setClaimComplete: any,
  tokenAddress: string, saleAddress: string, subgraphData: any
) {
  try {
    if (account === "" || typeof account === 'undefined') {
      alert(WARNING_MESSAGE);
      return;
    }

    setButtonLock(true);
    setLoading(true);
    //
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

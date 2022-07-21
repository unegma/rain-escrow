import * as rainSDK from "rain-sdk";
const SUBGRAPH_ENDPOINT = rainSDK.AddressBook.getSubgraphEndpoint(parseInt(process.env.REACT_APP_CHAIN_ID as string));

/**
 * Get Data from Subgraph
 */
export async function getDataFromSubgraph(
  claimView: boolean, escrowAddress: string, saleAddress: string, depositorAddress: string, tokenAddress: string,
  setClaimView: any, setButtonLock: any, setLoading: any, subgraphData: any, setSubgraphData: any
) {
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

    setSubgraphData(subgraphData);
    setClaimView(true);
  } catch (err) {
    console.log(err);
    setLoading(false);
    setButtonLock(false);
    alert('Could not find relevant Data.');
  }
}

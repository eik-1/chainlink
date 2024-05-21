const dotenv = require("dotenv");
dotenv.config();
const { ethers } = require("ethers");
const { abi } = require("../artifacts/contracts/SyntheticV2.sol/SyntheticV2.json");
const RPCURL = process.env.POLYGON_AMOY_RPC;

//updateable
const contractAddress = "0x8242890FE87950952920eb4C96Bd2258375d9C2d";
const name = "Tesla";
const symbol = "TSLA";
const stock = ["TSLA"]
async function main() {

    const provider = new ethers.providers.JsonRpcProvider(RPCURL);
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const contract = new ethers.Contract(contractAddress, abi, signer);
    const result = await contract.depositAndMint(name, symbol, stock, {value: ethers.utils.parseEther("0.001")});
    console.log(result);

}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
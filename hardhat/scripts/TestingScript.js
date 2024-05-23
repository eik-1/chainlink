const dotenv = require("dotenv");
dotenv.config();
const { ethers } = require("ethers");
const { abi } = require("../artifacts/contracts/SyntheticV2.sol/SyntheticV2.json");
// const RPCURL = process.env.POLYGON_AMOY_RPC;
const RPCURL = process.env.SEPOLIA_RPC;

//updateable
const contractAddress = "0x52B0F6Fd6Ef23b0EAF2c407b0899Af0eb468e8D1";
const name = "Tesla";
const symbol = "TSLA";
const stock = ["TSLA"]
async function main() {

    const provider = new ethers.providers.JsonRpcProvider(RPCURL);
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const contract = new ethers.Contract(contractAddress, abi, signer);
    const result = await contract.depositAndMint(name, symbol, stock, {
        value: ethers.utils.parseEther("0.001"),
        gasLimit: 3000000
      });
      
    console.log(result);

}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
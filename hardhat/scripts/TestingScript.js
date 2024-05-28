const dotenv = require("dotenv");
dotenv.config();
const { ethers } = require("ethers");
const { abi } = require("../artifacts/contracts/SyntheticV2.sol/Synthetic.json");
// const RPCURL = process.env.POLYGON_AMOY_RPC;
const RPCURL = process.env.SEPOLIA_RPC;

//updateable
const contractAddress = "0x9F52a33b924f288B0172acCf7a2Ce24dee5BB162";
const user = "0x1ABc133C222a185fEde2664388F08ca12C208F76"
const name = "Tesla";
const symbol = "TSLA";
const stock = ["TSLA"]
async function main() {

    const provider = new ethers.providers.JsonRpcProvider(RPCURL);
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const contract = new ethers.Contract(contractAddress, abi, signer);
    const result = await contract.depositAndMint(name, symbol, stock, user, {
        value: ethers.utils.parseEther("1"),
        gasLimit: 3000000
      });
      
    console.log(result);

}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
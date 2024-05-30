
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3000;
const apiKey = process.env.POLYGON_AGGREGATES_APIKEY;
// const wssURL = process.env.WSS_URL;
const contractAddress = process.env.CONTRACT_ADDRESS;
const abi = require("./abi");
const httpProvider = new ethers.providers.JsonRpcProvider(
  "https://polygon-amoy.g.alchemy.com/v2/7nTRB0-k8rsp__KYAq12LYq5KWG16SZ0"
)
// const signer = new ethers.Wallet(process.env.PRIVATE_KEY, httpProvider
// const provider = new ethers.providers.WebSocketProvider(wssURL);
// const contract = new ethers.Contract(contractAddress, abi, provider);


// contract.on("Response",(requestId, stockTokensToMint, response, err, event) => {
//   // console.log(requestId, stockTokensToMint, response, err, event);
//   let data = {
//     // requestId: requestId,
//     stockTokensToMint: parseInt(stockTokensToMint, 10),
//     // response: response,
//     // err: err,
//     // event: event
//   }
//   console.log(data)
// })

app.get("/", (req, res) => {
  res.send("Stock server is up and running");
});


// get data from polygon.io api
app.get("/api/stocks/:stockId", async (req, res) => {
  console.log({
    requestParams: req.params,
    requestQuery: req.query,
  });
  const stockId = req.params.stockId;
  console.log(stockId);
  const result = await fetch(
    `https://api.polygon.io/v2/aggs/ticker/${stockId}/range/1/day/2023-01-09/2023-01-09?apiKey=${apiKey}`
  );
  const data = await result.json();
  
  res.json(data.results[0].l);
});

//using alpha vantage stock 
app.get("/api/alpha/:stockId", async (req, res) => {
  console.log({
    requestParams: req.params,
    requestQuery: req.query,
  });
  const stockId = req.params.stockId;
  console.log(stockId);
  const result = await fetch(
    `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockId}&apikey=${process.env.ALPHA_VANTAGE_APIKEY}`
  );

  const data = await result.json();
  const priceString = data["Global Quote"]["05. price"];
  const price = parseFloat(priceString);
  console.log(price)
  console.log(typeof price)
  res.json(price);
});

const start = async () => {
  try {
    app.listen(PORT, () => { // Use PORT variable here
      console.log("Server started on port " + PORT);
    });
  } catch (error) {
    console.log(error.message);
  }
};

start();

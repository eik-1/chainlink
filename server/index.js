'use strict';
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3000;
const apiKey = process.env.POLYGON_AGGREGATES_APIKEY;

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
  const price = data["Global Quote"]["05. price"];
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

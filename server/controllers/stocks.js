import axios from "axios";
import { Ticker, Portfolio } from "../models/models.js";
import mongoose from "mongoose";

const finnhubKey = "cnarddhr01ql0f8afcf0cnarddhr01ql0f8afcfg";
const finnhubKey2 = "co2ms79r01qp2sim3v60co2ms79r01qp2sim3v6g";
const polygonKey = "q3e0Rj8gdrA6x0yJTrDpJL8hQ1WbrNdL";
const polygonKey2 = "dwMSoQY5b3oPY_xyo7QOLg5kR5U5jmHI";
const MONGO_URL =
  "mongodb+srv://Yanchen:do5Y9QM441xueofI@stocksearch3.luk9nug.mongodb.net/?retryWrites=true&w=majority&appName=StockSearch3";

const getAutoComplete = async (req, res) => {
  const symbol = req.query.symbol;
  const apiUrl = `https://finnhub.io/api/v1/search?q=${symbol}&token=${finnhubKey}`;

  try {
    const response = await axios.get(apiUrl);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

const getStockDetail = async (req, res) => {
  const symbol = req.query.symbol;
  const apiUrl1 = `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${finnhubKey}`;
  const apiUrl2 = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${finnhubKey2}`;

  try {
    const response1 = await axios.get(apiUrl1);
    const response2 = await axios.get(apiUrl2);
    const json = Object.assign({}, response1.data, response2.data);
    res.json(json);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

async function fetchDataForWatchlist(ticker) {
  const apiUrl = `https://finnhub.io/api/v1/quote?symbol=${ticker.ticker}&token=${finnhubKey}`;
  const response = await axios.get(apiUrl);
  const data = response.data;
  return {
    ticker: ticker.ticker,
    companyName: ticker.companyName,
    lastPrice: data.c,
    change: Number(data.d),
    changePercentage: Number(data.dp).toFixed(2) + "%",
  };
}

async function fetchDataForPortfolioList(stock) {
  const apiUrl = `https://finnhub.io/api/v1/quote?symbol=${stock.ticker}&token=${finnhubKey2}`;
  const response = await axios.get(apiUrl);
  const data = response.data;
  const color = Number(data.c) > Number(stock.avgCostPerShare) ? "text-success" : (Number(data.c) < Number(stock.avgCostPerShare) ? "text-danger" : "text-body");
  return {
    ticker: stock.ticker,
    companyName: stock.companyName,
    quantity: stock.quantity,
    avgCostPerShare: Number(stock.avgCostPerShare),
    totalCost: Number(stock.totalCost),
    change: Number(data.d),
    currentPrice: data.c,
    color
  };
}

// 仅有symbol，需要获取它目前的price
async function fetchCurrentDataFromSymbol(symbol) {
  const apiUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${finnhubKey}`;
  const response = await axios.get(apiUrl);
  const data = response.data;
  return {
    change: Number(data.d),
    currentPrice: Number(data.c),
  };
}

const getWatchList = async (req, res) => {
  try {
    const tickers = await Ticker.find({});
    const promises = tickers.map((ticker) => fetchDataForWatchlist(ticker));
    const results = await Promise.all(promises);
    res.json(results);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const postAddToWatchlist = async (req, res) => {
  const tickerData = req.body;

  try {
    await addToWatchlist(tickerData);
    const tickers = await Ticker.find({});
    res.json(tickers);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const addToWatchlist = async (tickerData) => {
  try {
    const symbol = tickerData.ticker;
    const ticker = await Ticker.findOne({ ticker: symbol.toUpperCase() });
    if (!ticker) {
      const ticker1 = new Ticker({
        ticker: tickerData.ticker || "AAPL",
        companyName: tickerData.companyName || "Apple Inc",
      });
      await ticker1.save();
    } else {
    }
  } catch (error) {
    console.error(error);
  }
};

const getIsTickerFoundInWatchlist = async (req, res) => {
  try {
    let isFound = false;
    const symbol = req.query.symbol;
    const ticker = await Ticker.findOne({ ticker: symbol.toUpperCase() });

    if (ticker) {
      isFound = true;
    }
    res.json({ isFound });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const deleteRemoveFromWatchlist = async (req, res) => {
  try {
    const symbol = req.query.symbol;
    // Delete the ticker from the database
    const result = await Ticker.deleteOne({ ticker: symbol.toUpperCase() });
    // If the ticker is deleted, send a success response
    res
      .status(200)
      .send({ message: `Ticker with symbol ${symbol} has been deleted.` });
  } catch (error) {
    res.status(200).json({ message: error.message });
  }
};

const getPortfolioList = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne();
    if (!portfolio) {
      const newPortfolio = new Portfolio({ wallet: 25000 });
      await newPortfolio.save();
      return res.json({
        stocks: [],
        wallet: 25000, // Default wallet amount
      });
    }
    const promises = portfolio.stocks.map((stock) =>
      fetchDataForPortfolioList(stock)
    );
    const results = await Promise.all(promises);
    res.json({
      stocks: results,
      wallet: portfolio.wallet,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

const getPortfolioByStock = async (req, res) => {
  const symbol = req.query.symbol.toUpperCase();

  try {
    const portfolio = await Portfolio.findOne();
    let json = {
      isBought: false,
      wallet: 25000,
    };
    if (!portfolio) {
      // console.log("can't find portfolio");
      const newPortfolio = new Portfolio({ wallet: 25000 });
      await newPortfolio.save();
      json = {
        isBought: false,
        wallet: newPortfolio.wallet,
      };
    } else {
      const stock = portfolio.stocks.find((s) => s.ticker === symbol);
      if (!stock) {
        json = {
          isBought: false,
          wallet: portfolio.wallet,
        };
      } else {
        json = {
          isBought: true,
          wallet: portfolio.wallet,
          stock,
        };
      }
    }
    res.json(json);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

const resetWallet = async(req, res) => {
  try {
    let portfolio = await Portfolio.findOne();
    if (!portfolio) {
      portfolio = new Portfolio({ wallet: 25000 });
      await portfolio.save();
    }
    portfolio.wallet = 25000;
    await portfolio.save();
    res.json({ success: "true" });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const postBuyStock = async (req, res) => {
  const { symbol, companyName, quantity } = req.body;

  try {
    let portfolio = await Portfolio.findOne();
    let json = {
      success: false,
      wallet: 25000,
    };
    if (!portfolio) {
      portfolio = new Portfolio({ wallet: 25000 });
      await portfolio.save();
    }
    // else {
    const updatedPriceTicker = await fetchCurrentDataFromSymbol(symbol);
    const currentPrice = updatedPriceTicker.currentPrice;
    const totalCost = quantity * currentPrice;

    if (portfolio.wallet < totalCost) {
      json = {
        success: false,
        wallet: portfolio.wallet,
        message: "Your money is NOT enough.",
      };
    } else {
      const existingStockIndex = portfolio.stocks.findIndex(
        (stock) => stock.ticker === symbol
      );
      if (existingStockIndex > -1) {
        const preStock = portfolio.stocks[existingStockIndex];
        const newQuantity = Number(preStock.quantity + quantity);
        const newTotalCost = Number(preStock.totalCost + totalCost);
        portfolio.stocks[existingStockIndex].quantity = newQuantity;
        portfolio.stocks[existingStockIndex].totalCost = newTotalCost;
        portfolio.stocks[existingStockIndex].avgCostPerShare =
          newTotalCost / newQuantity;
        portfolio.wallet = portfolio.wallet - totalCost;
        json = {
          success: true,
          stock: portfolio.stocks[existingStockIndex],
          wallet: portfolio.wallet,
        };
      } else {
        const stock = {
          ticker: symbol,
          companyName,
          quantity,
          avgCostPerShare: currentPrice,
          totalCost,
        };
        portfolio.stocks.push(stock);
        portfolio.wallet = portfolio.wallet - totalCost;
        json = {
          success: true,
          stock,
          wallet: portfolio.wallet,
        };
      }
    }
    await portfolio.save();
    res.json(json);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const postSellStock = async (req, res) => {
  const { symbol, companyName, quantity } = req.body;

  try {
    let portfolio = await Portfolio.findOne();
    let json = {
      success: false,
      wallet: 25000,
      message: "err message",
      isSoldOut: true,
    };
    if (!portfolio) {
      portfolio = new Portfolio({ wallet: 25000 });
      await portfolio.save();
    }

    const updatedPriceTicker = await fetchCurrentDataFromSymbol(symbol);
    const currentPrice = updatedPriceTicker.currentPrice;
    const totalCost = quantity * currentPrice;

    const existingStockIndex = portfolio.stocks.findIndex(
      (stock) => stock.ticker === symbol
    );
    if (existingStockIndex > -1) {
      const preStock = portfolio.stocks[existingStockIndex];
      const newQuantity = Number(preStock.quantity - quantity);
      const newTotalCost = Number(preStock.totalCost - totalCost);
      if (newQuantity < 0 || newTotalCost < 0) {
        json = {
          success: false,
          stock: portfolio.stocks[existingStockIndex],
          wallet: portfolio.wallet,
          isSoldOut: false,
          message: "NO enough stocks can be sold.",
        };
      } else if (newQuantity === 0) {
        portfolio.wallet = portfolio.wallet + totalCost;
        portfolio.stocks.splice(existingStockIndex, 1);
        json = {
          success: true,
          stock: {},
          wallet: portfolio.wallet,
          isSoldOut: true,
        };
      } else {
        portfolio.stocks[existingStockIndex].quantity = newQuantity;
        portfolio.stocks[existingStockIndex].totalCost = newTotalCost;
        portfolio.stocks[existingStockIndex].avgCostPerShare =
          newTotalCost / newQuantity;
        portfolio.wallet = portfolio.wallet + totalCost;
        json = {
          success: true,
          stock: portfolio.stocks[existingStockIndex],
          wallet: portfolio.wallet,
          isSoldOut: false,
        };
      }
    } else {
      json = {
        success: false,
        wallet: portfolio.wallet,
        isSoldOut: true,
        message: "Can find the stock."
      };
    }
    await portfolio.save();
    res.json(json);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const getSummaryDetail = async (req, res) => {
  const symbol = req.query.symbol;
  const apiUrl = `https://finnhub.io/api/v1/stock/peers?symbol=${symbol}&token=${finnhubKey}`;

  try {
    const response = await axios.get(apiUrl);
    res.json({
      companyPeers: response.data
    });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

const formatNumber = (number) => {
  return number < 10 ? `0${number}` : number.toString();
};

const getSummaryCharts = async (req, res) => {
  const { symbol, status, closeTimestamp } = req.query;
  const multiplier = 1;
  const timespan = "hour";
  let toDate = new Date();
  const isOpen = status || false;
  if (!isOpen && closeTimestamp !== undefined) {
    toDate = new Date(closeTimestamp);
  }
  let fromDate = new Date(toDate.getTime() - 24 * 60 * 60 * 1000);
  
  const fromFormatted = `${fromDate.getFullYear()}-${formatNumber(fromDate.getMonth()+1)}-${formatNumber(fromDate.getDate())}`;
  const toFormatted = `${toDate.getFullYear()}-${formatNumber(toDate.getMonth()+1)}-${formatNumber(toDate.getDate())}`;
  const apiUrl = `https://api.polygon.io/v2/aggs/ticker/${symbol || "AAPL"}/range/${multiplier}/${timespan}/${fromFormatted}/${toFormatted}?adjusted=true&sort=asc&apiKey=${finnhubKey2}`;
  try {
    const response = await axios.get(apiUrl);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
    console.error(error.message);
  }
}

const getTopNewsList = async (req, res) => {
  const symbol = req.query.symbol;
  let toDate = new Date();
  let fromDate = new Date(toDate.getTime() - 30* 24 * 60 * 60 * 1000);
  
  const fromFormatted = `${fromDate.getFullYear()}-${formatNumber(fromDate.getMonth()+1)}-${formatNumber(fromDate.getDate())}`;
  const toFormatted = `${toDate.getFullYear()}-${formatNumber(toDate.getMonth()+1)}-${formatNumber(toDate.getDate())}`;
  const apiUrl = `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${fromFormatted}&to=${toFormatted}&token=${finnhubKey2}`;

  try {
    const response = await axios.get(apiUrl);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

const getInsightsData = async (req, res) => {
  const symbol = req.query.symbol;
  const fromDate = "2022-01-01";
  const apiUrl = `https://finnhub.io/api/v1/stock/insider-sentiment?symbol=${symbol}&from=${fromDate}&token=${finnhubKey}`;
  
  try {
    const response = await axios.get(apiUrl);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

const getInsightsCompanyEarning = async (req, res) => {
  const symbol = req.query.symbol;
  const apiUrl = `https://finnhub.io/api/v1/stock/earnings?symbol=${symbol}&token=${finnhubKey2}`;
  
  try {
    const response = await axios.get(apiUrl);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

const getInsightsTrends = async (req, res) => {
  const symbol = req.query.symbol;
  const apiUrl = `https://finnhub.io/api/v1/stock/recommendation?symbol=${symbol}&token=${finnhubKey}`;
  
  try {
    const response = await axios.get(apiUrl);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

const get2yearsCharts = async (req, res) => {
  const symbol = req.query.symbol;
  const multiplier = 1;
  const timespan = "day";
  let toDate = new Date();
  let fromDate = new Date();
  fromDate.setFullYear(fromDate.getFullYear() - 2);
  
  const fromFormatted = `${fromDate.getFullYear()}-${formatNumber(fromDate.getMonth()+1)}-${formatNumber(fromDate.getDate())}`;
  const toFormatted = `${toDate.getFullYear()}-${formatNumber(toDate.getMonth()+1)}-${formatNumber(toDate.getDate())}`;
  const apiUrl = `https://api.polygon.io/v2/aggs/ticker/${symbol || "AAPL"}/range/${multiplier}/${timespan}/${fromFormatted}/${toFormatted}?adjusted=true&sort=asc&apiKey=${polygonKey2}`;
  try {
    const response = await axios.get(apiUrl);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
}

export {
  getAutoComplete,
  getStockDetail,
  getWatchList,
  postAddToWatchlist,
  deleteRemoveFromWatchlist,
  getIsTickerFoundInWatchlist,
  getPortfolioList,
  getPortfolioByStock,
  postBuyStock,
  postSellStock,
  getSummaryDetail,
  getSummaryCharts,
  getTopNewsList,
  getInsightsData,
  getInsightsCompanyEarning,
  getInsightsTrends,
  get2yearsCharts,
  resetWallet
};

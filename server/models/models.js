import mongoose from "mongoose";
const tickerSchema = new mongoose.Schema({
  ticker: String,
  companyName: String,
});
export const Ticker = mongoose.model("Ticker", tickerSchema);

const stockSchema = new mongoose.Schema({
  ticker: String,
  companyName: String,
  quantity: Number,
  avgCostPerShare: Number,
  totalCost: Number,
});

const portfolioSchema = new mongoose.Schema({
  stocks: [stockSchema],
  wallet: {
    type: Number,
    required: true,
    default: 25000
  }
});

export const Portfolio = mongoose.model('Portfolio', portfolioSchema);


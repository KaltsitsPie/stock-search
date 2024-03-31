import { Router } from "express";
import { deleteRemoveFromWatchlist, get2yearsCharts, getAutoComplete, getInsightsCompanyEarning, getInsightsData, getInsightsTrends, getIsTickerFoundInWatchlist, getPortfolioByStock, getPortfolioList, getStockDetail, getSummaryCharts, getSummaryDetail, getTopNewsList, getWatchList, postAddToWatchlist, postBuyStock, postSellStock, resetWallet } from "../controllers/stocks.js";

const router = Router();

// :5001/stocks
router.get("/get-auto-complete", getAutoComplete);

router.get("/get-stock-detail", getStockDetail);

router.get("/get-watch-list", getWatchList);

router.post("/add-to-watch-list", postAddToWatchlist);

router.delete("/remove-from-watch-list", deleteRemoveFromWatchlist);

router.get("/get-ticker-found-in-watch-list", getIsTickerFoundInWatchlist);

router.get("/get-portfolio-list", getPortfolioList);

router.get("/get-portfolio-by-stock", getPortfolioByStock);

router.post("/post-buy-stock", postBuyStock);

router.post("/post-sell-stock", postSellStock);

router.get("/get-summary-detail", getSummaryDetail);

router.get("/get-summary-charts", getSummaryCharts);

router.get("/get-top-news-list", getTopNewsList);

router.get("/get-insights-data", getInsightsData);

router.get("/get-insights-company-earning", getInsightsCompanyEarning);

router.get("/get-insights-trends", getInsightsTrends);

router.get("/get-charts", get2yearsCharts);

router.post("/post-reset-wallet", resetWallet);

export default router;
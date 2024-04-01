import axios from "axios";

// const url = "localhost:5001/stocks";
axios.defaults.baseURL = process.env.REACT_APP_API_URL || "https://stock-search-server-tkztfas4gq-uc.a.run.app";

console.log("axios default url: " + axios.defaults.baseURL);

export async function getStockAutoComplete(symbol) {
  
  try {
    console.log("axios default url: " + axios.defaults.baseURL);
    const response = await axios.get("/get-auto-complete", {
      params: { symbol },
    });
    return response.data.result;
  } catch (error) {
    console.error("Failed to fetch suggestions", error);
    return [];
  }
}

export async function getStockDetail(symbol) {
  console.log("axios default url: " + axios.defaults.baseURL);
  try {
    const response = await axios.get("/get-stock-detail", {
      params: { symbol },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch suggestions", error);
    return { error: "Failed to fetch suggestions" };
  }
}

export async function getStockWatchlist() {
  try {
    const response = await axios.get("/get-watch-list");
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function postAddTickerToWatchlist(tickerData) {
  try {
    const response = await axios.post("/add-to-watch-list", tickerData);
    return response.data;
  } catch (error) {
    console.error("Error adding ticker to watchlist", error.response || error);
    return undefined;
  }
}

export async function deleteRemoveTickerFromWatchlist(symbol) {
  try {
    const url = `/remove-from-watch-list?symbol=${symbol}`;
    const response = await axios.delete(url);

    if (response.status === 200) {
    } else {
    }
  } catch (error) {
    console.error(
      "Error removing ticker from watchlist",
      error.response || error
    );
  }
}

export async function getIsTickerFoundInWatchlist(symbol) {

  try {
    const url = `/get-ticker-found-in-watch-list?symbol=${symbol}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("fail to getIsTickerFoundInWatchlist", error);
    return { isFound: false };
  }
}

export async function apiGetPortfoliolist() {
  try {
    const response = await axios.get("/get-portfolio-list");
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

export async function apiGetPortfolioByStock(symbol) {
  console.log("apiGetPortfolioByTicker in api: ", symbol);

  try {
    const url = `/get-portfolio-by-stock?symbol=${symbol}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("fail to apiGetPortfolioByTicker", error);
    return { isFound: false };
  }
}

export async function apiPostBuyStock(json) {
  try {
    const response = await axios.post("/post-buy-stock", json);
    return response.data;
  } catch (error) {
    console.error("Error buy stock", error.response || error);
    return undefined;
  }
}

export async function apiPostSellStock(json) {
  try {
    const response = await axios.post("/post-sell-stock", json);
    return response.data;
  } catch (error) {
    console.error("Error sell stock", error.response || error);
    return undefined;
  }
}

export async function apiGetSummaryDetail(symbol) {
  try {
    const response = await axios.get("/get-summary-detail", {
      params: { symbol },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch suggestions", error);
    return { error: "Failed to fetch suggestions" };
  }
}

export async function apiGetSummaryCharts(params) {
  try {
    const response = await axios.get("/get-summary-charts", {
      params,
    });
    if (response.data.results !== undefined && response.data.results.length > 0) {
      return response.data;
    } else {
      const response = await axios.get("/get-summary-charts", {
        params,
      });
      return response.data;
    }
  } catch (error) {
    console.error("Failed to fetch summary charts", error);
    return { error: "Failed to fetch suggestions" };
  }
}

export async function apiGetTopNewsList(symbol) {
  try {
    const response = await axios.get("/get-top-news-list", {
      params: { symbol },
    });
    const list = response.data
      .filter(
        (item) =>
          item.source &&
          item.datetime &&
          item.headline &&
          item.summary &&
          item.url &&
          item.image
      )
      .slice(0, 20)
      .map((item) => {
        return {
          source: item.source,
          publishedDate: item.datetime,
          title: item.headline,
          description: item.summary,
          image: item.image,
          url: item.url,
        };
      });
    return list;
  } catch (error) {
    console.error("Failed to fetch summary charts", error);
    return { error: "Failed to fetch suggestions" };
  }
}

export async function apiGetInsightsData(symbol) {
  try {
    const response = await axios.get("/get-insights-data", {
      params: { symbol },
    });
    let totalChange = 0;
    let positiveChange = 0;
    let negativeChange = 0;
    let totalMspr = 0;
    let positiveMspr = 0;
    let negativeMspr = 0;
    response.data.data.forEach((item, index) => {
      const mspr = Number(item.mspr);
      const change = Number(item.change);
      totalMspr = totalMspr + mspr;
      if (mspr > 0) positiveMspr += mspr;
      if (mspr < 0) negativeMspr += mspr;
      totalChange = totalChange + change;
      if (change > 0) positiveChange += change;
      if (change < 0) negativeChange += change;
    });
    const jsonObj = {
      totalMspr,
      positiveMspr,
      negativeMspr,
      totalChange,
      positiveChange,
      negativeChange,
      symbol: response.data.symbol || "AAPL",
    };
    return jsonObj;
  } catch (error) {
    console.error("Failed to fetch apiGetInsightsData", error);
    return { error: "Failed to fetch apiGetInsightsData" };
  }
}

export async function apiGetInsightsCompanyEarning(symbol) {
  try {
    const response = await axios.get("/get-insights-company-earning", {
      params: { symbol },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch apiGetInsightsCompanyEarning", error);
    return { error: "Failed to fetch apiGetInsightsCompanyEarning" };
  }
}

export async function apiGetInsightsTrends(symbol) {
  try {
    const response = await axios.get("/get-insights-trends", {
      params: { symbol },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch apiGetInsightsTrends", error);
    return { error: "Failed to fetch apiGetInsightsTrends" };
  }
}

export async function apiGetCharts(symbol) {
  try {
    const response = await axios.get("/get-charts", {
      params: { symbol },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch apiGetCharts", error);
    return { error: "Failed to fetch apiGetCharts" };
  }
}

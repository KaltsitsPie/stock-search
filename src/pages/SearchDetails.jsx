import React, { useRef } from "react";
import { useEffect } from "react";
import { json, useLocation, useParams } from "react-router-dom";
import { useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Nav from "react-bootstrap/Nav";
import Summary from "../components/Summary";
import TopNews from "../components/TopNews";
import Charts from "../components/Charts";
import Insights from "../components/Insights";
import {
  apiGetCharts,
  apiGetInsightsCompanyEarning,
  apiGetInsightsData,
  apiGetInsightsTrends,
  apiGetPortfolioByStock,
  apiGetSummaryCharts,
  apiGetSummaryDetail,
  apiGetTopNewsList,
  apiPostBuyStock,
  apiPostSellStock,
  deleteRemoveTickerFromWatchlist,
  getIsTickerFoundInWatchlist,
  getStockDetail,
  postAddTickerToWatchlist,
} from "../api";

const SearchDetail = () => {
  const { ticker } = useParams();
  const location = useLocation();
  const [detail, setDetail] = useState({});
  const [isBought, setIsBought] = useState(false);
  const [stock, setStock] = useState({});
  const [wallet, setWallet] = useState(25000);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isInWatch, setIsInWatch] = useState(false);
  const [isNoResultShow, setIsNoResultShow] = useState(false);
  const [isWatchlistAddedShow, setIsWatchlistAddedShow] = useState(false);
  const [isWatchlistRemovedShow, setIsWatchlistRemovedShow] = useState(false);
  const [isBuyModalShow, setIsBuyModalShow] = useState(false);
  const [isSellModalShow, setIsSellModalShow] = useState(false);
  const [isBoughtAlertShow, setIsBoughtAlertShow] = useState(false);
  const [isSellAlertShow, setIsSellAlertShow] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [sellQuantity, setSellQuantity] = useState(0);
  const [activeTab, setActiveTab] = useState("Summary");
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth > 576);
  const [index, setIndex] = useState(0);
  const [companyPeers, setCompanyPeers] = useState({});
  const peers = useRef([]);
  const summaryCharts = useRef([]);
  const news = useRef([]);
  const insightsOrder = useRef({});
  const companyEarning = useRef([]);
  const trends = useRef([]);
  const hCharts = useRef({});
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isChartsDataLoaded, setIsChartsDataLoaded] = useState(false);
  const [isNewsDataLoaded, setIsNewsDataLoaded] = useState(false);
  const [isInsightsOrderDataLoaded, setIsInsightsOrderDataLoaded] =
    useState(false);
  const [isCompanyEarningDataLoaded, setIsCompanyEarningDataLoaded] =
    useState(false);
  const [isTrendsDataLoaded, setIsTrendsDataLoaded] = useState(false);
  const [isHChartsDataLoaded, setIsHChartsDataLoaded] = useState(false);

  const handleSelect = (selectedIndex, e) => {
    setIndex(selectedIndex);
  };

  const formatDate = (t) => {
    const date = new Date(Number(t));
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const handleStarOnClick = (tickerData) => {
    if (isInWatch) {
      setIsInWatch(false);
      setIsWatchlistRemovedShow(true);
      deleteRemoveTickerFromWatchlist(tickerData.ticker);
    } else {
      setIsInWatch(true);
      setIsWatchlistAddedShow(true);
      postAddTickerToWatchlist(tickerData).then((data) => {
      });
    }
  };

  const handleBuy = () => {
    setIsBuyModalShow(false);
    apiPostBuyStock({
      symbol: detail.ticker,
      quantity: quantity,
      companyName: detail.companyName,
    })
      .then((data) => {
        if (data.success) {
          setIsBoughtAlertShow(true);
          setIsBought(true);
          setQuantity(0);
        }
        if (data.wallet) {
          setWallet(Number(data.wallet));
        }
        if (data.stock) {
          setStock(data.stock);
        }
      })
      .catch((err) => {});
  };

  const handleSell = () => {
    setIsSellModalShow(false);
    apiPostSellStock({
      symbol: detail.ticker,
      quantity: sellQuantity,
      companyName: detail.companyName,
    })
      .then((data) => {
        if (data.success) {
          setIsSellAlertShow(true);
          setSellQuantity(0);
        }
        if (data.wallet) {
          setWallet(Number(data.wallet));
        }
        if (data.stock) {
          setStock(data.stock);
        }
        if (data.isSoldOut) {
          setIsBought(false);
        }
      })
      .catch((err) => {});
  };

  const handleQuantityChange = (e) => {
    const value = Math.max(0, e.target.value);
    setQuantity(value);
  };

  const handleSellQuantityChange = (e) => {
    let value = e.target.value;
    value = Math.max(0, e.target.value);
    setSellQuantity(value);
  };

  const fetchDetailAndSummaryData = (symbol, forcedUpdate=false) => {
    const savedSymbol = localStorage.getItem("savedSymbol");
    console.log("看这里! ")
    console.log("savedSymbol; " + savedSymbol);
    console.log("symbol: ", symbol);
    const savedDetail = JSON.parse(localStorage.getItem("savedDetail") || "{}");
    const savedSummaryCharts = JSON.parse(
      localStorage.getItem("savedSummaryCharts") || "{}"
    );

    if (
      savedDetail !== undefined &&
      savedDetail.ticker !== undefined &&
      savedDetail.ticker === symbol &&
      savedSummaryCharts !== undefined &&
      savedSymbol === symbol &&
      !forcedUpdate
    ) {
      console.log(
        "saved detail和summaryCharts! charts: ",
        savedSummaryCharts
      );
      setDetail(savedDetail);
      summaryCharts.current = savedSummaryCharts;
      setIsChartsDataLoaded(true);
      setIsPageLoading(false);
    } else {
      console.log(
        "call api, saved symbol: " +
          savedSymbol +
          ", saved detail: ",
        savedDetail
      );
      getStockDetail(symbol).then(async (data) => {
        if (data !== undefined && data.error === undefined && data.ticker) {
          const marketTime = new Date(Number(data.t) * 1000).getTime();
          const status =
            new Date().getTime() - marketTime >= 300000 ? false : true;
          const d = {
            ticker: data.ticker,
            companyName: data.name,
            exchangeCode: data.exchange,
            lastPrice: data.c,
            change: Number(data.d).toFixed(2),
            changePercentage: Number(data.dp).toFixed(2) + "%",
            currentTimestamp: data.t * 1000,
            status,
            logo: data.logo,
            highPrice: Number(data.h).toFixed(2),
            lowPrice: Number(data.l).toFixed(2),
            openPrice: Number(data.o).toFixed(2),
            prevClose: Number(data.pc).toFixed(2),
            IPOStartDate: data.ipo,
            industry: data.finnhubIndustry,
            webpage: data.weburl,
          };
          setDetail(d);
          localStorage.setItem("savedDetail", JSON.stringify(d));
          console.log("detail have saved: ", d);
          const reqBody = {
            symbol: symbol,
            status,
            closeTimeStamp: data.t * 1000,
          };
          apiGetSummaryCharts(reqBody).then((data) => {
            setIsChartsDataLoaded(true);
            summaryCharts.current = data;
            localStorage.setItem("savedSummaryCharts", JSON.stringify(data));
            setIsPageLoading(false);
            console.log("savedSummaryCharts:  ", data);
          });
        } else {
            setIsNoResultShow(true);
        }
      });
    }
  };

  const fetchInsightsOrder = async (symbol) => {
    const savedSymbol = localStorage.getItem("savedSymbol");
    const savedInsightsOrder = JSON.parse(
      localStorage.getItem("savedInsightsOrder") || "{}"
    );
    if (
      savedInsightsOrder !== undefined &&
      savedInsightsOrder.symbol !== undefined &&
      savedInsightsOrder.symbol === symbol
    ) {
    //   console.log("savedInsightsOrder： ", savedInsightsOrder);
      insightsOrder.current = savedInsightsOrder;
      setIsInsightsOrderDataLoaded(true);
    } else {
    //   console.log("savedInsightsOrder ");
      apiGetInsightsData(symbol).then((data) => {
        insightsOrder.current = data;
        setIsInsightsOrderDataLoaded(true);
        localStorage.setItem(
          "savedInsightsOrder",
          JSON.stringify(insightsOrder.current)
        );
      });
    }
  };

  const fetchInsightsTrends = async (symbol) => {
    const savedSymbol = localStorage.getItem("savedSymbol");
    const savedTrends = JSON.parse(localStorage.getItem("savedTrends") || "[]");
    if (
      savedTrends !== undefined &&
      savedTrends.length > 0 &&
      savedTrends[0].symbol !== undefined &&
      savedTrends[0].symbol === symbol &&
      savedSymbol === symbol
    ) {
    //   console.log(" savedTrends:  ", savedTrends);
      trends.current = savedTrends;
      setIsTrendsDataLoaded(true);
    } else {
    //   console.log(" savedTrends ");
      apiGetInsightsTrends(symbol).then((data) => {
        trends.current = data;
        setIsTrendsDataLoaded(true);
        localStorage.setItem("savedTrends", JSON.stringify(trends.current));
      });
    }
  };

  const fetchInsightsCompanyEarning = async (symbol) => {
    const savedSymbol = localStorage.getItem("savedSymbol");
    const savedCompanyEarning = JSON.parse(
      localStorage.getItem("savedCompanyEarning") || "[]"
    );
    if (
      savedCompanyEarning !== undefined &&
      savedCompanyEarning.length > 0 &&
      savedCompanyEarning[0].symbol !== undefined &&
      savedCompanyEarning[0].symbol === symbol &&
      savedSymbol === symbol
    ) {
    //   console.log(" savedCompanyEarning:  ", savedCompanyEarning);
      companyEarning.current = savedCompanyEarning;
      setIsCompanyEarningDataLoaded(true);
    } else {
    //   console.log(" savedCompanyEarning ");
      apiGetInsightsCompanyEarning(symbol).then((data) => {
        companyEarning.current = data;
        setIsCompanyEarningDataLoaded(true);
        // console.log("companyEarning.current: ", companyEarning.current);
        localStorage.setItem(
          "savedCompanyEarning",
          JSON.stringify(companyEarning.current)
        );
      });
    }
  };

  const fetchTopNewsList = async (symbol) => {
    const savedSymbol = localStorage.getItem("savedSymbol");
    const savedNews = JSON.parse(localStorage.getItem("savedNews") || "[]");
    if (
      savedNews !== undefined &&
      savedNews.length > 0 &&
      savedSymbol === symbol
    ) {
      console.log(" use savedNews:  ", savedNews);
      console.log("use saved symbol to get saved news: ", savedSymbol);
      news.current = savedNews;
      setIsNewsDataLoaded(true);
    } else {
    //   console.log(" savedNews ");
      apiGetTopNewsList(symbol).then((data) => {
        news.current = data;
        setIsNewsDataLoaded(true);
        localStorage.setItem("savedNews", JSON.stringify(news.current));
      });
    }
  };

  const fetchPeers = async (symbol) => {
    const savedSymbol = localStorage.getItem("savedSymbol");
    const savedPeers = JSON.parse(localStorage.getItem("savedPeers") || "{}");
    if (
      savedPeers !== undefined &&
      savedPeers.companyPeers !== undefined &&
      savedPeers.companyPeers.length > 0 &&
      savedSymbol === symbol
    ) {
    //   console.log(" savedPeers:  ", savedPeers);
    //   console.log("saved symbol: ", savedSymbol);
      peers.current = savedPeers;
      setIsDataLoaded(true);
    } else {
      apiGetSummaryDetail(symbol).then((data) => {
        peers.current = data;
        setIsDataLoaded(true);
        localStorage.setItem("savedPeers", JSON.stringify(peers.current));
      });
    }
  };

  const fetchGetPortfolioByStock = async (symbol) => {
    apiGetPortfolioByStock(symbol).then((data) => {
      setIsBought(data.isBought || false);
      setWallet(data.wallet || 25000);
      setStock(data.stock || stock || {});
      localStorage.setItem("savedIsBought", isBought.toString());
      localStorage.setItem("savedWallet", wallet.toString());
      localStorage.setItem("savedStock", JSON.stringify(stock));
    });
  };

  const fetchCharts = async (symbol) => {
    const savedSymbol = localStorage.getItem("savedSymbol");
    const savedCharts = JSON.parse(localStorage.getItem("savedCharts") || "{}");
    if (
      savedCharts !== undefined &&
      savedCharts.ticker !== undefined &&
      savedCharts.ticker === symbol &&
      savedSymbol === symbol
    ) {
      hCharts.current = savedCharts;
      setIsHChartsDataLoaded(true);
    } else {
      apiGetCharts(symbol).then((data) => {
        hCharts.current = data;
        localStorage.setItem("savedCharts", JSON.stringify(data));
        setIsHChartsDataLoaded(true);
      });
    }
  };

  const fetchIsTickerFoundInWatchlist = async (symbol) => {
    const savedSymbol = localStorage.getItem("savedSymbol");
    getIsTickerFoundInWatchlist(symbol).then((data) => {
      setIsInWatch(data.isFound || false);
      localStorage.setItem("savedIsInwatch", isInWatch.toString());
    });
  };

  useEffect(() => {
    setIsNoResultShow(false);
    console.log("[ticker] 调用！！！", ticker);
    if (ticker === undefined || ticker === "") {
      return;
    }
    const apiCount = 3;
    let apiCountNow = 0;
    const savedSymbol = localStorage.getItem("savedSymbol");
    setIsPageLoading(true);
    // console.log("将要: fetchDetailAndSummaryData");
    fetchDetailAndSummaryData(ticker);

    fetchIsTickerFoundInWatchlist(ticker).then(() => {
    });

    fetchGetPortfolioByStock(ticker).then(() => {
    });

    fetchPeers(ticker).then(() => {
    //   apiCountNow = apiCountNow + 1;
    //   if (apiCount === apiCountNow) setIsPageLoading(false);
    });

    fetchTopNewsList(ticker).then(() => {
    });

    fetchCharts(ticker).then(() => {});

    fetchInsightsCompanyEarning(ticker).then(() => {
    });

    fetchInsightsTrends(ticker).then(() => {
    });

    fetchInsightsOrder(ticker).then(() => {
    });
  }, [ticker]);

  useEffect(() => {
    console.log("[location.pathname]被调用!", location.pathname);

  }, [location.pathname]);

  useEffect(() => {
    localStorage.setItem("savedSymbol", ticker);
    console.log("**在useEffect[]中，更新了saveditem: " + ticker)
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth > 576);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    // detail.status
    if (detail.status) {
      fetchDetailAndSummaryData(ticker, true);
      const intervalId = setInterval(() => fetchDetailAndSummaryData(ticker, true), 15000);
      return () => clearInterval(intervalId);
    }
  }, [detail.status]); 

  useEffect(() => {
    console.log("[detail, summaryCharts.current] change");
    if (detail !== undefined && detail && detail.ticker !== undefined && summaryCharts.current !== undefined && summaryCharts.current) {
      // console.log("加载完毕, 隐藏load page,  summaryCharts.current");  
      // setIsPageLoading(false); 
    }
  }, [detail, summaryCharts.current]); 




  const renderTabContent = () => {
    switch (activeTab) {
      case "Summary":
        console.log("isLoaded: ", isDataLoaded, isChartsDataLoaded);
        return (
          isDataLoaded &&
          isChartsDataLoaded && (
            <Summary
              detail={detail}
              companyPeers={peers.current}
              charts={summaryCharts.current}
            />
          )
        );
      case "TopNews":
        return isNewsDataLoaded && <TopNews news={news.current} />;
      case "Charts":
        return isHChartsDataLoaded && <Charts hCharts={hCharts.current} />;
      case "Insights":
        return (
          isInsightsOrderDataLoaded &&
          isCompanyEarningDataLoaded &&
          isTrendsDataLoaded && (
            <Insights
              detail={detail}
              insightsOrder={insightsOrder.current}
              companyEarning={companyEarning.current}
              trends={trends.current}
            />
          )
        );
      default:
        return <div></div>;
    }
  };

  return (
    <div className="mt-1">
      {(isPageLoading && !isNoResultShow) && (
        <div className="container-fluid d-flex justify-content-center">
          <div
            className="spinner-border text-primary input-loading"
            role="status"
          ></div>
        </div>
      )}
      {isNoResultShow && (
        <div className="container-fluid">
            {/* No data found */}
            <Alert
              variant="danger"
              className="custom-alert py-0"
              show={isNoResultShow}
              onClose={() => setIsNoResultShow(false)}
            >
              <div className="container-fluid">
                <div className="row">
                  <p className="text-center py-0 custom-alert-text">
                    No data found. Please enter a valid Ticker
                  </p>
                </div>
              </div>
            </Alert>
        </div>
      )}
      {(!isPageLoading && !isNoResultShow) && (
        <div className="container search-detail-wrapper" role="status">
          <div className="row">
            

            {/* added to watch list */}
            <Alert
              variant="success"
              className="custom-alert py-0"
              show={isWatchlistAddedShow}
              onClose={() => setIsWatchlistAddedShow(false)}
            >
              <div className="container-fluid">
                <div className="row">
                  <p className="text-center py-0 custom-alert-text">
                    {detail.ticker} added to Watchlist.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsWatchlistAddedShow(false)}
                className="close custom-alert-close-btn text-center position-absolute bg-transparent"
                aria-label="Close"
              >
                <span aria-hidden="true" className="text-secondary">
                  &times;
                </span>
              </button>
            </Alert>

            {/* removed from watch list */}
            <Alert
              variant="danger"
              className="custom-alert py-0"
              show={isWatchlistRemovedShow}
              onClose={() => setIsWatchlistRemovedShow(false)}
            >
              <div className="container-fluid">
                <div className="row">
                  <p className="text-center py-0 custom-alert-text">
                    {detail.ticker} removed from Watchlist.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsWatchlistRemovedShow(false)}
                className="close custom-alert-close-btn text-center position-absolute bg-transparent"
                aria-label="Close"
              >
                <span aria-hidden="true" className="text-secondary">
                  &times;
                </span>
              </button>
            </Alert>

            {/* Bought stock successfully */}
            <Alert
              variant="success"
              className="custom-alert py-0"
              show={isBoughtAlertShow}
              onClose={() => setIsBoughtAlertShow(false)}
            >
              <div className="container-fluid">
                <div className="row">
                  <p className="text-center py-0 custom-alert-text">
                    {detail.ticker} bought successfully.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBoughtAlertShow(false)}
                className="close custom-alert-close-btn text-center position-absolute bg-transparent"
                aria-label="Close"
              >
                <span aria-hidden="true" className="text-secondary">
                  &times;
                </span>
              </button>
            </Alert>

            {/* Sell stock successfully */}
            <Alert
              variant="danger"
              className="custom-alert py-0"
              show={isSellAlertShow}
              onClose={() => setIsSellAlertShow(false)}
            >
              <div className="container-fluid">
                <div className="row">
                  <p className="text-center py-0 custom-alert-text">
                    {detail.ticker} sold successfully.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSellAlertShow(false)}
                className="close custom-alert-close-btn text-center position-absolute bg-transparent"
                aria-label="Close"
              >
                <span aria-hidden="true" className="text-secondary">
                  &times;
                </span>
              </button>
            </Alert>
          </div>

          <div className="row">
            {/* stock-detail row 1 begin */}
            <div className="col">
              <div className="d-flex flex-column">
                <div className="d-flex justify-content-center align-items-center gap-2 mt-1 mb-0">
                  <p className=" search-detail-3-1 text-body mb-0">
                    {detail.ticker}
                  </p>
                  {!isInWatch && (
                    <button
                      onClick={() => handleStarOnClick(detail)}
                      className="bg-transparent"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-star"
                        viewBox="0 0 16 16"
                      >
                        <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.56.56 0 0 0-.163-.505L1.71 6.745l4.052-.576a.53.53 0 0 0 .393-.288L8 2.223l1.847 3.658a.53.53 0 0 0 .393.288l4.052.575-2.906 2.77a.56.56 0 0 0-.163.506l.694 3.957-3.686-1.894a.5.5 0 0 0-.461 0z" />
                      </svg>
                    </button>
                  )}
                  {isInWatch && (
                    <button
                      onClick={() => handleStarOnClick(detail)}
                      className="text-warning bg-transparent"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-star"
                        viewBox="0 0 16 16"
                      >
                        <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                      </svg>
                    </button>
                  )}
                </div>

                <p className="d-flex justify-content-center search-detail-3-2 text-secondary mt-0 mb-0">
                  {detail.companyName}
                </p>
                <p className="d-flex justify-content-center search-detail-3-3 text-secondary mt-1 mb-0">
                  {detail.exchangeCode}
                </p>
                <div className="d-flex justify-content-center align-items-center gap-2 mt-1 mb-0">
                  <button
                    type="button"
                    className="btn btn-sm btn-success"
                    onClick={() => setIsBuyModalShow(true)}
                  >
                    Buy
                  </button>
                  {isBought && (
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => setIsSellModalShow(true)}
                    >
                      Sell
                    </button>
                  )}
                </div>
              </div>
            </div>
            {/* stock-detail row 1 end */}

            {/* stock-detail row 2 begin */}
            <div className="col">
              <div className="d-flex flex-column">
                <img src={detail.logo} alt="Company Logo" className="logo" />
                <p
                  className={`market-status mt-5 ${
                    detail.status ? "text-success" : "text-danger"
                  }`}
                >
                  {detail.status
                    ? "Market is Open"
                    : `Market closed on ${formatDate(detail.currentTimestamp)}`}
                </p>
              </div>
            </div>
            {/* stock-detail row 2 end */}

            {/* stock-detail row 3 begin */}
            <div className="col">
              <div className="d-flex flex-column bd-highlight mt-0 mb-0">
                <p
                  className={`d-flex justify-content-center search-detail-3-1 ${
                    detail.change > 0
                      ? "text-success"
                      : detail.change < 0
                      ? "text-danger"
                      : "text-body"
                  } mt-0 mb-0`}
                >
                  {detail.lastPrice}
                </p>
                <div className="d-flex justify-content-center align-items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    fill="currentColor"
                    className={`bi bi-triangle-fill ${
                      detail.change > 0 ? "text-success" : "text-danger"
                    } text-success`}
                    viewBox="0 0 16 16"
                  >
                    {detail.change > 0 && (
                      <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z" />
                    )}
                    {detail.change < 0 && (
                      <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                    )}
                  </svg>
                  <p
                    className={`d-flex justify-content-center search-detail-3-2 ${
                      detail.change > 0
                        ? "text-success"
                        : detail.change < 0
                        ? "text-danger"
                        : "text-body"
                    } mt-0 mb-0`}
                  >
                    {detail.change} ({detail.changePercentage})
                  </p>
                </div>
                <p className="d-flex justify-content-center search-detail-3-3 text-secondary mt-1 mb-0">
                  {formatDate(new Date().getTime())}
                </p>
              </div>
            </div>
            {/* stock-detail row 3 end */}
          </div>
          {/* ---- Buy Modal begin  ----- */}
          <Modal show={isBuyModalShow} onHide={() => setIsBuyModalShow(false)}>
            <Modal.Header closeButton>
              <Modal.Title>{detail.ticker}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="px-4">
              <p className="modal-text my-0">
                Current Price: {Number(detail.lastPrice).toFixed(2)}
              </p>
              <p className="modal-text my-1">
                Money in Wallet: ${wallet.toFixed(2)}
              </p>
              <Form.Group as={Row} controlId="formQuantity">
                <Form.Label column sm={2}>
                  <p className="modal-text my-0">Quantity:</p>
                </Form.Label>
                <Col sm={10}>
                  <Form.Control
                    type="number"
                    value={quantity}
                    onChange={handleQuantityChange}
                    min="0"
                  />
                </Col>
              </Form.Group>
              {detail.lastPrice * quantity > wallet && (
                <p className="text-danger modal-text mb-0 mt-1">
                  Not enough money in wallet!
                </p>
              )}
            </Modal.Body>
            <Modal.Footer className="justify-content-between">
              <p className="text-left">
                Total: {(detail.lastPrice * quantity).toFixed(2)}
              </p>
              <Button
                variant="success"
                onClick={handleBuy}
                disabled={detail.lastPrice * quantity > wallet || quantity <= 0}
              >
                Buy
              </Button>
            </Modal.Footer>
          </Modal>
          {/* ---- Buy Modal end  ----- */}

          {/* ---- Sell Modal begin  ----- */}
          <Modal
            show={isSellModalShow}
            onHide={() => setIsSellModalShow(false)}
          >
            <Modal.Header closeButton>
              <Modal.Title>{detail.ticker}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="px-4">
              <p className="modal-text my-0">
                Current Price: {Number(detail.lastPrice).toFixed(2)}
              </p>
              <p className="modal-text my-1">
                Money in Wallet: ${wallet.toFixed(2)}
              </p>
              <Form.Group as={Row} controlId="sellFormQuantity">
                <Form.Label column sm={2}>
                  <p className="modal-text my-0">Quantity:</p>
                </Form.Label>
                <Col sm={10}>
                  <Form.Control
                    type="number"
                    value={sellQuantity}
                    onChange={handleSellQuantityChange}
                    min="0"
                  />
                </Col>
              </Form.Group>
              {sellQuantity > stock.quantity && (
                <p className="text-danger modal-text mb-0 mt-1">
                  You cannot sell the stocks that you don't have!
                </p>
              )}
            </Modal.Body>
            <Modal.Footer className="justify-content-between">
              <p className="text-left">
                Total: {(detail.lastPrice * sellQuantity).toFixed(2)}
              </p>
              <Button
                variant="success"
                onClick={handleSell}
                disabled={sellQuantity > stock.quantity || sellQuantity <= 0}
              >
                Sell
              </Button>
            </Modal.Footer>
          </Modal>
          {/* ---- Sell Modal end  ----- */}

          {/* ---- results tabs bar begin ---- */}
          <div className="container">
            {/* TODO.zyc ： */}
            {isLargeScreen && (
              <Nav
                variant="underline"
                className="d-flex m-0 p-0"
                defaultActiveKey="Summary"
              >
                <Nav.Item
                  className="flex-grow-1 m-0 p-0"
                  onClick={() => setActiveTab("Summary")}
                >
                  {/* Summary */}
                  <Nav.Link
                    className="result-nav-link text-secondary text-center"
                    eventKey="Summary"
                  >
                    Summary
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item
                  className="flex-grow-1 m-0 p-0"
                  onClick={() => setActiveTab("TopNews")}
                >
                  {/* Top News */}
                  <Nav.Link
                    className="result-nav-link text-secondary text-center"
                    eventKey="TopNews"
                  >
                    Top News
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item
                  className="flex-grow-1 m-0 p-0"
                  onClick={() => setActiveTab("Charts")}
                >
                  {/* Charts */}
                  <Nav.Link
                    className="result-nav-link text-secondary text-center"
                    eventKey="Charts"
                  >
                    Charts
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item
                  className="flex-grow-1 m-0 p-0"
                  onClick={() => setActiveTab("Insights")}
                >
                  {/* Insights */}
                  <Nav.Link
                    className="result-nav-link text-secondary text-center"
                    eventKey="Insights"
                  >
                    Insights
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            )}

            {!isLargeScreen && (
              <Nav
                variant="underline"
                className="d-flex m-0 p-0"
                defaultActiveKey="Summary"
              >
                <Nav.Item
                  className="flex-grow-1 m-0 p-0"
                  onClick={() => setActiveTab("Summary")}
                >
                  {/* Summary */}
                  <Nav.Link
                    className="result-nav-link text-secondary text-center"
                    eventKey="Summary"
                  >
                    Summary
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item
                  className="flex-grow-1 m-0 p-0"
                  onClick={() => setActiveTab("TopNews")}
                >
                  {/* Top News */}
                  <Nav.Link
                    className="result-nav-link text-secondary text-center"
                    eventKey="TopNews"
                  >
                    Top News
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item
                  className="flex-grow-1 m-0 p-0"
                  onClick={() => setActiveTab("Charts")}
                >
                  {/* Charts */}
                  <Nav.Link
                    className="result-nav-link text-secondary text-center"
                    eventKey="Charts"
                  >
                    Charts
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item
                  className="flex-grow-1 m-0 p-0"
                  onClick={() => setActiveTab("Insights")}
                >
                  {/* Insights */}
                  <Nav.Link
                    className="result-nav-link text-secondary text-center"
                    eventKey="Insights"
                  >
                    Insights
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            )}  
          </div>
          {/* ---- results tabs bar end ---- */}

          {/* ---- results tabs content begin ---- */}
          <div className="container">{renderTabContent()}</div>
        </div>
      )}

      {/* ---- stock detial begin ----- */}
      <div className="container search-detail-wrapper"></div>

      {/* ---- stock detial end  ----- */}

      {/* ---- results tabs bar end ---- */}
    </div>
  );
};

export default SearchDetail;

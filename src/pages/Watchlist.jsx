import React from "react";
import { useEffect } from "react";
import { deleteRemoveTickerFromWatchlist, getStockWatchlist } from "../api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from 'react-bootstrap/Alert';
import Footer from "../components/Footer";

const Watchlist = () => {
  const [tickers, setTickers] = useState([]);
  const [ isPageLoading, setIsPageLoading ] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsPageLoading(true);
    setTickers([]);
    getStockWatchlist().then((data) => {
      setIsPageLoading(false);
      if (data !== undefined && data.length > 0) {
        setTickers(data);
      }
    });
  }, []);

  const handleTickerOnclick = (symbol) => {
    const ticker = symbol || "AAPL";
    navigate(`/search/${ticker}`)
  };

  const handleDeleteOnClick = (symbol, event) => {
    event.stopPropagation();
    setTickers(tickers.filter(ticker => ticker.ticker !== symbol));
    deleteRemoveTickerFromWatchlist(symbol);
  };

  return (
    <div className="container watchlistWrapper bg-white mx-0 px-0">
        
      <div className="row bg-white mx-0 px-0 border-0 bg-white">
        <div className="col bg-white"></div>
        <div className="col-12 col-sm-8 bg-white mx-0">
          <div className="container-fluid bg-white mx-0">
            <div className="row">
              <h1 className="titleWrapper mt-4">My Watchlist</h1>
            </div>

            {isPageLoading && (
                <div className="container-fluid d-flex justify-content-center">
                    <div
                    className="spinner-border text-primary input-loading"
                    role="status"
                    >
                    </div>
                </div>
                
            )}

            {(!isPageLoading && tickers !== undefined && tickers.length === 0) && (
                <Alert variant="warning" className="custom-alert py-0">
                    <div className="container-fluid">
                        <div className="row">
                            <p className="text-center py-0 custom-alert-text">Currently you don't have any stock in your watchlist.</p>
                        </div>
                    </div>
                </Alert>
            )}

            {!isPageLoading && tickers.map((ticker) => (
              <div className="row p-0 watch-list-card" key={ticker.ticker} onClick={() => handleTickerOnclick(ticker.ticker)}>
                <div className="container-fulid border rounded mb-2 p-0">
                    
                <button className="row m-0 p-2 bg-white watch-list-clear-btn" onClick={(event) => handleDeleteOnClick(ticker.ticker, event)}><p className="text-center m-0 p-0">✕</p></button>
                  <div className="row px-2">
                    <div className="col-6">
                      <div className="d-flex flex-column">
                        <div className="text-left my-0">
                          <p className="watch-list-title my-0">
                            {ticker.ticker || "ticker"}
                          </p>
                        </div>
                        <div className="text-left mt-0">
                          <p className="watch-list-subtitle text-body mt-1 mb-2">
                            {ticker.companyName || "company name"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="col-6">
                      <div className="d-flex flex-column">
                        <p className={`d-flex justify-content-left watch-list-title my-0 ${ticker.change > 0 ? "text-success" : (ticker.change < 0 ? "text-danger" : "text-body")} mt-0 mb-0`}>
                          {ticker.lastPrice}
                        </p>
                        <div className="d-flex justify-content-left align-items-center gap-2 mt-1 mb-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            fill="currentColor"
                            className={`bi bi-triangle-fill ${
                              ticker.change > 0 ? "text-success" : "text-danger"
                            } text-success`}
                            viewBox="0 0 16 16"
                          >
                            {ticker.change > 0 && (
                              <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z" />
                            )}
                            {ticker.change < 0 && (
                              <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                            )}
                          </svg>
                          <p className={`d-flex justify-content-left watch-list-subtitle ${ticker.change > 0 ? "text-success" : (ticker.change < 0 ? "text-danger" : "text-body")} mt-0 mb-0`}>
                            {ticker.change} ({ticker.changePercentage})
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="col mx-0 px-0 bg-white border-0"></div>
      </div>
      {/* <Footer /> */}
      <div className="row result-1-space"></div>
    </div>
  );
};

export default Watchlist;

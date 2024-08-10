import React from "react";
import { useEffect } from "react";
import {
  apiGetPortfoliolist,
  apiPostBuyStock,
  apiPostSellStock
} from "../api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Footer from "../components/Footer";

const Watchlist = () => {
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [stocks, setStocks] = useState([]);
  const [wallet, setWallet] = useState(25000);
  const [isBuyModalShow, setIsBuyModalShow] = useState(false);
  const [isSellModalShow, setIsSellModalShow] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [sellQuantity, setSellQuantity] = useState(0);
  const [choosenIndex, setChoosenIndex] = useState(-1);
  const [alerts, setAlerts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setIsPageLoading(true);
    setStocks([]);
    apiGetPortfoliolist().then((data) => {
      setIsPageLoading(false);
      if (data !== undefined) {
        setWallet(data.wallet || 25000);
        setStocks(data.stocks || []);
      }
    });
  }, []);

  const getTicker = () => {
    if (
      choosenIndex > -1 &&
      stocks !== undefined &&
      stocks.length > choosenIndex
    ) {
      return stocks[choosenIndex];
    } else {
      return {
        ticker: "AAPL",
        companyName: "Apple Inc",
        totalCost: 173,
        change: 0.10,
        currentPrice: 183.14
      };
    }
  };

  const handleTickerOnclick = (symbol) => {
    const ticker = symbol || "AAPL";
    navigate(`/search/${ticker}`);
  };

  const handleBuyOnClick = (index, event) => {
    event.stopPropagation();
    setChoosenIndex(index);
    setIsBuyModalShow(true);
  };

  const handleSellOnClick = (index, event) => {
    event.stopPropagation();
    setChoosenIndex(index);
    setIsSellModalShow(true);
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

  const handleBuy = () => {
    setIsBuyModalShow(false);
    const stock = getTicker();
    apiPostBuyStock({
      symbol: stock.ticker,
      quantity: quantity,
      companyName: stock.companyName,
    })
      .then((data) => {
        if (data.success) {
          handleBuySellSuccess(true, stock.ticker);
          // setIsBought(true);
          setQuantity(0);
        }
        if (data.wallet) {
          setWallet(Number(data.wallet));
        }
        apiGetPortfoliolist().then((data) => {
          setIsPageLoading(false);
          if (data !== undefined) {
            setWallet(data.wallet || 25000);
            setStocks(data.stocks || []);
          }
        });
      })
      .catch((err) => {});
    setChoosenIndex(-1);
    // } else {
    //   return;
    // }
  };

  const handleSell = () => {
    setIsSellModalShow(false);
    const stock = getTicker();
    // if (choosenIndex >= 0) {
    // const stock = stocks[choosenIndex];
    apiPostSellStock({
      symbol: stock.ticker,
      quantity: sellQuantity,
      companyName: stock.companyName,
    })
      .then((data) => {
        if (data.success) {
          handleBuySellSuccess(false, stock.ticker);
          // setIsBought(true);
          setSellQuantity(0);
        }
        if (data.wallet) {
          setWallet(Number(data.wallet));
        }
        apiGetPortfoliolist().then((data) => {
          setIsPageLoading(false);
          if (data !== undefined) {
            setWallet(data.wallet || 25000);
            setStocks(data.stocks || []);
          }
        });
      })
      .catch((err) => {});
    setChoosenIndex(-1);
    // } else {
    //   return;
    // }
  };

  const handleAlertCloseOnClick = (indexToRemove) => {
    setAlerts(currentAlerts => currentAlerts.filter((_, index) => index !== indexToRemove));
  };

  const handleBuySellSuccess = (isBought=true, symbol="AAPL") => {
    const newAlert = { isBought, symbol };
    setAlerts([...alerts, newAlert]);
  };

  return (
    <div className="container watchlistWrapper bg-white mx-0 px-0">
      <div className="row bg-white mx-0 px-0 border-0 bg-white">
        <div className="col bg-white"></div>
        <div className="col-12 col-sm-8 bg-white mx-0">
          <div className="container-fluid bg-white mx-0 mt-4">
            {/* Alert begin */}
            {alerts.map((alert, index) => (
              <Alert
                variant={alert.isBought ? "success" : "danger"}
                className="custom-alert py-0"
                onClose={() =>handleAlertCloseOnClick(index)}
              >
                <div className="container-fluid">
                  <div className="row">
                    <p className="text-center py-0 custom-alert-text">
                      {alert.symbol} {alert.isBought ? "bought" : "sold"} successfully.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>handleAlertCloseOnClick(index)}
                  className="close custom-alert-close-btn text-center position-absolute bg-transparent"
                  aria-label="Close"
                >
                  <span aria-hidden="true" className="text-secondary">
                    &times;
                  </span>
                </button>
              </Alert>
            ))}
            {/* Alert end */}

            <div className="row">
              <h1 className="mt-4 mb-0">My Portfolio</h1>
            </div>

            <div className="row">
              <h5 className="mt-3 mb-2">
                Money in Wallet: ${Number(wallet).toFixed(2)}
              </h5>
            </div>

            {isPageLoading && (
              <div className="container-fluid d-flex justify-content-center">
                <div
                  className="spinner-border text-primary input-loading"
                  role="status"
                ></div>
              </div>
            )}

            {!isPageLoading && stocks !== undefined && stocks.length === 0 && (
              <Alert variant="warning" className="custom-alert py-0">
                <div className="container-fluid">
                  <div className="row">
                    <p className="text-center py-0 custom-alert-text">
                      Currently you don't have any stock.
                    </p>
                  </div>
                </div>
              </Alert>
            )}

            {!isPageLoading &&
              stocks.map((stock, index) => (
                <Modal.Dialog className="border rounded mb-3" key={stock.ticker} onClick={() => handleTickerOnclick(stock.ticker)}>
                  <Modal.Header className="bg-light m-0 p-0 border-bottom portfolio-card-header">
                    {/* <Modal.Title> */}
                    <div className="d-flex flex-row align-items-end m-0 mx-1 p-0 ">
                      <div className="portfolio-title m-0 px-2 py-0">
                      {/* p-2 pb-0 */}
                          <p className=" m-0 p-0">
                            {stock.ticker || "AAPL"}
                          </p>
                      </div>
                      <div className="portfolio-subtitle flex-grow-1  m-0 pl-0 pr-2 py-0">
                        <p className="text-secondary align-self-end  m-0 p-0">
                          {stock.companyName || "Apple Inc"}
                        </p>
                      </div>
                    </div>
                    {/* </Modal.Title> */}
                  </Modal.Header>
                  <Modal.Body className="px-2 py-3">
                    <div className="container-fluid p-0 m-0">
                      <div className="row p-0 m-0 gap-1">
                        <div className="col-5 p-0 m-0">
                          <div className="d-flex flex-column p-0 m-0">
                            <div className="container-fluid p-0 m-0">
                              {/* quantity */}
                              <div className="row p-0 m-0">
                                <div className="col-6 p-0 m-0">
                                  <p className="text-left portfolio-text p-0 m-0">
                                    Quantity:
                                  </p>
                                </div>
                                <div className="col-6">
                                  <p className="text-right portfolio-text p-0 m-0 portfolio-text-right">
                                    {Number(stock.quantity).toFixed(2)}
                                  </p>
                                </div>
                              </div>

                              {/* Avg */}
                              <div className="row p-0 m-0">
                                <div className="col-6 p-0 m-0">
                                  <p className="text-left portfolio-text p-0 m-0">
                                    Avg. Cost / Share:
                                  </p>
                                </div>
                                <div className="col-6">
                                  <p className="text-right portfolio-text p-0 m-0 portfolio-text-right">
                                    {Number(stock.avgCostPerShare).toFixed(2)}
                                  </p>
                                </div>
                              </div>

                              {/* total cost */}
                              <div className="row p-0 m-0">
                                <div className="col-6 p-0 m-0">
                                  <p className="text-left portfolio-text p-0 m-0">
                                    Total Cost:
                                  </p>
                                </div>
                                <div className="col-6">
                                  <p className="text-right portfolio-text p-0 m-0 portfolio-text-right">
                                    {Number(stock.totalCost).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="col-1 p-0 m-0"></div>

                        <div className="col-5 p-0 m-0">
                          <div className="d-flex flex-column p-0 m-0">
                            <div className="container-fluid p-0 m-0">
                              {/* change */}
                              <div className="row p-0 m-0">
                                <div className="col-6 p-0 m-0">
                                  <p className="text-left portfolio-text p-0 m-0">
                                    Change:
                                  </p>
                                </div>
                                <div className="col-6">
                                  <div className="d-flex justify-content-start align-items-center gap-1">
                                    {stock.color !== "text-body" && (
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="12"
                                        height="12"
                                        fill="currentColor"
                                        className={`bi bi-triangle-fill ${stock.color} text-success`}
                                        viewBox="0 0 16 16"
                                      >
                                        {stock.change > 0 && (
                                          <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z" />
                                        )}
                                        {stock.change < 0 && (
                                          <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                                        )}
                                      </svg>
                                    )}
                                    <p
                                      className={`d-flex justify-content-center portfolio-text ${stock.color} mt-0 mb-0`}
                                    >
                                      {Number(stock.change).toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Current Price */}
                              <div className="row p-0 m-0">
                                <div className="col-6 p-0 m-0">
                                  <p className="text-left portfolio-text p-0 m-0">
                                    Current Price:
                                  </p>
                                </div>
                                <div className="col-6">
                                  <p
                                    className={`text-right portfolio-text p-0 m-0 portfolio-text-right ${stock.color}`}
                                  >
                                    {Number(stock.currentPrice).toFixed(2)}
                                  </p>
                                </div>
                              </div>

                              {/* Market Value */}
                              <div className="row p-0 m-0">
                                <div className="col-6 p-0 m-0">
                                  <p className="text-left portfolio-text p-0 m-0">
                                    Market Value:
                                  </p>
                                </div>
                                <div className="col-6">
                                  <p
                                    className={`text-right portfolio-text p-0 m-0 portfolio-text-right ${stock.color}`}
                                  >
                                    {Number(
                                      stock.quantity * stock.currentPrice
                                    ).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Modal.Body>
                  <Modal.Footer className="justify-content-start px-2 bg-light border-top portfolio-card-header">
                    <button
                      type="button"
                      className="btn btn-sm btn-success my-2"
                      onClick={(event) => handleBuyOnClick(index, event)}
                    >
                      Buy
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-danger my-2 mx-2"
                      onClick={(event) => handleSellOnClick(index, event)}
                    >
                      Sell
                    </button>
                  </Modal.Footer>
                </Modal.Dialog>
              ))}
          </div>
        </div>
        <div className="col mx-0 px-0 bg-white border-0"></div>
        <div className="row result-1-space"></div>
      </div>

      {/* ---- Buy Modal begin  ----- */}
      <Modal show={isBuyModalShow} onHide={() => setIsBuyModalShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{getTicker().ticker}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4">
          <p className="modal-text my-0">
            Current Price: {Number(getTicker().currentPrice).toFixed(2)}
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
          {getTicker().currentPrice * quantity > wallet && (
            <p className="text-danger modal-text mb-0 mt-1">
              Not enough money in wallet!
            </p>
          )}
        </Modal.Body>
        <Modal.Footer className="justify-content-between">
          <p className="text-left">
            Total: {(getTicker().currentPrice * quantity).toFixed(2)}
          </p>
          <Button
            variant="success"
            onClick={() => handleBuy()}
            disabled={
              getTicker().currentPrice * quantity > wallet || quantity <= 0
            }
          >
            Buy
          </Button>
        </Modal.Footer>
      </Modal>
      {/* ---- Buy Modal end  ----- */}

      {/* ---- Sell Modal begin  ----- */}
      <Modal show={isSellModalShow} onHide={() => setIsSellModalShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{getTicker().ticker}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4">
          <p className="modal-text my-0">
            Current Price: {Number(getTicker().currentPrice).toFixed(2)}
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
          {sellQuantity > getTicker().quantity && (
            <p className="text-danger modal-text mb-0 mt-1">
              You cannot sell the stocks that you don't have!
            </p>
          )}
        </Modal.Body>
        <Modal.Footer className="justify-content-between">
          <p className="text-left">
            Total: {(getTicker().currentPrice * sellQuantity).toFixed(2)}
          </p>
          <Button
            variant="success"
            onClick={() => handleSell()}
            disabled={sellQuantity > getTicker().quantity || sellQuantity <= 0}
          >
            Sell
          </Button>
        </Modal.Footer>
      </Modal>
      {/* ---- Sell Modal end  ----- */}
    </div>
  );
};

export default Watchlist;

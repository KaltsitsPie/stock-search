import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Dropdown } from "react-bootstrap";
import Alert from 'react-bootstrap/Alert';
import { getStockAutoComplete } from "../api";
import Footer from "../components/Footer";

const Search = () => {
  const [ticker, setTicker] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [ isEmptyInputShow, setIsEmptyInputShow ] = useState(false);
//   const [ shouldUpdate, setShouldUpdate ] = useState(true);
const location = useLocation();
  const navigate = useNavigate();

  const { ticker:symbol } = useParams();

  useEffect(() => {
    if (symbol !== undefined && symbol.length > 0) {
        setTicker(symbol);
        
    }
  }, [symbol]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (ticker.trim() === "") {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      getStockAutoComplete(ticker).then(data => {
        if(data !== undefined && data.length > 0) {
          setSuggestions(
            data.filter((item) => {
                return item.type === "Common Stock" && !item.symbol.includes(".");
              })
            );
            setIsLoading(false);
        } else {
          setShowDropdown(false);
          setIsLoading(false);
          setSuggestions([]);
        }
      })
      

    };

    const delayDebounce = setTimeout(() => fetchSuggestions(), 500);

    return () => clearTimeout(delayDebounce);
  }, [ticker]);

  const handleInputOnChange = (e) => {
    setTicker(e.target.value);
    
    if (e.target.value.length > 0) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const handleDropdownClick = (symbol) => {
    setTicker(symbol);
    console.log(ticker);
    handleSearch(symbol);
  };

  const handleSearch = (symbol) => {
    localStorage.setItem('savedSymbol', symbol);
    setSuggestions([]);
    setIsLoading(false);
    setShowDropdown(false);
    setIsEmptyInputShow(false);
    if (symbol !== undefined && symbol.length > 0) {
        navigate(`/search/${String(symbol).toUpperCase()}`)
    } else {
        setIsEmptyInputShow(true);
    }
  };

  const handleClear = () => {
    console.log("handle Clear.");
    // localStorage.removeItem('savedSymbol');
    // localStorage.removeItem('savedDetail');
    // localStorage.removeItem('savedSummaryCharts');
    // localStorage.removeItem('savedInsightsOrder');
    // localStorage.removeItem('savedTrends');
    // localStorage.removeItem('savedCompanyEarning');
    // localStorage.removeItem('savedNews');
    // localStorage.removeItem('savedPeers');
    // localStorage.removeItem('savedCharts');
    // localStorage.removeItem('savedDetail');
    localStorage.clear();
    const saved = localStorage.getItem("savedSymbol");
    const isCLear = saved === undefined || !saved;
    console.log(`localStorage is clear? ${isCLear}, Now saved symbol: ${saved}`);
    setSuggestions([]);
    setIsLoading(false);
    setShowDropdown(false);
    setIsEmptyInputShow(false);
    setTicker("");
    
    navigate("/search/home");
  };

  return (
    <div className="container">
        {/* row 1 begin */}
      <div className="row">
        <div className="col titleWrapper mt-2">
          <p>STOCK SEARCH</p>
        </div>
      </div>
      {/* row 1 end */}
      {/* row 2 begin */}
      <div className="position-relative row">
        <div className="container-fluid">
          {/* inputWrapper */}
          <div className="input-col row">
            <div className="col-8 col-sm-8 col-md-4 col-lg-4 inputWrapper">
              <div className="container-fluid">
                <div className="row justify-content-start">
                  {/* <div className="col col-1 col-sm-1 col-md-1"></div> */}
                  <input
                    type="text"
                    value={ticker}
                    onChange={handleInputOnChange}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        handleSearch(ticker);
                      }
                    }}
                    className="input-stock col col-9 col-sm-9 col-md-9 align-self-start"
                  />
                  <div className="col col-1 col-sm-1 col-md-1 align-self-center search-btn">
                    <button onClick={() => handleSearch(ticker)}>🔍</button>
                  </div>
                    
                  <div className="col col-1 col-sm-1 col-md-1 align-self-center clear-btn">
                    
                    <button onClick={() => handleClear()}>✕</button>
                  </div>
                </div>

               
              </div>
            </div>
          </div>

          <div className="input-col-1 row">
            <div className="col-8 col-sm-8 col-md-4 col-lg-4 align-self-start">
                  {showDropdown && isLoading && (
                    <Dropdown.Menu
                      show
                      className="scrollable-dropdown dropdownWrapper-single shadow bg-white rounded"
                    >
                      <div
                        className="spinner-border text-primary input-loading"
                        role="status"
                      >
                        {/* <span className="sr-only">Loading...</span> */}
                      </div>
                    </Dropdown.Menu>
                  )}
                  {showDropdown && !isLoading && suggestions.length > 0 && (
                    <Dropdown.Menu
                      show
                      className="scrollable-dropdown dropdownWrapper shadow bg-white rounded"
                    >
                      {suggestions.map(({ symbol, description }, index) => (
                        <Dropdown.Item
                          className="dropdownItemWrapper"
                          key={symbol}
                          onClick={() => handleDropdownClick(symbol)}
                        >
                          <p>{symbol} | {description}</p>
                          {/* </button> */}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  )}
                {/* </div>

               
              </div> */}
            </div>
          </div>
        </div>
      </div>
      {/* row 2 end */}
      <div className="row mt-4">
        {/* Empty input */}
        <Alert variant="danger" className="custom-alert py-0" show={isEmptyInputShow} onClose={() => setIsEmptyInputShow(false)}>
            <div className="container-fluid">
                <div className="row">
                    <p className="text-center py-0 custom-alert-text">Please enter a valid ticker</p>
                </div>
            </div>
            <button type="button" onClick={() => setIsEmptyInputShow(false)} className="close custom-alert-close-btn text-center position-absolute bg-transparent" aria-label="Close">
                <span aria-hidden="true" className="text-secondary">&times;</span>
            </button>
        </Alert>
      </div>

      <div className="row my-0">
        <Outlet />
      </div>

      {/* {(location.pathname === "/search/home") && 
        <Footer />
      } */}
      
    </div>
  );
};

export default Search;

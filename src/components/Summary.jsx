import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useNavigate } from "react-router-dom";

const Summary = ({ detail, companyPeers, charts }) => {
  const [prices, setPrices] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const pricesArr = [],
      dataLength = charts.resultsCount;

    for (let i = 0; i < dataLength; i += 1) {
      pricesArr.push([
        charts.results[i].t, // date
        charts.results[i].c, // volume
      ]);
    }
    setPrices(pricesArr);
  }, [charts]);

  const saftTicker = () => {
    if (detail !== undefined && detail.ticker !== undefined) {
      return detail.ticker;
    }
    return "AAPL";
  };

  const options = {
    chart: {
      style: {
        fontSize: "12px",
        fontWeight: "bold",
      },
      backgroundColor: "#F5F5F5",
      zoomType: "x",
      scrollablePlotArea: {
        minWidth: 900,
        scrollPositionX: 1,
      },
    },
    title: {
      text: `${saftTicker()} Hourly Price Variation`,
      align: "center",
      style: {
        color: "gray",
        fontSize: "16px",
      },
    },
    xAxis: {
      tickInterval: 60 * 60 * 1000,
      tickColor: "gray",
      type: "datetime",
      labels: {
        formatter: function () {
          const date = Highcharts.dateFormat("%e %b", this.value);
          const time = Highcharts.dateFormat("%H:%M", this.value);
          if (time === "00:00") {
            return date;
          } else {
            return time;
          }
        },
        style: {
          color: "gray",
        },
      },
      scrollbar: {
        enabled: true,
      },
      crosshair: false,
      plotLines: [],
    },
    yAxis: {
      //   min: 0,
      title: null,
      tickLength: "1px",
      tickColor: "gray",
      opposite: true,
      labels: {
        style: {
          color: "gray",
        },
      },
      crosshairs: false,
      plotLines: [],
    },
    tooltip: {
      split: false,
      xDateFormat: "%b %e %H:%M",
    },
    series: [
      {
        name: "Stock Price",
        type: "line",
        // yAxis: 1,
        data: prices,
        color: detail.change > 0 ? "green" : "red",
        showInLegend: false,
        marker: {
          enabled: false,
        },
      },
    ],
  };

  const handlePeerOnClick = (symbol) => {
    navigate(`/search/${symbol}`);
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* ---- Summary left col begin ---- */}
        <div className="col-12 col-sm-12 col-md-6 col-lg-6 container-fluid">
          <div className="row bd-highlight m-0 p-0 summary-price-Wrapper mt-4">
            <div className="col-2"></div>
            <div className="col-10">
              {/* 1 */}
              <p className="result-1-text p-0 m-0">
                <span className="p-0 m-0">High Price: </span>
                {" " + detail.highPrice}
              </p>
              {/* 2 */}
              <p className="result-1-text p-0 m-0">
                <span className="p-0 m-0">Low Price: </span>
                {detail.lowPrice}
              </p>
              {/* 3 */}
              <p className="result-1-text p-0 m-0">
                <span className="p-0 m-0">Open Price: </span>
                {detail.openPrice}
              </p>
              {/* 4 */}
              <p className="result-1-text p-0 m-0">
                <span className="p-0 m-0">Prev.Close: </span>
                {detail.prevClose}
              </p>
            </div>
          </div>

          <div className="row mt-4">
            <p className="font-weight-bold result-1-about text-center">
              About the company
            </p>
          </div>

          <div className="row d-flex flex-column bd-highlight m-0 p-0 justify-content-center">
            {/* 1 */}
            <p className="result-1-about-detail p-0 m-0 text-center flex-grow-1">
              <span className="p-0 m-0 ">IPO Start Date: </span>
              {" " + detail.IPOStartDate}
            </p>
            {/* 2 */}
            <p className="result-1-about-detail p-0 m-0 text-center flex-grow-1">
              <span className="p-0 m-0">Industry: </span>
              {detail.industry}
            </p>
            {/* 3 */}
            <p className="result-1-about-detail p-0 m-0 text-center flex-grow-1">
              <span className="p-0 m-0">Webpage: </span>
              <a href={detail.webpage} target="_blank">
                {detail.webpage}
              </a>
            </p>
            {/* 4 */}
            <p className="result-1-about-detail p-0 m-0 text-center flex-grow-1">
              <span className="p-0 m-0">Company Peers: </span>
            </p>
            {companyPeers !== undefined &&
              companyPeers.companyPeers !== undefined &&
              companyPeers.companyPeers.length > 0 && (
                <div className="text-center flex-grow-1">
                  {companyPeers.companyPeers.map((peer) => (
                    <p
                      className="result-1-about-peer text-primary"
                      onClick={() => handlePeerOnClick(peer)}
                      key={peer}
                    >
                      {peer + "."}
                    </p>
                  ))}
                </div>
              )}
          </div>
        </div>
        {/* ---- Summary left col end ---- */}

        {/* ---- Summary right col begin ---- */}
        <div className="col-12 col-sm-12 col-md-6 col-lg-6 mt-3 mt-lg-0">
            <div className="container-fluid">
                <div className="row">
                {charts !== undefined && (
                    <HighchartsReact highcharts={Highcharts} options={options} />
                )}
                </div>
                <div className="row result-1-space">
                    
                </div>
            </div>
          
        </div>
        {/* ---- Summary right col end ---- */}
      </div>
    </div>
  );
};

export default Summary;

import React, { useEffect, useRef, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const Insights = ({ detail, insightsOrder, companyEarning, trends }) => {
  const [actualEarningData, setActualEarningData] = useState([]);
  const [estimateEarningData, setEstimateEarningData] = useState([]);
  const [surprisesData, setSurprisesData] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [trendsCategories, setTrendsCategories] = useState([]);
  const [trendsSellData, setTrendsSellData] = useState([]);
  const [trendsStrongSellData, setTrendsStrongSellData] = useState([]);
  const [trendsHoldData, setTrendsHoldData] = useState([]);
  const [trendsBuyData, setTrendsBuyData] = useState([]);
  const [trendsStrongBuyData, setTrendsStrongBuyData] = useState([]);
  useEffect(() => {
    const actualData = companyEarning.map((point) => point.actual);
    setActualEarningData(actualData);
    const estimateData = companyEarning.map((point) => point.estimate);
    setEstimateEarningData(estimateData);
    const surprises = companyEarning.map((point) => point.surprise);
    setSurprisesData(surprises);
    const categories = companyEarning.map((point) => point.period);
    setCategoriesData(categories);
  }, [companyEarning]);

  useEffect(() => {
    console.log("in insights component, trend: ", trends);
    const categories = trends.map((point) => String(point.period).slice(0, -3));
    setTrendsCategories(categories);
    const sells = trends.map((point) => point.sell);
    setTrendsSellData(sells);
    const strongSells = trends.map((point) => point.strongSell);
    setTrendsStrongSellData(strongSells);
    const holds = trends.map((point) => point.hold);
    setTrendsHoldData(holds);
    const buys = trends.map((point) => point.buy);
    setTrendsBuyData(buys);
    const strongBuys = trends.map((point) => point.strongBuy);
    setTrendsStrongBuyData(strongBuys);
  }, [trends]);

  const formatNumber = (value) => {
    if (Number.isInteger(value) || value % 1 === 0) {
      return value;
    } else {
      return value.toFixed(2);
    }
  };

  const companyEarningOptions = {
    chart: {
      style: {
        fontSize: "12px",
        fontWeight: "bold",
      },
      backgroundColor: "#F5F5F5",
      type: "spline",
    },
    title: {
      text: "Historical EPS Surprises",
      align: "center",
      style: {
        color: "gray",
        fontSize: "16px",
      },
    },
    xAxis: {
      categories: categoriesData,
      tickWidth: "0",
      labels: {
        useHTML: true,
        formatter: function () {
          const dateString = this.value;
          const surpriseString =
            "Surprise: " + Number(surprisesData[this.pos]).toFixed(4);
          return `<div className='row'>${dateString}</div><div className='row'>${surpriseString}</div>`;
        },
      },
    },
    yAxis: {
      tickLength: "1px",
      tickColor: "gray",
      title: {
        text: "Quarterly EPS",
        style: {
          color: "gray",
        },
      },
      labels: {
        style: {
          color: "gray",
        },
      },
    },
    tooltip: {
      shared: true,
      crosshairs: true,
    },
    series: [
      {
        name: "Actual",
        data: actualEarningData,
        color: "skyblue",
      },
      {
        name: "Estimate",
        data: estimateEarningData,
        marker: {
          fillColor: "darkblue",
          lineWidth: 2,
          lineColor: null,
        },
      },
    ],
  };

  const trendsOptions = {
    chart: {
      style: {
        fontSize: "12px",
        fontWeight: "bold",
      },
      backgroundColor: "#F5F5F5",
      type: "column",
    },
    title: {
      text: "Recommendation Trends",
      align: "center",
      style: {
        color: "gray",
        fontSize: "16px",
      },
    },
    xAxis: {
      categories: trendsCategories,
    },
    yAxis: {
      min: 0,
      tickLength: "1px",
      tickColor: "gray",
      title: {
        text: "# Analysis",
        style: {
          color: "gray",
        },
      },
      labels: {
        style: {
          color: "gray",
        },
      },
    },
    tooltip: {
        format: '<b>{key}</b><br/>{series.name}: {y}<br/>'
    },
    plotOptions: {
      column: {
        stacking: "normal",
        dataLabels: {
          enabled: true,
          color:
            (Highcharts.theme && Highcharts.theme.dataLabelsColor) || "white",
          style: {
            textShadow: "0 0 3px white",
          },
        },
      },
    },
    series: [
      {
        name: "Strong Buy",
        data: trendsStrongBuyData,
        stack: "recommendations",
        color: "green",
      },
      {
        name: "Buy",
        data: trendsBuyData,
        stack: "recommendations",
        color: "lightgreen",
      },
      {
        name: "Hold",
        data: trendsHoldData,
        stack: "recommendations",
        color: "orange",
      },
      {
        name: "Sell",
        data: trendsSellData,
        stack: "recommendations",
        color: "red",
      },
      {
        name: "Strong Sell",
        data: trendsStrongSellData,
        stack: "recommendations",
        color: "darkred",
      },
    ],
  };

  return (
    <div className="container-fluid">
      {/* ---- Insider Sentiments begin ---- */}
      <div className="row">
        <div className="col-0 col-sm-0 col-md-0 col-lg-3"></div>
        <div className="col-12 col-sm-12 col-md-12 col-lg-6">
          <p className="text-center result-4-title mt-3 mb-0">
            Insider Sentiments
          </p>
          <table className="table">
            <thead>
              <tr className="result-4-header">
                <th scope="col">{detail.companyName}</th>
                <th scope="col">MSPR</th>
                <th scope="col">Change</th>
              </tr>
            </thead>
            <tbody>
              <tr className="result-4-content">
                <th scope="row">Total</th>
                <td>{formatNumber(insightsOrder.totalMspr)}</td>
                <td>{formatNumber(insightsOrder.totalChange)}</td>
              </tr>
              <tr className="result-4-content">
                <th scope="row">Positive</th>
                <td>{formatNumber(insightsOrder.positiveMspr)}</td>
                <td>{formatNumber(insightsOrder.positiveChange)}</td>
              </tr>
              <tr className="result-4-content">
                <th scope="row">Negative</th>
                <td>{formatNumber(insightsOrder.negativeMspr)}</td>
                <td>{formatNumber(insightsOrder.negativeChange)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      {/* ---- Insider Sentiments end ---- */}

      <div className="row">
        <div className="container-fluid">
          <div className="row">
            {/* ---- Recommenfation Trends begin ---- */}
            <div className="col-12 col-sm-12 col-md-12 col-lg-6 mt-3 mt-lg-0">
              {companyEarning !== undefined && (
                <HighchartsReact
                  highcharts={Highcharts}
                  options={trendsOptions}
                />
              )}
            </div>
            {/* ---- Recommenfation Trends end ---- */}

            {/* ---- Historical EPS Surprises begin ---- */}
            <div className="col-12 col-sm-12 col-md-12 col-lg-6 mt-3 mt-lg-0">
              {companyEarning !== undefined && (
                <HighchartsReact
                  highcharts={Highcharts}
                  options={companyEarningOptions}
                />
              )}
            </div>
            {/* ---- Historical EPS Surprises end ---- */}
          </div>
        </div>
      </div>
      <div className="row result-1-space"></div>
    </div>
  );
};

export default Insights;

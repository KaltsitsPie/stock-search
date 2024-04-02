import React, { useEffect, useRef, useState } from "react";
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import VBP from 'highcharts/indicators/volume-by-price';
import IndicatorsCore from 'highcharts/indicators/indicators';

const Charts = ({ hCharts }) => {
const [ ohlcData, setOhlcData ] = useState([]);
const [ volumeData, setVolumeData ] = useState([]);
const [ groupingUnitsData, setGroupingUnitsData ] = useState([]); 

  IndicatorsCore(Highcharts);
    VBP(Highcharts);

  useEffect(() => {
    // console.log("in Charts component, hCharts: ", hCharts);

    // console.log("charts tab, charts: ", hCharts.results);
    let len = 0;
    if(hCharts !== undefined && hCharts !== null && hCharts.results !== undefined)
        len = hCharts.results.length;

    const ohlc = [],
      volume = [],
      dataLength = len,
      groupingUnits = [
        [
          "week",
          [1],
        ],
        ["month", [1, 2, 3, 4, 6]],
      ];

    for (let i = 0; i < dataLength; i += 1) {
      ohlc.push([
        hCharts.results[i].t,
        hCharts.results[i].o,
        hCharts.results[i].h,
        hCharts.results[i].l,
        hCharts.results[i].c,
      ]);

      volume.push([
        hCharts.results[i].t,
        hCharts.results[i].v,
      ]);
    }
    setOhlcData(ohlc);
    setVolumeData(volume);
    setGroupingUnitsData(groupingUnits);
    console.log("charts tab, ohlc: ", ohlcData);
    console.log("charts tab, volume: ", volumeData);
    console.log("charts tab, groupingUnits: ", groupingUnitsData);
  }, [hCharts]);

  const options = {
    rangeSelector: {
      selected: 2,
    },

    title: {
      text: `${hCharts.ticker || "AAPL"} Historical`,
    },

    subtitle: {
      text: "With SMA and Volume by Price technical indicators",
    },

    yAxis: [
      {
        startOnTick: false,
        endOnTick: false,
        labels: {
          align: "right",
          x: -3,
        },
        title: {
          text: "OHLC",
        },
        height: "60%",
        lineWidth: 2,
        resize: {
          enabled: true,
        },
      },
      {
        labels: {
          align: "right",
          x: -3,
        },
        title: {
          text: "Volume",
        },
        top: "65%",
        height: "35%",
        offset: 0,
        lineWidth: 2,
      },
    ],

    tooltip: {
      split: true,
    },

    plotOptions: {
      series: {
        dataGrouping: {
          units: groupingUnitsData,
        },
      },
    },

    series: [
      {
        type: "candlestick",
        name: `${hCharts.ticker || "AAPL"}`,
        id: "ohlc",
        zIndex: 2,
        data: ohlcData,
      },
      {
        type: "column",
        name: "Volume",
        id: "volume",
        data: volumeData,
        yAxis: 1,
      },
      {
        type: "vbp",
        linkedTo: "ohlc",
        params: {
          volumeSeriesID: "volume",
        },
        dataLabels: {
          enabled: false,
        },
        zoneLines: {
          enabled: false,
        },
      },
      {
        type: "sma",
        linkedTo: "aapl",
        zIndex: 1,
        marker: {
          enabled: false,
        },
      },
    ],
  };

  return (
    <div>
      <HighchartsReact
        highcharts={Highcharts}
        constructorType={"stockChart"}
        options={options}
      />
      <div className="row result-1-space"></div>
    </div>
  );
};

export default Charts;

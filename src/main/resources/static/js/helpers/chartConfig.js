/** @format */
import { numberWithCommas } from "./utils.js";

/**
 * Chart configuration factory for the dashboard
 */
 const ChartConfigs = {
  
  dropdownControls: {
    salesTimeRange: {
      buttonId: "salesTimeRangeDropdownButton",
      menuId: "salesLastDaysDropdown",
      charts: [{
        id: "area-chart",
        configFn: "createSalesChartOptions",
        updateFn: "updateSalesUI"
      }]
    },
    carsSoldTimeRange: {
      buttonId: "carsSoldTimeRangeDropdown",
      menuId: "carsSoldDropdown",
      charts: [{
        id: "column-chart",
        configFn: "createColumnChartOptions",
        updateFn: "updateCarsSoldUI"
      }]
    },
    revenueProfitTimeRange: {  
      buttonId: "revenueProfitTimeRangeDropdown",
      menuId: "revenueProfitDropdown",
      charts: [{
        id: "revenue-profit-chart",
        configFn: "createRevenueProfitChartOptions",
        updateFn: "updateRevenueProfitUI"
      }]
    },
    brands: {
      buttonId: "brandsTimeRangeDropdown",
      menuId: "brandsDropdown"
    },
    teamProgress: {
      buttonId: "teamProgressTimeRange",
      menuId: "teamProgressDropdown"
    },
    salesComparison: {
      buttonId: "salesComparisonTimeRange",
      menuId: "salesComparisonDropdown"
    },
  },
  

  createSalesChartOptions(salesData = {}) {
    return {
      chart: {
        height: "100%",
        width: "100%",
        type: "area",
        fontFamily: "Inter, sans-serif",
        dropShadow: { enabled: false },
        toolbar: { show: false },
      },
      tooltip: {
        enabled: true,
        x: { show: false },
        y: {
          formatter: function(value) {
            return '£' + numberWithCommas(value);
          }
        }
      },
      fill: {
        type: "gradient",
        gradient: {
          opacityFrom: 0.55,
          opacityTo: 0,
          shade: "#1C64F2",
          gradientToColors: ["#1C64F2"],
        },
      },
      dataLabels: { enabled: false },
      stroke: { width: 6 },
      grid: {
        show: false,
        strokeDashArray: 4,
        padding: { left: 2, right: 2, top: 0 },
      },
      series: [
        {
          name: "Total Sales",
          data: salesData.data || [0, 0, 0, 0, 0, 0, 0],
          color: "#1A56DB",
        },
      ],
      xaxis: {
        categories: salesData.labels || [
          "01 February", "02 February", "03 February",
          "04 February", "05 February", "06 February", "07 February"
        ],
        labels: { show: false },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: { show: false },
    };
  },

  
  createColumnChartOptions() {
    // Your existing column chart configuration
    return {
      colors: ["#1A56DB", "#FDBA8C"],
      series: [
        {
          name: "Organic",
          color: "#1A56DB",
          data: [
            { x: "Mon", y: 231 },
            { x: "Tue", y: 122 },
            { x: "Wed", y: 63 },
            { x: "Thu", y: 421 },
            { x: "Fri", y: 122 },
            { x: "Sat", y: 323 },
            { x: "Sun", y: 111 },
          ],
        },
        {
          name: "Social media",
          color: "#FDBA8C",
          data: [
            { x: "Mon", y: 232 },
            { x: "Tue", y: 113 },
            { x: "Wed", y: 341 },
            { x: "Thu", y: 224 },
            { x: "Fri", y: 522 },
            { x: "Sat", y: 411 },
            { x: "Sun", y: 243 },
          ],
        },
      ],
      // Rest of your column chart configuration
      chart: {
        type: "bar",
        height: "320px",
        fontFamily: "Inter, sans-serif",
        toolbar: { show: false },
      },
      // ... other options
    };
  },

 
  createLabelsChartOptions() {
    return {
      // Your existing labels options
      xaxis: {
        show: true,
        categories: [
          "01 Feb", "02 Feb", "03 Feb", "04 Feb",
          "05 Feb", "06 Feb", "07 Feb"
        ],
        // ... other options
      },
      // ... other options
    };
  },


  createRadialChartOptions() {
    return {
      series: [90, 85, 70],
      colors: ["#1C64F2", "#16BDCA", "#FDBA8C"],
      chart: {
        height: "380px",
        width: "100%",
        type: "radialBar",
        sparkline: { enabled: true },
      },
      // ... other options
    };
  },


  createDonutChartOptions() {
    return {
      series: [35.1, 23.5, 2.4, 5.4],
      colors: ["#1C64F2", "#16BDCA", "#FDBA8C", "#E74694"],
      chart: {
        height: 320,
        width: "100%",
        type: "donut",
      },
      // ... other options
    };
  },

 
  createTeamChartOptions() {
    return {
      colors: ["#31C48D", "#F05252"],
      series: [
        {
          name: "Income",
          color: "#31C48D",
          data: ["1420", "1620", "1820", "1420", "1650", "2120", 
                 "1420", "1620", "1820", "1420", "1650", "2120"],
        },
        {
          name: "Expenses",
          color: "#F05252",
          data: ["788", "810", "866", "788", "1100", "1200", 
                 "788", "810", "866", "788", "1100", "1200"],
        },
      ],
      // ... other options
    };
  },

  createRevenueProfitChartOptions(salesData = {}) {
    return {
      chart: {
        height: "100%",
        width: "100%",
        type: "area",
        fontFamily: "Inter, sans-serif",
        dropShadow: { enabled: false },
        toolbar: { show: false },
      },
      tooltip: {
        enabled: true,
        x: { show: true },
        y: {
          formatter: function(value) {
            return '£' + numberWithCommas(value);
          }
        }
      },
      fill: {
        type: "gradient",
        gradient: {
          opacityFrom: 0.55,
          opacityTo: 0,
          shade: "#1C64F2",
          gradientToColors: ["#1C64F2", "#31C48D"],
        },
      },
      dataLabels: { enabled: false },
      stroke: { width: 6 },
      grid: {
        show: false,
        strokeDashArray: 4,
        padding: { left: 2, right: 2, top: 0 },
      },
      series: [
        {
          name: "Revenue",
          data: salesData.revenueData || [0],
          color: "#1A56DB",
        },
        {
          name: "Profit",
          data: salesData.profitData || [0],
          color: "#31C48D",
        }
      ],
      xaxis: {
        categories: salesData.labels || ["No data"],
        labels: { show: false },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: { show: false },
      legend: { show: false },
    };
  },
};

export default ChartConfigs;
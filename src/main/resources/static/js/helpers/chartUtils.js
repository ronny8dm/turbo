/** @format */

import { numberWithCommas } from "./utils.js";

// Keep track of chart instances
let salesChartInstance = null;
let carsSoldChartInstance = null;
let revenueProfitChartInstance = null;
let teamProgressChartInstance = null;
let brandsChartInstance = null;
let  teamChartInstance = null;
let stockChartInstance = null;

export function renderSalesChart(salesData) {
  // Transform the salesData.salesData array into labels and data arrays
  const labels = [];
  const data = [];

  if (salesData.salesData && Array.isArray(salesData.salesData)) {
    salesData.salesData.forEach((item) => {
      if (Array.isArray(item) && item.length === 2) {
        // Format the date to be more readable
        const dateObj = new Date(item[0]);
        const formattedDate = dateObj.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        });
        labels.push(formattedDate);
        data.push(item[1]);
      }
    });
  }

  console.log("Chart data prepared:", { labels, data });

  // Calculate min and max for better y-axis scaling
  let minValue = 0;
  let maxValue = Math.max(...data);

  if (data.length > 0) {
    // Set min to the lowest non-zero value or 0
    const nonZeroValues = data.filter((val) => val > 0);
    minValue = nonZeroValues.length > 0 ? Math.min(...nonZeroValues) : 0;

    // Adjust min to be slightly lower for better visualization
    minValue = Math.max(0, minValue * 0.8);

    // Adjust max to be slightly higher for better visualization
    maxValue = maxValue * 1.1;
  }

  console.log(`Chart scale: min=${minValue}, max=${maxValue}`);

  const options = {
    chart: {
      height: "100%",
      width: "100%",
      type: "area",
      fontFamily: "Inter, sans-serif",
      dropShadow: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
        dynamicAnimation: {
          enabled: true,
          speed: 350,
        },
      },
    },
    tooltip: {
      enabled: true,
      x: {
        show: true,
        format: "dd MMM",
      },
      y: {
        formatter: function (value) {
          return "£" + numberWithCommas(value);
        },
      },
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
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 6,
      curve: "smooth",
    },
    grid: {
      show: true,
      borderColor: "#e0e0e0",
      strokeDashArray: 4,
      padding: {
        left: 10,
        right: 10,
        top: 10,
      },
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    series: [
      {
        name: "Total Sales",
        data: data.length > 0 ? data : [0, 0, 0, 0, 0, 0, 0],
        color: "#1A56DB",
      },
    ],
    xaxis: {
      categories:
        labels.length > 0
          ? labels
          : [
              "01 Feb",
              "02 Feb",
              "03 Feb",
              "04 Feb",
              "05 Feb",
              "06 Feb",
              "07 Feb",
            ],
      labels: {
        show: true,
        style: {
          fontFamily: "Inter, sans-serif",
          cssClass: "text-xs font-normal fill-gray-500 dark:fill-gray-400",
        },
        rotate: -45,
        offsetY: 0,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      show: true,
      min: minValue, // Use calculated min value
      max: maxValue, // Use calculated max value
      forceNiceScale: true, // Force nice round numbers
      tickAmount: 5, // Show approximately 5 y-axis labels
      labels: {
        formatter: function (value) {
          if (value >= 1000000) {
            return "£" + (value / 1000000).toFixed(1) + "M";
          } else if (value >= 1000) {
            return "£" + (value / 1000).toFixed(0) + "k";
          }
          return "£" + value;
        },
        style: {
          fontFamily: "Inter, sans-serif",
          cssClass: "text-xs font-normal fill-gray-500 dark:fill-gray-400",
        },
      },
    },
    markers: {
      size: 4,
      colors: ["#1A56DB"],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
    legend: {
      show: false,
    },
  };

  const areaChartElement = document.getElementById("area-chart");
  if (areaChartElement && typeof ApexCharts !== "undefined") {
    // Destroy previous chart instance if it exists
    if (salesChartInstance) {
      salesChartInstance.destroy();
      console.log("Previous chart instance destroyed");
    }

    // Create new chart
    salesChartInstance = new ApexCharts(areaChartElement, options);
    salesChartInstance
      .render()
      .then(() => {
        console.log("Sales chart successfully rendered with dynamic scale");
      })
      .catch((err) => {
        console.error("Error rendering sales chart:", err);
      });
  } else {
    console.warn("ApexCharts or area-chart element not found.");
  }
}

export function updateSalesUI(salesData) {
  if (document.getElementById("total-sales-amount")) {
    document.getElementById("total-sales-amount").textContent =
      numberWithCommas(salesData.totalSales || 0);
  }

  if (document.getElementById("sales-trend-percentage")) {
    const percentElement = document.getElementById("sales-trend-percentage");
    const percentValue = parseFloat(salesData.percentageChange || 0).toFixed(1);
    percentElement.textContent = Math.abs(percentValue);

    const trendContainer = percentElement.parentElement;
    if (salesData.percentageChange < 0) {
      trendContainer.classList.remove("text-green-500", "dark:text-green-500");
      trendContainer.classList.add("text-red-500", "dark:text-red-500");

      const svg = trendContainer.querySelector("svg path");
      if (svg) {
        svg.setAttribute("d", "M5 1v12m0 0l4-4m-4 4l-4-4");
      }
    } else {
      trendContainer.classList.remove("text-red-500", "dark:text-red-500");
      trendContainer.classList.add("text-green-500", "dark:text-green-500");

      const svg = trendContainer.querySelector("svg path");
      if (svg) {
        svg.setAttribute("d", "M5 13V1m0 0L1 5m4-4 4 4");
      }
    }
  }
}

export function renderRevenueVsProfitChart(salesData) {
  if (!salesData || !salesData.salesData) {
    console.error("Invalid sales data for revenue vs profit chart");
    return;
  }

  // Calculate profit margin as a decimal for calculations
  const profitMarginDecimal = (salesData.profitMargin || 0) / 100;

  // Extract and format data for chart
  const labels = [];
  const revenueData = [];
  const profitData = [];

  // Process sales data to extract revenue and calculate profit
  salesData.salesData.forEach((item) => {
    if (Array.isArray(item) && item.length >= 2) {
      const date = new Date(item[0]);
      const formattedDate = date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      });

      const revenue = item[1] || 0;
      const profit = Math.round(revenue * profitMarginDecimal);

      labels.push(formattedDate);
      revenueData.push(revenue);
      profitData.push(profit);
    }
  });

  console.log("Revenue vs Profit chart data prepared:", {
    labels,
    revenueData,
    profitData,
  });

  // Calculate total profit for display
  const totalProfit = Math.round(salesData.totalSales * profitMarginDecimal);

  // Update the total profit display element if it exists
  const totalProfitEl = document.getElementById("total-profit-amount");
  if (totalProfitEl) {
    totalProfitEl.textContent = numberWithCommas(totalProfit);
  }

  // Calculate min and max for better y-axis scaling
  const allValues = [...revenueData, ...profitData];
  const maxValue = Math.max(...allValues) * 1.1; // Add 10% padding
  const minValue = 0; // Start at 0 for financial charts

  const options = {
    chart: {
      height: "100%",
      width: "100%",
      type: "area",
      fontFamily: "Inter, sans-serif",
      dropShadow: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
      },
    },
    tooltip: {
      enabled: true,
      shared: true,
      x: {
        show: true,
        format: "dd MMM",
      },
      y: {
        formatter: function (value) {
          return "£" + numberWithCommas(value);
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 4,
      curve: "smooth",
    },
    grid: {
      show: true,
      borderColor: "#e0e0e0",
      strokeDashArray: 4,
      padding: {
        left: 35,
        right: 15,
        top: 15,
        bottom: 15,
      },
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    series: [
      {
        name: "Revenue",
        data: revenueData.length > 0 ? revenueData : [0],
        color: "#1A56DB",
      },
      {
        name: "Profit",
        data: profitData.length > 0 ? profitData : [0],
        color: "#31C48D",
      },
    ],
    xaxis: {
      categories: labels.length > 0 ? labels : ["No Data"],
      labels: {
        show: true,
        rotate: -45,
        rotateAlways: true,
        hideOverlappingLabels: false,
        style: {
          fontSize: "12px",
          fontFamily: "Inter, sans-serif",
          cssClass: "text-xs font-normal fill-gray-500 dark:fill-gray-400",
        },
        offsetY: 5,
        format: "dd MMM",
      },
      axisBorder: {
        show: true,
        color: "#78909C",
      },
      axisTicks: {
        show: true,
        color: "#78909C",
      },
      crosshairs: {
        show: true,
        position: "back",
        stroke: {
          color: "#b6b6b6",
          width: 1,
          dashArray: 0,
        },
      },
      tickPlacement: "on",
    },
    yaxis: {
      show: true,
      min: minValue,
      max: maxValue,
      tickAmount: 5,
      labels: {
        show: true,
        align: "right",
        minWidth: 0,
        maxWidth: 160,
        style: {
          fontSize: "12px",
          fontFamily: "Inter, sans-serif",
          cssClass: "text-xs font-normal fill-gray-500 dark:fill-gray-400",
        },
        formatter: function (value) {
          if (value >= 1000000) {
            return "£" + (value / 1000000).toFixed(1) + "M";
          } else if (value >= 1000) {
            return "£" + (value / 1000).toFixed(0) + "k";
          }
          return "£" + numberWithCommas(value);
        },
      },
      axisBorder: {
        show: true,
        color: "#78909C",
      },
      axisTicks: {
        show: true,
        color: "#78909C",
      },
      crosshairs: {
        show: true,
        position: "back",
        stroke: {
          color: "#b6b6b6",
          width: 1,
          dashArray: 0,
        },
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "right",
      labels: {
        colors: "#666",
      },
      markers: {
        width: 12,
        height: 12,
        strokeWidth: 0,
        strokeColor: "#fff",
        radius: 12,
      },
      itemMargin: {
        horizontal: 8,
      },
    },
  };

  const chartElement = document.getElementById("revenue-profit-chart");
  if (chartElement && typeof ApexCharts !== "undefined") {
    // Destroy previous chart instance if it exists
    if (revenueProfitChartInstance) {
      revenueProfitChartInstance.destroy();
      console.log("Previous revenue vs profit chart instance destroyed");
    }

    // Create new chart
    revenueProfitChartInstance = new ApexCharts(chartElement, options);
    revenueProfitChartInstance
      .render()
      .then(() => {
        console.log("Revenue vs profit chart successfully rendered");
      })
      .catch((err) => {
        console.error("Error rendering revenue vs profit chart:", err);
      });
  } else {
    console.warn("ApexCharts or revenue-profit-chart element not found.");
  }
}

export function renderCarsSoldChart(salesData) {
  const carsSoldByDate = salesData.vehiclesSoldByDate || [];
  const data = carsSoldByDate.map((item) => item[1]);
  const labels = carsSoldByDate.map((item) =>
    new Date(item[0]).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    })
  );

  // Calculate min and max for y-axis scaling
  let minValue = 0;
  let maxValue = Math.max(...data) || 0;

  if (data.length > 0) {
    const nonZeroValues = data.filter((val) => val > 0);
    minValue = nonZeroValues.length > 0 ? Math.min(...nonZeroValues) : 0;
    minValue = Math.max(0, minValue * 0.8); // Adjust min slightly lower
    maxValue = maxValue * 1.1; // Adjust max slightly higher
  }

  console.log(`Cars sold chart scale: min=${minValue}, max=${maxValue}`); // This could be the source

  const options = {
    series: [{ name: "Cars Sold", data }],
    chart: { type: "bar", height: 250, toolbar: { show: false } },
    plotOptions: { bar: { columnWidth: "55%", borderRadius: 5 } },
    xaxis: { categories: labels },
    yaxis: {
      title: { text: "Cars Sold" },
      min: minValue,
      max: maxValue,
      tickAmount: 5,
      labels: { formatter: (val) => Math.round(val) },
    },
    tooltip: { y: { formatter: (val) => `${val} cars` } },
    fill: { opacity: 1, colors: ["#3B82F6"] },
    dataLabels: { enabled: false },
  };

  const carsSoldChartElement = document.getElementById("cars-sold-chart");

  if (carsSoldChartElement && typeof ApexCharts !== "undefined") {
    // Reset container height before destroying previous instance
    carsSoldChartElement.style.height = "300px";

    if (carsSoldChartInstance) {
      carsSoldChartInstance.destroy();
      console.log("Previous cars sold chart instance destroyed");
    }

    // Create new chart
    carsSoldChartInstance = new ApexCharts(carsSoldChartElement, options);
    carsSoldChartInstance
      .render()
      .then(() => {
        // Force chart update after render
        carsSoldChartInstance.updateOptions({
          chart: {
            height: 300,
          },
        });
        console.log("Cars sold chart successfully rendered with dynamic scale");
      })
      .catch((err) => {
        console.error("Error rendering cars sold chart:", err);
      });
  } else {
    console.warn("ApexCharts or cars-sold-chart element not found.");
  }
}

// Add to chartUtils.js
export function renderTeamProgressChart(salesData) {
  const profitMargin = salesData.profitMargin || 0;
  const targetProgress = 80; 
  const stockTurnover = calculateStockTurnover(salesData);

  // Update KPI displays
  document.getElementById("team-target-percentage").textContent =
    Math.round(targetProgress);
  document.getElementById("team-profit-percentage").textContent =
    profitMargin.toFixed(1);
  document.getElementById("stock-turnover").textContent =
    stockTurnover.toFixed(1);

    const stockTurnoverPercentage = Math.min((stockTurnover / 6) * 100, 100);

    const options = {
      series: [targetProgress, profitMargin, stockTurnoverPercentage],
      colors: ["#1A56DB", "#31C48D", "#FFA500"],
      chart: {
        height: 350,
        type: "radialBar",
      },
      plotOptions: {
        radialBar: {
          dataLabels: {
            name: {
              fontSize: "22px",
            },
            value: {
              fontSize: "16px",
              formatter: function (val) {
                const numVal = parseFloat(val);
                return isNaN(numVal) ? "0%" : numVal.toFixed(1) + "%";
              },
            },
            total: {
              show: true,
              label: "Overall",
              formatter: function (w) {
                const total =
                  w.globals.seriesTotals.reduce(
                    (a, b) => a + parseFloat(b || 0),
                    0
                  ) / w.globals.series.length;
                return isNaN(total) ? "0%" : total.toFixed(1) + "%";
              },
            },
          },
          track: {
            background: "#E5E7EB",
            strokeWidth: "97%",
            margin: 5,
          },
        },
      },
      labels: ["Target Progress", "Profit Margin", "Stock Turnover"],
      stroke: {
        lineCap: "round",
      },
    };

  const teamProgressChartElement = document.getElementById(
    "team-progress-chart"
  );

  if (teamProgressChartElement && typeof ApexCharts !== "undefined") {
    if (teamProgressChartInstance) {
      teamProgressChartInstance.destroy();
    }

    teamProgressChartInstance = new ApexCharts(
      teamProgressChartElement,
      options
    );
    teamProgressChartInstance.render();
  }
}

function calculateStockTurnover(salesData) {
  const totalVehiclesSold = salesData.totalVehiclesSold || 0;
  const averageInventory = salesData.averageInventory || 1;
  console.log("Calculating stock turnover: ***********", {
    salesData,
    totalVehiclesSold,
    averageInventory,
  }); 
  return (totalVehiclesSold / averageInventory);
}

export function renderBrandsChart(salesData) {
  const bodyStyles = salesData.bodyStyles || [];
  createBodyStyleCheckboxes(bodyStyles);

  const getChartOptions = (bodyStyle = 'all') => {
    let chartData;
    if (bodyStyle === 'all') {
      chartData = salesData.topSellingCars || [];
    } else {
      // Get data for the selected body style without case transformation
      chartData = salesData.topSellingByBodyStyle[bodyStyle] || [];
      console.log('Selected body style data:', bodyStyle, chartData);
    }

    const series = [];
    const labels = [];
    const processedChartData = [];
    
    if (chartData && chartData.length > 0) {
      chartData.forEach(item => {
        if (item && typeof item.percentage === 'number') {
          series.push(item.percentage);
          labels.push(`${item.brand} ${item.model}`);
          processedChartData.push({
            brand: item.brand,
            model: item.model,
            quantity: item.quantity,
            percentage: item.percentage
          });
        }
      });
    }

    // If no data, show placeholder
    if (series.length === 0) {
      series.push(100);
      labels.push('No Data Available');
      processedChartData.push({ quantity: 0, percentage: 0 });
    }

    return {
      series: series,
      labels: labels,
      colors: ["#1C64F2", "#16BDCA", "#FDBA8C", "#E74694", "#9061F9"],
      chart: {
        height: 320,
        width: "100%",
        type: "donut",
      },
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              name: {
                show: true,
                fontFamily: "Inter, sans-serif",
                offsetY: 20,
              },
              total: {
                showAlways: true,
                show: true,
                label: "Total Sales",
                fontFamily: "Inter, sans-serif",
                formatter: function (w) {
                  const total = processedChartData.reduce((sum, item) => sum + (item.quantity || 0), 0);
                  return `${total} units`;
                },
              },
              value: {
                show: true,
                fontFamily: "Inter, sans-serif",
                offsetY: -20,
                formatter: function (value) {
                  const total = processedChartData.reduce((sum, item) => sum + (item.quantity || 0), 0);
                  return `${Math.round((value * total) / 100)} units`;
                },
              },
            },
            size: "80%",
          },
          dataLabels: {
            enabled: false,
          },
        },
      },
      dataLabels:{
        enabled: false,
      },
      legend: {
        position: "bottom",
        fontFamily: "Inter, sans-serif",
        formatter: function(seriesName, opts) {
          const item = processedChartData[opts.seriesIndex];
          if (!item) return seriesName;
          return `${seriesName}: ${item.quantity} units (${item.percentage.toFixed(1)}%)`;
        }
      },
      tooltip: {
        y: {
          formatter: function(value, { seriesIndex }) {
            const item = processedChartData[seriesIndex];
            if (!item) return '0 units';
            return `${item.quantity} units (${item.percentage.toFixed(1)}%)`;
          }
        }
      }
    };
  };

  const brandsChartElement = document.getElementById("brands-chart");
  
  if (brandsChartElement && typeof ApexCharts !== "undefined") {
    if (brandsChartInstance) {
      brandsChartInstance.destroy();
    }

    brandsChartInstance = new ApexCharts(brandsChartElement, getChartOptions());
    brandsChartInstance.render();

    // Handle checkbox changes
    const checkboxes = document.querySelectorAll('#bodyStyles input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', (event) => {
        checkboxes.forEach(cb => {
          if (cb !== event.target) cb.checked = false;
        });

        const selectedStyle = event.target.checked ? event.target.value : 'all';
        console.log('Selected style:', selectedStyle);
        brandsChartInstance.updateOptions(getChartOptions(selectedStyle));
      });
    });
  }
}

function createBodyStyleCheckboxes(bodyStyles) {
  const container = document.getElementById("bodyStyles");
  if (!container) return;

  container.innerHTML = ""; // Clear existing checkboxes

  bodyStyles.forEach((style) => {
    const div = document.createElement("div");
    div.className = "flex items-center me-4";
    div.innerHTML = `
      <input id="${style.toLowerCase()}" 
             type="checkbox" 
             value="${style}" 
             class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
      <label for="${style.toLowerCase()}" 
             class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
        ${style}
      </label>
    `;
    container.appendChild(div);
  });
}


export function renderSalesComparisonChart(salesData) {
  // Transform the data for comparison
  const dates = [];
  const currentYearData = [];
  const previousYearData = [];

  // Get data for current period
  if (salesData.salesData) {
    salesData.salesData.forEach(([date, amount]) => {
      const formattedDate = new Date(date).toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short' 
      });
      dates.push(formattedDate);
      currentYearData.push(amount);
    });
  }

  // Calculate previous year data (for example, 20% less than current year)
  currentYearData.forEach(amount => {
    previousYearData.push(Math.round(amount * 0.8)); // Simulated previous year data
  });

  const options = {
    series: [
      {
        name: "Current Period",
        data: currentYearData
      },
      {
        name: "Previous Year",
        data: previousYearData
      }
    ],
    chart: {
      type: 'bar',
      height: 350,
      toolbar: {
        show: false
      }
    },
    colors: ['#31C48D', '#F05252'],
    plotOptions: {
      bar: {
        horizontal: false, // Change to false for vertical bars
        columnWidth: '55%',
        borderRadius: 4,
        dataLabels: {
          position: 'top' // Show values at top of bars
        },
      },
    },
    dataLabels: {
      enabled: false,
      
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    grid: {
      show: true,
      borderColor: '#e0e0e0',
      strokeDashArray: 4,
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    xaxis: {
      categories: dates,
      labels: {
        rotate: -45,
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif'
        }
      }
    },
    yaxis: {
      title: {
        text: 'Sales Amount (£)',
        style: {
          fontSize: '14px',
          fontFamily: 'Inter, sans-serif'
        }
      },
      labels: {
        formatter: function(val) {
          return '£' + numberWithCommas(val);
        }
      }
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: function(val) {
          return '£' + numberWithCommas(val);
        }
      }
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center'
    }
  };

  // Calculate and update totals
  const currentTotal = currentYearData.reduce((sum, val) => sum + val, 0);
  const previousTotal = previousYearData.reduce((sum, val) => sum + val, 0);
  const percentageChange = previousTotal ? 
    ((currentTotal - previousTotal) / previousTotal) * 100 : 100;

  // Update UI
  document.getElementById('current-period-total').textContent = 
    numberWithCommas(currentTotal);
  document.getElementById('current-period-sales').textContent = 
    numberWithCommas(currentTotal);
  document.getElementById('previous-period-sales').textContent = 
    numberWithCommas(previousTotal);
  document.getElementById('sales-comparison-percentage').textContent = 
    percentageChange.toFixed(1);

  const chartElement = document.getElementById("team-chart");
  if (chartElement && typeof ApexCharts !== 'undefined') {
    if (teamChartInstance) {
      teamChartInstance.destroy();
    }
    teamChartInstance = new ApexCharts(chartElement, options);
    teamChartInstance.render();
  }
}


export function renderStockStatusChart(stockData) {
  try {
    // Log incoming data for debugging
    console.log('Stock status data:', stockData);

    // Extract and default values
    const available = parseInt(stockData.availableVehicles || 0);
    const reserved = parseInt(stockData.reservedVehicles || 0);
    const total = available + reserved;

    console.log('Processed values:', { available, reserved, total });

    // Get all required elements
    const elements = {
      total: document.getElementById('total-vehicles'),
      available: document.getElementById('available-vehicles'),
      reserved: document.getElementById('reserved-vehicles'),
    };

    // Verify all elements exist
    const missingElements = Object.entries(elements)
      .filter(([key, el]) => !el)
      .map(([key]) => key);

    if (missingElements.length > 0) {
      console.error('Missing elements:', missingElements.join(', '));
      return;
    }

    // Update the values
    elements.total.textContent = total.toString();
    elements.available.textContent = available.toString();
    elements.reserved.textContent = reserved.toString();

    // Log successful update
    console.log('Stock status updated successfully', {
      total: elements.total.textContent,
      available: elements.available.textContent,
      reserved: elements.reserved.textContent,
    });

  } catch (error) {
    console.error('Error rendering stock status:', error);
  }
}
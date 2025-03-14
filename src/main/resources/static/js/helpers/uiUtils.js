/** @format */

import { numberWithCommas } from "./utils.js";

export function updateSalesUI(salesData) {
  if (document.getElementById("total-sales-amount")) {
    document.getElementById("total-sales-amount").textContent = numberWithCommas(salesData.totalSales || 0);
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
    }
  }
}

export function updateEmployeeUI(salesData) {
  console.log("Updating employee UI with data:", salesData.employeeStats);

  try {
    // Handle employee stats - accessing first array element which contains [total, active, inactive]
    if (salesData.employeeStats && Array.isArray(salesData.employeeStats[0])) {
      const stats = salesData.employeeStats[0];
      
      // Update total count
      if (document.getElementById('employee-count')) {
        document.getElementById('employee-count').textContent = stats[0] || 0;
      }

      // Update active count and percentage
      if (document.getElementById('active-count')) {
        document.getElementById('active-count').textContent = stats[1] || 0;
        
        // Calculate and update active percentage
        const activePercentage = stats[0] > 0 ? ((stats[1] / stats[0]) * 100).toFixed(1) : 0;
        const activeTrend = document.getElementById('active-trend');
        if (activeTrend) {
          activeTrend.textContent = `${activePercentage}%`;
          
          // Update trend colors
          if (activePercentage >= 50) {
            activeTrend.classList.remove('bg-red-100', 'text-red-800');
            activeTrend.classList.add('bg-green-100', 'text-green-800');
          } else {
            activeTrend.classList.remove('bg-green-100', 'text-green-800');
            activeTrend.classList.add('bg-red-100', 'text-red-800');
          }
        }
      }

      // Update inactive count
      if (document.getElementById('inactive-count')) {
        document.getElementById('inactive-count').textContent = stats[2] || 0;
      }

    } else {
      // Set defaults if no data
      ['employee-count', 'active-count', 'inactive-count'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = '0';
      });
    }
  } catch (error) {
    console.error('Error updating employee UI:', error);
  }
}

export function updateCarsSoldUI(salesData) {
  console.log("Updating cars sold UI with data:", salesData);

  // Update total cars sold
  const carsSoldElement = document.getElementById("cars-sold-count");
  if (carsSoldElement) {
    carsSoldElement.textContent = salesData.totalVehiclesSold || 0;
  }

  // Update percentage change
  const percentElement = document.getElementById("cars-sold-percentage");
  const trendContainer = document.getElementById("cars-sold-trend");
  
  if (percentElement && trendContainer) {
    const percentValue = parseFloat(salesData.vehicleSalesPercentageChange || 0).toFixed(1);
    percentElement.textContent = Math.abs(percentValue);

    if (salesData.vehicleSalesPercentageChange < 0) {
      trendContainer.classList.remove("bg-green-100", "text-green-800", "dark:bg-green-900", "dark:text-green-300");
      trendContainer.classList.add("bg-red-100", "text-red-800", "dark:bg-red-900", "dark:text-red-300");
      
      const svg = trendContainer.querySelector("svg path");
      if (svg) {
        // Down arrow for negative trend
        svg.setAttribute("d", "M5 13v-12m0 0l-4 4m4-4l4 4");
      }
    } else {
      trendContainer.classList.remove("bg-red-100", "text-red-800", "dark:bg-red-900", "dark:text-red-300");
      trendContainer.classList.add("bg-green-100", "text-green-800", "dark:bg-green-900", "dark:text-green-300");
      
      const svg = trendContainer.querySelector("svg path");
      if (svg) {
        // Up arrow for positive trend (FIXED)
        svg.setAttribute("d", "M5 12V0m0 0l4 4m-4-4l-4 4");
      }
    }
  }

  // Update average price
  const avgPriceElement = document.getElementById("average-price");
  if (avgPriceElement) {
    avgPriceElement.textContent = `£${numberWithCommas(Math.round(salesData.averagePrice || 0))}`;
  }

  // Update profit margin
  const profitMarginElement = document.getElementById("profit-margin");
  if (profitMarginElement) {
    profitMarginElement.textContent = `${(salesData.profitMargin || 0).toFixed(1)}%`;
  }
}

export function updateDropdownText(buttonId, label) {
  const dropdownButton = document.getElementById(buttonId);
  if (dropdownButton) {
    dropdownButton.innerHTML = `
      ${label}
      <svg class="w-2.5 m-2.5 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
      </svg>
    `;
  }
}


export function updateRevenueProfitUI(salesData) {
  // Update total profit amount
  const profitMarginDecimal = (salesData.profitMargin || 0) / 100;
  const totalProfit = Math.round(salesData.totalSales * profitMarginDecimal);
  
  if (document.getElementById("total-profit-amount")) {
    document.getElementById("total-profit-amount").textContent = numberWithCommas(totalProfit);
  }

  // Update profit margin display
  if (document.getElementById("profit-margin-display")) {
    document.getElementById("profit-margin-display").textContent = 
      (salesData.profitMargin || 0).toFixed(1) + "%";
  }

  // Update trend percentage
  if (document.getElementById("profit-trend-percentage")) {
    const percentElement = document.getElementById("profit-trend-percentage");
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


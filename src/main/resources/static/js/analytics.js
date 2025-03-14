/** @format */
import ApiService from "./apiService.js";
import {
  updateSalesUI,
  updateEmployeeUI,
  updateCarsSoldUI,
  updateRevenueProfitUI,
  updateDropdownText,
} from "./helpers/uiUtils.js";
import {
  renderSalesChart,
  renderCarsSoldChart,
  renderRevenueVsProfitChart,
  renderTeamProgressChart,
  renderSalesComparisonChart,
  renderStockStatusChart,
  renderBrandsChart
} from "./helpers/chartUtils.js";
import {
  convertSalesToCSV,
  convertCarsSoldToCSV,
  convertProfitDataToCSV,
  convertBrandsDataToCSV,
  convertTeamProgressToCSV,
  convertSalesComparisonToCSV,
  downloadFile,
} from "./helpers/utils.js";
import ChartConfigs from "./helpers/chartConfig.js";


const apiService = new ApiService();


let currentSalesData = null;
let currentCarsSoldData = null;


const TIME_RANGES = {
  WEEK: { label: "Last 7 days", days: 7 },
  MONTH: { label: "Last 30 days", days: 30 },
  QUARTER: { label: "Last 90 days", days: 90 },
  YEAR: { label: "Year to date", days: 365 },
};


function getDateRangeStrings(range) {
  const endDate = new Date(); // Today
  let startDate;

  if (range.label === "Year to date") {
    startDate = new Date(endDate.getFullYear(), 0, 1); 
  } else {
    startDate = new Date();
    startDate.setDate(endDate.getDate() - (range.days - 1)); 
  }

  console.log(
    `calculating date range for ${range.label}: ${startDate} - ${endDate}`
  );
  console.log(`startDate: ${startDate.toISOString().split("T")[0]}`);
  console.log(`endDate: ${endDate.toISOString().split("T")[0]}`);
  console.log(`startDateStr: ${startDate.toISOString().split("T")[0]}`);
  console.log(
    `- Days: ${Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1}`
  );

  return {
    startDateStr: startDate.toISOString().split("T")[0],
    endDateStr: endDate.toISOString().split("T")[0],
  };
}


async function initDashboard(timeRange = TIME_RANGES.MONTH, chartType = null) {
  try {
    console.log(`Fetching sales data for ${timeRange.label}...`);

    const { startDateStr, endDateStr } = getDateRangeStrings(timeRange);
    const profile = await apiService.getCurrentUser();
    const salesData = await apiService.getSalesData(
      profile.dealershipId,
      startDateStr,
      endDateStr
    );

    console.log("Sales data fetched:", salesData);

  
    if (!chartType) {
   
      currentSalesData = salesData;
      currentCarsSoldData = salesData;
      updateSalesUI(salesData);
      updateEmployeeUI(salesData);
      updateCarsSoldUI(salesData);
      updateRevenueProfitUI(salesData);
      renderSalesChart(salesData);
      renderCarsSoldChart(salesData);
      renderRevenueVsProfitChart(salesData);
      renderTeamProgressChart(salesData);
      renderBrandsChart(salesData);
      renderSalesComparisonChart(salesData);
      renderStockStatusChart(salesData);
      updateDropdownText("brandsTimeRangeDropdown", timeRange.label);
      updateDropdownText("salesTimeRangeDropdownButton", timeRange.label);
      updateDropdownText("carsSoldTimeRangeDropdown", timeRange.label);
      updateDropdownText("revenueProfitTimeRangeDropdown", timeRange.label);
      return;
    }

 
    if (chartType === "sales") {
      currentSalesData = salesData;
      updateSalesUI(salesData);
      renderSalesChart(salesData);
      updateDropdownText("salesTimeRangeDropdownButton", timeRange.label);
    } else if (chartType === "carsSold") {
      currentCarsSoldData = salesData;
      updateCarsSoldUI(salesData);
      renderCarsSoldChart(salesData);
      updateDropdownText("carsSoldTimeRangeDropdown", timeRange.label);
    } else if (chartType === "revenueProfit") {
      currentSalesData = salesData;
      updateRevenueProfitUI(salesData);
      renderRevenueVsProfitChart(salesData);
      updateDropdownText("revenueProfitTimeRangeDropdown", timeRange.label);
    } else  if (chartType === "teamProgress") {
      renderTeamProgressChart(salesData);
      updateDropdownText("teamProgressTimeRange", timeRange.label);
    } else if (chartType === "brands") {
      renderBrandsChart(salesData);
      updateDropdownText("brandsTimeRangeDropdown", timeRange.label);
    } else if (chartType === "teamProgress") {
      renderTeamProgressChart(salesData);
      updateDropdownText("teamProgressTimeRange", timeRange.label);
    } else if (chartType === "salesComparison") {
      renderSalesComparisonChart(salesData);
      updateDropdownText("salesComparisonTimeRange", timeRange.label);
    }
  } catch (error) {
    console.error("Error initializing dashboard:", error);
  }
}


function downloadSalesReport() {
  if (!currentSalesData) {
    console.error("No sales data available for report");
    return;
  }

  try {
    
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];

   
    const csvContent = convertSalesToCSV(currentSalesData);

   
    const filename = `sales_report_${dateStr}.csv`;

   
    downloadFile(csvContent, filename, "text/csv;charset=utf-8;");

    console.log("Sales report downloaded successfully");
  } catch (error) {
    console.error("Error generating sales report:", error);
  }
}

function downloadCarsSoldReport() {
  if (!currentCarsSoldData) {
    console.error("No cars sold data available for report");
    return;
  }

  try {
  
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];

   
    const csvContent = convertCarsSoldToCSV(currentCarsSoldData);

    
    const filename = `cars_sold_report_${dateStr}.csv`;


    downloadFile(csvContent, filename, "text/csv;charset=utf-8;");

    console.log("Cars sold report downloaded successfully");
  } catch (error) {
    console.error("Error generating cars sold report:", error);
  }
}

function downloadBrandsReport() {
  if (!currentSalesData) {
    console.error("No sales data available for brands report");
    return;
  }

  try {
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];
    const csvContent = convertBrandsDataToCSV(currentSalesData);
    const filename = `brands_report_${dateStr}.csv`;
    downloadFile(csvContent, filename, "text/csv;charset=utf-8;");
    console.log("Brands report downloaded successfully");
  } catch (error) {
    console.error("Error generating brands report:", error);
  }
}


function downloadProfitReport() {
  if (!currentSalesData) {
    console.error("No sales data available for profit report");
    return;
  }

  try {
   
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];

    
    const csvContent = convertProfitDataToCSV(currentSalesData);


    const filename = `profit_report_${dateStr}.csv`;

 
    downloadFile(csvContent, filename, "text/csv;charset=utf-8;");

    console.log("Profit report downloaded successfully");
  } catch (error) {
    console.error("Error generating profit report:", error);
  }
}

function downloadTeamProgressReport() {
  if (!currentSalesData) {
    console.error("No data available for team progress report");
    return;
  }

  try {
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];
    const csvContent = convertTeamProgressToCSV(currentSalesData);
    const filename = `team_progress_report_${dateStr}.csv`;
    downloadFile(csvContent, filename, "text/csv;charset=utf-8;");
    console.log("Team progress report downloaded successfully");
  } catch (error) {
    console.error("Error generating team progress report:", error);
  }
}


function downloadSalesComparisonReport() {
  if (!currentSalesData) {
    console.error("No data available for sales comparison report");
    return;
  }

  try {
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];
    const csvContent = convertSalesComparisonToCSV(currentSalesData);
    const filename = `sales_comparison_report_${dateStr}.csv`;
    downloadFile(csvContent, filename, "text/csv;charset=utf-8;");
    console.log("Sales comparison report downloaded successfully");
  } catch (error) {
    console.error("Error generating sales comparison report:", error);
  }
}


window.downloadProfitReport = downloadProfitReport;


function setupTimeRangeDropdowns() {
  setupDropdown(
    "salesTimeRangeDropdownButton",
    "salesLastDaysDropdown",
    "sales"
  );
  setupDropdown("carsSoldTimeRangeDropdown", "carsSoldDropdown", "carsSold");
  setupDropdown(
    "revenueProfitTimeRangeDropdown",
    "revenueProfitDropdown",
    "revenueProfit"
  ); 
  setupDropdown(
    "teamProgressTimeRange", 
    "teamProgressDropdown", 
    "teamProgress"
  );
  setupDropdown(
    "brandsTimeRangeDropdown", 
    "brandsDropdown", 
    "brands"
  );

  setupDropdown(
    "salesComparisonTimeRange",
    "salesComparisonDropdown",
    "salesComparison"
  );
}

function setupDropdown(buttonId, menuId, chartType) {
  const dropdownMenu = document.getElementById(menuId);
  const dropdownButton = document.getElementById(buttonId);

  if (!dropdownMenu || !dropdownButton) {
    console.error(`Dropdown elements not found: ${buttonId}, ${menuId}`);
    return;
  }

  
  const dropdownConfig = Object.values(ChartConfigs.dropdownControls).find(
    (config) => config.buttonId === buttonId
  );

  if (!dropdownConfig) {
    console.error(`No configuration found for dropdown: ${buttonId}`);
    return;
  }


  dropdownMenu.innerHTML = "";

  const ul = document.createElement("ul");
  ul.className = "py-2 text-sm text-gray-700 dark:text-gray-200";
  ul.setAttribute("aria-labelledby", buttonId);


  Object.entries(TIME_RANGES).forEach(([key, range]) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.className =
      "block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer";
    a.textContent = range.label;

    a.addEventListener("click", async (e) => {
      e.preventDefault();

    
      await initDashboard(range, chartType);

   
      dropdownMenu.classList.add("hidden");
    });

    li.appendChild(a);
    ul.appendChild(li);
  });

  dropdownMenu.appendChild(ul);


  setupDropdownToggle(buttonId, menuId);
}

function setupDropdownToggle(buttonId, menuId) {
  const toggleButton = document.getElementById(buttonId);
  const dropdownContent = document.getElementById(menuId);

  if (toggleButton && dropdownContent) {
    toggleButton.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropdownContent.classList.toggle("hidden");
    });

    document.addEventListener("click", (e) => {
      if (
        !toggleButton.contains(e.target) &&
        !dropdownContent.contains(e.target)
      ) {
        dropdownContent.classList.add("hidden");
      }
    });
  }
}


function setupEventListeners() {

  const salesReportBtn = document.querySelector(
    "a.uppercase.text-sm.font-semibold:has(svg)"
  );
  const carsSoldReportBtn = document.getElementById("downloadCarsSoldReport");
  const brandsReportBtn = document.getElementById("downloadBrandsReport");
  const teamReportBtn = document.getElementById("downloadTeamReport");
  const salesComparisonReportBtn = document.getElementById("downloadSalesComparisonReport");

  if (teamReportBtn) {
    teamReportBtn.addEventListener("click", (e) => {
      e.preventDefault();
      downloadTeamProgressReport();
    });
  }

  if (salesComparisonReportBtn) {
    salesComparisonReportBtn.addEventListener("click", (e) => {
      e.preventDefault();
      downloadSalesComparisonReport();
    });
  }

  if (salesReportBtn) {
    salesReportBtn.addEventListener("click", (e) => {
      e.preventDefault();
      downloadSalesReport();
    });
    console.log("Sales report button listener added");
  } else {
    console.error("Sales report button not found");
  }


 
  if (brandsReportBtn) {
    brandsReportBtn.addEventListener("click", (e) => {
      e.preventDefault();
      downloadBrandsReport();
    });
    console.log("Cars sold report button listener added");
  } else {
    console.error("Cars sold report button not found");
  }

  if (carsSoldReportBtn) {
    carsSoldReportBtn.addEventListener("click", (e) => {
      e.preventDefault();
      downloadCarsSoldReport();
    });
    console.log("Cars sold report button listener added");
  } else {
    console.error("Cars sold report button not found");
  }

  setupTimeRangeDropdowns();


}

document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM loaded, initializing analytics dashboard...");

  setupTimeRangeDropdowns();


  setupEventListeners();


  await initDashboard(TIME_RANGES.MONTH);
});
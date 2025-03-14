import carModels from "./modelConst.js";

export const formatPrice = (price) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "GBP",
  }).format(price);
};

export const formatDate = (date) => {
  if (!date) return "";
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(date).toLocaleDateString("en-US", options);
};

export const showModal = ({ message, isSuccess }) => {
  const modal = document.getElementById("success-modal");
  const modalMessage = document.getElementById("modal-message");
  const modalIcon = document.getElementById("modal-icon");
  const modalIconPath = document.getElementById("modal-icon-path");

  if (!modal || !modalMessage || !modalIcon || !modalIconPath) {
    console.error("Modal elements not found");
    return;
  }

  
  modalMessage.textContent = message;

 
  if (isSuccess) {
    modalIcon.classList.add("text-green-400", "dark:text-green-200");
    modalIcon.classList.remove("text-red-400", "dark:text-red-200");
    modalIconPath.setAttribute("d", "M10 6l3 3-3 3m3-3H7"); 
  } else {
    modalIcon.classList.add("text-red-400", "dark:text-red-200");
    modalIcon.classList.remove("text-green-400", "dark:text-green-200");
    modalIconPath.setAttribute("d", "M10 6V10m0 0H6m4 0h4m-4 0v4m0-4v-4m0 8a8 8 0 1 0-8-8 8 8 0 0 0 8 8z");
  }


  if (!window.Flowbite) {
    modal.classList.remove("hidden");
    return;
  }


  const targetModal = new window.Flowbite.default.Modal(modal);
  targetModal.show();


  setTimeout(() => {
    targetModal.hide();
  }, 3000);
};

export function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function convertSalesToCSV(salesData) {

  let csvContent = "Date,Sales Amount (£)\n";
  
 
  if (salesData && salesData.salesData && Array.isArray(salesData.salesData)) {
    salesData.salesData.forEach(item => {
      if (Array.isArray(item) && item.length === 2) {
        
        const dateObj = new Date(item[0]);
        const formattedDate = dateObj.toLocaleDateString('en-GB', {
          year: 'numeric',
          month: 'short',
          day: '2-digit'
        });
        
    
        csvContent += `${formattedDate},${item[1]}\n`;
      }
    });
    
 
    csvContent += `\nTotal,${salesData.totalSales}\n`;
    
    
    csvContent += `Percentage Change,${salesData.percentageChange}%\n`;
  }
  
  return csvContent;
}

export function convertCarsSoldToCSV(salesData) {
 
  let csvContent = "Date,Cars Sold,Average Price (£),Revenue (£)\n";
  

  if (salesData && salesData.vehiclesSoldByDate && Array.isArray(salesData.vehiclesSoldByDate)) {
    salesData.vehiclesSoldByDate.forEach(item => {
      if (Array.isArray(item) && item.length >= 2) {
      
        const dateObj = new Date(item[0]);
        const formattedDate = dateObj.toLocaleDateString('en-GB', {
          year: 'numeric',
          month: 'short',
          day: '2-digit'
        });
        
        const carsSold = item[1] || 0;
        const avgPrice = salesData.averagePrice || 0;
        const revenue = carsSold * avgPrice;
        
    
        csvContent += `${formattedDate},${carsSold},${Math.round(avgPrice)},${Math.round(revenue)}\n`;
      }
    });
  
    csvContent += `\nTotal Cars Sold,${salesData.totalVehiclesSold || 0}\n`;
    csvContent += `Percentage Change,${salesData.vehicleSalesPercentageChange || 0}%\n`;
    csvContent += `Profit Margin,${salesData.profitMargin || 0}%\n`;
  }
  
  return csvContent;
}

export function downloadFile(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function convertProfitDataToCSV(salesData) {

  let csvContent = "Date,Revenue (£),Profit (£),Profit Margin (%)\n";
  

  if (salesData && salesData.salesData && Array.isArray(salesData.salesData)) {
    const profitMargin = salesData.profitMargin || 0;
    const profitMarginDecimal = profitMargin / 100;
    
    salesData.salesData.forEach(item => {
      if (Array.isArray(item) && item.length >= 2) {
   
        const dateObj = new Date(item[0]);
        const formattedDate = dateObj.toLocaleDateString('en-GB', {
          year: 'numeric',
          month: 'short',
          day: '2-digit'
        });
        
        const revenue = item[1] || 0;
        const profit = Math.round(revenue * profitMarginDecimal);
        
        csvContent += `${formattedDate},${revenue},${profit},${profitMargin}\n`;
      }
    });
    

    const totalRevenue = salesData.totalSales || 0;
    const totalProfit = Math.round(totalRevenue * profitMarginDecimal);
    
    csvContent += `\nTotal,${totalRevenue},${totalProfit},${profitMargin}\n`;
    csvContent += `Percentage Change,${salesData.percentageChange || 0}%,,\n`;
  }
  
  return csvContent;
}

export function convertBrandsDataToCSV(salesData) {
  let csvContent = "Body Style,Brand,Model,Units Sold,Percentage\n";
  
  if (salesData && salesData.topSellingCars) {
    salesData.topSellingCars.forEach(item => {
      csvContent += `${item.bodyStyle},${item.brand},${item.model},${item.quantity},${item.percentage.toFixed(1)}%\n`;
    });
    
    csvContent += "\nBy Body Style:\n";
    
    Object.entries(salesData.topSellingByBodyStyle || {}).forEach(([bodyStyle, cars]) => {
      csvContent += `\n${bodyStyle}\n`;
      cars.forEach(car => {
        csvContent += `${bodyStyle},${car.brand},${car.model},${car.quantity},${car.percentage.toFixed(1)}%\n`;
      });
    });
  }
  
  return csvContent;
}

export function convertTeamProgressToCSV(salesData) {
  let csvContent = "Metric,Value,Target\n";
  

  const profitMargin = salesData.profitMargin || 0;
  const targetProgress = 80;
  const stockTurnover = (salesData.totalVehiclesSold || 0) / (salesData.averageInventory || 1) * 100;
  
  csvContent += `Target Progress,${targetProgress.toFixed(1)}%,100%\n`;
  csvContent += `Profit Margin,${profitMargin.toFixed(1)}%,80%\n`;
  csvContent += `Stock Turnover,${stockTurnover.toFixed(1)}%,70%\n`;
  

  const averagePerformance = (targetProgress + profitMargin + stockTurnover) / 3;
  csvContent += `\nOverall Performance,${averagePerformance.toFixed(1)}%\n`;
  
  return csvContent;
}

export function convertSalesComparisonToCSV(salesData) {
  let csvContent = "Date,Current Period (£),Previous Year (£),Difference (%)\n";
  
  if (salesData && salesData.salesData) {
    salesData.salesData.forEach(([date, currentAmount]) => {
      const previousAmount = currentAmount * 0.8; // Simulated previous year
      const difference = ((currentAmount - previousAmount) / previousAmount) * 100;
      
      const formattedDate = new Date(date).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
      });
      
      csvContent += `${formattedDate},${currentAmount},${previousAmount.toFixed(2)},${difference.toFixed(1)}%\n`;
    });

    const currentTotal = salesData.salesData.reduce((sum, [_, amount]) => sum + amount, 0);
    const previousTotal = currentTotal * 0.8;
    const totalDifference = ((currentTotal - previousTotal) / previousTotal) * 100;
    
    csvContent += `\nTotals,${currentTotal},${previousTotal.toFixed(2)},${totalDifference.toFixed(1)}%\n`;
  }
  
  return csvContent;
}


function calculateStringSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  return (longer.length - editDistance(longer, shorter)) / longer.length;
}

function editDistance(str1, str2) {
  const matrix = Array(str2.length + 1).fill().map(() => 
    Array(str1.length + 1).fill(0)
  );

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      if (str1[i-1] === str2[j-1]) {
        matrix[j][i] = matrix[j-1][i-1];
      } else {
        matrix[j][i] = Math.min(
          matrix[j-1][i-1] + 1, 
          matrix[j][i-1] + 1,  
          matrix[j-1][i] + 1   
        );
      }
    }
  }
  return matrix[str2.length][str1.length];
}


export function findMatchingModel(fullModelName) {
  console.log("Searching for model:", fullModelName);
  if (!fullModelName) return "";


  const modelLower = fullModelName.toLowerCase()
    .replace(/\s*-\s*/g, ' ')          
    .replace(/\s+/g, ' ')              
    .replace(/\([^)]*\)/g, '')        
    .trim();

  const mainModelName = modelLower.split(/\s+/).slice(0, 2).join(' ');

  console.log("Main model name:", mainModelName);

  const potentialMatches = carModels
    .map(model => ({
      model,
      score: calculateStringSimilarity(
        model.toLowerCase(),
        mainModelName
      ),
      isContained: modelLower.includes(model.toLowerCase())
    }))
    .filter(match => match.score > 0.6 || match.isContained) 
    .sort((a, b) => {
      
      if (a.isContained && !b.isContained) return -1;
      if (!a.isContained && b.isContained) return 1;
      return b.score - a.score;
    });

    console.log("Potential matches:", potentialMatches);

  return potentialMatches.length > 0 ? potentialMatches[0].model : "";
}
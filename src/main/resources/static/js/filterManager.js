export default class FilterManager {
  constructor(inventoryManager) {
    this.inventoryManager = inventoryManager;
    this.filters = {
      status: "",
      brand: "",
      minPrice: "",
      maxPrice: "",
      search: "",
      dateFrom: "", 
      dateTo: "",
    };
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.filteredData = [];
    this.debounceTimeout = null;

    this.initializeFilters();
    this.initializePagination();
    this.populateBrandFilter();
  }

  initializeFilters() {
    const filterSelectors = {
      "status-filter": { type: "select", key: "status" },
      "brand-filter": { type: "select", key: "brand" },
      "min-price": { type: "price", key: "minPrice" },
      "max-price": { type: "price", key: "maxPrice" },
      "table-search-users": { type: "search", key: "search" },
      "date-from": { type: "date", key: "dateFrom" }, 
      "date-to": { type: "date", key: "dateTo" },
    };

    Object.entries(filterSelectors).forEach(([id, config]) => {
      const element = document.getElementById(id);
      if (!element) return;

      switch (config.type) {
        case "date":
          
          element.addEventListener("change", (e) => {
            console.log(
              `Date filter changed: ${config.key} = ${e.target.value}`
            );
            this.filters[config.key] = e.target.value;
            this.currentPage = 1;
            this.refreshTable();
          });
          break;
        case "price":
          
          element.addEventListener("input", (e) => {
            this.filters[config.key] = e.target.value;
            this.currentPage = 1;

          
            if (this.debounceTimeout) {
              clearTimeout(this.debounceTimeout);
            }

          
            this.debounceTimeout = setTimeout(() => {
              this.refreshTable();
            }, 300); 
          });

       
          element.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              this.filters[config.key] = e.target.value;
              this.currentPage = 1;
              this.refreshTable();
            }
          });
          break;

        case "select":
       
          element.addEventListener("change", (e) => {
            this.filters[config.key] = e.target.value;
            this.currentPage = 1;
            this.refreshTable();
          });
          break;

        case "search":
     
          element.addEventListener("input", (e) => {
            this.filters[config.key] = e.target.value;
            this.currentPage = 1;

            if (this.debounceTimeout) {
              clearTimeout(this.debounceTimeout);
            }

            this.debounceTimeout = setTimeout(() => {
              this.refreshTable();
            }, 300);
          });
          break;
      }
    });
  }

  initializePagination() {
    const paginationControls = {
      "items-per-page": (e) => {
        this.itemsPerPage = parseInt(e.target.value);
        this.currentPage = 1;
      },
      "prev-page": () => {
        if (this.currentPage > 1) this.currentPage--;
      },
      "next-page": () => {
        const totalPages = Math.ceil(
          this.filteredData.length / this.itemsPerPage
        );
        if (this.currentPage < totalPages) this.currentPage++;
      },
    };

    Object.entries(paginationControls).forEach(([id, handler]) => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener("click", (e) => {
          handler(e);
          this.refreshTable();
        });
      }
    });
  }

  updatePagination() {
    const totalItems = this.filteredData.length;
    const totalPages = Math.ceil(totalItems / this.itemsPerPage);
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(start + this.itemsPerPage - 1, totalItems);

    this.updatePaginationDisplay(start, end, totalItems);
    this.updatePageNumbers(totalPages);
  }

  updatePaginationDisplay(start, end, total) {
    const elements = {
      "showing-start": start,
      "showing-end": end,
      "total-items": total,
    };

    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });
  }

  updatePageNumbers(totalPages) {
    const pageNumbers = document.getElementById("page-numbers");
    if (!pageNumbers) return;

    pageNumbers.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
      const li = document.createElement("li");
      li.innerHTML = this.createPageButton(i);
      li.addEventListener("click", () => {
        this.currentPage = i;
        this.refreshTable();
      });
      pageNumbers.appendChild(li);
    }
  }

  createPageButton(pageNum) {
    const isActive = pageNum === this.currentPage;
    const buttonClasses = isActive
      ? "text-blue-600 border border-blue-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700"
      : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700";

    return `
            <button class="flex items-center justify-center px-3 h-8 leading-tight ${buttonClasses} dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                ${pageNum}
            </button>
        `;
  }

  populateBrandFilter() {
    const brandSelect = document.getElementById("brand-filter");
    if (!brandSelect) return;

    const brands = [
      ...new Set(this.inventoryManager.vehicles.map((v) => v.make)),
    ].filter(Boolean);

    brandSelect.innerHTML = '<option value="">All Brands</option>';

  
    brands.sort().forEach((brand) => {
      const option = document.createElement("option");
      option.value = brand;
      option.textContent = brand;
      brandSelect.appendChild(option);
    });
  }

  filterData(data) {
    return data.filter((item) => {
      const itemDate = new Date(item.createdAt);

      const matchesDateFrom =
        !this.filters.dateFrom || itemDate >= new Date(this.filters.dateFrom);

      const matchesDateTo =
        !this.filters.dateTo ||
        itemDate <= new Date(this.filters.dateTo + "T23:59:59");

      const matchesStatus =
        !this.filters.status ||
        item.status?.toLowerCase() === this.filters.status.toLowerCase();

      const matchesBrand =
        !this.filters.brand ||
        item.make?.toLowerCase() === this.filters.brand.toLowerCase();

      const matchesPrice =
        (!this.filters.minPrice ||
          Number(item.listPrice) >= Number(this.filters.minPrice)) &&
        (!this.filters.maxPrice ||
          Number(item.listPrice) <= Number(this.filters.maxPrice));

      const matchesSearch =
        !this.filters.search ||
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(this.filters.search.toLowerCase())
        );

      console.log(`Filtering item ${item.id}:`, {
        date: itemDate,
        dateFrom: this.filters.dateFrom
          ? new Date(this.filters.dateFrom)
          : null,
        dateTo: this.filters.dateTo
          ? new Date(this.filters.dateTo + "T23:59:59")
          : null,
        matchesDateFrom,
        matchesDateTo,
      });

      return (
        matchesStatus &&
        matchesBrand &&
        matchesPrice &&
        matchesSearch &&
        matchesDateFrom &&
        matchesDateTo
      );
    });
  }

  refreshTable() {
    // Add debug logging
    console.log("Current filters:", this.filters);
    this.filteredData = this.filterData(this.inventoryManager.vehicles);
    console.log("Filtered data count:", this.filteredData.length);

    const start = (this.currentPage - 1) * this.itemsPerPage;
    const paginatedData = this.filteredData.slice(
      start,
      start + this.itemsPerPage
    );

    this.inventoryManager.uiManager.renderTable(paginatedData);
    this.updatePagination();
  }
}

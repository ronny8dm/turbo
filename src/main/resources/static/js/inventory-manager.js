/** @format */
import { formatPrice, formatDate, findMatchingModel } from "./helpers/utils.js";
import ApiService from "./apiService.js";
import UIManager from "./uiManager.js";
import FormHandler from "./formHandler.js";
import FeatureManager from "./featureManager.js";
import ImageManager from "./imageManager.js";
import FilterManager from "./filterManager.js";
import competitorsListings from "./competitorsListings.js";

class InventoryManager {
  constructor() {
    this.apiBaseUrl = "/api/vehicles";
    this.dealershipId = null;
    this.vehicles = [];
    this.apiService = new ApiService(this.apiBaseUrl);
    this.uiManager = new UIManager(this);
    this.formHandler = new FormHandler(this);
    this.featureManager = new FeatureManager(this);
    this.imageManager = new ImageManager(this);
    this.FilterManager = new FilterManager(this);
    this.formatPrice = formatPrice;
    this.formatDate = formatDate;
    this.findMatchingModel = findMatchingModel;
    this.competitorsListings = new competitorsListings();
    this.init();
  }

  async init() {
    try {
      await this.findDealershipId();
      await this.loadVehicles();
      this.uiManager.setupEventListeners();
      if (this.vehicles.length > 0) {
        await this.imageManager.displayVehicleImages(this.vehicles[0].id);
      }
      window.uiManager = this.uiManager;
    } catch (error) {
      console.error("Error initializing InventoryManager:", error);
    }
  }

  async findDealershipId() {
    const profile = await this.apiService.getCurrentUser();
    this.dealershipId = profile?.dealershipId;
  }

  async loadVehicles() {
    if (!this.dealershipId) throw new Error("Dealership ID is not set");

    this.vehicles = await this.apiService.fetchVehicles(this.dealershipId);

   
    const imageLoadPromises = this.vehicles.map(async (vehicle) => {
      try {
        const response = await fetch(
          `${this.apiBaseUrl}/${vehicle.id}/images`,
          {
            method: "GET",
            headers: this.apiService.getHeaders(),
          }
        );
        if (response.ok) {
          const images = await response.json();
          vehicle.images = images;
        }
      } catch (error) {
        console.warn(`Failed to load images for vehicle ${vehicle.id}:`, error);
        vehicle.images = [];
      }
    });

  
    await Promise.all(imageLoadPromises);

    this.uiManager.renderTable(this.vehicles);
    this.FilterManager.populateBrandFilter();
  }

  async loadSimilarVehicles(vehicleData) {
    try {
      const model = this.findMatchingModel(vehicleData.CarModel?.CurrentTextValue);
      const competitors = await this.competitorsListings.getCompetitors({
        make: vehicleData.CarMake?.CurrentTextValue,
        model:model,
        year: vehicleData.RegistrationYear,
        postcode: "SW1A1AA",
      });

      console.log("Competitors:", competitors);
    
      if (competitors && competitors.length > 0) {
        this.renderSimilarVehicles(competitors);
      } else {
        this.showSimilarVehiclesError();
      }
    } catch (error) {
      console.error("Error loading similar vehicles:", error);
      this.showSimilarVehiclesError();
    }
  }

  renderSimilarVehicles(vehicles) {
    const container = document.getElementById("similar-vehicles-container");
    const loadingEl = document.getElementById("similar-vehicles-loading");

    if (loadingEl) loadingEl.classList.add("hidden");

    if (!vehicles || vehicles.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-4 text-gray-500">
          No similar vehicles found
        </div>
      `;
      return;
    }

    const vehicleCards = vehicles
      .map(
        (vehicle) => `
      <div hrf="${vehicle.url}" class="bg-white rounded-lg shadow-md overflow-hidden">
        <img src="${vehicle.imageUrl}" alt="${vehicle.make} ${vehicle.model}" 
             class="w-full h-48 object-cover">
        <div class="p-4">
          <h3 class="font-semibold text-lg">${vehicle.make} ${vehicle.model}</h3>
          <p class="text-gray-600">${vehicle.year}</p>
          <div class="mt-2 flex justify-between items-center">
            <span class="text-lg font-bold text-blue-600">${vehicle.price}</span>
            <span class="text-sm text-gray-500">${vehicle.miles} miles</span>
          </div>
          <p class="text-sm text-gray-500 mt-2">${vehicle.location}</p>
        </div>
      </div>
    `
      )
      .join("");

    container.innerHTML = vehicleCards;
  }

  showSimilarVehiclesError() {
    const container = document.getElementById("similar-vehicles-container");
    const loadingEl = document.getElementById("similar-vehicles-loading");

    if (loadingEl) loadingEl.classList.add("hidden");

    container.innerHTML = `
      <div class="col-span-full">
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <strong class="font-bold">Error!</strong>
          <span class="block sm:inline"> Unable to load similar vehicles.</span>
        </div>
      </div>
    `;
  }

  showLoading() {
    const loadingEl = document.getElementById('similar-vehicles-loading');
    if (loadingEl) {
      loadingEl.classList.remove('hidden');
    }
    const errorEl = document.getElementById('similar-vehicles-error');
    if (errorEl) {
      errorEl.classList.add('hidden');
    }
    const emptyEl = document.getElementById('similar-vehicles-empty');
    if (emptyEl) {
      emptyEl.classList.add('hidden');
    }
  }

  hideLoading() {
    const loadingEl = document.getElementById('similar-vehicles-loading');
    if (loadingEl) {
      loadingEl.classList.add('hidden');
    }
  }

  async loadSimilarVehicles(vehicleData) {
    try {
      this.showLoading();
      const model = this.findMatchingModel(vehicleData.CarModel?.CurrentTextValue);
      const competitors = await this.competitorsListings.getCompetitors({
        make: vehicleData.CarMake?.CurrentTextValue,
        model: model,
        year: vehicleData.RegistrationYear,
        postcode: "SW1A1AA"
      });

      if (competitors && competitors.length > 0) {
        this.renderSimilarVehicles(competitors);
      } else {
        this.showSimilarVehiclesError();
      }
    } catch (error) {
      console.error("Error loading similar vehicles:", error);
      this.showSimilarVehiclesError();
    } finally {
      this.hideLoading();
    }
  }
}

export default InventoryManager;

document.addEventListener("DOMContentLoaded", () => {
  window.inventoryManager = new InventoryManager();
  window.inventoryManager.uiManager.populateYearDropdown(
    ".year-dropdown",
    1800,
    new Date().getFullYear()
  );
});

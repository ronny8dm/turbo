class uiManager {
  constructor(manager) {
    this.manager = manager;
  }

  setupEventListeners() {
    const imageInput = document.getElementById("vehicle-images");
    if (imageInput) {
      imageInput.addEventListener("change", this.handleImagePreview.bind(this));
    }

    const forms = [
      {
        id: "add-vehicle-form",
        handler: this.manager.formHandler.submitVehicleForm,
      },
      {
        id: "edit-vehicle-form",
        handler: this.manager.formHandler.submitEditVehicleForm,
      },
      {
        id: "sell-vehicle-form",
        handler: this.manager.formHandler.submitSellVehicleForm,
      },
    ];

    forms.forEach(({ id, handler }) => {
      const form = document.getElementById(id);
      if (form)
        form.addEventListener("submit", handler.bind(this.manager.formHandler));
    });
  }

  renderTable(vehicles) {
    const tableBody = document.getElementById("inventory-table-body");
    if (!tableBody) {
      console.error("Inventory table body not found");
      return;
    }

    tableBody.innerHTML = "";

    // Remove any existing image modal to prevent duplicates
    const existingModal = document.getElementById("image-modal");
    if (existingModal) {
      existingModal.remove();
    }

    vehicles.forEach((vehicle) => {
      console.log(`Vehicle ID: ${vehicle.id}`);
      if (vehicle.images) {
        console.log("Images array:", vehicle.images);
      }

      // Set default image
      let imageUrl = "/static/images/place-holder.jpg";

      // Find primary image or first image
      if (vehicle.images && vehicle.images.length > 0) {
        const primaryImg = vehicle.images.find((img) => img.isPrimary === true);
        if (primaryImg) {
          imageUrl = primaryImg.url;
        } else if (vehicle.images[0]) {
          imageUrl = vehicle.images[0].url;
        }
      }

      const row = document.createElement("tr");
      row.className =
        "bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600";

      row.innerHTML = `
            <td class="p-4">
              <input data-id="${
                vehicle.id
              }" type="checkbox" class="vehicle-checkbox w-4 h-4">
            </td>
            <td class="p-4">
              <div class="w-16 h-16 relative group cursor-pointer" onclick="window.uiManager.showImageModal('${imageUrl}', ${JSON.stringify(
        vehicle.images || []
      ).replace(/"/g, "&quot;")})">
                <img 
                  src="${imageUrl}"
                  alt="${vehicle.make} ${vehicle.model}"
                  class="w-full h-full object-cover rounded-lg"
                  onerror="this.onerror=null; this.src='/static/images/place-holder.jpg';"
                >
                ${
                  vehicle.images && vehicle.images.length > 1
                    ? `<span class="absolute bottom-0 right-0 bg-gray-800 text-white text-xs px-1 rounded-bl-lg">
                    +${vehicle.images.length - 1}
                   </span>`
                    : ""
                }
              </div>
            </td>
            <td class="p-4">${vehicle.make || ""}</td>
            <td class="p-4">${vehicle.model || ""}</td>
            <td class="p-4">${vehicle.vrm || ""}</td>
            <td class="p-4">
              <span class="${this.getStatusClass(vehicle.status)}">${
        vehicle.status || ""
      }</span>
            </td>
            <td class="p-4">${
              this.manager.formatPrice(vehicle.listPrice) || ""
            }</td>
            <td class="p-4">${
              vehicle.createdAt
                ? this.manager.formatDate(vehicle.createdAt)
                : ""
            }</td>
            <td class="p-4">${
              vehicle.soldDate ? this.manager.formatDate(vehicle.soldDate) : ""
            }</td>
            <td class="p-4">${
              vehicle.features
                ? vehicle.features.map((f) => f.name).join(", ")
                : ""
            }</td>
            <td class="p-4">${
              vehicle.soldBy
                ? `${vehicle.soldBy.firstName} ${vehicle.soldBy.lastName}`
                : ""
            }</td>
            <td class="p-4">${
              vehicle.soldPrice
                ? this.manager.formatPrice(vehicle.soldPrice)
                : ""
            }</td>
            <td class="p-4">
              <div class="flex items-center space-x-2">
                ${
                  vehicle.status !== "Sold"
                    ? `<button 
                    data-id="${vehicle.id}" 
                    onclick="window.inventoryManager.formHandler.openSellModal(${vehicle.id})" 
                    class="sell-btn px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">
                    Sell
                  </button>`
                    : ""
                }
                <button 
                  data-id="${vehicle.id}" 
                  onclick="window.inventoryManager.formHandler.openEditModal(${
                    vehicle.id
                  })" 
                  class="edit-btn px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Edit
                </button>
              </div>
            </td>
          `;

      tableBody.appendChild(row);
    });

    // Add modal HTML
    const modalHtml = `
          <div id="image-modal" class="fixed inset-0 z-50 hidden overflow-y-auto bg-black bg-opacity-75">
            <div class="flex items-center justify-center min-h-screen p-4">
              <div class="relative bg-white rounded-lg shadow dark:bg-gray-700 max-w-4xl max-h-[90vh] overflow-auto">
                <button class="absolute top-2 right-2 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" onclick="window.uiManager.hideImageModal()">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </button>
                <div class="p-4">
                  <img id="modal-image" class="rounded-lg mx-auto max-h-[70vh]" src="" alt="Vehicle Image">
                  <div id="image-thumbnails" class="flex flex-wrap gap-2 mt-4 justify-center"></div>
                </div>
              </div>
            </div>
          </div>
        `;
    document.body.insertAdjacentHTML("beforeend", modalHtml);
  }

  showImageModal(imageUrl, images = []) {
    const modal = document.getElementById("image-modal");
    const modalImage = document.getElementById("modal-image");
    const thumbnailsContainer = document.getElementById("image-thumbnails");

    // Set the main image
    modalImage.src = imageUrl;

    // Clear previous thumbnails
    thumbnailsContainer.innerHTML = "";

    // Add thumbnails if there are multiple images
    if (Array.isArray(images) && images.length > 1) {
      images.forEach((image) => {
        const thumbnail = document.createElement("img");
        thumbnail.src = image.url || "/static/images/place-holder.jpg";
        thumbnail.alt = "Vehicle thumbnail";
        thumbnail.className =
          "w-16 h-16 object-cover rounded cursor-pointer border-2";

        // Highlight the current image
        if (image.url === imageUrl) {
          thumbnail.classList.add("border-blue-500");
        } else {
          thumbnail.classList.add(
            "border-transparent",
            "hover:border-gray-300"
          );
        }

        // Change main image when clicking thumbnail
        thumbnail.onclick = () => {
          modalImage.src = image.url;

          // Update thumbnail highlighting
          thumbnailsContainer.querySelectorAll("img").forEach((img) => {
            img.classList.remove("border-blue-500");
            img.classList.add("border-transparent", "hover:border-gray-300");
          });
          thumbnail.classList.remove(
            "border-transparent",
            "hover:border-gray-300"
          );
          thumbnail.classList.add("border-blue-500");
        };

        thumbnailsContainer.appendChild(thumbnail);
      });
    }

    modal.classList.remove("hidden");
  }

  hideImageModal() {
    const modal = document.getElementById("image-modal");
    if (modal) {
      modal.classList.add("hidden");
    }
  }

  getStatusClass(status) {
    const statusClasses = {
      Available: "px-2 py-1 rounded-full bg-green-100 text-green-800",
      Sold: "px-2 py-1 rounded-full bg-blue-100 text-blue-800",
      Reserved: "px-2 py-1 rounded-full bg-yellow-100 text-yellow-800",
      "In Service": "px-2 py-1 rounded-full bg-gray-100 text-gray-800",
    };
    return (
      statusClasses[status] ||
      "px-2 py-1 rounded-full bg-gray-100 text-gray-800"
    );
  }

  toggleModal(modalId, show) {
    const modal = document.getElementById(modalId);
    if (!modal) return console.error(`${modalId} not found in DOM`);
    modal.classList.toggle("hidden", !show);
    modal.classList.toggle("flex", show);
    document.body.style.overflow = show ? "hidden" : "auto";
  }

  handleImagePreview(event) {
    const previewContainer = document.getElementById("image-preview");
    if (!previewContainer)
      return console.error("Image preview container not found");
    previewContainer.innerHTML = "";
    Array.from(event.target.files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement("img");
        img.src = e.target.result;
        img.className = "h-24 w-24 object-cover rounded";
        previewContainer.appendChild(img);
      };
      reader.readAsDataURL(file);
    });
  }

  populateYearDropdown(selector, startYear, endYear) {
    document.querySelectorAll(selector).forEach((select) => {
      select.innerHTML =
        '<option value="" disabled selected>Select Year</option>';
      for (let year = endYear; year >= startYear; year--) {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        select.appendChild(option);
      }
    });
  }

  openSellModal(vehicleId) {
    this.manager.formHandler.openSellModal(vehicleId);
  }

  openEditModal(vehicleId) {
    this.manager.formHandler.openEditModal(vehicleId);
  }

  async lookupAndPopulateVehicle(vrm) {
    try {
      console.log("Looking up vehicle with VRM:", vrm);
      const select = document.querySelector('select[name="selectedVehicle"]');
      if (!select) {
        console.error("Select element not found.");
        return;
      }

      select.innerHTML =
        '<option value="" disabled selected>Select Vehicle</option>';

      // Fetch vehicle data using ApiService
      const data = await this.manager.apiService.lookupVehicle(vrm);
      console.log("[DEBUG] Vehicle lookup response:", data);

      // Populate the select dropdown
      const option = document.createElement("option");
      option.value = JSON.stringify(data);
      option.textContent = `${data.CarMake?.CurrentTextValue || ""} ${
        data.CarModel?.CurrentTextValue || ""
      } - ${data.RegistrationYear || ""}`;
      option.selected = true;
      select.appendChild(option);

      // Populate the form fields
      this.populateVehicleForm(data);

      // Load similar vehicles
      await this.manager.loadSimilarVehicles(data);
    } catch (error) {
      console.error("Error during vehicle lookup:", error);
      showModal({
        message: `Error looking up vehicle: ${error.message}`,
        isSuccess: false,
      });
    }
  }

  populateVehicleForm(data) {
    const form = document.getElementById("add-vehicle-form");
    if (!form) {
      console.error("Vehicle form not found.");
      return;
    }

    const fieldMappings = {
      make: data.CarMake?.CurrentTextValue,
      model: data.CarModel?.CurrentTextValue,
      description: data.Description,
      colour: data.Colour,
      year: data.RegistrationYear,
      vin: data.VehicleIdentificationNumber,
      vrm: document.querySelector('input[name="lookupVRM"]').value,
      bodyStyle: data.BodyStyle?.CurrentTextValue,
      engineSize: data.EngineSize?.CurrentTextValue,
      engineCode: data.EngineCode,
      engineNumber: data.EngineNumber,
      transmission: data.Transmission?.CurrentTextValue,
      fuelType: data.FuelType?.CurrentTextValue,
      doors: data.NumberOfDoors?.CurrentTextValue,
      seats: data.NumberOfSeats?.CurrentTextValue,
      insuranceGroup: data.VehicleInsuranceGroup,
      insuranceGroupMax: data.VehicleInsuranceGroupOutOf,
      abiCode: data.ABICode,
    };

    Object.entries(fieldMappings).forEach(([fieldName, value]) => {
      if (!value) return; // Skip if value is undefined or null

      // Update display element
      const displayElement = document.getElementById(`${fieldName}-display`);
      if (displayElement) {
        displayElement.textContent = value;
      }

      // Update hidden input
      const inputElement = document.getElementById(`${fieldName}-input`);
      if (inputElement) {
        inputElement.value = value;
      }

      // Fall back to regular form element if no display/input pattern
      const formElement = form.elements[fieldName];
      if (formElement && !displayElement) {
        formElement.value = value;
      }
    });
  }

  populateVehicleDetails(vehicleData) {
    document.getElementById("make-input").value = vehicleData.make;
    document.getElementById("model-input").value = vehicleData.model;
    document.getElementById("year-input").value = vehicleData.year;
    document.getElementById("description-input").value =
      vehicleData.description;
    document.getElementById("colour-input").value = vehicleData.colour;
    document.getElementById("vin-input").value = vehicleData.vin;
    document.getElementById("vrm-input").value = vehicleData.vrm;
    document.getElementById("bodyStyle-input").value = vehicleData.bodyStyle;
    document.getElementById("transmission-input").value =
      vehicleData.transmission;
    document.getElementById("engineSize-input").value = vehicleData.engineSize;
    document.getElementById("doors-input").value = vehicleData.doors;
    document.getElementById("abiCode-input").value = vehicleData.abiCode;
    document.getElementById("engineNumber-input").value =
      vehicleData.engineNumber;
    document.getElementById("fuelType-input").value = vehicleData.fuelType;
    document.getElementById("seats-input").value = vehicleData.seats;
    document.getElementById("insuranceGroup-input").value =
      vehicleData.insuranceGroup;
    document.getElementById("insuranceGroupMax-input").value =
      vehicleData.insuranceGroupMax;

    // Update display elements
    document.getElementById("make-display").textContent = vehicleData.make;
    document.getElementById("model-display").textContent = vehicleData.model;
    document.getElementById("year-display").textContent = vehicleData.year;
    document.getElementById("description-display").textContent =
      vehicleData.description;
    document.getElementById("colour-display").textContent = vehicleData.colour;
    document.getElementById("vin-display").textContent = vehicleData.vin;
    document.getElementById("vrm-display").textContent = vehicleData.vrm;
    document.getElementById("bodyStyle-display").textContent =
      vehicleData.bodyStyle;
    document.getElementById("transmission-display").textContent =
      vehicleData.transmission;
    document.getElementById("engineSize-display").textContent =
      vehicleData.engineSize;
    document.getElementById("doors-display").textContent = vehicleData.doors;
    document.getElementById("abiCode-display").textContent =
      vehicleData.abiCode;
    document.getElementById("engineNumber-display").textContent =
      vehicleData.engineNumber;
    document.getElementById("fuelType-display").textContent =
      vehicleData.fuelType;
    document.getElementById("seats-display").textContent = vehicleData.seats;
    document.getElementById("insuranceGroup-display").textContent =
      vehicleData.insuranceGroup;
    document.getElementById("insuranceGroupMax-display").textContent =
      vehicleData.insuranceGroupMax;
  }

  
}

export default uiManager;

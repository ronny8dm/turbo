import { showModal } from "./helpers/utils.js";

class FormHandler {
  constructor(manager) {
    this.manager = manager;
  }

  async submitVehicleForm(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const loadingEl = document.createElement("div");
    loadingEl.className = "text-blue-600 font-medium mt-2";
    form.appendChild(loadingEl);

    try {
      loadingEl.textContent = "Creating vehicle...";

      // First save the vehicle
      const vehicleData = this.getVehicleData(formData);
      const createdVehicle = await this.manager.apiService.createVehicle(
        vehicleData
      );

      // Then upload images if any are selected
      const imageInput = document.getElementById("vehicle-images");
      if (imageInput?.files.length > 0) {
        loadingEl.textContent = "Uploading images...";
        await this.manager.imageManager.uploadVehicleImages(
          createdVehicle.id,
          imageInput
        );
      }

      form.reset();
      this.manager.uiManager.toggleModal("vehicle-modal", false);
      showModal({ message: "Vehicle created successfully.", isSuccess: true });
      await this.manager.loadVehicles();

 
      await this.manager.loadSimilarVehicles(vehicleData);
    } catch (error) {
      console.error("Error in form submission:", error);
      showModal({
        message: `Error: ${error.message}`,
        isSuccess: false,
      });
    } finally {
      loadingEl.remove();
    }
  }

  async submitEditVehicleForm(event) {
    event.preventDefault();
    const form = event.target;
    const vehicleId = form.querySelector("#edit-id-input").value;
    const updatedVehicle = this.getFormData(form);

    try {
      await this.manager.apiService.updateVehicle(vehicleId, updatedVehicle);
      form.reset();
      this.manager.uiManager.toggleModal("edit-vehicle-modal", false);
      showModal({ message: "Vehicle updated successfully!", isSuccess: true });
      await this.manager.loadVehicles();
    } catch (error) {
      showModal({
        message: `Error updating vehicle: ${error.message}`,
        isSuccess: false,
      });
      console.error("Error updating vehicle:", error);
    }
  }

  getVehicleData(formData) {
    const vehicleData = Object.fromEntries(formData.entries());

   
    const features = formData
      .getAll("features")
      .filter((val) => val.toLowerCase() !== "petrol")
      .map((name) => ({ name }));
    if (features.length) vehicleData.features = features;


    if (formData.get("lookupVRM")) {
      vehicleData.vrm = formData.get("lookupVRM");
    }

 
    if (this.manager.dealershipId) {
      vehicleData.dealership = { id: this.manager.dealershipId };
    }

   
    delete vehicleData.selectedVehicle;
    delete vehicleData.lookupVRM;
    delete vehicleData.images;

    return vehicleData;
  }

  async deleteSelectedVehicles() {
   
    const checkboxes = document.querySelectorAll(".vehicle-checkbox:checked");
    const idsToDelete = Array.from(checkboxes).map((cb) =>
      cb.getAttribute("data-id")
    );

    if (idsToDelete.length === 0) {
      showModal({
        message: "No vehicles selected for deletion.",
        isSuccess: false,
      });
      return;
    }

    if (!confirm("Are you sure you want to delete the selected vehicles?")) {
      return;
    }

    try {
     
      await Promise.all(
        idsToDelete.map((id) => this.manager.apiService.deleteVehicle(id))
      );

      showModal({
        message: "Vehicles deleted successfully.",
        isSuccess: true,
      });

    
      await this.manager.loadVehicles();
    } catch (error) {
      showModal({
        message: `Error deleting vehicles: ${error.message}`,
        isSuccess: false,
      });
      console.error("Error deleting vehicles:", error);
    }
  }

  async submitSellVehicleForm(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const vehicleId = formData.get("vehicleId");
    const saleData = {
      soldPrice: formData.get("soldPrice"),
      status: "Sold",
      soldBy: { id: (await this.manager.apiService.getCurrentUser())?.id },
    };

    try {
      await this.manager.apiService.sellVehicle(vehicleId, saleData);
      form.reset();
      this.manager.uiManager.toggleModal("sell-vehicle-modal", false);
      showModal({ message: "Vehicle sold successfully!", isSuccess: true });
      await this.manager.loadVehicles();
    } catch (error) {
      showModal({
        message: `Error selling vehicle: ${error.message}`,
        isSuccess: false,
      });
      console.error("Error selling vehicle:", error);
    }
  }

  async openSellModal(vehicleId) {
    const vehicle = this.manager.vehicles.find((v) => v.id == vehicleId);
    if (!vehicle) return console.error(`Vehicle ${vehicleId} not found`);

    const vehicleIdInput = document.getElementById("vehicle-id-input");
    if (vehicleIdInput) vehicleIdInput.value = vehicleId;

    const vehicleDetails = document.getElementById("vehicle-details");
    if (vehicleDetails) {
      vehicleDetails.textContent = `${vehicle.make} ${vehicle.model} (${
        vehicle.vrm
      }) - Listed at ${this.manager.formatPrice(vehicle.listPrice)}`;
    }

    const currentUser = await this.manager.apiService.getCurrentUser();
    if (currentUser) {
      document.getElementById(
        "current-user"
      ).textContent = `${currentUser.firstName} ${currentUser.lastName}`;
      document.getElementById("current-user-id").value = currentUser.id;
    }

    this.manager.uiManager.toggleModal("sell-vehicle-modal", true);
  }

  async openEditModal(vehicleId) {
    const vehicle = this.manager.vehicles.find((v) => v.id == vehicleId);
    if (!vehicle) return console.error(`Vehicle ${vehicleId} not found`);

    const form = document.getElementById("edit-vehicle-form");
    if (!form) return console.error("Edit vehicle form not found");

    document.getElementById("edit-id-input").value = vehicleId;
    const fields = [
      "make",
      "model",
      "year",
      "description",
      "colour",
      "vin",
      "vrm",
      "bodyStyle",
      "transmission",
      "engineSize",
      "doors",
      "status",
      "listPrice",
      "soldPrice",
    ];
    fields.forEach((field) => {
      const input = document.getElementById(`edit-${field}-input`);
      if (input && vehicle[field] !== undefined) input.value = vehicle[field];
    });

    if (vehicle.soldDate) {
      const soldDateInput = document.getElementById("edit-soldDate");
      soldDateInput.value = new Date(vehicle.soldDate)
        .toISOString()
        .slice(0, 16);
    }

    this.manager.featureManager.populateFeatures(vehicle.features);
    this.manager.imageManager.displayVehicleImages(vehicleId);
    this.manager.uiManager.toggleModal("edit-vehicle-modal", true);
  }

  getFormData(form) {
    return {
      id: form.querySelector("#edit-id-input").value,
      make: form.querySelector("#edit-make-input").value,
      model: form.querySelector("#edit-model-input").value,
      year: form.querySelector("#edit-year-input").value,
      description: form.querySelector("#edit-description-input").value,
      colour: form.querySelector("#edit-colour-input").value,
      vin: form.querySelector("#edit-vin-input").value,
      vrm: form.querySelector("#edit-vrm-input").value,
      bodyStyle: form.querySelector("#edit-bodyStyle-input").value,
      transmission: form.querySelector("#edit-transmission-input").value,
      engineSize: form.querySelector("#edit-engineSize-input").value,
      doors: form.querySelector("#edit-doors-input").value,
      status: form.querySelector("#edit-status").value,
      listPrice: form.querySelector("#edit-listPrice").value || null,
      soldPrice: form.querySelector("#edit-soldPrice").value || null,
      soldDate: form.querySelector("#edit-soldDate").value || null,
    };
  }
}

export default FormHandler;

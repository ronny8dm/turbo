import ApiService from "./apiService.js";

const apiService = new ApiService("/api/vehicles");

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOMContentLoaded event triggered");
  populateVehicleDropdown();
  setDefaultDateTime();

  const closeButton = document.getElementById("close-modal-btn");
  if (closeButton) {
    closeButton.addEventListener("click", () => {
      const modal = document.getElementById("booking-modal");
      if (modal) {
        modal.classList.add("hidden");
      }
    });
  }

  const closeUserButton = document.getElementById("user-close-btn");
  console.log("Close user button:", closeUserButton);
  if (closeUserButton) {
    closeUserButton.addEventListener("click", () => {
      const modal = document.getElementById("user-modal");
      if (modal) {
        modal.classList.add("hidden");
      }
    });
  }


});

async function populateVehicleDropdown() {
  console.log("populateVehicleDropdown function called");
  const dropdown = document.getElementById("vehicle-dropdown");
  console.log("Dropdown element:", dropdown);
  try {
    const profile = await apiService.getCurrentUser();
    const dealershipId = profile?.dealershipId;

    if (!dealershipId) {
      throw new Error("No dealership ID found");
    }

    const vehicles = await apiService.fetchVehicles(dealershipId);
    console.log("Vehicles:", vehicles);


    const availableVehicles = vehicles.filter(
      (vehicle) => vehicle.status === "Available"
    );
    console.log("Available vehicles:", availableVehicles);

    if (availableVehicles.length === 0) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "No available vehicles";
      dropdown.appendChild(option);
      return;
    }

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select a vehicle";
    dropdown.appendChild(defaultOption);

    availableVehicles.forEach((vehicle) => {
      const option = document.createElement("option");
      option.value = vehicle.id;
      option.textContent = `${vehicle.make} ${vehicle.model} (${vehicle.vrm})`;
      dropdown.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching vehicles:", error);
 
    const errorOption = document.createElement("option");
    errorOption.value = "";
    errorOption.textContent = "Error loading vehicles";
    dropdown.appendChild(errorOption);
  }
}

document
  .getElementById("booking-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const profile = await apiService.getCurrentUser();
    const dealershipId = profile?.dealershipId;
    const bookingData = {
      customerName: formData.get("customerName"),
      vehicleId: formData.get("vehicleId"),
      startTime: formData.get("startTime"),
      status: "Booked",
    };

    try {
      const booking = await apiService.makeBooking(bookingData, dealershipId);
      console.log("Booking created:", booking);

   
      const successModal = document.getElementById("success-modal");
      const modalMessage = document.getElementById("modal-message");
      if (successModal && modalMessage) {
        modalMessage.textContent = "Test drive scheduled successfully!";
        successModal.classList.remove("hidden");
      } else {
        alert("Booking created successfully");
      }

    
      const modal = document.getElementById("booking-modal");
      if (modal) {
        modal.classList.add("hidden");
      }

    
      event.target.reset();

   
      await populateVehicleDropdown();

     
      if (typeof refreshCalendar === "function") {
        refreshCalendar();
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("Error creating booking: " + error.message);
    }
  });

function setDefaultDateTime() {
  const dateTimeInput = document.querySelector('input[name="startTime"]');
  if (!dateTimeInput) return;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0); 

  const formattedDate = tomorrow.toISOString().slice(0, 16);
  dateTimeInput.value = formattedDate;


  const today = new Date();
  dateTimeInput.min = today.toISOString().slice(0, 16);
}

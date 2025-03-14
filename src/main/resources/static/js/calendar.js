import ApiService from "./apiService.js";
const apiService = new ApiService("/api/bookings");

let calendarInstance;

document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");
  calendarInstance = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay",
    },
    events: "/api/bookings",
    editable: true,
    selectable: true,
    select: function (info) {
      handleDateSelect(info);
    },
    eventClick: function (info) {
      handleEventClick(info);
    },
    eventTimeFormat: {
      hour: "2-digit",
      minute: "2-digit",
      meridiem: false,
    },
  });
  calendarInstance.render();

  // Setup event handlers for booking details modal
  document
    .getElementById("close-details-modal-btn")
    ?.addEventListener("click", closeBookingDetailsModal);
  document
    .getElementById("btn-cancel-booking")
    ?.addEventListener("click", cancelBooking);
  document
    .getElementById("btn-complete-booking")
    ?.addEventListener("click", completeBooking);
  document
    .getElementById("btn-update-booking")
    ?.addEventListener("click", updateBookingTime);
  document
    .getElementById("btn-delete-booking")
    ?.addEventListener("click", deleteBooking);
});

function handleDateSelect(selectInfo) {
  // Show booking modal or form
  const modal = document.getElementById("booking-modal");
  if (modal) {
    modal.classList.remove("hidden");
    // Set the selected date/time in the form
    const dateTimeInput = document.querySelector('input[name="startTime"]');
    if (dateTimeInput) {
      dateTimeInput.value = selectInfo.startStr.slice(0, 16);
    }
  }
}

function handleEventClick(eventInfo) {
  console.log("Event clicked:", eventInfo.event);

  // Get booking details
  const event = eventInfo.event;
  const bookingId = event.id;
  const title = event.title;
  const startTime = event.start;
  const status = event.extendedProps?.status || "";

  // Customer name is either from extendedProps or from the title (first part before " - ")
  const customerName =
    event.extendedProps?.customerName || title.split(" - ")[0];

  // Vehicle info from extendedProps or empty string
  const vehicleInfo = event.extendedProps?.vehicleId
    ? `${event.extendedProps.vehicleMake || ""} ${
        event.extendedProps.vehicleModel || ""
      } (ID: ${event.extendedProps.vehicleId})`
    : "";

  // Populate the modal with booking details
  document.getElementById("detail-booking-id").value = bookingId;
  document.getElementById("detail-customer-name").textContent = customerName;
  document.getElementById("detail-vehicle-info").textContent = vehicleInfo;
  document.getElementById("detail-status").textContent = status;

  // Format the date and time for the datetime-local input
  const formattedDate = startTime.toISOString().slice(0, 16);
  document.getElementById("detail-datetime").value = formattedDate;

  // Show the modal
  const modal = document.getElementById("booking-details-modal");
  if (modal) {
    modal.classList.remove("hidden");
  }
}

function closeBookingDetailsModal() {
  const modal = document.getElementById("booking-details-modal");
  if (modal) {
    modal.classList.add("hidden");
  }
}

async function cancelBooking() {
  const bookingId = document.getElementById("detail-booking-id").value;
  try {
    await apiService.updateBooking(bookingId, { status: "Cancelled" });
    showSuccessMessage("Booking cancelled successfully");
    closeBookingDetailsModal();
    refreshCalendar();
  } catch (error) {
    alert("Error cancelling booking: " + error.message);
  }
}

async function completeBooking() {
  const bookingId = document.getElementById("detail-booking-id").value;
  try {
    await apiService.updateBooking(bookingId, { status: "Complete" });
    showSuccessMessage("Booking marked as completed");
    closeBookingDetailsModal();
    refreshCalendar();
  } catch (error) {
    alert("Error updating booking status: " + error.message);
  }
}

async function updateBookingTime() {
  const bookingId = document.getElementById("detail-booking-id").value;
  const newDateTime = document.getElementById("detail-datetime").value;

  try {
    await apiService.updateBooking(bookingId, { startTime: newDateTime });
    showSuccessMessage("Booking time updated successfully");
    closeBookingDetailsModal();
    refreshCalendar();
  } catch (error) {
    alert("Error updating booking time: " + error.message);
  }
}

async function deleteBooking() {
  const bookingId = document.getElementById("detail-booking-id").value;

  if (confirm("Are you sure you want to delete this booking?")) {
    try {
      await apiService.deleteBooking(bookingId);
      showSuccessMessage("Booking deleted successfully");
      closeBookingDetailsModal();
      refreshCalendar();
    } catch (error) {
      alert("Error deleting booking: " + error.message);
    }
  }
}

function refreshCalendar() {
  if (calendarInstance) {
    calendarInstance.refetchEvents();
  }
}

function showSuccessMessage(message) {
  const successModal = document.getElementById("success-modal");
  const modalMessage = document.getElementById("modal-message");
  if (successModal && modalMessage) {
    modalMessage.textContent = message;
    successModal.classList.remove("hidden");
  } else {
    alert(message);
  }
}

function closeBookingModal() {
  const modal = document.getElementById("booking-modal");
  if (modal) {
    modal.classList.add("hidden");
  }
}

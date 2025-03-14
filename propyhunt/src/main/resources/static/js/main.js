/** @format */


// main.js
class AuthHandler {
  constructor() {
    this.tokenKey = "jwtToken";
    this.baseUrl = "/api";
    const token = localStorage.getItem("jwtToken") || 
                  localStorage.getItem("token") ||
                  sessionStorage.getItem("token");
    
    console.log(token ? "Token found in storage" : "No token in storage");
  }

  getToken() {
    // Try all possible token storage locations
    return localStorage.getItem(this.tokenKey) || 
           localStorage.getItem("token") || 
           sessionStorage.getItem("token");
  }

  getAuthHeaders() {
    const token = this.getToken();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async makeAuthenticatedRequest(endpoint, options = {}) {
    const token = this.getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const headers = {
      ...this.getAuthHeaders(),
      ...options.headers,
    };

    console.log("Request Headers:", headers);

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.json();
      console.error(
        "Request failed:",
        response.status,
        response.statusText,
        errorText
      );

      const error = new Error(errorData.message || 'Request failed');
      error.response = response;
      throw new Error(`Request failed: ${response.status}`);
    }

    return response.json();
  }

  async logout() {
    try {
      const response = await fetch(`${this.baseUrl}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("dealershipId");

      if (response.redirected) {
        window.location.href = response.url;
      } else {
        window.location.href = "/login?logout";
      }
    } catch (error) {
      console.error("Error during logout:", error);
      window.location.href = "/login?logout";
    }
  }
}

class ProfileManager {
  constructor(authHandler) {
    this.authHandler = authHandler;
    this.formId = "profileForm";
    this.fields = {
      firstName: "first_name",
      lastName: "last_name",
      email: "email",
      phone: "phone",
    };
  }

  setFormValues(profile) {
    Object.entries(this.fields).forEach(([key, id]) => {
      const element = document.getElementById(id);
      if (element) {
        element.value = profile[key] || "";
      }
    });
  }

  getFormValues() {
    return {
      firstName: document.getElementById(this.fields.firstName).value,
      lastName: document.getElementById(this.fields.lastName).value,
      email: document.getElementById(this.fields.email).value,
      phone: document.getElementById(this.fields.phone).value,
      currentPassword: document.getElementById("current_password").value,
      newPassword: document.getElementById("new_password").value,
    };
  }

  showNoDealershipState() {
    const modal = document.getElementById("dealership-modal");
    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    } else {
      console.warn("Dealership modal element not found in DOM");
    }
  }

  async loadProfile() {
    try {
      const profile = await this.authHandler.makeAuthenticatedRequest(
        "/user/profile",
        {
          method: "GET",
        }
      );
      console.log("Profile loaded successfully:", profile);
      if (profile.dealershipId === null) {
        const modal = document.getElementById("dealership-modal");
        this.showNoDealershipState();
        console.log("Modal element:", modal); // Debug log
        if (modal) {
          modal.classList.remove("hidden");
          modal.classList.add("flex");
        } else {
          console.warn("Dealership modal element not found in DOM");
        }
      } else {
        console.log("User has dealership assigned:", profile.dealershipId);
        this.setFormValues(profile);
        this.loadDealershipDetails();
      }
      
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  }

  async updateProfile(userData) {
    try {
      const updatedProfile = await this.authHandler.makeAuthenticatedRequest(
        "/user/profile",
        {
          method: "PUT",
          Authorization: `Bearer ${this.authHandler.getToken()}`,
          body: JSON.stringify(userData),
        }
      );
      console.log("Profile updated successfully:", updatedProfile);
      showModal({
        message: "Profile updated successfully",
        isSuccess: true,
      });
      return updatedProfile;
    } catch (error) {
      console.error("Error updating profile:", error);
      showModal({ message: "Error updating profile", isSuccess: false });

      throw error;
    }
  }

  async loadDealershipDetails() {
    try {
      const profile = await this.authHandler.makeAuthenticatedRequest(
        "/user/profile"
      );

      if (profile.dealershipId) {
        const dealershipDetails =
          await this.authHandler.makeAuthenticatedRequest(
            `/dealerships/${profile.dealershipId}`
          );

        console.log("Dealership details:", dealershipDetails);
        this.setDealershipDetails(dealershipDetails);
      } else {
        console.log("User has no dealership assigned");
        this.showNoDealershipState();
      }
    } catch (error) {
      console.error("Error loading dealership details:", error);
      showModal({
        message: "Error loading dealership details",
        isSuccess: false,
      });
    }
  }

  


  setDealershipDetails(details) {
    document.getElementById("dealership-name").textContent = details.name || "";
    document.getElementById("dealership-email").textContent =
      details.email || "";
    document.getElementById("dealership-phone").textContent =
      details.phone || "";
    document.getElementById("dealership-address").textContent =
      details.address || "";
  }

  async loadTeamMembers() {
    const profile = await this.authHandler.makeAuthenticatedRequest(
      "/user/profile"
    );
    console.log("Loading team members", profile.dealershipId);
    if (!profile.dealershipId) {
      console.log("No dealership assigned to user");
      return;
    }

    try {
      const teamMembers = await this.authHandler.makeAuthenticatedRequest(
        `/dealerships/${profile.dealershipId}/users`,
        {
          method: "GET",
        }
      );
      console.log("Team members loaded successfully:", teamMembers);
      this.setTeamMembers(teamMembers);
    } catch (error) {
      console.error("Error loading team members:", error);
      showModal({
        message: "Error loading team members",
        isSuccess: false,
      });
    }
  }

  setTeamMembers(members) {
    const teamTableBody = document.getElementById("team-table-body");
    teamTableBody.innerHTML = "";

    members.forEach((member) => {
      const row = document.createElement("tr");
      row.className =
        "bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600";

      const checkboxCell = document.createElement("td");
      checkboxCell.className = "w-4 p-4";
      const checkboxDiv = document.createElement("div");
      checkboxDiv.className = "flex items-center";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className =
        "w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600";
      checkboxDiv.appendChild(checkbox);
      checkboxCell.appendChild(checkboxDiv);
      row.appendChild(checkboxCell);

      const nameCell = document.createElement("th");
      nameCell.scope = "row";
      nameCell.className =
        "flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white";
      const nameDiv = document.createElement("div");
      nameDiv.className = "ps-3";
      const nameText = document.createElement("div");
      nameText.className = "text-base font-semibold";
      nameText.textContent = `${member.firstName} ${member.lastName}`;
      const emailText = document.createElement("div");
      emailText.className = "font-normal text-gray-500";
      emailText.textContent = member.email;
      nameDiv.appendChild(nameText);
      nameDiv.appendChild(emailText);
      nameCell.appendChild(nameDiv);
      row.appendChild(nameCell);

      const roleCell = document.createElement("td");
      roleCell.className = "px-6 py-4";
      roleCell.textContent = member.role;
      row.appendChild(roleCell);

      const statusCell = document.createElement("td");
      statusCell.className = "px-6 py-4";
      const statusDiv = document.createElement("div");
      statusDiv.className = "flex items-center";
      const statusIndicator = document.createElement("div");
      statusIndicator.className = `h-2.5 w-2.5 rounded-full ${
        member.enabled ? "bg-green-500" : "bg-red-500"
      } me-2`;
      statusDiv.appendChild(statusIndicator);
      statusDiv.appendChild(
        document.createTextNode(member.enabled ? "Active" : "Inactive")
      );
      statusCell.appendChild(statusDiv);
      row.appendChild(statusCell);

      const actionCell = document.createElement("td");
      actionCell.className = "px-6 py-4";
      const editLink = document.createElement("a");
      editLink.href = "#";
      editLink.className =
        "font-medium text-red-600 dark:text-red-500 hover:underline";

      actionCell.appendChild(editLink);
      row.appendChild(actionCell);

      teamTableBody.appendChild(row);

      const deleteButton = document.createElement("button");
      deleteButton.className =
        "font-medium text-red-600 dark:text-red-500 hover:underline";
      deleteButton.textContent = "Delete user";
      deleteButton.onclick = async () => {
        if (
          confirm(
            `Are you sure you want to delete user ${member.firstName} ${member.lastName}?`
          )
        ) {
          await window.dealershipManager.deleteUserfromDealership(member.id);
        }
      };
      actionCell.appendChild(deleteButton);
      row.appendChild(actionCell);

      teamTableBody.appendChild(row);
    });
  }

  initialize() {
    const form = document.getElementById(this.formId);
    if (!form) {
      console.error(`Form with id '${this.formId}' not found`);
      return;
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const userData = this.getFormValues();
      await this.updateProfile(userData);
    });

    this.loadDealershipDetails();
  }
}

class DealershipManager {
  constructor(authHandler) {
    console.log("DealershipManager initialized");
    this.authHandler = authHandler;
    this.isSubmitting = false;
  }

  initializeForm() {
    // Dealership form initialization
    const dealershipForm = document.getElementById("dealership-form");
    if (!dealershipForm) return;
    if (dealershipForm) {
      dealershipForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const submitButton = dealershipForm.querySelector(
          'button[type="submit"]'
        );

        if (this.isSubmitting) {
          console.warn("Dealership form is already being submitted");
          return;
        }

        try {
          this.isSubmitting = true;
          submitButton.disabled = true;
          await this.handleDealershipSubmit(e);
        } catch (error) {
          console.error("Error submitting dealership form:", error);
          showModal({
            message: "Failed to submit dealership form: " + error.message,
            isSuccess: false,
          });
        } finally {
          this.isSubmitting = false;
          submitButton.disabled = false;
        }
      });
    } else {
      console.warn("Dealership form not found");
    }

    // User form initialization
    const userForm = document.getElementById("add-user-form");
    if (userForm) {
      userForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const submitButton = userForm.querySelector('button[type="submit"]');

        if (this.isSubmitting) {
          console.warn("User form is already being submitted");
          return;
        }

        try {
          this.isSubmitting = true;
          submitButton.disabled = true;
          await this.handleAddUserFormSubmit(e);
        } catch (error) {
          console.error("Error submitting user form:", error);
          showModal({
            message: "Failed to submit user form: " + error.message,
            isSuccess: false,
          });
        } finally {
          this.isSubmitting = false;
          submitButton.disabled = false;
        }
      });
    } else {
      console.warn("User form not found");
    }
  }

  async handleDealershipSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    try {
      // First get current user info
      const userProfile = await this.authHandler.makeAuthenticatedRequest(
        "/user/profile"
      );
      console.log("Current user profile:", userProfile);

      const dealershipData = {
        name: formData.get("name"),
        email: formData.get("email"),
        address: formData.get("address"),
        phone: formData.get("phone"),
        ownerEmail: userProfile.email, 
      };

      console.log("Sending dealership data:", dealershipData);

      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) submitButton.disabled = true;

      const result = await this.authHandler.makeAuthenticatedRequest(
        "/dealerships/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dealershipData),
        }
      );

      console.log("Dealership creation response:", result);

      toggleDealershipModal(true);
      showModal({
        message: "Dealership created successfully",
        isSuccess: true,
      });

      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.error("Error creating dealership:", error);
      showModal({
        message: `Failed to create dealership: ${error.message}`,
        isSuccess: false,
      });
    } finally {
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) submitButton.disabled = false;
    }
  }

  toggleUserModal(show) {
    const modal = document.getElementById("user-modal");
    if (modal) {
      if (show) {
        modal.classList.remove("hidden");
        modal.classList.add("flex");
      } else {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
      }
    } else {
      console.error("User modal not found in DOM");
    }
  }

  async handleAddUserFormSubmit(event) {
    console.log("Handling add user form submit");
    event.preventDefault();

    const submitButton = event.target.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;

    try {
      const profileManager = new ProfileManager(this.authHandler);
      const form = event.target;
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      
      const profile = await this.authHandler.makeAuthenticatedRequest(
        "/user/profile"
      );

      console.log("Form data:", data);
      console.log("Current dealership:", profile.dealershipId);

      // Construct proper UserDto
      const userDto = {
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: "DEALER_SALES",
      };

      console.log("Sending user data:", userDto);

      const response = await this.authHandler.makeAuthenticatedRequest(
        `/dealerships/${profile.dealershipId}/users`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userDto),
        }
      );

      console.log("Server response:", response);

      if (!response) {
        throw new Error("No response from server");
      }

      // Close the modal
      this.toggleUserModal(false);

      // Show success message
      showModal({
        message: "User added successfully",
        isSuccess: true,
      });

      // Reload team members
      await profileManager.loadTeamMembers(profile.dealershipId);
    } catch (error) {
      console.error("Error adding user:", error);
      let errorMessage = "An error occurred while adding the user.";
        if (error.response) {
            const errorData = await error.response.json();
            errorMessage = errorData.message || errorMessage;
        }
      this.toggleUserModal(false);
      showModal({
        message: `Error adding user: ${errorMessage}`,
        isSuccess: false,
      });
    }
  }

  async deleteUserfromDealership(userId) {
    try {
      const profile = await this.authHandler.makeAuthenticatedRequest(
        "/user/profile"
      );
      console.log("Current user profile:", profile);

      const response = await this.authHandler.makeAuthenticatedRequest(
        `/user/${userId}`,
        {
          method: "DELETE",
        }
      );

      console.log("User deleted successfully:", response);
      showModal({
        message: "User deleted successfully",
        isSuccess: true,
      });

      // Reload team members
      const profileManager = new ProfileManager(this.authHandler);
      await profileManager.loadTeamMembers(profile.dealershipId);
    } catch (error) {
      console.error("Error deleting user:", error);
      showModal({
        message: "Error deleting user",
        isSuccess: false,
      });
    }
  }
}

// Initialize the application
window.addEventListener("DOMContentLoaded", async () => {
  console.log("=== DOM Content Loaded ===");

  const authHandler = new AuthHandler();
  const profileManager = new ProfileManager(authHandler);
  const dealershipManager = new DealershipManager(authHandler);

  window.dealershipManager = dealershipManager;

  // Check authentication
  if (!authHandler.getToken()) {
    console.error("No token found, redirecting to login page.");
    window.location.href = "/login";
    return;
  }
  profileManager.initialize();
  if (document.getElementById("profileForm")) {
    await profileManager.loadProfile();
  } else {
    console.warn("Profile form not found, skipping profile loading.");
  }
  if (document.getElementById("dealership-details")) {
    await profileManager.loadDealershipDetails();
  } else {
    console.warn("Dealership details element not found, skipping loading.");
  }
  if (document.getElementById("team-table-body")) {
    await profileManager.loadTeamMembers();
  } else {
    console.warn("Team table body not found, skipping team members loading.");
  }
  dealershipManager.initializeForm();
  dealershipManager.toggleUserModal(false);
});

window.toggleUserModal = function (show) {
  if (window.dealershipManager) {
    window.dealershipManager.toggleUserModal(show);
  } else {
    console.error("DealershipManager not initialized");
  }
};

// Make logout function available globally
window.logout = () => {
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("dealershipId");
  sessionStorage.removeItem("userDealershipId");
  
  const authHandler = new AuthHandler();
  authHandler.logout();
};

function showModal({ message, isSuccess }) {
  // Update modal message
  const modalMessage = document.getElementById("modal-message");
  modalMessage.textContent = message;

  // Update modal icon
  const modalIcon = document.getElementById("modal-icon");
  const modalIconPath = document.getElementById("modal-icon-path");

  if (isSuccess) {
    modalIcon.classList.add("text-green-400", "dark:text-green-200");
    modalIcon.classList.remove("text-red-400", "dark:text-red-200");
    modalIconPath.setAttribute(
      "d",
      "M10 6l3 3-3 3m3-3H7" // Success Icon
    );
  } else {
    modalIcon.classList.add("text-red-400", "dark:text-red-200");
    modalIcon.classList.remove("text-green-400", "dark:text-green-200");
    modalIconPath.setAttribute(
      "d",
      "M10 6V10m0 0H6m4 0h4m-4 0v4m0-4v-4m0 8a8 8 0 1 0-8-8 8 8 0 0 0 8 8z" // Error Icon
    );
  }

  // Show modal
  const modal = document.getElementById("success-modal");
  modal.classList.remove("hidden");
  modal.classList.add("flex"); // Ensure it displays as a flex container
}

document.querySelectorAll("[data-modal-hide]").forEach((button) => {
  button.addEventListener("click", () => {
    const modal = document.getElementById("success-modal");
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  });
});

window.toggleDealershipModal = function (show) {
  const modal = document.getElementById("dealership-modal");
  if (modal) {
      if (show) {
          modal.classList.remove("hidden");
          modal.classList.add("flex");
          // Add backdrop and prevent body scroll
          document.body.style.overflow = 'hidden';
      } else {
          modal.classList.add("hidden");
          modal.classList.remove("flex");
          // Remove backdrop and restore body scroll
          document.body.style.overflow = 'auto';
      }
  } else {
      console.error("Dealership modal not found in DOM");
  }
};

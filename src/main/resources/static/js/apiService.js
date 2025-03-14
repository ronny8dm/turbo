class ApiService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async getCurrentUser() {
    try {
      // Try to get user profile using session cookies (OAuth2)
      const response = await fetch("/api/user/profile", {
        method: "GET",
        headers: this.getHeaders(),
        // Important: include credentials to send cookies
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user profile: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  }

  async fetchVehicles(dealershipId) {
    const response = await fetch(`${this.baseUrl}/dealership/${dealershipId}`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch vehicles");
    return await response.json();
  }

  async lookupVehicle(vrm) {
    const response = await fetch(`${this.baseUrl}/lookup/${vrm}`, {
      method: "GET",
      headers: this.getHeaders(),
      credentials: "include",
    });
    if (!response.ok) throw new Error("Error looking up vehicle");
    return await response.json();
  }

  async createVehicle(vehicleData) {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(vehicleData),
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to create vehicle");
    return await response.json();
  }

  async updateVehicle(vehicleId, vehicleData) {
    const response = await fetch(`${this.baseUrl}/${vehicleId}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(vehicleData),
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to update vehicle");
    return await response.json();
  }

  async sellVehicle(vehicleId, saleData) {
    const response = await fetch(`${this.baseUrl}/${vehicleId}/sell`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(saleData),
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to sell vehicle");
    return await response.json();
  }

  async deleteVehicle(id) {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error(`Failed to delete vehicle ${id}`);
    }
    return response;
  }

  async getSalesData(dealershipId, startDate, endDate) {
    // Default to 1 if nothing else works

    console.log(
      `Fetching sales data for dealership ${dealershipId} from ${startDate} to ${endDate}`
    );
    const response = await fetch(
      `/api/metrics/sales?dealershipId=${dealershipId}&startDate=${startDate}&endDate=${endDate}`,
      {
        method: "GET",
        headers: this.getHeaders(),
        credentials: "include",
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch sales data");
    }

    return await response.json();
  }

  async getVehicleAvailable() {
    const response = await fetch(`${this.baseUrl}/available`, {
      method: "GET",
      headers: this.getHeaders(),
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch available vehicles");
    return await response.json();
  }

  async makeBooking(bookingData, dealershipId) {
    try {
      const response = await fetch(
        `/api/bookings?dealershipId=${dealershipId}`,
        {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify(bookingData),
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create booking: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error in makeBooking:", error);
      throw error;
    }
  }

  async updateBooking(bookingId, updateData) {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify(updateData),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to update booking: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error in updateBooking:", error);
      throw error;
    }
  }

  async deleteBooking(bookingId) {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
        headers: this.getHeaders(),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete booking: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error("Error in deleteBooking:", error);
      throw error;
    }
  }

  async fetchCompetitorsListings(params) {
    try {
      console.log("Fetching competitors listings with params:", params);
      const response = await fetch(`${this.baseUrl}/listings?${params}`, {
        method: "GET",
        headers: {
          ...this.getHeaders(),
          'Accept': 'application/json'
        },
        credentials: "include",
      });
  
      const data = await response.json();
  
      // Check if the response contains data
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
  
      // If we get here, we have a response but no valid data
      throw new Error("No listings found");
  
    } catch (error) {
      console.error("Error fetching competitors listings:", error);
      throw error;
    }
  }

  getHeaders() {
    const headers = {
      "Content-Type": "application/json",
    };

    // Fixed: Don't try to reassign to const token
    let token = localStorage.getItem("token");
    if (!token) {
      console.warn(
        "No token found in local storage looking for token in session storage"
      );
      token = sessionStorage.getItem("token");
      // Only log if token exists
      if (token) {
        console.log("Token found in session storage");
      } else {
        console.warn("No token found in session storage");
      }
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }
}

export default ApiService;

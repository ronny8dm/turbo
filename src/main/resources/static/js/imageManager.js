class ImageManager {
    constructor(manager) {
      this.manager = manager;
    }
  
    async uploadVehicleImages(vehicleId, fileInputElement) {
        if (!fileInputElement.files?.length) {
          return console.warn("No files selected");
        }
    
        const loadingMessage = document.createElement("div");
        loadingMessage.textContent = "Uploading images...";
        loadingMessage.className = "text-blue-600 font-medium mt-2";
        fileInputElement.parentNode.appendChild(loadingMessage);
    
        try {
          const uploadPromises = Array.from(fileInputElement.files).map((file, i) => {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("displayOrder", i);
            formData.append("type", "EXTERIOR");
            formData.append("isPrimary", String(i === 0));
    
            return fetch(`${this.manager.apiBaseUrl}/${vehicleId}/images`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
              },
              body: formData
            }).then(async response => {
              if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to upload image ${i + 1}: ${response.status} - ${errorText}`);
              }
              return response;
            });
          });
    
          await Promise.all(uploadPromises);
    
          loadingMessage.textContent = "Images uploaded successfully!";
          loadingMessage.className = "text-green-600 font-medium mt-2";
          setTimeout(() => loadingMessage.remove(), 3000);
    
          await this.displayVehicleImages(vehicleId);
    
        } catch (error) {
          console.error("Error uploading images:", error);
          loadingMessage.textContent = "Error uploading images: " + error.message;
          loadingMessage.className = "text-red-600 font-medium mt-2";
          throw error;
        }
      }
  
    async displayVehicleImages(vehicleId) {
        try {
          const response = await fetch(`${this.manager.apiBaseUrl}/${vehicleId}/images`, {
            method: "GET",
            headers: this.manager.apiService.getHeaders(),
          });
          if (!response.ok) throw new Error(`Failed to fetch images: ${response.status}`);
          const images = await response.json();
          console.log("Fetched vehicle images:", images);
    
          const vehicle = this.manager.vehicles.find((v) => v.id == vehicleId);
          if (vehicle) {
            vehicle.images = images;
          }
    
          const imageContainer = document.getElementById("edit-vehicle-images");
          if (!imageContainer || !vehicle?.images) return;
    
          imageContainer.innerHTML = "";
          if (!vehicle.images.length) {
            imageContainer.innerHTML = '<p class="text-gray-500 italic">No images available</p>';
            return;
          }
    
          const grid = document.createElement("div");
          grid.className = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4";
          vehicle.images
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .forEach((image) => {
              const imgContainer = document.createElement("div");
              imgContainer.className = "relative group";
              imgContainer.innerHTML = `
                <img src="${image.url}" class="h-24 w-full object-cover rounded border" alt="${image.title || "Vehicle image"}">
                <button class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">×</button>
                ${image.isPrimary ? '<span class="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Primary</span>' : '<button class="absolute bottom-2 left-2 bg-gray-500 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">Set Primary</button>'}
              `;
              imgContainer.querySelector("button:first-of-type").onclick = (e) => {
                e.preventDefault();
                if (confirm("Are you sure you want to delete this image?")) {
                  this.deleteVehicleImage(vehicleId, image.id);
                }
              };
              if (!image.isPrimary) {
                imgContainer.querySelector("button:last-of-type").onclick = (e) => {
                  e.preventDefault();
                  this.setPrimaryImage(vehicleId, image.id);
                };
              }
              grid.appendChild(imgContainer);
            });
          imageContainer.appendChild(grid);
        } catch (error) {
          console.error("Error fetching images:", error);
        }
      }
  
    async deleteVehicleImage(vehicleId, imageId) {
      try {
        const response = await fetch(`${this.manager.apiBaseUrl}/${vehicleId}/images/${imageId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!response.ok) throw new Error(`Failed to delete image: ${response.status}`);
        await this.manager.loadVehicles();
        this.displayVehicleImages(vehicleId);
      } catch (error) {
        console.error("Error deleting image:", error);
        alert("Failed to delete image: " + error.message);
      }
    }
  
    async setPrimaryImage(vehicleId, imageId) {
      try {
        const response = await fetch(`${this.manager.apiBaseUrl}/${vehicleId}/images/${imageId}/primary`, {
          method: "PUT",
          headers: this.manager.apiService.getHeaders(),
        });
        if (!response.ok) throw new Error(`Failed to set primary image: ${response.status}`);
        await this.manager.loadVehicles();
        this.displayVehicleImages(vehicleId);
      } catch (error) {
        console.error("Error setting primary image:", error);
        alert("Failed to set primary image: " + error.message);
      }
    }
  }
  
  export default ImageManager;
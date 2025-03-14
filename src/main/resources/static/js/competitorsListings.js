import ApiService from "./apiService.js";

class CompetitorsListings {
  constructor() {
    this.apiBaseUrl = "/api/scrape";
    this.apiService = new ApiService(this.apiBaseUrl);
  }

  async getCompetitors(params) {
    try {
      const queryParams = new URLSearchParams({
        make: params.make?.trim() || "",
        model: params.model?.trim() || "",
        year: params.year?.toString() || "",
        postcode: params.postcode || "SW1A1AA"
      });
  
      console.log("Query Params:", queryParams.toString());
  
      const listings = await this.apiService.fetchCompetitorsListings(queryParams.toString());
      
      if (!listings || !Array.isArray(listings)) {
        console.warn("Invalid response format:", listings);
        return [];
      }
  
      return listings;
  
    } catch (error) {
      console.error("Error in getCompetitors:", error);
      return []; 
    }
  }
}

export default CompetitorsListings;
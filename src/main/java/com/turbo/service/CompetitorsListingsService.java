package com.turbo.service;

import java.util.List;
import com.turbo.model.CompetitorsListings;

public interface CompetitorsListingsService {
    List<CompetitorsListings> scrapeListings(String make, String model, String year, String postcode);

    List<CompetitorsListings> getListingsFromDatabase(String make, String model, String year, String postcode);

    boolean listingsExistInDatabase(String make, String model, String year, String postcode);
}
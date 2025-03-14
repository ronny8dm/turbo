package com.turbo.controller;

import org.springframework.web.bind.annotation.RestController;

import com.turbo.model.CompetitorsListings;
import com.turbo.service.CompetitorsListingsService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/scrape")
public class ScraperController {

    @Autowired
    private CompetitorsListingsService competitorsListingsService;

    @GetMapping(value = "/listings", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<CompetitorsListings>> getScrapedListings(
            @RequestParam String make,
            @RequestParam String model,
            @RequestParam String year,
            @RequestParam String postcode,
            @RequestParam(defaultValue = "false") boolean forceScrape) {
        try {
            
            List<CompetitorsListings> listings;

            if (forceScrape || !competitorsListingsService.listingsExistInDatabase(make, model, year, postcode)) {
                listings = competitorsListingsService.scrapeListings(make, model, year, postcode);
            } else {
                listings = competitorsListingsService.getListingsFromDatabase(make, model, year, postcode);
            }

            return ResponseEntity.ok(listings);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
}

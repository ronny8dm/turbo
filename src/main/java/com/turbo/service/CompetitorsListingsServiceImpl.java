package com.turbo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.time.Duration;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.select.Elements;

import com.turbo.model.CompetitorsListings;
import com.turbo.repository.CompetitorsListingsRepository;
import org.jsoup.nodes.Element;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;

import io.github.bonigarcia.wdm.WebDriverManager;

@Service
public class CompetitorsListingsServiceImpl implements CompetitorsListingsService {

    private static final Logger logger = LoggerFactory.getLogger(CompetitorsListingsService.class);

    @Autowired
    private CompetitorsListingsRepository competitorsListingsRepository;

    @Value("${scraper.autotrader.cookie.name}")
    private String cookieName;
    
    @Value("${scraper.autotrader.cookie.value}")
    private String cookieValue;

    static {
        WebDriverManager.chromedriver().setup();
    }

    public List<CompetitorsListings> scrapeListings(String make, String model, String year, String postcode) {
        WebDriver driver = null;
        try {
            String url = String.format(
                    "https://www.autotrader.co.uk/car-search?search-target=usedcars&make=%s&model=%s&year-from=%s&year-to=%s&postcode=%s",
                    make, model, year, year, postcode);

            logger.info("Attempting to scrape URL: {}", url);

            ChromeOptions options = new ChromeOptions();
            options.addArguments("--headless=new");
            options.addArguments("--disable-gpu");
            options.addArguments("--no-sandbox");
            options.addArguments("--disable-dev-shm-usage");
            options.addArguments("--disable-blink-features=AutomationControlled");
            options.addArguments("--window-size=1920,1080");
            options.addArguments(
                    "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36");
            options.addArguments("--accept-lang=en-GB,en");
            options.addArguments("--disable-notifications");
            options.addArguments("--disable-webgl");
            options.addArguments("--disable-infobars");
            options.addArguments("--disable-extensions");
            options.setExperimentalOption("excludeSwitches", Arrays.asList("enable-automation"));
            options.setExperimentalOption("useAutomationExtension", false);

            driver = new ChromeDriver(options);

            driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(30));
            driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));

            driver.get("https://www.autotrader.co.uk");
            driver.manage().addCookie(new Cookie(cookieName, cookieValue));

            driver.get(url);

            Thread.sleep(5000);

            String pageSource = driver.getPageSource();

            Document doc = Jsoup.parse(pageSource);

            Element searchResultsContainer = doc.selectFirst(".search-results-container");
            logger.info("Found search results container: {}", searchResultsContainer != null);

            Elements listingItems = null;
            if (searchResultsContainer != null) {
                listingItems = searchResultsContainer.select("ul.at__sc-mddoqs-0 > li");
            }

            if (listingItems == null || listingItems.isEmpty()) {
                listingItems = doc.select("[data-testid='ola-trader-seller-listing']");
            }

            logger.info("Found {} listing items", listingItems != null ? listingItems.size() : 0);

            List<CompetitorsListings> listings = new ArrayList<>();

            if (listingItems == null || listingItems.isEmpty()) {
                logger.warn("No results found with any selector. URL: {}", url);
                return listings;
            }

            for (Element item : listingItems) {
                try {
                    CompetitorsListings listing = new CompetitorsListings();

                    Element listingDiv = item.selectFirst(
                            "[data-testid='private-seller-listing'], [data-testid='ola-trader-seller-listing']");
                    String autoTraderId = "";
                    if (listingDiv != null) {
                        autoTraderId = listingDiv.id();
                    }

                    if (autoTraderId.isEmpty()) {
                        Element cardDiv = item.selectFirst("[data-testid='advertCard']");
                        if (cardDiv != null && cardDiv.parent() != null) {
                            autoTraderId = cardDiv.parent().id();
                        }
                    }
                    listing.setAutoTraderId(autoTraderId);

                    Element linkElement = item.selectFirst("a[href*='/car-details/']");
                    String urlValue = null;
                    if (linkElement != null) {
                        String href = linkElement.attr("href");
                        if (!href.startsWith("http")) {
                            href = "https://www.autotrader.co.uk" + href;
                        }
                        urlValue = href;
                        listing.setUrl(urlValue);
                    }

                    String imageUrl = null;
                    Element imgElement = item.selectFirst("[data-testid='carousel-images'] img");
                    if (imgElement != null) {
                        imageUrl = imgElement.attr("src");
                    }
                    listing.setImageUrl(imageUrl);

                    // Extract title and split into make/model
                    Element titleLink = item.selectFirst("a[data-testid='search-listing-title']");
                    String makeValue = null;
                    String modelValue = null;
                    if (titleLink != null) {
                        String fullTitle = titleLink.ownText().trim();
                        logger.info("Found title: {}", fullTitle);

                        // Split the title into words
                        String[] titleParts = fullTitle.split("\\s+");
                        if (titleParts.length >= 2) {
                            makeValue = titleParts[0];
                            modelValue = String.join(" ", Arrays.copyOfRange(titleParts, 1, titleParts.length));
                        }
                    }
                    listing.setMake(makeValue);
                    listing.setModel(modelValue);

                    Element priceElement = item.selectFirst("span.at__sc-1n64n0d-8");
                    String price = "";
                    if (priceElement != null) {
                        price = priceElement.text().trim();
                        logger.info("Found price: {}", price);
                    }
                    listing.setPrice(price);

                    Element mileageElement = item.selectFirst("ul.at__sc-u4ap7c-6 li:contains(miles)");
                    String miles = null;
                    if (mileageElement != null) {
                        String mileageText = mileageElement.text().trim();
                        miles = mileageText.replaceAll("[^0-9]", "");
                        logger.info("Found mileage: {}", miles);
                    }
                    listing.setMiles(miles);

                    Element locationSpan = item.selectFirst("span.at__sc-m0lx8i-1");
                    String location = "";
                    if (locationSpan != null) {
                        location = locationSpan.text().trim();

                        if (location.startsWith("Available from ")) {
                            location = location.substring("Available from ".length());
                        }
                        logger.info("Found location: {}", location);
                    }
                    listing.setLocation(location);

                    listing.setYear(year);

                    logger.info(
                            "Extracted details - ID: {}, Make: {}, Model: {}, Miles: {}, Year: {}, Price: {}, Location: {}, Image: {}, URL: {}",
                            autoTraderId, makeValue, modelValue, miles, year, price, location, imageUrl, urlValue);

                    if (isValidListing(listing)) {
                        listings.add(listing);

                    } else {
                        logger.warn("Skipping listing with ID {} due to null or empty fields", autoTraderId);
                    }

                } catch (Exception e) {
                    logger.error("Error processing individual listing: {}", e.getMessage());
                }
            }

            logger.info("Successfully processed {} valid listings", listings.size());

            if (listings.isEmpty()) {
                logger.warn("No valid listings were created from the page");
                return listings;
            }

            return competitorsListingsRepository.saveAll(listings);

        } catch (Exception e) {
            logger.error("Error during scraping: {}", e.getMessage(), e);
            return new ArrayList<>();
        } finally {
            if (driver != null) {
                driver.quit();
            }
        }
    }

    private boolean isValidListing(CompetitorsListings listing) {
        return listing.getAutoTraderId() != null && !listing.getAutoTraderId().isEmpty() &&
                listing.getMake() != null && !listing.getMake().isEmpty() &&
                listing.getModel() != null && !listing.getModel().isEmpty() &&
                listing.getMiles() != null && !listing.getMiles().isEmpty() &&
                listing.getYear() != null && !listing.getYear().isEmpty() &&
                listing.getPrice() != null && !listing.getPrice().isEmpty() &&
                listing.getLocation() != null && !listing.getLocation().isEmpty() &&
                listing.getImageUrl() != null && !listing.getImageUrl().isEmpty() &&
                listing.getUrl() != null && !listing.getUrl().isEmpty();
    }

    @Override
    public List<CompetitorsListings> getListingsFromDatabase(String make, String model, String year, String postcode) {
        logger.info("Fetching listings from database for make={}, model={}, year={}, postcode={}",
                make, model, year, postcode);
        return competitorsListingsRepository.findByMakeAndModelAndYear(make, model, year);
    }

    @Override
    public boolean listingsExistInDatabase(String make, String model, String year, String postcode) {
        logger.info("Checking if listings exist in database for make={}, model={}, year={}, postcode={}",
                make, model, year, postcode);
        return competitorsListingsRepository.existsByMakeAndModelAndYear(make, model, year);
    }
}
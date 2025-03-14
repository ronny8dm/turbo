package com.turbo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class VehicleDataService {

    @Value("${regcheck.api.username}")
    private String regcheckUsername;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

   

    @Cacheable(value = "vehicles", key = "#registrationNumber")
    public JsonNode getVehicleByRegistration(String registrationNumber) throws IOException {
        String url = "https://www.regcheck.org.uk/api/reg.asmx/Check?RegistrationNumber=" +
                registrationNumber + "&username=" + regcheckUsername;

        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
        String xmlResponse = response.getBody();

       
        Pattern pattern = Pattern.compile("<vehicleJson>(.*?)</vehicleJson>", Pattern.DOTALL);
        Matcher matcher = pattern.matcher(xmlResponse);

        if (matcher.find()) {
            String jsonStr = matcher.group(1).trim();
            return objectMapper.readTree(jsonStr);
        }

        throw new IOException("Could not extract vehicle JSON data from response");
    }
}
package com.turbo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.turbo.dto.DealershipDto;
import com.turbo.dto.UserDto;
import com.turbo.model.Dealership;
import com.turbo.model.User;
import com.turbo.service.DealershipService;

@RestController
@RequestMapping("/api/dealerships")
public class DealershipController {

    private final DealershipService dealershipService;

    @Autowired
    public DealershipController(DealershipService dealershipService) {
        this.dealershipService = dealershipService;
    }

    @PostMapping("/create")
    public ResponseEntity<Dealership> createDealership(
            @RequestBody DealershipDto dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(dealershipService.createDealership(dto, userDetails.getUsername()));
    }

    @PostMapping("/{dealershipId}/users")
    public ResponseEntity<User> addUserToDealership(
            @PathVariable Long dealershipId,
            @RequestBody UserDto dto) {
        return ResponseEntity.ok(dealershipService.addUserToDealership(dealershipId, dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Dealership> getDealership(@PathVariable Long id) {
        return ResponseEntity.ok(dealershipService.getDealership(id));
    }

    @GetMapping
    public ResponseEntity<List<Dealership>> getAllDealerships() {
        return ResponseEntity.ok(dealershipService.getAllDealerships());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDealership(@PathVariable Long id) {
        dealershipService.deleteDealership(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{dealershipId}/users")
    public ResponseEntity<List<User>> getDealershipUsers(@PathVariable Long dealershipId) {
        return ResponseEntity.ok(dealershipService.getDealershipUsers(dealershipId));
    }

}
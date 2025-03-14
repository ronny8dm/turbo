package com.turbo.controller;

import com.turbo.dto.BookingRequest;
import com.turbo.model.Booking;
import com.turbo.service.BookingServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingServiceImpl bookingService;

    @Autowired
    public BookingController(BookingServiceImpl bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<Booking> createBooking(@RequestBody BookingRequest request, @RequestParam Long dealershipId) {
        try {
            Booking booking = bookingService.createBooking(request, dealershipId);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Booking> updateBooking(@PathVariable Long id, @RequestBody Map<String, String> updates) {
        try {
            Booking booking = bookingService.getBookingById(id);
            if (booking == null) {
                return ResponseEntity.notFound().build();
            }

            // Update start time if provided
            if (updates.containsKey("startTime")) {
                LocalDateTime newStartTime = LocalDateTime.parse(updates.get("startTime"));
                booking.setStartTime(newStartTime);
            }

            // Add this block to handle status updates
            if (updates.containsKey("status")) {
                String newStatus = updates.get("status");
                booking.setStatus(newStatus);

                // If status is Cancelled or Completed, update vehicle status
                if ("Cancelled".equals(newStatus) || "Completed".equals(newStatus)) {
                    booking.getVehicle().setStatus("Available");
                }
            }

            // Save the updated booking
            Booking updatedBooking = bookingService.updateBooking(booking);
            return ResponseEntity.ok(updatedBooking);
        } catch (Exception e) {
            e.printStackTrace(); // Log the error for debugging
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/calendar")
    public ResponseEntity<List<Map<String, Object>>> getBookingsForCalendar(@RequestParam Long dealershipId) {
        List<Booking> bookings = bookingService.getAllBookings(dealershipId); // Changed from getBookingsByDealership

        Function<Booking, Map<String, Object>> toEventMap = booking -> {
            Map<String, Object> event = new HashMap<>();
            event.put("id", booking.getId());
            event.put("title", booking.getCustomerName() + " - " +
                    booking.getVehicle().getMake() + " " +
                    booking.getVehicle().getModel());
            event.put("start", booking.getStartTime().toString());
            event.put("status", booking.getStatus());
            event.put("vehicleId", booking.getVehicle().getId());
            return event;
        };

        List<Map<String, Object>> calendarEvents = bookings.stream()
                .map(toEventMap)
                .collect(Collectors.toList());

        return ResponseEntity.ok(calendarEvents);
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllBookings(@RequestParam(required = false) Long dealershipId) {
        List<Booking> bookings = bookingService.getAllBookings(dealershipId);

        // Convert bookings to calendar event format
        List<Map<String, Object>> events = bookings.stream().map(booking -> {
            Map<String, Object> event = new HashMap<>();

            // Required fields for FullCalendar
            event.put("id", booking.getId());
            event.put("title", booking.getCustomerName() + " - Test Drive");
            event.put("start", booking.getStartTime());

            // Calculate end time (typically 1 hour after start)
            LocalDateTime endTime = booking.getStartTime().plusHours(1);
            event.put("end", endTime);

            // Add more details for the tooltip or event click
            event.put("extendedProps", Map.of(
                    "customerName", booking.getCustomerName(),
                    "vehicleId", booking.getVehicle().getId(),
                    "vehicleInfo", booking.getVehicle().getMake() + " " + booking.getVehicle().getModel(),
                    "status", booking.getStatus()));

            // Set color based on status
            if ("Booked".equals(booking.getStatus())) {
                event.put("backgroundColor", "#4299e1"); // Blue
            } else if ("Completed".equals(booking.getStatus())) {
                event.put("backgroundColor", "#48bb78"); // Green
            } else if ("Cancelled".equals(booking.getStatus())) {
                event.put("backgroundColor", "#f56565"); // Red
            }

            return event;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(events);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Booking> updateBookingStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            Booking updatedBooking = bookingService.updateBookingStatus(id, status);
            return ResponseEntity.ok(updatedBooking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

}
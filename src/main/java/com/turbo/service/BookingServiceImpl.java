package com.turbo.service;

import com.turbo.dto.BookingRequest;
import com.turbo.exception.ResourceNotFoundException;
import com.turbo.model.Booking;
import com.turbo.model.Dealership;
import com.turbo.model.Vehicle;
import com.turbo.repository.BookingRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor

public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;

    private final DealershipService dealershipService;

    @Autowired
    private VehicleService vehicleService;

    @Transactional
    public Booking createBooking(BookingRequest request, Long dealershipId) {
        Vehicle vehicle = vehicleService.getVehicle(request.getVehicleId());
        Dealership dealership = dealershipService.getDealership(dealershipId);
        LocalDateTime startTime = LocalDateTime.parse(request.getStartTime());

        Booking booking = new Booking();
        booking.setCustomerName(request.getCustomerName());
        booking.setVehicle(vehicle);
        booking.setStartTime(startTime);
        booking.setDealership(dealership);
        booking.setStatus(request.getStatus());

        vehicle.setStatus("Reserved");
        vehicleService.updateVehicle(vehicle.getId(), vehicle);

        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking updateBookingStatus(Long id, String status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        booking.setStatus(status);

        if (status.equals("CANCELLED") || status.equals("DONE")) {
            Vehicle vehicle = booking.getVehicle();
            vehicle.setStatus("Available");
            vehicleService.updateVehicle(vehicle.getId(), vehicle);
        }

        return bookingRepository.save(booking);
    }

    public List<Booking> getAllBookings(Long dealershipId) {
        if (dealershipId != null) {
            return bookingRepository.findByDealershipId(dealershipId);
        }
        return bookingRepository.findAll();
    }

    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id).orElse(null);
    }

    @Transactional
    public Booking updateBooking(Booking booking) {
        return bookingRepository.save(booking);
    }

    public void deleteBooking(Long id) {
        bookingRepository.deleteById(id);
    }
}
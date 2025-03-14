package com.turbo.service;

import java.util.List;

import com.turbo.dto.BookingRequest;
import com.turbo.model.Booking;

public interface BookingService {

    Booking createBooking(BookingRequest request, Long dealershipId);

    Booking updateBookingStatus(Long id, String status);

    List<Booking> getAllBookings(Long dealershipId);

    Booking getBookingById(Long id);

    Booking updateBooking(Booking booking);

    void deleteBooking(Long id);

}

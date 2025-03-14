package com.turbo.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.turbo.model.User;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SellVehicleRequest {
    private BigDecimal soldPrice;
    private LocalDateTime soldDate;
    private User soldBy;
    private String status;

}

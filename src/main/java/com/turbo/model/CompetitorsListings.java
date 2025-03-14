package com.turbo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class CompetitorsListings {

    @Id
    @org.springframework.data.annotation.Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String autoTraderId;
    private String make;
    private String model;
    private String miles;
    private String year;
    private String price;
    private String location;
    @Column(length = 1000)
    private String imageUrl;
    @Column(length = 1000)
    private String url;
}

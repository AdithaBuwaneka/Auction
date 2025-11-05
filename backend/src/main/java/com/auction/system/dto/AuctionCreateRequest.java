package com.auction.system.dto;

import lombok.Data;

import java.math.BigDecimal;

/**
 * DTO for creating a new auction
 */
@Data
public class AuctionCreateRequest {
    private String itemName;
    private String description;
    private String imageUrl;
    private BigDecimal startingPrice;
    private Long sellerId;
    private String startTime;  // ISO format: "2025-11-06T10:00:00"
    private String mandatoryEndTime;  // ISO format: "2025-11-06T18:00:00"
    private Integer bidGapDurationSeconds;  // Duration in seconds
}

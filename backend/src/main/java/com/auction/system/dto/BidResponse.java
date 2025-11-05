package com.auction.system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for bid placement responses
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BidResponse {

    private boolean success;
    private String message;
    private Long bidId;
    private Long auctionId;
    private BigDecimal bidAmount;
    private LocalDateTime bidTime;
    private LocalDateTime newDeadline;

    public static BidResponse success(Long bidId, Long auctionId, BigDecimal bidAmount, LocalDateTime bidTime, LocalDateTime newDeadline) {
        return BidResponse.builder()
                .success(true)
                .message("Bid placed successfully")
                .bidId(bidId)
                .auctionId(auctionId)
                .bidAmount(bidAmount)
                .bidTime(bidTime)
                .newDeadline(newDeadline)
                .build();
    }

    public static BidResponse failure(String message) {
        return BidResponse.builder()
                .success(false)
                .message(message)
                .build();
    }
}

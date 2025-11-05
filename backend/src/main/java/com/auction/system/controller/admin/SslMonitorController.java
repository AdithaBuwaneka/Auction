package com.auction.system.controller.admin;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

/**
 * SSL Monitor Controller
 * Admin endpoints for monitoring SSL/TLS transactions
 * Member 5's Feature
 */
@RestController
@RequestMapping("/api/admin/ssl")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class SslMonitorController {

    /**
     * Get SSL transactions
     * GET /api/admin/ssl/transactions
     */
    @GetMapping("/transactions")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> getSslTransactions() {
        log.info("Admin: Get SSL transactions");

        List<Map<String, Object>> transactions = new ArrayList<>();

        // Simulated recent transactions
        for (int i = 0; i < 10; i++) {
            Map<String, Object> transaction = new HashMap<>();
            transaction.put("id", "TXN-" + (1000 + i));
            transaction.put("clientIp", "192.168.1." + (100 + i));
            transaction.put("amount", 100 + (i * 50));
            transaction.put("status", i % 5 == 0 ? "FAILED" : "SUCCESS");
            transaction.put("encrypted", true);
            transaction.put("cipher", "TLS_AES_256_GCM_SHA384");
            transaction.put("timestamp", LocalDateTime.now().minusMinutes(i).toString());
            transactions.add(transaction);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("transactions", transactions);
        response.put("count", transactions.size());

        return response;
    }

    /**
     * Get SSL certificate info
     * GET /api/admin/ssl/certificate
     */
    @GetMapping("/certificate")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> getCertificateInfo() {
        log.info("Admin: Get certificate info");

        Map<String, Object> certInfo = new HashMap<>();
        certInfo.put("issuer", "CN=Auction System CA");
        certInfo.put("subject", "CN=localhost");
        certInfo.put("validFrom", "2024-01-01");
        certInfo.put("validTo", "2025-12-31");
        certInfo.put("algorithm", "RSA");
        certInfo.put("keySize", 2048);
        certInfo.put("status", "VALID");

        return certInfo;
    }

    /**
     * Get SSL stats
     * GET /api/admin/ssl/stats
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> getSslStats() {
        log.info("Admin: Get SSL stats");

        Map<String, Object> stats = new HashMap<>();
        stats.put("serverPort", 8443);
        stats.put("protocol", "TLS 1.3");
        stats.put("encryptionStatus", "ACTIVE");
        stats.put("cipherSuite", "TLS_AES_256_GCM_SHA384");
        stats.put("totalSecureTransactions", new Random().nextInt(500) + 1000);
        stats.put("successfulTransactions", new Random().nextInt(400) + 950);
        stats.put("failedTransactions", new Random().nextInt(20) + 5);

        // Security dashboard
        Map<String, Object> security = new HashMap<>();
        security.put("encryptedTraffic", "100%");
        security.put("certificateValid", true);
        security.put("tlsVersion", "1.3");
        security.put("weakCiphersBlocked", true);
        stats.put("security", security);

        return stats;
    }
}

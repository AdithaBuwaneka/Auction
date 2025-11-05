package com.auction.system.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Migration Controller
 * Temporary endpoint to run database migrations
 */
@Tag(name = "13. Database Migration", description = "Database migration utilities")
@Slf4j
@RestController
@RequestMapping("/api/migrate")
@RequiredArgsConstructor
public class MigrationController {

    private final JdbcTemplate jdbcTemplate;

    @PostMapping("/add-role-column")
    public Map<String, String> addRoleColumn() {
        Map<String, String> result = new HashMap<>();

        try {
            log.info("🔄 Adding role column to users table...");

            // Add role column if it doesn't exist
            jdbcTemplate.execute(
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'USER'"
            );

            log.info("✅ Role column added successfully!");
            result.put("status", "success");
            result.put("message", "Role column added to users table");

        } catch (Exception e) {
            log.error("❌ Failed to add role column: {}", e.getMessage());
            result.put("status", "error");
            result.put("message", "Failed to add role column: " + e.getMessage());
        }

        return result;
    }

    @PostMapping("/make-admin")
    public Map<String, String> makeAdmin() {
        Map<String, String> result = new HashMap<>();

        try {
            log.info("🔄 Creating admin user...");

            // Update the admin user to have ADMIN role
            jdbcTemplate.update(
                "UPDATE users SET role = 'ADMIN' WHERE username = 'admin'"
            );

            log.info("✅ Admin user created successfully!");
            result.put("status", "success");
            result.put("message", "Admin user created successfully");

        } catch (Exception e) {
            log.error("❌ Failed to create admin user: {}", e.getMessage());
            result.put("status", "error");
            result.put("message", "Failed to create admin user: " + e.getMessage());
        }

        return result;
    }

    @PostMapping("/add-frozen-balance")
    public Map<String, String> addFrozenBalanceColumn() {
        Map<String, String> result = new HashMap<>();

        try {
            log.info("🔄 Adding frozen_balance column to users table...");

            // Add frozen_balance column if it doesn't exist
            jdbcTemplate.execute(
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS frozen_balance NUMERIC(10,2) NOT NULL DEFAULT 0"
            );

            log.info("✅ frozen_balance column added successfully!");
            result.put("status", "success");
            result.put("message", "frozen_balance column added to users table");

        } catch (Exception e) {
            log.error("❌ Failed to add frozen_balance column: {}", e.getMessage());
            result.put("status", "error");
            result.put("message", "Failed to add frozen_balance column: " + e.getMessage());
        }

        return result;
    }
}

package com.auction.system.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Database Migration Utility
 * Adds role column to users table if it doesn't exist
 */
@Component
@Slf4j
public class DatabaseMigration implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        try {
            log.info("🔄 Checking database schema...");

            // Add role column if it doesn't exist
            String sql = "ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'USER'";
            jdbcTemplate.execute(sql);

            log.info("✅ Database migration completed: role column added/verified");

            // Update any existing users without role
            String updateSql = "UPDATE users SET role = 'USER' WHERE role IS NULL";
            int updated = jdbcTemplate.update(updateSql);
            if (updated > 0) {
                log.info("✅ Updated {} existing users with USER role", updated);
            }

        } catch (Exception e) {
            log.error("❌ Database migration failed: {}", e.getMessage());
            // Don't throw exception - let application continue
        }
    }
}

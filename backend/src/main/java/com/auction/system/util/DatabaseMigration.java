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

            // Drop old duplicate indexes
            log.info("🔄 Dropping old duplicate indexes...");
            String[] dropIndexes = {
                "DROP INDEX IF EXISTS idx_auction_id",
                "DROP INDEX IF EXISTS idx_bidder_id",
                "DROP INDEX IF EXISTS idx_buyer_id",
                "DROP INDEX IF EXISTS idx_seller_id",
                "DROP INDEX IF EXISTS idx_user_id"
            };

            for (String dropSql : dropIndexes) {
                try {
                    jdbcTemplate.execute(dropSql);
                } catch (Exception ex) {
                    log.warn("Index may not exist: {}", ex.getMessage());
                }
            }
            log.info("✅ Old indexes dropped successfully");

        } catch (Exception e) {
            log.error("❌ Database migration failed: {}", e.getMessage());
            // Don't throw exception - let application continue
        }
    }
}

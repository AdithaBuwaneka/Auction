package com.auction.system.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;

/**
 * DataSource Configuration Helper
 * Tests database connection on application startup
 */
@Component
@Slf4j
public class DataSourceConfig {

    private final DataSource dataSource;

    public DataSourceConfig(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    /**
     * Test database connection when application starts
     */
    @EventListener(ApplicationReadyEvent.class)
    public void testDatabaseConnection() {
        try (Connection connection = dataSource.getConnection()) {
            log.info("✅ DATABASE CONNECTION SUCCESSFUL!");
            log.info("   Database: {}", connection.getCatalog());
            log.info("   URL: {}", connection.getMetaData().getURL());
            log.info("   Driver: {}", connection.getMetaData().getDriverName());
            log.info("   Version: {}", connection.getMetaData().getDatabaseProductVersion());
        } catch (Exception e) {
            log.error("❌ DATABASE CONNECTION FAILED!");
            log.error("   Error: {}", e.getMessage());
            log.error("   Please check your application.properties database configuration");
            log.error("   Make sure PostgreSQL is running and credentials are correct");
        }
    }
}

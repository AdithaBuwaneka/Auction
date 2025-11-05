package com.auction.system.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * Database Configuration
 * Configures PostgreSQL connection and JPA repositories
 */
@Configuration
@EnableJpaRepositories(basePackages = "com.auction.system.repository")
@EnableTransactionManagement
public class DatabaseConfig {
    // Configuration is primarily in application.properties
    // This class enables JPA repositories and transaction management
}

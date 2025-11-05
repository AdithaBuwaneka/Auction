package com.auction.system.repository;

import com.auction.system.entity.Notification;
import com.auction.system.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Notification Repository
 * Provides database access methods for Notification entity
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * Find all notifications for a user
     */
    List<Notification> findByUserOrderByCreatedAtDesc(User user);

    /**
     * Find unread notifications for a user
     */
    List<Notification> findByUserAndIsReadFalseOrderByCreatedAtDesc(User user);

    /**
     * Count unread notifications for a user
     */
    long countByUserAndIsReadFalse(User user);
}

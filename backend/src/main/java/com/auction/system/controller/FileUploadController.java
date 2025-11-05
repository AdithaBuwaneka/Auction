package com.auction.system.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

/**
 * File Upload Controller
 * Handles image uploads for auctions
 */
@Tag(name = "8. File Upload", description = "Upload and manage auction images")
@RestController
@RequestMapping("/api/upload")
@Slf4j
@CrossOrigin(origins = "*")
public class FileUploadController {

    private static final String UPLOAD_DIR = "uploads/auction-images/";
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    /**
     * Upload auction image
     * POST /api/upload/auction-image
     */
    @PostMapping("/auction-image")
    public ResponseEntity<?> uploadAuctionImage(@RequestParam("file") MultipartFile file) {
        log.info("Upload request received - File: {}, Size: {}", file.getOriginalFilename(), file.getSize());

        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
            }

            if (file.getSize() > MAX_FILE_SIZE) {
                return ResponseEntity.badRequest().body(Map.of("error", "File size exceeds 5MB limit"));
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Only image files are allowed"));
            }

            // Create upload directory if not exists
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".jpg";
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

            // Save file
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Generate URL (adjust this based on your deployment)
            String fileUrl = "/uploads/auction-images/" + uniqueFilename;

            log.info("File uploaded successfully: {}", uniqueFilename);

            return ResponseEntity.ok(Map.of(
                    "message", "File uploaded successfully",
                    "filename", uniqueFilename,
                    "url", fileUrl,
                    "size", file.getSize()
            ));

        } catch (IOException e) {
            log.error("Error uploading file", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        }
    }

    /**
     * Delete auction image
     * DELETE /api/upload/auction-image/{filename}
     */
    @DeleteMapping("/auction-image/{filename}")
    public ResponseEntity<?> deleteAuctionImage(@PathVariable String filename) {
        log.info("Delete request for file: {}", filename);

        try {
            Path filePath = Paths.get(UPLOAD_DIR + filename);

            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }

            Files.delete(filePath);
            log.info("File deleted successfully: {}", filename);

            return ResponseEntity.ok(Map.of("message", "File deleted successfully"));

        } catch (IOException e) {
            log.error("Error deleting file", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete file: " + e.getMessage()));
        }
    }
}

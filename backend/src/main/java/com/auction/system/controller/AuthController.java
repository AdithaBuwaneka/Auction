package com.auction.system.controller;

import com.auction.system.dto.AuthResponse;
import com.auction.system.dto.LoginRequest;
import com.auction.system.dto.RegisterRequest;
import com.auction.system.entity.User;
import com.auction.system.entity.UserRole;
import com.auction.system.security.JwtUtil;
import com.auction.system.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

/**
 * Authentication Controller
 * Handles user registration and login
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
@Tag(name = "1. Authentication", description = "User registration and login endpoints")
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    /**
     * Register a new user
     * POST /api/auth/register
     */
    @Operation(summary = "Register new user",
               description = "Create a new user account and receive JWT token. Users start with 0 balance.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "User registered successfully",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request or username/email already exists",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Registration request for username: {}", request.getUsername());

        try {
            // Create new user
            User user = User.builder()
                    .username(request.getUsername())
                    .email(request.getEmail())
                    .passwordHash(request.getPassword()) // Will be hashed in service
                    .role(UserRole.USER)
                    .balance(BigDecimal.ZERO) // Starting balance
                    .isActive(true)
                    .build();

            User registeredUser = userService.registerUser(user);

            // Generate JWT token
            String token = jwtUtil.generateToken(registeredUser);

            // Return auth response
            AuthResponse response = new AuthResponse(
                    token,
                    registeredUser.getUserId(),
                    registeredUser.getUsername(),
                    registeredUser.getEmail(),
                    registeredUser.getRole()
            );

            log.info("User registered successfully: {}", registeredUser.getUsername());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            log.error("Registration failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Login user
     * POST /api/auth/login
     */
    @Operation(summary = "Login user",
               description = "Authenticate user and receive JWT token for protected endpoints")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Login successful",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))),
            @ApiResponse(responseCode = "401", description = "Invalid credentials",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        log.info("Login request for username: {}", request.getUsername());

        try {
            // Authenticate user
            User user = userService.authenticateUser(request.getUsername(), request.getPassword())
                    .orElseThrow(() -> new RuntimeException("Invalid username or password"));

            // Generate JWT token
            String token = jwtUtil.generateToken(user);

            // Return auth response
            AuthResponse response = new AuthResponse(
                    token,
                    user.getUserId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getRole()
            );

            log.info("User logged in successfully: {}", user.getUsername());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Login failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Get current user info
     * GET /api/auth/me
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7); // Remove "Bearer " prefix
            String username = jwtUtil.extractUsername(token);

            User user = userService.getUserByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            return ResponseEntity.ok(user);

        } catch (Exception e) {
            log.error("Get current user failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Invalid token"));
        }
    }

    /**
     * Error Response DTO
     */
    @lombok.Data
    @lombok.AllArgsConstructor
    static class ErrorResponse {
        private String message;
    }
}

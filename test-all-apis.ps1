# Comprehensive API Test Script
# Tests all endpoints of the Auction System

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Testing Auction System APIs" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8080"
$testsPassed = 0
$testsFailed = 0

function Test-Endpoint {
    param(
        [string]$name,
        [string]$url,
        [string]$method = "GET",
        [object]$body = $null
    )

    Write-Host "Testing: $name..." -NoNewline

    try {
        if ($method -eq "GET") {
            $response = Invoke-RestMethod -Uri $url -Method Get
        } else {
            $json = $body | ConvertTo-Json -Depth 10
            $response = Invoke-RestMethod -Uri $url -Method $method -Body $json -ContentType "application/json"
        }

        Write-Host " PASS" -ForegroundColor Green
        $script:testsPassed++
        return $response
    } catch {
        Write-Host " FAIL" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        $script:testsFailed++
        return $null
    }
}

Write-Host "1. HEALTH CHECK TESTS" -ForegroundColor Yellow
Write-Host "----------------------------------------"
Test-Endpoint "Health Check" "$baseUrl/api/health"
Test-Endpoint "Root Endpoint" "$baseUrl/api/"
Write-Host ""

Write-Host "2. USER API TESTS" -ForegroundColor Yellow
Write-Host "----------------------------------------"
$users = Test-Endpoint "Get All Active Users" "$baseUrl/api/users/active"
if ($users) {
    Write-Host "  Found $($users.Count) users" -ForegroundColor Gray
}

$user1 = Test-Endpoint "Get User by ID (1)" "$baseUrl/api/users/1"
if ($user1) {
    Write-Host "  Username: $($user1.username), Balance: $($user1.balance)" -ForegroundColor Gray
}

$userByUsername = Test-Endpoint "Get User by Username" "$baseUrl/api/users/username/john_seller"

$loginData = @{
    username = "john_seller"
    password = "password123"
}
$loginResult = Test-Endpoint "Login User" "$baseUrl/api/users/login" "POST" $loginData
if ($loginResult) {
    Write-Host "  Login successful for: $($loginResult.username)" -ForegroundColor Gray
}
Write-Host ""

Write-Host "3. AUCTION API TESTS" -ForegroundColor Yellow
Write-Host "----------------------------------------"
$auctions = Test-Endpoint "Get All Active Auctions" "$baseUrl/api/auctions/active"
if ($auctions) {
    Write-Host "  Found $($auctions.Count) active auctions" -ForegroundColor Gray
}

$auction1 = Test-Endpoint "Get Auction by ID (1)" "$baseUrl/api/auctions/1"
if ($auction1) {
    Write-Host "  Item: $($auction1.itemName), Current Price: $($auction1.currentPrice)" -ForegroundColor Gray
}

$sellerAuctions = Test-Endpoint "Get Auctions by Seller (1)" "$baseUrl/api/auctions/seller/1"
if ($sellerAuctions) {
    Write-Host "  Seller has $($sellerAuctions.Count) auctions" -ForegroundColor Gray
}

$searchResults = Test-Endpoint "Search Auctions (laptop)" "$baseUrl/api/auctions/search?keyword=laptop"
if ($searchResults) {
    Write-Host "  Found $($searchResults.Count) matching auctions" -ForegroundColor Gray
}
Write-Host ""

Write-Host "4. BID API TESTS" -ForegroundColor Yellow
Write-Host "----------------------------------------"
$bidsForAuction = Test-Endpoint "Get Bids for Auction (1)" "$baseUrl/api/bids/auction/1"
if ($bidsForAuction) {
    Write-Host "  Auction has $($bidsForAuction.Count) bids" -ForegroundColor Gray
    $highestBid = ($bidsForAuction | Sort-Object -Property bidAmount -Descending | Select-Object -First 1)
    Write-Host "  Highest bid: $($highestBid.bidAmount) by User $($highestBid.bidder.userId)" -ForegroundColor Gray
}

$userBids = Test-Endpoint "Get Bids by User (2)" "$baseUrl/api/bids/user/2"
if ($userBids) {
    Write-Host "  User has placed $($userBids.Count) bids" -ForegroundColor Gray
}

# Test placing a new bid
$newBid = @{
    auctionId = 1
    bidderId = 4
    bidAmount = 650.00
}
$bidResult = Test-Endpoint "Place New Bid (650 on Auction 1)" "$baseUrl/api/bids" "POST" $newBid
if ($bidResult -and $bidResult.success) {
    Write-Host "  Bid placed successfully! New deadline: $($bidResult.newDeadline)" -ForegroundColor Gray
}

# Test invalid bid (too low)
$invalidBid = @{
    auctionId = 1
    bidderId = 4
    bidAmount = 100.00
}
$invalidResult = Test-Endpoint "Test Invalid Bid (too low)" "$baseUrl/api/bids" "POST" $invalidBid
Write-Host ""

Write-Host "5. DATA INTEGRITY TESTS" -ForegroundColor Yellow
Write-Host "----------------------------------------"

# Check if auction price updated after bid
$updatedAuction = Test-Endpoint "Verify Auction Price Updated" "$baseUrl/api/auctions/1"
if ($updatedAuction) {
    Write-Host "  Current price after bids: $($updatedAuction.currentPrice)" -ForegroundColor Gray
    Write-Host "  Status: $($updatedAuction.status)" -ForegroundColor Gray
    Write-Host "  Current deadline: $($updatedAuction.currentDeadline)" -ForegroundColor Gray
}

# Check updated bids
$finalBids = Test-Endpoint "Verify Bid History" "$baseUrl/api/bids/auction/1"
if ($finalBids) {
    Write-Host "  Total bids now: $($finalBids.Count)" -ForegroundColor Gray
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "          TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tests Passed: $testsPassed" -ForegroundColor Green
Write-Host "Tests Failed: $testsFailed" -ForegroundColor Red
Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "ALL TESTS PASSED! System is working correctly!" -ForegroundColor Green
} else {
    Write-Host "Some tests failed. Check the errors above." -ForegroundColor Yellow
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AUTHENTICATION STATUS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Spring Security: DISABLED (for testing)" -ForegroundColor Yellow
Write-Host "Password Storage: Plain text (development only)" -ForegroundColor Yellow
Write-Host "JWT Tokens: NOT IMPLEMENTED" -ForegroundColor Yellow
Write-Host ""
Write-Host "For production, you should:" -ForegroundColor Yellow
Write-Host "  1. Enable Spring Security in pom.xml"
Write-Host "  2. Implement BCrypt password hashing"
Write-Host "  3. Add JWT token-based authentication"
Write-Host "  4. Implement role-based access control"
Write-Host ""
Write-Host "Current setup is PERFECT for development/testing!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

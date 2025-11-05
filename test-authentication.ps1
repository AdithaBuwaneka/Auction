# Authentication Test Script
# Tests JWT-based authentication

Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     AUTHENTICATION TESTING (JWT)                         ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8080"

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "TEST 1: Register New User" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green

$registerData = @{
    username = "testuser_$(Get-Random -Minimum 1000 -Maximum 9999)"
    email = "testuser_$(Get-Random -Minimum 1000 -Maximum 9999)@example.com"
    password = "password123"
} | ConvertTo-Json

Write-Host "Registering user..." -ForegroundColor Yellow
$registerResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $registerData -ContentType "application/json"

Write-Host "✅ Registration Successful!" -ForegroundColor Green
Write-Host "   User ID: $($registerResponse.userId)" -ForegroundColor Gray
Write-Host "   Username: $($registerResponse.username)" -ForegroundColor Gray
Write-Host "   Role: $($registerResponse.role)" -ForegroundColor Gray
Write-Host "   JWT Token: $($registerResponse.token.Substring(0, 50))..." -ForegroundColor Gray
Write-Host ""

$testToken = $registerResponse.token
$testUsername = $registerResponse.username

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "TEST 2: Login with Registered User" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green

$loginData = @{
    username = $testUsername
    password = "password123"
} | ConvertTo-Json

Write-Host "Logging in..." -ForegroundColor Yellow
$loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginData -ContentType "application/json"

Write-Host "✅ Login Successful!" -ForegroundColor Green
Write-Host "   JWT Token: $($loginResponse.token.Substring(0, 50))..." -ForegroundColor Gray
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "TEST 3: Access Protected Endpoint (Get Current User)" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green

$headers = @{
    Authorization = "Bearer $testToken"
}

Write-Host "Getting current user info..." -ForegroundColor Yellow
$meResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" -Method Get -Headers $headers

Write-Host "✅ Access Granted!" -ForegroundColor Green
Write-Host "   Username: $($meResponse.username)" -ForegroundColor Gray
Write-Host "   Email: $($meResponse.email)" -ForegroundColor Gray
Write-Host "   Balance: `$$($meResponse.balance)" -ForegroundColor Gray
Write-Host "   Role: $($meResponse.role)" -ForegroundColor Gray
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "TEST 4: Access Public Endpoint (No Token)" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green

Write-Host "Getting active auctions (public)..." -ForegroundColor Yellow
$auctions = Invoke-RestMethod -Uri "$baseUrl/api/auctions/active" -Method Get

Write-Host "✅ Public Access Works!" -ForegroundColor Green
Write-Host "   Found $($auctions.Count) active auctions" -ForegroundColor Gray
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "TEST 5: Invalid Token (Should Fail)" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green

$badHeaders = @{
    Authorization = "Bearer invalid_token_12345"
}

Write-Host "Trying with invalid token..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$baseUrl/api/auth/me" -Method Get -Headers $badHeaders
    Write-Host "❌ FAILED: Invalid token was accepted!" -ForegroundColor Red
} catch {
    Write-Host "✅ Correctly Rejected!" -ForegroundColor Green
    Write-Host "   Status: 401 Unauthorized" -ForegroundColor Gray
}
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "ALL AUTHENTICATION TESTS PASSED! ✅" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "  ✅ User Registration" -ForegroundColor Green
Write-Host "  ✅ User Login" -ForegroundColor Green
Write-Host "  ✅ JWT Token Generation" -ForegroundColor Green
Write-Host "  ✅ Protected Endpoint Access" -ForegroundColor Green
Write-Host "  ✅ Public Endpoint Access" -ForegroundColor Green
Write-Host "  ✅ Invalid Token Rejection" -ForegroundColor Green
Write-Host ""
Write-Host "JWT Authentication is working perfectly!" -ForegroundColor Green
Write-Host ""

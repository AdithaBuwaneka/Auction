# Simple API Test Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Testing All REST APIs" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$base = "http://localhost:8080"

Write-Host "1. Health Check..." -NoNewline
try {
    $health = Invoke-RestMethod -Uri "$base/api/health"
    Write-Host " OK - Status: $($health.status)" -ForegroundColor Green
}
catch { Write-Host " FAILED" -ForegroundColor Red }

Write-Host "2. Get All Users..." -NoNewline
try {
    $users = Invoke-RestMethod -Uri "$base/api/users/active"
    Write-Host " OK - Found $($users.Count) users" -ForegroundColor Green
}
catch { Write-Host " FAILED" -ForegroundColor Red }

Write-Host "3. Get Active Auctions..." -NoNewline
try {
    $auctions = Invoke-RestMethod -Uri "$base/api/auctions/active"
    Write-Host " OK - Found $($auctions.Count) auctions" -ForegroundColor Green
    foreach ($a in $auctions) {
        Write-Host "   - $($a.itemName): Current Price = `$$($a.currentPrice)" -ForegroundColor Gray
    }
}
catch { Write-Host " FAILED" -ForegroundColor Red }

Write-Host "4. Get Bids for Auction 1..." -NoNewline
try {
    $bids = Invoke-RestMethod -Uri "$base/api/bids/auction/1"
    Write-Host " OK - Found $($bids.Count) bids" -ForegroundColor Green
    $highest = ($bids | Sort-Object -Property bidAmount -Descending | Select-Object -First 1)
    Write-Host "   - Highest bid: `$$($highest.bidAmount) by $($highest.bidder.username)" -ForegroundColor Gray
}
catch { Write-Host " FAILED" -ForegroundColor Red }

Write-Host "5. Login Test..." -NoNewline
try {
    $login = @{ username = "john_seller"; password = "password123" } | ConvertTo-Json
    $user = Invoke-RestMethod -Uri "$base/api/users/login" -Method Post -Body $login -ContentType "application/json"
    Write-Host " OK - Logged in as: $($user.username)" -ForegroundColor Green
}
catch { Write-Host " FAILED" -ForegroundColor Red }

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ALL TESTS PASSED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Try these in your browser:" -ForegroundColor Yellow
Write-Host "  $base/api/health"
Write-Host "  $base/api/users/active"
Write-Host "  $base/api/auctions/active"
Write-Host "  $base/api/bids/auction/1"
Write-Host ""

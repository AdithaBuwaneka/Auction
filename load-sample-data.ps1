# PowerShell Script to Load Sample Data into Auction System
# Make sure backend is running on http://localhost:8080

Write-Host "========================================"
Write-Host "  Loading Sample Data - Auction System"
Write-Host "========================================"
Write-Host ""

# Test if backend is running
Write-Host "Checking if backend is running..."
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8080/api/health" -Method Get
    Write-Host "Backend is UP and running!"
    Write-Host ""
} catch {
    Write-Host "Backend is not running! Please start it with: mvn spring-boot:run"
    exit
}

# Create Users
Write-Host "Creating users..."

$user1 = @{
    username = "john_seller"
    email = "john@example.com"
    passwordHash = "password123"
    balance = 5000.00
    isActive = $true
} | ConvertTo-Json

$user2 = @{
    username = "jane_buyer"
    email = "jane@example.com"
    passwordHash = "password123"
    balance = 10000.00
    isActive = $true
} | ConvertTo-Json

$user3 = @{
    username = "bob_bidder"
    email = "bob@example.com"
    passwordHash = "password123"
    balance = 8000.00
    isActive = $true
} | ConvertTo-Json

$user4 = @{
    username = "alice_user"
    email = "alice@example.com"
    passwordHash = "password123"
    balance = 12000.00
    isActive = $true
} | ConvertTo-Json

try {
    Write-Host "  Creating user: john_seller..." -NoNewline
    $u1 = Invoke-RestMethod -Uri "http://localhost:8080/api/users/register" -Method Post -Body $user1 -ContentType "application/json"
    Write-Host " OK"

    Write-Host "  Creating user: jane_buyer..." -NoNewline
    $u2 = Invoke-RestMethod -Uri "http://localhost:8080/api/users/register" -Method Post -Body $user2 -ContentType "application/json"
    Write-Host " OK"

    Write-Host "  Creating user: bob_bidder..." -NoNewline
    $u3 = Invoke-RestMethod -Uri "http://localhost:8080/api/users/register" -Method Post -Body $user3 -ContentType "application/json"
    Write-Host " OK"

    Write-Host "  Creating user: alice_user..." -NoNewline
    $u4 = Invoke-RestMethod -Uri "http://localhost:8080/api/users/register" -Method Post -Body $user4 -ContentType "application/json"
    Write-Host " OK"

    Write-Host ""
    Write-Host "All users created successfully!"
    Write-Host ""
} catch {
    Write-Host " ERROR"
    Write-Host "Error creating users: $($_.Exception.Message)"
}

# Get current time for auction dates
$now = Get-Date
$startTime = $now.ToString("yyyy-MM-ddTHH:mm:ss")
$endTime24h = $now.AddHours(24).ToString("yyyy-MM-ddTHH:mm:ss")
$endTime12h = $now.AddHours(12).ToString("yyyy-MM-ddTHH:mm:ss")
$startTime1h = $now.AddHours(1).ToString("yyyy-MM-ddTHH:mm:ss")
$endTime48h = $now.AddHours(48).ToString("yyyy-MM-ddTHH:mm:ss")

# Create Auctions
Write-Host "Creating auctions..."

$auction1 = @{
    seller = @{ userId = $u1.userId }
    itemName = "Vintage Laptop"
    description = "High-performance laptop in excellent condition."
    imageUrl = "https://images.unsplash.com/photo-1496181133206-80ce9b88a853"
    startingPrice = 500.00
    currentPrice = 500.00
    startTime = $startTime
    mandatoryEndTime = $endTime24h
    bidGapDuration = "PT2H"
    status = "ACTIVE"
} | ConvertTo-Json

$auction2 = @{
    seller = @{ userId = $u1.userId }
    itemName = "Smartphone - Latest Model"
    description = "Brand new smartphone with all accessories."
    imageUrl = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9"
    startingPrice = 800.00
    currentPrice = 800.00
    startTime = $startTime
    mandatoryEndTime = $endTime12h
    bidGapDuration = "PT1H"
    status = "ACTIVE"
} | ConvertTo-Json

$auction3 = @{
    seller = @{ userId = $u4.userId }
    itemName = "Gaming Console"
    description = "PlayStation 5 with 2 controllers and 5 games."
    imageUrl = "https://images.unsplash.com/photo-1606813907291-d86efa9b94db"
    startingPrice = 400.00
    currentPrice = 400.00
    startTime = $startTime1h
    mandatoryEndTime = $endTime48h
    bidGapDuration = "PT3H"
    status = "PENDING"
} | ConvertTo-Json

try {
    Write-Host "  Creating auction: Vintage Laptop..." -NoNewline
    $a1 = Invoke-RestMethod -Uri "http://localhost:8080/api/auctions" -Method Post -Body $auction1 -ContentType "application/json"
    Write-Host " OK"

    Write-Host "  Creating auction: Smartphone..." -NoNewline
    $a2 = Invoke-RestMethod -Uri "http://localhost:8080/api/auctions" -Method Post -Body $auction2 -ContentType "application/json"
    Write-Host " OK"

    Write-Host "  Creating auction: Gaming Console..." -NoNewline
    $a3 = Invoke-RestMethod -Uri "http://localhost:8080/api/auctions" -Method Post -Body $auction3 -ContentType "application/json"
    Write-Host " OK"

    Write-Host ""
    Write-Host "All auctions created successfully!"
    Write-Host ""
} catch {
    Write-Host " ERROR"
    Write-Host "Error creating auctions: $($_.Exception.Message)"
}

# Create some sample bids
Write-Host "Creating sample bids..."

$bid1 = @{
    auctionId = $a1.auctionId
    bidderId = $u2.userId
    bidAmount = 550.00
} | ConvertTo-Json

$bid2 = @{
    auctionId = $a1.auctionId
    bidderId = $u3.userId
    bidAmount = 600.00
} | ConvertTo-Json

$bid3 = @{
    auctionId = $a2.auctionId
    bidderId = $u2.userId
    bidAmount = 850.00
} | ConvertTo-Json

try {
    Write-Host "  Jane bids 550 on Laptop..." -NoNewline
    $b1 = Invoke-RestMethod -Uri "http://localhost:8080/api/bids" -Method Post -Body $bid1 -ContentType "application/json"
    Write-Host " OK"

    Write-Host "  Bob bids 600 on Laptop..." -NoNewline
    $b2 = Invoke-RestMethod -Uri "http://localhost:8080/api/bids" -Method Post -Body $bid2 -ContentType "application/json"
    Write-Host " OK"

    Write-Host "  Jane bids 850 on Smartphone..." -NoNewline
    $b3 = Invoke-RestMethod -Uri "http://localhost:8080/api/bids" -Method Post -Body $bid3 -ContentType "application/json"
    Write-Host " OK"

    Write-Host ""
    Write-Host "All bids placed successfully!"
    Write-Host ""
} catch {
    Write-Host " ERROR"
    Write-Host "Error creating bids: $($_.Exception.Message)"
}

# Summary
Write-Host "========================================"
Write-Host "          SUMMARY"
Write-Host "========================================"
Write-Host ""
Write-Host "Created 4 users"
Write-Host "Created 3 auctions"
Write-Host "Placed 3 bids"
Write-Host ""
Write-Host "Test URLs:"
Write-Host "  http://localhost:8080/api/users/active"
Write-Host "  http://localhost:8080/api/auctions/active"
Write-Host "  http://localhost:8080/api/bids/auction/1"
Write-Host ""
Write-Host "Sample data loaded successfully!"
Write-Host "========================================"

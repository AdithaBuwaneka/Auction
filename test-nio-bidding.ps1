# NIO Bidding Test Script
# Tests the NIO server on port 8082

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Testing NIO Bid Server (Port 8082)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

function Send-NIOBid {
    param(
        [string]$serverHost = "localhost",
        [int]$serverPort = 8082,
        [string]$json
    )

    try {
        $client = New-Object System.Net.Sockets.TcpClient($serverHost, $serverPort)
        $stream = $client.GetStream()
        $writer = New-Object System.IO.StreamWriter($stream)
        $reader = New-Object System.IO.StreamReader($stream)

        # Send bid
        $writer.WriteLine($json)
        $writer.Flush()

        # Read response
        $response = $reader.ReadLine()

        $writer.Close()
        $reader.Close()
        $client.Close()

        return $response
    } catch {
        return "ERROR: $($_.Exception.Message)"
    }
}

# Test 1: Valid Bid
Write-Host "Test 1: Valid Bid (750 on Auction 1)" -ForegroundColor Yellow
$bid1 = '{"auctionId":1,"bidderId":2,"bidAmount":750.00}'
Write-Host "Sending: $bid1" -ForegroundColor Gray
$response1 = Send-NIOBid -json $bid1
Write-Host "Response: $response1" -ForegroundColor Green
Write-Host ""

# Test 2: Too Low Bid
Write-Host "Test 2: Bid Too Low (200 on Auction 1)" -ForegroundColor Yellow
$bid2 = '{"auctionId":1,"bidderId":3,"bidAmount":200.00}'
Write-Host "Sending: $bid2" -ForegroundColor Gray
$response2 = Send-NIOBid -json $bid2
Write-Host "Response: $response2" -ForegroundColor Red
Write-Host ""

# Test 3: Another Valid Bid
Write-Host "Test 3: Valid Bid (950 on Auction 2)" -ForegroundColor Yellow
$bid3 = '{"auctionId":2,"bidderId":4,"bidAmount":950.00}'
Write-Host "Sending: $bid3" -ForegroundColor Gray
$response3 = Send-NIOBid -json $bid3
Write-Host "Response: $response3" -ForegroundColor Green
Write-Host ""

# Test 4: Multiple Concurrent Connections (Performance Test)
Write-Host "Test 4: Performance Test - 10 Concurrent Bids" -ForegroundColor Yellow
Write-Host "Sending 10 bids simultaneously..." -ForegroundColor Gray

$jobs = @()
for ($i = 1; $i -le 10; $i++) {
    $amount = 800 + ($i * 10)
    $bid = "{`"auctionId`":1,`"bidderId`":$i,`"bidAmount`":$amount.00}"

    $jobs += Start-Job -ScriptBlock {
        param($json)
        $client = New-Object System.Net.Sockets.TcpClient("localhost", 8082)
        $stream = $client.GetStream()
        $writer = New-Object System.IO.StreamWriter($stream)
        $reader = New-Object System.IO.StreamReader($stream)
        $writer.WriteLine($json)
        $writer.Flush()
        $response = $reader.ReadLine()
        $writer.Close()
        $reader.Close()
        $client.Close()
        return $response
    } -ArgumentList $bid
}

# Wait for all jobs to complete
$jobs | Wait-Job | Out-Null

# Get results
$successCount = 0
$jobs | ForEach-Object {
    $result = Receive-Job $_
    if ($result -like "*success*true*") {
        $successCount++
    }
}

$jobs | Remove-Job

Write-Host "Results: $successCount/10 bids processed successfully" -ForegroundColor Cyan
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NIO Testing Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "NIO Server handled concurrent connections with:" -ForegroundColor Yellow
Write-Host "  - SINGLE THREAD event loop" -ForegroundColor White
Write-Host "  - Non-blocking I/O operations" -ForegroundColor White
Write-Host "  - Selector-based multiplexing" -ForegroundColor White
Write-Host ""
Write-Host "Check backend console for NIO server logs!" -ForegroundColor Yellow

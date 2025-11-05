# TCP Bidding Test Script
# Tests the TCP server on port 8081

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Testing TCP Bid Server (Port 8081)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

function Send-TCPBid {
    param(
        [string]$serverHost = "localhost",
        [int]$serverPort = 8081,
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
Write-Host "Test 1: Valid Bid (700 on Auction 1)" -ForegroundColor Yellow
$bid1 = '{"auctionId":1,"bidderId":2,"bidAmount":700.00}'
Write-Host "Sending: $bid1" -ForegroundColor Gray
$response1 = Send-TCPBid -json $bid1
Write-Host "Response: $response1" -ForegroundColor Green
Write-Host ""

# Test 2: Too Low Bid
Write-Host "Test 2: Bid Too Low (100 on Auction 1)" -ForegroundColor Yellow
$bid2 = '{"auctionId":1,"bidderId":3,"bidAmount":100.00}'
Write-Host "Sending: $bid2" -ForegroundColor Gray
$response2 = Send-TCPBid -json $bid2
Write-Host "Response: $response2" -ForegroundColor Red
Write-Host ""

# Test 3: Another Valid Bid
Write-Host "Test 3: Valid Bid (900 on Auction 2)" -ForegroundColor Yellow
$bid3 = '{"auctionId":2,"bidderId":3,"bidAmount":900.00}'
Write-Host "Sending: $bid3" -ForegroundColor Gray
$response3 = Send-TCPBid -json $bid3
Write-Host "Response: $response3" -ForegroundColor Green
Write-Host ""

# Test 4: Invalid JSON
Write-Host "Test 4: Invalid JSON Format" -ForegroundColor Yellow
$bid4 = '{invalid json}'
Write-Host "Sending: $bid4" -ForegroundColor Gray
$response4 = Send-TCPBid -json $bid4
Write-Host "Response: $response4" -ForegroundColor Red
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TCP Testing Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Check your backend console for detailed TCP logs!" -ForegroundColor Yellow

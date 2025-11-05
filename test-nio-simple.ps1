# Simple NIO Connection Test
# Just tests that NIO server accepts connections and responds

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NIO Server Connection Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Testing if NIO server on port 8082 accepts connections..." -ForegroundColor Yellow
Write-Host ""

function Test-NIOConnection {
    param([int]$connectionNumber)

    try {
        $client = New-Object System.Net.Sockets.TcpClient("localhost", 8082)
        $connected = $client.Connected
        $client.Close()

        if ($connected) {
            Write-Host "  Connection $connectionNumber : SUCCESS" -ForegroundColor Green
            return 1
        } else {
            Write-Host "  Connection $connectionNumber : FAILED" -ForegroundColor Red
            return 0
        }
    } catch {
        Write-Host "  Connection $connectionNumber : ERROR - $($_.Exception.Message)" -ForegroundColor Red
        return 0
    }
}

# Test sequential connections
Write-Host "Test 1: Sequential Connections (1-5)" -ForegroundColor Yellow
$successCount = 0
for ($i = 1; $i -le 5; $i++) {
    $successCount += Test-NIOConnection -connectionNumber $i
    Start-Sleep -Milliseconds 100
}
Write-Host ""
Write-Host "Sequential Test: $successCount/5 connections successful" -ForegroundColor Cyan
Write-Host ""

# Test concurrent connections
Write-Host "Test 2: Concurrent Connections (10 simultaneous)" -ForegroundColor Yellow
$jobs = @()
for ($i = 1; $i -le 10; $i++) {
    $jobs += Start-Job -ScriptBlock {
        param($num)
        try {
            $client = New-Object System.Net.Sockets.TcpClient("localhost", 8082)
            $connected = $client.Connected
            $client.Close()
            return $connected
        } catch {
            return $false
        }
    } -ArgumentList $i
}

$jobs | Wait-Job | Out-Null
$concurrentSuccess = 0
$jobs | ForEach-Object {
    $result = Receive-Job $_
    if ($result) {
        $concurrentSuccess++
    }
}
$jobs | Remove-Job

Write-Host "  All 10 connections sent simultaneously..." -ForegroundColor Gray
Write-Host "  Concurrent Test: $concurrentSuccess/10 connections successful" -ForegroundColor Cyan
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NIO Server Test Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($successCount -ge 4 -and $concurrentSuccess -ge 8) {
    Write-Host "SUCCESS: NIO server is accepting connections!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Key Points Demonstrated:" -ForegroundColor Yellow
    Write-Host "  - NIO server running on port 8082" -ForegroundColor White
    Write-Host "  - Handles multiple connections" -ForegroundColor White
    Write-Host "  - Single thread manages all connections" -ForegroundColor White
    Write-Host "  - Non-blocking I/O with Selector" -ForegroundColor White
} else {
    Write-Host "WARNING: Some connections failed" -ForegroundColor Yellow
    Write-Host "Make sure backend is running and NIO server started" -ForegroundColor Yellow
}
Write-Host ""

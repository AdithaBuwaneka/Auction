# SSL/TLS Payment Test Script (Member 5)
# Tests secure encrypted payment processing

Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     SSL/TLS PAYMENT TESTING (Member 5)                   ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script tests SSL/TLS secure payment processing" -ForegroundColor Yellow
Write-Host "Server: localhost:8443" -ForegroundColor Yellow
Write-Host "Encryption: TLS" -ForegroundColor Yellow
Write-Host ""

# Function to compile Java client if needed
function Compile-SSLClient {
    Write-Host "📦 Checking SSL client compilation..." -ForegroundColor Yellow

    $clientPath = "backend\src\main\java\com\auction\system\network\ssl\SSLPaymentClient.java"
    $classPath = "backend\src\main\java\com\auction\system\network\ssl\SSLPaymentClient.class"

    if (-not (Test-Path $classPath) -or ((Get-Item $clientPath).LastWriteTime -gt (Get-Item $classPath).LastWriteTime)) {
        Write-Host "🔨 Compiling SSL client..." -ForegroundColor Yellow

        # Find Jackson JAR in Maven repository
        $userHome = $env:USERPROFILE
        $m2Repo = "$userHome\.m2\repository"
        $jacksonCore = Get-ChildItem -Path "$m2Repo\com\fasterxml\jackson\core\jackson-core" -Recurse -Filter "*.jar" | Select-Object -First 1
        $jacksonDatabind = Get-ChildItem -Path "$m2Repo\com\fasterxml\jackson\core\jackson-databind" -Recurse -Filter "*.jar" | Select-Object -First 1
        $jacksonAnnotations = Get-ChildItem -Path "$m2Repo\com\fasterxml\jackson\core\jackson-annotations" -Recurse -Filter "*.jar" | Select-Object -First 1

        if ($jacksonCore -and $jacksonDatabind -and $jacksonAnnotations) {
            $classpath = "$($jacksonCore.FullName);$($jacksonDatabind.FullName);$($jacksonAnnotations.FullName)"

            javac -cp $classpath $clientPath

            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Compilation successful!" -ForegroundColor Green
            } else {
                Write-Host "❌ Compilation failed!" -ForegroundColor Red
                exit 1
            }
        } else {
            Write-Host "⚠️  Jackson JARs not found. Run 'mvn install' first." -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "✅ SSL client already compiled" -ForegroundColor Green
    }
    Write-Host ""
}

# Function to check if server is running
function Test-SSLServer {
    Write-Host "🔍 Checking if SSL server is running on port 8443..." -ForegroundColor Yellow

    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $tcpClient.Connect("localhost", 8443)
        $tcpClient.Close()
        Write-Host "✅ SSL server is running!" -ForegroundColor Green
        Write-Host ""
        return $true
    } catch {
        Write-Host "❌ SSL server is NOT running on port 8443!" -ForegroundColor Red
        Write-Host "   Please start the backend: cd backend && mvn spring-boot:run" -ForegroundColor Yellow
        Write-Host ""
        return $false
    }
}

# Test Scenario 1: Valid Payment
function Test-ValidPayment {
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "TEST 1: Valid Payment" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

    $paymentData = @{
        userId = 2
        auctionId = 1
        amount = 750.00
        cardNumber = "1234567890123456"
        cardholderName = "Jane Buyer"
        expiryDate = "12/25"
        cvv = "123"
    } | ConvertTo-Json -Compress

    Write-Host "📤 Sending: $paymentData" -ForegroundColor Gray

    try {
        # Note: PowerShell doesn't have built-in SSL client for custom SSL
        # We'll use Java client instead
        Write-Host "⚠️  Use Java client for interactive testing" -ForegroundColor Yellow
        Write-Host "   Run: java -cp backend\src\main\java com.auction.system.network.ssl.SSLPaymentClient" -ForegroundColor Yellow
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host ""
}

# Main execution
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "STARTING SSL/TLS PAYMENT TESTS" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""

# Check if server is running
if (-not (Test-SSLServer)) {
    exit 1
}

# Compile client
Compile-SSLClient

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "MANUAL TESTING INSTRUCTIONS" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "To test SSL/TLS payment, run the Java client:" -ForegroundColor Yellow
Write-Host ""
Write-Host "cd backend\src\main\java" -ForegroundColor White
Write-Host 'java -cp ".;%USERPROFILE%\.m2\repository\com\fasterxml\jackson\core\jackson-core\2.17.2\jackson-core-2.17.2.jar;%USERPROFILE%\.m2\repository\com\fasterxml\jackson\core\jackson-databind\2.17.2\jackson-databind-2.17.2.jar;%USERPROFILE%\.m2\repository\com\fasterxml\jackson\core\jackson-annotations\2.17.2\jackson-annotations-2.17.2.jar" com.auction.system.network.ssl.SSLPaymentClient' -ForegroundColor White
Write-Host ""
Write-Host "Or simpler:" -ForegroundColor Yellow
Write-Host "cd backend" -ForegroundColor White
Write-Host "mvn exec:java -Dexec.mainClass=`"com.auction.system.network.ssl.SSLPaymentClient`"" -ForegroundColor White
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "TEST DATA EXAMPLES" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test Case 1: Valid Payment" -ForegroundColor Green
Write-Host "  User ID: 2" -ForegroundColor Gray
Write-Host "  Auction ID: 1" -ForegroundColor Gray
Write-Host "  Amount: 750.00" -ForegroundColor Gray
Write-Host "  Card Number: 1234567890123456" -ForegroundColor Gray
Write-Host "  Cardholder: Jane Buyer" -ForegroundColor Gray
Write-Host "  Expiry: 12/25" -ForegroundColor Gray
Write-Host "  CVV: 123" -ForegroundColor Gray
Write-Host ""

Write-Host "Test Case 2: Invalid Card (too short)" -ForegroundColor Yellow
Write-Host "  Card Number: 123456" -ForegroundColor Gray
Write-Host "  (Should be rejected)" -ForegroundColor Gray
Write-Host ""

Write-Host "Test Case 3: Invalid Amount" -ForegroundColor Yellow
Write-Host "  Amount: -100.00 or 0" -ForegroundColor Gray
Write-Host "  (Should be rejected)" -ForegroundColor Gray
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "WIRESHARK CAPTURE" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "To capture SSL/TLS traffic in Wireshark:" -ForegroundColor Yellow
Write-Host "1. Open Wireshark" -ForegroundColor White
Write-Host "2. Apply filter: tcp.port == 8443 || ssl" -ForegroundColor White
Write-Host "3. Run the SSL client" -ForegroundColor White
Write-Host "4. Observe:" -ForegroundColor White
Write-Host "   - SSL/TLS handshake packets" -ForegroundColor Gray
Write-Host "   - Encrypted application data (not readable)" -ForegroundColor Gray
Write-Host "   - Certificate exchange" -ForegroundColor Gray
Write-Host "   - Cipher suite negotiation" -ForegroundColor Gray
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "SSL/TLS TESTING READY!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Server is running on port 8443" -ForegroundColor Green
Write-Host "✅ SSL client is compiled and ready" -ForegroundColor Green
Write-Host "✅ Test data examples provided" -ForegroundColor Green
Write-Host ""
Write-Host "Run the Java client to start testing secure payments!" -ForegroundColor Yellow
Write-Host ""

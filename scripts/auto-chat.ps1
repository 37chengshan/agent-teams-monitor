# Auto chat script - Simple version
$TeamDir = "$env:USERPROFILE\.claude\teams\test-auto-team\inboxes"
$AliceFile = "$TeamDir\alice.json"
$BobFile = "$TeamDir\bob.json"

Write-Host "Starting auto chat..." -ForegroundColor Cyan

$messages = @(
    "Hello from Alice",
    "Hello from Bob",
    "Testing message 1",
    "Testing message 2",
    "Message system OK",
    "Great!",
    "More messages",
    "Keep going",
    "Almost done",
    "Final test"
)

while ($true) {
    $count = 0
    foreach ($msg in $messages) {
        $timestamp = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ")
        $from = if ($count % 2 -eq 0) { "alice" } else { "bob" }
        $color = if ($from -eq "alice") { "blue" } else { "green" }
        $file = if ($from -eq "alice") { $AliceFile } else { $BobFile }

        $jsonObj = @{
            from = $from
            text = $msg
            summary = "Message from $from"
            timestamp = $timestamp
            color = $color
            read = $false
        }

        try {
            $content = Get-Content $file -Raw -ErrorAction SilentlyContinue
            if ([string]::IsNullOrWhiteSpace($content) -or $content -eq "[]") {
                $arr = @($jsonObj)
            } else {
                $arr = $content | ConvertFrom-Json
                if ($arr -is [Array]) {
                    $arr += $jsonObj
                } else {
                    $arr = @($arr, $jsonObj)
                }
            }
            $arr | ConvertTo-Json -Depth 10 | Out-File -FilePath $file -Encoding UTF8
            Write-Host "  $from : $msg" -ForegroundColor $(if($from -eq "alice"){"Blue"}else{"Green"})
        } catch {
            Write-Host "  Error: $_" -ForegroundColor Red
        }

        $count++
        Start-Sleep -Seconds 2
    }
}

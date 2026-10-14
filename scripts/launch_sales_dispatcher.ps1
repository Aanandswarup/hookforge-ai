# HookForge AI — 1-Click Multi-Channel Sales Dispatcher
# Automatically opens pre-composed posts in your default browser where you are already logged in!

param(
    [ValidateSet("all", "twitter", "hackernews", "reddit", "linkedin", "gumroad")]
    [string]$Channel = "all"
)

$twitterText = [System.Uri]::EscapeDataString("80% of short-form videos & LinkedIn carousels fail in the first 3 seconds because the hook has zero cognitive tension.`n`nI spent 72h building HookForge AI: an in-browser studio that turns raw ideas into 5 viral hooks & styled carousels in 10s.`n`nTry free: https://aanandswarup.github.io/hookforge-ai/`n`n50% off first 10 LTDs with code EARLYBIRD 🔥")
$twitterUrl = "https://twitter.com/intent/tweet?text=$twitterText"

$hnTitle = [System.Uri]::EscapeDataString("Show HN: HookForge – In-browser viral hook and canvas carousel studio (client-side, $0 backend)")
$hnUrl = "https://news.ycombinator.com/submitlink?u=https%3A%2F%2Faanandswarup.github.io%2Fhookforge-ai%2F&t=$hnTitle"

$redditTitle = [System.Uri]::EscapeDataString("I was tired of Canva & expensive AI subscriptions, so I built an in-browser viral hook & visual carousel studio ($0 server costs)")
$redditUrl = "https://www.reddit.com/r/SideProject/submit?url=https%3A%2F%2Faanandswarup.github.io%2Fhookforge-ai%2F&title=$redditTitle"

$linkedinUrl = "https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Faanandswarup.github.io%2Fhookforge-ai%2F"

$gumroadDiscounts = "https://app.gumroad.com/discounts"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   HOOKFORGE AI — 1-CLICK SALES & DISTRIBUTION LAUNCHER   " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

switch ($Channel) {
    "twitter" {
        Write-Host "Opening Twitter/X composer with pre-filled launch tweet..." -ForegroundColor Green
        Start-Process $twitterUrl
    }
    "hackernews" {
        Write-Host "Opening Hacker News submission with pre-filled Show HN..." -ForegroundColor Green
        Start-Process $hnUrl
    }
    "reddit" {
        Write-Host "Opening Reddit r/SideProject submit page..." -ForegroundColor Green
        Start-Process $redditUrl
    }
    "linkedin" {
        Write-Host "Opening LinkedIn share dialog..." -ForegroundColor Green
        Start-Process $linkedinUrl
    }
    "gumroad" {
        Write-Host "Opening Gumroad discounts settings..." -ForegroundColor Green
        Start-Process $gumroadDiscounts
    }
    "all" {
        Write-Host "[1/5] Opening Gumroad Discounts to set EARLYBIRD..." -ForegroundColor Yellow
        Start-Process $gumroadDiscounts
        Start-Sleep -Seconds 1

        Write-Host "[2/5] Opening Twitter/X composer with pre-filled thread..." -ForegroundColor Green
        Start-Process $twitterUrl
        Start-Sleep -Seconds 1

        Write-Host "[3/5] Opening Hacker News Show HN submit page..." -ForegroundColor Cyan
        Start-Process $hnUrl
        Start-Sleep -Seconds 1

        Write-Host "[4/5] Opening Reddit r/SideProject submit page..." -ForegroundColor Magenta
        Start-Process $redditUrl
        Start-Sleep -Seconds 1

        Write-Host "[5/5] Opening LinkedIn Share page..." -ForegroundColor Blue
        Start-Process $linkedinUrl
    }
}

Write-Host "`nAll selected channels opened in your default browser!" -ForegroundColor Green
Write-Host "All posts have titles, links, and text pre-filled. Just click 'Post' / 'Submit'!" -ForegroundColor Yellow

# HookForge AI - Multi-Channel Sales Dispatcher
param(
    [string]$Channel = "all"
)

$siteUrl = "https://aanandswarup.github.io/hookforge-ai/"
$gumroadCheckout = "https://caanand7.gumroad.com/l/hookforge/EARLYBIRD"
$gumroadDiscounts = "https://app.gumroad.com/discounts"

$tweetMsg = "80% of short-form videos and LinkedIn carousels fail in the first 3 seconds because the hook has zero tension.`n`nI built HookForge AI: an in-browser studio that turns raw ideas into 5 viral hooks and styled carousels in 10s.`n`nTry free: " + $siteUrl + "`n`nFirst 10 creators get 50% off with code EARLYBIRD"
$encodedTweet = [System.Uri]::EscapeDataString($tweetMsg)
$twitterUrl = "https://twitter.com/intent/tweet?text=" + $encodedTweet

$hnTitle = "Show HN: HookForge - In-browser viral hook and canvas carousel studio (client-side)"
$encodedHnTitle = [System.Uri]::EscapeDataString($hnTitle)
$encodedSiteUrl = [System.Uri]::EscapeDataString($siteUrl)
$hnUrl = "https://news.ycombinator.com/submitlink?u=" + $encodedSiteUrl + "&t=" + $encodedHnTitle

$redditTitle = "I was tired of Canva and expensive AI tools, so I built an in-browser viral hook and visual carousel studio"
$encodedRedditTitle = [System.Uri]::EscapeDataString($redditTitle)
$redditUrl = "https://www.reddit.com/r/SideProject/submit?url=" + $encodedSiteUrl + "&title=" + $encodedRedditTitle

$linkedinUrl = "https://www.linkedin.com/sharing/share-offsite/?url=" + $encodedSiteUrl

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   HOOKFORGE AI - MULTI-CHANNEL SALES LAUNCHER            " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

if ($Channel -eq "twitter" -or $Channel -eq "all") {
    Write-Host "[*] Opening Twitter / X with pre-filled launch thread..." -ForegroundColor Green
    Start-Process $twitterUrl
    Start-Sleep -Milliseconds 800
}

if ($Channel -eq "hackernews" -or $Channel -eq "all") {
    Write-Host "[*] Opening Hacker News (Show HN) submit page..." -ForegroundColor Cyan
    Start-Process $hnUrl
    Start-Sleep -Milliseconds 800
}

if ($Channel -eq "reddit" -or $Channel -eq "all") {
    Write-Host "[*] Opening Reddit (r/SideProject) submit page..." -ForegroundColor Magenta
    Start-Process $redditUrl
    Start-Sleep -Milliseconds 800
}

if ($Channel -eq "linkedin" -or $Channel -eq "all") {
    Write-Host "[*] Opening LinkedIn share composer..." -ForegroundColor Blue
    Start-Process $linkedinUrl
    Start-Sleep -Milliseconds 800
}

if ($Channel -eq "gumroad" -or $Channel -eq "all") {
    Write-Host "[*] Opening Gumroad Discounts dashboard..." -ForegroundColor Yellow
    Start-Process $gumroadDiscounts
}

Write-Host ""
Write-Host "SUCCESS: All promotional channels opened in your default browser!" -ForegroundColor Green
Write-Host "Titles, links, and pitches are pre-filled. Just click Post / Submit!" -ForegroundColor Yellow

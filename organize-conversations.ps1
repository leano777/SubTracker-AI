# Move conversation files to saved-conversations folder
Write-Host "Moving conversation files to saved-conversations folder..."

$conversationsFolder = "..\saved-conversations"
if (!(Test-Path $conversationsFolder)) {
    New-Item -ItemType Directory -Path $conversationsFolder
    Write-Host "Created saved-conversations folder"
}

$files = Get-ChildItem -Name "2025-*.txt"
$count = 0

foreach ($file in $files) {
    $dest = Join-Path $conversationsFolder $file
    if (!(Test-Path $dest)) {
        Move-Item $file $dest
        Write-Host "Moved: $file"
        $count++
    } else {
        Write-Host "Already exists: $file"
    }
}

Write-Host "Moved $count file(s)"
Write-Host "Contents of saved-conversations folder:"
Get-ChildItem "..\saved-conversations\*.txt" | Format-Table Name, Length, LastWriteTime
param([string]$Command = "help")

$PMRoot = Join-Path (Get-Location) "project-management"

switch ($Command.ToLower()) {
    "status" {
        Write-Host "SubTracker AI - Current Status" -ForegroundColor Cyan
        Write-Host ""
        if (Test-Path "$PMRoot\boards\current-sprint.md") {
            Get-Content "$PMRoot\boards\current-sprint.md"
        }
    }
    "critical" {
        Write-Host "Critical Priority Tickets:" -ForegroundColor Red
        if (Test-Path "$PMRoot\tickets\critical") {
            Get-ChildItem "$PMRoot\tickets\critical\*.md" | ForEach-Object { 
                Write-Host "  - $($_.BaseName)" -ForegroundColor White
            }
        }
    }
    "list" {
        foreach ($priority in @("critical", "high", "medium", "low")) {
            $path = "$PMRoot\tickets\$priority"
            if (Test-Path $path) {
                $count = (Get-ChildItem "$path\*.md" -ErrorAction SilentlyContinue).Count
                Write-Host "$priority : $count tickets" -ForegroundColor White
            }
        }
    }
    "help" {
        Write-Host "SubTracker AI Project Management" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Commands:"
        Write-Host "  status    - Show current sprint"
        Write-Host "  critical  - Show critical tickets"  
        Write-Host "  list      - Count tickets by priority"
        Write-Host "  help      - This help"
        Write-Host ""
        Write-Host "Usage: ./pm-simple.ps1 [command]"
    }
    default {
        Write-Host "Unknown command. Use 'help' for options." -ForegroundColor Yellow
    }
}

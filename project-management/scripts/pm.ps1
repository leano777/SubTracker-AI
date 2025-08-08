# SubTracker AI - Project Management Script
# PowerShell utility for managing tickets and boards

param(
    [Parameter(Position=0)]
    [string]$Command,
    
    [Parameter(Position=1)]
    [string]$TicketId,
    
    [string]$Priority = "medium",
    [string]$Title = "",
    [string]$Estimate = "S",
    [string]$Tags = ""
)

# Base paths
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$PMRoot = Join-Path $ProjectRoot "project-management"
$TicketsRoot = Join-Path $PMRoot "tickets"
$BoardsRoot = Join-Path $PMRoot "boards"
$TemplateRoot = Join-Path $PMRoot "templates"

function Show-Help {
    Write-Host @"
SubTracker AI - Project Management Commands

USAGE:
    ./pm.ps1 <command> [options]

COMMANDS:
    status              - Show current sprint status
    list <priority>     - List tickets by priority (critical/high/medium/low)
    create              - Create new ticket (interactive)
    move <ticket-id>    - Move ticket between priorities
    done <ticket-id>    - Mark ticket as done
    sprint              - Show current sprint board
    backlog             - Show product backlog
    
EXAMPLES:
    ./pm.ps1 status
    ./pm.ps1 list critical
    ./pm.ps1 create -Title "Fix bug" -Priority high -Estimate M
    ./pm.ps1 move ST-001 -Priority critical
    ./pm.ps1 done ST-001

"@
}

function Get-CurrentSprint {
    $sprintPath = Join-Path $BoardsRoot "current-sprint.md"
    if (Test-Path $sprintPath) {
        Get-Content $sprintPath | Write-Host
    } else {
        Write-Host "Current sprint board not found!" -ForegroundColor Red
    }
}

function Get-TicketsByPriority {
    param([string]$Priority)
    
    $priorityPath = Join-Path $TicketsRoot $Priority.ToLower()
    if (Test-Path $priorityPath) {
        Write-Host "`n$Priority Priority Tickets:" -ForegroundColor Cyan
        Get-ChildItem $priorityPath -Filter "*.md" | ForEach-Object {
            $content = Get-Content $_.FullName | Select-Object -First 10
            $title = ($content | Where-Object { $_ -match "^# \[.*\] - " }) -replace "^# ", ""
            $status = ($content | Where-Object { $_ -match "\*\*Status\*\*:" }) -replace ".*Status\*\*:\s*", ""
            Write-Host "  • $title" -ForegroundColor White
            Write-Host "    Status: $status" -ForegroundColor Gray
        }
    } else {
        Write-Host "No tickets found for priority: $Priority" -ForegroundColor Yellow
    }
}

function New-Ticket {
    param(
        [string]$Title,
        [string]$Priority,
        [string]$Estimate,
        [string]$Tags
    )
    
    if (-not $Title) {
        $Title = Read-Host "Enter ticket title"
    }
    
    $ticketId = "ST-" + (Get-Date -Format "MMdd-HHmm")
    $fileName = "$ticketId-" + ($Title -replace "[^\w\s-]", "" -replace "\s+", "-").ToLower() + ".md"
    $priorityPath = Join-Path $TicketsRoot $Priority.ToLower()
    
    if (-not (Test-Path $priorityPath)) {
        New-Item -Path $priorityPath -ItemType Directory -Force | Out-Null
    }
    
    $filePath = Join-Path $priorityPath $fileName
    $template = Get-Content (Join-Path $TemplateRoot "ticket-template.md") -Raw
    
    $content = $template -replace "\[TICKET-ID\]", $ticketId
    $content = $content -replace "Ticket Title", $Title
    $content = $content -replace "YYYY-MM-DD", (Get-Date -Format "yyyy-MM-dd")
    $content = $content -replace "XS/S/M/L/XL/XXL", $Estimate
    $content = $content -replace "`tag1` `tag2` `tag3`", $Tags
    
    Set-Content -Path $filePath -Value $content
    
    Write-Host "`nCreated ticket: $ticketId" -ForegroundColor Green
    Write-Host "Location: $filePath" -ForegroundColor Gray
}

function Show-Status {
    Write-Host @"
🎯 SubTracker AI - Current Status

"@ -ForegroundColor Cyan
    
    Get-CurrentSprint
    
    Write-Host "`nQuick Stats:" -ForegroundColor Cyan
    foreach ($priority in @("critical", "high", "medium", "low")) {
        $count = 0
        $priorityPath = Join-Path $TicketsRoot $priority
        if (Test-Path $priorityPath) {
            $count = (Get-ChildItem $priorityPath -Filter "*.md").Count
        }
        $indicator = @{ critical="[!]"; high="[H]"; medium="[M]"; low="[L]" }[$priority]
        Write-Host "  $indicator $($priority.ToUpper()): $count tickets" -ForegroundColor White
    }
}

# Main command processing
switch ($Command.ToLower()) {
    "help" { Show-Help }
    "status" { Show-Status }
    "list" { Get-TicketsByPriority -Priority $TicketId }
    "create" { New-Ticket -Title $Title -Priority $Priority -Estimate $Estimate -Tags $Tags }
    "sprint" { Get-CurrentSprint }
    "backlog" { 
        $backlogPath = Join-Path $BoardsRoot "backlog.md"
        if (Test-Path $backlogPath) { Get-Content $backlogPath | Write-Host }
        else { Write-Host "Backlog not found!" -ForegroundColor Red }
    }
    default { 
        Write-Host "Unknown command: $Command`n" -ForegroundColor Red
        Show-Help 
    }
}

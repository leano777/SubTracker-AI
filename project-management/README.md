# SubTracker AI - Project Management System

## Overview
This directory contains a comprehensive ticketing and project board system designed for solo development with AI assistance (Claude + Warp).

## Structure
```
project-management/
├── README.md                 # This file
├── tickets/                  # Individual ticket files
│   ├── critical/            # Critical priority tickets
│   ├── high/                # High priority tickets  
│   ├── medium/              # Medium priority tickets
│   └── low/                 # Low priority tickets
├── boards/                  # Project boards
│   ├── current-sprint.md    # Current active sprint
│   ├── backlog.md          # Product backlog
│   ├── done.md             # Completed items
│   └── icebox.md           # Future considerations
├── templates/               # Ticket templates
└── scripts/                # Management scripts

## Priority Levels
- **🔴 Critical**: Blocking issues, security vulnerabilities, deployment failures
- **🟠 High**: Core features, performance issues, user experience problems  
- **🟡 Medium**: Enhancement features, optimization, refactoring
- **🟢 Low**: Nice-to-have features, documentation, minor improvements

## Tags System
- `bug` - Something is broken
- `feature` - New functionality
- `enhancement` - Improvement to existing functionality
- `refactor` - Code restructuring
- `docs` - Documentation
- `deploy` - Deployment related
- `test` - Testing related
- `perf` - Performance related
- `ui/ux` - User interface/experience
- `backend` - Backend/API work
- `frontend` - Frontend work
- `mobile` - Mobile specific
- `security` - Security related

## Time Estimates (Solo Development)
- **XS**: 0.5-1 hour
- **S**: 1-3 hours  
- **M**: 3-8 hours (half day)
- **L**: 1-2 days
- **XL**: 2-5 days
- **XXL**: 1+ weeks

## Workflow
1. Create tickets using templates in `templates/`
2. Place tickets in appropriate priority folders
3. Move tickets through boards: Backlog → Current Sprint → Done
4. Update status and add notes as you progress
5. Review completed work and plan next sprint

## Quick Commands
- View current sprint: `cat boards/current-sprint.md`
- List critical tickets: `ls tickets/critical/`
- Add new ticket: Copy from `templates/ticket-template.md`

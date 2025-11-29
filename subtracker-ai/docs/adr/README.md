# Architectural Decision Records (ADRs)

This directory contains Architectural Decision Records (ADRs) for the SubTracker AI project. ADRs are documents that capture important architectural decisions along with their context and consequences.

## ADR Format

We follow the standard ADR format:

- **Title**: Short descriptive title
- **Status**: Proposed, Accepted, Deprecated, Superseded
- **Context**: What is the issue that we're seeing that is motivating this decision or change?
- **Decision**: What is the change that we're proposing and/or doing?
- **Consequences**: What becomes easier or more difficult to do because of this change?

## List of ADRs

| ADR | Title | Status | Date |
|-----|-------|---------|------|
| [ADR-001](./001-state-management-approach.md) | State Management Approach | Accepted | 2024-12-19 |
| [ADR-002](./002-component-architecture.md) | Component Architecture Pattern | Accepted | 2024-12-19 |
| [ADR-003](./003-data-synchronization.md) | Data Synchronization Strategy | Accepted | 2024-12-19 |
| [ADR-004](./004-testing-strategy.md) | Testing Strategy and Tools | Accepted | 2024-12-19 |
| [ADR-005](./005-ui-framework-choice.md) | UI Framework and Styling Approach | Accepted | 2024-12-19 |

## Creating New ADRs

1. Copy the template from `template.md`
2. Name the file with the next sequential number: `XXX-descriptive-title.md`
3. Fill in all sections
4. Create a PR for review
5. Update this README with the new ADR entry

## ADR Lifecycle

- **Proposed**: The ADR is under discussion
- **Accepted**: The ADR has been approved and should be followed
- **Deprecated**: The ADR is no longer relevant but kept for historical context
- **Superseded**: The ADR has been replaced by a newer ADR

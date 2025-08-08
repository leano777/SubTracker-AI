# [TICKET-002] PaymentCard Form Missing Required Properties

**Priority:** P0 - Critical  
**Status:** Identified  
**Assignee:** Unassigned  
**Estimated:** 2 hours  
**Sprint:** Interface Standardization & Build Fixes  

## Description
PaymentCard forms are missing required properties, specifically the `isDefault` boolean, causing form submission failures and TypeScript errors.

## Problem Statement
The PaymentCardForm and ManageCards components are creating PaymentCard objects that don't include all required properties defined in the PaymentCard interface. This is causing type errors and potential runtime issues when forms are submitted.

**Current Error Examples:**
```
Property 'isDefault' is missing in type '{ nickname: string; lastFour: string; type: "credit" | "debit" | "other"; issuer: string; color: string; }' but required in type 'Omit<PaymentCard, "id" | "dateAdded">'
```

## Files Affected
- `src/components/PaymentCardForm.tsx` (lines 144, 147) - onSave callback missing isDefault
- `src/components/ManageCards.tsx` (lines 210, 213) - onAddCard callback missing isDefault
- `src/types/subscription.ts` (line 75) - PaymentCard interface definition

## Acceptance Criteria
- [ ] PaymentCard forms include all required properties (especially `isDefault`)
- [ ] Form validation handles missing properties gracefully
- [ ] Default values properly set for new cards (isDefault: false by default)
- [ ] Existing card editing preserves isDefault value
- [ ] No TypeScript errors in form submission

## Implementation Notes

### Approach:
1. **Update form data interfaces** to include `isDefault` property
2. **Set sensible defaults** for new card creation (isDefault: false)
3. **Add form fields** if user needs to set a card as default during creation
4. **Update form validation** to ensure required properties are present

### Code Changes Needed:

**PaymentCardForm.tsx:**
```typescript
// Update form data interface
interface CardFormData {
  nickname: string;
  lastFour: string;
  type: "credit" | "debit" | "other";
  issuer: string;
  color: string;
  isDefault?: boolean; // Add this
}

// Update onSave call
onSave({
  ...formData,
  nickname: formData.nickname.trim(),
  lastFour: formData.lastFour.trim(),
  isDefault: formData.isDefault || false, // Provide default
});
```

### Additional Considerations:
- Consider adding UI toggle for "Set as default card" during creation
- Ensure only one card can be default at a time
- Update existing card editing to show/modify default status

## Dependencies
- None

## Testing Requirements
- [ ] Test new card creation with default isDefault value
- [ ] Test card editing preserves existing isDefault status
- [ ] Verify form validation works correctly
- [ ] Test setting/unsetting default card status
- [ ] Manual testing of card management workflow

## Definition of Done
- [ ] Code complete - all required properties included in forms
- [ ] Tests passing - no TypeScript compilation errors
- [ ] Form submission works without runtime errors
- [ ] Default values set appropriately for new cards
- [ ] UI handles default card logic correctly

---

**Created:** 2025-01-07  
**Updated:** 2025-01-07  
**Completed:** (Not Started)

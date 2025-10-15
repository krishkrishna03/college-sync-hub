# Subject Field Behavior Guide

## When Subject Field Appears

### Practice Tests ✅
- **Subject field is VISIBLE**
- Required to select: Verbal, Reasoning, Technical, Arithmetic, or Communication
- Single section test format
- Questions are organized by the selected subject

### Assessment Tests ❌
- **Subject field is HIDDEN**
- Not needed because each section can cover different topics
- Multi-section format allows mixing topics
- Example: Section 1 (Verbal) + Section 2 (Technical)

### Mock Tests ❌
- **Subject field is HIDDEN**
- Multi-section format
- Simulates real exam with multiple topic areas

### Specific Company Tests ❌
- **Subject field is HIDDEN**
- Multi-section format
- Company-specific tests typically cover multiple areas

### Assignment Tests ✅
- **Subject field is VISIBLE**
- Standard single-section format
- Subject selection required

## Visual Indicators

### Test Type Dropdown Order
1. **Test Name** (always first)
2. **Test Type** (always second)
3. **Subject** (appears ONLY if Test Type = "Practice" or "Assignment")
4. **Company Name** (appears ONLY if Test Type = "Specific Company Test")

### Layout Example - Practice Test
```
┌─────────────────────────────────────┐
│ Test Name:     [_______________]    │
│ Test Type:     [Practice ▼]         │
│ Subject:       [Technical ▼]        │  ← Visible
│ Description:   [_______________]    │
└─────────────────────────────────────┘
```

### Layout Example - Assessment Test
```
┌─────────────────────────────────────┐
│ Test Name:     [_______________]    │
│ Test Type:     [Assessment ▼]       │
│                                     │  ← Subject field hidden
│ Description:   [_______________]    │
│                                     │
│ ┌─ Multi-Section Configuration ─┐  │
│ │ This test type requires       │  │
│ │ multiple sections             │  │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## Implementation Details

### Default Values
- **Practice/Assignment**: Subject field shows with user selection
- **Assessment/Mock/Company**: Subject automatically set to "Technical" (hidden from UI)

### Why This Design?
1. **Practice Tests**: Need subject categorization for focused practice
2. **Multi-Section Tests**: Each section defines its own topic area, making a single subject field redundant
3. **User Experience**: Cleaner interface - only show relevant fields
4. **Flexibility**: Assessment tests can cover multiple subjects in different sections

## Database Storage
- **Practice Tests**: `subject` field contains selected subject
- **Multi-Section Tests**: `subject` field is null or default value (not used)
- **Section-specific**: Each section in multi-section tests can implicitly cover different topics through section names

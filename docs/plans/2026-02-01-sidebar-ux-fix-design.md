# Sidebar UX Fix Design

**Date:** 2026-02-01
**Status:** Approved
**File:** `src/components/chat/AdvancedChatInterface.tsx`

## Problem

Users reported three UX issues with the conversation sidebar:
1. Can't see full conversation titles (text truncated unpredictably)
2. Can't find the delete button (only visible on hover, not discoverable)
3. Misclicks between title and delete button (insufficient spacing)

## Solution

### 1. Increase Sidebar Width

**Change:** `w-64` (256px) → `w-[280px]`

Update both:
- Outer container: `className={...sidebarOpen ? 'w-[280px]' : 'w-0'...}`
- Inner div: `className="w-[280px] h-full flex flex-col"`

### 2. Predictable Title Truncation

**Character limit:** 30 characters

Create utility function:
```typescript
const truncateTitle = (title: string, maxLength: number = 30): string => {
  if (title.length <= maxLength) return title;
  return title.slice(0, maxLength).trimEnd() + '...';
};
```

Usage:
```tsx
<p className="font-medium">{truncateTitle(conversation.title)}</p>
```

Remove the CSS `truncate` class since we're handling truncation manually.

### 3. Tooltip for Full Title

Wrap conversation button in shadcn Tooltip (only when title exceeds limit):

```tsx
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

// Only show tooltip if title is truncated
{conversation.title.length > 30 ? (
  <Tooltip>
    <TooltipTrigger asChild>
      <button ...>{truncateTitle(conversation.title)}</button>
    </TooltipTrigger>
    <TooltipContent side="right">
      <p className="max-w-[300px]">{conversation.title}</p>
    </TooltipContent>
  </Tooltip>
) : (
  <button ...>{conversation.title}</button>
)}
```

### 4. Delete Button Spacing

- Add `ml-2` margin-left for clear separation
- Increase padding from `p-1.5` to `p-2` for larger hit area

```tsx
<button className="p-2 ml-2 opacity-0 group-hover:opacity-100 ...">
  <Trash2 className="w-3.5 h-3.5" />
</button>
```

## Files to Modify

1. `src/components/chat/AdvancedChatInterface.tsx`
   - Add `truncateTitle` utility function
   - Update sidebar width classes
   - Add Tooltip import and wrapper
   - Update delete button spacing

## Testing

1. Create conversation with long title (40+ characters)
2. Verify title truncates at 30 characters with ellipsis
3. Hover over truncated title → tooltip shows full text
4. Hover over short title → no tooltip
5. Click delete button → no accidental title selection
6. Verify sidebar toggle still works correctly

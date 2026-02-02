# Chat Interface Refactor Plan

**Date:** 2026-02-01
**Status:** Ready for implementation
**File:** `src/components/chat/AdvancedChatInterface.tsx`

---

## Overview

Refactor the AdvancedChatInterface component to improve code organization, reduce duplication, and enhance maintainability after mobile optimization changes.

---

## Tasks

### Task 1: Extract Touch Target Constant
**Effort:** ~5 min | **Priority:** Medium

Extract the repeated responsive touch target classes to a constant.

**Current (repeated 8+ times):**
```typescript
className="... min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 ..."
```

**Target:**
```typescript
// At top of file with other constants
const TOUCH_TARGET_CLASSES = "min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center";

// Usage
className={`p-2 ${TOUCH_TARGET_CLASSES} ...`}
```

---

### Task 2: Fix Hardcoded User Avatar Initial
**Effort:** ~5 min | **Priority:** Low

Derive the user avatar initial from actual user data instead of hardcoded "Y".

**Current:**
```typescript
<div className="...">Y</div>
```

**Target:**
```typescript
<div className="...">{user?.email?.[0]?.toUpperCase() || 'U'}</div>
```

**Note:** Will need to pass `user` as prop to `MessageBubble` component.

---

### Task 3: Extract MessageAvatar Component
**Effort:** ~10 min | **Priority:** Low

Create a reusable avatar component for messages.

**Target:**
```typescript
interface MessageAvatarProps {
  isUser: boolean;
  isMobile: boolean;
  userInitial?: string;
}

const MessageAvatar = ({ isUser, isMobile, userInitial = 'U' }: MessageAvatarProps) => {
  if (isUser) {
    return (
      <div className="w-6 h-6 md:w-7 md:h-7 rounded-lg flex-shrink-0 flex items-center justify-center bg-rezzy-ink text-white text-[10px] md:text-xs font-medium">
        {userInitial}
      </div>
    );
  }
  return (
    <div className="w-6 h-6 md:w-7 md:h-7 flex-shrink-0">
      <RezzyLogo size={isMobile ? 24 : 28} />
    </div>
  );
};
```

---

### Task 4: Extract ConversationListItem Component
**Effort:** ~20 min | **Priority:** Medium

Extract the conversation item rendering (currently 60+ lines) into its own component.

**Target:**
```typescript
interface ConversationListItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const ConversationListItem = ({
  conversation,
  isSelected,
  onSelect,
  onDelete
}: ConversationListItemProps) => {
  const isTruncated = conversation.title.length > TITLE_MAX_LENGTH;
  const displayTitle = truncateTitle(conversation.title);

  // ... rest of the conversation item JSX
};
```

**Benefits:**
- Cleaner map callback
- Easier to test in isolation
- Better separation of concerns

---

### Task 5: Extract StreamingMessage Component
**Effort:** ~15 min | **Priority:** Medium

Extract the streaming message rendering into a dedicated component that mirrors MessageBubble structure.

**Target:**
```typescript
interface StreamingMessageProps {
  streamingState: StreamingState;
  isMobile: boolean;
}

const StreamingMessage = ({ streamingState, isMobile }: StreamingMessageProps) => {
  if (!streamingState.streamingMessage) return null;

  return (
    <div className="py-4 md:py-6">
      {/* ... streaming message JSX */}
    </div>
  );
};
```

---

### Task 6: Add React.memo to Sub-Components
**Effort:** ~5 min | **Priority:** Low

Wrap extracted components with React.memo to prevent unnecessary re-renders during streaming.

**Target:**
```typescript
const MessageBubble = React.memo(({ ... }: MessageBubbleProps) => { ... });
const MessageAvatar = React.memo(({ ... }: MessageAvatarProps) => { ... });
const ConversationListItem = React.memo(({ ... }: ConversationListItemProps) => { ... });
const FunctionCallDisplay = React.memo(({ ... }: FunctionCallDisplayProps) => { ... });
```

---

## Implementation Order

1. **Task 1:** Extract touch target constant (foundation for cleaner classes)
2. **Task 3:** Extract MessageAvatar component
3. **Task 2:** Fix hardcoded user initial (requires MessageAvatar)
4. **Task 5:** Extract StreamingMessage component
5. **Task 4:** Extract ConversationListItem component
6. **Task 6:** Add React.memo wrappers

---

## Testing Checklist

After each task:
- [ ] TypeScript compiles (`npx tsc --noEmit`)
- [ ] Lint passes (`npm run lint`)
- [ ] Visual check on desktop
- [ ] Visual check on mobile (Chrome DevTools)
- [ ] Sidebar interactions work
- [ ] Message streaming works
- [ ] File attachments work

---

## Files Modified

- `src/components/chat/AdvancedChatInterface.tsx` (main refactor)

No new files needed - all components stay in the same file to maintain colocation.

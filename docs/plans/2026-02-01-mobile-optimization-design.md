# Mobile Optimization Design for AI Copilot

**Date:** 2026-02-01
**Status:** Draft
**Goal:** Make the AI chat feel native and optimized for mobile devices

---

## Overview

Transform the AI copilot from a desktop-first experience to a mobile-native experience that feels like a dedicated app. Key principles:

- **Mobile-first responsive design**
- **Touch-optimized interactions** (44px minimum targets)
- **Native-feeling animations and gestures**
- **Safe area handling** for modern devices
- **Keyboard-aware input** that doesn't break layout

---

## 1. Responsive Sidebar → Mobile Drawer

### Current State
- Fixed 280px sidebar, no mobile handling
- Starts open by default

### Mobile Solution
- Use shadcn `Sheet` component for mobile (slides from left)
- Auto-close sidebar on mobile when conversation selected
- Default to closed on mobile, open on desktop
- Add swipe-to-open gesture from left edge

### Implementation
```tsx
// Detect mobile
const isMobile = useIsMobile(); // from @/hooks/use-mobile

// Default sidebar state based on device
const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

// Mobile: Sheet overlay | Desktop: Fixed sidebar
{isMobile ? (
  <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
    <SheetContent side="left" className="w-[280px] p-0">
      <SidebarContent />
    </SheetContent>
  </Sheet>
) : (
  <div className={`${sidebarOpen ? 'w-[280px]' : 'w-0'} ...`}>
    <SidebarContent />
  </div>
)}
```

### Auto-close on selection (mobile)
```tsx
const handleSelectConversation = (id: string) => {
  selectConversation(id);
  if (isMobile) setSidebarOpen(false);
};
```

---

## 2. Touch-Optimized Targets

### Minimum Sizes (Apple HIG: 44pt)
| Element | Current | Target |
|---------|---------|--------|
| Delete button | ~28px | 44px |
| Header buttons | ~32px | 44px |
| Send button | 48px | 48px ✓ |
| New conversation (+) | 32px | 44px |

### Implementation
```tsx
// Mobile-friendly button sizes
className="p-2 md:p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
```

### Delete button (sidebar)
- Keep icon small (visual), increase touch area
- Always visible on mobile (no hover state)
```tsx
<button className="p-3 md:p-2 md:opacity-0 md:group-hover:opacity-100 ...">
  <Trash2 className="w-4 h-4" />
</button>
```

---

## 3. Responsive Header

### Current Issues
- "Reasoning visible" text overflows on mobile
- Multiple buttons crowd the space

### Mobile Solution
- Hide "Reasoning visible" text on mobile (keep icon indicator)
- Use icon-only buttons on mobile
- Add `sr-only` labels for accessibility

```tsx
<div className="h-14 px-3 md:px-4 flex items-center gap-2 md:gap-3 ...">
  {/* Menu button */}
  <button className="p-2 min-h-[44px] min-w-[44px] ...">
    {sidebarOpen && !isMobile ? <ChevronLeft /> : <Menu />}
  </button>

  {/* Logo - smaller on mobile */}
  <div className="flex items-center gap-1.5 md:gap-2">
    <RezzyLogo size={isMobile ? 24 : 28} />
    <span className="font-display font-semibold text-rezzy-ink text-sm md:text-base">
      Rezzy
    </span>
  </div>

  {/* Actions */}
  <div className="ml-auto flex items-center gap-1">
    {/* Hide text on mobile */}
    {streamingState.showReasoning && (
      <span className="hidden md:inline text-xs text-rezzy-ink-light mr-2">
        Reasoning visible
      </span>
    )}

    {/* Buttons with mobile-friendly touch targets */}
    <button className="p-2 min-h-[44px] min-w-[44px] rounded-lg ...">
      <Brain className="w-5 h-5" />
    </button>
  </div>
</div>
```

---

## 4. Mobile-Optimized Messages Area

### Responsive Padding
```tsx
<div className="max-w-3xl mx-auto py-4 md:py-8 px-3 md:px-4">
```

### Smaller Avatars on Mobile
```tsx
<div className="w-6 h-6 md:w-7 md:h-7 flex-shrink-0">
  <RezzyLogo size={isMobile ? 24 : 28} />
</div>
```

### Welcome State Adjustments
```tsx
<div className="px-4 py-8 md:py-16 text-center">
  <RezzyLogo size={isMobile ? 48 : 56} />
  <h2 className="text-lg md:text-xl font-display ...">How can I help?</h2>
</div>
```

---

## 5. Mobile Input Area with Safe Area

### Safe Area Handling
For devices with home indicators (iPhone X+), add padding:

```tsx
<div className="border-t border-rezzy-cream-deep bg-white pb-safe">
  {/* pb-safe is a custom utility or use env(safe-area-inset-bottom) */}
```

### Add to Tailwind config:
```js
// tailwind.config.js
theme: {
  extend: {
    padding: {
      'safe': 'env(safe-area-inset-bottom)',
    },
  },
}
```

### Or use inline style:
```tsx
<div
  className="border-t border-rezzy-cream-deep bg-white"
  style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
>
```

### Responsive Input Layout
```tsx
<div className="max-w-3xl mx-auto p-3 md:p-4">
  <div className="flex items-end gap-2 md:gap-3">
    <div className="flex-1 relative">
      <Textarea
        className="min-h-[44px] md:min-h-[48px] ... pr-11 md:pr-12
                   text-base" // text-base prevents iOS zoom on focus
        rows={1}
      />
      {/* Attachment button inside textarea */}
      <button className="absolute right-1.5 bottom-1.5 p-2 min-h-[40px] min-w-[40px] ...">
        <Paperclip className="w-5 h-5" />
      </button>
    </div>

    {/* Send button */}
    <Button className="h-11 w-11 md:h-12 md:w-12 rounded-full p-0 ...">
      <Send className="w-5 h-5" />
    </Button>
  </div>
</div>
```

### Prevent iOS Input Zoom
Add `text-base` (16px) to textarea to prevent iOS auto-zoom on focus:
```tsx
className="text-base ..." // 16px minimum prevents zoom
```

---

## 6. Viewport Meta Tag

Ensure proper mobile viewport in `index.html`:

```html
<meta
  name="viewport"
  content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1"
/>
```

- `viewport-fit=cover`: Allows content to extend into safe areas
- `maximum-scale=1`: Prevents unwanted zoom (optional, accessibility tradeoff)

---

## 7. File Attachments on Mobile

### Responsive Chips
```tsx
<div className="mb-2 md:mb-3 flex flex-wrap gap-1.5 md:gap-2">
  {selectedFiles.map((file, index) => (
    <div className="flex items-center gap-1.5 bg-rezzy-cream rounded-full
                    px-2.5 py-1 md:px-3 md:py-1.5 text-xs md:text-sm ...">
      <Paperclip className="w-3 h-3" />
      <span className="truncate max-w-[100px] md:max-w-[120px]">{file.name}</span>
      <button className="p-1 min-h-[24px] min-w-[24px] ...">×</button>
    </div>
  ))}
</div>
```

---

## 8. PWA Enhancements (Optional, Future)

For true app-like feel, consider adding:

### Web App Manifest
```json
{
  "name": "Rezzy",
  "short_name": "Rezzy",
  "start_url": "/ai-copilot",
  "display": "standalone",
  "theme_color": "#ffffff",
  "background_color": "#ffffff"
}
```

### iOS Standalone Mode
```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
```

---

## Implementation Phases

### Phase 1: Core Mobile Layout (Priority)
1. Add `useIsMobile` hook usage
2. Convert sidebar to Sheet on mobile
3. Auto-close sidebar on conversation select
4. Default sidebar closed on mobile

### Phase 2: Touch Optimization
5. Increase touch targets to 44px minimum
6. Show delete button always on mobile (no hover)
7. Responsive header with icon-only on mobile

### Phase 3: Input & Safe Areas
8. Add safe area padding for input
9. Prevent iOS input zoom (text-base)
10. Responsive input sizing

### Phase 4: Polish
11. Responsive message area padding/avatars
12. Responsive welcome state
13. Responsive file attachment chips

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/chat/AdvancedChatInterface.tsx` | Main mobile adaptations |
| `src/index.html` | Viewport meta tag |
| `tailwind.config.ts` | Safe area utilities (optional) |

---

## Testing Checklist

- [ ] iPhone SE (small screen, 375px)
- [ ] iPhone 14 Pro (notch + dynamic island)
- [ ] iPad (tablet breakpoint)
- [ ] Android device
- [ ] Chrome DevTools mobile emulation
- [ ] Safari iOS (real device preferred)
- [ ] Keyboard open/close behavior
- [ ] Landscape orientation
- [ ] Pull-down refresh doesn't break layout

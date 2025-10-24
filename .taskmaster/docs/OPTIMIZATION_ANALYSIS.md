# JW Extractor - Simple Bug Fix Plan

## 🐛 The Bug

**Problem 1:** Extraction fails and you have to manually retry 2-3 times  
**Problem 2:** Error messages don't tell you what actually failed

## ✅ The Fix

Add automatic retries with better error messages. That's it.

---

## 🔍 Root Cause Analysis

### Why Manual Retries Work

Current code does this:
```
Try once → If fails, show generic error → User clicks Extract again
```

Why does it work the 2nd or 3rd time?
- **Network timing:** First connection might timeout, second succeeds
- **Rate limiting:** jw.org might throttle first request, allows second
- **Dynamic content:** Page finishes loading on subsequent requests
- **Random variance:** Network conditions improve

### What's Missing

1. **No automatic retry** - Just tries once then gives up
2. **No error details** - Can't tell if it's network, parsing, or conversion
3. **No fallback parsing** - If selector fails, entire extraction fails

---

## 🛠️ The Solution (5 Tasks)

### Task 42: Enhanced Error Types (~1 hour)
**Problem:** Only 3 error types (INVALID_URL, CONTENT_NOT_FOUND, NETWORK_ERROR)  
**Solution:** Add specific types

```typescript
// Add these to src/lib/types.ts
type ErrorType = 
  | 'INVALID_URL'
  | 'FETCH_ERROR'      // Network connection failed
  | 'TIMEOUT_ERROR'    // Request timed out
  | 'PARSE_ERROR'      // HTML parsing failed
  | 'CONVERSION_ERROR' // Markdown conversion failed
  | 'CONTENT_NOT_FOUND'
  | 'NETWORK_ERROR';

// Add optional context
interface ExtractionResult {
  // ... existing fields
  error?: {
    type: ErrorType;
    message: string;
    stage?: 'fetch' | 'parse' | 'convert';
    attemptNumber?: number;
    timing?: number;
  };
}
```

**Files:** `src/lib/types.ts`  
**Lines:** ~20 lines added

---

### Task 43: Simple Logging (~1 hour)
**Problem:** No visibility into what's happening  
**Solution:** Add console logs

```typescript
// New file: src/lib/extraction/logger.ts
export const logger = {
  info: (msg: string, data?: any) => console.log(`[INFO] ${msg}`, data),
  error: (msg: string, data?: any) => console.error(`[ERROR] ${msg}`, data),
  time: (label: string) => console.time(label),
  timeEnd: (label: string) => console.timeEnd(label),
};
```

**Files:** New file `src/lib/extraction/logger.ts`  
**Lines:** ~40 lines

---

### Task 44: Retry Handler (~3-4 hours)
**Problem:** No automatic retry  
**Solution:** Retry up to 3 times with delays

```typescript
// New file: src/lib/extraction/retry-handler.ts
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delays = [1000, 2000, 4000] // 1s, 2s, 4s
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on permanent errors
      if (isPermanentError(error)) throw error;
      
      // Wait before retry (except on last attempt)
      if (attempt < maxAttempts) {
        await sleep(delays[attempt - 1]);
      }
    }
  }
  
  throw lastError;
}
```

**Files:** New file `src/lib/extraction/retry-handler.ts`  
**Lines:** ~80 lines

---

### Task 45: Fallback Selectors (~1-2 hours)
**Problem:** If `#content.content` fails, extraction fails  
**Solution:** Try multiple selectors

```typescript
// In src/app/actions/extract-content.ts
const selectors = [
  '#content.content',  // Current
  '#content',          // Without class
  'article',           // Article tag
];

let contentDiv = null;
let usedSelector = '';

for (const selector of selectors) {
  contentDiv = $(selector);
  if (contentDiv.length) {
    usedSelector = selector;
    logger.info(`Content found with selector: ${selector}`);
    break;
  }
}

if (!contentDiv || !contentDiv.length) {
  // All selectors failed
  return error...
}
```

**Files:** `src/app/actions/extract-content.ts`  
**Lines:** ~30 lines changed

---

### Task 46: Integration (~4-5 hours)
**Problem:** Need to connect all the pieces  
**Solution:** Update main extraction function

**Changes in `src/app/actions/extract-content.ts`:**
```typescript
import { withRetry } from '@/lib/extraction/retry-handler';
import { logger } from '@/lib/extraction/logger';

export async function extractContent(url: string): Promise<ExtractionResult> {
  // Wrap entire extraction in retry handler
  return withRetry(async () => {
    logger.time('extraction');
    
    try {
      // ... existing validation
      
      logger.time('fetch');
      const response = await fetch(url, ...);
      logger.timeEnd('fetch');
      
      logger.time('parse');
      // ... parsing with fallback selectors (from Task 45)
      logger.timeEnd('parse');
      
      logger.time('convert');
      // ... markdown conversion with try-catch
      logger.timeEnd('convert');
      
      logger.timeEnd('extraction');
      return { success: true, ... };
      
    } catch (error) {
      // Enhanced error handling with new error types
      return {
        success: false,
        error: {
          type: determineErrorType(error),
          message: getErrorMessage(error),
          stage: currentStage,
          attemptNumber: currentAttempt,
        }
      };
    }
  });
}
```

**Changes in `src/lib/markdown-converter.ts`:**
```typescript
export function convertHtmlToMarkdown(html: string): string {
  try {
    // Existing conversion logic
    return turndownService.turndown(html);
  } catch (error) {
    logger.error('Markdown conversion failed, using fallback', error);
    
    // Fallback: just strip HTML tags
    return html.replace(/<[^>]*>/g, '').trim();
  }
}
```

**Changes in `src/app/page.tsx`:**
```typescript
// Show retry status
{isLoading && (
  <p className="text-sm text-muted-foreground">
    {extractionStatus || 'Extracting...'}
  </p>
)}
```

**Files:** 3 files modified  
**Lines:** ~150 lines changed

---

## 📊 Summary

| Task | Complexity | Time | Files | Lines |
|------|-----------|------|-------|-------|
| 42 - Error Types | Low | 1h | 1 | 20 |
| 43 - Logging | Low | 1h | 1 new | 40 |
| 44 - Retry | Medium | 3-4h | 1 new | 80 |
| 45 - Fallbacks | Low | 1-2h | 1 | 30 |
| 46 - Integration | Medium-High | 4-5h | 3 | 150 |
| **TOTAL** | **Medium** | **10-13h** | **6 files** | **~320 lines** |

**Estimated time:** 1-2 days of focused work

---

## 🎯 Expected Results

### Before
```
Click Extract
  ↓
❌ Error: "An unexpected error occurred"
  ↓
Click Extract again
  ↓
❌ Error: "An unexpected error occurred"
  ↓
Click Extract again
  ↓
✅ Success!
```

### After
```
Click Extract
  ↓
⏳ Extracting... (Attempt 1 of 3)
  ↓
⚠️ Timeout error during fetch stage
⏳ Retrying in 1 second... (Attempt 2 of 3)
  ↓
✅ Success! (Total time: 3.2s)

Console shows:
[INFO] fetch: 2100ms
[INFO] parse: 300ms
[INFO] Content found with selector: #content.content
[INFO] convert: 500ms
[INFO] extraction: 2900ms total
```

---

## 🚀 Getting Started

```bash
# See next task
task-master next

# View task details
task-master show 42

# Start working
task-master set-status --id=42 --status=in-progress

# Mark complete
task-master set-status --id=42 --status=done
```

---

## 🎓 Implementation Order

**Step 1:** Task 42 (Error Types) - Required for everything else  
**Step 2:** Task 43 (Logging) - Helps debug the rest  
**Step 3:** Tasks 44 & 45 in parallel - Independent of each other  
**Step 4:** Task 46 (Integration) - Ties everything together  

---

## ✅ Success Criteria

- [ ] Automatic retry works (max 3 attempts)
- [ ] Error messages specify what failed (fetch/parse/convert)
- [ ] Console logs show timing for each stage
- [ ] Fallback selectors work if primary fails
- [ ] UI shows "Retrying..." message
- [ ] Success rate improves to 90%+ on first automatic attempt

---

## 🚫 What's NOT Included

This is a focused bug fix. These are explicitly out of scope:
- ❌ Caching (can add later)
- ❌ Analytics/metrics
- ❌ Debug panel UI
- ❌ Settings/configuration
- ❌ Adaptive timeouts
- ❌ Comprehensive tests (add incrementally)

**Why:** Keep it simple. Fix the core bug first.

---

That's it! Simple, focused, achievable in 1-2 days. 🚀

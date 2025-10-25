# JW Extractor - Simple Bug Fix Roadmap

## 🎯 The Problem
- Extraction needs 2-3 manual attempts to work
- Error messages don't tell you what actually failed
- No visibility into what's going wrong

## ✅ The Fix (5 Simple Tasks)

### Task 1: Enhanced Error Types ⏱️ ~1 hour
**What:** Add specific error types so we know what failed  
**Complexity:** Low  

**Changes:**
- Edit `src/lib/types.ts`
- Add new error types: FETCH_ERROR, TIMEOUT_ERROR, PARSE_ERROR, CONVERSION_ERROR
- Add optional fields: `stage`, `attemptNumber`, `timing`

**Why:** Right now we only have 3 generic errors. Need to know if it was network, timeout, parsing, or conversion.

---

### Task 2: Simple Logging ⏱️ ~1 hour
**What:** Add console logs to see what's happening  
**Complexity:** Low  

**Changes:**
- Create new file: `src/lib/extraction/logger.ts` (~40 lines)
- Simple console.log wrapper
- Add timing utilities

**Why:** Need visibility into extraction stages for debugging.

---

### Task 3: Retry Handler ⏱️ ~3-4 hours
**What:** Automatically retry failed extractions (max 3 attempts)  
**Complexity:** Medium  

**Changes:**
- Create new file: `src/lib/extraction/retry-handler.ts` (~80 lines)
- Implement exponential backoff: 1s, 2s, 4s delays
- Decide which errors should retry (timeout, network) vs not (invalid URL)
- Add cancellation support

**Why:** Solves the "2-3 manual attempts" problem with automatic retries.

---

### Task 4: Fallback Selectors ⏱️ ~1-2 hours
**What:** Try multiple selectors if first one fails  
**Complexity:** Low  

**Changes:**
- Edit `src/app/actions/extract-content.ts`
- Try selectors in order: `#content.content` → `#content` → `article`
- Log which one worked

**Why:** HTML structure might vary, having fallbacks increases reliability.

---

### Task 5: Integration ⏱️ ~4-5 hours
**What:** Put it all together  
**Complexity:** Medium-High  

**Changes:**
- Edit `src/app/actions/extract-content.ts` - wrap in retry handler, add logging, use new errors
- Edit `src/lib/markdown-converter.ts` - add try-catch with fallback
- Edit `src/app/page.tsx` - show "Retrying (attempt 2 of 3)..." message

**Why:** Make all the pieces work together in the actual extraction flow.

---

## 📊 Task Dependencies

```
Task 1 (Error Types)
  ↓
Task 2 (Logging) ──┐
  ↓                │
Task 3 (Retry) ────┤
  ↓                │
Task 4 (Fallback) ─┤
  ↓                ↓
Task 5 (Integration - requires all above)
```

**Can do in parallel:** Tasks 2, 3, 4 can all be built simultaneously after Task 1 is done.

---

## ⚡ Quick Start

```bash
# See what's next
task-master next

# View task details
task-master show 1

# Break into subtasks (if needed)
task-master expand --id=1

# Start working
task-master set-status --id=1 --status=in-progress

# Mark complete
task-master set-status --id=1 --status=done
```

---

## 🎯 Expected Results

**Before:**
- ❌ Fails on first try ~40% of the time
- ❌ Generic error: "An unexpected error occurred"
- ❌ Must manually retry 2-3 times
- ❌ No idea what failed (network? parsing? conversion?)

**After:**
- ✅ Succeeds on first try 90%+ (automatic retries)
- ✅ Specific error: "Timeout error during fetch stage (attempt 1 of 3)"
- ✅ Automatic retry with "Retrying in 1 second..."
- ✅ Console logs show: fetch (2.1s) → parse (0.3s) → convert (0.5s)

---

## 📝 Implementation Tips

### Task 1 is Super Quick
Just add some new strings to an enum. Takes 15 minutes.

### Task 2 is Also Easy
Just wrapper functions around console.log with timestamps. Nothing fancy.

### Task 3 is the Meaty One
This is where the actual retry logic lives. Take your time, test it well.

### Task 4 is Simple
Just a loop through an array of selectors. Very straightforward.

### Task 5 is Integration
Tie everything together. Will take longest but is mostly connecting pieces you already built.

---

## ⏱️ Timeline

**Day 1 Morning:** Tasks 1-2 (types + logging)  
**Day 1 Afternoon:** Task 3 (retry handler)  
**Day 2 Morning:** Task 4 (fallbacks)  
**Day 2 Afternoon:** Task 5 (integration + testing)  

**Total: 1-2 days of focused work**

---

## 🚫 What We're NOT Doing

This is explicitly NOT included (we can add later if needed):
- ❌ No caching system
- ❌ No analytics/metrics
- ❌ No debug panel UI
- ❌ No configuration settings
- ❌ No adaptive timeouts
- ❌ No comprehensive test suite
- ❌ No fancy status displays

**Why:** Those are all "nice to haves" but not needed to fix the core bug. Keep it simple.

---

## 📁 Files You'll Touch

### New Files (2 total)
- `src/lib/extraction/retry-handler.ts` (~80 lines)
- `src/lib/extraction/logger.ts` (~40 lines)

### Modified Files (4 total)
- `src/lib/types.ts` - Add error types
- `src/app/actions/extract-content.ts` - Main integration
- `src/lib/markdown-converter.ts` - Add try-catch
- `src/app/page.tsx` - Show retry message

**Total new code: ~120 lines**  
**Total changes: ~200 lines**

This is a small, surgical fix. Not a rewrite.

---

## ✅ Done!

That's it. 5 tasks, 1-2 days, fixes the core issue. Much simpler than the original plan!

Start with:
```bash
task-master next
```

Good luck! 🚀

# Production Build Blank Screen Fix

## Problem Summary

The TestFlight build was showing a blank screen while the local dev build worked perfectly. Root causes identified:

1. **Module-load crash**: `supabase.ts` threw an error at module load time when environment variables were missing, crashing the app before React could render
2. **SecureStore size limit**: Session tokens >2048 bytes caused silent failures
3. **Missing EAS environment variables**: Production builds didn't have Supabase credentials configured

## Fixes Applied

### 1. Lazy Supabase Initialization ✅

**File**: `src/services/supabase.ts`

**Change**: Replaced immediate initialization with lazy initialization using a Proxy pattern.

**Before**:
```typescript
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables...'); // ❌ Crashes at module load
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {...});
```

**After**:
```typescript
// Lazy initialization - only initializes when actually used
let supabaseClient: SupabaseClient | null = null;

const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseClient) {
    // Check env vars and initialize only when needed
    const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase environment variables...'); // ✅ Only throws when used
    }
    
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {...});
  }
  return supabaseClient;
};

// Proxy maintains backward compatibility
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabaseClient()[prop as keyof SupabaseClient];
  },
});
```

**Result**: App loads successfully even if env vars are missing. Error only occurs when Supabase is actually used (e.g., during authentication).

---

### 2. SecureStore Size Limit Handling ✅

**File**: `src/services/supabase.ts`

**Change**: Added chunking and AsyncStorage fallback for values >2048 bytes.

**Features**:
- Automatically chunks large values (>2048 bytes) into multiple SecureStore entries
- Falls back to AsyncStorage if chunking fails
- Seamlessly handles both chunked and non-chunked values on read
- Cleans up old chunks when storing new values

**Result**: Session tokens of any size are now stored reliably.

---

### 3. Enhanced Error Handling ✅

**File**: `src/hooks/useAuthManager.ts`

**Change**: Added specific error detection for Supabase initialization failures.

**Result**: Better error logging and graceful degradation when Supabase isn't configured.

---

## Backward Compatibility

✅ **All existing code continues to work** - The Proxy pattern ensures that `import { supabase } from './services/supabase'` works exactly as before.

✅ **No source of truth changes** - All business logic, data structures, and API contracts remain unchanged.

✅ **Type safety maintained** - TypeScript types are preserved through the Proxy.

---

## Next Steps for Production

To ensure production builds work correctly:

1. **Set EAS Environment Variables**:
   ```bash
   eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value "your_url" --environment production --visibility plaintext
   eas env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your_key" --environment production --visibility sensitive
   eas env:create --name OPENAI_API_KEY --value "your_key" --environment production --visibility sensitive
   ```

2. **Verify in `eas.json`**:
   ```json
   {
     "build": {
       "production": {
         "env": {
           "EXPO_PUBLIC_SUPABASE_URL": "$(EXPO_PUBLIC_SUPABASE_URL)",
           "EXPO_PUBLIC_SUPABASE_ANON_KEY": "$(EXPO_PUBLIC_SUPABASE_ANON_KEY)",
           "OPENAI_API_KEY": "$(OPENAI_API_KEY)"
         }
       }
     }
   }
   ```

3. **Build and Test**:
   ```bash
   eas build --platform ios --profile production --clear-cache
   ```

---

## Testing Checklist

- [x] App loads without crashing when env vars are missing
- [x] Supabase initializes correctly when env vars are present
- [x] Large session tokens (>2048 bytes) are stored correctly
- [x] Chunked values are read correctly
- [x] AsyncStorage fallback works
- [x] All existing imports continue to work
- [x] TypeScript compilation succeeds
- [x] No linter errors

---

## Files Modified

1. `src/services/supabase.ts` - Lazy initialization + SecureStore chunking
2. `src/hooks/useAuthManager.ts` - Enhanced error handling

---

**Status**: ✅ All fixes complete and tested. Ready for production build.


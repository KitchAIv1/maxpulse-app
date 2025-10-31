# Deprecated Features - MaxPulse

This document tracks features that have been deprecated or removed from MaxPulse.

---

## Activation Code Authentication System

**Deprecated:** v2.0.0 (November 2025)  
**Status:** ⚠️ System fully removed from MVP1  
**Reason:** Simplified authentication flow for exclusive Maximum 88 member access

### What Was Removed
- Activation code validation during sign-up
- `activation_codes` table usage for new users
- Sign-up flow with code entry
- Profile confirmation screen with activation data pre-population
- Real-time activation code validation API

### Replacement
**New System:** Email/password sign-in for verified Maximum 88 members
- Users sign in with pre-verified email credentials
- No public registration or activation code required
- Authentication handled via Supabase email/password
- User profiles and targets loaded from database after authentication

### Documentation
- **Old System Documentation:** [docs/technical/ACTIVATION_CODE_SYSTEM.md](technical/ACTIVATION_CODE_SYSTEM.md) (marked as deprecated)
- **New System Documentation:** [docs/technical/ui/AUTH_UI_OVERHAUL.md](technical/ui/AUTH_UI_OVERHAUL.md)

### Migration Notes
- Legacy `activation_codes` table may still exist in database for historical data
- Existing users who signed up with activation codes are unaffected
- User data stored in `app_user_profiles.onboarding_data` JSONB field for migrated users
- No breaking changes to existing user data

### Code References (Deprecated)
- `src/types/activation.ts` - TypeScript types (no longer used in MVP1)
- `src/services/ActivationCodeService.ts` - Service (if exists, deprecated)
- `src/screens/auth/SignupScreen.tsx` - Sign-up with activation code (removed)
- `src/screens/auth/ProfileConfirmationScreen.tsx` - Profile confirmation (may be deprecated)

### Database Schema (Legacy)
```sql
-- activation_codes table (legacy, may still exist for historical data)
-- No longer used for new user sign-ups as of v2.0.0
```

---

## Sign-Up Flow

**Deprecated:** v2.0.0 (November 2025)  
**Status:** ⚠️ Removed from mobile app  
**Reason:** Sign-up process moved to separate web platform

### What Was Removed
- Mobile app sign-up screen
- Account creation flow within mobile app
- "Don't have an account? Sign up" link
- Email validation during sign-up

### Replacement
**New System:** Sign-up handled on separate web platform
- Users create accounts through Maximum 88 web platform
- Mobile app only provides sign-in functionality
- Cleaner, focused mobile experience

### Code References (Deprecated)
- `src/screens/auth/SignupScreen.tsx` - Removed
- `src/components/auth/SignupForm.tsx` - Removed (if exists)

---

## Public Registration

**Deprecated:** v2.0.0 (November 2025)  
**Status:** ⚠️ Never implemented in mobile app  
**Reason:** Exclusive access model for Maximum 88 members

### What Was Never Added
- Open registration for public users
- Self-service account creation
- Email verification for public sign-ups

### Current Model
**Exclusive Access:** Only verified Maximum 88 members can access MaxPulse
- Pre-verified user accounts
- No public registration
- Email/password sign-in only

---

## Future Deprecations (Planned)

### None Currently Planned

---

**Last Updated:** November 22, 2025  
**Maintainer:** MaxPulse Development Team


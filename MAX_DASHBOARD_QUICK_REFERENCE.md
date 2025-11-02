# Max Dashboard Auth Integration - Quick Reference

**⚡ QUICK SUMMARY**: Users created in Max Dashboard need Supabase auth accounts to sign into MaxPulse app.

---

## 🎯 **What to Do**

When creating an activation code in Max Dashboard, also:

1. **Create Supabase auth user** using Admin API
2. **Generate secure password** (16+ chars)
3. **Send welcome email** with credentials
4. **Handle errors** gracefully

---

## 🔑 **Key Requirements**

- ✅ Use `SUPABASE_SERVICE_ROLE_KEY` (not anon key)
- ✅ Create auth user AFTER activation code insert
- ✅ Auto-confirm email: `email_confirm: true`
- ✅ Rollback activation code if auth creation fails
- ✅ Log everything

---

## 📂 **Files to Find in Max Dashboard**

1. Where `activation_codes` INSERT happens
2. Supabase client initialization
3. Email service configuration

---

## 🔒 **Security Checklist**

- [ ] Service role key in `.env` (never committed)
- [ ] Admin client used server-side only
- [ ] Passwords generated with `crypto.randomBytes()`
- [ ] Email sent over HTTPS
- [ ] All errors logged

---

## 📧 **Welcome Email Must Include**

- MaxPulse app download link
- Email address
- Temporary password
- Password reset link
- Support contact

---

## ✅ **Test Before Production**

1. Complete checkout in Max Dashboard
2. Check auth user created in Supabase
3. Receive welcome email
4. Sign into MaxPulse app with email/password
5. Verify profile data loads

---

## 📖 **Full Instructions**

See: `/docs/MAX_DASHBOARD_AUTH_INTEGRATION.md`

---

**Status**: Ready to implement  
**Priority**: CRITICAL - MVP1 blocker  
**Estimated Time**: 4-8 hours


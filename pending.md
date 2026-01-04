# Pending Cloud Implementation Tasks

This file lists features that need backend/cloud implementation by the developer (Aswd).

---

## ✅ VIP System - FULLY IMPLEMENTED

### Database
- ✅ `vips` table created with RLS policies
- ✅ `is_vip()` function created

### Admin Endpoints
- ✅ `POST /admin-actions/grant_vip` - Grant VIP status
- ✅ `POST /admin-actions/revoke_vip` - Remove VIP status
- ✅ `GET /admin-actions/vips` - List all VIPs

### Frontend Wiring
- ✅ ModerationPanel calls real endpoints
- ✅ VIP welcome popup on login
- ✅ VIP status shown in Messages badges

---

## ✅ Lock Site Feature - IMPLEMENTED

### Database
- ✅ `site_locks` table created with RLS policies
- ✅ Default 'global' row inserted

### Admin Endpoints
- ✅ `POST /admin-actions/lock_site` - Lock the site
- ✅ `POST /admin-actions/unlock_site` - Unlock the site
- ✅ `GET /admin-actions/site_lock_status` - Get lock status

---

## ✅ NAVI AI Bot - Live Announcements - FULLY IMPLEMENTED

### Database
- ✅ `navi_messages` table created with RLS policies

### Admin Endpoints
- ✅ `POST /admin-actions/navi_message` - Send NAVI message
- ✅ `GET /admin-actions/navi_messages` - Get NAVI message history

### Frontend Wiring
- ✅ Bot badge added to Messages.tsx
- ✅ Badge hierarchy: Creator > Bot > Admin > VIP > User
- ✅ NAVI Message dialog calls real endpoints

---

## ✅ Ban Enforcement - FULLY IMPLEMENTED

### Features
- ✅ `useBanCheck` hook checks for active bans on login
- ✅ BannedScreen component with NAVI-style design for perm bans
- ✅ Temp bans show popup + persistent banner (can still use offline features)
- ✅ Perm bans show full NAVI lockout screen
- ✅ Fake bans show "just kidding" after 5 seconds with working dismiss
- ✅ Ban check refreshes every 5 minutes

---

## ✅ Messages User Discovery - FIXED

### Database
- ✅ Added RLS policy to allow authenticated users to view profiles

### Frontend
- ✅ Users can now see other users to message
- ✅ VIP status properly fetched for message badges
- ✅ Messages app revamped with Inbox/Friends/Users tabs
- ✅ NAVI broadcasts appear in user inboxes

---

## ✅ Friends System - IMPLEMENTED

### Database
- ✅ `friends` table created with RLS policies
- ✅ Realtime enabled for friends updates

### Frontend
- ✅ Send friend requests from Messages app
- ✅ Accept/decline pending requests
- ✅ Friends tab for quick messaging
- ✅ Add friend button after reading message

---

## Notes

- All cloud features are now fully wired up!
- Leaked password protection should be enabled in Supabase dashboard (Auth > Security)
- ✅ NAVI Monitoring tab and Stats tab wired into ModerationPanel tabs

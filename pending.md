# Pending Cloud Implementation Tasks

This file lists features that need backend/cloud implementation by the developer (Aswd).

---

## VIP System

### 1. VIP Database Table
Create a `vips` table to store VIP users:
```sql
create table public.vips (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    granted_by uuid references auth.users(id),
    granted_at timestamp with time zone default now(),
    reason text,
    unique (user_id)
);

alter table public.vips enable row level security;

-- Policy: Admins can manage VIPs
create policy "Admins can manage VIPs"
on public.vips
for all
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Policy: Users can check if they are VIP
create policy "Users can check own VIP status"
on public.vips
for select
to authenticated
using (user_id = auth.uid());
```

### 2. VIP Features to Implement

#### Cloud Priority Queue
- VIPs get prioritized processing in edge functions
- Consider adding a priority field to relevant tables

#### Skip Advanced Message Check
- VIPs bypass the advanced check when messaging Aswd directly
- Add logic in the messages edge function to check VIP status

#### Check VIP Status Function
Create a security definer function:
```sql
create or replace function public.is_vip(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.vips
    where user_id = _user_id
  )
$$;
```

### 3. Admin Endpoints Needed
- `POST /admin-actions` with action `grant_vip` - Grant VIP status
- `POST /admin-actions` with action `revoke_vip` - Remove VIP status
- `GET /vip-status` - Check if current user is VIP (for UI display)

---

## Lock Site Feature

### 1. Site Lock Table
```sql
create table public.site_locks (
    id text primary key default 'global',
    is_locked boolean default false,
    lock_reason text,
    locked_at timestamp with time zone,
    locked_by uuid references auth.users(id)
);

-- Insert default row
insert into public.site_locks (id, is_locked) values ('global', false);
```

### 2. Middleware Check
Add a check at app initialization to see if site is locked and show lock screen.

---

## Notes

- All VIP functionality in the UI is currently using local state/demo mode
- Once these tables and functions are created, the frontend can be updated to use real data
- VIP badges, popups, and priority indicators are already in the UI

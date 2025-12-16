# Role-Based Access Control (RBAC) Security Issue

## Summary

The frontend application has inconsistent role-based access control (RBAC) implementation across protected routes. While the professional routes (`/professional/*`) properly verify both authentication and role, the admin routes (`/admin/*`) and structure routes (`/structure/*`) have security vulnerabilities that allow unauthorized access.

## Severity

**HIGH** - Security vulnerability that could allow unauthorized users to access restricted areas.

## Current State

### ✅ Professional Routes - Properly Protected

**Location:** `app/[locale]/professional/layout.tsx`

The professional layout correctly implements role-based access control:

- ✅ Checks authentication status
- ✅ Fetches user profile from database
- ✅ Verifies role is `'professional'`
- ✅ Redirects unauthorized users to login
- ✅ Shows loading state during verification

**Implementation:**
```typescript
// Fetches user profile to check role
const { data: userData, isLoading: isLoadingProfile } = useQuery({
  enabled: !!session?.user?.id && status === 'authenticated',
  queryFn: async () => {
    const result = await getUser(session.user.id);
    return result.profile;
  },
  queryKey: ['user-profile', session?.user?.id],
});

// Checks role and redirects if not professional
if (
  status === 'authenticated' &&
  !isLoadingProfile &&
  userData &&
  userData.role !== 'professional'
) {
  router.push('/auth/login');
}
```

### ❌ Admin Routes - Missing Role Verification

**Location:** `app/[locale]/admin/layout.tsx`

The admin layout only checks for authentication but **does not verify the admin role**:

- ✅ Checks authentication status
- ❌ **Missing:** Role verification
- ❌ **Missing:** User profile fetch
- ❌ **Missing:** Admin role check

**Current Implementation:**
```typescript
// Only checks authentication, NOT role
useEffect(() => {
  if (status === 'unauthenticated') {
    router.push('/auth/login');
  }
}, [status, router]);

// No role check - any authenticated user can access!
if (!session) {
  return null;
}
```

**Security Impact:**
- Any authenticated user (professional, structure, or regular user) can access `/admin/*` routes
- Admin-only features and data are exposed to unauthorized users
- Potential for data breaches and unauthorized modifications

### ❌ Structure Routes - No Protection

**Location:** `app/[locale]/structure/layout.tsx`

The structure layout has **no authentication or role checks**:

- ❌ **Missing:** Authentication check
- ❌ **Missing:** Role verification
- ❌ **Missing:** User profile fetch
- ❌ **Missing:** Redirect logic

**Current Implementation:**
```typescript
// No protection at all - completely open!
export default function StructureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex min-h-screen flex-col'>
      <ProfessionalNavbar />
      {/* ... */}
    </div>
  );
}
```

**Security Impact:**
- Anyone can access `/structure/*` routes without authentication
- Structure-specific features and data are publicly accessible
- Complete security bypass

## Available Tools

The codebase already has a `useRole` hook that can be used for role verification:

**Location:** `hooks/useRole.ts`

```typescript
export function useRole(): UseRoleReturn {
  return {
    isAdmin: role === 'admin',
    isProfessional: role === 'professional',
    isStructure: role === 'structure',
    isLoading,
    userId,
    // ... helper functions
  };
}
```

The `getUser` service function is also available:

**Location:** `services/auth/auth.service.ts`

```typescript
export async function getUser(userId: string) {
  const response = await fetch(`/api/auth/user/${userId}`);
  // Returns user profile with role
}
```

## Required Fixes

### 1. Fix Admin Layout (`app/[locale]/admin/layout.tsx`)

**Required Changes:**
- Add user profile fetching (similar to professional layout)
- Add admin role verification
- Redirect non-admin users to login or appropriate page
- Show loading state during verification

**Expected Behavior:**
- Only users with `role === 'admin'` can access `/admin/*` routes
- All other authenticated users are redirected
- Unauthenticated users are redirected to login

### 2. Fix Structure Layout (`app/[locale]/structure/layout.tsx`)

**Required Changes:**
- Add authentication check
- Add user profile fetching
- Add structure role verification
- Add redirect logic for unauthorized users
- Show loading state during verification

**Expected Behavior:**
- Only users with `role === 'structure'` can access `/structure/*` routes
- All other users (including authenticated non-structure users) are redirected
- Unauthenticated users are redirected to login

## Recommended Implementation Pattern

Use the professional layout as a reference implementation:

1. **Check authentication status** using `useSession()`
2. **Fetch user profile** using `getUser()` service with React Query
3. **Verify role** matches the required role for the route
4. **Redirect unauthorized users** to login or appropriate page
5. **Show loading state** while verifying authentication and role
6. **Return null** if unauthorized (prevents flash of content)

## Additional Considerations

### Server-Side Protection

**Current State:** All protection is client-side only

**Recommendation:** Consider implementing Next.js middleware for server-side route protection to prevent:
- Direct URL access bypassing client-side checks
- API route access without proper authorization
- Security vulnerabilities from client-side manipulation

**Potential Implementation:**
- Create `middleware.ts` in the root directory
- Check authentication and roles server-side
- Redirect unauthorized requests before rendering

### API Route Protection

Ensure all API routes (`app/api/*`) also verify roles server-side, as client-side protection can be bypassed.

## Testing Checklist

After implementing fixes, verify:

- [ ] Unauthenticated users cannot access `/admin/*` routes
- [ ] Unauthenticated users cannot access `/structure/*` routes
- [ ] Authenticated non-admin users cannot access `/admin/*` routes
- [ ] Authenticated non-structure users cannot access `/structure/*` routes
- [ ] Authenticated admin users can access `/admin/*` routes
- [ ] Authenticated structure users can access `/structure/*` routes
- [ ] Authenticated professional users can access `/professional/*` routes
- [ ] Loading states display correctly during verification
- [ ] Redirects work correctly for unauthorized users
- [ ] No flash of unauthorized content before redirect

## Related Files

- `app/[locale]/admin/layout.tsx` - Admin layout (needs fix)
- `app/[locale]/structure/layout.tsx` - Structure layout (needs fix)
- `app/[locale]/professional/layout.tsx` - Professional layout (reference implementation)
- `hooks/useRole.ts` - Role checking hook (available tool)
- `services/auth/auth.service.ts` - User fetching service (available tool)

## Priority

**HIGH** - This is a security vulnerability that should be addressed immediately to prevent unauthorized access to sensitive areas of the application.

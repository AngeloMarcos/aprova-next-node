# Authentication Flow

## Overview
The application uses Supabase Auth for authentication with JWT tokens. Currently, authentication is not fully implemented in the UI, but the database structure supports it.

---

## Authentication Architecture

### Current State
- ✅ Database tables created (usuarios, empresas)
- ✅ RLS policies enabled on all tables
- ✅ Supabase client configured
- ⚠️ No login/signup UI implemented
- ⚠️ No AuthContext provider
- ⚠️ No protected routes

### What Needs to Be Implemented

1. **Auth UI Pages**
   - Login page (`/auth/login`)
   - Signup page (`/auth/signup`)
   - Password reset page (`/auth/reset`)

2. **Auth Context Provider**
   - Manage user session state
   - Handle login/logout
   - Provide user info to components

3. **Protected Routes**
   - Redirect unauthenticated users to login
   - Preserve requested URL for post-login redirect

4. **Multi-tenant Setup**
   - Store `empresa_id` in JWT token
   - Filter all queries by company
   - Validate company ownership

---

## Recommended Implementation

### 1. Create Auth Context

```typescript
// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, userData: any) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

### 2. Create Login Page

```typescript
// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { FormInput } from '@/components/form';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signIn(email, password);
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Login</h1>
        <FormInput
          name="email"
          label="E-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <FormInput
          name="password"
          label="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
    </div>
  );
}
```

### 3. Create Protected Route

```typescript
// src/components/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/shared';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner size="lg" message="Verificando autenticação..." />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
```

### 4. Update App Router

```typescript
// src/App.tsx
<Route path="/login" element={<Login />} />
<Route path="/signup" element={<Signup />} />

<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />

// Wrap all protected routes similarly
```

---

## User Roles and Permissions

### Role Structure

The `usuarios` table has a `role` column with these values:
- `admin` - Full access to all features
- `agente` - Limited access (can't delete, can't access settings)

### Implementing RBAC

```typescript
// src/hooks/usePermissions.ts
import { useAuth } from '@/contexts/AuthContext';

export function usePermissions() {
  const { user } = useAuth();
  
  const isAdmin = user?.user_metadata?.role === 'admin';
  
  return {
    canDelete: isAdmin,
    canEditSettings: isAdmin,
    canCreateUsers: isAdmin,
    canViewReports: true,
    canEditRecords: true,
  };
}
```

Usage in components:
```typescript
const { canDelete } = usePermissions();

{canDelete && (
  <Button onClick={handleDelete}>Excluir</Button>
)}
```

---

## Multi-Tenancy Implementation

### Storing empresa_id in JWT

When a user signs up or logs in, store their `empresa_id` in the JWT:

```typescript
// During signup
const { data: userData } = await supabase
  .from('usuarios')
  .select('empresa_id')
  .eq('email', email)
  .single();

// Update user metadata
await supabase.auth.updateUser({
  data: { empresa_id: userData.empresa_id }
});
```

### Filtering by Company

Update all RLS policies to use the JWT claim:

```sql
-- Example for bancos table
CREATE POLICY "bancos_select_own_company" ON public.bancos
FOR SELECT
TO authenticated
USING (empresa_id = (auth.jwt() -> 'user_metadata' ->> 'empresa_id')::uuid);
```

In application code:
```typescript
// The RLS policies will automatically filter
// But you can also be explicit:
const { data } = await supabase
  .from('bancos')
  .select('*');
// RLS ensures only user's company data is returned
```

---

## Security Best Practices

1. **Never expose service role key** - Only use anon key in frontend
2. **Use RLS for all tables** - Never rely on client-side filtering alone
3. **Validate input** - Use Yup/Zod schemas for all forms
4. **Hash passwords** - Supabase handles this automatically
5. **Enable email confirmation** - Prevent fake account creation
6. **Implement rate limiting** - Use Supabase's built-in rate limiting
7. **Use HTTPS only** - Enforce secure connections
8. **Rotate secrets regularly** - Update JWT secret periodically
9. **Log authentication events** - Track failed login attempts
10. **Implement session timeout** - Auto-logout after inactivity

---

## Testing Authentication

### Test Accounts
Create test accounts for different roles:

```sql
INSERT INTO usuarios (email, role, empresa_id)
VALUES
  ('admin@test.com', 'admin', 'empresa-uuid'),
  ('agent@test.com', 'agente', 'empresa-uuid');
```

### Testing Checklist
- [ ] Can sign up new user
- [ ] Can log in with valid credentials
- [ ] Cannot log in with invalid credentials
- [ ] Session persists after refresh
- [ ] Protected routes redirect to login
- [ ] Can log out successfully
- [ ] RLS filters data by company
- [ ] Role permissions work correctly

---

## Troubleshooting

### Common Issues

**Issue:** Session not persisting
**Solution:** Ensure `persistSession: true` in Supabase client config

**Issue:** RLS blocking all queries
**Solution:** Check that policies use correct JWT claims

**Issue:** User can see other companies' data
**Solution:** Verify RLS policies filter by `empresa_id`

**Issue:** Cannot update user metadata
**Solution:** Use `supabase.auth.updateUser()` not database update

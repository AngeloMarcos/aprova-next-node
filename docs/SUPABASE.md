# Supabase Configuration

## Database Schema

### Tables

#### bancos (Banks)
Stores bank partner information.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | uuid_generate_v4() | Primary key |
| nome | text | Yes | - | Bank name |
| cnpj | text | Yes | - | Tax ID (CNPJ) |
| email | text | Yes | - | Contact email |
| telefone | text | Yes | - | Phone number |
| empresa_id | uuid | Yes | - | Company ID (multi-tenant) |
| created_at | timestamp | Yes | now() | Creation timestamp |

**Indexes:**
- Primary key on `id`

---

#### produtos (Products)
Stores financial products offered by banks.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | uuid_generate_v4() | Primary key |
| nome | text | Yes | - | Product name |
| tipo_credito | text | Yes | - | Credit type |
| taxa_juros | numeric | Yes | - | Interest rate (%) |
| banco_id | uuid | Yes | - | Foreign key to bancos |
| status | text | Yes | 'ativo' | Product status |
| empresa_id | uuid | Yes | - | Company ID |
| created_at | timestamp | Yes | now() | Creation timestamp |

**Indexes:**
- Primary key on `id`
- Index on `banco_id`
- Index on `status`

---

#### propostas (Proposals)
Stores credit proposals submitted by clients.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | uuid_generate_v4() | Primary key |
| cliente_id | uuid | Yes | - | Foreign key to clientes |
| banco_id | uuid | Yes | - | Foreign key to bancos |
| produto_id | uuid | Yes | - | Foreign key to produtos |
| valor | numeric | Yes | - | Proposal amount |
| status | text | Yes | 'rascunho' | Proposal status |
| finalidade | text | Yes | - | Purpose of credit |
| observacoes | text | Yes | - | Additional notes |
| data | timestamp | Yes | now() | Proposal date |
| empresa_id | uuid | Yes | - | Company ID |

**Indexes:**
- Primary key on `id`
- Index on `cliente_id`
- Index on `banco_id`
- Index on `produto_id`
- Index on `status`

**Status values:**
- `rascunho` - Draft
- `em_analise` - Under analysis
- `aprovada` - Approved
- `reprovada` - Rejected
- `finalizada` - Completed

---

#### clientes (Clients)
Stores client information.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | uuid_generate_v4() | Primary key |
| nome | text | Yes | - | Client name |
| cpf | text | Yes | - | Tax ID (CPF) |
| email | text | Yes | - | Email address |
| empresa_id | uuid | Yes | - | Company ID |
| created_at | timestamp | Yes | now() | Creation timestamp |

---

#### empresas (Companies)
Stores company information for multi-tenancy.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | uuid_generate_v4() | Primary key |
| nome | text | No | - | Company name |
| cnpj | text | Yes | - | Tax ID (CNPJ) |
| created_at | timestamp | Yes | now() | Creation timestamp |

---

#### usuarios (Users)
Stores user accounts.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | uuid_generate_v4() | Primary key |
| nome | text | Yes | - | User name |
| email | text | No | - | Email (unique) |
| senha | text | Yes | - | Hashed password |
| role | text | Yes | 'agente' | User role |
| ativo | boolean | Yes | true | Active status |
| empresa_id | uuid | Yes | - | Company ID |
| created_at | timestamp | Yes | now() | Creation timestamp |

**Roles:**
- `admin` - Administrator
- `agente` - Agent/User

---

## Row-Level Security (RLS) Policies

All tables have RLS enabled with the following policies:

### Read (SELECT)
**Policy:** `{table}_select_authenticated`
- **For:** Authenticated users
- **Using:** `true` (currently allows all authenticated users)
- **Note:** Should be enhanced to filter by `empresa_id` for proper multi-tenancy

### Insert (INSERT)
**Policy:** `{table}_insert_authenticated`
- **For:** Authenticated users
- **With Check:** `true`
- **Note:** Should validate `empresa_id` matches user's company

### Update (UPDATE)
**Policy:** `{table}_update_authenticated`
- **For:** Authenticated users
- **Using:** `true`
- **With Check:** `true`
- **Note:** Should validate ownership via `empresa_id`

### Delete (DELETE)
**Policy:** `{table}_delete_authenticated`
- **For:** Authenticated users
- **Using:** `true`
- **Note:** Should validate ownership via `empresa_id`

---

## Security Recommendations

### Current Security Issues

1. **RLS policies are too permissive** - All authenticated users can access all data across companies
2. **Missing empresa_id validation** - Policies should filter by user's company
3. **No role-based access control** - All users have same permissions

### Recommended Improvements

```sql
-- Example: Improved RLS policy for bancos table
CREATE POLICY "bancos_select_own_company" ON public.bancos
FOR SELECT
TO authenticated
USING (empresa_id = auth.jwt() ->> 'empresa_id');

CREATE POLICY "bancos_insert_own_company" ON public.bancos
FOR INSERT
TO authenticated
WITH CHECK (empresa_id = auth.jwt() ->> 'empresa_id');

-- Similar policies should be created for all tables
```

---

## Authentication

### JWT Token Structure
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "empresa_id": "company_uuid",
  "role": "admin",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Client Configuration
```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://dxuxjwfaqdmjytpxglru.supabase.co',
  'YOUR_ANON_KEY',
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
```

---

## Data Access Patterns

### Fetching with Relations
```typescript
// Fetch products with bank information
const { data, error } = await supabase
  .from('produtos')
  .select(`
    *,
    bancos (
      id,
      nome
    )
  `)
  .eq('status', 'ativo');
```

### Filtering by Company
```typescript
// Currently handled by RLS (should be)
// But explicit filtering is safer:
const { data } = await supabase
  .from('bancos')
  .select('*')
  .eq('empresa_id', userCompanyId);
```

### Counting Records
```typescript
const { count } = await supabase
  .from('propostas')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'em_analise');
```

---

## Backup and Recovery

Supabase provides automated daily backups on paid plans. For custom backup strategies:

```sql
-- Export data
COPY bancos TO '/path/to/backup/bancos.csv' CSV HEADER;

-- Import data
COPY bancos FROM '/path/to/backup/bancos.csv' CSV HEADER;
```

---

## Performance Optimization

### Indexes
Create indexes on frequently queried columns:

```sql
CREATE INDEX idx_produtos_banco_id ON produtos(banco_id);
CREATE INDEX idx_produtos_status ON produtos(status);
CREATE INDEX idx_propostas_status ON propostas(status);
CREATE INDEX idx_propostas_cliente_id ON propostas(cliente_id);
```

### Query Optimization
- Use `select()` to specify only needed columns
- Use `limit()` for pagination
- Use indexes for filtering and sorting
- Avoid N+1 queries by using joins

---

## Monitoring

### Available Metrics
- API requests per second
- Database CPU usage
- Database memory usage
- Storage size
- Active connections

Access via: https://supabase.com/dashboard/project/dxuxjwfaqdmjytpxglru

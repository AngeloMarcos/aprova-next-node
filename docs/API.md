# API Documentation

## Base URL
All API requests are made to Supabase at: `https://dxuxjwfaqdmjytpxglru.supabase.co`

## Authentication
The application uses Supabase Auth with JWT tokens. All API requests require authentication via the `Authorization` header with a Bearer token.

```typescript
Authorization: Bearer <jwt_token>
```

## Multi-Tenancy
All database queries automatically filter by `empresa_id` through Row-Level Security (RLS) policies, ensuring data isolation between companies.

---

## Bancos (Banks)

### List Banks
**Endpoint:** `GET /rest/v1/bancos`

**Query Parameters:**
- `limit` - Number of records per page (default: 10)
- `offset` - Offset for pagination
- `order` - Sorting order (e.g., `created_at.desc`)
- `nome` - Filter by name (using `ilike` for case-insensitive search)
- `cnpj` - Filter by CNPJ
- `email` - Filter by email

**Response:**
```json
[
  {
    "id": "uuid",
    "nome": "Banco do Brasil",
    "cnpj": "00.000.000/0000-00",
    "email": "contato@bb.com.br",
    "telefone": "(61) 3000-0000",
    "empresa_id": "uuid",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### Create Bank
**Endpoint:** `POST /rest/v1/bancos`

**Request Body:**
```json
{
  "nome": "Banco do Brasil",
  "cnpj": "00.000.000/0000-00",
  "email": "contato@bb.com.br",
  "telefone": "(61) 3000-0000"
}
```

**Response:** Same as bank object above

### Update Bank
**Endpoint:** `PATCH /rest/v1/bancos?id=eq.{id}`

**Request Body:** Same as create (partial updates allowed)

### Delete Bank
**Endpoint:** `DELETE /rest/v1/bancos?id=eq.{id}`

---

## Produtos (Products)

### List Products
**Endpoint:** `GET /rest/v1/produtos`

**Query Parameters:**
- `limit` - Number of records per page
- `offset` - Offset for pagination
- `order` - Sorting order
- `nome` - Filter by name
- `banco_id` - Filter by bank
- `status` - Filter by status (ativo/inativo)
- `select` - Include related data: `*, bancos(id, nome)`

**Response:**
```json
[
  {
    "id": "uuid",
    "nome": "Crédito Consignado",
    "tipo_credito": "Consignado",
    "taxa_juros": 2.5,
    "status": "ativo",
    "banco_id": "uuid",
    "empresa_id": "uuid",
    "created_at": "2024-01-01T00:00:00Z",
    "bancos": {
      "id": "uuid",
      "nome": "Banco do Brasil"
    }
  }
]
```

### Create Product
**Endpoint:** `POST /rest/v1/produtos`

**Request Body:**
```json
{
  "nome": "Crédito Consignado",
  "tipo_credito": "Consignado",
  "taxa_juros": 2.5,
  "status": "ativo",
  "banco_id": "uuid"
}
```

### Update Product
**Endpoint:** `PATCH /rest/v1/produtos?id=eq.{id}`

### Update Product Status
**Endpoint:** `PATCH /rest/v1/produtos?id=eq.{id}`

**Request Body:**
```json
{
  "status": "inativo"
}
```

### Delete Product
**Endpoint:** `DELETE /rest/v1/produtos?id=eq.{id}`

---

## Propostas (Proposals)

### List Proposals
**Endpoint:** `GET /rest/v1/propostas`

**Query Parameters:**
- `limit` - Number of records per page
- `offset` - Offset for pagination
- `order` - Sorting order
- `cliente_id` - Filter by client
- `banco_id` - Filter by bank
- `status` - Filter by status
- `select` - Include relations: `*, clientes(id, nome), bancos(id, nome), produtos(id, nome)`

**Response:**
```json
[
  {
    "id": "uuid",
    "cliente_id": "uuid",
    "banco_id": "uuid",
    "produto_id": "uuid",
    "valor": 50000.00,
    "status": "em_analise",
    "finalidade": "Compra de veículo",
    "observacoes": "Cliente possui bom histórico",
    "data": "2024-01-01T00:00:00Z",
    "empresa_id": "uuid",
    "clientes": {
      "id": "uuid",
      "nome": "João Silva"
    },
    "bancos": {
      "id": "uuid",
      "nome": "Banco do Brasil"
    },
    "produtos": {
      "id": "uuid",
      "nome": "Crédito Consignado"
    }
  }
]
```

### Get Single Proposal
**Endpoint:** `GET /rest/v1/propostas?id=eq.{id}&select=*, clientes(id, nome, cpf, email), bancos(id, nome), produtos(id, nome, taxa_juros)`

### Create Proposal
**Endpoint:** `POST /rest/v1/propostas`

**Request Body:**
```json
{
  "cliente_id": "uuid",
  "banco_id": "uuid",
  "produto_id": "uuid",
  "valor": 50000.00,
  "status": "rascunho",
  "finalidade": "Compra de veículo",
  "observacoes": "Cliente possui bom histórico"
}
```

### Update Proposal
**Endpoint:** `PATCH /rest/v1/propostas?id=eq.{id}`

### Update Proposal Status
**Endpoint:** `PATCH /rest/v1/propostas?id=eq.{id}`

**Request Body:**
```json
{
  "status": "aprovada"
}
```

### Delete Proposal
**Endpoint:** `DELETE /rest/v1/propostas?id=eq.{id}`

---

## Clientes (Clients)

### List Clients
**Endpoint:** `GET /rest/v1/clientes`

**Query Parameters:**
- `limit` - Number of records per page
- `offset` - Offset for pagination
- `order` - Sorting order
- `nome` - Filter by name
- `cpf` - Filter by CPF

**Response:**
```json
[
  {
    "id": "uuid",
    "nome": "João Silva",
    "cpf": "000.000.000-00",
    "email": "joao@example.com",
    "empresa_id": "uuid",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

## Error Handling

All API errors follow this format:

```json
{
  "code": "ERROR_CODE",
  "message": "Error description",
  "details": "Additional error details",
  "hint": "Suggestion to fix the error"
}
```

### Common Error Codes
- `PGRST116` - No rows found (404)
- `23505` - Unique constraint violation
- `23503` - Foreign key constraint violation
- `42501` - Insufficient privilege (403)
- `42P01` - Table does not exist

---

## Rate Limiting
Supabase enforces rate limiting based on your plan. Free tier allows up to 500 requests per second.

---

## Pagination

All list endpoints support pagination using `limit` and `offset`:

```typescript
// Fetch page 2 with 10 items per page
const { data, count } = await supabase
  .from('bancos')
  .select('*', { count: 'exact' })
  .range(10, 19); // offset 10, limit 10

// Total pages calculation
const totalPages = Math.ceil(count / pageSize);
```

---

## Filtering

Supabase supports various filter operators:

```typescript
// Exact match
.eq('status', 'ativo')

// Case-insensitive like
.ilike('nome', '%banco%')

// Greater than
.gt('valor', 1000)

// In array
.in('status', ['ativo', 'em_analise'])

// Not null
.not('banco_id', 'is', null)
```

# Activity Log & Auditing System

## Overview

The Activity Log system provides comprehensive auditing capabilities for tracking all user actions within the application. This module automatically logs create, update, and delete operations on core entities, as well as authentication events.

## Features

### 1. Automatic Activity Tracking
- **Database Triggers**: All CRUD operations on tables are automatically logged via PostgreSQL triggers
- **Entities Tracked**: Clientes, Bancos, Propostas, Produtos
- **Actions Logged**: Create, Update, Delete, Login, Logout
- **Captured Data**: Previous values, new values, user information, timestamps

### 2. Activity Log Page (`/activity-log`)
- **Access**: Admin and Manager roles only
- **Columns**: Timestamp, User, Action, Entity Type, Entity Name, Details
- **Features**:
  - Real-time activity feed
  - Detailed view modal for each activity
  - JSON diff for before/after values
  - Pagination with configurable page sizes

### 3. Advanced Filtering
- **Date Range**: Filter activities by start and end dates
- **User**: Filter by specific user who performed the action
- **Entity Type**: Filter by cliente, banco, proposta, produto, or user
- **Action**: Filter by create, update, delete, login, or logout

### 4. Security & Multi-tenancy
- **RLS Enforcement**: Activity logs are isolated by empresa_id
- **Role-Based Access**: Only admins and managers can view logs
- **Automatic User Data**: User information is captured automatically from session

## Database Schema

### activity_logs Table

```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  user_name TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  entity_name TEXT,
  details JSONB,
  previous_value JSONB,
  new_value JSONB,
  empresa_id UUID REFERENCES empresas(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Indexes for Performance:**
- `idx_activity_logs_timestamp` - For date-based queries
- `idx_activity_logs_user_id` - For user-specific queries
- `idx_activity_logs_entity_type` - For entity filtering
- `idx_activity_logs_empresa_id` - For multi-tenant isolation
- `idx_activity_logs_created_at` - For sorting

### Fields Description

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| timestamp | TIMESTAMPTZ | When the activity occurred |
| user_id | UUID | ID of the user who performed the action |
| user_email | TEXT | Email of the user (cached for historical reference) |
| user_name | TEXT | Name of the user (cached for historical reference) |
| action | TEXT | Type of action: create, update, delete, login, logout |
| entity_type | TEXT | Type of entity: cliente, banco, proposta, produto, user |
| entity_id | UUID | ID of the affected entity |
| entity_name | TEXT | Name of the affected entity |
| details | JSONB | Additional contextual information |
| previous_value | JSONB | Complete state before the change (for updates/deletes) |
| new_value | JSONB | Complete state after the change (for creates/updates) |
| empresa_id | UUID | Company the activity belongs to |
| created_at | TIMESTAMPTZ | When the log entry was created |

## Automatic Logging Implementation

### Trigger-Based Logging

Each tracked table has an associated trigger function:

**Example: Clientes Trigger**
```sql
CREATE OR REPLACE FUNCTION log_clientes_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    PERFORM log_activity(
      auth.uid(),
      'create',
      'cliente',
      NEW.id,
      NEW.nome,
      jsonb_build_object('cpf', NEW.cpf, 'email', NEW.email),
      NULL,
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    PERFORM log_activity(
      auth.uid(),
      'update',
      'cliente',
      NEW.id,
      NEW.nome,
      jsonb_build_object('changed_fields', ...),
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    PERFORM log_activity(
      auth.uid(),
      'delete',
      'cliente',
      OLD.id,
      OLD.nome,
      to_jsonb(OLD),
      to_jsonb(OLD),
      NULL
    );
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

### Log Activity Function

The central logging function:

```sql
CREATE OR REPLACE FUNCTION log_activity(
  _user_id UUID,
  _action TEXT,
  _entity_type TEXT,
  _entity_id UUID,
  _entity_name TEXT,
  _details JSONB DEFAULT NULL,
  _previous_value JSONB DEFAULT NULL,
  _new_value JSONB DEFAULT NULL
) RETURNS UUID
```

**Features:**
- Automatically retrieves user email and name
- Gets empresa_id from user profile
- Returns the log entry ID
- Security definer for consistent access

## Frontend Components

### Page
- `src/pages/ActivityLog.tsx` - Main activity log page

### Components
- `src/components/activity/ActivityLogList.tsx` - Activity table with detail modals
- `src/components/activity/ActivityLogFilters.tsx` - Filter controls
- `src/components/activity/ActivityLogPagination.tsx` - Pagination controls

### Hooks
- `src/hooks/useActivityLog.ts` - Activity log data fetching and filtering

## Usage Examples

### Viewing Activity Logs

1. Navigate to `/activity-log` (admin or manager only)
2. View the real-time activity feed
3. Apply filters as needed:
   - Select date range
   - Filter by user
   - Filter by entity type
   - Filter by action

### Viewing Activity Details

1. Click the eye icon on any activity row
2. View comprehensive details including:
   - General information (user, entity, timestamp)
   - Action details (specific information about what changed)
   - Previous value (for updates and deletes)
   - New value (for creates and updates)

### Filtering Activities

```typescript
const filters: ActivityLogFilters = {
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  userId: 'user-uuid',
  entityType: 'cliente',
  action: 'create'
};

const { data, count } = await fetchLogs(1, 50, filters);
```

## RLS Policies

**View Policy:**
```sql
CREATE POLICY "Admins and Gerentes can view activity logs from their empresa"
  ON activity_logs
  FOR SELECT
  USING (
    empresa_id = get_user_empresa_id(auth.uid()) 
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gerente'))
  );
```

**Key Points:**
- Only SELECT is allowed (no direct INSERT/UPDATE/DELETE from client)
- Logs are automatically created via triggers
- Users can only see logs from their own empresa
- Restricted to admin and gerente roles

## Performance Considerations

### Indexing Strategy
All activity log queries use indexes to ensure fast performance:
- **Timestamp index**: For date range queries
- **User ID index**: For user-specific queries
- **Entity type index**: For entity filtering
- **Empresa ID index**: For multi-tenant filtering

### Pagination
Default page size is 50 records with options for:
- 25 records per page
- 50 records per page
- 100 records per page
- 200 records per page

### Query Optimization
The activity log table uses:
- Compound indexes for common filter combinations
- JSONB columns for flexible detail storage
- Efficient range queries with proper index usage

## Authentication Event Logging

### Login Logging
Automatically logged in `AuthContext.signIn()`:
```typescript
await supabase.from('activity_logs').insert({
  user_id: data.user.id,
  user_email: data.user.email,
  user_name: profileData.data?.nome,
  action: 'login',
  entity_type: 'user',
  entity_id: data.user.id,
  entity_name: profileData.data?.nome,
  details: { action: 'login' },
  empresa_id: profileData.data?.empresa_id,
});
```

### Logout Logging
Can be implemented similarly in the logout flow.

## Best Practices

### DO:
1. ✅ Use the automatic triggers for entity changes
2. ✅ Store meaningful details in the details JSONB field
3. ✅ Use filters to narrow down logs before viewing
4. ✅ Review logs regularly for security auditing
5. ✅ Keep entity names descriptive for easy identification

### DON'T:
1. ❌ Store sensitive data like passwords in the logs
2. ❌ Manually insert logs from the client (use triggers)
3. ❌ Delete or modify existing log entries
4. ❌ Grant access to logs for non-admin/non-manager users
5. ❌ Skip pagination on large datasets

## Troubleshooting

### No Logs Appearing

**Possible Causes:**
1. User doesn't have admin or manager role
2. User is in different empresa than the logs
3. Filters are too restrictive
4. No activities have been performed yet

**Solutions:**
1. Check user role with `SELECT * FROM user_roles WHERE user_id = auth.uid()`
2. Verify empresa_id matches
3. Clear all filters
4. Perform a test action (create/update/delete)

### Missing User Information

**Cause:** User data might not be in profiles table

**Solution:** Ensure user profile exists:
```sql
SELECT * FROM profiles WHERE id = 'user-id';
```

### Performance Issues

**Causes:**
1. Large date ranges without filters
2. Missing indexes
3. Very large result sets

**Solutions:**
1. Use specific date ranges
2. Verify indexes exist: `\di activity_logs`
3. Reduce page size or add more filters

## Testing

### Manual Testing Checklist

- [ ] Create a cliente and verify log entry
- [ ] Update a proposta and check previous/new values
- [ ] Delete a banco and confirm deletion log
- [ ] Login and verify login activity
- [ ] Apply each filter type and verify results
- [ ] Test pagination with different page sizes
- [ ] View activity details modal
- [ ] Test as admin user
- [ ] Test as manager user
- [ ] Verify agent cannot access logs

### Automated Tests

Test files:
- `src/hooks/__tests__/useActivityLog.test.ts`
- `src/components/activity/__tests__/ActivityLogList.test.tsx`
- `src/components/activity/__tests__/ActivityLogFilters.test.tsx`

## Future Enhancements

1. **Export Functionality**: Export filtered logs to CSV/PDF
2. **Activity Analytics**: Charts and statistics about user activities
3. **Real-time Updates**: WebSocket-based live activity feed
4. **Advanced Search**: Full-text search in details and values
5. **Retention Policies**: Automatic archival of old logs
6. **Alerts**: Notification for suspicious activities
7. **Audit Reports**: Pre-configured compliance reports
8. **Activity Replay**: View sequence of changes to an entity

## Security Considerations

1. **Data Retention**: Consider implementing a retention policy
2. **Sensitive Data**: Never log passwords or API keys
3. **Access Control**: Strictly enforce role-based access
4. **Immutability**: Log entries should never be modified
5. **Encryption**: Consider encrypting sensitive log data
6. **Backup**: Include activity logs in regular backups
7. **Monitoring**: Monitor for unusual activity patterns

## Related Documentation

- [RBAC.md](./RBAC.md) - Role-Based Access Control
- [SECURITY.md](./SECURITY.md) - Security best practices
- [DATABASE.md](./DATABASE.md) - Database design patterns
- [USER_MANAGEMENT.md](./USER_MANAGEMENT.md) - User management system

# Multi-Tenant HR & Payroll System

A comprehensive Firebase-based HR & Payroll system with secure multi-tenant architecture, RBAC, and complete module workflow automation.

## 🏗️ Architecture Overview

### Tenant Isolation

All business data is organized under tenant-specific paths:

```
/tenants/{tenantId}/
  ├── settings/config           # Tenant configuration
  ├── members/{uid}             # Tenant members with roles
  ├── departments/{deptId}      # Departments
  ├── employees/{empId}         # Employee records
  ├── positions/{posId}         # Job positions
  ├── jobs/{jobId}              # Hiring: job postings
  ├── candidates/{candId}       # Hiring: candidates
  ├── contracts/{contractId}    # Hiring: employment contracts
  ├── employmentSnapshots/      # Immutable position snapshots
  ├── rosters/{yyyy-mm}/shifts/ # Time: shift schedules
  ├── timesheets/{empId_week}   # Time: computed timesheets
  ├── leaveRequests/{reqId}     # Leave: requests
  ├── leaveBalances/{empId_yr}  # Leave: balances
  ├── goals/{goalId}            # Performance: goals
  ├── reviews/{reviewId}        # Performance: reviews
  ├── payruns/{yyyymm}/         # Payroll: monthly runs
  └── analytics/{docId}         # Reports & analytics
```

### Security Model

- **Firebase Auth Custom Claims**: Store accessible tenant IDs
- **Firestore Rules**: Enforce tenant isolation at database level
- **RBAC**: Role-based access control with module permissions
- **Function-level Security**: Server-side validation for sensitive operations

## 🎯 Business Modules

### 1. Hiring Module

**Workflow**: Create Jobs → Manage Candidates → Interviews → Offers → Contracts → Employment Snapshots

**Key Features**:

- Manager constraint: Hiring manager must belong to selected department
- Flexible approval: Department-based or specific approver
- Automatic contract generation from accepted offers
- Immutable employment snapshots for payroll

**Functions**:

- `acceptOffer()`: Creates contract and employment snapshot
- `validateJobApproval()`: Handles job posting approvals

### 2. Staff Module

**Purpose**: Authoritative employee database with department structure

**Key Features**:

- Employee hierarchy with managers
- Department organization
- Status tracking (active/inactive/terminated)
- Integration with all other modules

### 3. Time & Leave Module

**Workflow**: Shift Scheduling → Attendance Tracking → Leave Requests → Timesheet Generation

**Key Features**:

- Shift overlap validation
- 12-hour rest period enforcement
- Leave conflict detection
- Automatic timesheet computation
- Overtime calculation

**Functions**:

- `createOrUpdateShift()`: Validates and creates shifts
- `recomputeWeekTotals()`: Computes timesheet totals
- `approveLeaveRequest()`: Processes leave approvals

### 4. Performance Module

**Purpose**: Goals, reviews, training, and promotion signals

**Key Features**:

- Goal setting and tracking
- Performance reviews
- Training certifications
- Disciplinary actions
- Promotion recommendations

### 5. Payroll Module

**Workflow**: Compile Inputs → Calculate Pay → Generate Payslips → Tax Reports

**Key Features**:

- Employment snapshot-based calculations
- Timesheet integration
- Tax and deduction handling
- Immutable payslips

**Functions**:

- `compilePayrunInputs()`: Gathers employee data for payroll
- `validatePayrunInputs()`: Pre-payroll validation

### 6. Reports Module

**Purpose**: Cross-module analytics and compliance reporting

**Key Features**:

- Headcount metrics
- Payroll summaries
- Leave analytics
- Custom dashboards

## 🔐 RBAC & Permissions

### Roles

| Role       | Description        | Default Access                                                                           |
| ---------- | ------------------ | ---------------------------------------------------------------------------------------- |
| `owner`    | Full system access | All modules R/W                                                                          |
| `hr-admin` | HR operations      | hiring, staff, timeleave, payroll R/W; performance, reports R                            |
| `manager`  | Team management    | staff R, hiring R (dept), timeleave R/W (team), performance R/W (team), reports R (team) |
| `viewer`   | Read-only access   | staff, reports R (limited)                                                               |

### Module Permissions Matrix

```typescript
const permissions = {
  hiring: {
    read: ["owner", "hr-admin", "manager", "viewer"],
    write: ["owner", "hr-admin", "manager"],
  },
  staff: {
    read: ["owner", "hr-admin", "manager", "viewer"],
    write: ["owner", "hr-admin"],
  },
  timeleave: {
    read: ["owner", "hr-admin", "manager"],
    write: ["owner", "hr-admin", "manager"],
  },
  payroll: {
    read: ["owner", "hr-admin"],
    write: ["owner", "hr-admin"],
  },
};
```

### Custom Claims Structure

```typescript
interface CustomClaims {
  tenants: string[]; // Array of accessible tenant IDs
}
```

## 📊 Data Contracts

### Employment Snapshots (Immutable)

```typescript
interface EmploymentSnapshot {
  id: string; // {employeeId}_{asOf_YYYYMMDD}
  employeeId: string;
  position: Position; // Full position object
  contract: Contract; // Full contract object
  asOf: Date; // Effective date
  createdAt: Date; // Immutable timestamp
}
```

### Timesheets (Weekly Aggregates)

```typescript
interface Timesheet {
  id: string; // {empId}_{weekIso}
  empId: string;
  weekIso: string; // "YYYY-Www"
  regularHours: number;
  overtimeHours: number;
  paidLeaveHours: number;
  unpaidLeaveHours: number;
  sundays: number; // Special rate calculation
  computedAt: Date;
}
```

### Payrun Inputs (Monthly Compilation)

```typescript
interface PayrunInput {
  id: string; // {yyyymm}_{empId}
  empId: string;
  month: string; // "YYYY-MM"
  snapshot: EmploymentSnapshot; // Latest snapshot for month
  timesheetTotals: {
    regularHours: number;
    overtimeHours: number;
    paidLeaveHours: number;
    unpaidLeaveHours: number;
  };
  computedAt: Date;
}
```

## 🚀 Deployment & Setup

### Prerequisites

- Firebase project with Firestore and Functions enabled
- Node.js 18+
- Firebase CLI (`npm install -g firebase-tools`)

### Initial Setup

1. **Clone and install dependencies**:

```bash
git clone <repository>
cd <project-directory>
npm install
cd functions && npm install
```

2. **Configure Firebase**:

```bash
firebase login
firebase use --add  # Select your project
```

3. **Deploy Firestore rules and indexes**:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

4. **Deploy Cloud Functions**:

```bash
cd functions
npm run build
firebase deploy --only functions
```

### Environment Setup

Create tenant configuration and admin user:

```typescript
// Set custom claims for initial admin
await auth.setCustomUserClaims(adminUid, {
  tenants: ["your-tenant-id"],
});

// Create tenant configuration
await db.doc("tenants/your-tenant-id/settings/config").set({
  name: "Your Company Name",
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Create admin member record
await db.doc("tenants/your-tenant-id/members/{adminUid}").set({
  role: "owner",
  createdAt: new Date(),
  updatedAt: new Date(),
});
```

## 📦 Migration Guide

### From Root Collections to Tenant Structure

Use the migration script to safely move existing data:

```bash
# Dry run to preview migration
npx tsx scripts/migrate-root-to-tenants.ts --tenant-id=your-tenant --dry-run

# Run actual migration
npx tsx scripts/migrate-root-to-tenants.ts --tenant-id=your-tenant

# Migrate specific collections only
npx tsx scripts/migrate-root-to-tenants.ts --tenant-id=your-tenant --collections=employees,departments
```

### Migration Steps

1. **Backup your data**: Export Firestore data before migration
2. **Run dry run**: Verify migration plan with `--dry-run`
3. **Execute migration**: Run without `--dry-run` to migrate data
4. **Verify data**: Check that all data is properly migrated
5. **Update rules**: Deploy updated Firestore rules to block root writes
6. **Test application**: Verify all functionality works with tenant structure

### Post-Migration Cleanup

After successful migration and verification:

```bash
# Remove root collections (be very careful!)
firebase firestore:delete --all-collections --yes
```

## 🔧 Required Firestore Indexes

Create these indexes via Firebase Console or `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "employees",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "departmentId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "shifts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "employeeId", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "timesheets",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "empId", "order": "ASCENDING" },
        { "fieldPath": "weekIso", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "jobs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "departmentId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "leaveRequests",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "empId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "from", "order": "ASCENDING" }
      ]
    }
  ]
}
```

## 🧪 Testing

### Emulator Testing

```bash
# Start emulators
firebase emulators:start

# Run tests
npm test
```

### Function Testing

```bash
cd functions
npm run test
```

### Integration Tests

Key test scenarios:

- Tenant isolation validation
- RBAC permission enforcement
- Hiring workflow end-to-end
- Timesheet computation accuracy
- Payroll compilation correctness

## 📋 API Reference

### Key React Hooks

```typescript
// Tenant management
const { currentTenant, switchTenant } = useTenant();
const tenantId = useTenantId();

// Data access (all tenant-aware)
const { data: departments } = useDepartments();
const { data: employees } = useEmployees({ departmentId });
const { data: jobs } = useJobs();
const createJob = useCreateJob();

// Time & leave
const { data: shifts } = useShifts(yearMonth, { employeeId });
const { data: timesheet } = useTimesheet(empId, weekIso);
```

### Cloud Functions

```typescript
// Hiring
await acceptOffer({ tenantId, offerId, employeeId });
await validateJobApproval({ tenantId, jobId, action: "approve" });

// Time & Leave
await createOrUpdateShift({ tenantId, shiftData });
await approveLeaveRequest({ tenantId, requestId, approved: true });

// Payroll
await compilePayrunInputs({ tenantId, yyyymm: "202401" });
const inputs = await getPayrunInputs({ tenantId, yyyymm: "202401" });
```

## 🔒 Security Considerations

### Production Checklist

- [ ] Deploy proper Firestore rules (remove development rules)
- [ ] Set up Firebase App Check
- [ ] Configure CORS for functions
- [ ] Enable audit logging
- [ ] Set up monitoring and alerts
- [ ] Implement rate limiting
- [ ] Review and rotate API keys
- [ ] Set up backup strategies

### Data Privacy

- Employee data encryption at rest (Firebase default)
- PII handling in compliance with local regulations
- Audit trails for sensitive operations
- Right to erasure implementation

## 🚨 Troubleshooting

### Common Issues

**1. Permission Denied Errors**

```
Error: Missing or insufficient permissions
```

**Solution**: Check Firestore rules are deployed and user has correct tenant claims.

**2. Tenant Not Found**

```
Error: User is not a member of tenant
```

**Solution**: Ensure user has tenant in custom claims and member record exists.

**3. Function Timeout**

```
Error: Function execution timeout
```

**Solution**: Optimize batch sizes or increase function timeout limits.

### Debug Commands

```bash
# Check Firestore rules
firebase firestore:rules:get

# View function logs
firebase functions:log

# Test with emulators
firebase emulators:start --debug
```

## 📈 Performance Optimization

### Best Practices

- Use composite indexes for complex queries
- Batch writes for multiple document operations
- Implement pagination for large datasets
- Cache frequently accessed data
- Monitor function execution times
- Use subcollections for large document groups

### Monitoring

- Set up Firebase Performance Monitoring
- Track function execution metrics
- Monitor Firestore read/write usage
- Set billing alerts

## 🛠️ Development Workflow

### Adding New Features

1. Update TypeScript types in `/types/tenant.ts`
2. Add path helpers in `/lib/paths.ts`
3. Create data access functions in `/lib/data.ts`
4. Add React Query hooks in `/hooks/useTenantData.ts`
5. Implement UI components with tenant context
6. Add Cloud Functions if needed
7. Update tests and documentation

### Code Organization

```
client/
├── types/tenant.ts           # TypeScript definitions
├── lib/
│   ├── paths.ts             # Firestore path helpers
│   └── data.ts              # Data access layer
├── hooks/useTenantData.ts   # React Query hooks
├── contexts/TenantContext.tsx # Tenant management
└── pages/                   # UI components

functions/src/
├── hiring.ts                # Hiring module functions
├── timeleave.ts            # Time & leave functions
├── payroll.ts              # Payroll functions
└── index.ts                # Function exports
```

## 📞 Support

For questions, issues, or contributions:

1. Check existing issues in the repository
2. Review this documentation
3. Create detailed bug reports with reproduction steps
4. Follow the contribution guidelines

---

**Version**: 1.0.0  
**Last Updated**: 2024-12-27  
**Compatible With**: Firebase v10+, React 18+, Node.js 18+

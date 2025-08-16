/**
 * Firestore Security Rules Tests: Tenant Isolation
 * 
 * Tests the security rules to ensure proper tenant isolation and access control.
 */

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { join } from 'path';

let testEnv: RulesTestEnvironment;

// Test user UIDs
const TENANT_A_USER = 'user-tenant-a';
const TENANT_B_USER = 'user-tenant-b';
const MULTI_TENANT_USER = 'user-multi-tenant';
const NO_TENANT_USER = 'user-no-tenant';

// Tenant IDs
const TENANT_A = 'tenant-a';
const TENANT_B = 'tenant-b';

const PROJECT_ID = 'hr-payroll-test';

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync(join(__dirname, '../../firestore.rules'), 'utf8'),
      host: 'localhost',
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe('Tenant Isolation Rules', () => {
  describe('Authentication Requirements', () => {
    test('unauthenticated users cannot access any tenant data', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      
      await assertFails(
        getDoc(doc(db, `tenants/${TENANT_A}/employees/emp1`))
      );
      
      await assertFails(
        setDoc(doc(db, `tenants/${TENANT_A}/employees/emp1`), { name: 'John' })
      );
    });

    test('authenticated users without tenant claims cannot access tenant data', async () => {
      const db = testEnv.authenticatedContext(NO_TENANT_USER, {
        // No tenant claims
      }).firestore();
      
      await assertFails(
        getDoc(doc(db, `tenants/${TENANT_A}/employees/emp1`))
      );
    });
  });

  describe('Tenant Access Control', () => {
    test('users can read/write data in their assigned tenant', async () => {
      const db = testEnv.authenticatedContext(TENANT_A_USER, {
        tenants: [TENANT_A],
      }).firestore();

      // Should succeed - user has access to TENANT_A
      await assertSucceeds(
        setDoc(doc(db, `tenants/${TENANT_A}/employees/emp1`), {
          name: 'John Doe',
          departmentId: 'dept1',
          status: 'active',
        })
      );

      await assertSucceeds(
        getDoc(doc(db, `tenants/${TENANT_A}/employees/emp1`))
      );
    });

    test('users cannot access data from other tenants', async () => {
      const db = testEnv.authenticatedContext(TENANT_A_USER, {
        tenants: [TENANT_A],
      }).firestore();

      // Should fail - user only has access to TENANT_A, not TENANT_B
      await assertFails(
        getDoc(doc(db, `tenants/${TENANT_B}/employees/emp1`))
      );

      await assertFails(
        setDoc(doc(db, `tenants/${TENANT_B}/employees/emp1`), { name: 'Jane' })
      );
    });

    test('users with multiple tenant access can access all assigned tenants', async () => {
      const db = testEnv.authenticatedContext(MULTI_TENANT_USER, {
        tenants: [TENANT_A, TENANT_B],
      }).firestore();

      // Should succeed for both tenants
      await assertSucceeds(
        setDoc(doc(db, `tenants/${TENANT_A}/employees/emp1`), { name: 'John' })
      );

      await assertSucceeds(
        setDoc(doc(db, `tenants/${TENANT_B}/employees/emp2`), { name: 'Jane' })
      );

      await assertSucceeds(
        getDoc(doc(db, `tenants/${TENANT_A}/employees/emp1`))
      );

      await assertSucceeds(
        getDoc(doc(db, `tenants/${TENANT_B}/employees/emp2`))
      );
    });
  });

  describe('Collection-Level Isolation', () => {
    test('tenant isolation works across all business collections', async () => {
      const tenantADb = testEnv.authenticatedContext(TENANT_A_USER, {
        tenants: [TENANT_A],
      }).firestore();

      const tenantBDb = testEnv.authenticatedContext(TENANT_B_USER, {
        tenants: [TENANT_B],
      }).firestore();

      const collections = [
        'departments',
        'employees',
        'positions',
        'jobs',
        'candidates',
        'interviews',
        'offers',
        'contracts',
        'employmentSnapshots',
        'timesheets',
        'leaveRequests',
        'leaveBalances',
        'goals',
        'reviews',
      ];

      for (const collectionName of collections) {
        // Each tenant can access their own data
        await assertSucceeds(
          setDoc(doc(tenantADb, `tenants/${TENANT_A}/${collectionName}/doc1`), { test: true })
        );

        await assertSucceeds(
          setDoc(doc(tenantBDb, `tenants/${TENANT_B}/${collectionName}/doc1`), { test: true })
        );

        // But cannot access the other tenant's data
        await assertFails(
          getDoc(doc(tenantADb, `tenants/${TENANT_B}/${collectionName}/doc1`))
        );

        await assertFails(
          getDoc(doc(tenantBDb, `tenants/${TENANT_A}/${collectionName}/doc1`))
        );
      }
    });
  });

  describe('Subcollection Access', () => {
    test('tenant isolation works for nested collections like shifts', async () => {
      const tenantADb = testEnv.authenticatedContext(TENANT_A_USER, {
        tenants: [TENANT_A],
      }).firestore();

      const tenantBDb = testEnv.authenticatedContext(TENANT_B_USER, {
        tenants: [TENANT_B],
      }).firestore();

      // Test roster shifts (nested collection)
      const yearMonth = '2024-01';
      
      await assertSucceeds(
        setDoc(doc(tenantADb, `tenants/${TENANT_A}/rosters/${yearMonth}/shifts/shift1`), {
          employeeId: 'emp1',
          date: '2024-01-15',
          start: '09:00',
          end: '17:00',
        })
      );

      await assertSucceeds(
        setDoc(doc(tenantBDb, `tenants/${TENANT_B}/rosters/${yearMonth}/shifts/shift1`), {
          employeeId: 'emp2',
          date: '2024-01-15',
          start: '08:00',
          end: '16:00',
        })
      );

      // Cross-tenant access should fail
      await assertFails(
        getDoc(doc(tenantADb, `tenants/${TENANT_B}/rosters/${yearMonth}/shifts/shift1`))
      );

      await assertFails(
        getDoc(doc(tenantBDb, `tenants/${TENANT_A}/rosters/${yearMonth}/shifts/shift1`))
      );
    });

    test('payrun subcollections are properly isolated', async () => {
      const tenantADb = testEnv.authenticatedContext(TENANT_A_USER, {
        tenants: [TENANT_A],
      }).firestore();

      const tenantBDb = testEnv.authenticatedContext(TENANT_B_USER, {
        tenants: [TENANT_B],
      }).firestore();

      const payrunMonth = '202401';

      // Each tenant can access their payrun data
      await assertSucceeds(
        setDoc(doc(tenantADb, `tenants/${TENANT_A}/payruns/${payrunMonth}/payslips/emp1`), {
          empId: 'emp1',
          gross: 5000,
          net: 4000,
        })
      );

      await assertSucceeds(
        setDoc(doc(tenantBDb, `tenants/${TENANT_B}/payruns/${payrunMonth}/payslips/emp2`), {
          empId: 'emp2',
          gross: 4500,
          net: 3600,
        })
      );

      // Cross-tenant access should fail
      await assertFails(
        getDoc(doc(tenantADb, `tenants/${TENANT_B}/payruns/${payrunMonth}/payslips/emp2`))
      );

      await assertFails(
        getDoc(doc(tenantBDb, `tenants/${TENANT_A}/payruns/${payrunMonth}/payslips/emp1`))
      );
    });
  });

  describe('Reference Data Access', () => {
    test('authenticated users can read reference data', async () => {
      const db = testEnv.authenticatedContext(TENANT_A_USER, {
        tenants: [TENANT_A],
      }).firestore();

      // Seed some reference data as admin
      const adminDb = testEnv.authenticatedContext('admin', {
        admin: true,
      }).firestore();

      await setDoc(doc(adminDb, 'reference/taxTables/2024'), {
        brackets: [
          { min: 0, max: 10000, rate: 0.1 },
          { min: 10000, max: 50000, rate: 0.2 },
        ],
      });

      // Users should be able to read reference data
      await assertSucceeds(
        getDoc(doc(db, 'reference/taxTables/2024'))
      );

      // But not write to it
      await assertFails(
        setDoc(doc(db, 'reference/taxTables/2025'), { test: true })
      );
    });

    test('unauthenticated users cannot access reference data', async () => {
      const db = testEnv.unauthenticatedContext().firestore();

      await assertFails(
        getDoc(doc(db, 'reference/taxTables/2024'))
      );
    });
  });

  describe('Role-Based Restrictions', () => {
    test('only owners can modify tenant settings', async () => {
      // First, set up the member records as admin
      const adminDb = testEnv.authenticatedContext('admin', {
        admin: true,
      }).firestore();

      await setDoc(doc(adminDb, `tenants/${TENANT_A}/members/owner-user`), {
        role: 'owner',
      });

      await setDoc(doc(adminDb, `tenants/${TENANT_A}/members/hr-user`), {
        role: 'hr-admin',
      });

      // Owner should be able to modify settings
      const ownerDb = testEnv.authenticatedContext('owner-user', {
        tenants: [TENANT_A],
      }).firestore();

      await assertSucceeds(
        setDoc(doc(ownerDb, `tenants/${TENANT_A}/settings/config`), {
          name: 'Updated Company',
        })
      );

      // HR admin should not be able to modify settings (based on our rules)
      const hrDb = testEnv.authenticatedContext('hr-user', {
        tenants: [TENANT_A],
      }).firestore();

      await assertFails(
        setDoc(doc(hrDb, `tenants/${TENANT_A}/settings/config`), {
          name: 'Unauthorized Update',
        })
      );
    });
  });

  describe('Legacy Collection Access', () => {
    test('legacy root collections are read-only for authenticated users', async () => {
      const db = testEnv.authenticatedContext(TENANT_A_USER, {
        tenants: [TENANT_A],
      }).firestore();

      // Seed legacy data as admin
      const adminDb = testEnv.authenticatedContext('admin', {
        admin: true,
      }).firestore();

      await setDoc(doc(adminDb, 'employees/legacy-emp'), {
        name: 'Legacy Employee',
      });

      // Users can read legacy data
      await assertSucceeds(
        getDoc(doc(db, 'employees/legacy-emp'))
      );

      // But cannot write to legacy collections
      await assertFails(
        setDoc(doc(db, 'employees/new-emp'), { name: 'New Employee' })
      );
    });
  });

  describe('Query-Level Isolation', () => {
    test('collection queries are properly scoped to tenant', async () => {
      // Set up data for multiple tenants
      const adminDb = testEnv.authenticatedContext('admin', {
        admin: true,
      }).firestore();

      await setDoc(doc(adminDb, `tenants/${TENANT_A}/employees/emp1`), {
        name: 'Tenant A Employee 1',
      });

      await setDoc(doc(adminDb, `tenants/${TENANT_A}/employees/emp2`), {
        name: 'Tenant A Employee 2',
      });

      await setDoc(doc(adminDb, `tenants/${TENANT_B}/employees/emp1`), {
        name: 'Tenant B Employee 1',
      });

      // Tenant A user should only see Tenant A data
      const tenantADb = testEnv.authenticatedContext(TENANT_A_USER, {
        tenants: [TENANT_A],
      }).firestore();

      const tenantAQuery = await assertSucceeds(
        getDocs(collection(tenantADb, `tenants/${TENANT_A}/employees`))
      );

      expect(tenantAQuery.size).toBe(2);

      // Tenant A user should not be able to query Tenant B data
      await assertFails(
        getDocs(collection(tenantADb, `tenants/${TENANT_B}/employees`))
      );
    });
  });
});

describe('Data Validation Rules', () => {
  test('documents require proper structure', async () => {
    const db = testEnv.authenticatedContext(TENANT_A_USER, {
      tenants: [TENANT_A],
    }).firestore();

    // Valid employee document should succeed
    await assertSucceeds(
      setDoc(doc(db, `tenants/${TENANT_A}/employees/emp1`), {
        displayName: 'John Doe',
        email: 'john@example.com',
        departmentId: 'dept1',
        status: 'active',
      })
    );

    // Note: Additional validation rules would be added here
    // for field requirements, data types, etc.
  });
});

describe('Performance and Edge Cases', () => {
  test('batch operations respect tenant isolation', async () => {
    const db = testEnv.authenticatedContext(TENANT_A_USER, {
      tenants: [TENANT_A],
    }).firestore();

    // Batch operations within same tenant should work
    const batch = db.batch();
    
    batch.set(doc(db, `tenants/${TENANT_A}/employees/emp1`), { name: 'Employee 1' });
    batch.set(doc(db, `tenants/${TENANT_A}/employees/emp2`), { name: 'Employee 2' });
    
    await assertSucceeds(batch.commit());

    // Note: Testing cross-tenant batch operations would require
    // setting up more complex scenarios
  });

  test('deep nested paths maintain tenant isolation', async () => {
    const db = testEnv.authenticatedContext(TENANT_A_USER, {
      tenants: [TENANT_A],
    }).firestore();

    const deepPath = `tenants/${TENANT_A}/analytics/reports/monthly/2024/01/departments/dept1`;
    
    await assertSucceeds(
      setDoc(doc(db, deepPath), { reportData: 'test' })
    );

    const crossTenantDeepPath = `tenants/${TENANT_B}/analytics/reports/monthly/2024/01/departments/dept1`;
    
    await assertFails(
      setDoc(doc(db, crossTenantDeepPath), { reportData: 'test' })
    );
  });
});

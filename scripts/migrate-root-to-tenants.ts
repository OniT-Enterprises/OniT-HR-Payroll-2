#!/usr/bin/env tsx

/**
 * Migration script: Root collections to tenant structure
 * 
 * This script migrates existing data from root collections to the new tenant-based structure.
 * It preserves document IDs and handles the migration safely and idempotently.
 * 
 * Usage:
 *   npx tsx scripts/migrate-root-to-tenants.ts --tenant-id=<TENANT_ID> [options]
 * 
 * Options:
 *   --tenant-id=<ID>     Target tenant ID (required)
 *   --dry-run           Preview migration without making changes
 *   --batch-size=<N>    Number of documents to process per batch (default: 50)
 *   --collections=<csv>  Comma-separated list of collections to migrate (default: all)
 *   --force             Skip confirmation prompts
 */

import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import * as readline from 'readline';

// Initialize Firebase Admin
const app = initializeApp();
const db = getFirestore(app);
const auth = getAuth(app);

interface MigrationOptions {
  tenantId: string;
  dryRun: boolean;
  batchSize: number;
  collections: string[];
  force: boolean;
}

interface MigrationResult {
  collection: string;
  documentsProcessed: number;
  documentsSkipped: number;
  errors: any[];
  duration: number;
}

interface MigrationSummary {
  tenantId: string;
  startTime: Date;
  endTime: Date;
  totalDuration: number;
  totalDocuments: number;
  totalErrors: number;
  results: MigrationResult[];
  dryRun: boolean;
}

// Collections to migrate and their target paths
const COLLECTION_MAPPINGS = {
  'departments': 'departments',
  'employees': 'employees',
  'candidates': 'candidates',
  'jobs': 'jobs',
  'positions': 'positions',
  'interviews': 'interviews',
  'offers': 'offers',
  'contracts': 'contracts',
} as const;

const DEFAULT_COLLECTIONS = Object.keys(COLLECTION_MAPPINGS);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function parseArgs(): MigrationOptions {
  const args = process.argv.slice(2);
  const options: Partial<MigrationOptions> = {
    dryRun: false,
    batchSize: 50,
    collections: DEFAULT_COLLECTIONS,
    force: false,
  };

  for (const arg of args) {
    if (arg.startsWith('--tenant-id=')) {
      options.tenantId = arg.split('=')[1];
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg.startsWith('--batch-size=')) {
      options.batchSize = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--collections=')) {
      options.collections = arg.split('=')[1].split(',').map(c => c.trim());
    } else if (arg === '--force') {
      options.force = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Migration script: Root collections to tenant structure

Usage:
  npx tsx scripts/migrate-root-to-tenants.ts --tenant-id=<TENANT_ID> [options]

Options:
  --tenant-id=<ID>     Target tenant ID (required)
  --dry-run           Preview migration without making changes
  --batch-size=<N>    Number of documents to process per batch (default: 50)
  --collections=<csv>  Comma-separated list of collections to migrate (default: all)
  --force             Skip confirmation prompts

Available collections: ${DEFAULT_COLLECTIONS.join(', ')}
      `);
      process.exit(0);
    }
  }

  if (!options.tenantId) {
    console.error('❌ Error: --tenant-id is required');
    process.exit(1);
  }

  if (options.batchSize! < 1 || options.batchSize! > 500) {
    console.error('❌ Error: --batch-size must be between 1 and 500');
    process.exit(1);
  }

  // Validate collections
  const invalidCollections = options.collections!.filter(c => !DEFAULT_COLLECTIONS.includes(c));
  if (invalidCollections.length > 0) {
    console.error(`❌ Error: Invalid collections: ${invalidCollections.join(', ')}`);
    console.error(`Available collections: ${DEFAULT_COLLECTIONS.join(', ')}`);
    process.exit(1);
  }

  return options as MigrationOptions;
}

async function confirmMigration(options: MigrationOptions): Promise<boolean> {
  if (options.force) return true;

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    const mode = options.dryRun ? 'DRY RUN' : 'LIVE MIGRATION';
    console.log(`\n🚨 ${mode}: Root collections → tenant structure`);
    console.log(`   Tenant ID: ${options.tenantId}`);
    console.log(`   Collections: ${options.collections.join(', ')}`);
    console.log(`   Batch size: ${options.batchSize}`);
    
    if (!options.dryRun) {
      console.log('\n⚠️  This will MOVE data from root collections to tenant collections.');
      console.log('   Make sure you have a backup before proceeding!');
    }

    rl.question('\nDo you want to continue? (y/N): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

async function validateTenant(tenantId: string): Promise<boolean> {
  try {
    // Check if tenant configuration exists
    const configDoc = await db.doc(`tenants/${tenantId}/settings/config`).get();
    
    if (!configDoc.exists) {
      console.log(`⚠️  Tenant configuration not found, creating basic config...`);
      
      await db.doc(`tenants/${tenantId}/settings/config`).set({
        name: tenantId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      console.log(`✅ Created basic tenant configuration`);
    }

    return true;
  } catch (error) {
    console.error(`❌ Error validating tenant: ${error}`);
    return false;
  }
}

// ============================================================================
// MIGRATION FUNCTIONS
// ============================================================================

async function migrateCollection(
  sourceCollection: string,
  targetPath: string,
  tenantId: string,
  options: MigrationOptions
): Promise<MigrationResult> {
  const startTime = Date.now();
  const result: MigrationResult = {
    collection: sourceCollection,
    documentsProcessed: 0,
    documentsSkipped: 0,
    errors: [],
    duration: 0,
  };

  try {
    console.log(`\n📋 Processing collection: ${sourceCollection}`);
    
    // Get all documents from source collection
    const sourceRef = db.collection(sourceCollection);
    const snapshot = await sourceRef.get();
    
    if (snapshot.empty) {
      console.log(`   ℹ️  No documents found in ${sourceCollection}`);
      result.duration = Date.now() - startTime;
      return result;
    }

    console.log(`   📊 Found ${snapshot.size} documents`);

    // Process documents in batches
    const docs = snapshot.docs;
    const targetRef = db.collection(`tenants/${tenantId}/${targetPath}`);
    
    for (let i = 0; i < docs.length; i += options.batchSize) {
      const batch = docs.slice(i, i + options.batchSize);
      console.log(`   🔄 Processing batch ${Math.floor(i / options.batchSize) + 1}/${Math.ceil(docs.length / options.batchSize)}`);
      
      if (options.dryRun) {
        // Dry run: just validate and count
        for (const doc of batch) {
          try {
            const targetDoc = await targetRef.doc(doc.id).get();
            if (targetDoc.exists) {
              result.documentsSkipped++;
              console.log(`     ⏭️  Skipping ${doc.id} (already exists in target)`);
            } else {
              result.documentsProcessed++;
              console.log(`     ✅ Would migrate ${doc.id}`);
            }
          } catch (error) {
            result.errors.push({ docId: doc.id, error: error.message });
            console.log(`     ❌ Error with ${doc.id}: ${error.message}`);
          }
        }
      } else {
        // Live migration: copy documents
        const batchWrite = db.batch();
        const batchDocs = [];
        
        for (const doc of batch) {
          try {
            // Check if document already exists in target
            const targetDoc = await targetRef.doc(doc.id).get();
            if (targetDoc.exists) {
              result.documentsSkipped++;
              console.log(`     ⏭️  Skipping ${doc.id} (already exists)`);
              continue;
            }

            // Prepare data for migration
            const data = doc.data();
            const migratedData = {
              ...data,
              // Add migration metadata
              _migratedFrom: sourceCollection,
              _migratedAt: new Date(),
              // Ensure timestamps are converted properly
              createdAt: data.createdAt || new Date(),
              updatedAt: data.updatedAt || new Date(),
            };

            batchWrite.set(targetRef.doc(doc.id), migratedData);
            batchDocs.push(doc);
            
          } catch (error) {
            result.errors.push({ docId: doc.id, error: error.message });
            console.log(`     ❌ Error preparing ${doc.id}: ${error.message}`);
          }
        }

        if (batchDocs.length > 0) {
          try {
            await batchWrite.commit();
            result.documentsProcessed += batchDocs.length;
            
            for (const doc of batchDocs) {
              console.log(`     ✅ Migrated ${doc.id}`);
            }
            
          } catch (error) {
            result.errors.push({ batch: i, error: error.message });
            console.log(`     ❌ Batch write failed: ${error.message}`);
          }
        }
      }
    }

    result.duration = Date.now() - startTime;
    console.log(`   ✅ Completed ${sourceCollection}: ${result.documentsProcessed} migrated, ${result.documentsSkipped} skipped, ${result.errors.length} errors`);

  } catch (error) {
    result.errors.push({ collection: sourceCollection, error: error.message });
    console.error(`   ❌ Collection migration failed: ${error.message}`);
    result.duration = Date.now() - startTime;
  }

  return result;
}

async function createMigrationRecord(summary: MigrationSummary): Promise<void> {
  try {
    const recordId = `migration_${Date.now()}`;
    await db.doc(`tenants/${summary.tenantId}/analytics/${recordId}`).set({
      type: 'migration',
      summary,
      createdAt: new Date(),
    });
    console.log(`📝 Migration record saved: ${recordId}`);
  } catch (error) {
    console.error(`⚠️  Failed to save migration record: ${error.message}`);
  }
}

// ============================================================================
// MAIN MIGRATION FUNCTION
// ============================================================================

async function runMigration(): Promise<void> {
  console.log('🚀 HR & Payroll System: Root to Tenant Migration');
  console.log('================================================\n');

  const options = parseArgs();
  
  // Validate tenant
  const tenantValid = await validateTenant(options.tenantId);
  if (!tenantValid) {
    console.error('❌ Tenant validation failed');
    process.exit(1);
  }

  // Confirm migration
  const confirmed = await confirmMigration(options);
  if (!confirmed) {
    console.log('❌ Migration cancelled');
    process.exit(0);
  }

  const summary: MigrationSummary = {
    tenantId: options.tenantId,
    startTime: new Date(),
    endTime: new Date(),
    totalDuration: 0,
    totalDocuments: 0,
    totalErrors: 0,
    results: [],
    dryRun: options.dryRun,
  };

  const startTime = Date.now();
  
  try {
    console.log(`\n🔄 Starting ${options.dryRun ? 'DRY RUN' : 'MIGRATION'}...\n`);

    // Migrate each collection
    for (const collection of options.collections) {
      const targetPath = COLLECTION_MAPPINGS[collection as keyof typeof COLLECTION_MAPPINGS];
      if (!targetPath) {
        console.error(`❌ Unknown collection: ${collection}`);
        continue;
      }

      const result = await migrateCollection(collection, targetPath, options.tenantId, options);
      summary.results.push(result);
      summary.totalDocuments += result.documentsProcessed;
      summary.totalErrors += result.errors.length;
    }

    summary.endTime = new Date();
    summary.totalDuration = Date.now() - startTime;

    // Print summary
    console.log('\n📊 MIGRATION SUMMARY');
    console.log('==================');
    console.log(`Mode: ${options.dryRun ? 'DRY RUN' : 'LIVE MIGRATION'}`);
    console.log(`Tenant: ${summary.tenantId}`);
    console.log(`Duration: ${(summary.totalDuration / 1000).toFixed(2)}s`);
    console.log(`Documents processed: ${summary.totalDocuments}`);
    console.log(`Total errors: ${summary.totalErrors}`);

    console.log('\nBy collection:');
    for (const result of summary.results) {
      const status = result.errors.length === 0 ? '✅' : '⚠️';
      console.log(`  ${status} ${result.collection}: ${result.documentsProcessed} processed, ${result.documentsSkipped} skipped, ${result.errors.length} errors`);
    }

    if (summary.totalErrors > 0) {
      console.log('\n❌ ERRORS:');
      for (const result of summary.results) {
        if (result.errors.length > 0) {
          console.log(`  ${result.collection}:`);
          for (const error of result.errors) {
            console.log(`    - ${JSON.stringify(error)}`);
          }
        }
      }
    }

    // Save migration record (only for live migrations)
    if (!options.dryRun) {
      await createMigrationRecord(summary);
    }

    if (options.dryRun) {
      console.log('\n💡 This was a dry run. Add --force to skip confirmation and run the actual migration.');
    } else {
      console.log('\n🎉 Migration completed successfully!');
      
      if (summary.totalErrors === 0) {
        console.log('\n📋 Next steps:');
        console.log('1. Update your Firestore security rules to block root collection writes');
        console.log('2. Test your application with the new tenant structure');
        console.log('3. Consider removing root collections after verification');
      }
    }

  } catch (error) {
    console.error(`\n❌ Migration failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// ============================================================================
// RUN MIGRATION
// ============================================================================

if (require.main === module) {
  runMigration().catch((error) => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
}

export { runMigration, MigrationOptions, MigrationSummary };

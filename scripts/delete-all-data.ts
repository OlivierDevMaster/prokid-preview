import { createClient } from '@supabase/supabase-js';

import { Database } from '@/types/database/schema';

/**
 * Script to delete all data from the database
 * WARNING: This will permanently delete all data from all tables!
 *
 * Usage:
 *   npx tsx scripts/delete-all-data.ts
 *   # Or with dotenv-cli:
 *   npx dotenv-cli -e .env.local -- npx tsx scripts/delete-all-data.ts
 *
 * Environment variables required:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Note: Make sure your environment variables are loaded before running this script.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Error: Missing required environment variables');
  console.error(
    'Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY'
  );
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Tables to delete data from, in order (respecting foreign key constraints)
 */
const tables = [
  'reports', // References professionals and structures
  'availabilities', // References professionals
  'professionals', // References profiles
  'structures', // References profiles
  'profiles', // References auth.users (but we keep auth.users)
  'newsletter_subscriptions', // No dependencies
] as const;

async function deleteAllData() {
  console.log('🚨 WARNING: This will delete ALL data from the database!');
  console.log('Tables to be cleared:', tables.join(', '));
  console.log('');

  try {
    // Delete data from each table in order (respecting foreign key constraints)
    // Use a condition that matches all rows (all tables have created_at)
    for (const table of tables) {
      console.log(`Deleting data from ${table}...`);

      const { error } = await supabase
        .from(table)
        .delete()
        .gte('created_at', '1970-01-01T00:00:00Z'); // Matches all rows

      if (error) {
        console.error(`❌ Error deleting from ${table}:`, error.message);
        throw error;
      }

      console.log(`  ✓ Deleted data from ${table}`);
    }

    console.log('');
    console.log('✅ Successfully deleted all data from the database!');
    console.log('');
    console.log('Note: Auth users in auth.users are preserved.');
    console.log(
      'To delete auth users as well, run: npm run db:delete-all-with-auth'
    );
    console.log('Or use the SQL file: scripts/delete-auth-users.sql');
  } catch (error) {
    console.error('');
    console.error('❌ Failed to delete data:', error);
    process.exit(1);
  }
}

// Run the script
deleteAllData();

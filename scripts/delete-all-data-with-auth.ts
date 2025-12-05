import { createClient } from '@supabase/supabase-js';

import { Database } from '@/types/database/schema';

/**
 * Script to delete all data from the database INCLUDING auth users
 * WARNING: This will permanently delete ALL data including auth users!
 *
 * Usage:
 *   npx tsx scripts/delete-all-data-with-auth.ts
 *   # Or with dotenv-cli:
 *   npx dotenv-cli -e .env.local -- npx tsx scripts/delete-all-data-with-auth.ts
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
  'profiles', // References auth.users
  'newsletter_subscriptions', // No dependencies
] as const;

async function deleteAllData() {
  console.log('🚨 WARNING: This will delete ALL data INCLUDING auth users!');
  console.log('Tables to be cleared:', tables.join(', '));
  console.log('Auth users will also be deleted!');
  console.log('');

  try {
    // First, delete all public schema data
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

    // Then, delete all auth users
    console.log('');
    console.log('Deleting auth users...');

    let page = 1;
    let hasMore = true;
    let totalDeleted = 0;

    while (hasMore) {
      const {
        data: { users },
        error: listError,
      } = await supabase.auth.admin.listUsers({
        page,
        perPage: 100,
      });

      if (listError) {
        console.error('❌ Error listing users:', listError.message);
        throw listError;
      }

      if (!users || users.length === 0) {
        hasMore = false;
        break;
      }

      // Delete each user
      for (const user of users) {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(
          user.id
        );

        if (deleteError) {
          console.error(
            `❌ Error deleting user ${user.id}:`,
            deleteError.message
          );
          throw deleteError;
        }

        totalDeleted++;
      }

      console.log(
        `  ✓ Deleted ${users.length} user(s) (total: ${totalDeleted})`
      );

      // Check if there are more users
      if (users.length < 100) {
        hasMore = false;
      } else {
        page++;
      }
    }

    console.log('');
    console.log('✅ Successfully deleted all data from the database!');
    console.log(`✅ Deleted ${totalDeleted} auth user(s) in total.`);
  } catch (error) {
    console.error('');
    console.error('❌ Failed to delete data:', error);
    process.exit(1);
  }
}

// Run the script
deleteAllData();

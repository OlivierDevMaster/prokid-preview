#!/usr/bin/env -S deno run --allow-net --allow-env --allow-read
/**
 * Script to create test data for queue_appointment_reminders testing
 *
 * Usage:
 *   deno run --allow-net --allow-env scripts/create-test-data-queue-reminders.ts
 *
 * This script:
 * 1. Creates a structure user and professional user
 * 2. Creates a structure membership
 * 3. Creates a mission with multiple schedules
 * 4. Tests the queue_appointment_reminders function
 * 5. Verifies reminders were queued
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database/schema.ts';

// Load environment variables from .env file if it exists
try {
  const envFile = await Deno.readTextFile('.env');
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        Deno.env.set(key.trim(), value.trim());
      }
    }
  }
} catch {
  // .env file doesn't exist, use environment variables directly
}

// Try to get from environment, fallback to defaults for local development
const supabaseUrl = Deno.env.get('SUPABASE_URL') ??
                    Deno.env.get('NEXT_PUBLIC_SUPABASE_URL') ??
                    'http://127.0.0.1:54321';
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

if (!supabaseServiceRoleKey) {
  console.error('❌ Missing required environment variable:');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceRoleKey ? '✅' : '❌');
  console.error('\n💡 Set it in .env file or as environment variable');
  Deno.exit(1);
}

console.log(`📡 Using Supabase URL: ${supabaseUrl}`);

const adminClient = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  global: {
    headers: {
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
    },
  },
});

interface TestData {
  structureId: string;
  professionalId: string;
  missionId: string;
  scheduleIds: string[];
}

/**
 * Create a structure user
 */
async function createStructureUser(): Promise<string> {
  const email = `test-structure-queue-${Date.now()}@example.com`;

  console.log(`📝 Creating structure user: ${email}`);

  const { data: authData, error: authError } =
    await adminClient.auth.admin.createUser({
      email,
      email_confirm: true,
      password: 'testpassword123',
      user_metadata: {
        first_name: 'Test',
        last_name: 'Structure',
        role: 'structure',
      },
    });

  if (authError || !authData.user) {
    throw new Error(`Failed to create structure user: ${authError?.message}`);
  }

  const userId = authData.user.id;

  // Wait for trigger to create profile
  await new Promise(resolve => setTimeout(resolve, 200));

  // Check if structure already exists, if so delete it
  const { data: existingStructure } = await adminClient
    .from('structures')
    .select('user_id')
    .eq('user_id', userId)
    .single();

  if (existingStructure) {
    console.log(`   Structure already exists, cleaning up...`);
    await adminClient.from('structures').delete().eq('user_id', userId);
  }

  // Create structure record
  const { error: structureError } = await adminClient
    .from('structures')
    .insert({
      user_id: userId,
      name: 'Test Structure for Queue Reminders',
    });

  if (structureError) {
    throw new Error(`Failed to create structure: ${structureError.message}`);
  }

  console.log(`✅ Created structure: ${userId}`);
  return userId;
}

/**
 * Create a professional user
 */
async function createProfessionalUser(): Promise<string> {
  const email = `test-professional-queue-${Date.now()}@example.com`;

  console.log(`📝 Creating professional user: ${email}`);

  const { data: authData, error: authError } =
    await adminClient.auth.admin.createUser({
      email,
      email_confirm: true,
      password: 'testpassword123',
      user_metadata: {
        first_name: 'Test',
        last_name: 'Professional',
        role: 'professional',
      },
    });

  if (authError || !authData.user) {
    throw new Error(`Failed to create professional user: ${authError?.message}`);
  }

  const userId = authData.user.id;

  // Wait for trigger to create profile
  await new Promise(resolve => setTimeout(resolve, 200));

  // Check if professional already exists, if so delete it
  const { data: existingProfessional } = await adminClient
    .from('professionals')
    .select('user_id')
    .eq('user_id', userId)
    .single();

  if (existingProfessional) {
    console.log(`   Professional already exists, cleaning up...`);
    await adminClient.from('professionals').delete().eq('user_id', userId);
  }

  // Create professional record
  const { error: professionalError } = await adminClient
    .from('professionals')
    .insert({
      user_id: userId,
      city: 'Paris',
      postal_code: '75001',
      intervention_radius_km: 10,
      experience_years: 5,
      hourly_rate: 50.0,
    });

  if (professionalError) {
    throw new Error(`Failed to create professional: ${professionalError.message}`);
  }

  // Create notification preferences (enable reminders)
  await adminClient.from('professional_notification_preferences').upsert({
    user_id: userId,
    appointment_reminders: true,
  });

  console.log(`✅ Created professional: ${userId}`);
  return userId;
}

/**
 * Create structure membership
 */
async function createMembership(
  structureId: string,
  professionalId: string
): Promise<void> {
  console.log(`📝 Creating structure membership...`);

  const { error } = await adminClient.from('structure_members').insert({
    structure_id: structureId,
    professional_id: professionalId,
  });

  if (error) {
    throw new Error(`Failed to create membership: ${error.message}`);
  }

  console.log(`✅ Created membership`);
}

/**
 * Create test mission with schedules
 */
async function createTestMission(
  structureId: string,
  professionalId: string
): Promise<TestData> {
  console.log(`📝 Creating test mission...`);

  const now = new Date();
  const missionDtstart = new Date(now.getTime() + 20 * 60 * 60 * 1000); // 20 hours from now
  const missionUntil = new Date(now.getTime() + 30 * 60 * 60 * 1000); // 30 hours from now
  const occurrenceTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

  // Format RRULE DTSTART for occurrence at 24h
  const year = occurrenceTime.getUTCFullYear();
  const month = String(occurrenceTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(occurrenceTime.getUTCDate()).padStart(2, '0');
  const hours = String(occurrenceTime.getUTCHours()).padStart(2, '0');
  const minutes = String(occurrenceTime.getUTCMinutes()).padStart(2, '0');
  const rruleDtstartStr = `${year}${month}${day}T${hours}${minutes}00Z`;

  // Create mission
  const { data: missionData, error: missionError } = await adminClient
    .from('missions')
    .insert({
      structure_id: structureId,
      professional_id: professionalId,
      status: 'accepted',
      mission_dtstart: missionDtstart.toISOString(),
      mission_until: missionUntil.toISOString(),
      title: 'Test Mission for Queue Reminders',
      description: 'Testing queue_appointment_reminders function',
    })
    .select('id')
    .single();

  if (missionError || !missionData) {
    throw new Error(`Failed to create mission: ${missionError?.message}`);
  }

  const missionId = missionData.id;
  console.log(`✅ Created mission: ${missionId}`);

  // Create Schedule 1: Single occurrence at exactly 24h (should be queued)
  const rrule1 = `DTSTART:${rruleDtstartStr}\nRRULE:FREQ=DAILY;COUNT=1`;
  const { data: schedule1, error: schedule1Error } = await adminClient
    .from('mission_schedules')
    .insert({
      mission_id: missionId,
      rrule: rrule1,
      duration_mn: 60,
    })
    .select('id')
    .single();

  if (schedule1Error || !schedule1) {
    throw new Error(`Failed to create schedule 1: ${schedule1Error?.message}`);
  }

  console.log(`✅ Created schedule 1: ${schedule1.id} (single occurrence at 24h)`);

  // Create Schedule 2: Daily for mission duration (will have occurrence in window)
  const rrule2 = `DTSTART:${year}${month}${day}T090000Z\nRRULE:FREQ=DAILY;UNTIL=${year}${String(missionUntil.getUTCMonth() + 1).padStart(2, '0')}${String(missionUntil.getUTCDate()).padStart(2, '0')}T235959Z`;
  const { data: schedule2, error: schedule2Error } = await adminClient
    .from('mission_schedules')
    .insert({
      mission_id: missionId,
      rrule: rrule2,
      duration_mn: 120,
    })
    .select('id')
    .single();

  if (schedule2Error || !schedule2) {
    throw new Error(`Failed to create schedule 2: ${schedule2Error?.message}`);
  }

  console.log(`✅ Created schedule 2: ${schedule2.id} (daily)`);

  // Create Schedule 3: Weekly on Monday (might have occurrence in window)
  const rrule3 = `DTSTART:${year}${month}${day}T140000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO;UNTIL=${year}${String(missionUntil.getUTCMonth() + 1).padStart(2, '0')}${String(missionUntil.getUTCDate()).padStart(2, '0')}T235959Z`;
  const { data: schedule3, error: schedule3Error } = await adminClient
    .from('mission_schedules')
    .insert({
      mission_id: missionId,
      rrule: rrule3,
      duration_mn: 180,
    })
    .select('id')
    .single();

  if (schedule3Error || !schedule3) {
    throw new Error(`Failed to create schedule 3: ${schedule3Error?.message}`);
  }

  console.log(`✅ Created schedule 3: ${schedule3.id} (weekly Monday)`);

  return {
    structureId,
    professionalId,
    missionId,
    scheduleIds: [schedule1.id, schedule2.id, schedule3.id],
  };
}

/**
 * Test the queue_appointment_reminders function
 */
async function testQueueFunction(): Promise<number> {
  console.log(`\n🧪 Testing queue_appointment_reminders()...`);

  const { data, error } = await adminClient.rpc('queue_appointment_reminders');

  if (error) {
    throw new Error(`Failed to execute queue_appointment_reminders: ${error.message}`);
  }

  const missionsProcessed = data ?? 0;
  console.log(`✅ Function executed successfully`);
  console.log(`   Missions processed: ${missionsProcessed}`);

  return missionsProcessed;
}

/**
 * Verify reminders were queued
 */
async function verifyRemindersQueued(missionId: string): Promise<void> {
  console.log(`\n🔍 Verifying reminders were queued...`);

  // Wait a bit for Edge Function to process
  console.log(`   Waiting 3 seconds for Edge Function to process...`);
  await new Promise(resolve => setTimeout(resolve, 3000));

  const { data: reminders, error } = await adminClient
    .from('appointment_reminders_pending')
    .select('*')
    .eq('mission_id', missionId)
    .order('occurrence_date');

  if (error) {
    throw new Error(`Failed to query reminders: ${error.message}`);
  }

  console.log(`\n📊 Results:`);
  console.log(`   Total reminders queued: ${reminders?.length ?? 0}`);

  if (reminders && reminders.length > 0) {
    console.log(`\n   Reminders:`);
    reminders.forEach((reminder, index) => {
      console.log(`   ${index + 1}. Schedule: ${reminder.mission_schedule_id}`);
      console.log(`      Occurrence: ${reminder.occurrence_date}`);
      console.log(`      Status: ${reminder.status}`);
      console.log(`      Type: ${reminder.reminder_type}`);
    });
  } else {
    console.log(`   ⚠️  No reminders were queued`);
    console.log(`   This might be because:`);
    console.log(`   - Occurrences are not in the 23-25 hour window`);
    console.log(`   - Edge Function failed to process`);
    console.log(`   - Reminders were already queued`);
  }
}

/**
 * Cleanup test data
 */
async function cleanup(testData: TestData): Promise<void> {
  console.log(`\n🧹 Cleaning up test data...`);

  try {
    // Delete reminders
    await adminClient
      .from('appointment_reminders_pending')
      .delete()
      .eq('mission_id', testData.missionId);

    await adminClient
      .from('appointment_reminders')
      .delete()
      .eq('mission_id', testData.missionId);

    // Delete schedules
    await adminClient
      .from('mission_schedules')
      .delete()
      .eq('mission_id', testData.missionId);

    // Delete mission
    await adminClient.from('missions').delete().eq('id', testData.missionId);

    // Delete membership
    await adminClient
      .from('structure_members')
      .delete()
      .eq('structure_id', testData.structureId)
      .eq('professional_id', testData.professionalId);

    // Delete structure
    await adminClient.from('structures').delete().eq('user_id', testData.structureId);

    // Delete professional
    await adminClient.from('professionals').delete().eq('user_id', testData.professionalId);

    // Delete profiles
    await adminClient.from('profiles').delete().eq('user_id', testData.structureId);
    await adminClient.from('profiles').delete().eq('user_id', testData.professionalId);

    // Delete auth users
    await adminClient.auth.admin.deleteUser(testData.structureId);
    await adminClient.auth.admin.deleteUser(testData.professionalId);

    console.log(`✅ Cleanup completed`);
  } catch (error) {
    console.warn(`⚠️  Cleanup warning: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting test data creation for queue_appointment_reminders\n');

  let testData: TestData | null = null;

  try {
    // Step 1: Create structure
    const structureId = await createStructureUser();

    // Step 2: Create professional
    const professionalId = await createProfessionalUser();

    // Step 3: Create membership
    await createMembership(structureId, professionalId);

    // Step 4: Create mission with schedules
    testData = await createTestMission(structureId, professionalId);

    console.log(`\n✅ Test data created successfully!`);
    console.log(`   Mission ID: ${testData.missionId}`);
    console.log(`   Schedules: ${testData.scheduleIds.length}`);

    // Step 5: Test the function
    const missionsProcessed = await testQueueFunction();

    // Step 6: Verify results
    await verifyRemindersQueued(testData.missionId);

    console.log(`\n✅ Test completed successfully!`);
    console.log(`\n📝 Summary:`);
    console.log(`   - Missions processed: ${missionsProcessed}`);
    console.log(`   - Mission ID: ${testData.missionId}`);
    console.log(`   - Check appointment_reminders_pending table for queued reminders`);

    // Ask if user wants to keep test data
    console.log(`\n💡 Note: Test data will be kept. Run cleanup manually if needed.`);
    console.log(`   To cleanup, delete mission ${testData.missionId} and related data.`);
  } catch (error) {
    console.error(`\n❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error(error);
    Deno.exit(1);
  }
}

// Run the script
if (import.meta.main) {
  await main();
}


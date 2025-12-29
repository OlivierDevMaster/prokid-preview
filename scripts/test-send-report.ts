import { createClient } from '@supabase/supabase-js';

import { Database } from '../types/database/schema';

const TEST_EMAIL = 'delivered@resend.dev';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error(
    'Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
  );
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
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

async function main() {
  console.log('🚀 Starting test script to send report email...\n');

  try {
    // Step 1: Find or create a professional user with auth
    console.log('📋 Step 1: Finding or creating professional user...');
    let professionalUserId: string;
    let professionalToken: string;

    const { data: existingProfessionals } = await supabase
      .from('professionals')
      .select('user_id, profile:profiles!inner(email)')
      .limit(1)
      .single();

    if (existingProfessionals) {
      professionalUserId = existingProfessionals.user_id;
      const email = (existingProfessionals.profile as { email: string }).email;
      console.log(`✅ Using existing professional: ${professionalUserId}`);

      // Sign in to get token
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password: 'testpassword123',
        });

      if (signInError || !signInData.session) {
        console.log('⚠️  Could not sign in existing user, creating new one...');
        // Fall through to create new user
      } else {
        professionalToken = signInData.session.access_token;
        console.log('✅ Got auth token for existing professional');
      }
    }

    if (!professionalToken) {
      // Create a new test professional user with auth
      const email = `test-professional-${Date.now()}@test.com`;
      const password = 'testpassword123';

      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email,
          email_confirm: true,
          password,
          user_metadata: {
            first_name: 'Test',
            last_name: 'Professional',
            role: 'professional',
          },
        });

      if (authError || !authData.user) {
        throw new Error(`Failed to create auth user: ${authError?.message}`);
      }

      professionalUserId = authData.user.id;

      // Wait for trigger to create profile
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create professional record
      const { error: professionalError } = await supabase
        .from('professionals')
        .insert({
          city: 'Paris',
          experience_years: 5,
          hourly_rate: 25.0,
          intervention_radius_km: 10,
          user_id: professionalUserId,
        });

      if (professionalError) {
        throw new Error(
          `Failed to create professional: ${professionalError.message}`
        );
      }

      // Sign in to get token
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError || !signInData.session) {
        throw new Error(
          `Failed to sign in: ${signInError?.message || 'Unknown error'}`
        );
      }

      professionalToken = signInData.session.access_token;
      console.log(`✅ Created new professional: ${professionalUserId}`);
    }

    // Step 2: Find or create a structure with test email
    console.log(
      '\n📋 Step 2: Finding or creating structure with test email...'
    );
    let structureUserId: string;

    // Check if structure with this email exists (check both profile and structures table)
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('email', TEST_EMAIL)
      .eq('role', 'structure')
      .maybeSingle();

    if (existingProfile) {
      structureUserId = existingProfile.user_id;

      // Verify structure record exists
      const { data: existingStructure } = await supabase
        .from('structures')
        .select('user_id')
        .eq('user_id', structureUserId)
        .maybeSingle();

      if (existingStructure) {
        console.log(`✅ Using existing structure: ${structureUserId}`);
      } else {
        // Profile exists but structure record doesn't, create it
        console.log(
          `⚠️  Profile exists but structure record missing, creating...`
        );
        const { error: structureError } = await supabase
          .from('structures')
          .insert({
            name: 'Test Structure',
            user_id: structureUserId,
          });

        if (structureError) {
          throw new Error(
            `Failed to create structure record: ${structureError.message}`
          );
        }

        console.log(`✅ Created structure record for existing profile`);
      }
    } else {
      // Create a test structure user with auth (which will trigger profile creation)
      const password = 'testpassword123';

      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email: TEST_EMAIL,
          email_confirm: true,
          password,
          user_metadata: {
            first_name: 'Test',
            last_name: 'Structure',
            role: 'structure',
          },
        });

      if (authError || !authData.user) {
        throw new Error(`Failed to create auth user: ${authError?.message}`);
      }

      structureUserId = authData.user.id;

      // Wait for trigger to create profile
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if structure already exists (in case createUser returned existing user)
      const { data: existingStructure } = await supabase
        .from('structures')
        .select('user_id')
        .eq('user_id', structureUserId)
        .maybeSingle();

      if (existingStructure) {
        console.log(`✅ Using existing structure: ${structureUserId}`);
      } else {
        // Create structure record
        const { error: structureError } = await supabase
          .from('structures')
          .insert({
            name: 'Test Structure',
            user_id: structureUserId,
          });

        if (structureError) {
          throw new Error(
            `Failed to create structure: ${structureError.message}`
          );
        }

        console.log(`✅ Created new structure: ${structureUserId}`);
      }
    }

    // Step 2.5: Ensure professional is a member of the structure
    console.log(
      '\n📋 Step 2.5: Ensuring professional is a member of structure...'
    );
    const { data: existingMembership } = await supabase
      .from('structure_members')
      .select('id')
      .eq('structure_id', structureUserId)
      .eq('professional_id', professionalUserId)
      .is('deleted_at', null)
      .maybeSingle();

    if (!existingMembership) {
      const { error: membershipError } = await supabase
        .from('structure_members')
        .insert({
          professional_id: professionalUserId,
          structure_id: structureUserId,
        });

      if (membershipError) {
        throw new Error(
          `Failed to create structure membership: ${membershipError.message}`
        );
      }

      console.log('✅ Created structure membership');
    } else {
      console.log('✅ Professional is already a member');
    }

    // Step 3: Create a mission
    console.log('\n📋 Step 3: Creating mission...');
    const missionStart = new Date();
    missionStart.setDate(missionStart.getDate() - 7);
    const missionEnd = new Date();
    missionEnd.setDate(missionEnd.getDate() + 7);

    const { data: mission, error: missionError } = await supabase
      .from('missions')
      .insert({
        description: 'Test mission for report email',
        mission_dtstart: missionStart.toISOString(),
        mission_until: missionEnd.toISOString(),
        professional_id: professionalUserId,
        status: 'accepted',
        structure_id: structureUserId,
        title: 'Test Mission',
      })
      .select()
      .single();

    if (missionError) {
      throw new Error(`Failed to create mission: ${missionError.message}`);
    }

    console.log(`✅ Created mission: ${mission.id}`);

    // Step 4: Create a report
    console.log('\n📋 Step 4: Creating report...');
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .insert({
        author_id: professionalUserId,
        content:
          'This is a test report to verify the email sending functionality.\n\nIt includes:\n- Professional information\n- Mission details\n- Report content\n- Attachments',
        mission_id: mission.id,
        status: 'draft',
        title: 'Test Report - Email Sending',
      })
      .select()
      .single();

    if (reportError) {
      throw new Error(`Failed to create report: ${reportError.message}`);
    }

    console.log(`✅ Created report: ${report.id}`);

    // Step 5: Create test attachments
    console.log('\n📋 Step 5: Creating test attachments...');
    const attachments = [
      {
        content: 'This is a test PDF content for attachment 1.',
        file_name: 'test-report-1.pdf',
        mime_type: 'application/pdf',
      },
      {
        content: 'This is a test image content for attachment 2.',
        file_name: 'test-image.jpg',
        mime_type: 'image/jpeg',
      },
    ];

    const createdAttachments = [];

    for (const attachment of attachments) {
      // Generate file path
      const timestamp = Date.now();
      const filePath = `reports/${report.id}/${timestamp}-${attachment.file_name}`;

      // Create test file content
      const fileContent = Buffer.from(attachment.content);

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('report-attachments')
        .upload(filePath, fileContent, {
          contentType: attachment.mime_type,
          upsert: false,
        });

      if (uploadError) {
        console.error(
          `⚠️  Failed to upload ${attachment.file_name}:`,
          uploadError.message
        );
        continue;
      }

      // Create attachment record
      const { data: attachmentRecord, error: attachmentError } = await supabase
        .from('report_attachments')
        .insert({
          file_name: attachment.file_name,
          file_path: filePath,
          file_size: fileContent.length,
          mime_type: attachment.mime_type,
          report_id: report.id,
        })
        .select()
        .single();

      if (attachmentError) {
        console.error(
          `⚠️  Failed to create attachment record for ${attachment.file_name}:`,
          attachmentError.message
        );
        // Try to remove uploaded file
        await supabase.storage.from('report-attachments').remove([filePath]);
        continue;
      }

      createdAttachments.push(attachmentRecord);
      console.log(`✅ Created attachment: ${attachment.file_name}`);
    }

    if (createdAttachments.length === 0) {
      throw new Error('Failed to create any attachments');
    }

    console.log(
      `✅ Created ${createdAttachments.length} attachment(s) for the report`
    );

    // Step 6: Call the send-report function
    console.log('\n📋 Step 6: Calling send-report function...');
    const functionUrl = `${supabaseUrl}/functions/v1/reports/send`;

    // Get anon key for the function call
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      supabaseServiceRoleKey;

    const response = await fetch(functionUrl, {
      body: JSON.stringify({ report_id: report.id }),
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${professionalToken}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Failed to send report:');
      console.error(JSON.stringify(result, null, 2));
      throw new Error(
        `HTTP ${response.status}: ${result.error?.message || 'Unknown error'}`
      );
    }

    console.log('\n✅ Report sent successfully!');
    console.log('📧 Email should be sent to:', TEST_EMAIL);
    console.log('\n📊 Response:', JSON.stringify(result, null, 2));

    console.log('\n✨ Test completed successfully!');
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main();

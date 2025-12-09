import { assertEquals, assertExists } from '@std/assert';
import '@std/dotenv/load';
import { afterEach, beforeEach, describe, it } from '@std/testing/bdd';

import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';
import {
  AdminRlsFixture,
  ReportRlsCleanupHelper,
  ReportRlsFixture,
  ReportRlsFixtureBuilder,
  StructureRlsFixture,
} from './reports.fixture.ts';

describe('Reports RLS - INSERT', () => {
  let supabaseClient: SupabaseTestClient;
  let adminClient: ReturnType<SupabaseTestClient['createAdminClient']>;
  let fixtureBuilder: ReportRlsFixtureBuilder;
  let cleanupHelper: ReportRlsCleanupHelper;
  let fixtures: Array<
    AdminRlsFixture | ReportRlsFixture | StructureRlsFixture
  > = [];

  beforeEach(() => {
    supabaseClient = SupabaseTestClient.getInstance();
    adminClient = supabaseClient.createAdminClient();
    fixtureBuilder = new ReportRlsFixtureBuilder(adminClient, supabaseClient);
    cleanupHelper = new ReportRlsCleanupHelper(adminClient);
  });

  afterEach(async () => {
    for (const fixture of fixtures) {
      if ('professionalId' in fixture) {
        await cleanupHelper.cleanupReport(fixture as ReportRlsFixture);
      } else if ('structureId' in fixture) {
        await cleanupHelper.cleanupStructure(fixture as StructureRlsFixture);
      } else {
        await cleanupHelper.cleanupAdmin(fixture as AdminRlsFixture);
      }
    }
    fixtures = [];
  });

  it('should prevent unauthenticated users from creating reports', async () => {
    const professional = await fixtureBuilder.createOnboardedProfessional();
    const structure = await fixtureBuilder.createOnboardedStructure();
    fixtures.push(professional, structure);

    const mission = await fixtureBuilder.createMission(
      professional.professionalId!,
      structure.structureId!
    );

    const unauthenticatedClient = supabaseClient.createUnauthenticatedClient();
    const { data, error } = await unauthenticatedClient
      .from('reports')
      .insert({
        author_id: professional.professionalId!,
        content: 'Test content',
        mission_id: mission.id,
        title: 'Test Report',
      })
      .select();

    assertEquals(data, null);
    assertExists(error);
    assertEquals(error.code, '42501');
  });

  it('should allow professionals to create their own reports', async () => {
    const professional = await fixtureBuilder.createOnboardedProfessional();
    const structure = await fixtureBuilder.createOnboardedStructure();
    fixtures.push(professional, structure);

    const mission = await fixtureBuilder.createMission(
      professional.professionalId!,
      structure.structureId!
    );

    const authenticatedClient = supabaseClient.createAuthenticatedClient(
      professional.token
    );
    const { data, error } = await authenticatedClient
      .from('reports')
      .insert({
        author_id: professional.professionalId!,
        content: 'Test content',
        mission_id: mission.id,
        title: 'Test Report',
      })
      .select('id, author_id')
      .single();

    assertEquals(error, null);
    assertExists(data);
    assertEquals(data.author_id, professional.professionalId);
  });

  it('should prevent professionals from creating reports for other professionals', async () => {
    const professional1 = await fixtureBuilder.createOnboardedProfessional();
    const professional2 = await fixtureBuilder.createOnboardedProfessional();
    const structure = await fixtureBuilder.createOnboardedStructure();
    fixtures.push(professional1, professional2, structure);

    const mission = await fixtureBuilder.createMission(
      professional2.professionalId!,
      structure.structureId!
    );

    const authenticatedClient = supabaseClient.createAuthenticatedClient(
      professional1.token
    );
    const { data, error } = await authenticatedClient
      .from('reports')
      .insert({
        author_id: professional2.professionalId!,
        content: 'Test content',
        mission_id: mission.id,
        title: 'Test Report',
      })
      .select();

    assertEquals(data, null);
    assertExists(error);
    assertEquals(error.code, '42501');
  });

  it('should allow admins to create reports for any professional', async () => {
    const professional = await fixtureBuilder.createOnboardedProfessional();
    const structure = await fixtureBuilder.createOnboardedStructure();
    const admin = await fixtureBuilder.createAdminUser();
    fixtures.push(professional, structure, admin);

    const mission = await fixtureBuilder.createMission(
      professional.professionalId!,
      structure.structureId!
    );

    const adminAuthClient = supabaseClient.createAuthenticatedClient(
      admin.token
    );
    const { data, error } = await adminAuthClient
      .from('reports')
      .insert({
        author_id: professional.professionalId!,
        content: 'Test content',
        mission_id: mission.id,
        title: 'Test Report',
      })
      .select('id, author_id')
      .single();

    assertEquals(error, null);
    assertExists(data);
    assertEquals(data.author_id, professional.professionalId);
  });

  it('should prevent structures from creating reports', async () => {
    const professional = await fixtureBuilder.createOnboardedProfessional();
    const structure1 = await fixtureBuilder.createOnboardedStructure();
    const structure2 = await fixtureBuilder.createOnboardedStructure();
    fixtures.push(professional, structure1, structure2);

    const mission = await fixtureBuilder.createMission(
      professional.professionalId!,
      structure2.structureId!
    );

    const structureClient = supabaseClient.createAuthenticatedClient(
      structure1.token
    );
    const { data, error } = await structureClient
      .from('reports')
      .insert({
        author_id: professional.professionalId!,
        content: 'Test content',
        mission_id: mission.id,
        title: 'Test Report',
      })
      .select();

    assertEquals(data, null);
    assertExists(error);
    assertEquals(error.code, '42501');
  });

  it('should prevent non-member professionals from creating reports', async () => {
    const professional = await fixtureBuilder.createOnboardedProfessional();
    const structure = await fixtureBuilder.createOnboardedStructure();
    fixtures.push(professional, structure);

    const { data: mission, error: missionError } = await adminClient
      .from('missions')
      .insert({
        description: 'Test mission description',
        duration_mn: 240,
        professional_id: professional.professionalId!,
        rrule: 'FREQ=DAILY;COUNT=1',
        status: 'accepted',
        structure_id: structure.structureId!,
        title: 'Test Mission',
      })
      .select('id')
      .single();

    assertExists(
      missionError,
      'Mission creation should fail because professional is not a member'
    );
    assertEquals(
      missionError.message.includes('not a member'),
      true,
      'Error should indicate professional is not a member'
    );
    assertEquals(
      mission,
      null,
      'Mission should not be created without membership'
    );
  });
});

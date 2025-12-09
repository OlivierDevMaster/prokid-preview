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

describe('Reports RLS - SELECT', () => {
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

  it('should prevent unauthenticated users from viewing reports', async () => {
    const professional = await fixtureBuilder.createOnboardedProfessional();
    const structure = await fixtureBuilder.createOnboardedStructure();
    fixtures.push(professional, structure);

    const mission = await fixtureBuilder.createMission(
      professional.professionalId!,
      structure.structureId!
    );

    const { data: report } = await adminClient
      .from('reports')
      .insert({
        author_id: professional.professionalId!,
        content: 'Test content',
        mission_id: mission.id,
        title: 'Test Report',
      })
      .select('id')
      .single();

    assertExists(report);

    const unauthenticatedClient = supabaseClient.createUnauthenticatedClient();
    const { data, error } = await unauthenticatedClient
      .from('reports')
      .select('*')
      .eq('id', report.id);

    assertEquals(error, null);
    assertEquals(data?.length, 0);
  });

  it('should allow professionals to view their own reports', async () => {
    const professional = await fixtureBuilder.createOnboardedProfessional();
    const structure = await fixtureBuilder.createOnboardedStructure();
    fixtures.push(professional, structure);

    const mission = await fixtureBuilder.createMission(
      professional.professionalId!,
      structure.structureId!
    );

    const { data: report } = await adminClient
      .from('reports')
      .insert({
        author_id: professional.professionalId!,
        content: 'Test content',
        mission_id: mission.id,
        title: 'Test Report',
      })
      .select('id')
      .single();

    assertExists(report);

    const authenticatedClient = supabaseClient.createAuthenticatedClient(
      professional.token
    );
    const { data, error } = await authenticatedClient
      .from('reports')
      .select('*')
      .eq('id', report.id);

    assertEquals(error, null);
    assertEquals(data?.length, 1);
    assertEquals(data?.[0].id, report.id);
  });

  it('should prevent professionals from viewing reports they did not create', async () => {
    const professional1 = await fixtureBuilder.createOnboardedProfessional();
    const professional2 = await fixtureBuilder.createOnboardedProfessional();
    const structure = await fixtureBuilder.createOnboardedStructure();
    fixtures.push(professional1, professional2, structure);

    const mission = await fixtureBuilder.createMission(
      professional2.professionalId!,
      structure.structureId!
    );

    const { data: report } = await adminClient
      .from('reports')
      .insert({
        author_id: professional2.professionalId!,
        content: 'Test content',
        mission_id: mission.id,
        title: 'Test Report',
      })
      .select('id')
      .single();

    assertExists(report);

    const authenticatedClient = supabaseClient.createAuthenticatedClient(
      professional1.token
    );
    const { data, error } = await authenticatedClient
      .from('reports')
      .select('*')
      .eq('id', report.id);

    assertEquals(error, null);
    assertEquals(data?.length, 0);
  });

  it('should allow structures to view reports for their missions', async () => {
    const professional = await fixtureBuilder.createOnboardedProfessional();
    const structure = await fixtureBuilder.createOnboardedStructure();
    fixtures.push(professional, structure);

    const mission = await fixtureBuilder.createMission(
      professional.professionalId!,
      structure.structureId!
    );

    const { data: report } = await adminClient
      .from('reports')
      .insert({
        author_id: professional.professionalId!,
        content: 'Test content',
        mission_id: mission.id,
        title: 'Test Report',
      })
      .select('id')
      .single();

    assertExists(report);

    const structureClient = supabaseClient.createAuthenticatedClient(
      structure.token
    );
    const { data, error } = await structureClient
      .from('reports')
      .select('*')
      .eq('id', report.id);

    assertEquals(error, null);
    assertEquals(data?.length, 1);
    assertEquals(data?.[0].id, report.id);
  });

  it('should prevent structures from viewing reports for missions they did not create', async () => {
    const professional = await fixtureBuilder.createOnboardedProfessional();
    const structure1 = await fixtureBuilder.createOnboardedStructure();
    const structure2 = await fixtureBuilder.createOnboardedStructure();
    fixtures.push(professional, structure1, structure2);

    const mission = await fixtureBuilder.createMission(
      professional.professionalId!,
      structure2.structureId!
    );

    const { data: report } = await adminClient
      .from('reports')
      .insert({
        author_id: professional.professionalId!,
        content: 'Test content',
        mission_id: mission.id,
        title: 'Test Report',
      })
      .select('id')
      .single();

    assertExists(report);

    const structureClient = supabaseClient.createAuthenticatedClient(
      structure1.token
    );
    const { data, error } = await structureClient
      .from('reports')
      .select('*')
      .eq('id', report.id);

    assertEquals(error, null);
    assertEquals(data?.length, 0);
  });

  it('should allow admins to view all reports', async () => {
    const professional = await fixtureBuilder.createOnboardedProfessional();
    const structure = await fixtureBuilder.createOnboardedStructure();
    const admin = await fixtureBuilder.createAdminUser();
    fixtures.push(professional, structure, admin);

    const mission = await fixtureBuilder.createMission(
      professional.professionalId!,
      structure.structureId!
    );

    const { data: report } = await adminClient
      .from('reports')
      .insert({
        author_id: professional.professionalId!,
        content: 'Test content',
        mission_id: mission.id,
        title: 'Test Report',
      })
      .select('id')
      .single();

    assertExists(report);

    const adminAuthClient = supabaseClient.createAuthenticatedClient(
      admin.token
    );
    const { data, error } = await adminAuthClient
      .from('reports')
      .select('*')
      .eq('id', report.id);

    assertEquals(error, null);
    assertEquals(data?.length, 1);
    assertEquals(data?.[0].id, report.id);
  });
});

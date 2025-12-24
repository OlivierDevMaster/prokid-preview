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

describe('Reports RLS - DELETE', () => {
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

  it('should prevent unauthenticated users from deleting reports', async () => {
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
      .delete()
      .eq('id', report.id)
      .select();

    if (error) {
      assertEquals(error.code, '42501');
    } else {
      assertEquals(data, []);
    }

    const { data: stillExists } = await adminClient
      .from('reports')
      .select('id')
      .eq('id', report.id)
      .single();

    assertExists(stillExists);
  });

  it('should allow professionals to delete their own reports', async () => {
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
      .delete()
      .eq('id', report.id)
      .select();

    assertEquals(error, null);
    assertExists(data);
    assertEquals(data.length, 1);

    const { data: deleted } = await adminClient
      .from('reports')
      .select('id')
      .eq('id', report.id)
      .single();

    assertEquals(deleted, null);
  });

  it('should prevent professionals from deleting reports they did not create', async () => {
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
      .delete()
      .eq('id', report.id)
      .select();

    if (error) {
      assertEquals(error.code, '42501');
    } else {
      assertEquals(data, []);
    }

    const { data: stillExists } = await adminClient
      .from('reports')
      .select('id')
      .eq('id', report.id)
      .single();

    assertExists(stillExists);
  });

  it('should allow admins to delete any report', async () => {
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
      .delete()
      .eq('id', report.id)
      .select();

    assertEquals(error, null);
    assertExists(data);
    assertEquals(data.length, 1);

    const { data: deleted } = await adminClient
      .from('reports')
      .select('id')
      .eq('id', report.id)
      .single();

    assertEquals(deleted, null);
  });

  it('should prevent structures from deleting reports', async () => {
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
      .delete()
      .eq('id', report.id)
      .select();

    if (error) {
      assertEquals(error.code, '42501');
    } else {
      assertEquals(data, []);
    }

    const { data: stillExists } = await adminClient
      .from('reports')
      .select('id')
      .eq('id', report.id)
      .single();

    assertExists(stillExists);
  });
});

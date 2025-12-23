import { assertEquals, assertExists } from '@std/assert';
import '@std/dotenv/load';
import { afterEach, beforeEach, describe, it } from '@std/testing/bdd';

import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';
import { TriggerTestData } from './sync_professional_rating_on_change.data.ts';
import {
  TriggerTestCleanupHelper,
  TriggerTestFixture,
  TriggerTestFixtureBuilder,
} from './sync_professional_rating_on_change.fixture.ts';

describe('Trigger: sync_professional_rating_on_change', () => {
  let supabaseClient: SupabaseTestClient;
  let adminClient: ReturnType<SupabaseTestClient['createAdminClient']>;
  let fixtureBuilder: TriggerTestFixtureBuilder;
  let cleanupHelper: TriggerTestCleanupHelper;
  let fixtures: TriggerTestFixture[] = [];

  beforeEach(() => {
    supabaseClient = SupabaseTestClient.getInstance();
    adminClient = supabaseClient.createAdminClient();
    fixtureBuilder = new TriggerTestFixtureBuilder(adminClient, supabaseClient);
    cleanupHelper = new TriggerTestCleanupHelper(adminClient);
    fixtures = [];
  });

  afterEach(async () => {
    for (const fixture of fixtures) {
      await cleanupHelper.cleanupFixture(fixture);
    }
    fixtures = [];
  });

  it('should update professional rating stats when a rating is inserted', async () => {
    const fixture = await fixtureBuilder.createActiveMembership();
    fixtures.push(fixture);

    const { data: rating } = await adminClient
      .from('professional_ratings')
      .insert({
        comment: 'Test comment',
        membership_id: fixture.membershipId,
        professional_id: fixture.professionalId,
        rating: TriggerTestData.ratings.high,
        structure_id: fixture.structureId,
      })
      .select('id')
      .single();

    assertExists(rating);
    fixture.ratingId = rating.id;

    await new Promise(resolve => setTimeout(resolve, 200));

    const { data: professionalData, error: professionalError } =
      await adminClient
        .from('professionals')
        .select('rating, reviews_count')
        .eq('user_id', fixture.professionalId)
        .single();

    assertEquals(professionalError, null);
    assertExists(professionalData);
    assertEquals(professionalData.rating, TriggerTestData.ratings.high);
    assertEquals(professionalData.reviews_count, 1);
  });

  it('should update professional rating stats when a rating is updated', async () => {
    const fixture = await fixtureBuilder.createActiveMembership();
    fixtures.push(fixture);

    const { data: rating } = await adminClient
      .from('professional_ratings')
      .insert({
        comment: 'Test comment',
        membership_id: fixture.membershipId,
        professional_id: fixture.professionalId,
        rating: TriggerTestData.ratings.medium,
        structure_id: fixture.structureId,
      })
      .select('id')
      .single();

    assertExists(rating);
    fixture.ratingId = rating.id;

    await new Promise(resolve => setTimeout(resolve, 200));

    await adminClient
      .from('professional_ratings')
      .update({ rating: TriggerTestData.ratings.high })
      .eq('id', rating.id);

    await new Promise(resolve => setTimeout(resolve, 200));

    const { data: professionalData, error: professionalError } =
      await adminClient
        .from('professionals')
        .select('rating, reviews_count')
        .eq('user_id', fixture.professionalId)
        .single();

    assertEquals(professionalError, null);
    assertExists(professionalData);
    assertEquals(professionalData.rating, TriggerTestData.ratings.high);
    assertEquals(professionalData.reviews_count, 1);
  });

  it('should update professional rating stats when a rating is deleted', async () => {
    const fixture = await fixtureBuilder.createActiveMembership();
    fixtures.push(fixture);

    const { data: rating } = await adminClient
      .from('professional_ratings')
      .insert({
        comment: 'Test comment',
        membership_id: fixture.membershipId,
        professional_id: fixture.professionalId,
        rating: TriggerTestData.ratings.high,
        structure_id: fixture.structureId,
      })
      .select('id')
      .single();

    assertExists(rating);
    fixture.ratingId = rating.id;

    await new Promise(resolve => setTimeout(resolve, 200));

    await adminClient.from('professional_ratings').delete().eq('id', rating.id);

    await new Promise(resolve => setTimeout(resolve, 200));

    const { data: professionalData, error: professionalError } =
      await adminClient
        .from('professionals')
        .select('rating, reviews_count')
        .eq('user_id', fixture.professionalId)
        .single();

    assertEquals(professionalError, null);
    assertExists(professionalData);
    assertEquals(professionalData.rating, 0);
    assertEquals(professionalData.reviews_count, 0);
  });

  it('should calculate average rating correctly with multiple ratings', async () => {
    const fixture = await fixtureBuilder.createActiveMembership();
    fixtures.push(fixture);

    // Create second structure and membership for same professional
    const structure2Email = `test-structure2-${Date.now()}@example.com`;
    const { data: structure2AuthData } =
      await adminClient.auth.admin.createUser({
        email: structure2Email,
        email_confirm: true,
        password: 'testpassword123',
        user_metadata: { role: 'structure' },
      });

    const structure2Id = structure2AuthData.user.id;
    await new Promise(resolve => setTimeout(resolve, 200));

    await adminClient.from('structures').insert({
      name: 'Test Structure 2',
      user_id: structure2Id,
    });

    const { data: membership2 } = await adminClient
      .from('structure_members')
      .insert({
        professional_id: fixture.professionalId,
        structure_id: structure2Id,
      })
      .select('id')
      .single();

    // Create first rating
    const { data: rating1 } = await adminClient
      .from('professional_ratings')
      .insert({
        comment: 'First rating',
        membership_id: fixture.membershipId,
        professional_id: fixture.professionalId,
        rating: 4.0,
        structure_id: fixture.structureId,
      })
      .select('id')
      .single();

    assertExists(rating1);
    fixture.ratingId = rating1.id;

    await new Promise(resolve => setTimeout(resolve, 200));

    // Create second rating
    const { data: rating2 } = await adminClient
      .from('professional_ratings')
      .insert({
        comment: 'Second rating',
        membership_id: membership2.id,
        professional_id: fixture.professionalId,
        rating: 5.0,
        structure_id: structure2Id,
      })
      .select('id')
      .single();

    assertExists(rating2);

    await new Promise(resolve => setTimeout(resolve, 200));

    const { data: professionalData, error: professionalError } =
      await adminClient
        .from('professionals')
        .select('rating, reviews_count')
        .eq('user_id', fixture.professionalId)
        .single();

    assertEquals(professionalError, null);
    assertExists(professionalData);
    assertEquals(professionalData.rating, 4.5);
    assertEquals(professionalData.reviews_count, 2);

    // Cleanup structure 2
    await adminClient
      .from('structure_members')
      .delete()
      .eq('id', membership2.id);
    await adminClient.from('structures').delete().eq('user_id', structure2Id);
    await adminClient.from('profiles').delete().eq('user_id', structure2Id);
    await adminClient.auth.admin.deleteUser(structure2Id);
  });

  it('should handle deletion of one rating when multiple ratings exist', async () => {
    const fixture = await fixtureBuilder.createActiveMembership();
    fixtures.push(fixture);

    // Create second structure and membership for same professional
    const structure2Email = `test-structure2-${Date.now()}@example.com`;
    const { data: structure2AuthData } =
      await adminClient.auth.admin.createUser({
        email: structure2Email,
        email_confirm: true,
        password: 'testpassword123',
        user_metadata: { role: 'structure' },
      });

    const structure2Id = structure2AuthData.user.id;
    await new Promise(resolve => setTimeout(resolve, 200));

    await adminClient.from('structures').insert({
      name: 'Test Structure 2',
      user_id: structure2Id,
    });

    const { data: membership2 } = await adminClient
      .from('structure_members')
      .insert({
        professional_id: fixture.professionalId,
        structure_id: structure2Id,
      })
      .select('id')
      .single();

    // Create two ratings
    const { data: rating1 } = await adminClient
      .from('professional_ratings')
      .insert({
        comment: 'First rating',
        membership_id: fixture.membershipId,
        professional_id: fixture.professionalId,
        rating: 3.0,
        structure_id: fixture.structureId,
      })
      .select('id')
      .single();

    assertExists(rating1);
    fixture.ratingId = rating1.id;

    const { data: rating2 } = await adminClient
      .from('professional_ratings')
      .insert({
        comment: 'Second rating',
        membership_id: membership2.id,
        professional_id: fixture.professionalId,
        rating: 5.0,
        structure_id: structure2Id,
      })
      .select('id')
      .single();

    assertExists(rating2);

    await new Promise(resolve => setTimeout(resolve, 200));

    // Delete first rating
    await adminClient
      .from('professional_ratings')
      .delete()
      .eq('id', rating1.id);

    await new Promise(resolve => setTimeout(resolve, 200));

    const { data: professionalData, error: professionalError } =
      await adminClient
        .from('professionals')
        .select('rating, reviews_count')
        .eq('user_id', fixture.professionalId)
        .single();

    assertEquals(professionalError, null);
    assertExists(professionalData);
    assertEquals(professionalData.rating, 5.0);
    assertEquals(professionalData.reviews_count, 1);

    // Cleanup structure 2
    await adminClient
      .from('structure_members')
      .delete()
      .eq('id', membership2.id);
    await adminClient.from('structures').delete().eq('user_id', structure2Id);
    await adminClient.from('profiles').delete().eq('user_id', structure2Id);
    await adminClient.auth.admin.deleteUser(structure2Id);
  });

  it('should set rating to 0 and count to 0 when all ratings are deleted', async () => {
    const fixture = await fixtureBuilder.createActiveMembership();
    fixtures.push(fixture);

    const { data: rating } = await adminClient
      .from('professional_ratings')
      .insert({
        comment: 'Test comment',
        membership_id: fixture.membershipId,
        professional_id: fixture.professionalId,
        rating: TriggerTestData.ratings.high,
        structure_id: fixture.structureId,
      })
      .select('id')
      .single();

    assertExists(rating);
    fixture.ratingId = rating.id;

    await new Promise(resolve => setTimeout(resolve, 200));

    // Verify rating was set
    const { data: beforeDelete } = await adminClient
      .from('professionals')
      .select('rating, reviews_count')
      .eq('user_id', fixture.professionalId)
      .single();

    assertEquals(beforeDelete?.rating, TriggerTestData.ratings.high);
    assertEquals(beforeDelete?.reviews_count, 1);

    // Delete rating
    await adminClient.from('professional_ratings').delete().eq('id', rating.id);

    await new Promise(resolve => setTimeout(resolve, 200));

    const { data: professionalData, error: professionalError } =
      await adminClient
        .from('professionals')
        .select('rating, reviews_count')
        .eq('user_id', fixture.professionalId)
        .single();

    assertEquals(professionalError, null);
    assertExists(professionalData);
    assertEquals(professionalData.rating, 0);
    assertEquals(professionalData.reviews_count, 0);
  });
});

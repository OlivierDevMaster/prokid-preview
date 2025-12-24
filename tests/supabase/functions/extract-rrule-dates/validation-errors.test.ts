import '@std/dotenv/load';
import { afterEach, beforeEach, describe, it } from '@std/testing/bdd';

import { ApiTestHelper } from '../../helpers/ApiHelper.ts';
import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';
import { ExtractRruleDatesAssertions } from './extractRruleDates.assertion.ts';
import { ExtractRruleDatesTestData } from './extractRruleDates.data.ts';
import {
  ExtractRruleDatesCleanupHelper,
  ExtractRruleDatesTestFixture,
} from './extractRruleDates.fixture.ts';

describe('Validation errors', () => {
  let supabaseClient: SupabaseTestClient;
  let apiHelper: ApiTestHelper;
  let cleanupHelper: ExtractRruleDatesCleanupHelper;
  let fixture: ExtractRruleDatesTestFixture;

  beforeEach(() => {
    supabaseClient = SupabaseTestClient.getInstance();
    const adminClient = supabaseClient.createAdminClient();
    apiHelper = new ApiTestHelper(supabaseClient);
    cleanupHelper = new ExtractRruleDatesCleanupHelper(adminClient);
  });

  afterEach(async () => {
    if (fixture) {
      await cleanupHelper.cleanupFixture(fixture);
    }
  });

  it('should return validation error for missing record_id', async () => {
    // Arrange
    const body = ExtractRruleDatesTestData.invalidBodyMissingRecordId;

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body,
      method: 'POST',
      name: 'extract-rrule-dates',
      path: '/',
      token: null,
    });

    // Assert
    ExtractRruleDatesAssertions.assertValidationError(response, data);
    ExtractRruleDatesAssertions.assertContentType(response);
  });

  it('should return validation error for missing table_name', async () => {
    // Arrange
    const body = ExtractRruleDatesTestData.invalidBodyMissingTableName;

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body,
      method: 'POST',
      name: 'extract-rrule-dates',
      path: '/',
      token: null,
    });

    // Assert
    ExtractRruleDatesAssertions.assertValidationError(response, data);
    ExtractRruleDatesAssertions.assertContentType(response);
  });

  it('should return validation error for invalid record_id format', async () => {
    // Arrange
    const body = ExtractRruleDatesTestData.invalidBodyInvalidRecordId;

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body,
      method: 'POST',
      name: 'extract-rrule-dates',
      path: '/',
      token: null,
    });

    // Assert
    ExtractRruleDatesAssertions.assertValidationError(response, data);
    ExtractRruleDatesAssertions.assertContentType(response);
  });

  it('should return validation error for invalid table_name', async () => {
    // Arrange
    const body = ExtractRruleDatesTestData.invalidBodyInvalidTableName;

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body,
      method: 'POST',
      name: 'extract-rrule-dates',
      path: '/',
      token: null,
    });

    // Assert
    ExtractRruleDatesAssertions.assertValidationError(response, data);
    ExtractRruleDatesAssertions.assertContentType(response);
  });

  it('should return validation error for empty request body', async () => {
    // Arrange
    const body = {};

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body,
      method: 'POST',
      name: 'extract-rrule-dates',
      path: '/',
      token: null,
    });

    // Assert
    ExtractRruleDatesAssertions.assertValidationError(response, data);
    ExtractRruleDatesAssertions.assertContentType(response);
  });

  it('should return validation error for null request body', async () => {
    // Arrange
    const body = null;

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body,
      method: 'POST',
      name: 'extract-rrule-dates',
      path: '/',
      token: null,
    });

    // Assert
    ExtractRruleDatesAssertions.assertValidationError(response, data);
    ExtractRruleDatesAssertions.assertContentType(response);
  });
});

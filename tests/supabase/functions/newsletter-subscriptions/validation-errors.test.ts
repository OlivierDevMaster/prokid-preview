import '@std/dotenv/load';
import { beforeEach, describe, it } from '@std/testing/bdd';

import { ApiTestHelper } from '../../helpers/ApiHelper.ts';
import { SupabaseTestClient } from '../../helpers/SupabaseTestClient.ts';
import { NewsletterSubscriptionAssertions } from './newsletterSubscription.assertion.ts';
import { NewsletterSubscriptionTestData } from './newsletterSubscription.data.ts';

describe('Newsletter subscription validation errors', () => {
  let supabaseClient: SupabaseTestClient;
  let apiHelper: ApiTestHelper;

  beforeEach(() => {
    supabaseClient = SupabaseTestClient.getInstance();
    apiHelper = new ApiTestHelper(supabaseClient);
  });

  it('should return validation error when email is missing', async () => {
    // Arrange
    const requestBody =
      NewsletterSubscriptionTestData.invalidSubscriptionRequestMissingEmail;

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: requestBody,
      method: 'POST',
      name: 'newsletter-subscriptions',
      token: null,
    });

    // Assert
    NewsletterSubscriptionAssertions.assertValidationError(response, data);
  });

  it('should return validation error when email is invalid', async () => {
    // Arrange
    const requestBody =
      NewsletterSubscriptionTestData.invalidSubscriptionRequestInvalidEmail;

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: requestBody,
      method: 'POST',
      name: 'newsletter-subscriptions',
      token: null,
    });

    // Assert
    NewsletterSubscriptionAssertions.assertValidationError(response, data);
  });

  it('should return validation error when email is empty', async () => {
    // Arrange
    const requestBody =
      NewsletterSubscriptionTestData.invalidSubscriptionRequestEmptyEmail;

    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: requestBody,
      method: 'POST',
      name: 'newsletter-subscriptions',
      token: null,
    });

    // Assert
    NewsletterSubscriptionAssertions.assertValidationError(response, data);
  });

  it('should return validation error when request body is empty', async () => {
    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: {},
      method: 'POST',
      name: 'newsletter-subscriptions',
      token: null,
    });

    // Assert
    NewsletterSubscriptionAssertions.assertBadRequestError(
      response,
      data,
      'EMPTY_REQUEST_BODY'
    );
  });

  it('should return validation error when request body is null', async () => {
    // Act
    const { data, response } = await apiHelper.invokeEndpoint({
      body: null,
      method: 'POST',
      name: 'newsletter-subscriptions',
      token: null,
    });

    // Assert
    NewsletterSubscriptionAssertions.assertBadRequestError(
      response,
      data,
      'INVALID_JSON'
    );
  });
});

import { assertEquals, assertExists } from '@std/assert';

import type { ApiResponse } from '../../../../types/api/responses.ts';

export class NewsletterSubscriptionAssertions {
  static assertBadRequestError(
    response: Response,
    data: unknown,
    expectedCode: string
  ): void {
    assertEquals(
      response.status,
      400,
      'Bad request error should return 400 status'
    );

    const apiResponse = data as ApiResponse<unknown>;
    assertExists(apiResponse, 'Response should exist');
    assertEquals(
      apiResponse.success,
      false,
      'Response should indicate failure'
    );
    assertExists(apiResponse.error, 'Response should have error');
    assertEquals(
      apiResponse.error?.code,
      expectedCode,
      `Error code should be ${expectedCode}`
    );
  }

  static assertConflictError(response: Response, data: unknown): void {
    assertEquals(
      response.status,
      409,
      'Conflict error should return 409 status'
    );

    const apiResponse = data as ApiResponse<unknown>;
    assertExists(apiResponse, 'Response should exist');
    assertEquals(
      apiResponse.success,
      false,
      'Response should indicate failure'
    );
    assertExists(apiResponse.error, 'Response should have error');
    assertEquals(
      apiResponse.error?.code,
      'EMAIL_ALREADY_SUBSCRIBED',
      'Error code should be EMAIL_ALREADY_SUBSCRIBED'
    );
  }

  static assertContentType(response: Response): void {
    const contentType = response.headers.get('content-type');
    assertExists(contentType);
    assertEquals(
      contentType.includes('application/json'),
      true,
      'Response should have JSON content type'
    );
  }

  static assertRecentlyCreated(subscription: { created_at: string }): void {
    const createdAt = new Date(subscription.created_at);
    const now = new Date();
    const diff = now.getTime() - createdAt.getTime();
    assertEquals(
      diff >= 0 && diff < 5000,
      true,
      'Subscription should be created recently (within 5 seconds)'
    );
  }

  static assertSuccessfulSubscription(
    response: Response,
    data: unknown,
    requestBody: { email: string; name?: null | string }
  ): void {
    assertEquals(response.status, 201, 'Response should have 201 status');
    assertExists(data, 'Response should have data');

    const subscription = data as {
      created_at: string;
      email: string;
      id: string;
      name: null | string;
    };

    assertExists(subscription.id, 'Subscription should have an id');
    assertEquals(
      subscription.email,
      requestBody.email,
      'Subscription email should match request'
    );
    assertEquals(
      subscription.name,
      requestBody.name ?? null,
      'Subscription name should match request'
    );
    assertExists(
      subscription.created_at,
      'Subscription should have created_at timestamp'
    );
  }

  static assertValidationError(response: Response, data: unknown): void {
    assertEquals(
      response.status,
      400,
      'Validation error should return 400 status'
    );

    const apiResponse = data as ApiResponse<unknown>;
    assertExists(apiResponse, 'Response should exist');
    assertEquals(
      apiResponse.success,
      false,
      'Response should indicate failure'
    );
    assertExists(apiResponse.error, 'Response should have error');
    assertEquals(
      apiResponse.error?.code,
      'VALIDATION_ERROR',
      'Error code should be VALIDATION_ERROR'
    );
  }

  static assertValidTimestamps(subscription: { created_at: string }): void {
    assertExists(
      subscription.created_at,
      'Subscription should have created_at timestamp'
    );
    const createdAt = new Date(subscription.created_at);
    assertExists(createdAt.getTime(), 'created_at should be a valid date');
  }
}

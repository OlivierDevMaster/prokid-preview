/* eslint-disable @typescript-eslint/no-explicit-any */
// deno-lint-ignore-file no-explicit-any
import { assertEquals, assertExists, assertInstanceOf } from '@std/assert';

export class ProfessionalAssertions {
  /**
   * Assert bad request error response
   */
  static assertBadRequest(
    response: Response,
    data: any,
    expectedCode?: string
  ) {
    assertEquals(response.status, 400);
    assertExists(data);
    assertExists(data.success);
    assertEquals(data.success, false);
    assertExists(data.error);
    if (expectedCode) {
      assertEquals(data.error.code, expectedCode);
    }
  }

  /**
   * Assert content type is JSON
   */
  static assertContentType(response: Response) {
    const contentType = response.headers.get('content-type');
    assertExists(contentType);
    assertEquals(contentType.includes('application/json'), true);
  }

  /**
   * Assert professional belongs to user
   */
  static assertProfessionalBelongsToUser(professional: any, userId: string) {
    assertEquals(professional.user_id, userId);
  }

  /**
   * Assert professional has profile
   */
  static assertProfessionalHasProfile(professional: any) {
    assertExists(professional.profile);
    assertExists(professional.profile.user_id);
    assertExists(professional.profile.email);
    assertEquals(professional.profile.is_onboarded, true);
  }

  /**
   * Assert professional structure is valid
   */
  static assertProfessionalStructure(professional: any) {
    assertExists(professional.user_id);
    assertExists(professional.city);
    assertExists(professional.postal_code);
    assertExists(professional.intervention_radius_km);
    assertExists(professional.experience_years);
    assertExists(professional.hourly_rate);
    assertExists(professional.skills);
    assertInstanceOf(professional.skills, Array);
    assertExists(professional.created_at);
    assertExists(professional.updated_at);
  }

  /**
   * Assert professional was recently created
   */
  static assertRecentlyCreated(professional: any, maxAgeSeconds = 5) {
    const createdAt = new Date(professional.created_at);
    const now = new Date();
    const ageSeconds = (now.getTime() - createdAt.getTime()) / 1000;
    assertEquals(ageSeconds < maxAgeSeconds, true);
  }

  /**
   * Assert successful onboarding response
   */
  static assertSuccessfulOnboarding(
    response: Response,
    data: any,
    requestBody: any
  ) {
    assertEquals(response.status, 200);
    assertExists(data);

    const professional = data;
    assertExists(professional.user_id);
    assertEquals(professional.city, requestBody.city);
    assertEquals(professional.postal_code, requestBody.postalCode);
    assertEquals(professional.description, requestBody.description);
    assertEquals(professional.experience_years, requestBody.experienceYears);
    assertEquals(professional.hourly_rate, requestBody.hourlyRate);
    assertEquals(
      professional.intervention_radius_km,
      requestBody.interventionRadiusKm
    );
    assertEquals(professional.phone, requestBody.phone);
    assertExists(professional.skills);
    assertEquals(professional.skills.length, requestBody.skills.length);
    assertExists(professional.created_at);
    assertExists(professional.updated_at);
  }

  /**
   * Assert unauthorized error response
   */
  static assertUnauthorized(response: Response, data: any) {
    assertEquals(response.status, 401);
    assertExists(data);
    assertExists(data.success);
    assertEquals(data.success, false);
    assertExists(data.error);
  }

  /**
   * Assert validation error response
   */
  static assertValidationError(response: Response, data: any) {
    this.assertBadRequest(response, data);
    assertExists(data.error.message);
  }

  /**
   * Assert valid timestamps
   */
  static assertValidTimestamps(professional: any) {
    assertExists(professional.created_at);
    assertExists(professional.updated_at);
    const createdAt = new Date(professional.created_at);
    const updatedAt = new Date(professional.updated_at);
    assertInstanceOf(createdAt, Date);
    assertInstanceOf(updatedAt, Date);
  }
}

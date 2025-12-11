// deno-lint-ignore-file no-explicit-any
/* eslint-disable @typescript-eslint/no-explicit-any */
import { assertEquals, assertExists, assertInstanceOf } from '@std/assert';

export class MissionAssertions {
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
   * Assert conflict error response (e.g., mission overlap)
   */
  static assertConflict(response: Response, data: any, expectedCode?: string) {
    assertEquals(response.status, 409);
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
   * Assert forbidden error response
   */
  static assertForbidden(response: Response, data: any) {
    assertEquals(response.status, 403);
    assertExists(data);
    assertExists(data.success);
    assertEquals(data.success, false);
    assertExists(data.error);
  }

  /**
   * Assert internal server error response
   */
  static assertInternalServerError(response: Response, data: any) {
    assertEquals(response.status, 500);
    assertExists(data);
    assertExists(data.success);
    assertEquals(data.success, false);
    assertExists(data.error);
  }

  /**
   * Assert mission schedule structure is valid
   */
  static assertMissionScheduleStructure(schedule: any) {
    assertExists(schedule);
    assertExists(schedule.id);
    assertExists(schedule.mission_id);
    assertExists(schedule.rrule);
    assertExists(schedule.duration_mn);
    assertExists(schedule.dtstart);
    assertExists(schedule.until);
    assertExists(schedule.created_at);
    assertExists(schedule.updated_at);

    assertEquals(typeof schedule.id, 'string');
    assertEquals(typeof schedule.mission_id, 'string');
    assertEquals(typeof schedule.rrule, 'string');
    assertEquals(typeof schedule.duration_mn, 'number');
    assertEquals(schedule.duration_mn > 0, true);
  }

  /**
   * Assert mission structure is valid
   */
  static assertMissionStructure(mission: any) {
    assertExists(mission);
    assertExists(mission.id);
    assertExists(mission.title);
    assertExists(mission.structure_id);
    assertExists(mission.professional_id);
    assertExists(mission.status);
    assertExists(mission.mission_dtstart);
    assertExists(mission.mission_until);
    assertExists(mission.created_at);
    assertExists(mission.updated_at);

    assertEquals(typeof mission.id, 'string');
    assertEquals(typeof mission.title, 'string');
    assertEquals(typeof mission.structure_id, 'string');
    assertEquals(typeof mission.professional_id, 'string');
    assertEquals(typeof mission.status, 'string');
    assertEquals(
      ['accepted', 'cancelled', 'declined', 'pending'].includes(mission.status),
      true
    );
  }

  /**
   * Assert not found error response
   */
  static assertNotFound(response: Response, data: any) {
    assertEquals(response.status, 404);
    assertExists(data);
    assertExists(data.success);
    assertEquals(data.success, false);
    assertExists(data.error);
  }

  /**
   * Assert overlap data structure
   */
  static assertOverlapStructure(overlap: any) {
    assertExists(overlap);
    assertExists(overlap.mission_id);
    assertExists(overlap.overlapping_date);
    assertEquals(typeof overlap.mission_id, 'string');
    assertEquals(typeof overlap.overlapping_date, 'string');
    // Verify overlapping_date is a valid ISO date string
    const date = new Date(overlap.overlapping_date);
    assertEquals(isNaN(date.getTime()), false);
  }

  /**
   * Assert response has proper JSON structure
   */
  static assertResponseStructure(data: any) {
    assertExists(data);
    assertInstanceOf(data, Object);
  }

  /**
   * Assert successful mission creation response
   * Handles both old structure (mission directly) and new structure ({ mission, overlaps? })
   */
  static assertSuccessfulCreation(response: Response, data: any) {
    assertEquals(response.status, 201);
    assertExists(data);
    // Handle new response structure with mission wrapper
    const mission = data.mission || data;
    this.assertMissionStructure(mission);
  }

  /**
   * Assert successful mission update response
   * Handles both old structure (mission directly) and new structure ({ mission, overlaps? })
   */
  static assertSuccessfulUpdate(response: Response, data: any) {
    assertEquals(response.status, 200);
    assertExists(data);
    // Handle new response structure with mission wrapper
    const mission = data.mission || data;
    this.assertMissionStructure(mission);
  }

  /**
   * Assert unauthorized error response
   */
  static assertUnauthorized(response: Response, data: any) {
    assertEquals(response.status, 401);
    assertExists(data);

    // Handle both our custom error format and Supabase's built-in error format
    if (data.success !== undefined) {
      // Our custom error format
      assertEquals(data.success, false);
      assertExists(data.error);
    } else if (data.msg) {
      // Supabase's built-in error format for invalid JWT
      assertEquals(data.msg, 'Invalid JWT');
    } else if (data.code === 401 && data.message === 'Invalid JWT') {
      // Supabase function invocation error format for invalid JWT
      assertEquals(data.code, 401);
      assertEquals(data.message, 'Invalid JWT');
    } else {
      throw new Error(`Unexpected error format: ${JSON.stringify(data)}`);
    }
  }

  /**
   * Assert validation error response
   */
  static assertValidationError(
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
}

// deno-lint-ignore-file no-explicit-any
/* eslint-disable @typescript-eslint/no-explicit-any */
import { assertEquals, assertExists, assertInstanceOf } from '@std/assert';

export class AvailabilityAssertions {
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
   * Assert invalid date format error
   */
  static assertInvalidDateFormat(response: Response, data: any) {
    this.assertBadRequest(response, data, 'INVALID_DATE_FORMAT');
  }

  /**
   * Assert invalid date range error
   */
  static assertInvalidDateRange(response: Response, data: any) {
    this.assertBadRequest(response, data, 'INVALID_DATE_RANGE');
  }

  /**
   * Assert invalid professional ID error
   */
  static assertInvalidProfessionalId(response: Response, data: any) {
    this.assertBadRequest(response, data);
  }

  /**
   * Assert missing professional ID error
   */
  static assertMissingProfessionalId(response: Response, data: any) {
    this.assertBadRequest(response, data);
  }

  /**
   * Assert missing startAt error
   */
  static assertMissingStartAt(response: Response, data: any) {
    this.assertBadRequest(response, data);
  }

  /**
   * Assert missing endAt error
   */
  static assertMissingEndAt(response: Response, data: any) {
    this.assertBadRequest(response, data);
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
   * Assert response has proper JSON structure
   */
  static assertResponseStructure(data: any) {
    assertExists(data);
    assertInstanceOf(data, Object);
  }

  /**
   * Assert successful availability slots response
   */
  static assertSuccessfulSlotsResponse(
    response: Response,
    data: any,
    expectedMinSlots?: number
  ) {
    assertEquals(response.status, 200);
    assertExists(data);
    assertInstanceOf(data, Array);
    if (expectedMinSlots !== undefined) {
      assertEquals(data.length >= expectedMinSlots, true);
    }
  }

  /**
   * Assert availability slot structure is valid
   */
  static assertSlotStructure(slot: any) {
    assertExists(slot);
    assertExists(slot.startAt);
    assertExists(slot.endAt);
    assertEquals(typeof slot.startAt, 'string');
    assertEquals(typeof slot.endAt, 'string');

    // Validate ISO 8601 date format
    const startDate = new Date(slot.startAt);
    const endDate = new Date(slot.endAt);
    assertInstanceOf(startDate, Date);
    assertInstanceOf(endDate, Date);
    assertEquals(isNaN(startDate.getTime()), false);
    assertEquals(isNaN(endDate.getTime()), false);

    // End date should be after start date
    assertEquals(endDate > startDate, true);
  }

  /**
   * Assert slots are sorted by startAt
   */
  static assertSlotsSorted(slots: any[]) {
    for (let i = 1; i < slots.length; i++) {
      const prevStart = new Date(slots[i - 1].startAt);
      const currStart = new Date(slots[i].startAt);
      assertEquals(currStart >= prevStart, true);
    }
  }

  /**
   * Assert slots are within date range
   */
  static assertSlotsInDateRange(
    slots: any[],
    startAt: string,
    endAt: string
  ) {
    const rangeStart = new Date(startAt);
    const rangeEnd = new Date(endAt);

    for (const slot of slots) {
      const slotStart = new Date(slot.startAt);
      const slotEnd = new Date(slot.endAt);

      // Slot should start within or at the start of the range
      assertEquals(slotStart >= rangeStart, true);
      // Slot should end within or at the end of the range
      assertEquals(slotEnd <= rangeEnd, true);
    }
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


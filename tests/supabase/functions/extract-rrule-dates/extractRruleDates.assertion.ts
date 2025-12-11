// deno-lint-ignore-file no-explicit-any
/* eslint-disable @typescript-eslint/no-explicit-any */
import { assertEquals, assertExists } from '@std/assert';

export class ExtractRruleDatesAssertions {
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
   * Assert invalid record error response
   */
  static assertInvalidRecord(response: Response, data: any) {
    this.assertBadRequest(response, data, 'INVALID_RECORD');
  }

  /**
   * Assert invalid RRULE error response
   */
  static assertInvalidRrule(response: Response, data: any) {
    this.assertBadRequest(response, data, 'INVALID_RRULE');
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
   * Assert successful extraction response
   */
  static assertSuccessfulExtraction(
    response: Response,
    data: any,
    expectedDtstart?: null | string,
    expectedUntil?: null | string
  ) {
    assertEquals(response.status, 200);
    assertExists(data);

    // ApiHelper unwraps the response, so data is already the inner data object
    // (the { dtstart, until } object), not the full response structure
    const responseData = data;

    // Check dtstart
    if (expectedDtstart !== undefined) {
      if (expectedDtstart === null) {
        assertEquals(responseData.dtstart, null);
      } else {
        assertExists(responseData.dtstart);
        assertEquals(typeof responseData.dtstart, 'string');
        // Validate ISO 8601 format
        const dtstartDate = new Date(responseData.dtstart);
        assertEquals(isNaN(dtstartDate.getTime()), false);
      }
    } else {
      // dtstart can be null or a valid ISO string
      if (responseData.dtstart !== null) {
        assertEquals(typeof responseData.dtstart, 'string');
        const dtstartDate = new Date(responseData.dtstart);
        assertEquals(isNaN(dtstartDate.getTime()), false);
      }
    }

    // Check until
    if (expectedUntil !== undefined) {
      if (expectedUntil === null) {
        assertEquals(responseData.until, null);
      } else {
        assertExists(responseData.until);
        assertEquals(typeof responseData.until, 'string');
        // Validate ISO 8601 format
        const untilDate = new Date(responseData.until);
        assertEquals(isNaN(untilDate.getTime()), false);
      }
    } else {
      // until can be null or a valid ISO string
      if (responseData.until !== null) {
        assertEquals(typeof responseData.until, 'string');
        const untilDate = new Date(responseData.until);
        assertEquals(isNaN(untilDate.getTime()), false);
      }
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

import { assertEquals, assertExists } from '@std/assert';

import type { MissionDurations } from '../../../../features/mission-durations/missionDuration.model.ts';

export class MissionDurationsAssertions {
  static assertContentType(response: Response): void {
    const contentType = response.headers.get('content-type');
    assertExists(contentType);
    assertEquals(contentType?.includes('application/json'), true);
  }

  static assertDurationsMatch(
    actual: MissionDurations,
    expected: MissionDurations,
    tolerance: number = 0
  ): void {
    assertEquals(
      Math.abs(actual.total_duration_mn - expected.total_duration_mn) <=
        tolerance,
      true,
      `Total duration mismatch: expected ${expected.total_duration_mn}, got ${actual.total_duration_mn}`
    );
    assertEquals(
      Math.abs(actual.past_duration_mn - expected.past_duration_mn) <=
        tolerance,
      true,
      `Past duration mismatch: expected ${expected.past_duration_mn}, got ${actual.past_duration_mn}`
    );
    assertEquals(
      Math.abs(actual.future_duration_mn - expected.future_duration_mn) <=
        tolerance,
      true,
      `Future duration mismatch: expected ${expected.future_duration_mn}, got ${actual.future_duration_mn}`
    );
  }

  static assertErrorResponse(response: Response, expectedStatus: number): void {
    assertEquals(response.status, expectedStatus);
    assertEquals(response.ok, false);
  }

  static assertSuccessfulResponse(
    response: Response,
    data: MissionDurations
  ): void {
    assertEquals(response.status, 200);
    assertEquals(response.ok, true);
    assertExists(data);
    assertExists(data.total_duration_mn);
    assertExists(data.past_duration_mn);
    assertExists(data.future_duration_mn);
    assertEquals(typeof data.total_duration_mn, 'number');
    assertEquals(typeof data.past_duration_mn, 'number');
    assertEquals(typeof data.future_duration_mn, 'number');
    assertEquals(data.total_duration_mn >= 0, true);
    assertEquals(data.past_duration_mn >= 0, true);
    assertEquals(data.future_duration_mn >= 0, true);
    assertEquals(
      data.total_duration_mn,
      data.past_duration_mn + data.future_duration_mn
    );
  }
}

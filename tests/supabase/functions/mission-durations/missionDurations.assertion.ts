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
    assertExists(data.percentage);
    assertEquals(typeof data.total_duration_mn, 'number');
    assertEquals(typeof data.past_duration_mn, 'number');
    assertEquals(typeof data.future_duration_mn, 'number');
    assertEquals(typeof data.percentage, 'number');
    assertEquals(data.total_duration_mn >= 0, true);
    assertEquals(data.past_duration_mn >= 0, true);
    assertEquals(data.future_duration_mn >= 0, true);
    assertEquals(data.percentage >= 0, true);
    assertEquals(data.percentage <= 100, true);
    assertEquals(
      data.total_duration_mn,
      data.past_duration_mn + data.future_duration_mn
    );
    // Verify percentage calculation (with small tolerance for rounding)
    if (data.total_duration_mn > 0) {
      const expectedPercentage =
        (data.past_duration_mn / data.total_duration_mn) * 100;
      assertEquals(
        Math.abs(data.percentage - expectedPercentage) < 0.01,
        true,
        `Percentage mismatch: expected ~${expectedPercentage}%, got ${data.percentage}%`
      );
    } else {
      assertEquals(data.percentage, 0);
    }
  }
}

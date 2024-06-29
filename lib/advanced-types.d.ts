export interface TestsStreamEvents {
  'test:diagnostic': TestDiagnosticData
  'test:fail': TestFail
  'test:pass': TestPass
  'test:plan': TestPlan
  'test:start': TestFileEvent
  'test:coverage': TestCoverage
  // Not exposed to custom reporter?
  'test:dequeue': TestFileEvent
  'test:enqueue': TestFileEvent
  'test:stderr': TestStdout
  'test:stdout': TestStdout
  'test:watch:drained': TestEmptyEvent

}

export type TestsStreamEventPayloads = {
  [type in keyof TestsStreamEvents]: {
    type: type,
    data: TestsStreamEvents[type],
  }
}[keyof TestsStreamEvents];

// *** Event payloads not yet in @types/node ***

export interface TestEventBasic {
  nesting: number;
}

export interface TestFileEventBasic extends TestEventBasic {
  file: string | undefined,
}

export interface TestFileEvent extends TestFileEventBasic {
  name: string,
}

export interface TestPlan extends TestFileEventBasic {
  count: number;
}

export interface TestDiagnosticData extends TestFileEventBasic {
  message: string;
}

export interface TestStdout {
  file: string,
  message: string,
}

export interface TestEmptyEvent {}

// *** test:coverage event ***

export interface TestCoverageSummary {
  totalLineCount: number
  totalBranchCount: number
  totalFunctionCount: number
  coveredLineCount: number
  coveredBranchCount: number
  coveredFunctionCount: number
  coveredLinePercent: number
  coveredBranchPercent: number
  coveredFunctionPercent: number
}

export interface TestCoverageSummaryFile extends TestCoverageSummary {
  path: string
  uncoveredLineNumbers: number[]
}

export interface TestCoverage extends TestEventBasic {
  summary: {
    files: TestCoverageSummaryFile[]
    totals: TestCoverageSummary
    workingDirectory: string
  }
}

// *** Somewhat of a copy and paste from @types/node ***

// TODO: Have @types/node export these instead of copy and pasting them here

export interface TestFail extends TestFileEvent {
  /**
   * Additional execution metadata.
   */
  details: {
    /**
     * The duration of the test in milliseconds.
     */
    duration_ms: number;

    /**
     * The error thrown by the test.
     */
    error: Error;
  };

  /**
   * The ordinal number of the test.
   */
  testNumber: number;

  /**
   * Present if `context.todo` is called.
   */
  todo?: string | boolean;

  /**
   * Present if `context.skip` is called.
   */
  skip?: string | boolean;
}

export interface TestPass extends TestFileEvent {
  /**
   * Additional execution metadata.
   */
  details: {
    /**
     * The duration of the test in milliseconds.
     */
    duration_ms: number;
  };

  /**
   * The ordinal number of the test.
   */
  testNumber: number;

  /**
   * Present if `context.todo` is called.
   */
  todo?: string | boolean;

  /**
   * Present if `context.skip` is called.
   */
  skip?: string | boolean;
}

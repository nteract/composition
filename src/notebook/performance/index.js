/**
 * Record a named timestamp
 * @param  {string} name of the timestamp
 */
export function mark(name) {
  if (!(typeof performance !== 'undefined' && performance.mark)) return;
  performance.mark(name);
}

/**
 * Measure a named timespan between two named timestamps.
 * @param  {string} name      name of the timespan
 * @param  {string} startMark name of the start timestamp
 * @param  {string} endMark   name of the end timestamp
 */
export function measure(name, startMark, endMark) {
  if (!(typeof performance !== 'undefined' && performance.measure)) return;
  performance.measure(name, startMark, endMark);
}

/**
 * Get a list of named marks (timestamps) and measures (timespans)
 * @return {PerformanceEntry[]}
 */
export function getEntries() {
  if (!(typeof performance !== 'undefined' && performance.getEntries)) return [];
  return performance.getEntries();
}

/**
 * Clear the performance entries
 */
export function clear() {
  if (!(typeof performance !== 'undefined' && performance.clearMarks &&
                                              performance.clearMeasures)) return;
  performance.clearMarks();
  performance.clearMeasures();
}

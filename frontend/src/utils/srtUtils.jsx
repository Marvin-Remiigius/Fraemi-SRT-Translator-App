export const srtTimeToSeconds = (timeStr) => {
  if (typeof timeStr !== 'string') return NaN;
  // SRT uses a comma for milliseconds, but some files use a period.
  const [h, m, rest] = timeStr.trim().split(':');
  if (rest === undefined) return NaN;
  const [sec, ms = '0'] = rest.split(/[,.]/);
  const seconds =
    parseInt(h, 10) * 3600 + parseInt(m, 10) * 60 + parseInt(sec, 10) + parseInt(ms, 10) / 1000;
  return Number.isNaN(seconds) ? NaN : seconds;
};

/** Characters per second. Returns a fixed-1 string, or '0.0' when undeterminable. */
export const calculateCPS = (timeline, text) => {
  if (typeof timeline !== 'string' || !timeline.includes('-->')) return '0.0';
  const [start, end] = timeline.split('-->').map((s) => s.trim());
  const duration = srtTimeToSeconds(end) - srtTimeToSeconds(start);
  if (!Number.isFinite(duration) || duration <= 0) return '0.0';
  return ((text?.length || 0) / duration).toFixed(1);
};

export const getCPSColor = (cps) => {
  const value = Number(cps);
  if (value > 25) return 'text-red-500';
  if (value > 18) return 'text-brand';
  return 'text-emerald-400';
};

export const parseSRT = (srtText) => {
  if (typeof srtText !== 'string') return [];

  const lines = srtText.trim().split(/\r?\n/);
  const blocks = [];
  let block = [];

  for (const raw of lines) {
    const line = raw.trim();
    // A bare number starts a new cue, but only once the current block has content.
    if (/^\d+$/.test(line) && block.length > 0) {
      blocks.push(block);
      block = [];
    }
    if (line.length > 0) block.push(line);
  }
  if (block.length > 0) blocks.push(block);

  return blocks
    .map((b) =>
      b.length >= 3
        ? { number: b[0], timeline: b[1], text: b.slice(2).join('\n') }
        : null
    )
    .filter(Boolean);
};

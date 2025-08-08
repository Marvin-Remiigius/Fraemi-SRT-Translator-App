
export const srtTimeToSeconds = (timeStr) => {
    const [h, m, s] = timeStr.split(':');
    const [sec, ms] = s.split(',');
    return parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(sec) + parseInt(ms) / 1000;
};

export const calculateCPS = (timeline, text) => {
    const [start, end] = timeline.split(' --> ');
    const duration = srtTimeToSeconds(end) - srtTimeToSeconds(start);
    if (duration === 0) return 0;
    return (text.length / duration).toFixed(1);
};

export const getCPSColor = (cps) => {
    if (cps > 25) return 'text-red-500';
    if (cps > 18) return 'text-yellow-400';
    return 'text-green-400';
};

export const parseSRT = (srtText) => {
    const blocks = srtText.trim().split('\n\n');
    return blocks.map(block => {
        const lines = block.split('\n');
        if (lines.length >= 3) {
            return {
                number: lines[0],
                timeline: lines[1],
                text: lines.slice(2).join('\n')
            };
        }
        return null;
    }).filter(Boolean);
};


export const originalSRT = ``;

export const translatedSRT = ``;
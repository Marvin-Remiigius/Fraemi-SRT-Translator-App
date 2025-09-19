
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
    const lines = srtText.trim().split(/\r?\n/);
    const blocks = [];
    let block = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (/^\d+$/.test(line) && block.length > 0) {
            blocks.push(block);
            block = [];
        }
        if (line.length > 0) {
            block.push(line);
        }
    }
    if (block.length > 0) {
        blocks.push(block);
    }
    return blocks.map(block => {
        if (block.length >= 3) {
            return {
                number: block[0],
                timeline: block[1],
                text: block.slice(2).join('\n')
            };
        }
        return null;
    }).filter(Boolean);
};


export const originalSRT = ``;

export const translatedSRT = ``;
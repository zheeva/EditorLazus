export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const formatSeconds = (value) => {
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

export const randomFrom = (items) => items[Math.floor(Math.random() * items.length)];

export const createWaveform = (samples, points = 120) => {
  const result = [];
  const blockSize = Math.max(1, Math.floor(samples.length / points));

  for (let i = 0; i < points; i += 1) {
    const start = i * blockSize;
    const end = start + blockSize;
    let peak = 0;

    for (let j = start; j < end; j += 1) {
      peak = Math.max(peak, Math.abs(samples[j] || 0));
    }

    result.push(peak);
  }

  return result;
};

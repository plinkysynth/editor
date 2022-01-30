function normalise(x) {
  return (paramMax - paramMin) * ((x-xMin)/(xMax - xMin)) + paramMin;
}

function round(num) {
  return Math.round( num * 10 + Number.EPSILON ) / 10;
}

const paramMin = -100;
const paramMax = 100;
const xMin = -1024;
const xMax = 1024;

export function formatValue(v) {
  return round(normalise(v))
}
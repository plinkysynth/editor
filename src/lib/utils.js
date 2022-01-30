export function normalise(x) {
  return x / 1024 * 100 
}

export function denormalise(x) {
  return x / 100 * 1024
}

function round(num) {
  return Math.round( num * 10 + Number.EPSILON ) / 10;
}

export function formatValue(v) {
  return round(normalise(v))
}
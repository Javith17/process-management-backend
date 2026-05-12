
export function isWithin100Meters(
  srcLat: number,
  srcLng: number,
  inputLat: number,
  inputLng: number
): boolean {
  const R = 6371000; // Earth radius in meters

  const toRad = (value: number) => (value * Math.PI) / 180;

  const dLat = toRad(inputLat - srcLat);
  const dLng = toRad(inputLng - srcLng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(srcLat)) *
      Math.cos(toRad(inputLat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // in meters

  return distance <= 100;
}

export function isNear (inputLat: number, inputLng: number) {
    const result = isWithin100Meters(
        Number(process.env.SOURCE_LAT), Number(process.env.SOURCE_LNG), //Source
        inputLat, inputLng  // input
    );
    return result;
}
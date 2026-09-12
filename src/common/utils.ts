
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

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function twoDigitsToWords(num: number): string {
    if (num < 20) return ONES[num];
    return `${TENS[Math.floor(num / 10)]}${num % 10 ? ' ' + ONES[num % 10] : ''}`;
}

function threeDigitsToWords(num: number): string {
    if (num < 100) return twoDigitsToWords(num);
    const hundreds = Math.floor(num / 100);
    const rest = num % 100;
    return `${ONES[hundreds]} Hundred${rest ? ' ' + twoDigitsToWords(rest) : ''}`;
}

// Converts a rupee amount to words using the Indian numbering system
// (lakh/crore), e.g. 106179 -> "One Lakh Six Thousand One Hundred Seventy Nine Rupees Only".
export function amountToWordsIndian(amount: number): string {
    const rupees = Math.round(amount);
    if (rupees === 0) return 'Zero Rupees Only';

    const crore = Math.floor(rupees / 10000000);
    const lakh = Math.floor((rupees % 10000000) / 100000);
    const thousand = Math.floor((rupees % 100000) / 1000);
    const hundred = rupees % 1000;

    const parts: string[] = [];
    if (crore) parts.push(`${threeDigitsToWords(crore)} Crore`);
    if (lakh) parts.push(`${threeDigitsToWords(lakh)} Lakh`);
    if (thousand) parts.push(`${threeDigitsToWords(thousand)} Thousand`);
    if (hundred) parts.push(threeDigitsToWords(hundred));

    return `${parts.join(' ')} Rupees Only`;
}
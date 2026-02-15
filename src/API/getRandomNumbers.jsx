/**
 * Generates an array of random numbers between 1 and 6 (inclusive)
 * Used for dice rolling in character generation
 */
export function getRandomNumbers() {
  const numbers = [];
  const min = 1;
  const max = 6;
  const count = 50;

  for (let i = 0; i < count; i++) {
    numbers.push(Math.floor(Math.random() * (max - min + 1)) + min);
  }

  return numbers;
}

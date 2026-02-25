import Ship from '../modules/ship';

const frigate = new Ship(1);
const destroyer = new Ship(2);

test('frigate got hit', () => {
  frigate.hit();
  expect(frigate.hits).toBe(1);
});

test('one ship has sunk', () => {
  destroyer.hit();

  expect(frigate.isSunk()).toBe(true);

  expect(destroyer.isSunk()).toBe(false);
});
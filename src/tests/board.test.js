import Gameboard from '../modules/board';

test('place ships on board', () => {
  const testBoard = new Gameboard();
  testBoard.placeRandomShips();
  expect(testBoard.coordinates.size).toBe(15);
})

describe('the board receive an attack', () => {
  const testBoard = new Gameboard();
  testBoard.placeRandomShips();

  const firstShot = testBoard.createRandomCoordinates(1);

  test('the first one missed', () => {
    testBoard.receiveAttack(firstShot);
    expect(testBoard.missed.size).toBe(1);
  });

  const secondShot = testBoard.coordinates.keys().next().value;

  test('the second one hit the target', () => {
    testBoard.receiveAttack(secondShot);
    const targetShip = testBoard.coordinates.get(secondShot);
    expect(testBoard.ships[targetShip.ship].hits).toBe(1);
  });

  test('the third shot made a frigate sink', () => {
    testBoard.ships['frigate'].hit();
    expect(testBoard.ships['frigate'].isSunk()).toBe(true);
  });
})

describe('all ships sunk', () => {
  const testBoard = new Gameboard();
  testBoard.placeRandomShips();

  let coordinates = testBoard.coordinates.keys();

  while(coordinates){
    const shot = coordinates.next();

    if(!shot.done){
      testBoard.receiveAttack(shot.value);
    } else {
      coordinates = null;
    }
  }

  expect(testBoard.allShipsSunk()).toBe(true);

});

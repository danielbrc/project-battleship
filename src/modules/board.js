import Ship from './ship';

const x = ['A','B','C','D','E','F','G','H','I','J'];
const y = ['1','2','3','4','5','6','7','8','9','10'];

class Gameboard {
  constructor() {
    this.ships = {
      carrier:    new Ship(5),
      battleship: new Ship(4),
      cruiser:    new Ship(3),
      destroyer:  new Ship(2),
      frigate:    new Ship(1),
    }
    this.coordinates = new Map();
    this.missed = new Set();
  }

  receiveAttack(coordinate) {
    const attackHit = this.coordinates.get(coordinate);

    if(attackHit !== undefined){
      this.ships[attackHit.ship].hit();
    } else {
      this.attackMiss(coordinate);
    }

    return attackHit;
  }

  placeRandomShips() {
    
    if(this.coordinates.size == 15) {
      this.coordinates.clear();
    }

    for(const ship of Object.entries(this.ships)) {
      let { coordinate, orientation } = this.createRandomCoordinates(ship[1].length);

      for(const cor of coordinate){
        this.coordinates.set(cor, { ship: ship[0], orientation: orientation });
      }
    }
  }

  replaceShip(ship, coord, orientation = 0){
    const coordinates = this.coordinates;
    const shipLength = this.ships[ship].length;
    let count = 0;

    for(const k of coordinates.keys()){
      if(coordinates.get(k).ship == ship){
        this.coordinates.delete(k);
        count++;
      }
      if(count == shipLength) {
        break;
      }
    }

    for(const cor of coord){
      this.coordinates.set(cor, { ship: ship, orientation: orientation});
    }
  }

  createRandomCoordinates(length) {
    // horizontal = 0 or vertical = 1
    const orientation = randomTen() % 2;
    let posX = randomTen();
    let posY = randomTen();
    const coordinate = [];

    for(let i = 0; i < length; i++){
      const newCoord = orientation == 0 ? x.at(posX+i) + y.at(posY) : x.at(posX) + y.at(posY+i);

      if(this.coordinates.get(newCoord) || newCoord.indexOf('undefined') != -1) {
        return this.createRandomCoordinates(length);
      }

      coordinate.push(newCoord);
    }

    return { coordinate, orientation };
  }

  attackMiss(coordinate) {
    this.missed.add(coordinate);
  }

  allShipsSunk() {
    for(const ship of Object.entries(this.ships)) {
      if(!ship[1].isSunk()) {
        return false;
      }
    }

    return true;
  }
}

function randomTen() {
  return Math.floor(Math.random() * 10);
}

export default Gameboard;

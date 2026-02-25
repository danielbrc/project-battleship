
class Ship {
  constructor(length = 1, hits = 0, sunk = false) {
    this.length = length;
    this.hits = hits;
    this.sunk = sunk;
  }

  hit() {
    this.hits += 1;
    this.isSunk();
  }

  isSunk() {
    
    if(!this.sunk) {
      this.sunk = this.hits == this.length;
    }

    return this.sunk;
  }
}

export default Ship;
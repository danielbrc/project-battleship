import Gameboard from "./board";

class Player {
  constructor(type, name) {
    this.type = type === 'player' ? 'player' : 'computer';
    this.name = name;
    this.board = new Gameboard();
  }
}

export default Player;
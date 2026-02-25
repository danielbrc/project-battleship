export default class App {
  constructor(container, playerOne, playerTwo) {
    this.container = container;
    this.playerOne = playerOne;
    this.playerTwo = playerTwo;

    this.gameMode = 'computer';

    this.turn = playerOne.name;

    this.playerOneBoard = new Board(container, playerOne);
    this.playerTwoBoard = new Board(container, playerTwo);

    this.playerOneDisplay = null;
    this.playerTwoDisplay = null;

    this.automata = null;
  }

  init() {
    console.log('App init');
    this.placements();
    this.registerEvents();
  }

  start() {
    console.log('App start');
    this.turn = this.playerOne.name;
    this.container.classList.remove('placement');
    this.build();
  }

  placements(playerTurn = 'playerOne', firstPlayer = true) {
    this.container.innerText = '';
    this[`${playerTurn}Board`].placeShips(this.turn);
    this[`${playerTurn}Display`] = new Options(this.container, this[playerTurn], firstPlayer);
  }

  build() {
    this.container.innerText = '';

    this.playerOneBoard.init();
    this.playerTwoBoard.init();

    this.playerOneBoard.build(this.turn);
    this.playerTwoBoard.build(this.turn);

    this.playerOneDisplay = new Display(this.container, this.playerOne);
    this.playerTwoDisplay = new Display(this.container, this.playerTwo);
  }

  registerEvents() {
    console.log('RegisterEvents!');

    document.addEventListener('shotTrigger', this.shotEvent.bind(this));

    document.addEventListener('placeShip', this.placeShip.bind(this));

    document.addEventListener('placeRandom', this.placeRandom.bind(this));

    document.addEventListener('changeName', this.changePlayerName.bind(this));

    document.addEventListener('nextStep', this.nextStep.bind(this));
  }

  shotEvent({ detail }) {
    if(detail.playerAttacked == this.turn){
      return false;
    }

    const cellId = detail.cellId;

    this.turn = detail.playerAttacked;
    const playerTurn = this.turn == this.playerOne.name ? 'playerOne' : 'playerTwo';
    const hit = this[playerTurn].board.receiveAttack(cellId);

    if(this[playerTurn].board.allShipsSunk()){
      this.winner();
    }

    this.toggle();

    this[`${playerTurn}Board`].updateCell(cellId, hit);
    this[`${playerTurn}Display`].updateShip(hit);

    // computer action
    if(this.gameMode == 'computer') {
      if(this.turn == this.playerTwo.name.replace(/\W/g,'_')) {
        this.automata.play();
      } else if(this.gameMode == 'computer' && hit) {
        this.automata.hitTarget(cellId);
      }
    }
  }

  // TODO
  // robot stuff
  placeShip({ detail }){
    const playerTurn = detail.player == this.playerOne.name ? 'playerOne' : 'playerTwo';
    this.container.innerText = '';
    this.placements(playerTurn);
  }

  placeRandom({ detail }){
    const playerTurn = detail.player == this.playerOne.name ? 'playerOne' : 'playerTwo';
    this.container.innerText = '';
    this.placements(playerTurn);
  }

  changePlayerName({ detail }) {
    const { oldName, newName } = detail;
    const playerTurn = oldName == this.playerOne.name ? 'playerOne' : 'playerTwo';
    this[playerTurn].name = this.turn = newName;
    this[`${playerTurn}Display`].changePlayerName(newName);
  }

  nextStep({ detail }) {

    if(detail.player == this.playerOne.name && !detail.versus) {
      this.playerTwo.type = 'player';
      this.gameMode = 'versus';
      this.placements('playerTwo', false);
    } else if(detail.player == this.playerTwo.name) {
      this.start();
    } else {
      this.playerTwo.name = 'Mr. Robot';
      this.playerTwoBoard.player = this.playerTwo.name;
      this.automata = new Automata(this.playerOne.name);
      this.start();
      // robot scenario
    }
  }

  toggle() {
    const board = document.querySelectorAll('.board');
    board.forEach((box) => {
      box.classList.toggle('active');
    });
  }

  winner() {
    const modal = document.createElement('div');
    modal.classList.add('winner');

    const winner = this.turn == this.playerOne.name ? this.playerTwo.name : this.playerOne.name;
    modal.innerHTML = `<h3>${winner} Wins!</h3>`;

    const button = document.createElement('button');
    button.innerText = 'Start new game';
    button.addEventListener('click', () => {
      window.navigation.reload();
    })
    modal.appendChild(button);

    this.container.appendChild(modal);
  }
}

// board template
class Board {
  constructor(container, player) {
    this.container = container;
    this.player = player.name;
    this.board = player.board;
    this.content = null;
    this.dragged = null;
    this.init();
  }

  init() {
    this.content = document.createElement('div');
    this.content.classList.add('board');
    this.container.appendChild(this.content);
  }

  placeShips() {
    this.content.id = this.player.replace(/\W/g,'_');
    this.container.classList.add('placement');
    this.content.innerText = '';

    const cells = cellBuild();
    const { coordinates, ships } = this.board;

    const wrapper = document.createElement('div');
    wrapper.classList.add('cell-wrapper');

    const playerInput = document.createElement('input');
    playerInput.classList.add('playerName');
    playerInput.value = this.player;
    playerInput.addEventListener('focus', this.focusPlayerName);
    playerInput.addEventListener('blur', this.changePlayerName.bind(this));
    this.content.appendChild(playerInput);

    const column = this.templateGrid('column', collumns);
    const row = this.templateGrid('row', rows);

    this.content.appendChild(column);
    this.content.appendChild(row);

    for(const cell of cells){
      const elem = document.createElement('div');
      const item = coordinates.get(cell);
      elem.classList.add('cell');
      elem.id = cell;
      
      if(item){
        elem.classList.add('hit');
        elem.dataset.ship = item.ship;
        elem.dataset.length = ships[item.ship].length;
        elem.dataset.orientation = item.orientation;
        elem.setAttribute('draggable', 'true');
        elem.addEventListener('dragstart', this.dragShipStart.bind(this));
        elem.addEventListener('dragend', this.dragShipEnd.bind(this));
      }

      wrapper.appendChild(elem);
    }

    wrapper.addEventListener('dragover', this.dragOverCell.bind(this));

    this.content.appendChild(wrapper);
    this.container.appendChild(this.content);
  }

  build(playerName) {
    this.content.id = this.player.replace(/\W/g,'_');
    this.container.classList.add('start');
    this.content.innerText = '';
    const cells = cellBuild();

    const wrapper = document.createElement('div');
    wrapper.classList.add('cell-wrapper');

    if(this.player == playerName){
      this.content.classList.add('active');
    };

    const playerTitle = document.createElement('h3');
    playerTitle.innerText = this.player;
    this.content.appendChild(playerTitle);

    const column = this.templateGrid('column', collumns);
    const row = this.templateGrid('row', rows);

    this.content.appendChild(column);
    this.content.appendChild(row);

    for(const cell of cells){
      const elem = document.createElement('div');
      elem.classList.add('cell');
      elem.id = cell;

      elem.addEventListener('click', this.eventShot);

      wrapper.appendChild(elem);
    }

    this.content.appendChild(wrapper);
  }

  eventShot({target}) {
    if(target.classList.length > 1) return false;

    const elemId = target.id;
    const playerId = target.parentNode.parentNode.id;
    const elemEvent = new CustomEvent('shotTrigger', {
      detail: { cellId: elemId, playerAttacked: playerId },
    });

    document.dispatchEvent(elemEvent);
    target.removeEventListener('click', this.eventShot);
  }

  updateCell(position, status) {
    const playerElementId = this.player.replace(/\W/g,'_');
    const cell = document.querySelector(`#${playerElementId} #${position}`);

    cell.classList.add(status ? 'hit' : 'miss');
  }

  focusPlayerName({target}) {
    const oldName = target.value;
    target.dataset.oldName = oldName;
    target.value = '';
  }

  changePlayerName({target}){
    const oldName = target.dataset.oldName;

    if(target.value != '' && target.value != oldName) {
      this.player = target.value;
      const nameEvent = new CustomEvent('changeName', {
        detail: { oldName: oldName, newName: this.player },
      });

      document.dispatchEvent(nameEvent);
    } else if(target.value == '') {
      target.value = oldName;
    }
    delete target.dataset.oldName;
  }

  dragShipStart(ev) {
    this.dragged = ev.target;
    const { dataset, id } = ev.target;
  }

  dragShipEnd(ev) {
    const { id } = ev.target;
    const { dataset } = this.dragged;
    const preview = document.querySelectorAll('.preview');

    if(preview.length == dataset.length){
      const coords = [];
      preview.forEach(item => coords.push(item.id));
      this.board.replaceShip(dataset.ship, coords, checkOrientation(coords));
    };
    
    const placeShipEvent = new CustomEvent('placeShip', {
      detail: { player: this.player },
    });
    document.dispatchEvent(placeShipEvent);

    this.dragged = null;
  }

  dragOverCell(ev) {
    const { type, target } = ev;
    const { dataset } = this.dragged;

    this.highlightCell(target.id, dataset);

    ev.preventDefault();
  }

  highlightCell(pos, {ship, length, orientation}) {
    if(!pos) return;

    let preview = document.querySelectorAll('.preview, .miss');
    this.cleanCells(preview);

    let cells = newPositions(pos, length, orientation);

    for(let cell of cells){
      const element = document.querySelector(`#${cell}`);
      if(element && !element.dataset.ship){
        element.classList.add('preview');
      };
    }

    preview = document.querySelectorAll('.preview');

    if(preview.length < length){
      this.cleanCells(preview);
      preview.forEach(item => item.classList.add('miss'));
    };
  }

  cleanCells(items) {
    items.forEach(item => {
      item.classList.remove('preview');
      item.classList.remove('miss');
    });
  }

  templateGrid(name, items) {
    const group = document.createElement('div');
    group.classList.add(name);

    for(const item of items) {
      const label = document.createElement('span');
      label.innerText = item;

      group.appendChild(label);
    }

    return group;
  }
}

// display template
// updates ship UI
class Display {
  constructor(container, { name, board }) {
    this.container = container;
    this.player = name;
    this.playerId = name.replace(/\W/g,'_');
    this.ships = board.ships;

    this.build();
  }

  build() {
    const content = document.createElement('div');
    content.classList.add('display');
    content.id = `${this.playerId}Display`;

    for(const ship of Object.entries(this.ships)) {
      const shipElement = document.createElement('span');
      shipElement.innerText = ship[0];
      shipElement.dataset.hits = ship[1].length;
      content.appendChild(shipElement);
    }

    this.container.appendChild(content);
  };

  updateShip(target) {
    if(!target) return;

    const hitShip = this.ships[target.ship];
    if(hitShip.isSunk()){
      const playerElementId = this.playerId;
      const shipList = document.querySelector(`#${playerElementId}Display`).childNodes;

      for(const item of shipList){
        if(item.innerText == target.ship){
          item.classList.add('sink');
        }
      }
    }
  }
}

// options before game start
class Options {
  constructor(container, { name, board }, firstTurn = false) {
    this.container = container;
    this.player = name;
    this.board = board;
    this.firstTurn = firstTurn;
    this.vsComputer = true;

    this.build();
  }

  build() {
    const content = document.createElement('div');
    content.classList.add('options');

    const randomButton = document.createElement('button');
    randomButton.innerText = 'Random positions';
    // elem.addEventListener('click', this.eventShot);
    randomButton.addEventListener('click', this.eventPlaceRandomShips.bind(this));
    content.appendChild(randomButton);

    const submitButton = document.createElement('button');
    submitButton.innerText = 'Next';
    submitButton.addEventListener('click', this.nextStep.bind(this));
    content.appendChild(submitButton);

    if(this.firstTurn) {
      const label = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.setAttribute('type', 'checkbox');
      label.innerText = 'vs Computer';
      checkbox.value = 'true';
      checkbox.id = 'vsComputer';
      checkbox.checked = true;
      checkbox.addEventListener('click', () => this.vsComputer = !this.vsComputer);

      label.prepend(checkbox);
      content.appendChild(label);
    }

    this.container.appendChild(content);
  }

  eventPlaceRandomShips() {
    this.board.placeRandomShips();
    const eventReplacement = new CustomEvent('placeRandom', {
      detail: { player: this.player },
    });

    document.dispatchEvent(eventReplacement);
  }

  changePlayerName(newName) {
    this.player = newName;
    console.log('OPTIONS > change name to: ', this.player);
  }

  nextStep() {
    const eventNext = new CustomEvent('nextStep', {
      detail: { player: this.player, versus: this.vsComputer },
    });
    document.dispatchEvent(eventNext);
  }
}

class Automata {
  constructor(playerTarget) {
    this.playerTarget = playerTarget;
    this.targetBoard = cellBuild();
    this.hits = [];
    this.nextTarget = null;
  }

  play() {
    const targetCell = this.hits.length > 0 ? this.lastTargetCell() : this.randomCell();
    this.shot(targetCell);
  }

  shot(hit) {
    const shotEvent = new CustomEvent('shotTrigger', {
      detail: { cellId: hit, playerAttacked: this.playerTarget },
    });

    document.dispatchEvent(shotEvent);
  }

  hitTarget(hit) {
    this.hits.push(hit);
  }

  lastTargetCell() {
    const moves = this.possibleMoves(this.hits.at(-1));
    const target = Math.floor(Math.random() * moves.length);

    if(moves.at(target)) {
      const targetIndex = this.targetBoard.indexOf(moves.at(target));
      const cell = this.targetBoard.splice(targetIndex,1);
    }

    return moves.at(target) || this.randomCell();
  };

  randomCell() {
    const target = Math.floor(Math.random() * this.targetBoard.length);
    const cell = this.targetBoard.splice(target,1);
    return cell[0];
  }

  possibleMoves(pos) {
    const moveSet = [[1,0], [0,1], [-1,0], [0,-1]];

    let posX = collumns.indexOf(pos.at(0));
    let posY = rows.indexOf(pos.substr(1));

    const newMoves = moveSet.map(item => {
      const newX = collumns[posX+item[0]];
      const newY = rows[posY+item[1]];

      if(newX && newY) {
        return newX + newY;
      }
    });

    return newMoves.filter(item => this.targetBoard.includes(item));
  }
}

// collumn = horizontal 0
const collumns = ['A','B','C','D','E','F','G','H','I','J'];
// rows = vertical 1
const rows = ['1','2','3','4','5','6','7','8','9','10'];

function cellBuild() {
  const cells = [];
  for(const y of rows){
    for(const x of collumns){
      cells.push(`${x}${y}`);
    }
  }
  return cells;
}

// verify orientation based on first two positions
// horizontal = 0
// vertical = 1
function checkOrientation(coords) {
  if(coords.length <= 1) return 0;

  const one = coords[0].split('');
  const two = coords[1].split('');

  return one[0] == two[0] ? 1 : 0;
}

// generate positions based on length and orientation
function newPositions(pos, length, orientation) {
  let newPos = [pos];
  if(length <= 1) return newPos;
  const x = pos.at(0);
  const y = pos.substr(1);

  let posX = collumns.indexOf(x);
  let posY = rows.indexOf(y);

  for(let n = 1; n < length; n++){
    if(orientation == 0) {
      posX += 1;
    } else {
      posY += 1;
    }

    if(collumns[posX] && rows[posY]){
      newPos = [...newPos, collumns.at(posX) + rows.at(posY)]
    }
  };
  return newPos;
}
import './styles.css';
// import Gameboard from './modules/board';
import Player from './modules/player';
import App from './modules/app';

const playerOne = new Player('player', 'PlayerOne');
const playerTwo = new Player('computer', 'PlayerTwo');

const container = document.querySelector('.container');
const app = new App(container, playerOne, playerTwo);

// random placement
playerOne.board.placeRandomShips();
playerTwo.board.placeRandomShips();

app.init();

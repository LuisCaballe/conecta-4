import cellStatusList from './modules/cell-status.js';

let turnNumber     = 0;
let isGameFinished = false;
let isGameDrawn    = false;
let isOnePlayer    = false;

const columnsList  = document.querySelectorAll('.col');
const turnInfoBox  = document.querySelector('.turn-info');
const playAgainBox = document.querySelector('.play-again');
const boardBox     = document.querySelector('.board');
const welcomeBox   = document.querySelector('.welcome');

const handleAddToken = (column, columnIndex) => {

	const cellList  = column.querySelectorAll('.cell');
	const redToken  = `<div class='red-token'></div>`;
	const blueToken = `<div class='blue-token'></div>`;
	let cellIndex   = 0;

	for (const cellStatusColumn of cellStatusList[columnIndex]) {
		if (cellStatusColumn === 'blank') {
			cellIndex++;
		}
	}

	if (!isOnePlayer || checkEvenTurn()) {

		if (cellIndex > 0) {

			cellIndex--;

			if (checkEvenTurn()) {
				cellList[cellIndex].innerHTML = redToken;
				cellStatusList[columnIndex][cellIndex] = 'red';
				checkFinishGame('red', columnIndex, cellIndex);
				if (isOnePlayer && !isGameFinished) addTokenCPU();
			} else {
				cellList[cellIndex].innerHTML = blueToken;
				cellStatusList[columnIndex][cellIndex] = 'blue';
				checkFinishGame('blue', columnIndex, cellIndex);
			}

			if (!isGameFinished) {
				turnNumber++;
				showTurnInfo();
			}
		}
	}
};

const addTokenCPU = () => {

	const blueToken   = `<div class='blue-token'></div>`;
	const columnIndex = Math.round(Math.random() * 6);
	const cellList    = columnsList[columnIndex].querySelectorAll('.cell');
	let cellIndex     = 0;

	for (const cellStatusColumn of cellStatusList[columnIndex]) {
		if (cellStatusColumn === 'blank') {
			cellIndex++;
		}
	}

	if (!isGameFinished) {

		if (cellIndex > 0) {

			cellIndex--;

			setTimeout(() => {
				cellList[cellIndex].innerHTML = blueToken;
				cellStatusList[columnIndex][cellIndex] = 'blue';
				checkFinishGame('blue', columnIndex, cellIndex);
				turnNumber++;
				if (!isGameFinished) {
					return showTurnInfo();
				}
			}, 1500);
		} else {
			return addTokenCPU();
		}
	}
};

const checkEvenTurn = () => turnNumber % 2 === 0 ? true : false;

const showTurnInfo = () => {

	if (!isOnePlayer) {

		const tokenColor                = checkEvenTurn() ? 'red-token' : 'blue-token';
		const tokenColorName            = tokenColor === 'red-token' ? 'rojas.' : 'azules.';
		const firstPlayerOrSecondPlayer = tokenColor === 'red-token' ? 'del primer jugador' : 'del segundo jugador';
		turnInfoBox.innerHTML           = `
		<div class='text-container'>
		<p class='turn-text'><b>Turno nº ${turnNumber + 1}</b><br/>
		Es el turno ${firstPlayerOrSecondPlayer}, con las fichas ${tokenColorName}</p></div>
		<div class='turn-cell'><div class='${tokenColor}'></div></div>
		`;
	}

	if (isOnePlayer) {

		const tokenColor          = checkEvenTurn() ? 'red-token' : 'blue-token';
		const tokenColorName      = tokenColor === 'red-token' ? 'rojas.' : 'azules.';
		const playerOrCPUInfoTurn = tokenColor === 'red-token' ? 'del jugador' : 'de la CPU';
		turnInfoBox.innerHTML     = `
		<div class='text-container'>
		<p class='turn-text'><b>Turno nº ${turnNumber + 1}</b><br/>
		Es el turno ${playerOrCPUInfoTurn}, con las fichas ${tokenColorName}</p></div>
		<div class='turn-cell'><div class='${tokenColor}'></div></div>
		`;
	}
};

const checkFinishGame = (tokenColor, columnIndex, cellIndex) => {

	const checkList = (listToCheck, tokenColor) => {

		let numberOfTokens = 0;

		listToCheck.forEach((cellStatus) => {
			if (cellStatus === tokenColor) {
				numberOfTokens++;
				if (numberOfTokens === 4) {
					stopGame();
					return showWinnerOrDraw(tokenColor);
				}
			} else {
				numberOfTokens = 0;
			}
		});
	}

	const getVerticalList = () => {

		checkList(cellStatusList[columnIndex], tokenColor);
	};

	getVerticalList();

	const getHorizontalList = () => {

		let rowStatusList  = [];

		for (let colIndex = 0; colIndex < 7; colIndex++) {
			rowStatusList.push(cellStatusList[colIndex][cellIndex]);
		}

		checkList(rowStatusList, tokenColor);
	};

	getHorizontalList();

	const getDiagonalLTRList = () => {

		let diagonalStatusList = [];

		let currentColumnIndex = columnIndex;
		for (let i = cellIndex; i >= 0 && currentColumnIndex < 7; i--) {
			diagonalStatusList.push(cellStatusList[currentColumnIndex][i]);
			currentColumnIndex++;
		}

		let previousColumnIndex = columnIndex - 1;
		for (let i = cellIndex; i < 5 && previousColumnIndex >= 0; i++) {
			diagonalStatusList.unshift(cellStatusList[previousColumnIndex][i + 1]);
			previousColumnIndex--;
		}

		checkList(diagonalStatusList, tokenColor);
	};

	getDiagonalLTRList();

	const getDiagonalRTLList = () => {

		let diagonalStatusList = [];

		let currentColumnIndex = columnIndex;
		for (let i = cellIndex; i >= 0 && currentColumnIndex >= 0; i--) {
			diagonalStatusList.push(cellStatusList[currentColumnIndex][i]);
			currentColumnIndex--;
		}

		let nextColumnIndex = columnIndex + 1;
		for (let i = cellIndex; i < 5 && nextColumnIndex < 7; i++) {
			diagonalStatusList.unshift(cellStatusList[nextColumnIndex][i + 1]);
			nextColumnIndex++;
		}

		checkList(diagonalStatusList, tokenColor);
	};

	getDiagonalRTLList();

	const checkDraw = () => {

		if (cellStatusList.flat().every((cellStatus) => cellStatus !== 'blank' && !isGameFinished)) {
			isGameDrawn = true;
			stopGame();
			return showWinnerOrDraw();
		}
	};

	checkDraw();
};

const showWinnerOrDraw = (tokenColor) => {

	turnInfoBox.classList.add('center-text');

	if (isGameDrawn) {
		turnInfoBox.innerHTML = `
		<p class='turn-text'><b>¡Empate!</b><br/>
		Ambos jugadores han empatado en ${turnNumber + 1} turnos.
		`;
	} else {
		if (isOnePlayer && tokenColor === 'blue') {
			turnInfoBox.innerHTML = `
			<p class='turn-text'><b>¡Mala suerte!</b><br/>
			Ha ganado la CPU con las fichas azules en ${turnNumber + 1} turnos.
			`;
		} else {
			const winnerPlayer    = tokenColor === 'red' ? 'primer' : 'segundo';
			const tokenColorName  = tokenColor === 'red' ? 'rojas' : 'azules';
			turnInfoBox.innerHTML = `
			<p class='turn-text'><b>¡Enhorabuena!</b><br/>
			Ha ganado el ${winnerPlayer} jugador con las fichas ${tokenColorName} en ${turnNumber + 1} turnos.
			`;
		}
	}

	askPlayAgain();
};

const askPlayAgain = () => {
	playAgainBox.innerHTML = `
	<p>¿Quieres jugar de nuevo?</p>
	<button class='accept-button'>Aceptar</button>
	`;

	playAgainBox.classList.remove('hidden');

	const playAgainButton = document.querySelector('.accept-button');
	playAgainButton.addEventListener('click', () => {
		startGameMenu();
	});
};

const handleStartGame = () => {

	turnNumber     = 0;
	isGameFinished = false;
	isGameDrawn    = false;
	isOnePlayer    = false;

	welcomeBox.classList.add('hidden');
	playAgainBox.classList.add('hidden');
	turnInfoBox.classList.remove('hidden');
	boardBox.classList.remove('gray-board');
	turnInfoBox.classList.remove('center-text');

	columnsList.forEach((column) => {
		column.removeAttribute('disabled', '');
	});

	for (let i = 0; i < cellStatusList.length; i++) {
		for (let j = 0; j < cellStatusList[i].length; j++) {
			cellStatusList[i][j] = 'blank';
		}
	}

	restartBoard();

	turnInfoBox.innerHTML = `
	<div class='text-container'><p class='turn-text'><b>Primer turno</b>.<br/>Es el turno del primer jugador, con las fichas rojas.</p></div>
	<div class='turn-cell'><div class='red-token'></div></div>
	`;
};

const handleSayBye = () => {

	const displayBox    = document.querySelector('.display');
	const mainContainerBox = document.querySelector('.main-container');

	mainContainerBox.classList.add('center-farewell');
	
	displayBox.innerHTML = `
	<div class='farewell-box'><h1>Gracias por jugar<br/>a Conecta 4</h1><br/><p>¡Hasta pronto! :)<p></div>`;
};

const restartBoard = () => {

	const cellsWithTokensList = document.querySelectorAll('.blue-token,.red-token');
	cellsWithTokensList.forEach((cellWithToken) => {
		cellWithToken.remove();
	});
};

const stopGame = () => {

	isGameFinished = true;
	boardBox.classList.add('gray-board');
	columnsList.forEach((column) => {
		column.setAttribute('disabled', '');
	});
};

const startGameMenu = () => {

	restartBoard();
	stopGame();
	welcomeBox.classList.remove('hidden');
	turnInfoBox.classList.add('hidden');
	playAgainBox.classList.add('hidden');
};

startGameMenu();

const registerEventListeners = () => {
	columnsList.forEach((column, columnIndex) => {
		column.addEventListener('click', () => {
			handleAddToken(columnsList[columnIndex], columnIndex);
		});
	});

	const restartButton = document.querySelector('.restart-btn');
	restartButton.addEventListener('click', () => {
		startGameMenu();
	});

	const exitButton = document.querySelector('.exit-btn');
	exitButton.addEventListener('click', () => {
		handleSayBye();
	});

	const twoPlayersButton = document.querySelector('.two-players-btn');
	twoPlayersButton.addEventListener('click', () => {
		handleStartGame();
	});

	const onePlayerButton = document.querySelector('.one-player-btn');
	onePlayerButton.addEventListener('click', () => {
		handleStartGame();
		isOnePlayer = true;
	});
};

registerEventListeners();

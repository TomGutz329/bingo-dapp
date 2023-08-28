const ContractAddress = "0xEb0da51bB46BA5f25cAe99bD057f739d29E65815";
const ContractABI = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "ID",
				"type": "uint256"
			}
		],
		"name": "gameID",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "deposit",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "ID",
				"type": "uint256"
			}
		],
		"name": "payout",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "enum BingoBettingSystem.Probability",
				"name": "probability",
				"type": "uint8"
			}
		],
		"name": "placeBet",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "withdraw",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];

let contract;
let signer;

const provider = new ethers.providers.Web3Provider(window.ethereum, 80001);

const header = document.querySelector('.bingo-rush');
const startButton = document.querySelector('.start-button');
const card = document.querySelector('.bingo-card');
const playButton = document.querySelector('.play-button');
const probability = document.querySelector('.probability');
const choices = document.querySelectorAll('.probability-choice');
const warning = document.querySelector('.warning');
const drawButton = document.querySelector('.draw-button');
const drawCounter = document.querySelector('.counter');
const result = document.querySelector('.result');
const bingoIndicator = document.querySelector('.bingo-indicator');

let bingoCard;
let box = [];
let numOfDraws;
let marker;
let numbers = [];
let counter;
let drawnNumbers;
let resultString;
let gameID;

getProviderOrSigner();
setBoxes();

async function getProviderOrSigner() {
	provider.send("eth_requestAccounts", []).then(() => {
		provider.listAccounts().then((accounts) => {
			signer = provider.getSigner(accounts[0]);
			contract = new ethers.Contract(
				ContractAddress,
				ContractABI,
				signer
			);
			contract.on("gameID", (ID) => {
				gameID = ID;
            });
		});
	});
}



function setBoxes() {
    for (let counter = 0; counter < 25; counter++) {
        let ID = 'box-' + (counter + 1);
        box[counter] = document.getElementById(ID);
    }
}

function getCard() {
    bingoCard = populateBingoCard();
    header.classList.toggle('hidden');
    startButton.classList.toggle('hidden');
    card.classList.toggle('hidden');
    playButton.classList.toggle('hidden');
    probability.classList.toggle('hidden');
}

function populateBingoCard() {
    const sections = ['B', 'I', 'N', 'G', 'O'];
    let bingoCard = [];
    numbers = [];

    sections.forEach(function(section) {
        switch(section) {
            case 'B':
                let numbersB = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
                numbers = [...numbers, ...numbersB];
                fillSection(bingoCard, numbersB);
                break;
            case 'I':
                let numbersI = [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
                numbers = [...numbers, ...numbersI];
                fillSection(bingoCard, numbersI);
                break;
            case 'N':
                let numbersN = [31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45];
                numbers = [...numbers, ...numbersN];
                fillSection(bingoCard, numbersN);
                break;
            case 'G':
                let numbersG = [46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60];
                numbers = [...numbers, ...numbersG];
                fillSection(bingoCard, numbersG);
                break;
            case 'O':
                let numbersO = [61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75];
                numbers = [...numbers, ...numbersO];
                fillSection(bingoCard, numbersO);
                break;
        }
    });
    for(let col = 0; col < 5; col++) {
        for (let row = 0; row < 5; row++){
            box[(row * 5) + col].innerText = bingoCard[col][row];
        }
    }
    return bingoCard;
}

function fillSection(card, numbers) {
    let section = [];
    //For the N section of the card, the card already has two sections completed, therefore card.length would return a value of 2
    if(card.length === 2) {
        // For the N section, we will generate only 4 numbers, since the middle part is a wild-card and won't be assigned any value
        for (let counter = 0; counter < 4; counter++) {
            let index = generateNumber(0, 14 - counter);
            let randomNumber = numbers[index];
            numbers.splice(index, 1);
            if(counter === 2) section.push('FREE');
            section.push(randomNumber);
        }
        card.push(section);
    }
    else {
        for (let counter = 0; counter < 5; counter++) {
            let index = generateNumber(0, 14 - counter);
            let randomNumber = numbers[index];
            numbers.splice(index, 1);
            section.push(randomNumber);
        }
        card.push(section);
    }

}

function generateNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

choices.forEach(function(choice){
    choice.addEventListener('click', setNumberOfDraws);
});

function setNumberOfDraws(e){
    numOfDraws = e.target.value;
}

function checkIfReady() {
    if (numOfDraws === undefined) warning.setAttribute('class', 'warning');
    else play();
}

async function placeBet(numOfDraws){
    let probability;
    switch(numOfDraws) {
        case 40: 
            probability = 0;
            break;
        case 30: 
            probability = 1;
            break;
        case 20: 
            probability = 2;
            break;
        case 10: 
            probability = 3;
            break;
        case 5: 
            probability = 4;
            break;
    }
    try{
        const msgValue = 10000000000000000; // 0.01 MATIC
        await contract.placeBet({ value: msgValue }, probability);
    }
    catch (error) {
        console.error(error);
    }
}

function play() {
    placeBet(numOfDraws);
    probability.classList.toggle('hidden');
    playButton.classList.toggle('hidden');
    drawButton.classList.toggle('hidden');
    drawCounter.classList.toggle('hidden');
    result.classList.toggle('hidden');
    box[12].setAttribute('class', 'row-items marked'); // mark middle box by default

    drawnNumbers = [];
    marker = [
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, true, false, false],
        [false, false, false, false, false],
        [false, false, false, false, false]
    ];

    counter = 0;

    drawCounter.innerText = `Draws Left: ${numOfDraws - counter}`;
    resultString = 'Drawn Numbers: ';
    result.innerText = resultString;
}

function drawNumber() {
    let index = generateNumber(0, 74 - counter);
    let draw = numbers[index];
    let bingo = false;
    numbers.splice(index, 1);
    if (draw <= 15) {
        for(let i = 0; i < 5; i++) if (draw == bingoCard[0][i]) {
            marker[0][i] = true;
            box[i * 5].setAttribute('class', 'row-items marked');
        }
    }
    else if (draw <= 30) {
        for(let i = 0; i < 5; i++) if (draw == bingoCard[1][i])  {
            marker[1][i] = true;
            box[i * 5 + 1].setAttribute('class', 'row-items marked');
        }
    }
    else if (draw <= 45) {
        for(let i = 0; i < 5; i++) if (draw == bingoCard[2][i]) {
            marker[2][i] = true;
            box[i * 5 + 2].setAttribute('class', 'row-items marked');
        }
    }
    else if (draw <= 60) {
        for(let i = 0; i < 5; i++) if (draw == bingoCard[3][i]) {
            marker[3][i] = true;
            box[i * 5 + 3].setAttribute('class', 'row-items marked');
        }
    }
    else {
        for(let i = 0; i < 5; i++) if (draw == bingoCard[4][i]) {
            marker[4][i] = true;
            box[i * 5 + 4].setAttribute('class', 'row-items col-5 marked');
        }
    }
    bingo = determineIfBingo(marker);
    drawnNumbers.push(draw);
    counter++;
    drawCounter.innerHTML = `Number Drawn: ${draw}<br>Draws Left: ${numOfDraws - counter}`;
    resultString += `${draw} `
    result.innerText = resultString;
    if (counter == numOfDraws || bingo == true) {
        drawButton.classList.toggle('hidden');
        if (bingo == true) {
            result.innerHTML += `<br><br><div class="bingo-indicator">BINGO!</div>`;
            payout(gameID);
        }
        result.innerHTML += '<br><br><button onclick={startOver()}>Try Again</button>'
    }
}

async function payout(gameID) {
    try {
        let payout = await contract.payout(gameID);
        console.log(payout);
        await payout;
    }
    catch(error) {
        console.error(error);
    }
}

function determineIfBingo(marker) {
    let bingo = false;
    const patterns = [
        'fourCorners',
        'diagonal1',
        'diagonal2',
        'straightFirst',
        'straightSecond',
        'straightThird',
        'straightFourth',
        'straightFifth',
        'straightB',
        'straightI',
        'straightN',
        'straightG',
        'straightO'
    ];
    patterns.forEach(function(pattern){
        switch(pattern) {
            case 'fourCorners':
                if(
                    marker[0][0] == true &&
                    marker[0][4] == true &&
                    marker[4][0] == true &&
                    marker[4][4] == true
                ) bingo = true;
                break;
            case 'diagonal1':
                if(
                    marker[0][0] == true &&
                    marker[1][1] == true &&
                    marker[2][2] == true &&
                    marker[3][3] == true &&
                    marker[4][4] == true
                ) bingo = true;
                break;
            case 'diagonal2':
                if(
                    marker[0][4] == true &&
                    marker[1][3] == true &&
                    marker[2][2] == true &&
                    marker[3][1] == true &&
                    marker[4][0] == true
                ) bingo = true;
                break;
            case 'striaghtFirst':
                if(
                    marker[0][0] == true &&
                    marker[1][0] == true &&
                    marker[2][0] == true &&
                    marker[3][0] == true &&
                    marker[4][0] == true
                ) bingo = true;
                break;
            case 'straightSecond':
                if(
                    marker[0][1] == true &&
                    marker[1][1] == true &&
                    marker[2][1] == true &&
                    marker[3][1] == true &&
                    marker[4][1] == true
                ) bingo = true;
                break;
            case 'straightThird':
                if(
                    marker[0][2] == true &&
                    marker[1][2] == true &&
                    marker[2][2] == true &&
                    marker[3][2] == true &&
                    marker[4][2] == true
                ) bingo = true;
                break;
            case 'straightFourth':
                if(
                    marker[0][3] == true &&
                    marker[1][3] == true &&
                    marker[2][3] == true &&
                    marker[3][3] == true &&
                    marker[4][3] == true
                ) bingo = true;
                break;
            case 'straightFifth':
                if(
                    marker[0][4] == true &&
                    marker[1][4] == true &&
                    marker[2][4] == true &&
                    marker[3][4] == true &&
                    marker[4][4] == true
                ) bingo = true;
                break;
            case 'straightB':
                if(
                    marker[0][0] == true &&
                    marker[0][1] == true &&
                    marker[0][2] == true &&
                    marker[0][3] == true &&
                    marker[0][4] == true
                ) bingo = true;
                break;
            case 'straightI':
                if(
                    marker[1][0] == true &&
                    marker[1][1] == true &&
                    marker[1][2] == true &&
                    marker[1][3] == true &&
                    marker[1][4] == true
                ) bingo = true;
                break;
            case 'straightN':
                if(
                    marker[2][0] == true &&
                    marker[2][1] == true &&
                    marker[2][2] == true &&
                    marker[2][3] == true &&
                    marker[2][4] == true
                ) bingo = true;
                break;
            case 'straightG':
                if(
                    marker[3][0] == true &&
                    marker[3][1] == true &&
                    marker[3][2] == true &&
                    marker[3][3] == true &&
                    marker[3][4] == true
                ) bingo = true;
                break;
            case 'straightO':
                if(
                    marker[4][0] == true &&
                    marker[4][1] == true &&
                    marker[4][2] == true &&
                    marker[4][3] == true &&
                    marker[4][4] == true
                ) bingo = true;
                break;
        }
    });
    return bingo;
}

function startOver() {
    header.classList.toggle('hidden');
    startButton.classList.toggle('hidden');
    card.classList.toggle('hidden');
    result.classList.toggle('hidden');
    drawCounter.classList.toggle('hidden');
    box.forEach(function(box){
        box.setAttribute('class', 'row-items');
    });
}
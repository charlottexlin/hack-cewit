let numPlayers = 0;
let players = [];
let availableResources = 0;
let consumedResources = 0;
let whoseTurn = 0;

function main() {
    // create form for the create game page
    const playersForm = document.querySelector('#playersForm');
    const formLines = document.createElement('div');
    formLines.setAttribute('id', "formLines");
    playersForm.appendChild(formLines);

    // minimum number of players is 
    for (let i=0; i < 4; i++) {
        createFormLine();
    }

    // add player button
    const addPlayerBtn = document.querySelector('#addPlayerBtn');
    addPlayerBtn.addEventListener('click', addPlayerToForm);

    // add submit button
    const submitBtn = document.createElement('input');
    submitBtn.classList.add("submit");
    submitBtn.setAttribute("type", "submit");
    submitBtn.setAttribute("value", "Submit");
    submitBtn.addEventListener('click', startGame);

    playersForm.appendChild(submitBtn);
}

function addPlayerToForm(event) {
    // maximum number of players is 10
    if (numPlayers > 9) {
        numPlayers = 10;
        const warningText = document.querySelector('.warningText');
        warningText.textContent = "Maximum is ten players!";
    } else {
        createFormLine();
    }
}

function createFormLine() {
    // create a line of the form, one line for each new player
    numPlayers++;

    const nameLabel = document.createElement('label');
    nameLabel.setAttribute("for", "name");
    nameLabel.classList.add("formLabel");
    nameLabel.textContent = "Name";

    const nameInput = document.createElement("input");
    nameInput.setAttribute("type", "text");
    nameInput.setAttribute("name", "name");
    nameInput.setAttribute("placeholder", "Player name");
    nameInput.required = true;
    nameInput.classList.add("formInput", "nameInput");

    const phoneLabel = document.createElement('label');
    phoneLabel.setAttribute("for", "phone-number");
    phoneLabel.classList.add("formLabel");
    phoneLabel.textContent = "Phone number";

    const phoneInput = document.createElement("input");
    phoneInput.setAttribute("type", "tel");
    phoneInput.setAttribute("name", "phone-number");
    phoneInput.setAttribute("placeholder", "123-456-7890");
    phoneInput.required = true;
    phoneInput.classList.add("formInput", "phoneInput");

    const form = document.createElement('div');
    form.appendChild(nameLabel);
    form.appendChild(nameInput);
    form.appendChild(phoneLabel);
    form.appendChild(phoneInput);

    document.querySelector('#formLines').appendChild(form);
}

function startGame(event) {
    // prevent submit button from POSTing
    event.preventDefault();
    // get player info from the start game form
    const playerNames = (Array.from(document.querySelectorAll('.nameInput'))).map(elem => elem.value);
    const playerNumbers = (Array.from(document.querySelectorAll('.phoneInput'))).map(elem => elem.value);
    for (let i = 0; i < playerNames.length; i++) {
        players[i] = {name: playerNames[i], phoneNum: playerNumbers[i]};
    }
    // ensure phone numbers on form input are valid
    if (checkPhoneNumbers(playerNumbers)) {
        // make the start form invisible
        const startForm = document.querySelector('#startForm');
        startForm.classList.toggle('invisible');
        // show the relevant information for this game
        const gameInfo = document.querySelector('#gameInfo');
        gameInfo.classList.toggle('invisible');
        const survivingList = document.querySelector('#surviving');
        const extinctList = document.querySelector('#extinct');
        // all players are surviving, at the beginning
        for (let i = 0; i < numPlayers; i++) {
            const listItem = document.createElement("li");
            listItem.textContent = playerNames[i];
            survivingList.appendChild(listItem);
        }
        assignRoles();
    }
}

function checkPhoneNumbers(playerNumbers) {
    const phoneRegex = new RegExp("/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im");
    for (let n in playerNumbers) {
        if (phoneRegex.test(n)) {
            const warningText = document.querySelector('.warningText');
            warningText.textContent = "Invalid phone number!";
            return false;
        }
    }
    return true;
}

async function assignRoles() {
    // assign one random player the invasive species role, and all other players the native species role
    players[Math.floor(Math.random() * numPlayers)].role = "invasive";
    for (let player of players) {
        if (!player.role) {
            player.role = "native";
        }
    }
    // send a POST request to the server, to tell it to text all the players with their role assignments
    for (let player of players) {
        await fetch('/game', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({phoneNum: player.phoneNum, text: "Welcome to Invasive Impostor 🐍! Your role this game is:\n" + player.role})
        });
    }
}

function eatingRound() {
    availableResources = Math.floor(Math.random() * (2 * numPlayers - Math.ceil(0.5 * numPlayers) + 1) + Math.ceil(0.5 * numPlayers));
    while(true) {
        if (availableResources > 0) {
            // Active player consumes
            newConsumption = contactEater(players[whoseTurn]);
            availableResources -= newConsumption;
            consumedResources += newConsumption;
            if (consumedResources >= 4 * numPlayers) {
                // Native species wins
                console.log("Game Over!");
                return;
            }
        } else {
            // Player dies
            if (survivingList.length < 3) {
                // Invasive species wins
                console.log("Game Over!");
                return;
            } else {
                // Round ends without a winner
                return;
            }
        }
        // Round continues
        whoseTurn++;
        if(whoseTurn==numPlayers) {
            whoseTurn = 0;
        }
    }
}

async function contactEater(player) {
    let messageText = "It's time to take resources! There are currently " + availableResources + " resources available. You can take";
    if (player.role == "invasive") {
        messageText += " between 0 and " + availableResources;
    } else {
        messageText += " 1 or 2";
    }
    messageText += " resources. How many resources would you like to take?"
    await fetch('/game', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({phoneNum: player.phoneNum, text: messageText})
    });
    return 1;
}

async function votingRound() {
    for (let player of players) {
        await fetch('/game', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({phoneNum: player.phoneNum, text: "It's time to vote! Text the name of the player you'd like to vote out."})
        });
    }
    // Then gather all the votes and eliminate a player
}

document.addEventListener('DOMContentLoaded', main);
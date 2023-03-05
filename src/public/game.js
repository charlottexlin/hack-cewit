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
    phoneInput.setAttribute("type", "text");
    phoneInput.setAttribute("name", "phone-number");
    phoneInput.setAttribute("placeholder", "+11234567890");
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
    for (let i = 0; i < numPlayers; i++) {
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
            players[i].status = "surviving";
            const listItem = document.createElement("li");
            listItem.textContent = playerNames[i];
            survivingList.appendChild(listItem);
        }
        assignRoles();
        whoseTurn = Math.floor(Math.random() * numPlayers);
        while (true) {
            let gameStatus = 0;
            // 0: in progress, 1: native species victory, -1: invasive species victory
            gameStatus = eatingRound();
            if (gameStatus == 1) {
                gameOver("native species");
                return;
            } else if (gameStatus == -1) {
                gameOver("invasive species");
                return;
            }
            gameStatus = votingRound();
            if (gameStatus == 1) {
                gameOver("native species");
                return;
            } else if (gameStatus == -1) {
                gameOver("invasive species");
                return;
            }
        }
    }
}

function checkPhoneNumbers(playerNumbers) {
    //const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$/;
    const phoneRegex = /^\+1[0-9]{10}$/;
    for (let n of playerNumbers) {
        if (!(phoneRegex.test(n))) {
            const warningText = document.querySelector('.warningText');
            warningText.textContent = "Invalid phone number!";
            return false;
        }
    }
    return true;
}

function assignRoles() {
    // assign one random player the invasive species role, and all other players the native species role
    players[Math.floor(Math.random() * numPlayers)].role = "invasive";
    for (let player of players) {
        if (!player.role) {
            player.role = "native";
        }
    }
    // send a POST request to the server, to tell it to text all the players with their role assignments
    for (let player of players) {
        sendToBack(player.phoneNum, player.name + ": Welcome to Invasive Impostor 🐍! Your role this game is:\n" + player.role + " species")
    }
}

function eatingRound() {
    availableResources = Math.floor(Math.random() * (2 * numPlayers - Math.ceil(0.5 * numPlayers) + 1) + Math.ceil(0.5 * numPlayers));
    while(true) {
        if (players[whoseTurn].status == "surviving") {
            if (availableResources > 0 || players[whoseTurn].role == "invasive") {
                // Active player consumes
                let newConsumption = contactEater(players[whoseTurn]);
                availableResources -= newConsumption;
                if (players[whoseTurn].role == "native") {
                    consumedResources += newConsumption;
                    if (consumedResources >= 4 * numPlayers) {
                        // Native species wins
                        return 1;
                    }
                }
            } else {
                // Player dies
                players[whoseTurn].status = "extinct";
                sendToBack(players[whoseTurn].phoneNum, players[whoseTurn].name + ": You find there are no resources left, and you go extinct!")

                // Update UI
                const survivingList = document.querySelector('#surviving');
                const extinctList = document.querySelector('#extinct');
                survivingList.replaceChildren(); // clear out the existing lists
                extinctList.replaceChildren();
                // repopulate the lists
                for (let i = 0; i < numPlayers; i++) {
                    const listItem = document.createElement("li");
                    listItem.textContent = players[i].name;
                    if (players[i].status === "surviving") {
                        survivingList.appendChild(listItem);
                    } else {
                        extinctList.appendChild(listItem);
                    }
                }

                if (players.filter(player => player.status = "surviving").length < 3) {
                    // Invasive species wins
                    return -1;
                } else {
                    // Round ends without a winner
                    return 0;
                }
            }
        }
        // Round continues
        whoseTurn++;
        if(whoseTurn==numPlayers) {
            whoseTurn = 0;
        }
    }
}

function contactEater(player) {
    let messageText = player.name + ": It's time to take resources! There are currently " + availableResources + " resources available. You can take";
    if (player.role == "invasive") {
        messageText += " between 0 and " + availableResources + " resources.";
    } else if (availableResources > 1) {
        messageText += " 1 or 2 resources.";
    } else {
        messageText += " 1 resource.";
    }
    messageText += " How many resources would you like to take?"
    sendToBack(player.phoneNum, messageText);
    let chosenAmount = receiveFromBack(player.phoneNum);
    if (chosenAmount == 1 || chosenAmount == 2 || (player.role == "invasive" && chosenAmount >= 0 && chosenAmount <= availableResources)) {
        return chosenAmount;
    }
    sendToBack(player.phoneNum, player.name + ": Not a valid response, defaulting to lowest amount possible.");
    if (player.role == "invasive") {
        return 0;
    } else {
        return 1;
    }
}

function votingRound() {
    let votesPerPlayer = new Array(numPlayers).fill(0);
    for (let player of players) {
        if (player.status == "surviving") {
            sendToBack(player.phoneNum, player.name + ": It's time to vote! Text the name of the player you'd like to vote out.")
            let vote = receiveFromBack(player.phoneNum);
            let match = 0;
            for (let i = 0; i < numPlayers; i++) {
                if (players[i].name == vote) {
                    votesPerPlayer[i] += 1;
                    match = 1;
                }
            }
            if (match == 0) {
                sendToBack(player.phoneNum, player.name + ": Not a valid response, vote skipped.");
            }
        }
    }
    let votedOut = -1;
    let maxFound = 0;
    for (let i = 0; i < numPlayers; i++) {
        if (votesPerPlayer[i] > maxFound) {
            maxFound = votesPerPlayer[i];
            votedOut = i;
        } else if (votesPerPlayer[i] == maxFound) {
            votedOut = -1;
        }
    }
    if (votedOut < 0) {
        // No one dies and the game continues
        return 0;
    } else if (players[votedOut].role = "invasive") {
        // Native species wins
        return 1;
    } else if (players.filter(player => player.status = "surviving").length < 4) {
        // Invasive species wins
        return -1;
    }
    // Someone dies and the game continues
    players[votedOut].status = "extinct";
    sendToBack(players[votedOut].phoneNum, players[votedOut].name + ": You have been voted out and eliminated!");

    // Update UI
    const survivingList = document.querySelector('#surviving');
    const extinctList = document.querySelector('#extinct');
    survivingList.replaceChildren(); // clear out the existing lists
    extinctList.replaceChildren();
    // repopulate the lists
    for (let i = 0; i < numPlayers; i++) {
        const listItem = document.createElement("li");
        listItem.textContent = playerNames[i];
        if (players[i].status === "surviving") {
            survivingList.appendChild(listItem);
        } else {
            extinctList.appendChild(listItem);
        }
    }
    return 0;
}

function gameOver(winner) {
    // make the game information invisible
    const gameInfo = document.querySelector('#gameInfo');
    gameInfo.classList.toggle('invisible');
    // show the game over screen
    const gameOver = document.querySelector('#gameOver');
    gameOver.classList.toggle('invisible');
    const winnerText = document.querySelector('#winnerText');
    winnerText.textContent = "The " + winner + " win!";
}

async function sendToBack(phone, message) {
    await fetch('/game', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({mode: "send", phoneNum: phone, text: message})
    });
}

async function receiveFromBack(phone) {
    const res = await fetch('/game', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({mode: "receive", phoneNum: phone})
    });
    return await res.json().msg;
}

document.addEventListener('DOMContentLoaded', main);
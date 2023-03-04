let numPlayers = 0;

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
        const warningText = document.querySelector('#warningText');
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
    nameInput.classList.add("formInput");

    const phoneLabel = document.createElement('label');
    phoneLabel.setAttribute("for", "phone-number");
    phoneLabel.classList.add("formLabel");
    phoneLabel.textContent = "Phone number";

    const phoneInput = document.createElement("input");
    phoneInput.setAttribute("type", "tel");
    phoneInput.setAttribute("name", "phone-number");
    phoneInput.setAttribute("placeholder", "123-456-7890");
    phoneInput.classList.add("formInput");

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
    // Make the start form invisible
    const startForm = document.querySelector('#startForm');
    startForm.classList.toggle('invisible');
}

document.addEventListener('DOMContentLoaded', main);
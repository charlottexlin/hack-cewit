let numPlayers = 0;

function main() {
    const playersForm = document.querySelector('#playersForm');
    const formLines = document.createElement('div');
    formLines.setAttribute('id', "formLines");
    playersForm.appendChild(formLines);

    for (let i=0; i < 5; i++) {
        createFormLine();
    }

    const addPlayerBtn = document.querySelector('#addPlayerBtn');
    addPlayerBtn.addEventListener('click', addPlayerToForm);

    const submitBtn = document.createElement('input');
    submitBtn.setAttribute("type", "submit");
    submitBtn.setAttribute("value", "Submit");

    playersForm.appendChild(submitBtn);
}

function addPlayerToForm(event) {
    console.log(numPlayers);
    if (numPlayers > 10) {
        numPlayers = 10;
        const warningText = document.querySelector('#warningText');
        warningText.textContent = "TOO MANY PLAYERS";
    } else {
        createFormLine();
    }
}

function createFormLine() {
    numPlayers++;

    const nameLabel = document.createElement('label');
    nameLabel.setAttribute("for", "name");
    nameLabel.textContent = "Name";

    const nameInput = document.createElement("input");
    nameInput.setAttribute("type", "text");
    nameInput.setAttribute("name", "name");
    nameInput.setAttribute("placeholder", "Player name");

    const phoneLabel = document.createElement('label');
    phoneLabel.setAttribute("for", "phone-number");
    phoneLabel.textContent = "Phone number";

    const phoneInput = document.createElement("input");
    phoneInput.setAttribute("type", "tel");
    phoneInput.setAttribute("name", "phone-number");
    phoneInput.setAttribute("placeholder", "123-456-7890");

    const form = document.createElement('div');
    form.appendChild(nameLabel);
    form.appendChild(nameInput);
    form.appendChild(phoneLabel);
    form.appendChild(phoneInput);

    document.querySelector('#formLines').appendChild(form);
}

document.addEventListener('DOMContentLoaded', main);
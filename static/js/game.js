const inputContainer = document.querySelector("#game-wrapper .input-container");
const inputFieldEl = inputContainer.querySelector("input");
const playerListEl = inputContainer.querySelector(".players-list");

function inputFieldFunction() {
    inputFieldEl.value = inputFieldEl.value.toUpperCase();
    inputString = inputFieldEl.value;
    updatePlayersList();
}


function inputFieldButtonFunction(e) {
    if (e.key === "Enter") {
        gameEnterFunction();
    } else if (e.key === "ArrowUp") {
        children = playerListEl.children;

        currentIndex --;
        if (currentIndex < 0) {
            currentIndex = children.length - 1
        }

        updateSelectedPlayer(currentIndex);
    } else if (e.key === "ArrowDown") {
        children = playerListEl.children;

        currentIndex ++;
        if (currentIndex > children.length - 1) {
            currentIndex = 0;
        }
 
        updateSelectedPlayer(currentIndex);
    }
}

function gameEnterFunction() {
    children = playerListEl.children;

    for (child of children) {
        if (child.classList.contains("active")) {
            playerListElementClick(child);
        }
    }
}

function createPlayerListElement(player) {
    let li = document.createElement("li");
    li.classList.add("player");
    li.setAttribute("onclick", "playerListElementClick(this)");
    li.setAttribute("player-data", JSON.stringify(player));

    let nameDiv = document.createElement("div");
    nameDiv.classList.add("name");
    
    if (player["name"]["first"]) {
        let firstNameSpan = document.createElement("span");
        firstNameSpan.classList.add("first");
        firstNameSpan.textContent = player["name"]["first"]
        nameDiv.appendChild(firstNameSpan);
    }
    
    lastNameDiv = document.createElement("div");
    lastNameDiv.classList.add("last");
    lastNameDiv.textContent = player["name"]["last"].toUpperCase();
    nameDiv.appendChild(lastNameDiv);

    // IMAGE STUFF (MAYBE)

    li.appendChild(nameDiv);

    playerListEl.appendChild(li);
}

function updatePlayersList() {
    playerListEl.innerHTML = "";
    playerListEl.classList.remove("active");


    let inputString = inputFieldEl.value.toLowerCase();

    if (inputString.length < 2) {return}



    players.forEach(player => {
        let searchList = player["name"]["search"];

        for (let searchItem of searchList) {
            if (searchItem && searchItem.toLowerCase().startsWith(inputString)) {
                createPlayerListElement(player);
                return
            }
        }
    })

    if (playerListEl.innerHTML === "") {
        playerListEl.innerHTML = `<p>Oops! No players found.</p>`;
    } else {
        playerListEl.classList.add("active");
        let currentIndex = 0;
        updateSelectedPlayer(currentIndex);
    }
}

function playerListElementClick(player) {
    let playerData = JSON.parse(player.getAttribute("player-data"));
    let playerId = playerData["player_id"];

    let endTime = timeLeft;
    let elapsedTime = startTime - endTime;

    serverData["questions"][currentQuestionIndex]["attempts"].push({"answer": playerData, "time": elapsedTime});
    if (solutions.includes(playerId)) {
        questionSolved = true;
        console.log("Correct answer!");
        nextQuestion()

        resultsData.push(playerData);
    } else {
        console.log("Incorrect, try again!");

        startTime = timeLeft;
    }

    inputFieldEl.value = "";
    playerListEl.innerHTML = "";
}



let currentIndex = 0;
function updateSelectedPlayer(currentIndex) {
    children = playerListEl.children;

    for (let i=0; i<children.length; i++) {
        if (children[i].classList.contains("active")) {
            children[i].classList.remove("active");
        }

        if (i == currentIndex) {
            children[i].classList.add("active");
            children[i].scrollIntoView({ behavior: "auto", block: "nearest" });
        }
    }
}
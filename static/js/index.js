const mainContainer = document.querySelector("#main-container");
const startWrapper = mainContainer.querySelector("#start-wrapper");
const readyWrapper = mainContainer.querySelector("#ready-wrapper");
const gameWrapper = mainContainer.querySelector("#game-wrapper");
let gameState = "start";

// ENTER BUTTON ON MAIN PAGE TO NAVIGAE MAIN CONTAINER
document.addEventListener("keydown", (e) => {
    if (gameState === "start") {
        if (e.key === "Enter") {
            prepareGame()
        }
    } else if (gameState === "prepare") {
        if (e.key === "Enter") {
            startGame();
        }
    } else if (gameState === "end") {
        if (e.key === "Enter") {
            showResults();
        }
    }
});

// CLICKING MAIN CONTAINER TO NAVIGATE MAIN CONTAINER
mainContainer.addEventListener("click", () => {
    if (startWrapper.classList.contains("active")) {
        prepareGame()

        // Prepare game
    } else if (readyWrapper.classList.contains("active")) {
        startGame()
    } else if (gameState === "end") {
        showResults();
    }
})


// ON-SCREEN KEYBOARD
const keyboardEl = document.querySelector("#keyboard");
const keys = keyboardEl.querySelectorAll(".key");

keys.forEach(key => {
    key.addEventListener("click", () => {
        if (key.classList.contains("enter")) {
            const enterEvent = new KeyboardEvent('keydown', {
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
                which: 13,
                bubbles: true
            });
            
            inputFieldEl.dispatchEvent(enterEvent);
            if (gameState === "game") {
                inputFieldEl.focus();
            }
        } else if (key.classList.contains("space") && gameState === "game") {
            inputFieldEl.value += ' ';
            
            const inputEvent = new Event('input', { bubbles: true });
            inputFieldEl.dispatchEvent(inputEvent);

            inputFieldEl.focus();
        } else if (key.classList.contains("erase") && gameState === "game") {
            inputFieldEl.value = inputFieldEl.value.slice(0, -1);

            const inputEvent = new Event('input', { bubbles: true });
            inputFieldEl.dispatchEvent(inputEvent);
        
            inputFieldEl.focus();
        } else if (key.classList.contains("clear") && gameState === "game") {
            inputFieldEl.value = "";

            const inputEvent = new Event('input', { bubbles: true });
            inputFieldEl.dispatchEvent(inputEvent);

            inputFieldEl.focus();
        } else if (key.classList.contains("up") && gameState === "game") {
            // Simulate Arrow Up key event
            const arrowUpEvent = new KeyboardEvent('keydown', {
                key: 'ArrowUp',
                code: 'ArrowUp',
                keyCode: 38, // KeyCode for Arrow Up
                which: 38,   // Old way of detecting Arrow Up
                bubbles: true
            });
            inputFieldEl.dispatchEvent(arrowUpEvent); // Dispatch the event
            inputFieldEl.focus();
        } else if (key.classList.contains("down") && gameState === "game") {
            const arrowDownEvent = new KeyboardEvent('keydown', {
                key: 'ArrowDown',
                code: 'ArrowDown',
                keyCode: 40, // KeyCode for Arrow Down
                which: 40,   // Old way of detecting Arrow Down
                bubbles: true
            });
            inputFieldEl.dispatchEvent(arrowDownEvent); // Dispatch the event
            inputFieldEl.focus();
        } else {
            if (gameState === "game") {
                character = key.textContent;
                inputFieldEl.value += character;
    
                const inputEvent = new Event('input', { bubbles: true });
                inputFieldEl.dispatchEvent(inputEvent);
    
                inputFieldEl.focus();
            }
        }
    })
})

// GAME STATE STUFF
function prepareGame() {
    startWrapper.classList.remove("active");
    readyWrapper.classList.add("active");
    keyboardEl.classList.add("active");

    gameState = "prepare";

    fetch("/api/new-game")
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        questions = data;
    })
    .catch((error) => {
        console.error('Error:', error);  // Handle any errors
    });
}

function startGame() {
    inputFieldEl.addEventListener("input", inputFieldFunction);
    inputFieldEl.addEventListener("keydown", (e) => {inputFieldButtonFunction(e)});

    readyWrapper.classList.remove("active");
    gameWrapper.classList.add("active");

    gameState = "game";

    // Disable mouse events initially
    disableMouse();
    document.addEventListener("mousemove", enableMouse);

    startTimer();

    loadQuestion(currentQuestionIndex);
}

let currentQuestionIndex = 0;
let questionSolved = false;
let solutions;
let resultsData = [];
let serverData = {"questions": [], "score": {"timeBonus": 0, "total": 0}};
let startTime;
let questions;

const promptEl = document.querySelector("#game-wrapper .title");
function loadQuestion(index) {
    if (index < 23) {
        let question = questions[index];
        
        let prompt = question["prompt"]
        promptEl.textContent = prompt;

        solutions = question["solutions"]; // Store the solutions for the current question

        inputFieldEl.focus();

        serverData["questions"].push({
            "question": prompt,
            "attempts": [],
            "points": {"question": 0, "namePoints": 0}
        });

        startTime = timeLeft;
    } else {
        console.log("No more questions!");
    }
}

function nextQuestion() {
    if (questionSolved) {
        currentQuestionIndex++;
        if (currentQuestionIndex < 23) {
            questionSolved = false;
            loadQuestion(currentQuestionIndex);
        } else {
            console.log("Game over! You've solved all questions.");
            stopGame();

            timeLeft = timeLeft / 100;
        }
    }
}


function stopGame() {
    clearInterval(timerInterval);

    showResults();

    console.log(serverData);

    // Send a POST request to the Flask server
    fetch('/api/submit-results', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'  // Indicate the type of data being sent
        },
        body: JSON.stringify(serverData)  // Convert data object to JSON string
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {

    })
    .catch((error) => {
        console.error('Error:', error);  // Handle any errors
    });

    
};

const resultsWrapper = document.querySelector("#results-wrapper");
const resultsTextEls = document.querySelectorAll("#results-wrapper .results-text");
const totalScoreEl = document.querySelector("#results-wrapper .total-score span");
let totalScore = 0;
let timeBonus = 0;
const timeBonusEl = document.querySelector("#results-wrapper .time-bonus");
async function showResults() {
    gameWrapper.classList.remove("active");
    resultsWrapper.classList.add("active");

    for (let i = 0; i < 24; i++) {
        await new Promise(resolve => {
            setTimeout(() => {
                if (i < resultsData.length) {
                    let name = resultsData[i]["name"]["last"];
                    let namePoints = calculateNamePoints(name);

                    let questionPoints = i + 1 + namePoints;

                    serverData["questions"][i]["points"]["question"] = i;
                    serverData["questions"][i]["points"]["namePoints"] = namePoints;

                    totalScore += questionPoints;

                    resultsTextEls[i].textContent += ` ${name.toUpperCase()}`;
                    resultsTextEls[i].classList.add("active");

                    totalScoreEl.textContent = totalScore;
                } else if (i === 23) {
                    timeBonus = parseInt(timeLeft * 5);
                    timeBonusEl.querySelector("span").textContent = timeBonus;
                    timeBonusEl.classList.add("active");

                    totalScore += timeBonus;
                    totalScoreEl.textContent = totalScore;

                    serverData["score"]["timeBonus"] = timeBonus;
                    serverData["score"]["total"] = totalScore;
                }
                else {
                    resultsTextEls[i].textContent += ` -------`;
                    resultsTextEls[i].classList.add("active");
                }
                resolve();  // Resolve the promise once the current log is done
            }, i < resultsData.length ? 400 : 150); // Different delay for each condition
        });
    };
}

function calculateNamePoints(name) {
    let points = 0;
    let cleanedName = name.replace(/-/g, ""); // Remove hyphens
    cleanedName = name.replace(" ", ""); // Remove hyphens

    for (let i = 0; i < cleanedName.length; i++) {
        if (i === 0) {
            points += 1; // 1 point for the first letter
        } else if (i === 1) {
            points += 2; // 2 points for the second letter
        } else {
            points += 3; // 3 points for the remaining letters
        }
    }

    return points;
}
// TIMER STUFF
let timeLeft = 23000; // 23 seconds in milliseconds
let timerInterval;
let timerEl = document.querySelector("#game-wrapper .bottom-row #timer");

function startTimer() {
    if (timerInterval) {
        return; // Prevent starting another interval if one is already active
    }

    timerInterval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft -= 10; // Decrement timeLeft by 10 milliseconds
            
            // Calculate the remaining seconds
            let secondsRemaining = timeLeft / 1000; // Convert milliseconds to seconds

            // Display format based on remaining time
            if (secondsRemaining < 5) {
                // Display with one decimal place
                timerEl.textContent = secondsRemaining.toFixed(1); // For example: 4.9, 4.8
            } else {
                // Display whole seconds
                timerEl.textContent = Math.floor(secondsRemaining); // For example: 23
            }
        } else {
            stopGame(); // Call stopGame when time is up
        }
    }, 10); // Update every 10 milliseconds
}

// DISABLE MOUSE
function disableMouse() {
    document.body.style.pointerEvents = "none";
}

function enableMouse() {
    document.body.style.pointerEvents = "auto";
    document.removeEventListener("mousemove", enableMouse);
}

javascript
/* =========================================================
   KIDS SCIENCE
   COMPLETE FIREBASE-CONNECTED JAVASCRIPT
   ========================================================= */

"use strict";

/* =========================================================
   FIREBASE
   ========================================================= */

import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
    getDatabase,
    ref,
    push,
    set,
    onValue,
    onDisconnect,
    serverTimestamp
} from
    "https://www.gstatic.com/firebasejs/12.18.0/firebase-database.js";


/* =========================================================
   FIREBASE CONFIG
   =========================================================
   IMPORTANT:
   Replace the YOUR_... values with your Firebase Web App
   configuration.

   Your databaseURL is already inserted.
   ========================================================= */

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "chrono-fa677.firebaseapp.com",
    databaseURL: "https://chrono-fa677-default-rtdb.firebaseio.com/",
    projectId: "chrono-fa677",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};


/* =========================================================
   FIREBASE INITIALIZATION
   ========================================================= */

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);


/* =========================================================
   STORAGE
   ========================================================= */

const ACCOUNTS_KEY = "kidsScienceAccounts";
const CURRENT_ACCOUNT_KEY = "kidsScienceCurrentUID";
const WATCH_VIDEO_KEY = "kidsScienceWatchVideo";
const FLAPPY_BEST_KEY = "kidsScienceFlappyBest";

let accounts = [];
let currentAccount = null;


/* =========================================================
   LOAD LOCAL ACCOUNTS
   ========================================================= */

function loadAccounts() {
    try {
        accounts = JSON.parse(
            localStorage.getItem(ACCOUNTS_KEY)
        ) || [];
    } catch (error) {
        console.error("Could not load accounts:", error);
        accounts = [];
    }
}


function saveAccounts() {
    localStorage.setItem(
        ACCOUNTS_KEY,
        JSON.stringify(accounts)
    );
}


function getCurrentAccount() {
    loadAccounts();

    const uid = localStorage.getItem(
        CURRENT_ACCOUNT_KEY
    );

    if (!uid) {
        currentAccount = null;
        return null;
    }

    currentAccount =
        accounts.find(account => account.uid === uid) || null;

    return currentAccount;
}


function saveCurrentAccount() {
    if (!currentAccount) return;

    const index = accounts.findIndex(
        account => account.uid === currentAccount.uid
    );

    if (index === -1) {
        accounts.push(currentAccount);
    } else {
        accounts[index] = currentAccount;
    }

    saveAccounts();
}


/* =========================================================
   UID
   ========================================================= */

function generateUID() {

    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let uid = "KID-";

    for (let i = 0; i < 6; i++) {
        uid += characters[
            Math.floor(Math.random() * characters.length)
        ];
    }

    return uid;
}


/* =========================================================
   RANDOM AVATAR
   ========================================================= */

function randomEmoji() {

    const emojis = [
        "🙂",
        "😀",
        "😎",
        "🤓",
        "🐶",
        "🐱",
        "🦊",
        "🐼",
        "🐯",
        "🐸",
        "🐵",
        "🦁",
        "🐨",
        "🐰"
    ];

    return emojis[
        Math.floor(Math.random() * emojis.length)
    ];
}


/* =========================================================
   LOGIN
   ========================================================= */

function enterScienceWorld() {

    const input =
        document.getElementById("nameInput");

    if (!input) return;

    const name = input.value.trim();

    if (!name) {
        alert("Please enter your nickname.");
        return;
    }

    if (name.length > 16) {
        alert("Nickname must be 16 characters or less.");
        return;
    }

    loadAccounts();

    const existingAccount =
        accounts.find(
            account =>
                account.name.toLowerCase() ===
                name.toLowerCase()
        );

    if (existingAccount) {

        currentAccount = existingAccount;

        localStorage.setItem(
            CURRENT_ACCOUNT_KEY,
            existingAccount.uid
        );

    } else {

        currentAccount = {

            uid: generateUID(),

            name: name,

            emoji: randomEmoji(),

            balance: 500,

            pass: "FREE",

            passExpires: null,

            transactions: [
                {
                    text: "🎁 Welcome bonus",
                    amount: 500,
                    date: new Date().toLocaleString()
                }
            ],

            lastBonusDate: null,

            lastDailyPassReward: null
        };

        accounts.push(currentAccount);

        localStorage.setItem(
            CURRENT_ACCOUNT_KEY,
            currentAccount.uid
        );

        saveAccounts();
    }

    saveCurrentAccount();

    registerPlayerOnline();

    window.location.href = "home.html";
}


/* =========================================================
   LOGIN PAGE
   ========================================================= */

function initializeLoginPage() {

    const button =
        document.getElementById("enterButton");

    const input =
        document.getElementById("nameInput");

    if (button) {
        button.addEventListener(
            "click",
            enterScienceWorld
        );
    }

    if (input) {

        input.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {
                    enterScienceWorld();
                }

            }
        );
    }
}


/* =========================================================
   PROTECTED PAGES
   ========================================================= */

function requireLogin() {

    const page =
        document.body.dataset.page;

    if (page === "login") return;

    getCurrentAccount();

    if (!currentAccount) {
        window.location.href = "index.html";
        return false;
    }

    checkPassExpiration();
    processDailyPassReward();

    return true;
}


/* =========================================================
   PASS EXPIRATION
   ========================================================= */

function checkPassExpiration() {

    if (!currentAccount) return;

    if (
        currentAccount.pass !== "FREE" &&
        currentAccount.passExpires
    ) {

        if (
            Date.now() >=
            new Date(currentAccount.passExpires).getTime()
        ) {

            currentAccount.pass = "FREE";
            currentAccount.passExpires = null;

            currentAccount.lastDailyPassReward = null;

            saveCurrentAccount();

            applyPassTheme();
        }
    }
}


/* =========================================================
   DAILY PASS REWARD
   ========================================================= */

function processDailyPassReward() {

    if (!currentAccount) return;

    if (currentAccount.pass === "FREE") {
        return;
    }

    const today =
        new Date().toISOString().slice(0, 10);

    if (
        currentAccount.lastDailyPassReward ===
        today
    ) {
        return;
    }

    let reward = 0;

    if (currentAccount.pass === "PRO") {
        reward = 500;
    }

    if (currentAccount.pass === "ELITE") {
        reward = 750;
    }

    if (currentAccount.pass === "PREMIUM") {
        reward = 400;
    }

    if (reward > 0) {

        currentAccount.balance += reward;

        currentAccount.lastDailyPassReward =
            today;

        if (!currentAccount.transactions) {
            currentAccount.transactions = [];
        }

        currentAccount.transactions.unshift({

            text:
                `🎟️ ${currentAccount.pass} daily reward`,

            amount: reward,

            date: new Date().toLocaleString()
        });

        saveCurrentAccount();
    }
}


/* =========================================================
   HEADER
   ========================================================= */

function updateHeader() {

    getCurrentAccount();

    if (!currentAccount) return;

    const nameElements =
        document.querySelectorAll("[data-player-name]");

    nameElements.forEach(element => {
        element.textContent =
            currentAccount.name;
    });

    const avatarElements =
        document.querySelectorAll("[data-player-avatar]");

    avatarElements.forEach(element => {
        element.textContent =
            currentAccount.emoji;
    });

    const uidElements =
        document.querySelectorAll("[data-player-uid]");

    uidElements.forEach(element => {
        element.textContent =
            currentAccount.uid;
    });

    updateBalanceDisplays();
    applyPassTheme();
}


/* =========================================================
   PASS THEME
   ========================================================= */

function applyPassTheme() {

    document.body.classList.remove(
        "pass-pro",
        "pass-elite",
        "pass-premium"
    );

    if (!currentAccount) return;

    if (currentAccount.pass === "PRO") {
        document.body.classList.add("pass-pro");
    }

    if (currentAccount.pass === "ELITE") {
        document.body.classList.add("pass-elite");
    }

    if (currentAccount.pass === "PREMIUM") {
        document.body.classList.add("pass-premium");
    }
}


/* =========================================================
   ACCOUNT MODAL
   ========================================================= */

function openAccountModal() {

    const modal =
        document.getElementById("accountModal");

    if (!modal) return;

    getCurrentAccount();

    modal.classList.add("show");

    updateHeader();
}


function closeAccountModal() {

    const modal =
        document.getElementById("accountModal");

    if (!modal) return;

    modal.classList.remove("show");
}


/* =========================================================
   LOGOUT
   ========================================================= */

function logoutCurrentAccount() {

    removePlayerOnline();

    localStorage.removeItem(
        CURRENT_ACCOUNT_KEY
    );

    currentAccount = null;

    window.location.href = "index.html";
}


/* =========================================================
   DELETE ACCOUNT
   ========================================================= */

function deleteCurrentAccount() {

    getCurrentAccount();

    if (!currentAccount) return;

    const confirmed =
        confirm(
            "Are you sure you want to permanently delete this account?"
        );

    if (!confirmed) return;

    const uid =
        currentAccount.uid;

    accounts =
        accounts.filter(
            account => account.uid !== uid
        );

    saveAccounts();

    localStorage.removeItem(
        CURRENT_ACCOUNT_KEY
    );

    removePlayerOnline(uid);

    currentAccount = null;

    window.location.href = "index.html";
}


/* =========================================================
   BALANCE
   ========================================================= */

function updateBalanceDisplays() {

    if (!currentAccount) return;

    const elements =
        document.querySelectorAll(
            "[data-balance]"
        );

    elements.forEach(element => {

        element.textContent =
            currentAccount.balance;

    });
}


/* =========================================================
   ADD COINS
   ========================================================= */

function addCoins(amount, reason = "Coins added") {

    getCurrentAccount();

    if (!currentAccount) return false;

    amount = Number(amount);

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        return false;
    }

    currentAccount.balance += amount;

    if (!currentAccount.transactions) {
        currentAccount.transactions = [];
    }

    currentAccount.transactions.unshift({

        text: reason,

        amount: amount,

        date: new Date().toLocaleString()
    });

    saveCurrentAccount();

    updateBalanceDisplays();

    return true;
}


/* =========================================================
   SPEND COINS
   ========================================================= */

function spendCoins(
    amount,
    reason = "Coins spent"
) {

    getCurrentAccount();

    if (!currentAccount) return false;

    amount = Number(amount);

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        return false;
    }

    if (currentAccount.balance < amount) {

        alert("Not enough PlayCoins.");

        return false;
    }

    currentAccount.balance -= amount;

    if (!currentAccount.transactions) {
        currentAccount.transactions = [];
    }

    currentAccount.transactions.unshift({

        text: reason,

        amount: -amount,

        date: new Date().toLocaleString()
    });

    saveCurrentAccount();

    updateBalanceDisplays();

    return true;
}


/* =========================================================
   DAILY BONUS
   ========================================================= */

function claimDailyBonus() {

    getCurrentAccount();

    if (!currentAccount) return;

    const today =
        new Date().toISOString().slice(0, 10);

    if (
        currentAccount.lastBonusDate ===
        today
    ) {

        alert(
            "You already claimed today's bonus."
        );

        return;
    }

    const reward = 100;

    currentAccount.balance += reward;

    currentAccount.lastBonusDate = today;

    if (!currentAccount.transactions) {
        currentAccount.transactions = [];
    }

    currentAccount.transactions.unshift({

        text: "🎁 Daily bonus",

        amount: reward,

        date: new Date().toLocaleString()
    });

    saveCurrentAccount();

    updateBalanceDisplays();

    updateBonusButton();

    alert(
        `You received ${reward} PlayCoins!`
    );
}


/* =========================================================
   BONUS BUTTON
   ========================================================= */

function updateBonusButton() {

    const button =
        document.getElementById("dailyBonusButton");

    if (!button || !currentAccount) return;

    const today =
        new Date().toISOString().slice(0, 10);

    if (
        currentAccount.lastBonusDate ===
        today
    ) {

        button.disabled = true;

        button.textContent =
            "Bonus Claimed";

    } else {

        button.disabled = false;

        button.textContent =
            "Claim Daily Bonus";
    }
}


/* =========================================================
   TRANSACTIONS
   ========================================================= */

function renderTransactions() {

    getCurrentAccount();

    const container =
        document.getElementById(
            "transactionsList"
        );

    if (!container || !currentAccount) {
        return;
    }

    container.innerHTML = "";

    const transactions =
        currentAccount.transactions || [];

    transactions.forEach(transaction => {

        const item =
            document.createElement("div");

        item.className =
            "transaction-item";

        const sign =
            transaction.amount >= 0
                ? "+"
                : "";

        item.innerHTML = `
            <div>
                ${escapeHTML(transaction.text)}
            </div>

            <strong>
                ${sign}${transaction.amount}
            </strong>

            <small>
                ${escapeHTML(transaction.date)}
            </small>
        `;

        container.appendChild(item);
    });
}


/* =========================================================
   BUY PASS
   ========================================================= */

function buyPass(passName) {

    getCurrentAccount();

    if (!currentAccount) return;

    const passes = {

        PRO: {
            price: 5000,
            days: 10
        },

        ELITE: {
            price: 8000,
            days: 10
        },

        PREMIUM: {
            price: 12000,
            days: 10
        }
    };

    const selected =
        passes[passName];

    if (!selected) return;

    if (
        currentAccount.pass === passName &&
        currentAccount.passExpires
    ) {

        alert(
            `You already have ${passName}.`
        );

        return;
    }

    if (
        currentAccount.balance <
        selected.price
    ) {

        alert(
            "You do not have enough PlayCoins."
        );

        return;
    }

    currentAccount.balance -=
        selected.price;

    const expires =
        new Date();

    expires.setDate(
        expires.getDate() +
        selected.days
    );

    currentAccount.pass =
        passName;

    currentAccount.passExpires =
        expires.toISOString();

    currentAccount.lastDailyPassReward =
        null;

    if (!currentAccount.transactions) {
        currentAccount.transactions = [];
    }

    currentAccount.transactions.unshift({

        text:
            `🎟️ Purchased ${passName} Pass`,

        amount:
            -selected.price,

        date:
            new Date().toLocaleString()
    });

    saveCurrentAccount();

    applyPassTheme();
    updateHeader();
    updatePassPage();

    alert(
        `${passName} Pass activated for ${selected.days} days!`
    );
}


/* =========================================================
   PASS PAGE
   ========================================================= */

function updatePassPage() {

    getCurrentAccount();

    if (!currentAccount) return;

    const passName =
        document.getElementById(
            "currentPass"
        );

    const expiry =
        document.getElementById(
            "passExpiry"
        );

    if (passName) {
        passName.textContent =
            currentAccount.pass;
    }

    if (expiry) {

        if (currentAccount.passExpires) {

            expiry.textContent =
                new Date(
                    currentAccount.passExpires
                ).toLocaleString();

        } else {

            expiry.textContent =
                "No active pass";
        }
    }
}


/* =========================================================
   FLAPPY BIRD
   ========================================================= */

let flappyCanvas = null;
let flappyContext = null;

let flappyBird = null;
let flappyPipes = [];

let flappyScore = 0;
let flappyRunning = false;
let flappyAnimation = null;

const GRAVITY = 0.45;
const FLAP_POWER = -7;
const PIPE_SPEED = 3;
const PIPE_WIDTH = 65;
const PIPE_GAP = 140;
const BIRD_LEFT = 80;
const BIRD_SIZE = 35;


function getFlappyCanvas() {

    if (flappyCanvas) {
        return flappyCanvas;
    }

    flappyCanvas =
        document.getElementById(
            "flappyCanvas"
        );

    if (!flappyCanvas) {
        return null;
    }

    flappyContext =
        flappyCanvas.getContext("2d");

    return flappyCanvas;
}


function startFlappyBird() {

    const canvas =
        getFlappyCanvas();

    if (!canvas) return;

    flappyBird = {

        x: BIRD_LEFT,

        y: canvas.height / 2,

        velocity: 0
    };

    flappyPipes = [];

    flappyScore = 0;

    flappyRunning = true;

    addFlappyPipe();

    if (flappyAnimation) {
        cancelAnimationFrame(
            flappyAnimation
        );
    }

    flappyLoop();
}


function flapBird() {

    if (!flappyRunning) {
        startFlappyBird();
        return;
    }

    flappyBird.velocity =
        FLAP_POWER;
}


function addFlappyPipe() {

    const canvas =
        getFlappyCanvas();

    if (!canvas) return;

    const minimum =
        60;

    const maximum =
        canvas.height -
        PIPE_GAP -
        60;

    const top =
        Math.floor(
            Math.random() *
            (maximum - minimum + 1)
        ) + minimum;

    flappyPipes.push({

        x: canvas.width,

        top: top,

        passed: false
    });
}


function flappyLoop() {

    if (!flappyRunning) return;

    const canvas =
        getFlappyCanvas();

    if (!canvas) return;

    flappyContext.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    flappyBird.velocity +=
        GRAVITY;

    flappyBird.y +=
        flappyBird.velocity;

    if (
        flappyPipes.length === 0 ||
        flappyPipes[
            flappyPipes.length - 1
        ].x <
        canvas.width - 220
    ) {

        addFlappyPipe();
    }

    flappyPipes.forEach(pipe => {

        pipe.x -= PIPE_SPEED;

        if (
            !pipe.passed &&
            pipe.x + PIPE_WIDTH <
            flappyBird.x
        ) {

            pipe.passed = true;

            flappyScore++;

            updateFlappyScore();
        }
    });

    flappyPipes =
        flappyPipes.filter(
            pipe =>
                pipe.x +
                PIPE_WIDTH >
                0
        );

    drawFlappyBird();

    drawFlappyPipes();

    if (flappyCollision()) {

        endFlappyBird();

        return;
    }

    flappyAnimation =
        requestAnimationFrame(
            flappyLoop
        );
}


function drawFlappyBird() {

    if (!flappyContext || !flappyBird) {
        return;
    }

    flappyContext.font =
        `${BIRD_SIZE}px Arial`;

    flappyContext.fillText(
        "🐦",
        flappyBird.x,
        flappyBird.y
    );
}


function drawFlappyPipes() {

    const canvas =
        getFlappyCanvas();

    if (!canvas) return;

    flappyContext.fillStyle =
        "green";

    flappyPipes.forEach(pipe => {

        flappyContext.fillRect(
            pipe.x,
            0,
            PIPE_WIDTH,
            pipe.top
        );

        flappyContext.fillRect(
            pipe.x,
            pipe.top + PIPE_GAP,
            PIPE_WIDTH,
            canvas.height -
            pipe.top -
            PIPE_GAP
        );
    });
}


function flappyCollision() {

    const canvas =
        getFlappyCanvas();

    if (!canvas || !flappyBird) {
        return false;
    }

    if (
        flappyBird.y < 0 ||
        flappyBird.y >
        canvas.height
    ) {

        return true;
    }

    for (const pipe of flappyPipes) {

        const birdLeft =
            flappyBird.x;

        const birdRight =
            flappyBird.x +
            BIRD_SIZE;

        const birdTop =
            flappyBird.y -
            BIRD_SIZE;

        const birdBottom =
            flappyBird.y;

        const pipeLeft =
            pipe.x;

        const pipeRight =
            pipe.x +
            PIPE_WIDTH;

        if (
            birdRight > pipeLeft &&
            birdLeft < pipeRight
        ) {

            if (
                birdTop < pipe.top ||
                birdBottom >
                pipe.top + PIPE_GAP
            ) {

                return true;
            }
        }
    }

    return false;
}


function endFlappyBird() {

    flappyRunning = false;

    if (flappyAnimation) {

        cancelAnimationFrame(
            flappyAnimation
        );

        flappyAnimation = null;
    }

    const previousBest =
        Number(
            localStorage.getItem(
                FLAPPY_BEST_KEY
            ) || 0
        );

    if (flappyScore > previousBest) {

        localStorage.setItem(
            FLAPPY_BEST_KEY,
            flappyScore
        );
    }

    const reward =
        Math.max(
            0,
            flappyScore * 10
        );

    if (reward > 0) {

        addCoins(
            reward,
            `🐦 Flappy Bird reward (${flappyScore})`
        );
    }

    updateFlappyScore();
}


function updateFlappyScore() {

    const score =
        document.getElementById(
            "flappyScore"
        );

    const best =
        document.getElementById(
            "flappyBest"
        );

    if (score) {
        score.textContent =
            flappyScore;
    }

    if (best) {

        best.textContent =
            localStorage.getItem(
                FLAPPY_BEST_KEY
            ) || 0;
    }
}


/* =========================================================
   SCIENCE QUIZ
   ========================================================= */

const scienceQuestions = [

    {
        question:
            "Which planet is known as the Red Planet?",

        answers: [
            "Earth",
            "Mars",
            "Venus",
            "Jupiter"
        ],

        correct: 1
    },

    {
        question:
            "What gas do humans need to breathe?",

        answers: [
            "Oxygen",
            "Carbon dioxide",
            "Helium",
            "Hydrogen"
        ],

        correct: 0
    },

    {
        question:
            "How many legs does a spider have?",

        answers: [
            "4",
            "6",
            "8",
            "10"
        ],

        correct: 2
    },

    {
        question:
            "What is H2O commonly called?",

        answers: [
            "Salt",
            "Water",
            "Oxygen",
            "Sugar"
        ],

        correct: 1
    },

    {
        question:
            "What force keeps us on Earth?",

        answers: [
            "Gravity",
            "Light",
            "Sound",
            "Magnetism"
        ],

        correct: 0
    }
];

let quizIndex = 0;
let quizScore = 0;


function initializeQuiz() {

    quizIndex = 0;
    quizScore = 0;

    renderQuizQuestion();
}


function renderQuizQuestion() {

    const question =
        document.getElementById(
            "quizQuestion"
        );

    const answers =
        document.getElementById(
            "quizAnswers"
        );

    if (
        !question ||
        !answers
    ) {
        return;
    }

    const current =
        scienceQuestions[
            quizIndex
        ];

    question.textContent =
        current.question;

    answers.innerHTML = "";

    current.answers.forEach(
        (answer, index) => {

            const button =
                document.createElement(
                    "button"
                );

            button.textContent =
                answer;

            button.addEventListener(
                "click",
                () =>
                    answerQuiz(index)
            );

            answers.appendChild(
                button
            );
        }
    );
}


function answerQuiz(index) {

    const current =
        scienceQuestions[
            quizIndex
        ];

    if (
        index === current.correct
    ) {

        quizScore++;

        addCoins(
            10,
            "🧠 Science Quiz reward"
        );
    }

    quizIndex++;

    if (
        quizIndex >=
        scienceQuestions.length
    ) {

        alert(
            `Quiz complete! Score: ${quizScore}/${scienceQuestions.length}`
        );

        quizIndex = 0;
        quizScore = 0;
    }

    renderQuizQuestion();
}


/* =========================================================
   WATCH TOGETHER
   ========================================================= */

function startWatchTogether(videoID) {

    if (!videoID) return;

    localStorage.setItem(
        WATCH_VIDEO_KEY,
        videoID
    );

    window.location.href =
        "chat.html";
}


/* =========================================================
   =========================================================
   FIREBASE LIVE CHAT
   =========================================================
   ========================================================= */


/*
   Database structure:

   rooms
      science-main
         messages
            messageID
               uid
               name
               emoji
               text
               timestamp

         players
            UID
               uid
               name
               emoji
               online
               lastSeen
*/


const SCIENCE_ROOM_ID =
    "science-main";


function getChatRef() {

    return ref(
        db,
        `rooms/${SCIENCE_ROOM_ID}/messages`
    );
}


function getPlayersRef() {

    return ref(
        db,
        `rooms/${SCIENCE_ROOM_ID}/players`
    );
}


/* =========================================================
   FIREBASE CONNECTION STATUS
   ========================================================= */

function initializeFirebaseConnection() {

    const connectedRef =
        ref(
            db,
            ".info/connected"
        );

    onValue(
        connectedRef,
        snapshot => {

            const connected =
                snapshot.val() === true;

            const status =
                document.getElementById(
                    "firebaseStatus"
                );

            if (status) {

                if (connected) {

                    status.textContent =
                        "🟢 Live";

                    status.classList.add(
                        "online"
                    );

                    status.classList.remove(
                        "offline"
                    );

                } else {

                    status.textContent =
                        "🔴 Offline";

                    status.classList.add(
                        "offline"
                    );

                    status.classList.remove(
                        "online"
                    );
                }
            }

            console.log(
                connected
                    ? "Firebase connected"
                    : "Firebase disconnected"
            );
        }
    );
}


/* =========================================================
   SEND LIVE CHAT MESSAGE
   ========================================================= */

async function sendChatMessage() {

    getCurrentAccount();

    if (!currentAccount) {

        alert(
            "Please log in first."
        );

        return;
    }

    const input =
        document.getElementById(
            "chatInput"
        );

    if (!input) return;

    const text =
        input.value.trim();

    if (!text) return;

    if (text.length > 300) {

        alert(
            "Message is too long."
        );

        return;
    }

    try {

        const messagesRef =
            getChatRef();

        const newMessageRef =
            push(messagesRef);

        await set(
            newMessageRef,
            {

                uid:
                    currentAccount.uid,

                name:
                    currentAccount.name,

                emoji:
                    currentAccount.emoji,

                text:
                    text,

                timestamp:
                    serverTimestamp()
            }
        );

        input.value = "";

        input.focus();

    } catch (error) {

        console.error(
            "Firebase chat error:",
            error
        );

        alert(
            "Could not send message. Check your Firebase Database Rules."
        );
    }
}


/* =========================================================
   ENTER KEY CHAT
   ========================================================= */

function initializeChatInput() {

    const input =
        document.getElementById(
            "chatInput"
        );

    const button =
        document.getElementById(
            "sendChatButton"
        );

    if (button) {

        button.addEventListener(
            "click",
            sendChatMessage
        );
    }

    if (input) {

        input.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();

                    sendChatMessage();
                }
            }
        );
    }
}


/* =========================================================
   RECEIVE LIVE CHAT MESSAGES
   ========================================================= */

function initializeLiveChat() {

    const messagesRef =
        getChatRef();

    onValue(
        messagesRef,
        snapshot => {

            const data =
                snapshot.val();

            const messages = [];

            if (data) {

                Object.keys(data)
                    .forEach(key => {

                        messages.push({

                            id: key,

                            ...data[key]
                        });
                    });
            }

            messages.sort(
                (a, b) =>
                    (a.timestamp || 0) -
                    (b.timestamp || 0)
            );

            renderChatMessages(
                messages
            );
        },
        error => {

            console.error(
                "Could not read Firebase chat:",
                error
            );
        }
    );
}


/* =========================================================
   RENDER LIVE CHAT
   ========================================================= */

function renderChatMessages(messages) {

    const container =
        document.getElementById(
            "chatMessages"
        );

    if (!container) return;

    container.innerHTML = "";

    messages.forEach(message => {

        const item =
            document.createElement(
                "div"
            );

        item.className =
            "chat-message";

        const date =
            message.timestamp
                ? new Date(
                    message.timestamp
                ).toLocaleTimeString(
                    [],
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                )
                : "";

        item.innerHTML = `

            <div class="chat-avatar">
                ${escapeHTML(
                    message.emoji || "🙂"
                )}
            </div>

            <div class="chat-content">

                <strong>
                    ${escapeHTML(
                        message.name || "Player"
                    )}
                </strong>

                <span class="chat-time">
                    ${escapeHTML(date)}
                </span>

                <div class="chat-text">
                    ${escapeHTML(
                        message.text || ""
                    )}
                </div>

            </div>
        `;

        container.appendChild(item);
    });

    container.scrollTop =
        container.scrollHeight;
}


/* =========================================================
   LIVE PLAYER PRESENCE
   ========================================================= */

async function registerPlayerOnline() {

    getCurrentAccount();

    if (!currentAccount) return;

    const playerRef =
        ref(
            db,
            `rooms/${SCIENCE_ROOM_ID}/players/${currentAccount.uid}`
        );

    try {

        await set(
            playerRef,
            {

                uid:
                    currentAccount.uid,

                name:
                    currentAccount.name,

                emoji:
                    currentAccount.emoji,

                online:
                    true,

                lastSeen:
                    serverTimestamp()
            }
        );

        await onDisconnect(
            playerRef
        ).update({

            online: false,

            lastSeen:
                serverTimestamp()
        });

    } catch (error) {

        console.error(
            "Presence error:",
            error
        );
    }
}


/* =========================================================
   REMOVE PLAYER
   ========================================================= */

async function removePlayerOnline(
    uid = null
) {

    if (!uid) {

        getCurrentAccount();

        if (!currentAccount) return;

        uid =
            currentAccount.uid;
    }

    const playerRef =
        ref(
            db,
            `rooms/${SCIENCE_ROOM_ID}/players/${uid}`
        );

    try {

        await set(
            playerRef,
            null
        );

    } catch (error) {

        console.error(
            "Could not remove player:",
            error
        );
    }
}


/* =========================================================
   LIVE PLAYER LIST
   ========================================================= */

function initializeLivePlayerList() {

    const playersRef =
        getPlayersRef();

    onValue(
        playersRef,
        snapshot => {

            const data =
                snapshot.val();

            const players = [];

            if (data) {

                Object.keys(data)
                    .forEach(uid => {

                        players.push(
                            data[uid]
                        );
                    });
            }

            renderPlayerList(
                players
            );
        },
        error => {

            console.error(
                "Player list error:",
                error
            );
        }
    );
}


/* =========================================================
   RENDER PLAYER LIST
   ========================================================= */

function renderPlayerList(players) {

    const container =
        document.getElementById(
            "playerList"
        );

    if (!container) return;

    container.innerHTML = "";

    const onlinePlayers =
        players.filter(
            player =>
                player.online === true
        );

    onlinePlayers.forEach(player => {

        const item =
            document.createElement(
                "div"
            );

        item.className =
            "player-item";

        item.innerHTML = `

            <span class="player-avatar">
                ${escapeHTML(
                    player.emoji || "🙂"
                )}
            </span>

            <span class="player-name">
                ${escapeHTML(
                    player.name || "Player"
                )}
            </span>

            <span class="player-online">
                🟢
            </span>
        `;

        container.appendChild(item);
    });

    const count =
        document.getElementById(
            "onlinePlayerCount"
        );

    if (count) {

        count.textContent =
            onlinePlayers.length;
    }
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   COMING SOON
   ========================================================= */

function initializeComingSoon() {

    const page =
        new URLSearchParams(
            window.location.search
        ).get("type");

    const title =
        document.getElementById(
            "comingSoonTitle"
        );

    if (!title) return;

    if (page === "project") {

        title.textContent =
            "PROJECTS COMING SOON";

    } else if (page === "events") {

        title.textContent =
            "EVENTS COMING SOON";

    } else if (page === "courses") {

        title.textContent =
            "COURSES COMING SOON";
    }
}


/* =========================================================
   ACCOUNT BUTTONS
   ========================================================= */

function initializeAccountButtons() {

    const accountButton =
        document.getElementById(
            "accountButton"
        );

    const closeButton =
        document.getElementById(
            "closeAccountModal"
        );

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );

    const deleteButton =
        document.getElementById(
            "deleteAccountButton"
        );

    if (accountButton) {

        accountButton.addEventListener(
            "click",
            openAccountModal
        );
    }

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeAccountModal
        );
    }

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            logoutCurrentAccount
        );
    }

    if (deleteButton) {

        deleteButton.addEventListener(
            "click",
            deleteCurrentAccount
        );
    }
}


/* =========================================================
   PAGE INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadAccounts();

        const page =
            document.body.dataset.page;

        if (page === "login") {

            initializeLoginPage();

            return;
        }

        if (!requireLogin()) {
            return;
        }

        updateHeader();

        initializeAccountButtons();

        updateBonusButton();

        renderTransactions();

        updatePassPage();

        initializeComingSoon();

        initializeFirebaseConnection();

        /*
           Register the current player with Firebase.
        */
        registerPlayerOnline();

        /*
           Start live chat listeners only when
           the chat page is open.
        */
        if (page === "chat") {

            initializeChatInput();

            initializeLiveChat();

            initializeLivePlayerList();
        }

        /*
           Games
        */
        if (page === "games") {

            initializeQuiz();

            updateFlappyScore();

            const flappyCanvas =
                document.getElementById(
                    "flappyCanvas"
                );

            if (flappyCanvas) {

                flappyCanvas.addEventListener(
                    "click",
                    flapBird
                );

                flappyCanvas.addEventListener(
                    "touchstart",
                    event => {

                        event.preventDefault();

                        flapBird();
                    },
                    {
                        passive: false
                    }
                );
            }

            document.addEventListener(
                "keydown",
                event => {

                    if (
                        event.code ===
                        "Space"
                    ) {

                        const canvas =
                            document.getElementById(
                                "flappyCanvas"
                            );

                        if (canvas) {

                            event.preventDefault();

                            flapBird();
                        }
                    }
                }
            );
        }

        /*
           Daily bonus button
        */
        const bonusButton =
            document.getElementById(
                "dailyBonusButton"
            );

        if (bonusButton) {

            bonusButton.addEventListener(
                "click",
                claimDailyBonus
            );
        }
    }
);


/* =========================================================
   GLOBAL FUNCTIONS
   =========================================================
   These allow existing HTML onclick="" buttons to
   continue working.
   ========================================================= */

window.enterScienceWorld =
    enterScienceWorld;

window.openAccountModal =
    openAccountModal;

window.closeAccountModal =
    closeAccountModal;

window.logoutCurrentAccount =
    logoutCurrentAccount;

window.deleteCurrentAccount =
    deleteCurrentAccount;

window.claimDailyBonus =
    claimDailyBonus;

window.buyPass =
    buyPass;

window.startFlappyBird =
    startFlappyBird;

window.flapBird =
    flapBird;

window.answerQuiz =
    answerQuiz;

window.startWatchTogether =
    startWatchTogether;

window.sendChatMessage =
    sendChatMessage;

window.updateHeader =
    updateHeader;

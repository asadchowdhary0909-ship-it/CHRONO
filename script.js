"use strict";

/* =========================================================
   KIDS SCIENCE
   COMPLETE SCIENCE WEBSITE JAVASCRIPT
========================================================= */


/* =========================================================
   STORAGE
========================================================= */

const ACCOUNTS_KEY = "kidsScienceAccounts";
const CURRENT_KEY = "kidsScienceCurrentUID";
const CHAT_KEY = "kidsScienceChat";


/* =========================================================
   GLOBAL
========================================================= */

let accounts = [];
let currentAccount = null;

let flappyRunning = false;
let flappyAnimation = null;

let bird = null;
let pipes = [];

let flappyScore = 0;
let flappyBest = 0;

let quizIndex = 0;
let quizScore = 0;


/* =========================================================
   BASIC STORAGE
========================================================= */

function loadAccounts() {

    try {

        accounts = JSON.parse(
            localStorage.getItem(ACCOUNTS_KEY) || "[]"
        );

        if (!Array.isArray(accounts)) {
            accounts = [];
        }

    } catch (error) {

        console.error(error);

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

    const uid =
        localStorage.getItem(CURRENT_KEY);

    if (!uid) {
        return null;
    }

    return accounts.find(
        account => account.uid === uid
    ) || null;

}


function saveCurrentAccount() {

    if (!currentAccount) {
        return;
    }

    const index = accounts.findIndex(
        account => account.uid === currentAccount.uid
    );

    if (index !== -1) {

        accounts[index] = currentAccount;

        saveAccounts();

    }

}


/* =========================================================
   UID
========================================================= */

function generateUID() {

    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let uid = "KID-";

    for (let i = 0; i < 6; i++) {

        uid += chars[
            Math.floor(Math.random() * chars.length)
        ];

    }

    return uid;
}


/* =========================================================
   LOGIN
========================================================= */

function enterScienceWorld() {

    const input =
        document.getElementById("nameInput");

    if (!input) {
        return;
    }

    const name =
        input.value.trim();

    if (!name) {

        alert("Please enter your nickname.");

        input.focus();

        return;

    }


    loadAccounts();


    const existing =
        accounts.find(
            account =>
                account.name.toLowerCase() ===
                name.toLowerCase()
        );


    /* EXISTING ACCOUNT */

    if (existing) {

        currentAccount = existing;

        localStorage.setItem(
            CURRENT_KEY,
            existing.uid
        );

        saveAccounts();

        window.location.href = "home.html";

        return;

    }


    /* NEW ACCOUNT */

    const newAccount = {

        uid: generateUID(),

        name: name,

        emoji: randomEmoji(),

        balance: 500,

        pass: "FREE",

        passExpires: null,

        transactions: [

            {
                text: "🎁 Welcome Bonus",
                amount: 500,
                date: new Date().toLocaleString()
            }

        ],

        lastBonusDate: null,

        lastDailyPassReward: null

    };


    accounts.push(newAccount);

    saveAccounts();


    currentAccount = newAccount;

    localStorage.setItem(
        CURRENT_KEY,
        newAccount.uid
    );


    window.location.href = "home.html";
}


function randomEmoji() {

    const emojis = [
        "🙂",
        "😎",
        "🤓",
        "🧑‍🔬",
        "👨‍🚀",
        "🦊",
        "🐼",
        "🐯",
        "🐸",
        "🦁"
    ];

    return emojis[
        Math.floor(Math.random() * emojis.length)
    ];

}


/* =========================================================
   ENTER KEY LOGIN
========================================================= */

function initializeLoginPage() {

    const input =
        document.getElementById("nameInput");

    if (!input) {
        return;
    }

    input.addEventListener(
        "keydown",
        function(event) {

            if (event.key === "Enter") {

                event.preventDefault();

                enterScienceWorld();

            }

        }
    );

}


/* =========================================================
   LOGIN PROTECTION
========================================================= */

function requireLogin() {

    loadAccounts();

    currentAccount =
        getCurrentAccount();


    if (!currentAccount) {

        window.location.href = "index.html";

        return false;

    }


    checkPassExpiration();

    return true;
}


/* =========================================================
   PASS EXPIRATION
========================================================= */

function checkPassExpiration() {

    if (!currentAccount) {
        return;
    }

    if (
        currentAccount.pass !== "FREE" &&
        currentAccount.passExpires
    ) {

        const expiration =
            new Date(currentAccount.passExpires);

        if (Date.now() >= expiration.getTime()) {

            const oldPass =
                currentAccount.pass;

            currentAccount.pass = "FREE";

            currentAccount.passExpires = null;

            currentAccount.lastDailyPassReward = null;

            currentAccount.transactions =
                currentAccount.transactions || [];

            currentAccount.transactions.unshift({

                text:
                    "⏰ " +
                    oldPass +
                    " Pass expired",

                amount: 0,

                date: new Date().toLocaleString()

            });

            saveCurrentAccount();

            alert(
                oldPass +
                " Pass has expired. You are now on FREE."
            );

        }

    }

}


/* =========================================================
   PASS DAILY COINS
========================================================= */

function processDailyPassReward() {

    if (!currentAccount) {
        return;
    }

    checkPassExpiration();

    if (currentAccount.pass === "FREE") {
        return;
    }


    const today =
        new Date().toISOString().slice(0, 10);


    if (
        currentAccount.lastDailyPassReward === today
    ) {
        return;
    }


    let amount = 0;

    if (currentAccount.pass === "PRO") {
        amount = 500;
    }

    if (currentAccount.pass === "ELITE") {
        amount = 750;
    }

    if (currentAccount.pass === "PREMIUM") {
        amount = 400;
    }


    if (amount > 0) {

        currentAccount.balance += amount;

        currentAccount.lastDailyPassReward =
            today;

        currentAccount.transactions.unshift({

            text:
                "🎟️ " +
                currentAccount.pass +
                " Daily Coins",

            amount: amount,

            date: new Date().toLocaleString()

        });

        saveCurrentAccount();

    }

}


/* =========================================================
   HEADER
========================================================= */

function updateHeader() {

    if (!currentAccount) {
        return;
    }


    const avatar =
        document.getElementById("headerAvatar");

    const name =
        document.getElementById("headerName");


    if (avatar) {
        avatar.textContent =
            currentAccount.emoji;
    }


    if (name) {
        name.textContent =
            currentAccount.name;
    }


    applyPassTheme();

}


/* =========================================================
   PASS THEME
========================================================= */

function applyPassTheme() {

    if (!currentAccount) {
        return;
    }

    document.body.classList.remove(
        "pass-pro",
        "pass-elite",
        "pass-premium"
    );


    if (currentAccount.pass === "PRO") {

        document.body.classList.add(
            "pass-pro"
        );

    }


    if (currentAccount.pass === "ELITE") {

        document.body.classList.add(
            "pass-elite"
        );

    }


    if (currentAccount.pass === "PREMIUM") {

        document.body.classList.add(
            "pass-premium"
        );

    }

}


/* =========================================================
   ACCOUNT MODAL
========================================================= */

function openAccountModal() {

    if (!currentAccount) {
        return;
    }


    const modal =
        document.getElementById("accountModal");


    const avatar =
        document.getElementById("modalAvatar");

    const name =
        document.getElementById("modalName");

    const uid =
        document.getElementById("modalUID");


    if (avatar) {
        avatar.textContent =
            currentAccount.emoji;
    }

    if (name) {
        name.textContent =
            currentAccount.name;
    }

    if (uid) {
        uid.textContent =
            currentAccount.uid;
    }


    if (modal) {
        modal.classList.add("show");
    }

}


function closeAccountModal() {

    const modal =
        document.getElementById("accountModal");

    if (modal) {
        modal.classList.remove("show");
    }

}


/* =========================================================
   LOGOUT
========================================================= */

function logoutCurrentAccount() {

    localStorage.removeItem(
        CURRENT_KEY
    );

    currentAccount = null;

    window.location.href =
        "index.html";

}


/* =========================================================
   DELETE ACCOUNT
========================================================= */

function deleteCurrentAccount() {

    if (!currentAccount) {
        return;
    }


    const answer =
        confirm(
            "Delete your account permanently?"
        );


    if (!answer) {
        return;
    }


    accounts =
        accounts.filter(
            account =>
                account.uid !== currentAccount.uid
        );


    saveAccounts();


    localStorage.removeItem(
        CURRENT_KEY
    );


    currentAccount = null;


    window.location.href =
        "index.html";

}


/* =========================================================
   BALANCE
========================================================= */

function updateBalanceDisplays() {

    if (!currentAccount) {
        return;
    }


    const homeBalance =
        document.getElementById("homeBalance");

    const walletBalance =
        document.getElementById("walletBalance");


    if (homeBalance) {

        homeBalance.textContent =
            currentAccount.balance.toLocaleString();

    }


    if (walletBalance) {

        walletBalance.textContent =
            currentAccount.balance.toLocaleString();

    }

}


/* =========================================================
   CLAIM DAILY BONUS
========================================================= */

function claimDailyBonus() {

    if (!currentAccount) {
        return;
    }


    const today =
        new Date().toISOString().slice(0, 10);


    if (
        currentAccount.lastBonusDate === today
    ) {

        alert(
            "You already claimed today's bonus."
        );

        updateBonusButton();

        return;

    }


    const amount = 100;


    currentAccount.balance += amount;

    currentAccount.lastBonusDate =
        today;


    currentAccount.transactions.unshift({

        text: "🎁 Daily Bonus",

        amount: amount,

        date: new Date().toLocaleString()

    });


    saveCurrentAccount();


    updateBalanceDisplays();

    renderTransactions();

    updateBonusButton();


    alert(
        "🎉 You claimed 100 PlayCoins!"
    );

}


/* =========================================================
   BONUS UI
========================================================= */

function updateBonusButton() {

    const button =
        document.getElementById(
            "claimBonusButton"
        );

    const status =
        document.getElementById(
            "bonusStatus"
        );


    if (!button || !status) {
        return;
    }


    const today =
        new Date().toISOString().slice(0, 10);


    if (
        currentAccount &&
        currentAccount.lastBonusDate === today
    ) {

        button.disabled = true;

        button.textContent =
            "BONUS CLAIMED ✓";

        status.textContent =
            "Come back tomorrow for another bonus.";

    } else {

        button.disabled = false;

        button.textContent =
            "CLAIM 100 PLAYCOINS";

        status.textContent =
            "Your daily bonus is ready!";

    }

}


/* =========================================================
   TRANSACTIONS
========================================================= */

function renderTransactions() {

    const container =
        document.getElementById(
            "transactionsList"
        );


    if (!container || !currentAccount) {
        return;
    }


    const transactions =
        currentAccount.transactions || [];


    container.innerHTML = "";


    if (!transactions.length) {

        container.innerHTML =
            "<p>No transactions yet.</p>";

        return;

    }


    transactions
        .slice(0, 50)
        .forEach(transaction => {

            const div =
                document.createElement("div");


            div.className =
                "transaction " +
                (
                    transaction.amount >= 0
                        ? "plus"
                        : "minus"
                );


            const amount =
                transaction.amount >= 0
                    ? "+" + transaction.amount
                    : transaction.amount;


            div.innerHTML = `

                <span>
                    ${escapeHTML(transaction.text)}
                </span>

                <strong>
                    ${amount}
                </strong>

            `;


            container.appendChild(div);

        });

}


/* =========================================================
   SPEND COINS
========================================================= */

function spendCoins(amount, description) {

    if (!currentAccount) {
        return false;
    }


    if (
        currentAccount.balance < amount
    ) {

        alert(
            "Not enough PlayCoins."
        );

        return false;

    }


    currentAccount.balance -= amount;


    currentAccount.transactions.unshift({

        text: description,

        amount: -amount,

        date: new Date().toLocaleString()

    });


    saveCurrentAccount();

    updateBalanceDisplays();

    renderTransactions();


    return true;
}


/* =========================================================
   ADD COINS
========================================================= */

function addCoins(amount, description) {

    if (!currentAccount) {
        return;
    }


    currentAccount.balance += amount;


    currentAccount.transactions.unshift({

        text: description,

        amount: amount,

        date: new Date().toLocaleString()

    });


    saveCurrentAccount();

    updateBalanceDisplays();

    renderTransactions();

}


/* =========================================================
   PASSES
========================================================= */

function buyPass(passName, price) {

    if (!currentAccount) {
        return;
    }


    checkPassExpiration();


    if (
        currentAccount.pass === passName &&
        currentAccount.passExpires
    ) {

        alert(
            "You already have this pass."
        );

        return;

    }


    if (
        !spendCoins(
            price,
            "🎟️ Bought " + passName + " Pass"
        )
    ) {

        return;

    }


    currentAccount.pass =
        passName;


    const expiration =
        new Date();

    expiration.setDate(
        expiration.getDate() + 10
    );


    currentAccount.passExpires =
        expiration.toISOString();


    currentAccount.lastDailyPassReward =
        null;


    saveCurrentAccount();


    updatePassPage();

    updateHeader();


    alert(
        "🎉 " +
        passName +
        " Pass activated for 10 days!"
    );

}


/* =========================================================
   PASS PAGE
========================================================= */

function updatePassPage() {

    const element =
        document.getElementById(
            "currentPass"
        );


    if (!element || !currentAccount) {
        return;
    }


    checkPassExpiration();


    if (
        currentAccount.pass === "FREE"
    ) {

        element.textContent =
            "CURRENT PASS: FREE";

        return;

    }


    const expiry =
        new Date(
            currentAccount.passExpires
        );


    const remaining =
        Math.max(
            0,
            Math.ceil(
                (
                    expiry.getTime() -
                    Date.now()
                ) /
                (1000 * 60 * 60 * 24)
            )
        );


    element.textContent =
        "CURRENT PASS: " +
        currentAccount.pass +
        " • " +
        remaining +
        " DAYS LEFT";

}


/* =========================================================
   FLAPPY BIRD
========================================================= */

function getFlappyCanvas() {

    return document.getElementById(
        "flappyCanvas"
    );

}


function startFlappyBird() {

    const canvas =
        getFlappyCanvas();

    if (!canvas) {
        return;
    }


    if (flappyAnimation) {

        cancelAnimationFrame(
            flappyAnimation
        );

    }


    flappyRunning = true;

    flappyScore = 0;

    bird = {

        x: 80,

        y: 220,

        velocity: 0,

        size: 18

    };


    pipes = [];


    document.getElementById(
        "flappyScore"
    ).textContent = "0";


    const message =
        document.getElementById(
            "flappyMessage"
        );


    if (message) {

        message.classList.add(
            "hidden"
        );

    }


    addFlappyPipe(canvas);


    flappyLoop();

}


function flapBird() {

    if (!flappyRunning) {

        startFlappyBird();

        return;

    }


    bird.velocity = -7;

}


function addFlappyPipe(canvas) {

    const gap = 140;

    const minTop = 60;

    const maxTop =
        canvas.height -
        gap -
        60;


    const top =
        Math.floor(
            Math.random() *
            (maxTop - minTop + 1)
        ) + minTop;


    pipes.push({

        x: canvas.width,

        width: 65,

        top: top,

        gap: gap,

        passed: false

    });

}


function flappyLoop() {

    const canvas =
        getFlappyCanvas();


    if (!canvas || !flappyRunning) {
        return;
    }


    const ctx =
        canvas.getContext("2d");


    /* PHYSICS */

    bird.velocity += 0.45;

    bird.y += bird.velocity;


    /* PIPE MOVEMENT */

    pipes.forEach(pipe => {

        pipe.x -= 3;

    });


    if (
        pipes.length === 0 ||
        pipes[pipes.length - 1].x <
        canvas.width - 250
    ) {

        addFlappyPipe(canvas);

    }


    /* REMOVE OLD PIPES */

    pipes =
        pipes.filter(
            pipe =>
                pipe.x + pipe.width > 0
        );


    /* SCORE */

    pipes.forEach(pipe => {

        if (
            !pipe.passed &&
            pipe.x + pipe.width < bird.x
        ) {

            pipe.passed = true;

            flappyScore++;


            document.getElementById(
                "flappyScore"
            ).textContent =
                flappyScore;

        }

    });


    /* COLLISION */

    if (flappyCollision(canvas)) {

        endFlappyBird();

        return;

    }


    /* DRAW */

    drawFlappyBird(ctx, canvas);


    flappyAnimation =
        requestAnimationFrame(
            flappyLoop
        );

}


function flappyCollision(canvas) {

    if (
        bird.y - bird.size < 0 ||
        bird.y + bird.size > canvas.height
    ) {

        return true;

    }


    for (const pipe of pipes) {

        const horizontal =
            bird.x + bird.size >
            pipe.x &&
            bird.x - bird.size <
            pipe.x + pipe.width;


        const hitsTop =
            bird.y - bird.size <
            pipe.top;


        const hitsBottom =
            bird.y + bird.size >
            pipe.top + pipe.gap;


        if (
            horizontal &&
            (hitsTop || hitsBottom)
        ) {

            return true;

        }

    }


    return false;

}


function drawFlappyBird(ctx, canvas) {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /* SKY */

    ctx.fillStyle =
        "#8bdcff";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /* CLOUDS */

    ctx.fillStyle =
        "rgba(255,255,255,.7)";


    for (let i = 0; i < 5; i++) {

        const x =
            ((i * 150) -
            ((Date.now() / 25) % 150));


        const y =
            60 + (i % 3) * 80;


        ctx.beginPath();

        ctx.arc(
            x,
            y,
            22,
            0,
            Math.PI * 2
        );

        ctx.arc(
            x + 25,
            y + 5,
            18,
            0,
            Math.PI * 2
        );

        ctx.arc(
            x - 25,
            y + 5,
            18,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }


    /* PIPES */

    pipes.forEach(pipe => {

        ctx.fillStyle =
            "#37a852";


        ctx.fillRect(
            pipe.x,
            0,
            pipe.width,
            pipe.top
        );


        ctx.fillRect(
            pipe.x,
            pipe.top + pipe.gap,
            pipe.width,
            canvas.height -
            pipe.top -
            pipe.gap
        );


        ctx.fillStyle =
            "#25863e";


        ctx.fillRect(
            pipe.x - 5,
            pipe.top - 18,
            pipe.width + 10,
            18
        );


        ctx.fillRect(
            pipe.x - 5,
            pipe.top + pipe.gap,
            pipe.width + 10,
            18
        );

    });


    /* BIRD */

    ctx.fillStyle =
        "#ffd92f";


    ctx.beginPath();

    ctx.arc(
        bird.x,
        bird.y,
        bird.size,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* EYE */

    ctx.fillStyle =
        "#fff";


    ctx.beginPath();

    ctx.arc(
        bird.x + 7,
        bird.y - 7,
        6,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle =
        "#111";


    ctx.beginPath();

    ctx.arc(
        bird.x + 9,
        bird.y - 7,
        3,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* BEAK */

    ctx.fillStyle =
        "#ff8c00";


    ctx.beginPath();

    ctx.moveTo(
        bird.x + bird.size,
        bird.y
    );

    ctx.lineTo(
        bird.x + bird.size + 18,
        bird.y + 7
    );

    ctx.lineTo(
        bird.x + bird.size,
        bird.y + 12
    );

    ctx.fill();

}


function endFlappyBird() {

    flappyRunning = false;


    if (flappyAnimation) {

        cancelAnimationFrame(
            flappyAnimation
        );

        flappyAnimation = null;

    }


    let reward = flappyScore * 10;


    /* PASS MULTIPLIERS */

    if (
        currentAccount &&
        currentAccount.pass === "PRO"
    ) {

        reward *= 2;

    }


    if (
        currentAccount &&
        currentAccount.pass === "ELITE"
    ) {

        reward *= 20;

    }


    if (
        currentAccount &&
        currentAccount.pass === "PREMIUM"
    ) {

        reward *= 20;

    }


    if (reward > 0) {

        addCoins(
            reward,
            "🐦 Flappy Bird Reward"
        );

    }


    if (flappyScore > flappyBest) {

        flappyBest =
            flappyScore;

        localStorage.setItem(
            "kidsScienceFlappyBest",
            flappyBest
        );

        const best =
            document.getElementById(
                "flappyBest"
            );

        if (best) {
            best.textContent =
                flappyBest;
        }

    }


    const message =
        document.getElementById(
            "flappyMessage"
        );


    if (message) {

        message.classList.remove(
            "hidden"
        );


        message.innerHTML = `

            <h3>💥 GAME OVER</h3>

            <p>
                Score:
                <strong>${flappyScore}</strong>
            </p>

            <p>
                Reward:
                <strong>${reward} PlayCoins</strong>
            </p>

            <button
                class="main-button"
                onclick="startFlappyBird()">
                PLAY AGAIN
            </button>

        `;

    }

}


/* =========================================================
   QUIZ
========================================================= */

const quizQuestions = [

    {
        question:
            "Which planet is known as the Red Planet?",

        answers: [
            "Mars",
            "Earth",
            "Venus",
            "Jupiter"
        ],

        correct: "Mars"

    },


    {
        question:
            "What gas do humans need to breathe?",

        answers: [
            "Oxygen",
            "Helium",
            "Carbon Dioxide",
            "Hydrogen"
        ],

        correct: "Oxygen"

    },


    {
        question:
            "What is H2O commonly called?",

        answers: [
            "Water",
            "Salt",
            "Oxygen",
            "Sugar"
        ],

        correct: "Water"

    },


    {
        question:
            "Which star is closest to Earth?",

        answers: [
            "The Sun",
            "Sirius",
            "Polaris",
            "Vega"
        ],

        correct: "The Sun"

    },


    {
        question:
            "How many planets are in our Solar System?",

        answers: [
            "8",
            "7",
            "9",
            "10"
        ],

        correct: "8"

    }

];


function initializeQuiz() {

    quizIndex = 0;

    quizScore = 0;

    renderQuizQuestion();

}


function renderQuizQuestion() {

    const questionElement =
        document.getElementById(
            "quizQuestion"
        );

    const answersElement =
        document.getElementById(
            "quizAnswers"
        );

    const scoreElement =
        document.getElementById(
            "quizScore"
        );


    if (
        !questionElement ||
        !answersElement
    ) {

        return;

    }


    if (
        quizIndex >=
        quizQuestions.length
    ) {

        questionElement.innerHTML =
            "🎉 QUIZ COMPLETE!";

        answersElement.innerHTML = `

            <button
                class="main-button"
                onclick="initializeQuiz()">
                PLAY AGAIN
            </button>

        `;

        return;

    }


    const question =
        quizQuestions[quizIndex];


    questionElement.textContent =
        question.question;


    answersElement.innerHTML = "";


    question.answers.forEach(
        answer => {

            const button =
                document.createElement("button");


            button.className =
                "quiz-answer";


            button.textContent =
                answer;


            button.onclick =
                function() {

                    answerQuiz(answer);

                };


            answersElement.appendChild(
                button
            );

        }
    );


    if (scoreElement) {

        scoreElement.textContent =
            quizScore;

    }

}


function answerQuiz(answer) {

    const question =
        quizQuestions[quizIndex];


    if (
        answer ===
        question.correct
    ) {

        quizScore++;


        let reward = 25;


        if (
            currentAccount &&
            currentAccount.pass === "PRO"
        ) {

            reward *= 2;

        }


        if (
            currentAccount &&
            currentAccount.pass === "ELITE"
        ) {

            reward *= 3;

        }


        if (
            currentAccount &&
            currentAccount.pass === "PREMIUM"
        ) {

            reward *= 5;

        }


        addCoins(
            reward,
            "🧠 Science Quiz Reward"
        );


        alert(
            "✅ Correct! +" +
            reward +
            " PlayCoins"
        );


    } else {

        alert(
            "❌ Not quite! Try the next question."
        );

    }


    quizIndex++;

    renderQuizQuestion();

}


/* =========================================================
   WATCH TOGETHER
========================================================= */

function startWatchTogether(videoID) {

    localStorage.setItem(
        "kidsScienceWatchVideo",
        videoID
    );


    window.location.href =
        "chat.html";

}


/* =========================================================
   CHAT
========================================================= */

function getChatMessages() {

    try {

        return JSON.parse(
            localStorage.getItem(CHAT_KEY) ||
            "[]"
        );

    } catch {

        return [];

    }

}


function saveChatMessages(messages) {

    localStorage.setItem(
        CHAT_KEY,
        JSON.stringify(messages)
    );

}


function sendChatMessage(event) {

    event.preventDefault();


    const input =
        document.getElementById(
            "chatInput"
        );


    if (!input || !currentAccount) {
        return;
    }


    const text =
        input.value.trim();


    if (!text) {
        return;
    }


    const messages =
        getChatMessages();


    messages.push({

        name: currentAccount.name,

        emoji: currentAccount.emoji,

        text: text,

        time:
            new Date().toLocaleTimeString()

    });


    saveChatMessages(messages);


    input.value = "";


    renderChatMessages();

}


function renderChatMessages() {

    const container =
        document.getElementById(
            "chatMessages"
        );


    if (!container) {
        return;
    }


    const messages =
        getChatMessages();


    container.innerHTML = "";


    messages
        .slice(-100)
        .forEach(message => {

            const div =
                document.createElement("div");


            div.className =
                "chat-message";


            div.innerHTML = `

                <strong>
                    ${escapeHTML(message.emoji)}
                    ${escapeHTML(message.name)}
                </strong>

                <br>

                ${escapeHTML(message.text)}

                <small>
                    ${escapeHTML(message.time)}
                </small>

            `;


            container.appendChild(div);

        });


    container.scrollTop =
        container.scrollHeight;

}


function renderPlayerList() {

    const container =
        document.getElementById(
            "playerList"
        );


    if (!container) {
        return;
    }


    loadAccounts();


    container.innerHTML = "";


    accounts.forEach(account => {

        const div =
            document.createElement("div");


        div.className =
            "player";


        div.innerHTML = `

            ${escapeHTML(account.emoji)}
            <strong>
                ${escapeHTML(account.name)}
            </strong>

        `;


        container.appendChild(div);

    });

}


/* =========================================================
   COMING SOON
========================================================= */

function initializeComingSoon() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const page =
        params.get("page");


    const title =
        document.getElementById(
            "comingTitle"
        );


    const text =
        document.getElementById(
            "comingText"
        );


    const names = {

        project: [
            "🧪 PROJECTS COMING SOON",
            "Science projects are being developed."
        ],

        events: [
            "📅 EVENTS COMING SOON",
            "Live science events are coming soon."
        ],

        courses: [
            "🎓 COURSES COMING SOON",
            "Full science courses are coming soon."
        ]

    };


    if (
        page &&
        names[page]
    ) {

        title.textContent =
            names[page][0];

        text.textContent =
            names[page][1];

    }

}


/* =========================================================
   HTML SAFETY
========================================================= */

function escapeHTML(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


/* =========================================================
   PAGE INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const page =
            document.body.dataset.page;


        if (page === "login") {

            initializeLoginPage();

            return;

        }


        if (!requireLogin()) {
            return;
        }


        processDailyPassReward();

        updateHeader();

        updateBalanceDisplays();


        if (page === "wallet") {

            updateBonusButton();

            renderTransactions();

        }


        if (page === "passes") {

            updatePassPage();

        }


        if (page === "games") {

            flappyBest =
                Number(
                    localStorage.getItem(
                        "kidsScienceFlappyBest"
                    ) || 0
                );


            const best =
                document.getElementById(
                    "flappyBest"
                );


            if (best) {
                best.textContent =
                    flappyBest;
            }


            initializeQuiz();


            const canvas =
                document.getElementById(
                    "flappyCanvas"
                );


            if (canvas) {

                canvas.addEventListener(
                    "click",
                    flapBird
                );


                canvas.addEventListener(
                    "touchstart",
                    function(event) {

                        event.preventDefault();

                        flapBird();

                    },
                    { passive: false }
                );


                document.addEventListener(
                    "keydown",
                    function(event) {

                        if (
                            event.code ===
                            "Space"
                        ) {

                            event.preventDefault();

                            flapBird();

                        }

                    }
                );

            }

        }


        if (page === "chat") {

            renderChatMessages();

            renderPlayerList();


            setInterval(
                function() {

                    renderChatMessages();

                    renderPlayerList();

                },
                1000
            );

        }


        if (page === "coming") {

            initializeComingSoon();

        }

    }
);

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "chrono-fa677.firebaseapp.com",
    databaseURL: "https://chrono-fa677-default-rtdb.firebaseio.com/",
    projectId: "chrono-fa677",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

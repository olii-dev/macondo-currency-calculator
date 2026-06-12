var goldRates = {
    1: 40,
    2: 45,
    3: 50,
    4: 60
};

var levelLabels = {
    1: "Beginner",
    2: "Intermediate",
    3: "Advanced",
    4: "Expert"
};

var softwareFruits = {
    1: { name: "Mango", emoji: "\ud83e\udd6d" },
    2: { name: "Pineapple", emoji: "\ud83c\udf4d" },
    3: { name: "Papaya", emoji: "\ud83c\udf4b" },
    4: { name: "Cocoa", emoji: "\ud83c\udf6b" }
};

var hardwareFruits = {
    1: { name: "Guava", emoji: "\ud83c\udf50" },
    2: { name: "Coconut", emoji: "\ud83e\udd65" },
    3: { name: "Watermelon", emoji: "\ud83c\udf49" },
    4: { name: "Avocado", emoji: "\ud83e\udd51" }
};

var hardwareFunding = {
    1: 100,
    2: 200,
    3: 400,
    4: 1000
};

var growthStages = [
    { min: 1, max: 2, name: "Seedling", icon: "\ud83c\udf31" },
    { min: 3, max: 5, name: "Sprout", icon: "\ud83c\udf3f" },
    { min: 6, max: 9, name: "Leafy", icon: "\ud83c\udf3c" },
    { min: 10, max: Infinity, name: "Fruiting", icon: "\ud83c\udf3e" }
];

var projectType = "software";
var level = 1;
var hours = 0;
var streakDays = 0;

function getFruit() {
    var fruits = projectType === "software" ? softwareFruits : hardwareFruits;
    return fruits[level];
}

function getGrowthStage(days) {
    for (var i = 0; i < growthStages.length; i++) {
        if (days >= growthStages[i].min && days <= growthStages[i].max) {
            return growthStages[i];
        }
    }
    return growthStages[0];
}

function calculate() {
    var goldPerHour = goldRates[level];
    var baseGold = Math.round(goldPerHour * hours);
    var bonusPercent = streakDays * 0.01;
    var bonusGold = Math.round(baseGold * bonusPercent);
    var totalGold = baseGold + bonusGold;
    var multiplier = 1 + bonusPercent;
    var fruit = getFruit();
    var stage = getGrowthStage(streakDays);

    document.getElementById("result-gold").textContent = totalGold > 0 ? totalGold + " gold" : "0 gold";
    document.getElementById("result-base").textContent = baseGold > 0 ? baseGold + " gold" : "0 gold";
    document.getElementById("result-bonus").textContent = bonusGold > 0 ? "+" + bonusGold + " gold" : "+0 gold";
    document.getElementById("result-rate").textContent = goldPerHour + " / hr";
    document.getElementById("result-multiplier").textContent = multiplier.toFixed(2) + "x";
    document.getElementById("result-fruit").textContent = fruit.emoji + " " + fruit.name;
    document.getElementById("result-stage").textContent = stage.icon + " " + stage.name;

    document.getElementById("formula-text").textContent =
        totalGold > 0
            ? baseGold + " base + " + bonusGold + " bonus (" + streakDays + " day streak, " + (bonusPercent * 100).toFixed(0) + "%) = " + totalGold + " gold"
            : "Enter hours and streak to calculate";

    updateFundingLevels();
    updateGrowthStages(streakDays);
    updateLevelInfo();
}

function updateFundingLevels() {
    var container = document.getElementById("funding-levels");
    if (!container) return;
    container.innerHTML = "";

    for (var i = 1; i <= 4; i++) {
        var fruits = projectType === "software" ? softwareFruits : hardwareFruits;
        var div = document.createElement("div");
        div.className = "funding-level" + (i === level ? " active" : "");
        div.innerHTML =
            '<div class="level-num">L' + i + "</div>" +
            '<div class="level-fruit">' + fruits[i].emoji + "</div>" +
            '<div class="level-amount">' + (projectType === "hardware" ? "$" + hardwareFunding[i] : fruits[i].name) + "</div>";
        container.appendChild(div);
    }
}

function updateGrowthStages(days) {
    var container = document.getElementById("growth-stages");
    if (!container) return;

    var stages = container.querySelectorAll(".growth-stage");
    var currentStage = getGrowthStage(days);

    for (var i = 0; i < stages.length; i++) {
        var stageName = stages[i].getAttribute("data-stage");
        if (stageName === currentStage.name && days > 0) {
            stages[i].classList.add("active");
        } else {
            stages[i].classList.remove("active");
        }
    }
}

function updateLevelInfo() {
    var info = document.getElementById("level-info");
    var fruit = getFruit();
    info.innerHTML =
        '<span class="level-fruit-icon">' + fruit.emoji + "</span>" +
        '<span>L' + level + " \u00b7 " + levelLabels[level] + " \u00b7 " + fruit.name + "</span>" +
        '<span class="level-rate" style="margin-left:auto">' + goldRates[level] + " gold/hr</span>";
}

function getTimezoneName() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "your local timezone";
}

function formatRefreshCountdown() {
    var now = new Date();
    var nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);

    var remainingMs = nextMidnight - now;
    var remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
    var remainingMinutes = Math.ceil((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

    if (remainingMinutes === 60) {
        remainingHours += 1;
        remainingMinutes = 0;
    }

    var parts = [];
    parts.push(remainingHours + " hr" + (remainingHours === 1 ? "" : "s"));
    if (remainingMinutes > 0) {
        parts.push(remainingMinutes + " min" + (remainingMinutes === 1 ? "" : "s"));
    }

    return parts.join(" ");
}

function updateStreakTiming() {
    var timezoneElement = document.getElementById("streak-timezone");
    var refreshElement = document.getElementById("streak-refresh");

    if (timezoneElement) {
        timezoneElement.textContent = getTimezoneName();
    }

    if (refreshElement) {
        refreshElement.textContent = formatRefreshCountdown();
    }
}

function setProjectType(type) {
    projectType = type;

    var btns = document.querySelectorAll(".toggle-btn");
    btns.forEach(function(btn) {
        btn.classList.toggle("active", btn.getAttribute("data-type") === type);
    });

    var fundingSection = document.getElementById("funding-section");
    if (fundingSection) {
        fundingSection.style.display = type === "hardware" ? "block" : "none";
    }

    calculate();
}

function setLevel(val) {
    level = parseInt(val);
    calculate();
}

function setHours(val) {
    hours = parseFloat(val) || 0;
    calculate();
}

function setStreak(val) {
    streakDays = parseInt(val) || 0;
    calculate();
}

document.addEventListener("DOMContentLoaded", function() {
    setProjectType("software");
    calculate();
    updateStreakTiming();
    setInterval(updateStreakTiming, 60000);
});

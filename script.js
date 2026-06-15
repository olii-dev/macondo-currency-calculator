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
    1: { name: "Mango", icon: "public/images/fruits/mango/icon.webp" },
    2: { name: "Pineapple", icon: "public/images/fruits/pineapple/icon.webp" },
    3: { name: "Papaya", icon: "public/images/fruits/papaya/icon_interior.webp" },
    4: { name: "Cocoa", icon: "public/images/fruits/cocoa/icon_interior.webp" }
};

var hardwareFruits = {
    1: { name: "Guava", icon: "public/images/fruits/guava/icon_interior.webp" },
    2: { name: "Coconut", icon: "public/images/fruits/coco/icon_interior.webp" },
    3: { name: "Watermelon", icon: "public/images/fruits/watermelon/icon_interior.webp" },
    4: { name: "Avocado", icon: "public/images/fruits/avocado/icon_interior.webp" }
};

var hardwareFunding = {
    1: 100,
    2: 200,
    3: 400,
    4: 1000
};

var growthStages = [
    { min: 1, max: 2, name: "Seedling", etapa: 1 },
    { min: 3, max: 5, name: "Sprout", etapa: 2 },
    { min: 6, max: 9, name: "Leafy", etapa: 3 },
    { min: 10, max: Infinity, name: "Fruiting", etapa: 4 }
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

function fruitImg(path, cls, alt) {
    return '<img src="' + path + '" class="' + (cls || "result-fruit-icon") + '" alt="' + (alt || "") + '">';
}

function getStageIcon(fruitPath, etapa) {
    var basePath = fruitPath.replace(/\/(icon|icon_interior)\.webp$/, "/etapa_" + etapa + ".webp");
    return basePath;
}

function calculate() {
    var goldPerHour = goldRates[level];
    var bonusPercent = streakDays * 0.01;
    var multiplier = 1 + bonusPercent;
    var baseGold = Math.round(goldPerHour * hours);
    var totalGold = Math.round(goldPerHour * hours * multiplier);
    var bonusGold = totalGold - baseGold;
    var fruit = getFruit();
    var stage = getGrowthStage(streakDays);
    var stageIconPath = getStageIcon(fruit.icon, stage.etapa);

    document.getElementById("result-gold").textContent = totalGold > 0 ? totalGold + " gold" : "0 gold";
    document.getElementById("result-base").textContent = baseGold > 0 ? baseGold + " gold" : "0 gold";
    document.getElementById("result-bonus").textContent = bonusGold > 0 ? "+" + bonusGold + " gold" : "+0 gold";
    document.getElementById("result-rate").textContent = goldPerHour + " / hr";
    document.getElementById("result-multiplier").textContent = multiplier.toFixed(2) + "x";
    document.getElementById("result-fruit").innerHTML = fruitImg(fruit.icon, "result-fruit-icon", fruit.name) + " " + fruit.name;
    document.getElementById("result-stage").innerHTML = fruitImg(stageIconPath, "result-fruit-icon", stage.name) + " " + stage.name;

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
            '<div class="level-fruit">' + fruitImg(fruits[i].icon, "funding-fruit-icon", fruits[i].name) + "</div>" +
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
        '<span class="level-fruit-icon">' + fruitImg(fruit.icon, "level-fruit-icon-img", fruit.name) + "</span>" +
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

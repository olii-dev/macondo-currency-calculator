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

var hardwareFundingCaps = {
    1: 100,
    2: 200,
    3: 400,
    4: 1000
};

var hardwareFundingRates = {
    1: 4,
    2: 4.5,
    3: 5,
    4: 6
};

var fundingTiers = [10, 20, 50, 100, 200, 400, 1000];

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
var partsFunding = 0;
var roundFunding = false;

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

function roundFundingToTier(amount, cap) {
    if (amount <= 0) return 0;
    for (var i = 0; i < fundingTiers.length; i++) {
        if (fundingTiers[i] >= amount && fundingTiers[i] <= cap) {
            return fundingTiers[i];
        }
    }
    return Math.min(amount, cap);
}

function getEffectiveFunding() {
    if (projectType !== "hardware" || partsFunding <= 0) {
        return { requested: 0, approved: 0, capped: false, rounded: false };
    }

    var cap = hardwareFundingCaps[level];
    var requested = Math.min(partsFunding, cap);
    var approved = roundFunding ? roundFundingToTier(requested, cap) : requested;
    var capped = partsFunding > cap;

    return {
        requested: requested,
        approved: approved,
        capped: capped,
        rounded: roundFunding && approved !== requested
    };
}

function getHardwareGoldHours(totalHours, fundingAmount) {
    if (fundingAmount <= 0) {
        return { goldHours: totalHours, fundingHours: 0 };
    }

    var fundingRate = hardwareFundingRates[level];
    var fundingHours = fundingAmount / fundingRate;
    var goldHours = Math.max(0, totalHours - fundingHours);

    return { goldHours: goldHours, fundingHours: fundingHours };
}

function formatHours(value) {
    var rounded = Math.round(value * 10) / 10;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

function formatMoney(value) {
    return "$" + (Number.isInteger(value) ? value : value.toFixed(2));
}

function calculate() {
    var goldPerHour = goldRates[level];
    var bonusPercent = streakDays * 0.01;
    var multiplier = 1 + bonusPercent;
    var funding = getEffectiveFunding();
    var hourSplit = projectType === "hardware"
        ? getHardwareGoldHours(hours, funding.approved)
        : { goldHours: hours, fundingHours: 0 };
    var goldHours = hourSplit.goldHours;
    var baseGold = Math.round(goldPerHour * goldHours);
    var totalGold = Math.round(goldPerHour * goldHours * multiplier);
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

    var fundingRowIds = ["result-funding-row", "result-funding-hours-row", "result-gold-hours-row"];
    var showFunding = projectType === "hardware" && funding.approved > 0;

    fundingRowIds.forEach(function(id) {
        var row = document.getElementById(id);
        if (row) row.style.display = showFunding ? "block" : "none";
    });

    if (showFunding) {
        document.getElementById("result-funding").textContent = formatMoney(funding.approved);
        document.getElementById("result-funding-hours").textContent =
            formatHours(hourSplit.fundingHours) + " hrs @ " + formatMoney(hardwareFundingRates[level]) + "/hr";
        document.getElementById("result-gold-hours").textContent = formatHours(goldHours) + " hrs";
    }

    var fundingNote = document.getElementById("funding-note");
    if (fundingNote) {
        if (projectType === "hardware" && funding.approved > 0) {
            var noteParts = [];
            if (funding.rounded) {
                noteParts.push("Rounded from " + formatMoney(funding.requested) + " to " + formatMoney(funding.approved));
            }
            if (funding.capped) {
                noteParts.push("Capped at " + formatMoney(hardwareFundingCaps[level]) + " for L" + level);
            }
            if (hourSplit.fundingHours > hours) {
                noteParts.push("Funding uses more hours than you logged — gold payout would be 0");
            }
            fundingNote.textContent = noteParts.join(" · ");
            fundingNote.style.display = noteParts.length ? "block" : "none";
        } else {
            fundingNote.style.display = "none";
        }
    }

    document.getElementById("formula-text").textContent = buildFormulaText(
        baseGold,
        bonusGold,
        totalGold,
        bonusPercent,
        goldHours,
        hourSplit.fundingHours,
        funding.approved
    );

    updateFundingLevels();
    updateGrowthStages(streakDays);
    updateLevelInfo();
}

function buildFormulaText(baseGold, bonusGold, totalGold, bonusPercent, goldHours, fundingHours, approvedFunding) {
    if (hours <= 0 && streakDays <= 0 && approvedFunding <= 0) {
        return "Enter hours and streak to calculate";
    }

    if (projectType === "hardware" && approvedFunding > 0) {
        var parts = [];
        parts.push(formatHours(hours) + " total hrs");
        parts.push(formatHours(fundingHours) + " funding hrs (" + formatMoney(approvedFunding) + ")");
        parts.push(formatHours(goldHours) + " gold hrs × " + goldRates[level] + "/hr = " + baseGold + " base");
        if (bonusGold > 0) {
            parts.push("+" + bonusGold + " bonus (" + streakDays + " day streak, " + (bonusPercent * 100).toFixed(0) + "%)");
        }
        parts.push("= " + totalGold + " gold");
        return parts.join(" → ");
    }

    if (totalGold > 0) {
        return baseGold + " base + " + bonusGold + " bonus (" + streakDays + " day streak, " + (bonusPercent * 100).toFixed(0) + "%) = " + totalGold + " gold";
    }

    return "Enter hours and streak to calculate";
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
            '<div class="level-amount">' + (projectType === "hardware" ? "$" + hardwareFundingCaps[i] + " cap" : fruits[i].name) + "</div>" +
            (projectType === "hardware" ? '<div class="level-rate">' + formatMoney(hardwareFundingRates[i]) + "/hr</div>" : "");
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
    var rateLabel = projectType === "hardware"
        ? goldRates[level] + " gold/hr · " + formatMoney(hardwareFundingRates[level]) + " funding/hr"
        : goldRates[level] + " gold/hr";
    info.innerHTML =
        '<span class="level-fruit-icon">' + fruitImg(fruit.icon, "level-fruit-icon-img", fruit.name) + "</span>" +
        '<span>L' + level + " \u00b7 " + levelLabels[level] + " \u00b7 " + fruit.name + "</span>" +
        '<span class="level-rate" style="margin-left:auto">' + rateLabel + "</span>";
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

    var fundingInputGroup = document.getElementById("funding-input-group");
    if (fundingInputGroup) {
        fundingInputGroup.style.display = type === "hardware" ? "flex" : "none";
    }

    var hardwareFundingInfo = document.getElementById("hardware-funding-info");
    if (hardwareFundingInfo) {
        hardwareFundingInfo.style.display = type === "hardware" ? "block" : "none";
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

function setPartsFunding(val) {
    partsFunding = parseFloat(val) || 0;
    calculate();
}

function setRoundFunding(checked) {
    roundFunding = checked;
    calculate();
}

document.addEventListener("DOMContentLoaded", function() {
    setProjectType("software");
    calculate();
    updateStreakTiming();
    setInterval(updateStreakTiming, 60000);
});

/* =========================================
   BHAIRAVA LANDING PAGE
========================================= */

const altitude = document.getElementById("altitude");
const aiLoad = document.getElementById("aiLoad");


/* =========================================
   STARTUP SEQUENCE
========================================= */

window.addEventListener("load", () => {

    console.log("BHAIRAVA SYSTEM INITIALIZING...");

    setTimeout(() => {
        console.log("AI VISION ONLINE");
    }, 500);

    setTimeout(() => {
        console.log("LiDAR ONLINE");
    }, 900);

    setTimeout(() => {
        console.log("GPS LOCKED");
    }, 1300);

    setTimeout(() => {
        console.log("BHAIRAVA READY");
    }, 1700);

});


/* =========================================
   SIMULATED TELEMETRY DISPLAY
========================================= */

let currentAltitude = 142;
let currentAI = 34;


function updateTelemetry() {

    /*
        Small visual changes only.
        These are landing-page animations,
        NOT actual flight telemetry.
    */

    const altitudeChange =
        (Math.random() - 0.5) * 2;

    const aiChange =
        (Math.random() - 0.5) * 4;


    currentAltitude += altitudeChange;
    currentAI += aiChange;


    currentAltitude =
        Math.max(138, Math.min(147, currentAltitude));

    currentAI =
        Math.max(28, Math.min(42, currentAI));


    altitude.textContent =
        Math.round(currentAltitude);

    aiLoad.textContent =
        Math.round(currentAI) + "%";
}


setInterval(updateTelemetry, 1400);


/* =========================================
   MOUSE PARALLAX
========================================= */

const droneZone =
    document.querySelector(".drone-zone");

document.addEventListener("mousemove", (event) => {

    const x =
        (event.clientX / window.innerWidth - 0.5);

    const y =
        (event.clientY / window.innerHeight - 0.5);


    const moveX = x * 12;
    const moveY = y * 8;


    droneZone.style.transform =
        `translate(${moveX}px, ${moveY}px)`;
});


/* =========================================
   RESET PARALLAX ON MOBILE / LEAVE
========================================= */

document.addEventListener("mouseleave", () => {

    droneZone.style.transform =
        "translate(0, 0)";
});


/* =========================================
   ENTER BUTTON
========================================= */

const enterButton =
    document.querySelector(".enter-button");

enterButton.addEventListener("click", () => {

    enterButton.style.opacity = "0.7";

    console.log(
        "ACCESSING BHAIRAVA MONITOR..."
    );

});


/* =========================================
   SYSTEM LOG
========================================= */

console.log(
    "%c BHAIRAVA ",
    "color:#00d9ff;font-size:24px;font-weight:bold;"
);

console.log(
    "Autonomous Aerial Monitoring System"
);

console.log(
    "Landing interface initialized."
);
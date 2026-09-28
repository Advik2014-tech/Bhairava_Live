/*
   BHAIRAVA LIVE
   MAVLink TELEMETRY DASHBOARD

   IMPORTANT:
   This frontend is telemetry/display only.
   It does NOT send flight-control commands.
*/


const connectionType =
  document.getElementById("connectionType");

const address =
  document.getElementById("address");

const connectBtn =
  document.getElementById("connectBtn");

const disconnectBtn =
  document.getElementById("disconnectBtn");

const systemStatus =
  document.getElementById("systemStatus");

const connectionMessage =
  document.getElementById("connectionMessage");

const telemetryStatus =
  document.getElementById("telemetryStatus");

const flightMode =
  document.getElementById("flightMode");

const failsafe =
  document.getElementById("failsafe");

const eventLog =
  document.getElementById("eventLog");


let serialPort = null;
let reader = null;
let websocket = null;
let connected = false;
let lastTelemetry = 0;


/* -------------------------
   LOGGING
------------------------- */

function logEvent(message) {

  const time =
    new Date().toLocaleTimeString();

  const line =
    document.createElement("div");

  line.textContent =
    `[${time}] ${message}`;

  eventLog.prepend(line);

}


/* -------------------------
   UI STATUS
------------------------- */

function setOnline() {

  connected = true;

  systemStatus.textContent =
    "● ONLINE";

  systemStatus.className =
    "status online";

  telemetryStatus.textContent =
    "CONNECTED";

  flightMode.textContent =
    "TELEMETRY LINK ACTIVE";

  failsafe.textContent =
    "SYSTEM NOMINAL";

  failsafe.className =
    "safe";

}


function setOffline() {

  connected = false;

  systemStatus.textContent =
    "● OFFLINE";

  systemStatus.className =
    "status offline";

  telemetryStatus.textContent =
    "OFFLINE";

  flightMode.textContent =
    "DISCONNECTED";

  failsafe.textContent =
    "TELEMETRY LOST";

  failsafe.className =
    "danger";

}


/* -------------------------
   AUTO CONNECTION
------------------------- */

async function autoConnect() {

  logEvent(
    "AUTO CONNECTION SEARCH STARTED"
  );

  /*
     First look for previously
     authorised USB serial devices.
  */

  if ("serial" in navigator) {

    const ports =
      await navigator.serial.getPorts();

    if (ports.length > 0) {

      logEvent(
        "AUTHORIZED USB DEVICE FOUND"
      );

      await connectUSB(ports[0]);

      return;
    }
  }


  /*
     Otherwise try the configured
     WebSocket telemetry bridge.
  */

  connectWebSocket(
    address.value ||
    "ws://localhost:8765"
  );
}


/* -------------------------
   USB / SERIAL
------------------------- */

async function connectUSB(existingPort = null) {

  try {

    if (!("serial" in navigator)) {

      connectionMessage.textContent =
        "Web Serial is not supported by this browser.";

      return;
    }


    serialPort =
      existingPort ||
      await navigator.serial.requestPort();


    await serialPort.open({
      baudRate: 115200
    });


    connectionMessage.textContent =
      "USB SERIAL CONNECTED";

    logEvent(
      "USB SERIAL LINK ESTABLISHED"
    );

    setOnline();

    readSerial();

  }

  catch (error) {

    console.error(error);

    connectionMessage.textContent =
      "USB CONNECTION FAILED";

    logEvent(
      "USB CONNECTION FAILED"
    );

    setOffline();
  }
}


/* -------------------------
   SERIAL READER
------------------------- */

async function readSerial() {

  const decoder =
    new TextDecoderStream();

  serialPort.readable
    .pipeTo(decoder.writable);

  reader =
    decoder.readable.getReader();


  try {

    while (true) {

      const { value, done } =
        await reader.read();

      if (done) break;

      if (value) {

        processTelemetry(
          value
        );

      }

    }

  }

  catch (error) {

    console.error(error);

  }

}


/* -------------------------
   WEBSOCKET
------------------------- */

function connectWebSocket(url) {

  try {

    connectionMessage.textContent =
      "CONNECTING TO TELEMETRY BRIDGE...";

    websocket =
      new WebSocket(url);


    websocket.onopen = () => {

      logEvent(
        "WEBSOCKET TELEMETRY LINK CONNECTED"
      );

      connectionMessage.textContent =
        "NETWORK TELEMETRY CONNECTED";

      setOnline();

    };


    websocket.onmessage = event => {

      processTelemetry(
        event.data
      );

    };


    websocket.onclose = () => {

      logEvent(
        "NETWORK TELEMETRY DISCONNECTED"
      );

      setOffline();

    };


    websocket.onerror = () => {

      logEvent(
        "NETWORK CONNECTION ERROR"
      );

      setOffline();

    };

  }

  catch (error) {

    console.error(error);

    setOffline();

  }

}


/* -------------------------
   TELEMETRY PROCESSOR
------------------------- */

function processTelemetry(rawData) {

  lastTelemetry =
    Date.now();


  let data;

  try {

    /*
       Expected bridge format:

       {
         "battery": 87,
         "voltage": 15.8,
         "lat": 12.9716,
         "lon": 77.5946,
         "gpsFix": true,
         "satellites": 14,
         "altitude": 42,
         "speed": 8.2,
         "mode": "AUTO",
         "armed": false,
         "aiLoad": 54,
         "cpuTemp": 62,
         "storage": 71,
         "solar": 42,
         "lidar": "CLEAR"
       }
    */

    data =
      JSON.parse(rawData);

  }

  catch {

    /*
       Ignore non-JSON serial data.
       A MAVLink-to-JSON bridge should
       provide the browser-readable data.
    */

    return;
  }


  updateDashboard(data);

}


/* -------------------------
   DASHBOARD UPDATE
------------------------- */

function updateDashboard(data) {

  if (data.battery !== undefined)
    document.getElementById("battery")
      .textContent =
      `${data.battery} %`;


  if (data.voltage !== undefined)
    document.getElementById("voltage")
      .textContent =
      `${data.voltage} V`;


  if (data.gpsFix !== undefined) {

    document.getElementById("gps")
      .textContent =
      data.gpsFix
        ? "GPS FIX"
        : "NO FIX";

  }


  if (
    data.lat !== undefined &&
    data.lon !== undefined
  ) {

    document.getElementById("coordinates")
      .textContent =
      `${Number(data.lat).toFixed(6)}, ${
        Number(data.lon).toFixed(6)
      }`;

    document.getElementById("mapText")
      .textContent =
      `GPS ${Number(data.lat).toFixed(6)}
       / ${Number(data.lon).toFixed(6)}`;

  }


  if (data.altitude !== undefined)
    document.getElementById("altitude")
      .textContent =
      `${data.altitude} m`;


  if (data.speed !== undefined)
    document.getElementById("speed")
      .textContent =
      `${data.speed} m/s`;


  if (data.aiLoad !== undefined)
    document.getElementById("aiLoad")
      .textContent =
      `${data.aiLoad} %`;


  if (data.cpuTemp !== undefined)
    document.getElementById("cpuTemp")
      .textContent =
      `CPU ${data.cpuTemp} °C`;


  if (data.storage !== undefined)
    document.getElementById("storage")
      .textContent =
      `${data.storage} %`;


  if (data.solar !== undefined)
    document.getElementById("solar")
      .textContent =
      `${data.solar} W`;


  if (data.lidar !== undefined)
    document.getElementById("lidar")
      .textContent =
      data.lidar;


  if (data.mode !== undefined)
    document.getElementById("flightMode")
      .textContent =
      data.mode;


  if (data.armed !== undefined)
    document.getElementById("armStatus")
      .textContent =
      data.armed
        ? "ARMED"
        : "DISARMED";


  if (data.satellites !== undefined)
    document.getElementById("satellites")
      .textContent =
      data.satellites;


  setOnline();

}


/* -------------------------
   DISCONNECT
------------------------- */

async function disconnect() {

  try {

    if (reader) {

      await reader.cancel();

      reader = null;

    }


    if (serialPort) {

      await serialPort.close();

      serialPort = null;

    }


    if (websocket) {

      websocket.close();

      websocket = null;

    }

  }

  catch (error) {

    console.error(error);

  }


  setOffline();

  connectionMessage.textContent =
    "DISCONNECTED";

  logEvent(
    "USER DISCONNECTED TELEMETRY"
  );

}


/* -------------------------
   BUTTONS
------------------------- */

connectBtn.addEventListener(
  "click",
  async () => {

    const type =
      connectionType.value;


    if (type === "auto") {

      await autoConnect();

    }

    else if (type === "usb") {

      await connectUSB();

    }

    else if (type === "ws") {

      connectWebSocket(
        address.value ||
        "ws://localhost:8765"
      );

    }

    else if (
      type === "tcp" ||
      type === "udp"
    ) {

      connectionMessage.textContent =
        `${type.toUpperCase()} requires a telemetry bridge.`;

      logEvent(
        `${type.toUpperCase()} SELECTED — WAITING FOR BRIDGE`
      );

    }

  }
);


disconnectBtn.addEventListener(
  "click",
  disconnect
);


/* -------------------------
   TELEMETRY WATCHDOG
------------------------- */

setInterval(() => {

  if (
    connected &&
    lastTelemetry > 0 &&
    Date.now() - lastTelemetry > 5000
  ) {

    setOffline();

    connectionMessage.textContent =
      "TELEMETRY LOST — WAITING FOR RECONNECT";

    logEvent(
      "TELEMETRY TIMEOUT"
    );

  }

}, 1000);


/* -------------------------
   STARTUP
------------------------- */

logEvent(
  "BHAIRAVA LIVE READY"
);

setOffline();
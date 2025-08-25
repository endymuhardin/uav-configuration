// Interactive Guide JavaScript
let currentStep = 0;
const totalSteps = 18; // Including completion step (0-17)
const stepChecks = {}; // Track completed steps
let hardwareConfig = {}; // Store hardware configuration

// ArduPilot Frame Configuration Database
const frameDatabase = {
    "1": { // Quad
        name: "Quadcopter",
        frameTypes: {
            "0": { name: "Quad Plus (+)", motors: 4, description: "Motors aligned with front/back/left/right" },
            "1": { name: "Quad X", motors: 4, description: "Default X configuration, most common" },
            "2": { name: "Quad V", motors: 4, description: "V-shaped motor layout" },
            "3": { name: "Quad H", motors: 4, description: "H-shaped motor layout" },
            "4": { name: "Quad V-Tail", motors: 4, description: "V-tail configuration" },
            "5": { name: "Quad A-Tail", motors: 4, description: "A-tail configuration" },
            "10": { name: "Quad Plus Reversed", motors: 4, description: "Plus configuration with reversed props" },
            "11": { name: "Quad X (BetaFlight)", motors: 4, description: "BetaFlight motor order" },
            "12": { name: "Quad X (DJI)", motors: 4, description: "DJI motor order" },
            "13": { name: "Quad X (ClockWise)", motors: 4, description: "All motors clockwise" },
            "14": { name: "Quad Plus (No Yaw)", motors: 4, description: "Plus without yaw authority" },
            "15": { name: "Quad X (No Yaw)", motors: 4, description: "X without yaw authority" },
            "18": { name: "Quad X (BF Reversed)", motors: 4, description: "BetaFlight reversed (prop-out)" },
            "19": { name: "Quad Y4A", motors: 4, description: "Y4A configuration" }
        }
    },
    "2": { // Hexa
        name: "Hexacopter",
        frameTypes: {
            "0": { name: "Hexa Plus (+)", motors: 6, description: "Plus configuration with 6 motors" },
            "1": { name: "Hexa X", motors: 6, description: "X configuration with 6 motors" },
            "3": { name: "Hexa H", motors: 6, description: "H configuration with 6 motors" },
            "12": { name: "Hexa X (DJI)", motors: 6, description: "DJI motor order" },
            "13": { name: "Hexa X (ClockWise)", motors: 6, description: "All motors clockwise" }
        }
    },
    "3": { // Octa
        name: "Octacopter",
        frameTypes: {
            "0": { name: "Octa Plus (+)", motors: 8, description: "Plus configuration with 8 motors" },
            "1": { name: "Octa X", motors: 8, description: "X configuration with 8 motors" },
            "2": { name: "Octa V", motors: 8, description: "V configuration with 8 motors" },
            "3": { name: "Octa H", motors: 8, description: "H configuration with 8 motors" },
            "12": { name: "Octa X (DJI)", motors: 8, description: "DJI motor order" },
            "13": { name: "Octa X (ClockWise)", motors: 8, description: "All motors clockwise" },
            "17": { name: "Octa I", motors: 8, description: "I configuration" }
        }
    },
    "4": { // OctaQuad
        name: "OctaQuad",
        frameTypes: {
            "0": { name: "OctaQuad Plus (+)", motors: 8, description: "Coaxial plus configuration" },
            "1": { name: "OctaQuad X", motors: 8, description: "Coaxial X configuration" },
            "2": { name: "OctaQuad V", motors: 8, description: "Coaxial V configuration" },
            "3": { name: "OctaQuad H", motors: 8, description: "Coaxial H configuration" },
            "11": { name: "OctaQuad X (BetaFlight)", motors: 8, description: "BetaFlight motor order" },
            "13": { name: "OctaQuad X (ClockWise)", motors: 8, description: "All motors clockwise" },
            "18": { name: "OctaQuad X (BF Reversed)", motors: 8, description: "BetaFlight reversed" }
        }
    },
    "5": { // Y6
        name: "Y6 Copter",
        frameTypes: {
            "10": { name: "Y6 B", motors: 6, description: "Y6 configuration with bottom props" },
            "7": { name: "Y6 F", motors: 6, description: "Y6 configuration with front props" }
        }
    },
    "7": { // Tri
        name: "Tricopter",
        frameTypes: {
            "0": { name: "Tricopter", motors: 3, description: "3-motor configuration with servo yaw" }
        }
    },
    "8": { // SingleCopter
        name: "SingleCopter",
        frameTypes: {
            "0": { name: "SingleCopter", motors: 1, description: "Single motor with servo-controlled pitch plates" }
        }
    },
    "9": { // CoaxCopter
        name: "CoaxCopter",
        frameTypes: {
            "0": { name: "CoaxCopter", motors: 2, description: "Coaxial dual motor configuration" }
        }
    }
};

// Motor mapping data for different frame types
const motorMappings = {
    "1": { // Quad
        "0": { // Quad Plus
            positions: ["Front", "Right", "Back", "Left"],
            rotations: ["CCW", "CW", "CCW", "CW"],
            description: "Plus configuration with motors aligned to cardinal directions",
            diagram: "quad-plus.png"
        },
        "1": { // Quad X
            positions: ["Front Right", "Back Left", "Back Right", "Front Left"],
            rotations: ["CCW", "CCW", "CW", "CW"],
            description: "Standard X configuration, most common setup",
            diagram: "quad-x.png"
        },
        "18": { // Quad X (BF Reversed)
            positions: ["Front Right", "Back Right", "Back Left", "Front Left"],
            rotations: ["CW", "CW", "CCW", "CCW"],
            description: "BetaFlight reversed (prop-out) - propellers spin outward",
            diagram: "quad-x-bf-reversed.png",
            servoMapping: {
                "Motor 1": "Servo 4", // Front Left
                "Motor 2": "Servo 3", // Back Left  
                "Motor 3": "Servo 2", // Back Right
                "Motor 4": "Servo 1"  // Front Right
            }
        },
        "11": { // Quad X (BetaFlight)
            positions: ["Back Right", "Front Right", "Back Left", "Front Left"],
            rotations: ["CCW", "CW", "CW", "CCW"],
            description: "BetaFlight motor order",
            diagram: "quad-x-bf.png"
        },
        "12": { // Quad X (DJI)
            positions: ["Front Left", "Front Right", "Back Right", "Back Left"],
            rotations: ["CCW", "CW", "CCW", "CW"],
            description: "DJI motor order",
            diagram: "quad-x-dji.png"
        }
    },
    "2": { // Hexa
        "0": { // Hexa Plus
            positions: ["Front", "Front Right", "Back Right", "Back", "Back Left", "Front Left"],
            rotations: ["CCW", "CW", "CCW", "CW", "CCW", "CW"],
            description: "Plus configuration with 6 motors",
            diagram: "hexa-plus.png"
        },
        "1": { // Hexa X
            positions: ["Front Right", "Right", "Back Right", "Back Left", "Left", "Front Left"],
            rotations: ["CCW", "CW", "CCW", "CW", "CCW", "CW"],
            description: "X configuration with 6 motors",
            diagram: "hexa-x.png"
        }
    },
    "3": { // Octa
        "0": { // Octa Plus
            positions: ["Front", "Front Right", "Right", "Back Right", "Back", "Back Left", "Left", "Front Left"],
            rotations: ["CCW", "CW", "CCW", "CW", "CCW", "CW", "CCW", "CW"],
            description: "Plus configuration with 8 motors",
            diagram: "octa-plus.png"
        },
        "1": { // Octa X
            positions: ["Front Right", "Front Right Mid", "Back Right Mid", "Back Right", "Back Left", "Back Left Mid", "Front Left Mid", "Front Left"],
            rotations: ["CCW", "CW", "CCW", "CW", "CCW", "CW", "CCW", "CW"],
            description: "X configuration with 8 motors",
            diagram: "octa-x.png"
        }
    }
};

// RC Receiver types and their supported protocols
const rcReceiverTypes = {
    "expresslrs": {
        name: "ExpressLRS",
        supportedProtocols: ["crsf", "mavlink", "sbus"],
        defaultProtocol: "mavlink"
    },
    "crossfire": {
        name: "TBS Crossfire", 
        supportedProtocols: ["crsf"],
        defaultProtocol: "crsf"
    },
    "frsky": {
        name: "FrSky",
        supportedProtocols: ["sbus", "ppm"],
        defaultProtocol: "sbus"
    },
    "spektrum": {
        name: "Spektrum",
        supportedProtocols: ["dsm", "sbus"],
        defaultProtocol: "dsm"
    },
    "flysky": {
        name: "FlySky",
        supportedProtocols: ["sbus", "ppm"],
        defaultProtocol: "sbus"
    },
    "generic": {
        name: "Generic",
        supportedProtocols: ["sbus", "ppm", "crsf"],
        defaultProtocol: "sbus"
    }
};

// RC Protocol configurations
const rcProtocols = {
    "crsf": {
        name: "CRSF",
        ardupilotProtocol: "23",
        baudRate: 416666,
        description: "Crossfire/ELRS bidirectional protocol",
        wiring: "Connect receiver TX to FC RX, receiver RX to FC TX",
        features: ["Control", "Telemetry", "Parameter adjustment"]
    },
    "mavlink": {
        name: "MavLink",
        ardupilotProtocol: "2",
        baudRate: 460800,
        description: "MavLink telemetry via ExpressLRS (requires firmware 3.5.0+)",
        wiring: "Connect receiver UART TX to FC RX, receiver UART RX to FC TX",
        features: ["Telemetry", "Mission planning", "Parameter adjustment", "WiFi telemetry"],
        setupSteps: [
            "Flash ExpressLRS firmware 3.5.0+ ke TX dan RX",
            "Di ELRS LUA script, set receiver Serial Protocol ke 'MAVLink'",
            "Ubah Link Mode ke 'MAVLink' (otomatis menggunakan Hybrid/16ch mode)",
            "Telemetry ratio tetap di 1:2 (tidak bisa diubah)",
            "Set RSSI_TYPE=5 di ArduPilot untuk menampilkan RSSI yang benar",
            "Untuk WiFi telemetry: Flash TX Backpack firmware 1.5.0+",
            "Set Backpack Telemetry ke 'WiFi', koneksi ke 'ExpressLRS TX Backpack' WiFi",
            "Gunakan UDP port 14550 di Ground Control Station (Mission Planner/QGroundControl)"
        ],
        additionalParams: [
            "RSSI_TYPE,5",
            "TELEM_DELAY,10"
        ]
    },
    "sbus": {
        name: "SBUS",
        ardupilotProtocol: "3",
        baudRate: 100000,
        description: "SBUS protocol (FrSky, ExpressLRS compatible)",
        wiring: "Connect receiver SBUS to FC RX (inverted)",
        features: ["Control only"]
    },
    "ppm": {
        name: "PPM",
        ardupilotProtocol: "3",
        baudRate: 57600,
        description: "Pulse Position Modulation",
        wiring: "Connect receiver PPM to FC PPM input pin",
        features: ["Control only", "Single wire"]
    },
    "dsm": {
        name: "DSM/DSMX",
        ardupilotProtocol: "3",
        baudRate: 115200,
        description: "Spektrum DSM protocol",
        wiring: "Connect receiver to FC RX",
        features: ["Control only"]
    }
};

// ESC Protocol Database
const escProtocols = {
    "dshot300": {
        name: "DShot300",
        ardupilotParam: "6",
        frequency: 300000,  // 300kHz
        description: "Optimal balance antara performance dan reliability",
        features: ["Digital control", "Bidirectional", "CRC error detection", "Low power consumption"],
        compatibility: "Semua ESC modern BLHeli_S & BLHeli_32",
        params: [
            { param: "SERVO1_FUNCTION", value: "33" },  // Motor 1
            { param: "SERVO2_FUNCTION", value: "34" },  // Motor 2
            { param: "SERVO3_FUNCTION", value: "35" },  // Motor 3
            { param: "SERVO4_FUNCTION", value: "36" },  // Motor 4
            { param: "MOT_PWM_TYPE", value: "6" }       // DShot300
        ]
    },
    "dshot600": {
        name: "DShot600",
        ardupilotParam: "7",
        frequency: 600000,  // 600kHz
        description: "High performance untuk racing dan acrobatic",
        features: ["Digital control", "Bidirectional", "CRC error detection", "High precision"],
        compatibility: "ESC BLHeli_S 16.7+ & BLHeli_32",
        params: [
            { param: "SERVO1_FUNCTION", value: "33" },
            { param: "SERVO2_FUNCTION", value: "34" },
            { param: "SERVO3_FUNCTION", value: "35" },
            { param: "SERVO4_FUNCTION", value: "36" },
            { param: "MOT_PWM_TYPE", value: "7" }       // DShot600
        ]
    },
    "dshot1200": {
        name: "DShot1200",
        ardupilotParam: "8",
        frequency: 1200000, // 1.2MHz
        description: "Ultra high performance untuk professional racing",
        features: ["Digital control", "Bidirectional", "CRC error detection", "Ultra high precision"],
        compatibility: "ESC BLHeli_32 only (high-end)",
        params: [
            { param: "SERVO1_FUNCTION", value: "33" },
            { param: "SERVO2_FUNCTION", value: "34" },
            { param: "SERVO3_FUNCTION", value: "35" },
            { param: "SERVO4_FUNCTION", value: "36" },
            { param: "MOT_PWM_TYPE", value: "8" }       // DShot1200
        ],
        warnings: ["Butuh FC dengan processor powerful (F7/H7)", "Konsumsi daya lebih tinggi"]
    },
    "pwm": {
        name: "PWM",
        ardupilotParam: "0",
        frequency: 490,     // 490Hz default
        description: "Traditional PWM untuk ESC lama atau budget",
        features: ["Analog control", "Universal compatibility", "Simple wiring"],
        compatibility: "Semua jenis ESC (termasuk yang lama)",
        params: [
            { param: "SERVO1_FUNCTION", value: "33" },
            { param: "SERVO2_FUNCTION", value: "34" },
            { param: "SERVO3_FUNCTION", value: "35" },
            { param: "SERVO4_FUNCTION", value: "36" },
            { param: "MOT_PWM_TYPE", value: "0" },      // PWM
            { param: "MOT_PWM_MAX", value: "2000" },    // Max throttle
            { param: "MOT_PWM_MIN", value: "1000" }     // Min throttle
        ],
        calibrationRequired: true
    },
    "oneshot125": {
        name: "OneShot125",
        ardupilotParam: "1",
        frequency: 8000,    // 8kHz
        description: "Legacy high performance protocol",
        features: ["Analog control", "8x faster than PWM", "Good precision"],
        compatibility: "BLHeli ESCs, beberapa ESC lama",
        params: [
            { param: "SERVO1_FUNCTION", value: "33" },
            { param: "SERVO2_FUNCTION", value: "34" },
            { param: "SERVO3_FUNCTION", value: "35" },
            { param: "SERVO4_FUNCTION", value: "36" },
            { param: "MOT_PWM_TYPE", value: "1" }       // OneShot125
        ],
        calibrationRequired: true
    },
    "oneshot42": {
        name: "OneShot42", 
        ardupilotParam: "2",
        frequency: 24000,   // 24kHz
        description: "Legacy ultra-fast analog protocol",
        features: ["Analog control", "24x faster than PWM", "High precision"],
        compatibility: "BLHeli ESCs only",
        params: [
            { param: "SERVO1_FUNCTION", value: "33" },
            { param: "SERVO2_FUNCTION", value: "34" },
            { param: "SERVO3_FUNCTION", value: "35" },
            { param: "SERVO4_FUNCTION", value: "36" },
            { param: "MOT_PWM_TYPE", value: "2" }       // OneShot42
        ],
        calibrationRequired: true
    },
    "multishot": {
        name: "Multishot",
        ardupilotParam: "3",
        frequency: 32000,   // 32kHz
        description: "Legacy racing protocol untuk competitive flying",
        features: ["Analog control", "32x faster than PWM", "Racing precision"],
        compatibility: "BLHeli ESCs only",
        params: [
            { param: "SERVO1_FUNCTION", value: "33" },
            { param: "SERVO2_FUNCTION", value: "34" },
            { param: "SERVO3_FUNCTION", value: "35" },
            { param: "SERVO4_FUNCTION", value: "36" },
            { param: "MOT_PWM_TYPE", value: "3" }       // Multishot
        ],
        calibrationRequired: true
    }
};

// FC Orientation Database
const fcOrientations = {
    "0": {
        name: "Normal",
        description: "FC dipasang normal (panah/USB menghadap ke depan)",
        rotation: "None",
        useCase: "Orientasi standar untuk sebagian besar setup",
        visualization: "→"
    },
    "1": {
        name: "Yaw 90°",
        description: "Diputar 90° searah jarum jam",
        rotation: "90° CW",
        useCase: "FC dipasang menyamping, panah menghadap kanan",
        visualization: "↓"
    },
    "2": {
        name: "Yaw 180°",
        description: "Diputar 180° (terbalik)",
        rotation: "180°",
        useCase: "FC dipasang terbalik, panah menghadap belakang",
        visualization: "←"
    },
    "3": {
        name: "Yaw 270°",
        description: "Diputar 270° searah jarum jam",
        rotation: "270° CW",
        useCase: "FC dipasang menyamping, panah menghadap kiri",
        visualization: "↑"
    },
    "4": {
        name: "Roll 180°",
        description: "Terbalik horizontal (upside down)",
        rotation: "Upside Down",
        useCase: "FC dipasang terbalik di bawah frame",
        visualization: "⟲"
    },
    "5": {
        name: "Roll 180° + Yaw 90°",
        description: "Terbalik + putar 90°",
        rotation: "Upside Down + 90° CW",
        useCase: "FC terbalik dan diputar 90°",
        visualization: "⟲↓"
    },
    "8": {
        name: "Pitch 180°",
        description: "Terbalik vertikal",
        rotation: "Pitch Inverted",
        useCase: "FC dipasang dengan pitch terbalik",
        visualization: "⤴"
    },
    "12": {
        name: "Yaw 90° + Roll 180°",
        description: "Putar 90° + terbalik horizontal",
        rotation: "90° CW + Upside Down",
        useCase: "FC terbalik dan diputar 90°",
        visualization: "⟲↓"
    },
    "13": {
        name: "Yaw 180° + Roll 180°",
        description: "Putar 180° + terbalik horizontal",
        rotation: "180° + Upside Down",
        useCase: "FC terbalik dan diputar 180°",
        visualization: "⟲←"
    },
    "14": {
        name: "Yaw 270° + Roll 180°",
        description: "Putar 270° + terbalik horizontal",
        rotation: "270° CW + Upside Down",
        useCase: "FC terbalik dan diputar 270°",
        visualization: "⟲↑"
    },
    "20": {
        name: "Pitch 90°",
        description: "Hidung naik 90°",
        rotation: "Pitch Up 90°",
        useCase: "FC dipasang vertikal, hidung ke atas",
        visualization: "⤴"
    },
    "21": {
        name: "Pitch 270°",
        description: "Hidung turun 90°",
        rotation: "Pitch Down 90°",
        useCase: "FC dipasang vertikal, hidung ke bawah",
        visualization: "⤵"
    }
};

// VTX types database
const vtxTypes = {
    "walksnail": {
        name: "Walksnail/Avatar HD",
        protocols: ["displayport"],
        defaultProtocol: "displayport",
        description: "Digital HD video transmission with OSD overlay support",
        features: ["HD Video", "OSD Overlay", "DisplayPort"],
        setupNotes: "Supports multiple font styles via goggle menu"
    },
    "dji": {
        name: "DJI Digital",
        protocols: ["displayport"],
        defaultProtocol: "displayport", 
        description: "DJI digital system with WTF-OSD modification required",
        features: ["HD Video", "OSD Overlay", "DisplayPort"],
        setupNotes: "Requires rooting goggles and installing WTFOS + msp-osd module"
    },
    "hdzero": {
        name: "HDZero",
        protocols: ["displayport"],
        defaultProtocol: "displayport",
        description: "HDZero digital video transmission system",
        features: ["HD Video", "OSD Overlay", "DisplayPort"],
        setupNotes: "Set OSDx_TXT_RES to 0 or 1 for resolution"
    },
    "analog": {
        name: "Analog/Traditional",
        protocols: ["none"],
        defaultProtocol: "none",
        description: "Traditional analog video transmission",
        features: ["Analog Video"],
        setupNotes: "OSD overlay melalui MinimOSD atau built-in FC OSD"
    }
};

// VTX protocols database
const vtxProtocols = {
    "displayport": {
        name: "DisplayPort",
        ardupilotProtocol: "42",
        baudRate: 115200,
        description: "DisplayPort protocol for HD VTX OSD overlay",
        wiring: "Connect VTX DisplayPort TX to FC UART TX pin (single wire)",
        parameters: [
            "OSD_TYPE,5",
            "MSP_OPTIONS,0"
        ]
    },
    "none": {
        name: "Tidak ada protokol",
        ardupilotProtocol: "0",
        baudRate: 0,
        description: "Tidak menggunakan serial komunikasi dengan VTX",
        wiring: "Hanya sambung video dan power",
        parameters: []
    }
};

// Peripheral protocol database (updated)
const peripheralProtocols = {
    "gps1": {
        name: "GPS Module 1 (Primary)",
        protocol: "GPS",
        ardupilotProtocol: "5",
        baudRate: 115200,
        description: "Primary GPS positioning module",
        wiring: "Connect GPS TX to FC RX, GPS RX to FC TX"
    },
    "gps2": {
        name: "GPS Module 2 (Secondary)",
        protocol: "GPS",
        ardupilotProtocol: "5", 
        baudRate: 115200,
        description: "Secondary GPS positioning module for redundancy",
        wiring: "Connect GPS TX to FC RX, GPS RX to FC TX"
    },
    "vtx": {
        name: "VTX (OSD)",
        protocol: "DisplayPort",
        ardupilotProtocol: "42",
        baudRate: 115200,
        description: "Video transmitter with OSD overlay",
        wiring: "Connect VTX DisplayPort to FC UART TX pin"
    },
    "esc-telem": {
        name: "ESC Telemetry",
        protocol: "ESC Telemetry",
        ardupilotProtocol: "9",
        baudRate: 115200,
        description: "ESC telemetry data (RPM, current, temperature)",
        wiring: "Connect ESC telemetry wire to FC RX pin"
    },
    "rangefinder": {
        name: "Rangefinder/Lidar",
        protocol: "Rangefinder",
        ardupilotProtocol: "9",
        baudRate: 115200,
        description: "Distance sensor for altitude hold",
        wiring: "Connect rangefinder TX to FC RX"
    },
    "smartport": {
        name: "SmartPort Telemetry",
        protocol: "FrSky SPort",
        ardupilotProtocol: "10",
        baudRate: 57600,
        description: "FrSky SmartPort telemetry",
        wiring: "Connect SmartPort signal to FC TX (inverted)"
    },
    "gimbal": {
        name: "Gimbal Control",
        protocol: "MavLink1",
        ardupilotProtocol: "1",
        baudRate: 57600,
        description: "Gimbal stabilization control",
        wiring: "Connect gimbal controller to FC UART"
    }
};

// Initialize the guide
document.addEventListener('DOMContentLoaded', function() {
    initializeGuide();
    updateProgress();
    createStepIndicators();
    loadSavedProgress();
    initializeHardwareConfig();
});

function initializeGuide() {
    // Show first step
    showStep(0);
    
    // Add event listeners to checkboxes
    const checkboxes = document.querySelectorAll('.step-check');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleStepCheck);
    });
    
    // Load saved state
    loadSavedProgress();
}

function createStepIndicators() {
    const indicatorsContainer = document.getElementById('stepIndicators');
    indicatorsContainer.innerHTML = '';
    
    for (let i = 0; i < totalSteps; i++) {
        const indicator = document.createElement('div');
        indicator.className = 'step-indicator';
        indicator.setAttribute('data-step', i);
        indicator.addEventListener('click', () => goToStep(i));
        indicatorsContainer.appendChild(indicator);
    }
    
    updateStepIndicators();
}

function updateStepIndicators() {
    const indicators = document.querySelectorAll('.step-indicator');
    indicators.forEach((indicator, index) => {
        indicator.classList.remove('active', 'completed');
        
        if (index === currentStep) {
            indicator.classList.add('active');
        } else if (stepChecks[index + 1]) {
            indicator.classList.add('completed');
        }
    });
}

function showStep(stepNumber) {
    // Hide all steps
    const allSteps = document.querySelectorAll('.step-content');
    allSteps.forEach(step => {
        step.style.display = 'none';
    });
    
    // Show current step
    const currentStepElement = document.getElementById(`step${stepNumber}`);
    if (currentStepElement) {
        currentStepElement.style.display = 'block';
    }
    
    // Update step-specific content
    updateStepContent(stepNumber);
    
    // Update navigation buttons
    updateNavigationButtons();
    updateStepIndicators();
}

function updateStepContent(stepNumber) {
    switch(stepNumber) {
        case 1: // Frame Type step
            updateFrameTypeStep();
            break;
        case 3: // FC Orientation step
            updateFcOrientationStep();
            break;
        case 4: // Serial Port Configuration step 
            updateSerialPortStep();
            break;
        case 5: // ESC Configuration step
            updateEscStep();
            break;
        case 6: // Motor Test step
            updateMotorSetupStep(); // Motor test uses the same motor setup function
            break;
        case 7: // Motor Order & Servo Output step 
            updateMotorSetupStep();
            break;
        // Add other step-specific updates here
    }
}

function updateFrameTypeStep() {
    const frameInfo = getFrameInfo(hardwareConfig.frameClass, hardwareConfig.frameType);
    
    // Update frame configuration display
    const frameConfigDisplay = document.getElementById('frame-config-display');
    if (frameConfigDisplay) {
        frameConfigDisplay.innerHTML = `
            <h4>🔧 Konfigurasi Frame Anda:</h4>
            <ul>
                <li><strong>Frame Class:</strong> ${frameDatabase[hardwareConfig.frameClass]?.name} (${frameInfo.motors} motors)</li>
                <li><strong>Frame Type:</strong> ${frameInfo.name}</li>
                <li><strong>Deskripsi:</strong> ${frameInfo.description}</li>
            </ul>
        `;
    }
    
    // Update parameter displays
    const frameClassParam = document.getElementById('frame-class-param');
    if (frameClassParam) {
        frameClassParam.innerHTML = `
            <code>FRAME_CLASS = ${hardwareConfig.frameClass}</code>
            <span>${frameDatabase[hardwareConfig.frameClass]?.name}</span>
        `;
    }
    
    const frameTypeParam = document.getElementById('frame-type-param');
    if (frameTypeParam) {
        frameTypeParam.innerHTML = `
            <code>FRAME_TYPE = ${hardwareConfig.frameType}</code>
            <span>${frameInfo.name}</span>
        `;
    }
    
    // Update checkbox text
    const frameCheckText = document.getElementById('frame-check-text');
    if (frameCheckText) {
        frameCheckText.textContent = `Frame type diset ke ${frameInfo.name}`;
    }
}

function updateFcOrientationStep() {
    const fcOrientation = hardwareConfig.fcOrientation || '0';
    const orientationData = fcOrientations[fcOrientation];
    
    if (!orientationData) return;
    
    // Update FC orientation display
    const fcOrientationDisplay = document.getElementById('fc-orientation-display');
    if (fcOrientationDisplay) {
        fcOrientationDisplay.innerHTML = `
            <div class="fc-orientation-info">
                <h4>📡 Parameter ArduPilot:</h4>
                <div class="param-item">
                    <code>AHRS_ORIENTATION = ${fcOrientation}</code>
                    <span>${orientationData.name}</span>
                </div>
                
                <div class="orientation-details">
                    <div class="detail-row">
                        <span class="detail-label">Rotasi:</span>
                        <span class="detail-value">${orientationData.rotation}</span>
                        <span class="orientation-visual">${orientationData.visualization}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Deskripsi:</span>
                        <span class="detail-value">${orientationData.description}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Use Case:</span>
                        <span class="detail-value">${orientationData.useCase}</span>
                    </div>
                </div>
                
                <div class="alert alert-info">
                    <strong>💡 Verifikasi:</strong> Setelah setting parameter, pastikan HUD di Mission Planner bergerak sesuai dengan gerakan drone fisik.
                </div>
            </div>
        `;
    }
    
    // Update checkbox text
    const fcOrientationCheckText = document.getElementById('fc-orientation-check-text');
    if (fcOrientationCheckText) {
        fcOrientationCheckText.textContent = `Orientasi FC diset ke ${orientationData.name} (AHRS_ORIENTATION = ${fcOrientation})`;
    }
}

function updateMotorSetupStep() {
    const frameClass = hardwareConfig.frameClass;
    const frameType = hardwareConfig.frameType;
    const frameInfo = getFrameInfo(frameClass, frameType);
    const motorMapping = motorMappings[frameClass]?.[frameType];
    
    if (!motorMapping) {
        // Fallback for unsupported frame types
        updateMotorSetupFallback(frameInfo);
        return;
    }
    
    // Update motor setup content dynamically
    updateMotorConfiguration(frameInfo, motorMapping);
    updateMotorTestTable(motorMapping);
    updateServoOutputSection(motorMapping);
    updateMotorCheckText(frameInfo);
}

function updateMotorConfiguration(frameInfo, motorMapping) {
    const motorConfigSection = document.getElementById('motor-config-section');
    if (!motorConfigSection) return;
    
    motorConfigSection.innerHTML = `
        <h3>📋 Konfigurasi Motor untuk ${frameInfo.name}</h3>
        <div class="alert alert-danger">
            <strong>⚠️ PENTING:</strong> PASTIKAN BALING-BALING TIDAK TERPASANG selama proses ini!
        </div>
        
        <div class="motor-config-info">
            <h4>🔧 Spesifikasi Frame Anda:</h4>
            <ul>
                <li><strong>Frame Type:</strong> ${frameInfo.name}</li>
                <li><strong>Jumlah Motor:</strong> ${frameInfo.motors}</li>
                <li><strong>Konfigurasi:</strong> ${motorMapping.description}</li>
            </ul>
        </div>
    `;
}

function updateMotorTestTable(motorMapping) {
    const motorTestTable = document.getElementById('dynamic-motor-test-table');
    if (!motorTestTable) return;
    
    const positions = motorMapping.positions;
    const rotations = motorMapping.rotations;
    
    let tableRows = '';
    positions.forEach((position, index) => {
        const motorNum = index + 1;
        const rotation = rotations[index];
        const rotationIcon = rotation === 'CW' ? '↻' : '↺';
        const rotationColor = rotation === 'CW' ? 'green' : 'blue';
        
        tableRows += `
            <tr>
                <td>Motor ${motorNum}</td>
                <td>${position}</td>
                <td style="color: ${rotationColor}; font-weight: bold;">${rotationIcon} ${rotation}</td>
                <td>Posisi ${String.fromCharCode(64 + motorNum)}</td>
            </tr>
        `;
    });
    
    motorTestTable.innerHTML = `
        <thead>
            <tr>
                <th>Motor</th>
                <th>Posisi Fisik</th>
                <th>Arah Putaran</th>
                <th>Test Position</th>
            </tr>
        </thead>
        <tbody>
            ${tableRows}
        </tbody>
    `;
}

function updateServoOutputSection(motorMapping) {
    const servoOutputSection = document.getElementById('servo-output-config');
    if (!servoOutputSection || !motorMapping.servoMapping) return;
    
    let servoMappingHtml = '<h4>Konfigurasi Servo Output:</h4><ul>';
    Object.entries(motorMapping.servoMapping).forEach(([motor, servo]) => {
        servoMappingHtml += `<li><strong>${servo}:</strong> ${motor}</li>`;
    });
    servoMappingHtml += '</ul>';
    
    servoOutputSection.innerHTML = `
        <div class="highlight-box">
            ${servoMappingHtml}
        </div>
        <p>Buka <strong>Setup > Mandatory Hardware > Servo Output</strong> dan ubah konfigurasi sesuai di atas.</p>
    `;
}

function updateMotorCheckText(frameInfo) {
    const motorCheckText = document.getElementById('motor-check-text');
    if (motorCheckText) {
        motorCheckText.textContent = `✅ Motor test berhasil untuk ${frameInfo.name}, urutan dan arah putaran motor sudah benar`;
    }
}

function updateMotorSetupFallback(frameInfo) {
    // Fallback content for unsupported frame types
    const motorConfigSection = document.getElementById('motor-config-section');
    if (motorConfigSection) {
        motorConfigSection.innerHTML = `
            <h3>📋 Setup Motor untuk ${frameInfo.name}</h3>
            <div class="alert alert-warning">
                <strong>⚠️ Perhatian:</strong> Konfigurasi khusus untuk ${frameInfo.name} belum tersedia dalam panduan ini.
            </div>
            <div class="frame-warning">
                <strong>📖 Panduan Manual:</strong><br>
                Silakan rujuk ke dokumentasi ArduPilot resmi untuk konfigurasi motor ${frameInfo.name}:<br>
                <a href="https://ardupilot.org/copter/docs/connect-escs-and-motors.html" target="_blank">ArduPilot Motor Setup Documentation</a>
            </div>
        `;
    }
    
    const motorCheckText = document.getElementById('motor-check-text');
    if (motorCheckText) {
        motorCheckText.textContent = `Motor setup dikonfigurasi untuk ${frameInfo.name}`;
    }
}

function updateSerialPortStep() {
    if (!hardwareConfig.peripherals) return;
    
    // Get enabled peripherals
    const enabledPeripherals = Object.entries(hardwareConfig.peripherals)
        .filter(([key, config]) => config.enabled);
    
    // Update serial port configuration display
    updateSerialPortTable(enabledPeripherals);
    updateWiringDiagram(enabledPeripherals);
    updateSerialCheckText(enabledPeripherals);
}

function updatePeripheralDisplay() {
    // Update peripheral-related displays
    if (!hardwareConfig.peripherals) return;
    
    // Get enabled peripherals
    const enabledPeripherals = Object.entries(hardwareConfig.peripherals)
        .filter(([key, config]) => config.enabled);
    
    // Update serial port displays if they exist
    updateSerialPortTable(enabledPeripherals);
    updateWiringDiagram(enabledPeripherals);
    updateSerialCheckText(enabledPeripherals);
}

function updateEscStep() {
    const escProtocol = hardwareConfig.escProtocol || 'dshot300';
    const escData = escProtocols[escProtocol];
    
    if (!escData) return;
    
    // Update ESC configuration display
    const escConfigDisplay = document.getElementById('esc-config-display');
    if (escConfigDisplay) {
        let warningsHtml = '';
        if (escData.warnings) {
            warningsHtml = `
                <div class="alert alert-warning">
                    <strong>⚠️ Perhatian:</strong>
                    <ul>
                        ${escData.warnings.map(warning => `<li>${warning}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        let calibrationHtml = '';
        if (escData.calibrationRequired) {
            calibrationHtml = `
                <div class="alert alert-info">
                    <strong>🔧 Kalibrasi Diperlukan:</strong> Protocol ${escData.name} memerlukan kalibrasi ESC manual. 
                    Lakukan kalibrasi ESC setelah setting parameter.
                </div>
            `;
        }
        
        escConfigDisplay.innerHTML = `
            <div class="esc-protocol-info">
                <h4>📡 Protocol: ${escData.name}</h4>
                <div class="protocol-details">
                    <p><strong>Frequency:</strong> ${escData.frequency.toLocaleString()} Hz</p>
                    <p><strong>Description:</strong> ${escData.description}</p>
                    <p><strong>Compatibility:</strong> ${escData.compatibility}</p>
                </div>
                
                <div class="protocol-features">
                    <h5>✨ Features:</h5>
                    <ul>
                        ${escData.features.map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                </div>
                
                ${warningsHtml}
                ${calibrationHtml}
            </div>
        `;
    }
    
    // Update parameters display
    const escParamsDisplay = document.getElementById('esc-params-display');
    if (escParamsDisplay && escData.params) {
        escParamsDisplay.innerHTML = `
            <div class="param-list">
                ${escData.params.map(param => `
                    <div class="param-item">
                        <code>${param.param} = ${param.value}</code>
                        <span>${getParamDescription(param.param)}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // Update checkbox text
    const escCheckText = document.getElementById('esc-check-text');
    if (escCheckText) {
        escCheckText.textContent = `Protocol ESC diset ke ${escData.name}`;
    }
}

function getParamDescription(paramName) {
    const descriptions = {
        'SERVO1_FUNCTION': 'Motor 1 output',
        'SERVO2_FUNCTION': 'Motor 2 output',
        'SERVO3_FUNCTION': 'Motor 3 output', 
        'SERVO4_FUNCTION': 'Motor 4 output',
        'MOT_PWM_TYPE': 'ESC protocol type',
        'MOT_PWM_MAX': 'Maximum throttle value',
        'MOT_PWM_MIN': 'Minimum throttle value'
    };
    return descriptions[paramName] || 'ESC parameter';
}

function updateSerialPortTable(enabledPeripherals) {
    const serialTableContainer = document.getElementById('dynamic-serial-table');
    if (!serialTableContainer) return;
    
    // Group by UART
    const uartConfig = {};
    enabledPeripherals.forEach(([peripheral, config]) => {
        if (peripheral === 'rc-receiver') {
            // Special handling for RC receiver
            const rcProtocolData = rcProtocols[config.protocol];
            const rcReceiverData = rcReceiverTypes[config.type];
            if (rcProtocolData && rcReceiverData) {
                uartConfig[config.uart] = {
                    peripheral: `${rcReceiverData.name} (${rcProtocolData.name})`,
                    protocol: rcProtocolData.name,
                    baudRate: rcProtocolData.baudRate,
                    description: rcProtocolData.description
                };
            }
        } else {
            // Standard peripheral handling
            const protocolData = peripheralProtocols[peripheral];
            if (protocolData) {
                uartConfig[config.uart] = {
                    peripheral: protocolData.name,
                    protocol: protocolData.protocol,
                    baudRate: protocolData.baudRate,
                    description: protocolData.description
                };
            }
        }
    });
    
    let tableRows = '';
    Object.entries(uartConfig).forEach(([uart, config]) => {
        tableRows += `
            <tr>
                <td><strong>${uart}</strong></td>
                <td>${config.baudRate}</td>
                <td>${config.protocol}</td>
                <td>${config.peripheral}</td>
                <td><small>${config.description}</small></td>
            </tr>
        `;
    });
    
    serialTableContainer.innerHTML = `
        <table class="config-table">
            <thead>
                <tr>
                    <th>Port</th>
                    <th>Baud Rate</th>
                    <th>Protocol</th>
                    <th>Peripheral</th>
                    <th>Deskripsi</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows || '<tr><td colspan="5">Tidak ada peripheral yang dikonfigurasi</td></tr>'}
            </tbody>
        </table>
    `;
}

function updateWiringDiagram(enabledPeripherals) {
    const wiringContainer = document.getElementById('wiring-instructions');
    if (!wiringContainer) return;
    
    let wiringInstructions = '<h4>📡 Petunjuk Pemasangan:</h4>';
    
    if (enabledPeripherals.length === 0) {
        wiringInstructions += '<p>Tidak ada peripheral yang perlu dipasang.</p>';
    } else {
        wiringInstructions += '<div class="wiring-list">';
        enabledPeripherals.forEach(([peripheral, config]) => {
            if (peripheral === 'rc-receiver') {
                // Special handling for RC receiver
                const rcProtocolData = rcProtocols[config.protocol];
                const rcReceiverData = rcReceiverTypes[config.type];
                if (rcProtocolData && rcReceiverData) {
                    let setupInstructions = '';
                    
                    // Add detailed setup steps for MavLink
                    if (config.protocol === 'mavlink' && rcProtocolData.setupSteps) {
                        setupInstructions += '<div class="setup-steps"><h6>📋 Langkah Setup ExpressLRS MavLink:</h6><ol>';
                        rcProtocolData.setupSteps.forEach(step => {
                            setupInstructions += `<li>${step}</li>`;
                        });
                        setupInstructions += '</ol></div>';
                    }
                    
                    let additionalParams = '';
                    if (rcProtocolData.additionalParams) {
                        additionalParams += '<div class="additional-params"><h6>⚙️ Parameter Tambahan:</h6>';
                        rcProtocolData.additionalParams.forEach(param => {
                            additionalParams += `<code>${param}</code><br>`;
                        });
                        additionalParams += '</div>';
                    }
                    
                    wiringInstructions += `
                        <div class="wiring-item">
                            <h5>🔌 ${rcReceiverData.name} - ${rcProtocolData.name} (${config.uart})</h5>
                            <p>${rcProtocolData.wiring}</p>
                            <p><strong>Features:</strong> ${rcProtocolData.features.join(', ')}</p>
                            ${setupInstructions}
                            <div class="param-display">
                                <h6>🔧 Parameter Serial Port:</h6>
                                <code>SERIAL${config.uart.replace('UART', '')}_PROTOCOL = ${rcProtocolData.ardupilotProtocol}</code>
                                <code>SERIAL${config.uart.replace('UART', '')}_BAUD = ${Math.floor(rcProtocolData.baudRate / 1000)}</code>
                            </div>
                            ${additionalParams}
                        </div>
                    `;
                }
            } else if (peripheral === 'vtx') {
                // Special handling for VTX
                const vtxProtocolData = vtxProtocols[config.protocol];
                const vtxTypeData = vtxTypes[hardwareConfig.vtxType || 'walksnail'];
                
                if (vtxProtocolData && vtxTypeData) {
                    let setupInstructions = '';
                    if (vtxTypeData.setupNotes) {
                        setupInstructions += `<div class="setup-steps"><h6>📋 Setup ${vtxTypeData.name}:</h6><p>${vtxTypeData.setupNotes}</p></div>`;
                    }
                    
                    let additionalParams = '';
                    if (vtxProtocolData.parameters && vtxProtocolData.parameters.length > 0) {
                        additionalParams += '<div class="additional-params"><h6>⚙️ Parameter Tambahan:</h6>';
                        vtxProtocolData.parameters.forEach(param => {
                            additionalParams += `<code>${param}</code><br>`;
                        });
                        additionalParams += '</div>';
                    }
                    
                    wiringInstructions += `
                        <div class="wiring-item">
                            <h5>🔌 ${vtxTypeData.name} - ${vtxProtocolData.name} (${config.uart})</h5>
                            <p>${vtxProtocolData.wiring}</p>
                            <p><strong>Features:</strong> ${vtxTypeData.features.join(', ')}</p>
                            ${setupInstructions}
                            ${config.protocol !== 'none' ? `
                            <div class="param-display">
                                <h6>🔧 Parameter Serial Port:</h6>
                                <code>SERIAL${config.uart.replace('UART', '')}_PROTOCOL = ${vtxProtocolData.ardupilotProtocol}</code>
                                <code>SERIAL${config.uart.replace('UART', '')}_BAUD = ${Math.floor(vtxProtocolData.baudRate / 1000)}</code>
                            </div>
                            ` : ''}
                            ${additionalParams}
                        </div>
                    `;
                }
            } else {
                // Standard peripheral handling
                const protocolData = peripheralProtocols[peripheral];
                if (protocolData) {
                    wiringInstructions += `
                        <div class="wiring-item">
                            <h5>🔌 ${protocolData.name} (${config.uart})</h5>
                            <p>${protocolData.wiring}</p>
                            <div class="param-display">
                                <code>SERIAL${config.uart.replace('UART', '')}_PROTOCOL = ${getProtocolNumber(protocolData.protocol)}</code>
                                <code>SERIAL${config.uart.replace('UART', '')}_BAUD = ${Math.floor(protocolData.baudRate / 1000)}</code>
                            </div>
                        </div>
                    `;
                }
            }
        });
        wiringInstructions += '</div>';
    }
    
    wiringContainer.innerHTML = wiringInstructions;
}


function getProtocolNumber(protocolName) {
    const protocolNumbers = {
        'GPS': '5',
        'DisplayPort': '42',
        'MavLink2': '2',
        'ESC Telemetry': '9',
        'Rangefinder': '9',
        'FrSky SPort': '10',
        'CRSF': '23',
        'MavLink1': '1',
        'SBUS': '3'
    };
    return protocolNumbers[protocolName] || '0';
}

function updateSerialCheckText(enabledPeripherals) {
    const serialCheckText = document.getElementById('serial-check-text');
    if (serialCheckText) {
        const peripheralCount = enabledPeripherals.length;
        if (peripheralCount === 0) {
            serialCheckText.textContent = 'Serial port configuration completed';
        } else {
            serialCheckText.textContent = `✅ ${peripheralCount} peripheral(s) dikonfigurasi pada serial port`;
        }
    }
}

function changeStep(direction) {
    const newStep = currentStep + direction;
    
    if (newStep >= 0 && newStep < totalSteps) {
        currentStep = newStep;
        showStep(currentStep);
        updateProgress();
        saveProgress();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function goToStep(stepNumber) {
    if (stepNumber >= 0 && stepNumber < totalSteps) {
        currentStep = stepNumber;
        showStep(currentStep);
        updateProgress();
        saveProgress();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    // Update previous button
    prevBtn.disabled = currentStep === 0;
    
    // Update next button
    if (currentStep === totalSteps - 1) {
        nextBtn.textContent = '🎉 Selesai!';
        nextBtn.disabled = false;
    } else {
        nextBtn.textContent = 'Selanjutnya →';
        nextBtn.disabled = false;
    }
}

function handleStepCheck(event) {
    const stepNumber = parseInt(event.target.getAttribute('data-step'));
    stepChecks[stepNumber] = event.target.checked;
    
    updateProgress();
    updateStepIndicators();
    saveProgress();
    
    // Auto-advance if step is completed
    if (event.target.checked && currentStep < totalSteps - 1) {
        setTimeout(() => {
            changeStep(1);
        }, 500);
    }
}

function updateProgress() {
    const completedSteps = Object.values(stepChecks).filter(checked => checked).length;
    const progressPercentage = Math.round((completedSteps / (totalSteps - 1)) * 100);
    
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    progressBar.style.width = `${progressPercentage}%`;
    progressText.textContent = `${progressPercentage}% Selesai (${completedSteps}/${totalSteps - 1} langkah)`;
}

function saveProgress() {
    const progressData = {
        currentStep: currentStep,
        stepChecks: stepChecks
    };
    localStorage.setItem('ardupilot-guide-progress', JSON.stringify(progressData));
}

function loadSavedProgress() {
    const savedProgress = localStorage.getItem('ardupilot-guide-progress');
    if (savedProgress) {
        try {
            const progressData = JSON.parse(savedProgress);
            currentStep = progressData.currentStep || 0;
            Object.assign(stepChecks, progressData.stepChecks || {});
            
            // Update checkboxes
            Object.keys(stepChecks).forEach(stepNumber => {
                const checkbox = document.querySelector(`input[data-step="${stepNumber}"]`);
                if (checkbox) {
                    checkbox.checked = stepChecks[stepNumber];
                }
            });
            
            showStep(currentStep);
            updateProgress();
        } catch (error) {
            console.error('Error loading saved progress:', error);
        }
    }
}

function resetGuide() {
    if (confirm('Apakah Anda yakin ingin mengulang panduan dari awal? Progress akan hilang.')) {
        localStorage.removeItem('ardupilot-guide-progress');
        currentStep = 0;
        Object.keys(stepChecks).forEach(key => delete stepChecks[key]);
        
        // Reset all checkboxes
        const checkboxes = document.querySelectorAll('.step-check');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        showStep(0);
        updateProgress();
        updateStepIndicators();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function copyParams() {
    const paramsText = document.getElementById('tuningParams');
    if (paramsText) {
        // Create a temporary textarea to copy text
        const textArea = document.createElement('textarea');
        textArea.value = paramsText.textContent;
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            
            // Show success message
            const copyBtn = document.querySelector('.copy-btn');
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✅ Disalin!';
            copyBtn.style.background = '#22c55e';
            
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.background = '';
            }, 2000);
        } catch (err) {
            console.error('Failed to copy parameters:', err);
            alert('Gagal menyalin parameter. Silakan copy manual.');
        } finally {
            document.body.removeChild(textArea);
        }
    }
}

// Keyboard navigation
document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowLeft') {
        event.preventDefault();
        if (currentStep > 0) {
            changeStep(-1);
        }
    } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        if (currentStep < totalSteps - 1) {
            changeStep(1);
        }
    }
});

// Image modal functionality
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('instruction-img') || event.target.classList.contains('gallery-img')) {
        openImageModal(event.target);
    }
});

function openImageModal(img) {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="modal-background" onclick="closeImageModal()"></div>
        <div class="modal-content">
            <img src="${img.src}" alt="${img.alt}" style="max-width: 90vw; max-height: 90vh; object-fit: contain;">
            <button class="modal-close" onclick="closeImageModal()">✕</button>
        </div>
    `;
    
    // Add modal styles
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease;
    `;
    
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.cssText = `
        position: relative;
        text-align: center;
    `;
    
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.style.cssText = `
        position: absolute;
        top: -40px;
        right: -40px;
        background: white;
        border: none;
        border-radius: 50%;
        width: 35px;
        height: 35px;
        font-size: 18px;
        cursor: pointer;
        color: #333;
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

function closeImageModal() {
    const modal = document.querySelector('.image-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

// Export/Import functionality
function exportProgress() {
    const progressData = {
        currentStep: currentStep,
        stepChecks: stepChecks,
        timestamp: new Date().toISOString(),
        version: '1.0'
    };
    
    const dataStr = JSON.stringify(progressData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `ardupilot-guide-progress-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

function importProgress(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const progressData = JSON.parse(e.target.result);
                
                if (confirm('Import progress ini akan menimpa progress saat ini. Lanjutkan?')) {
                    currentStep = progressData.currentStep || 0;
                    Object.assign(stepChecks, progressData.stepChecks || {});
                    
                    // Update UI
                    Object.keys(stepChecks).forEach(stepNumber => {
                        const checkbox = document.querySelector(`input[data-step="${stepNumber}"]`);
                        if (checkbox) {
                            checkbox.checked = stepChecks[stepNumber];
                        }
                    });
                    
                    showStep(currentStep);
                    updateProgress();
                    updateStepIndicators();
                    saveProgress();
                    
                    alert('Progress berhasil di-import!');
                }
            } catch (error) {
                alert('File tidak valid atau rusak.');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);
    }
}

// Print functionality
function printGuide() {
    const printWindow = window.open('', '', 'width=800,height=600');
    const currentStepContent = document.getElementById(`step${currentStep}`);
    
    if (currentStepContent) {
        printWindow.document.write(`
            <html>
            <head>
                <title>ArduPilot Guide - Step ${currentStep}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    img { max-width: 100%; height: auto; }
                    .no-print { display: none; }
                </style>
            </head>
            <body>
                <h1>Panduan ArduPilot Nazgul - Step ${currentStep}</h1>
                ${currentStepContent.innerHTML}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }
}

// Add smooth scrolling to anchor links
document.addEventListener('click', function(event) {
    if (event.target.tagName === 'A' && event.target.getAttribute('href').startsWith('#')) {
        event.preventDefault();
        const targetId = event.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    }
});

// Auto-save progress periodically
setInterval(saveProgress, 30000); // Save every 30 seconds

// Window unload warning if there's unsaved progress
window.addEventListener('beforeunload', function(event) {
    const hasProgress = Object.keys(stepChecks).length > 0;
    if (hasProgress && !localStorage.getItem('ardupilot-guide-progress')) {
        event.preventDefault();
        event.returnValue = 'Progress Anda belum tersimpan. Yakin ingin meninggalkan halaman?';
        return event.returnValue;
    }
});

// Utility functions for development/debugging
window.debugGuide = {
    getCurrentStep: () => currentStep,
    getStepChecks: () => stepChecks,
    goToStep: goToStep,
    resetProgress: resetGuide,
    exportProgress: exportProgress
};

// Hardware Configuration Functions
function initializeHardwareConfig() {
    // Load default hardware configuration
    hardwareConfig = {
        fc: 'SpeedyBee F405 V4',
        esc: 'SpeedyBee BLS 55A (DShot300)',
        receiver: 'Matek RP4TD',
        gps1: 'MicoAir M10G-5883',
        gps2: '',
        motor: 'Emax Eco II 1750KV',
        battery: '6s',
        frameSize: '5',
        frameClass: '1', // Quad
        frameType: '18', // Quad X (BF Reversed) - prop-out
        escProtocol: 'dshot300', // ESC Protocol
        fcOrientation: '0', // FC Orientation (Normal)
        vtxType: 'walksnail',
        vtxModel: 'Avatar Mini',
        notes: '',
        // Peripheral configuration
        peripherals: {
            gps1: { enabled: true, uart: 'UART6' },
            gps2: { enabled: false, uart: 'UART5' },
            vtx: { enabled: true, uart: 'UART1', protocol: 'displayport' },
            'rc-receiver': { 
                enabled: true, 
                uart: 'UART2',
                type: 'expresslrs',
                protocol: 'mavlink'
            },
            'esc-telem': { enabled: true, uart: 'UART5' },
            rangefinder: { enabled: false, uart: 'UART3' },
            smartport: { enabled: false, uart: 'UART4' },
            gimbal: { enabled: false, uart: 'UART3' }
        }
    };
    
    // Load saved hardware config
    const savedHardware = localStorage.getItem('ardupilot-hardware-config');
    if (savedHardware) {
        try {
            const savedData = JSON.parse(savedHardware);
            Object.assign(hardwareConfig, savedData);
        } catch (error) {
            console.error('Error loading hardware config:', error);
        }
    }
    
    // Populate form fields
    populateHardwareForm();
    updateHardwareSummary();
    
    // Update step content with loaded configuration
    updateStepContent(currentStep);
    
    // Add event listeners
    addHardwareEventListeners();
}

function populateHardwareForm() {
    document.getElementById('fc-input').value = hardwareConfig.fc || '';
    document.getElementById('esc-input').value = hardwareConfig.esc || '';
    document.getElementById('receiver-input').value = hardwareConfig.receiver || '';
    document.getElementById('gps1-input').value = hardwareConfig.gps1 || '';
    document.getElementById('gps2-input').value = hardwareConfig.gps2 || '';
    document.getElementById('motor-input').value = hardwareConfig.motor || '';
    document.getElementById('battery-input').value = hardwareConfig.battery || '6s';
    document.getElementById('frame-size-input').value = hardwareConfig.frameSize || '5';
    document.getElementById('frame-class-input').value = hardwareConfig.frameClass || '1';
    document.getElementById('vtx-type-select').value = hardwareConfig.vtxType || 'walksnail';
    document.getElementById('vtx-model-input').value = hardwareConfig.vtxModel || 'Avatar Mini';
    document.getElementById('notes-input').value = hardwareConfig.notes || '';
    
    // Update frame type options based on frame class
    updateFrameTypeOptions();
    document.getElementById('frame-type-input').value = hardwareConfig.frameType || '18';
    document.getElementById('esc-protocol-select').value = hardwareConfig.escProtocol || 'dshot300';
    document.getElementById('fc-orientation-select').value = hardwareConfig.fcOrientation || '0';
    
    // Populate peripheral configuration
    populatePeripheralConfig();
    
    // Update VTX protocol options based on selected VTX type
    updateVtxProtocolOptions();
    
    // Update peripheral display (wiring diagrams, serial table)
    updatePeripheralDisplay();
}

function populatePeripheralConfig() {
    if (!hardwareConfig.peripherals) return;
    
    Object.entries(hardwareConfig.peripherals).forEach(([peripheral, config]) => {
        const checkbox = document.getElementById(`peripheral-${peripheral}`);
        
        if (peripheral === 'rc-receiver') {
            // Special handling for RC receiver
            const rcReceiverType = document.getElementById('rc-receiver-type');
            const rcProtocol = document.getElementById('rc-protocol');
            const rcUartSelect = document.getElementById('rc-uart-select');
            
            if (checkbox) checkbox.checked = config.enabled;
            if (rcReceiverType) rcReceiverType.value = config.type || 'expresslrs';
            if (rcProtocol) rcProtocol.value = config.protocol || 'mavlink';
            if (rcUartSelect) {
                rcUartSelect.value = config.uart;
                rcUartSelect.disabled = !config.enabled;
            }
            
            // Update protocol options based on receiver type
            updateRcProtocolOptions(config.type || 'expresslrs');
            
            // Enable/disable RC config details
            const rcConfigDetails = document.querySelector('.rc-config-details');
            if (rcConfigDetails) {
                rcConfigDetails.style.opacity = config.enabled ? '1' : '0.5';
                const rcInputs = rcConfigDetails.querySelectorAll('select');
                rcInputs.forEach(input => input.disabled = !config.enabled);
            }
        } else if (peripheral === 'vtx') {
            // Special handling for VTX
            const vtxProtocolSelect = document.getElementById('vtx-protocol-select');
            const vtxUartSelect = document.getElementById('vtx-uart-select');
            
            if (checkbox) checkbox.checked = config.enabled;
            if (vtxProtocolSelect) vtxProtocolSelect.value = config.protocol || 'displayport';
            if (vtxUartSelect) {
                vtxUartSelect.value = config.uart;
                vtxUartSelect.disabled = !config.enabled;
            }
            
            // Enable/disable VTX config details
            const vtxConfigDetails = document.querySelector('.vtx-config-details');
            if (vtxConfigDetails) {
                vtxConfigDetails.style.opacity = config.enabled ? '1' : '0.5';
                const vtxInputs = vtxConfigDetails.querySelectorAll('select');
                vtxInputs.forEach(input => input.disabled = !config.enabled);
            }
        } else {
            // Standard peripheral handling
            const uartSelectId = peripheral.includes('-') 
                ? `${peripheral}-uart-select` 
                : `${peripheral}-uart-select`;
            const uartSelect = document.getElementById(uartSelectId);
            
            if (checkbox) {
                checkbox.checked = config.enabled;
            }
            if (uartSelect) {
                uartSelect.value = config.uart;
                uartSelect.disabled = !config.enabled;
            }
        }
    });
}

function updateRcProtocolOptions(receiverType) {
    const rcProtocolSelect = document.getElementById('rc-protocol');
    if (!rcProtocolSelect || !rcReceiverTypes[receiverType]) return;
    
    const supportedProtocols = rcReceiverTypes[receiverType].supportedProtocols;
    const currentProtocol = rcProtocolSelect.value;
    
    // Clear current options
    rcProtocolSelect.innerHTML = '';
    
    // Add supported protocol options
    supportedProtocols.forEach(protocolKey => {
        const protocolData = rcProtocols[protocolKey];
        if (protocolData) {
            const option = document.createElement('option');
            option.value = protocolKey;
            option.textContent = `${protocolData.name} - ${protocolData.features.join(', ')}`;
            rcProtocolSelect.appendChild(option);
        }
    });
    
    // Restore previous selection if supported, otherwise use default
    if (supportedProtocols.includes(currentProtocol)) {
        rcProtocolSelect.value = currentProtocol;
    } else {
        rcProtocolSelect.value = rcReceiverTypes[receiverType].defaultProtocol;
    }
}

function updateVtxProtocolOptions() {
    const vtxTypeSelect = document.getElementById('vtx-type-select');
    const vtxProtocolSelect = document.getElementById('vtx-protocol-select');
    
    if (!vtxTypeSelect || !vtxProtocolSelect) return;
    
    const vtxType = vtxTypeSelect.value;
    const vtxTypeData = vtxTypes[vtxType];
    
    // Clear existing options
    vtxProtocolSelect.innerHTML = '';
    
    if (vtxTypeData && vtxTypeData.protocols) {
        vtxTypeData.protocols.forEach(protocol => {
            const option = document.createElement('option');
            option.value = protocol;
            option.textContent = vtxProtocols[protocol]?.name || protocol;
            vtxProtocolSelect.appendChild(option);
        });
        
        // Set default protocol
        vtxProtocolSelect.value = vtxTypeData.defaultProtocol;
    }
    
    // Update VTX peripheral configuration
    if (hardwareConfig.peripherals && hardwareConfig.peripherals.vtx) {
        hardwareConfig.peripherals.vtx.protocol = vtxTypeData.defaultProtocol;
    }
}

function addHardwareEventListeners() {
    const inputs = document.querySelectorAll('.hw-input');
    inputs.forEach(input => {
        input.addEventListener('input', updateHardwareFromForm);
        input.addEventListener('change', updateHardwareFromForm);
    });
    
    // Special listener for frame class changes
    const frameClassInput = document.getElementById('frame-class-input');
    if (frameClassInput) {
        frameClassInput.addEventListener('change', function() {
            console.log('Frame class changed to:', this.value);
            updateFrameTypeOptions();
            // Set default frame type for the selected class
            const frameClass = this.value;
            const frameData = frameDatabase[frameClass];
            if (frameData) {
                const firstFrameType = Object.keys(frameData.frameTypes)[0];
                const frameTypeInput = document.getElementById('frame-type-input');
                if (frameTypeInput) {
                    frameTypeInput.value = firstFrameType;
                }
            }
            updateHardwareFromForm();
            
            // Immediately update step content if on relevant steps
            if (currentStep === 1) {
                updateFrameTypeStep();
            } else if (currentStep === 6) {
                updateMotorSetupStep(); // Motor Test
            } else if (currentStep === 7) {
                updateMotorSetupStep(); // Motor Order
            }
        });
    } else {
        console.error('Frame class input not found');
    }
    
    // Special listener for frame type changes
    document.getElementById('frame-type-input').addEventListener('change', function() {
        updateHardwareFromForm();
        
        // Immediately update step content if on relevant steps
        if (currentStep === 1) {
            updateFrameTypeStep();
        } else if (currentStep === 6) {
            updateMotorSetupStep(); // Motor Test
        } else if (currentStep === 7) {
            updateMotorSetupStep(); // Motor Order
        }
    });
    
    // Special listener for ESC protocol changes
    document.getElementById('esc-protocol-select').addEventListener('change', function() {
        updateHardwareFromForm();
        
        // Immediately update ESC step if currently viewing it
        if (currentStep === 5) {
            updateEscStep();
        }
    });
    
    // Special listener for FC orientation changes
    document.getElementById('fc-orientation-select').addEventListener('change', function() {
        updateHardwareFromForm();
        
        // Immediately update FC orientation step if currently viewing it
        if (currentStep === 3) {
            updateFcOrientationStep();
        }
    });
    
    // Add peripheral event listeners
    addPeripheralEventListeners();
}

function addPeripheralEventListeners() {
    // Peripheral checkbox listeners
    document.querySelectorAll('.peripheral-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const peripheral = this.id.replace('peripheral-', '');
            
            if (peripheral === 'rc-receiver') {
                // Special handling for RC receiver
                const rcConfigDetails = document.querySelector('.rc-config-details');
                if (rcConfigDetails) {
                    rcConfigDetails.style.opacity = this.checked ? '1' : '0.5';
                    const rcInputs = rcConfigDetails.querySelectorAll('select');
                    rcInputs.forEach(input => input.disabled = !this.checked);
                }
            } else {
                // Standard peripheral handling
                const uartSelect = document.getElementById(`${peripheral}-uart-select`);
                if (uartSelect) {
                    uartSelect.disabled = !this.checked;
                }
            }
            
            updatePeripheralConfig();
        });
    });
    
    // RC receiver type change listener
    const rcReceiverType = document.getElementById('rc-receiver-type');
    if (rcReceiverType) {
        rcReceiverType.addEventListener('change', function() {
            updateRcProtocolOptions(this.value);
            updatePeripheralConfig();
        });
    }
    
    // RC protocol and UART listeners
    const rcProtocol = document.getElementById('rc-protocol');
    const rcUartSelect = document.getElementById('rc-uart-select');
    
    if (rcProtocol) {
        rcProtocol.addEventListener('change', updatePeripheralConfig);
    }
    if (rcUartSelect) {
        rcUartSelect.addEventListener('change', updatePeripheralConfig);
    }
    
    // VTX type change listener
    const vtxTypeSelect = document.getElementById('vtx-type-select');
    if (vtxTypeSelect) {
        vtxTypeSelect.addEventListener('change', function() {
            updateVtxProtocolOptions();
            updateHardwareFromForm();
        });
    }
    
    // VTX protocol change listener
    const vtxProtocolSelect = document.getElementById('vtx-protocol-select');
    if (vtxProtocolSelect) {
        vtxProtocolSelect.addEventListener('change', updatePeripheralConfig);
    }
    
    // Other peripheral UART select listeners
    document.querySelectorAll('.peripheral-uart').forEach(select => {
        if (select.id !== 'rc-uart-select') {
            select.addEventListener('change', updatePeripheralConfig);
        }
    });
}

function updatePeripheralConfig() {
    if (!hardwareConfig.peripherals) {
        hardwareConfig.peripherals = {};
    }
    
    // Handle RC receiver separately
    const rcCheckbox = document.getElementById('peripheral-rc-receiver');
    const rcReceiverType = document.getElementById('rc-receiver-type');
    const rcProtocol = document.getElementById('rc-protocol');
    const rcUartSelect = document.getElementById('rc-uart-select');
    
    if (rcCheckbox && rcReceiverType && rcProtocol && rcUartSelect) {
        hardwareConfig.peripherals['rc-receiver'] = {
            enabled: rcCheckbox.checked,
            uart: rcUartSelect.value,
            type: rcReceiverType.value,
            protocol: rcProtocol.value
        };
    }
    
    // Handle other peripherals
    const peripheralTypes = ['gps1', 'gps2', 'vtx', 'esc-telem', 'rangefinder', 'smartport', 'gimbal'];
    
    peripheralTypes.forEach(peripheral => {
        const checkbox = document.getElementById(`peripheral-${peripheral}`);
        const uartSelect = document.getElementById(`${peripheral}-uart-select`);
        
        if (checkbox && uartSelect) {
            if (peripheral === 'vtx') {
                // Special handling for VTX with protocol selection
                const vtxProtocolSelect = document.getElementById('vtx-protocol-select');
                hardwareConfig.peripherals[peripheral] = {
                    enabled: checkbox.checked,
                    uart: uartSelect.value,
                    protocol: vtxProtocolSelect ? vtxProtocolSelect.value : 'displayport'
                };
            } else {
                // Standard peripheral handling
                hardwareConfig.peripherals[peripheral] = {
                    enabled: checkbox.checked,
                    uart: uartSelect.value
                };
            }
        }
    });
    
    updateHardwareSummary();
    updatePeripheralDisplay();
    saveHardwareConfig();
}

function updateHardwareFromForm() {
    hardwareConfig = {
        fc: document.getElementById('fc-input').value.trim(),
        esc: document.getElementById('esc-input').value.trim(),
        receiver: document.getElementById('receiver-input').value.trim(),
        gps1: document.getElementById('gps1-input').value.trim(),
        gps2: document.getElementById('gps2-input').value.trim(),
        motor: document.getElementById('motor-input').value.trim(),
        battery: document.getElementById('battery-input').value,
        frameSize: document.getElementById('frame-size-input').value,
        frameClass: document.getElementById('frame-class-input').value,
        frameType: document.getElementById('frame-type-input').value,
        escProtocol: document.getElementById('esc-protocol-select').value,
        fcOrientation: document.getElementById('fc-orientation-select').value,
        vtxType: document.getElementById('vtx-type-select').value,
        vtxModel: document.getElementById('vtx-model-input').value.trim(),
        notes: document.getElementById('notes-input').value.trim()
    };
    
    updateHardwareSummary();
    saveHardwareConfig();
    
    // Update step content if currently viewing relevant steps
    if (currentStep === 1) {
        updateFrameTypeStep();
    } else if (currentStep === 3) {
        updateFcOrientationStep();
    } else if (currentStep === 4) {
        updateSerialPortStep();
    } else if (currentStep === 5) {
        updateEscStep();
    } else if (currentStep === 6) {
        updateMotorSetupStep(); // Motor Test
    } else if (currentStep === 7) {
        updateMotorSetupStep(); // Motor Order
    }
    
}

function updateFrameTypeOptions() {
    const frameClassSelect = document.getElementById('frame-class-input');
    const frameTypeSelect = document.getElementById('frame-type-input');
    
    if (!frameClassSelect || !frameTypeSelect) {
        console.error('Frame class or frame type select not found');
        return;
    }
    
    const selectedFrameClass = frameClassSelect.value;
    const frameData = frameDatabase[selectedFrameClass];
    
    console.log('Updating frame type options for class:', selectedFrameClass, frameData);
    
    if (!frameData) {
        console.error('Frame data not found for class:', selectedFrameClass);
        return;
    }
    
    // Clear existing options
    frameTypeSelect.innerHTML = '';
    
    // Add new options based on selected frame class
    Object.entries(frameData.frameTypes).forEach(([typeValue, typeData]) => {
        const option = document.createElement('option');
        option.value = typeValue;
        option.textContent = `${typeData.name} (${typeData.motors} motors)`;
        option.title = typeData.description;
        frameTypeSelect.appendChild(option);
    });
    
    console.log('Added', frameTypeSelect.options.length, 'frame type options');
}

function updateHardwareSummary() {
    const summaryContainer = document.getElementById('hardware-summary');
    
    const batteryVoltage = getBatteryVoltage(hardwareConfig.battery);
    const frameInfo = getFrameInfo(hardwareConfig.frameClass, hardwareConfig.frameType);
    
    summaryContainer.innerHTML = `
        <div class="summary-item">
            <span class="summary-label">Flight Controller:</span>
            <span class="summary-value">${hardwareConfig.fc || 'Belum diisi'}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">ESC:</span>
            <span class="summary-value">${hardwareConfig.esc || 'Belum diisi'}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Radio Receiver:</span>
            <span class="summary-value">${hardwareConfig.receiver || 'Belum diisi'}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">GPS 1:</span>
            <span class="summary-value">${hardwareConfig.gps1 || 'Belum diisi'}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">GPS 2:</span>
            <span class="summary-value">${hardwareConfig.gps2 || 'Tidak dipasang'}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Motor:</span>
            <span class="summary-value">${hardwareConfig.motor || 'Belum diisi'}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Baterai:</span>
            <span class="summary-value">${hardwareConfig.battery.toUpperCase()} ${batteryVoltage}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Ukuran Frame:</span>
            <span class="summary-value">${hardwareConfig.frameSize} inch</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Frame Configuration:</span>
            <span class="summary-value">${frameInfo.name} (${frameInfo.motors} motors)</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">ArduPilot Parameters:</span>
            <span class="summary-value">FRAME_CLASS=${hardwareConfig.frameClass}, FRAME_TYPE=${hardwareConfig.frameType}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">ESC Protocol:</span>
            <span class="summary-value">${escProtocols[hardwareConfig.escProtocol]?.name || 'DShot300'}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">FC Orientation:</span>
            <span class="summary-value">${fcOrientations[hardwareConfig.fcOrientation]?.name || 'Normal'} (AHRS_ORIENTATION=${hardwareConfig.fcOrientation || '0'})</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">VTX:</span>
            <span class="summary-value">${vtxTypes[hardwareConfig.vtxType]?.name || 'Belum diisi'} - ${hardwareConfig.vtxModel || ''}</span>
        </div>
        ${hardwareConfig.notes ? `
        <div class="summary-item">
            <span class="summary-label">Catatan:</span>
            <span class="summary-value">${hardwareConfig.notes}</span>
        </div>
        ` : ''}
    `;
}

function getFrameInfo(frameClass, frameType) {
    const frameData = frameDatabase[frameClass];
    if (!frameData || !frameData.frameTypes[frameType]) {
        return { name: 'Unknown Frame', motors: 0 };
    }
    
    return {
        name: frameData.frameTypes[frameType].name,
        motors: frameData.frameTypes[frameType].motors,
        description: frameData.frameTypes[frameType].description
    };
}

function getBatteryVoltage(batteryType) {
    const voltages = {
        '3s': '(11.1V - 12.6V)',
        '4s': '(14.8V - 16.8V)',
        '5s': '(18.5V - 21V)',
        '6s': '(22.2V - 25.2V)'
    };
    return voltages[batteryType] || '';
}

function saveHardwareConfig() {
    localStorage.setItem('ardupilot-hardware-config', JSON.stringify(hardwareConfig));
}

function exportConfiguration() {
    const exportData = {
        hardwareConfig: hardwareConfig,
        stepChecks: stepChecks,
        currentStep: currentStep,
        metadata: {
            exportDate: new Date().toISOString(),
            version: '2.0',
            guideVersion: 'Nazgul ArduPilot v2.0'
        }
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const filename = `ardupilot-config-${hardwareConfig.fc ? hardwareConfig.fc.replace(/\s+/g, '-').toLowerCase() : 'drone'}-${new Date().toISOString().split('T')[0]}.json`;
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = filename;
    link.click();
    
    // Show success message
    showExportSuccess();
}

function importConfiguration(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importData = JSON.parse(e.target.result);
            showImportDialog(importData);
        } catch (error) {
            alert('File JSON tidak valid atau rusak.');
            console.error('Import error:', error);
        }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
}

function showImportDialog(importData) {
    const dialog = document.createElement('div');
    dialog.className = 'import-dialog';
    
    const metadata = importData.metadata || {};
    const hardwarePreview = importData.hardwareConfig || {};
    const stepPreview = importData.stepChecks || {};
    const completedSteps = Object.values(stepPreview).filter(Boolean).length;
    
    dialog.innerHTML = `
        <div class="import-dialog-content">
            <h3>📥 Import Konfigurasi</h3>
            <div class="import-preview">
                <strong>Informasi File:</strong><br>
                Tanggal Export: ${metadata.exportDate ? new Date(metadata.exportDate).toLocaleString('id-ID') : 'Tidak diketahui'}<br>
                Versi: ${metadata.version || 'Unknown'}<br>
                <br>
                <strong>Hardware:</strong><br>
                FC: ${hardwarePreview.fc || 'Tidak diisi'}<br>
                ESC: ${hardwarePreview.esc || 'Tidak diisi'}<br>
                Baterai: ${hardwarePreview.battery || 'Tidak diisi'}<br>
                Frame: ${hardwarePreview.frameSize || 'Tidak diisi'}<br>
                <br>
                <strong>Progress:</strong> ${completedSteps}/${totalSteps - 1} langkah selesai
            </div>
            <div class="import-actions">
                <button class="btn-cancel" onclick="closeImportDialog()">Batal</button>
                <button class="btn-primary" onclick="confirmImport(${JSON.stringify(importData).replace(/"/g, '&quot;')})">Import</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
}

function confirmImport(importData) {
    try {
        // Import hardware config
        if (importData.hardwareConfig) {
            Object.assign(hardwareConfig, importData.hardwareConfig);
            populateHardwareForm();
            updateHardwareSummary();
            saveHardwareConfig();
        }
        
        // Import progress
        if (importData.stepChecks) {
            Object.assign(stepChecks, importData.stepChecks);
            
            // Update checkboxes
            Object.keys(stepChecks).forEach(stepNumber => {
                const checkbox = document.querySelector(`input[data-step="${stepNumber}"]`);
                if (checkbox) {
                    checkbox.checked = stepChecks[stepNumber];
                }
            });
        }
        
        // Import current step
        if (importData.currentStep !== undefined) {
            currentStep = importData.currentStep;
        }
        
        // Update UI
        showStep(currentStep);
        updateProgress();
        updateStepIndicators();
        saveProgress();
        
        closeImportDialog();
        showImportSuccess();
        
    } catch (error) {
        console.error('Import error:', error);
        alert('Error saat import konfigurasi.');
    }
}

function closeImportDialog() {
    const dialog = document.querySelector('.import-dialog');
    if (dialog) {
        dialog.remove();
    }
}

function resetHardwareConfig() {
    if (confirm('Reset konfigurasi hardware ke default?')) {
        // Reset to defaults
        hardwareConfig = {
            fc: 'SpeedyBee F405 V4',
            esc: 'SpeedyBee BLS 55A (DShot300)',
            receiver: 'Matek RP4TD',
            gps1: 'MicoAir M10G-5883',
            gps2: '',
            motor: 'Emax Eco II 1750KV',
            battery: '6s',
            frameSize: '5',
            frameClass: '1', // Quad
            frameType: '18', // Quad X (BF Reversed) - prop-out
            vtxType: 'walksnail',
            vtxModel: 'Avatar Mini',
            notes: '',
            // Peripheral configuration
            peripherals: {
                gps1: { enabled: true, uart: 'UART6' },
                gps2: { enabled: false, uart: 'UART5' },
                vtx: { enabled: true, uart: 'UART1', protocol: 'displayport' },
                'rc-receiver': { 
                    enabled: true, 
                    uart: 'UART2',
                    type: 'expresslrs',
                    protocol: 'mavlink'
                },
                'esc-telem': { enabled: true, uart: 'UART5' },
                rangefinder: { enabled: false, uart: 'UART3' },
                smartport: { enabled: false, uart: 'UART4' },
                gimbal: { enabled: false, uart: 'UART3' }
            }
        };
        
        populateHardwareForm();
        updateHardwareSummary();
        saveHardwareConfig();
        
        showResetSuccess();
    }
}

function resetAllSettings() {
    const confirmMessage = `⚠️ RESET ALL SETTINGS

Ini akan menghapus SEMUA data:
• Konfigurasi hardware
• Progress langkah-langkah  
• Peripheral settings
• Semua checkbox yang sudah dicentang

Anda akan kembali ke awal panduan.

Lanjutkan reset?`;

    if (confirm(confirmMessage)) {
        // Clear all localStorage
        localStorage.removeItem('ardupilot-hardware-config');
        localStorage.removeItem('ardupilot-guide-progress');
        
        // Reset hardware config to defaults
        hardwareConfig = {
            fc: 'SpeedyBee F405 V4',
            esc: 'SpeedyBee BLS 55A (DShot300)',
            receiver: 'Matek RP4TD',
            gps1: 'MicoAir M10G-5883',
            gps2: '',
            motor: 'Emax Eco II 1750KV',
            battery: '6s',
            frameSize: '5',
            frameClass: '1', // Quad
            frameType: '18', // Quad X (BF Reversed) - prop-out
            escProtocol: 'dshot300', // ESC Protocol
            fcOrientation: '0', // FC Orientation (Normal)
            vtxType: 'walksnail',
            vtxModel: 'Avatar Mini',
            notes: '',
            // Peripheral configuration
            peripherals: {
                gps1: { enabled: true, uart: 'UART6' },
                gps2: { enabled: false, uart: 'UART5' },
                vtx: { enabled: true, uart: 'UART1', protocol: 'displayport' },
                'rc-receiver': { 
                    enabled: true, 
                    uart: 'UART2',
                    type: 'expresslrs',
                    protocol: 'mavlink'
                },
                'esc-telem': { enabled: true, uart: 'UART5' },
                rangefinder: { enabled: false, uart: 'UART3' },
                smartport: { enabled: false, uart: 'UART4' },
                gimbal: { enabled: false, uart: 'UART3' }
            }
        };
        
        // Reset step progress
        stepChecks = {};
        currentStep = 0;
        
        // Reset all form elements
        populateHardwareForm();
        updateHardwareSummary();
        
        // Reset all step checkboxes
        const checkboxes = document.querySelectorAll('.step-check');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Reset motor test checkboxes
        const motorCheckboxes = document.querySelectorAll('.motor-item-check');
        motorCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Go back to step 0 (hardware config)
        showStep(0);
        
        // Update navigation
        updateNavigationButtons();
        updateStepIndicators();
        
        // Show success message
        showResetAllSuccess();
    }
}

function showResetAllSuccess() {
    const message = document.createElement('div');
    message.className = 'reset-all-success';
    message.innerHTML = '🗑️ Semua settings berhasil direset! Anda kembali ke awal panduan.';
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc3545;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
        z-index: 1000;
        font-weight: 500;
        max-width: 300px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.style.animation = 'slideOutRight 0.3s ease-in forwards';
        setTimeout(() => {
            if (document.body.contains(message)) {
                document.body.removeChild(message);
            }
        }, 300);
    }, 3000);
}

function showExportSuccess() {
    const message = document.createElement('div');
    message.className = 'export-success';
    message.innerHTML = '✅ Konfigurasi berhasil di-export!';
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 3000);
}

function showImportSuccess() {
    const message = document.createElement('div');
    message.className = 'export-success';
    message.innerHTML = '✅ Konfigurasi berhasil di-import!';
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 3000);
}

function showResetSuccess() {
    const message = document.createElement('div');
    message.className = 'export-success';
    message.innerHTML = '✅ Konfigurasi di-reset ke default!';
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 3000);
}

// Update the existing save/load functions to include hardware config
function saveProgress() {
    const progressData = {
        currentStep: currentStep,
        stepChecks: stepChecks,
        hardwareConfig: hardwareConfig
    };
    localStorage.setItem('ardupilot-guide-progress', JSON.stringify(progressData));
}

function loadSavedProgress() {
    const savedProgress = localStorage.getItem('ardupilot-guide-progress');
    if (savedProgress) {
        try {
            const progressData = JSON.parse(savedProgress);
            currentStep = progressData.currentStep || 0;
            Object.assign(stepChecks, progressData.stepChecks || {});
            
            if (progressData.hardwareConfig) {
                Object.assign(hardwareConfig, progressData.hardwareConfig);
            }
            
            // Update checkboxes
            Object.keys(stepChecks).forEach(stepNumber => {
                const checkbox = document.querySelector(`input[data-step="${stepNumber}"]`);
                if (checkbox) {
                    checkbox.checked = stepChecks[stepNumber];
                }
            });
            
            showStep(currentStep);
            updateProgress();
        } catch (error) {
            console.error('Error loading saved progress:', error);
        }
    }
}

console.log('🚁 ArduPilot Interactive Guide loaded successfully!');
console.log('Use window.debugGuide for debugging functions');
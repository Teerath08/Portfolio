import type { HardwareComponent } from "./types";

/**
 * "Beyond the screen" — the parts that live on the bench.
 *
 * Every component here is either named in the original site copy (Arduino,
 * ultrasonic / IR / IMU sensors, DC / servo / stepper motors, embedded C) or in
 * the owner's own list of hardware they work with (ESP32, breadboards,
 * passives, IoT). The `x` / `y` values are the pad positions on the board
 * illustration, as a percentage of the board box, so the layout is pure data
 * and can be rearranged without touching the SVG.
 */
export const hardwareComponents: HardwareComponent[] = [
  {
    id: "esp32",
    label: "ESP32",
    caption: "Wi-Fi + BT MCU",
    x: 24,
    y: 26,
    accent: "cyan",
    category: "compute",
    specs: [
      { label: "Core", value: "Dual-core Xtensa LX6" },
      { label: "Wireless", value: "Wi-Fi 802.11 b/g/n + Bluetooth" },
      { label: "IO", value: "ADC, DAC, PWM, I²C, SPI, UART" },
    ],
    note: "The board I reach for when a project should be able to talk to the internet without another module in the way.",
  },
  {
    id: "arduino-uno",
    label: "Arduino Uno",
    caption: "ATmega328P",
    x: 62,
    y: 20,
    accent: "sky",
    category: "compute",
    specs: [
      { label: "MCU", value: "ATmega328P, 8-bit AVR" },
      { label: "Clock", value: "16 MHz" },
      { label: "Why still", value: "Simple, and the examples actually work" },
    ],
    note: "First board I learned on. Still the fastest way to prove a sensor is wired correctly before anything clever happens.",
  },
  {
    id: "microproc-kit",
    label: "8085 / 8086 kit",
    caption: "Microprocessor",
    x: 88,
    y: 42,
    accent: "violet",
    category: "compute",
    specs: [
      { label: "Bus", value: "Address, data and control lines" },
      { label: "Work", value: "ALP programs, timing diagrams" },
      { label: "Interfacing", value: "Memory and I/O with 8255 / 8275" },
    ],
    note: "Where the architecture stops being a diagram and starts being real. Interrupts behave differently when you can watch the bus.",
  },
  {
    id: "ultrasonic",
    label: "HC-SR04",
    caption: "Ultrasonic",
    x: 13,
    y: 46,
    accent: "cyan",
    category: "sense",
    specs: [
      { label: "Range", value: "Roughly 2 cm – 400 cm" },
      { label: "Signal", value: "Echo pulse width = distance" },
      { label: "Catch", value: "Soft angled surfaces lie to you" },
    ],
    note: "Every distance reading needs calibration. The sensor is consistent; the room is not.",
  },
  {
    id: "ir-sensor",
    label: "IR proximity",
    caption: "Reflective / IR",
    x: 32,
    y: 64,
    accent: "sky",
    category: "sense",
    specs: [
      { label: "Type", value: "Reflective and obstacle-avoidance" },
      { label: "Output", value: "Digital threshold" },
      { label: "Use", value: "Line following, edge detection" },
    ],
    note: "Cheap, fast, and completely dependent on a threshold you have to tune against the actual surface.",
  },
  {
    id: "imu",
    label: "IMU",
    caption: "MPU6050",
    x: 52,
    y: 46,
    accent: "violet",
    category: "sense",
    specs: [
      { label: "On chip", value: "3-axis accelerometer + gyro" },
      { label: "Bus", value: "I²C" },
      { label: "Gotcha", value: "Raw gyro data drifts; filter it" },
    ],
    note: "Gives you orientation, and with it a new respect for how quickly unfiltered sensor data turns into nonsense.",
  },
  {
    id: "actuators",
    label: "Motors & actuators",
    caption: "DC · Servo · Stepper",
    x: 72,
    y: 70,
    accent: "amber",
    category: "actuate",
    specs: [
      { label: "DC", value: "Speed from PWM, direction from H-bridge" },
      { label: "Servo", value: "Position from pulse width" },
      { label: "Stepper", value: "Open-loop, and it holds its position" },
    ],
    note: "Where the code meets something that can actually push back.",
  },
  {
    id: "wireless",
    label: "Wi-Fi / Bluetooth",
    caption: "Built into the ESP32",
    x: 90,
    y: 76,
    accent: "cyan",
    category: "connect",
    specs: [
      { label: "Transport", value: "TCP, UDP, HTTP, MQTT" },
      { label: "Trade-off", value: "Range and battery life" },
      { label: "Pattern", value: "Read locally, publish sparingly" },
    ],
    note: "Anything connected is also a device that can be unreachable. Design for the offline case and the connected case stops being special.",
  },
  {
    id: "bench",
    label: "Breadboard & passives",
    caption: "Resistors · LEDs · jumpers",
    x: 28,
    y: 84,
    accent: "sky",
    category: "bench",
    specs: [
      { label: "Before", value: "Breadboard, every time" },
      { label: "Always", value: "Current-limiting resistors on LEDs" },
      { label: "Then", value: "Perfboard, and eventually a PCB" },
    ],
    note: "Half of debugging is finding the jumper that is one row off.",
  },
];

/** Grouped for the mobile fallback, which lists the parts instead of drawing them. */
export const hardwareCategories = [
  { id: "compute", label: "Compute" },
  { id: "sense", label: "Sensing" },
  { id: "actuate", label: "Actuation" },
  { id: "connect", label: "Connectivity" },
  { id: "bench", label: "Bench" },
] as const;

export type HardwareCategoryId = (typeof hardwareCategories)[number]["id"];
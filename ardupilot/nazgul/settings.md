# Setting Ardupilot #

Spesifikasi : 

* FC : SpeedyBee F405 V4 
* ESC : SpeedyBee BLS 55A
* [Product Website](https://www.speedybee.com/speedybee-f405-v4-bls-55a-30x30-fc-esc-stack/)
* [User Manual](https://store-fhxxhuiq8q.mybigcommerce.com/product_images/img_SpeedyBee_F405_V4_Stack/SpeedyBee_F405_V4_Stack_Manual_EN.pdf)

## Peripherals ##

* Matek RP4TD : UART2
* GPS HGLRC (no compass) : UART6 

## Settings ##

1. Set Frame Type

    * Jumlah Motor : 4
    * Type : X

2. Set Serial Port

    * UART2 : 460800 - MavLink2
    * UART5 : 115200 - ESC Telemetry
    * UART6 : 115200 - GPS

3. Set Flight Modes

    * 1 : Stabilize
    * 2 : Acro
    * 3 : RTL
    * 4 : PosHold
    * 5 : Auto (Mission) / AutoTune
    * 6 : Loiter

4. Set Flight Mode Channel (Channel 7)

    * FLTMODE_CH = 7

4. Set ESC Mode

    * ESC Type : DShot300

5. Motor Ordering (ESC depan ke belakang)
   
   * Servo 1 : Motor 3
   * Servo 2 : Motor 2
   * Servo 3 : Motor 1
   * Servo 4 : Motor 4

6. MavLink via ELRS Connection
   
    * RSSI_TYPE = 5

7. Set Arming Channel (Channel 5 / AUX 1)

    * RC5_OPTION : 5
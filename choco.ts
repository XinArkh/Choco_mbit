//chocobit


namespace Choco {
    const PCA9685_ADD = 0x41
    const MODE1 = 0x00
    const PRESCALE = 0xFE
    const LED0_ON_L = 0x06
    let initialized = false


    export enum enPos {

        //% blockId="LeftState" block="×ó±ß×´Ì¬"
        LeftState = 0,
        //% blockId="RightState" block="ÓÒ±ß×´Ì¬"
        RightState = 1
    }

    export enum enLineState {
        //% blockId="White" block="°×Ïß"
        White = 0,
        //% blockId="Black" block="ºÚÏß"
        Black = 1

    }


    function i2cwrite(addr: number, reg: number, value: number) {
        let buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = value
        pins.i2cWriteBuffer(addr, buf)
    }


    function i2cread(addr: number, reg: number) {
        pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8BE);
        let val = pins.i2cReadNumber(addr, NumberFormat.UInt8BE);
        return val;
    }


    function initPCA9685(): void {
        i2cwrite(PCA9685_ADD, MODE1, 0x00)
        setFreq(50);
        initialized = true
    }


    function setFreq(freq: number): void {
        // Constrain the frequency
        let prescaleval = 25000000;
        prescaleval /= 4096;
        prescaleval /= freq;
        prescaleval -= 1;
        let prescale = prescaleval; //Math.Floor(prescaleval + 0.5);
        let oldmode = i2cread(PCA9685_ADD, MODE1);
        let newmode = (oldmode & 0x7F) | 0x10; // sleep
        i2cwrite(PCA9685_ADD, MODE1, newmode); // go to sleep
        i2cwrite(PCA9685_ADD, PRESCALE, prescale); // set the prescaler
        i2cwrite(PCA9685_ADD, MODE1, oldmode);
        control.waitMicros(5000);
        i2cwrite(PCA9685_ADD, MODE1, oldmode | 0xa1);
    }


    function setPwm(channel: number, on: number, off: number): void {
        if (channel < 0 || channel > 15)
            return;
        if (!initialized) {
            initPCA9685();
        }
        let buf = pins.createBuffer(5);
        buf[0] = LED0_ON_L + 4 * channel;
        buf[1] = on & 0xff;
        buf[2] = (on >> 8) & 0xff;
        buf[3] = off & 0xff;
        buf[4] = (off >> 8) & 0xff;
        pins.i2cWriteBuffer(PCA9685_ADD, buf);
    }


    //% test block
    export function fib(value: number): number {
        return value <= 1 ? value : fib(value - 1) + fib(value - 2);
    }


    //% blockId=mbit_Ultrasonic block="Ultrasonic"
    //% color="#87CEEB"
    //% weight=100
    //% blockGap=10
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function Ultrasonic( ): number {
        // set pins
        let Trig = DigitalPin.P10;
        let Echo = DigitalPin.P3;

        // send pulse
        pins.setPull(Trig, PinPullMode.PullNone);
        pins.digitalWritePin(Trig, 0);
        control.waitMicros(2);
        pins.digitalWritePin(Trig, 1);
        control.waitMicros(15);
        pins.digitalWritePin(Trig, 0);

        // read pulse
        let d = pins.pulseIn(Echo, PulseValue.High, 43200);
        return d / 58;  // return distance(cm)
    }


    //% blockId=mbit_Line_Sensor block="Line_Sensor|direct %direct|lineColor %value"
    //% weight=94
    //% blockGap=10
    //% color="#006400"
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=12
    export function Line_Sensor(direct: enPos, value: enLineState): boolean {
        let LeftPin = AnalogPin.P2;
        let RightPin = AnalogPin.P1;

        let temp: boolean = false;

        switch (direct) {
            case enPos.LeftState: {
                if (pins.analogReadPin(LeftPin) < 500) {
                    if (value == enLineState.White) {
                        temp = true;
                    }
                    setPwm(7, 0, 4095);
                }
                else {
                    if (value == enLineState.Black) {
                        temp = true;
                    }
                    setPwm(7, 0, 0);
                }
                break;
            }

            case enPos.RightState: {
                if (pins.analogReadPin(RightPin) < 500) {
                    if (value == enLineState.White) {
                        temp = true;
                    }
                    setPwm(6, 0, 4095);
                }
                else {
                    if (value == enLineState.Black) {
                        temp = true;
                    }
                    setPwm(6, 0, 0);
                }
                break;
            }
        }
        return temp;

    }
}
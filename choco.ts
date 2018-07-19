//chocobit


namespace Choco {
    //% block
    export function fib(value: number): number {
        return value <= 1 ? value : fib(value - 1) + fib(value - 2);
    }


    //% blockId=mbit_ultrasonic block="Ultrasonic"
    //% color="#87CEEB"
    //% weight=100
    //% blockGap=10
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function Ultrasonic( ): number {
        // set pins
        var Trig = DigitalPin.P10;
        var Echo = DigitalPin.P3;

        // send pulse
        pins.setPull(Trig, PinPullMode.PullNone);
        pins.digitalWritePin(Trig, 0);
        control.waitMicros(2);
        pins.digitalWritePin(Trig, 1);
        control.waitMicros(15);
        pins.digitalWritePin(Trig, 0);

        // read pulse
        let d = pins.pulseIn(Echo, PulseValue.High, 23200);
        return d / 58;
    }
}
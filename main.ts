/**
 * 04_UltrasonicProgram_v1
 * 
 * マイコンロボット向け　超音波センサー用プログラム
 * 
 * This is the ultrasonic sensor program for the Tamiya Microcomputer Robot.
 */
// 超音波センサーを使う
// (超音波の反射時間から障害物までの距離を計算する)
// Uses Ultrasonic Sensor
// (calculates distance to obstacle from time taken for signal to reflect.)
//     
function ULTRASONIC1 () {
    // 超音波センサーを選択する
    // Selects Ultrasonic Sensor.
    //         
    address = 44
    // センサー回路と通信する
    // Communicates with sensor circuit.
    //             
    I2C()
    // 超音波センサーのデータを補正する
    // Revises Ultrasonic Sensor data
    //                 
    // 超音波センサーのデータが0~1000mmなら
    // If Ultrasonic Sensor data is between 0 and 1,000mm
    //                     
    if (0 <= length && length <= 1000) {
        // 超音波センサーのデータを四捨五入する
        // Rounds up/down Ultrasonic Sensor data.
        //                     
        RangeL = Math.round(length)
    } else {
        // 超音波センサーのデータを0にリセットする
        // Resets Ultrasonic Sensor data to 0.
        //                     
        RangeL = 0
    }
}
// センサー回路と通信する
// Communicates with sensor circuit.
//     
function I2C () {
    // データをリセットする
    // Resets data.
    //         
    DataL = 0
    // データをリセットする
    // Resets data.
    //             
    DataH = 0
    // 通信開始時刻を保存する
    // Records data start time.
    //                 
    SonicTime = input.runningTime()
    // データを取得する　または　50ミリ秒以上経過するまで
    // 通信を繰り返す
    // Keeps communication open while data is received or until 50 milliseconds have passed.
    //                     
    while (DataH == 0 && DataL == 0 && input.runningTime() - SonicTime < 50) {
        // 超音波センサーに使用開始の指示を出す
        // Sends start command to Ultrasonic Sensor.
        //                         
        pins.i2cWriteNumber(
        address,
        51,
        NumberFormat.UInt8BE,
        false
        )
        // 応答データを取得する
        // Receives data response.
        //                             
        buff = pins.i2cReadNumber(address, NumberFormat.UInt8BE, false)
        // 応答データが1なら
        // If data response is 1...
        //                                     
        if (buff == 1) {
            basic.pause(6)
            // 確認用データを送るように指示を出す
            // Requests confirmation data.
            //                                         
            pins.i2cWriteNumber(
            address,
            16,
            NumberFormat.UInt8BE,
            false
            )
            // 確認用データを取得する
            // Receives confirmation data.
            //                                             
            buff = pins.i2cReadNumber(address, NumberFormat.UInt8BE, false)
            basic.pause(1)
            // 反射時間(上位桁)を送るように指示を出す
            // Requests time taken (top section of the value) for signal to reflect.
            //                                                     
            pins.i2cWriteNumber(
            address,
            15,
            NumberFormat.UInt8BE,
            false
            )
            // 反射時間(上位桁)を取得する
            // Receives data on time taken for signal to reflect.
            //                                                         
            DataH = pins.i2cReadNumber(address, NumberFormat.UInt8BE, false)
            basic.pause(1)
            // 反射時間(下位桁)を送るように指示を出す
            // Requests time taken (bottom section of the value) for signal to reflect.
            //                                                                 
            pins.i2cWriteNumber(
            address,
            14,
            NumberFormat.UInt8BE,
            false
            )
            // 反射時間(下位桁)を取得する
            // Receives data on time taken for signal to reflect.
            //                                                                     
            DataL = pins.i2cReadNumber(address, NumberFormat.UInt8BE, false)
            // 取得したデータが間違っているなら
            // If received data is false...
            //                                                                             
            if (buff != Math.constrain(DataH + DataL, 0, 255)) {
                // データをリセットする
                // Resets data.
                //                                                                             
                DataH = 0
                // データをリセットする
                // Resets data.
                //                                                                                 
                DataL = 0
            }
        }
    }
    // 反射時間から反射距離を計算する
    // Calculates distance to obstacle from time taken for signal to reflect.
    //                         
    length = (DataH * 256 + DataL - 160) / 2 * 0.315
}
// プログラムが動き出したときに一度だけ行う
// Runs once when the program starts.
//     
let sound = 0
let buff = 0
let SonicTime = 0
let DataH = 0
let DataL = 0
let RangeL = 0
let length = 0
let address = 0
// 音の初期設定
// Initial sound setting
//         
pins.analogSetPitchPin(AnalogPin.P8)
music.startMelody(music.builtInMelody(Melodies.BaDing), MelodyOptions.Once)
basic.showIcon(IconNames.SmallSquare)
basic.showIcon(IconNames.Square)
basic.pause(100)
// P04を表示する(プログラムNo.4)
// Shows P04 (Program no.4)
//                             
basic.showString("P04")
basic.pause(500)
basic.clearScreen()
// 繰り返し行う
// Block repeats continuously.
//     
basic.forever(function () {
    // 超音波センサーを使う
    // Runs Ultrasonic Sensor.
    //         
    ULTRASONIC1()
    led.plotBarGraph(
    RangeL,
    500
    )
    // 超音波センサーのデータ(20～500)を音程(131～988)に変換する
    // Convert ultrasonic sensor data (20～500) to pitch (131～988).
    //                     
    sound = Math.map(RangeL, 20, 500, 131, 988)
    music.playTone(sound, music.beat(BeatFraction.Quarter))
})

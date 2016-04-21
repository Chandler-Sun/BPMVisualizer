/**
 * Created by blake on 4/20/16.
 */
//var baseSpeed = 1.5e-3;
var baseSpeed = 0;
var max = 0;
var min = 0;
var frequencyData = 0;
var timeDomainData = 0;

var socket = io()
var username = "测试" + new Date().getTime()
socket.emit('web joined', username)
//监听

//只有一个数组内的长度达到一定数目,才会去变化
var accLength = 10
var freArray = []
var initIndex = 255 / 10
var index = 0
//返回一个递增递减数 12345678987654321234 sin
function updateFrequencyData() {
    frequencyData = Math.sin((index++) / 3) * 128 + 128
}

socket.on('acc', function (data) {
    console.log("acc data:" + data.d)
    //updateFrequencyData()
    var number = Number(data.d)
    max = Number(data.d) > max ? Number(data.d) : max
    min = Number(data.d) < min ? Number(data.d) : min
    if (number > -2.5 && number < 2.5) {
        frequencyData = (number + 2.5) * 51
    } else {
        frequencyData = 0
    }
    console.log(frequencyData)
})

var SpeedScale = {
    max: 0.01,
    min: 0.001
}
socket.on('bpm', function (data) {
    console.log("bpm data:" + data.d)
    var bpm = Math.abs(Number(data.d))
    var x = ((bpm - 140) / (190 - 140)) / 100
    if (x == 0) {
        baseSpeed = SpeedScale.min
    } else {
        baseSpeed = x
    }
    console.log("speed:" + baseSpeed)
    //console.log("bpm data:" + data.d)
    //var d = parseInt(data.d) % 11
    ////if(d==)
    //baseSpeed = d / 1000
    $(".bpmNumber").text(Math.floor(data.d))
})

socket.on('reject', function (data) {
    alert("房间已满")
})

socket.on('user left', function () {
    baseSpeed = 0;
    frequencyData = 0;
})
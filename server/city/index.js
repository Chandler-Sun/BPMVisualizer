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
socket.on('acc', function (data) {
    max = Number(data.d) > max ? Number(data.d) : max
    min = Number(data.d) < min ? Number(data.d) : min
    frequencyData = data.d * 30
})

var SpeedScale = {
    max: 0.01,
    min: 0.001
}
socket.on('bpm', function (data) {
    /*var bpm = Math.abs(Number(data.d))
     var x = ((bpm - 140) / (190 - 140)) / 100
     if (x == 0) {
     baseSpeed = SpeedScale.min
     } else {
     baseSpeed = x
     }*/
    var d = parseInt(data.d) % 11
    //if(d==)
    baseSpeed = d / 1000
    $(".bpmNumber").text(d)
    console.log("bpm:" + baseSpeed)
})

socket.on('reject', function (data) {
    alert("房间已满")
})

socket.on('user left', function () {
    baseSpeed = 0;
    frequencyData = 0;
})
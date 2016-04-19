var socket = io()

//监听

var BUFFER_LENGTH = 512;
var theTimeByteData = [];
var theFreqByteData = [];

var msgCount = 0;

for (var i = BUFFER_LENGTH; i >= 0; i--) {
	theTimeByteData.push(0);
	theFreqByteData.push(0);
};

socket.on('broadcast', function (data) {
    console.log("broadcast:")
    console.log(data)
})

socket.on('acc', function (data) {
    theTimeByteData.push(Math.abs(data.d)*2);
    msgCount = msgCount+1
    console.log('msgCount:',msgCount)
    $("#acc").text(data.d)
    theTimeByteData.shift(1);
})

socket.on('bpm', function (data) {
    msgCount = msgCount+1
    console.log('msgCount:',msgCount)
    $("#bpm").text(data.d)
})

socket.on('steps', function (data) {
    msgCount = msgCount+1
    console.log('msgCount:',msgCount)
    $("#steps").text(data.d)
})

socket.on('user joined', function (data) {
    $("#username").text(data.username)
})

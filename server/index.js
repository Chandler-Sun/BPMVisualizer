/**
 * Created by blake on 4/14/16.
 */
'use strict'

let app = require('koa')()
var serve = require('koa-static')
let server = require('http').createServer(app.callback())
let io = require('socket.io')(server)

let port = process.env.PORT || 3000

app.use(serve(__dirname + '/static'))

var onlineUsers = []
var numUsers = 0
var msgCount = 0

io.on('connection', socket=> {

    console.log('connected')
    var addedUser = false;

    socket.on("user joined", (username)=> {
        console.log("收到用户注册信息:" + username)
        if (addedUser) return;
        socket.username = username
        numUsers = numUsers + 1
        addedUser = true
        socket.broadcast.emit('user joined', {
            username:socket.username,
            numUsers:numUsers
        })
    })

    socket.on("send acc", (data)=> {
        msgCount = msgCount+1
        console.log('msgCount:',msgCount)
        socket.broadcast.emit('acc', {
            username:socket.username,
            d:data
        })
    })

    socket.on('send bpm', data=> {
        msgCount = msgCount+1
        console.log('msgCount:',msgCount)
        socket.broadcast.emit('bpm', {
            username:socket.username,
            d:data
        })
    })

    socket.on("send step", (data)=> {
        msgCount = msgCount+1
        console.log('msgCount:',msgCount)
        socket.broadcast.emit('steps', {
            username:socket.username,
            d:data
        })
    })

    socket.on('disconnect', function () {
        console.log("disconnect",socket.username)
        if (addedUser) {
            numUsers = numUsers - 1
            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        }
  });
})

server.listen(port, function () {
    console.log('Server listening at port %d', port);
});

var bonjour = require('bonjour')()

// advertise an HTTP server on port 3000
var theService = bonjour.publish({ name: 'BPM Center', type: 'http', port: port })


var livereload = require('livereload');
var liveserver = livereload.createServer();
liveserver.watch(__dirname + "/static");



/**
 * Created by blake on 4/14/16.
 */
'use strict'

let app = require('koa')()
var serve = require('lb-koa-static')
let server = require('http').createServer(app.callback())
let io = require('socket.io')(server)

let port = process.env.PORT || 3000

app.use(serve('city', {
    prefix: 'city'
}))


app.use(serve(__dirname + '/static'))

var onlineUsers = []
var numUsers = 0
var msgCount = 0

//就目前来说,只保存三个socket
let userCount = 3

function Sockets(userCount, type) {
    this.sockets = {}
    for (let i = 1; i < userCount + 1; i++) {
        this.sockets[i] = null
    }
    this.type = type
}

Sockets.prototype.addToSockets = function (socket) {
    for (let key in this.sockets) {
        if (this.sockets.hasOwnProperty(key)) {
            if (!this.sockets[key]) {
                socket['number'] = key
                this.sockets[key] = socket
                return key
            }
        }
    }
    return false
}

Sockets.prototype.removeUser = function (num) {
    if (this.sockets[num]) {
        this.sockets[num] = null
    }
}

Sockets.prototype.getUsers = function () {
    return Object.keys(this.sockets).filter(item=> {
        return !!this.sockets[item]
    }).map(item=> {
        return this.sockets[item].username
    })
}

Sockets.prototype.emit = function (evt, arg) {
    Object.keys(this.sockets).forEach(item=> {
        if (this.sockets[item]) {
            this.sockets[item].emit(evt, arg)
        }
    })
}
//手机端
var sockets = new Sockets(userCount, 'mobile')
//网页端
var websockets = new Sockets(userCount, 'web')

console.log(sockets)


io.on('connection', socket=> {

    console.log('connected')
    var addedUser = false;
    var addWebUser = false

    socket.on("mobile joined", (username)=> {
        console.log("收到用户注册信息:" + username)
        socket.username = username || "跑调步行者"
        socket["type"] = "mobile"
        let number = sockets.addToSockets(socket)
        if (!number) {
            console.log("房间已满")
            socket.emit('reject', "房间已满")
            socket.disconnect(true)
            return;
        }
        socket["number"] = number
        websockets.emit('new users', {
            usernames: sockets.getUsers()
        })
        websockets.sockets[number] && websockets.sockets[number].emit("current user", username)
    })

    socket.on("web joined", (username)=> {
        console.log("收到网页注册信息:" + username)
        socket.username = username || "跑调步行者"
        socket["type"] = "web"
        let number = websockets.addToSockets(socket)
        if (!number) {
            console.log("房间已满")
            socket.emit('reject', "房间已满")
            socket.disconnect(true)
            return;
        }
        socket["number"] = number
    })

    socket.on("change name", (data)=> {
        if (sockets.sockets[socket.number]) {
            sockets.sockets[socket.number].username = data
            websockets.emit('new users', {
                usernames: sockets.getUsers()
            })
            websockets.sockets[socket.number] && websockets.sockets[socket.number].emit('current user', data)
            socket.emit('change name success')
        }
    })

    socket.on("send acc", (data)=> {
        msgCount = msgCount + 1
        console.log('msgCount:', msgCount)
        websockets.sockets[socket.number] && websockets.sockets[socket.number].emit('acc', {
            username: socket.username,
            d: data
        })
    })

    socket.on('send bpm', data=> {
        //msgCount = msgCount + 1
        //console.log('msgCount:', msgCount)
        websockets.sockets[socket.number] && websockets.sockets[socket.number].emit('bpm', {
            username: socket.username,
            d: data
        })
    })

    socket.on("send step", (data)=> {
        //msgCount = msgCount + 1
        //console.log('msgCount:', msgCount)
        websockets.sockets[socket.number] && websockets.sockets[socket.number].emit('step', {
            username: socket.username,
            d: data
        })
    })

    socket.on('disconnect', function () {
        console.log("disconnect", socket.username)
        //socket.broadcast.emit('user left', {
        //    username: socket.username,
        //    numUsers: socket.number
        //});
        websockets.sockets[socket.number] && websockets.sockets[socket.number].emit('user left')
        if (socket.type && socket.type === 'mobile')
            sockets.removeUser(socket.number)
        else if (socket.type && socket.type === 'web') {
            websockets.removeUser(socket.number)
        }
    });
})

server.listen(port, function () {
    console.log('Server listening at port %d', port, new Date());
});

var bonjour = require('bonjour')()

// advertise an HTTP server on port 3000
var theService = bonjour.publish({name: 'BPM Center Blake', type: 'http', port: port})


var livereload = require('livereload');
var liveserver = livereload.createServer();
liveserver.watch(__dirname + "/static");



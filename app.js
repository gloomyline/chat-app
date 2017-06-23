/*
 * @Author: Alan
 * @Date:   2017-06-22 18:00:50
 * @Last Modified by:  Alan
 * @Last Modified time: 2017-06-23 14:56:48
 */

'use strict';

let Express = require('express')
let app = Express()
let http = require('http').Server(app)
let io = require('socket.io')(http)
let host = process.env.HOST || 'localhost'
let port = process.env.PORT || 1234

// start the service
http.listen(port, () => {
  console.log('Server listening at %s:%d', host, port)
})

// static files
app.use(Express.static(__dirname + '/public'))

// routing
// app.get('/', (req, res) => {
//   // res.send('<h1>Hello World!</h1>')
//   res.sendFile(__dirname + '/index.html')
// })
// 

// chatroom
let usersNum = 0

// when the client connected, this works
io.on('connection', (socket) => {
	let addedUser = false

	// when the client emits 'chat-message', this listens and executes
	socket.on('chat-message', (msg) => {
		// tell the client to excute 'chat-message'
		socket.broadcast.emit('chat-message', {
			usename: socket.username,
			message: msg
		})
	})

	// when the client emits 'add-user', this listens and executes
	socket.on('add-user', (username) => {
		// forbid to add the same user which is already connecting repetly
		if (addedUser) return 

		// store the username in the socket session for this client
		socket.username = username
		++usersNum
		addedUser = true
		socket.emit('login', {usersNum: usersNum})

		// echo globally (all clients) that a user has connected
		socket.broadcast.emit('user-joined', {
			username: socket.username,
			usersNum: usersNum
		})
	})

	// when the client emits 'typing', broadcast it to others
	socket.on('typing', () => {
		socket.broadcast.emit('typing', {
			username: socket.username
		})
	})

	// when the client emits 'stopp-typing', broadcast it to others
	socket.on('stop-typing', () => {
		socket.broadcast.emit('typing', {
			username: socket.username
		})
	}) 

	// when the user disconnects, perform this
	socket.on('disconnect', () => {
		if (addedUser) {
			--usersNum

			// echo globally that this client has left
			socket.broadcast.emit('user-left', {
				username: socket.username,
				usersNum: usersNum
			})
		}
	})
})


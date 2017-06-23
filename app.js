/*
 * @Author: Alan
 * @Date:   2017-06-22 18:00:50
 * @Last Modified by:  Alan
 * @Last Modified time: 2017-06-23 11:47:38
 */

'use strict';

let Express = require('express')
let app = Express()
let http = require('http').Server(app)
let io = require('socket.io')(http)

app.get('/', (req, res) => {
  // res.send('<h1>Hello World!</h1>')
  res.sendFile(__dirname + '/index.html')
})

io.on('connection', (socket) => {
	// console.log('a user connected')

	socket.on('chat-message', (msg) => {
		// console.log('message:' + msg)
		io.emit('chat-message', msg) // send the message to the sender 
	})

	// socket.on('disconnect', (socket) => {
	// 	console.log('user disconnected')
	// })
})

http.listen(1234, () => {
  console.log('listening on *:1234')
})

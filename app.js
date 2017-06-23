/*
 * @Author: Alan
 * @Date:   2017-06-22 18:00:50
 * @Last Modified by:  Alan
 * @Last Modified time: 2017-06-23 15:47:43
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

// Chatroom

var numUsers = 0;

io.on('connection', function (socket) {
  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});

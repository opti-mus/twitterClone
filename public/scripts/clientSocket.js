var connected = false

var socket = io('http://localhost:3001')

socket.emit('setup', userInfo)

socket.on('connected', () => {
  connected = true
})
socket.on('message received', (newMessage) => {
  messageReceived(newMessage)
})

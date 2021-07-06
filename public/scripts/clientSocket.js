var connected = false

var socket = io('http://localhost:3001')

socket.emit('setup', userInfo)

socket.on('connected', () => {
  connected = true
})
socket.on('message received', (newMessage) => {
  messageReceived(newMessage)
})
socket.on('notification received', () => {
  $.get('/api/notifications/latest', (notificationData) => {
    showNotificationPopup(notificationData)
    refreshNotificationsBadge()
  })
})
function emitNotification(userId) {
  if (userId == userInfo._id) return

  socket.emit('notification received', userId)
}

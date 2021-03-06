var typing = false
var lastTypingTime
$(document).ready(() => {
  socket.emit('join room', chatId)
  socket.on('typing', () => {
    $('.typing-dots').show()
  })
  socket.on('stop typing', () => {
    $('.typing-dots').hide()
  })

  $.get(`/api/chats/${chatId}`, (data) =>
    $('#chat-name').text(getChatName(data))
  )
  $.get(`/api/chats/${chatId}/messages`, (data) => {
    var messages = []
    var lastSenderId = ''

    data.forEach((message, index) => {
      var html = createMessageHtml(message, data[index + 1], lastSenderId)
      messages.push(html)

      lastSenderId = message.sender._id
    })
    var messagesHtml = messages.join('')
    addMessagesHtmlToPage(messagesHtml)
    scrollToBottom(false)
    markAllMessagesAsRead()
    $('.loading-container').remove()
    $('.chat-main-wrapper').css('visibility', 'visible')
    $('.message-input').val('')
  })
})
$('#chatNameModalSubmit').click((e) => {
  let name = $('#chat-name-textbox').val().trim()
  $.ajax({
    url: `/api/chats/${chatId}`,
    type: 'PUT',
    data: { chatName: name },
    success: (data, status, xhr) => {
      if (xhr.status != 204) {
        alert('could not update')
      } else {
        location.reload()
      }
    },
  })
})
$('.send-message').click((e) => {
  messageSubmited()
})
$('.message-input').keydown((e) => {
  updateTyping()
  if (e.which === 13 && !e.shiftKey) {
    messageSubmited()
    return false
  }
})
function updateTyping() {
  if (!connected) return
  if (!typing) {
    typing = true
    socket.emit('typing', chatId)
  }
  lastTypingTime = new Date().getTime()
  var timerLength = 3000
  setTimeout(() => {
    var timeNow = new Date().getTime()
    var diffTime = timeNow - lastTypingTime
    if (diffTime >= timerLength && typing) {
      socket.emit('stop typing', chatId)
      typing = false
    }
  }, timerLength)
}
function addMessagesHtmlToPage(html) {
  $('.chat-main ').append(html)
}
function messageSubmited() {
  var content = $('.message-input').val().trim()
  if (content != '') {
    sendMessage(content)
    $('.message-input').val('')
    socket.emit('stop typing', chatId)
    typing = false
  }
}
function sendMessage(content) {
  $.post(`/api/messages`, { content, chatId }, (data, status, xhr) => {
    if (xhr.status != 201) {
      alert('could not send message')
      $('.message-input').val(content)
      return
    }
    addChatMessageHtml(data)
    if (connected) {
      socket.emit('new message', data)
    }
  })
}
function addChatMessageHtml(message) {
  if (!message || !message._id) {
    alert('Message is not valid!')
    return
  }
  var messageDiv = createMessageHtml(message)
  addMessagesHtmlToPage(messageDiv)
  // $('.chat-main ').append(messageDiv)
  scrollToBottom(true)
}
function createMessageHtml(message, nextMessage = null, lastSenderId = '') {
  var sender = message.sender
  var senderName = sender.firstName + ' ' + sender.lastName
  var currentSenderId = sender._id
  var nextSenderId = nextMessage != null ? nextMessage.sender._id : ''

  var isFirst = lastSenderId != currentSenderId
  var isLast = nextSenderId != currentSenderId

  var isMine = message.sender._id == userInfo._id
  var liClassName = isMine ? 'mine' : 'theirs'

  var nameElement = ''
  var imageContainer = ''
  var profileImage = ''

  if (isFirst) {
    liClassName += ' first'
    if (!isMine) {
      nameElement = `<span class='sender-name'>${senderName}</span>`
    }
  }
  if (isLast) {
    liClassName += ' last'
    profileImage = `<img src='${sender.profilePic}' >`
  }
  if (!isMine) {
    imageContainer = `<div class='image-container'>${profileImage}</div>`
  }
  return `
    <li class='message-item ${liClassName}'>
      ${imageContainer}
      <div class='message-conteiner'>
        ${nameElement}
        <span class='message-body'>
          ${message.content}
        </span>
      </div>
    </li>
  `
}
function scrollToBottom(animated) {
  var container = $('.chat-main')
  var scrollHeight = container[0].scrollHeight

  if (animated) {
    container.animate(
      {
        scrollTop: scrollHeight,
      },
      'slow'
    )
  } else {
    container.scrollTop(scrollHeight)
  }
}
function markAllMessagesAsRead() {
  $.ajax({
    url: `/api/chats/${chatId}/messages/markAsRead`,
    type: 'PUT',
    success: () => {
      refreshMessagesBadge()
    },
  })
}

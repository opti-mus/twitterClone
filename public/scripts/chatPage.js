$(document).ready(() => {
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

    $('.loading-container').remove()
    $('.chat-main-wrapper').css('visibility', 'visible')
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
  if (e.which === 13 && !e.shiftKey) {
    messageSubmited()
    return false
  }
})
function addMessagesHtmlToPage(html) {
  $('.chat-main ').append(html)
}
function messageSubmited() {
  var content = $('.message-input').val().trim()
  if (content != '') {
    sendMessage(content)
    $('.message-input').val('')
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

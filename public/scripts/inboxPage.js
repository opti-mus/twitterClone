$(document).ready(() => {
  $.get('/api/chats/', (data, status, xhr) => {
    if (xhr.status == 400) {
      alert('Could not get chat list')
    } else {
      outputChatList(data, $('.results-wrapper'))
    }
  })
})
function outputChatList(chatList, container) {
  chatList.forEach((chat) => {
    var html = createChatHtml(chat)
    container.append(html)
  })
  if (chatList.length == 0) {
    container.append(`<span class='no-results'>Nothing to show</span>`)
  }
}
function createChatHtml(chatData) {
  var chatName = getChatName(chatData)
  var image = getChatImageElem(chatData) 
  var latestMessage = getLatestMessage(chatData.latestMessage)
  return `
    <a class='results-chatlist ' href='/messages/${chatData._id}'>
      ${image}
      <div class='results-datail ellipsis'>
        <span class=''>${chatName}</span>
        <span class='chatlist-latest'>${latestMessage}</span>
      </div>
    </a>
  `
}
function getLatestMessage(latestMessage) {
  if (latestMessage != null) {
    var sender = latestMessage.sender
    return `${sender.firstName} ${sender.lastName} : ${latestMessage.content}`
  }
  return 'New chat'
}
function getChatImageElem(chatData) {
  console.log(chatData)
  let otherChatUsers = getOtherChatUsers(chatData.users)
  let groupChatClass = ''
  let chatImage = getUserChatImageElem(otherChatUsers[0])

  if (otherChatUsers.length > 1) {
    groupChatClass = 'groupChatImage'
    chatImage += getUserChatImageElem(otherChatUsers[1])
  }
  return `<div class='chat-images ${groupChatClass}'>${chatImage}</div>`
}
function getUserChatImageElem(user) {
  if (!user || !user.profilePic) {
    return alert('user passed into function is invalid')
  }
  return `<img src='${user.profilePic}' alt='User profile pic'>`
}

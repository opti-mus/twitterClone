var cropper
var timer
var selectedUsers = []
$(document).ready(() => {
  refreshMessagesBadge()
  refreshNotificationsBadge()
})
$('#postText, #replyTextarea').keyup((e) => {
  let textbox = $(e.target)
  let value = textbox.val().trim()

  let isModal = textbox.parents('.modal').length == 1
  let postBtn = isModal ? $('#replySubmit') : $('#postSubmit')
  if (!postBtn || !textbox) console.log('no fields')

  if (!value) {
    postBtn.prop('disabled', true)
    return
  }
  postBtn.prop('disabled', false)
})

$('#postSubmit, #replySubmit').click((e) => {
  let btn = $(e.target)

  let isModal = btn.parents('.modal').length == 1
  let textbox = isModal ? $('#replyTextarea') : $('#postText')

  let data = {
    content: textbox.val(),
  }
  if (isModal) {
    let postId = btn.data().id
    if (postId == null) return alert('ID is null')
    data.replyTo = postId
  }
  $.post('/api/posts', data, (postData, status, xhr) => {
    if (postData.replyTo) {
      emitNotification(postData.replyTo.postedBy)
      location.reload()
    } else {
      let postHtml = createPostHtml(postData)
      $('.no-results').remove()
      $('.post-wrapper').prepend(postHtml)
      textbox.val('')
      btn.prop('disabled', true)
    }
  })
})

$('#replyModal').on('show.bs.modal', (e) => {
  let btn = $(e.relatedTarget)
  let postId = getPostFromElement(btn)

  $('#replySubmit').data('id', postId)

  $.get(`/api/posts/${postId}`, (result) => {
    outputPost(result.postData, $('.retweeted-container'))
  })
})
$('#deletePostModal').on('show.bs.modal', (e) => {
  let btn = $(e.relatedTarget)
  let postId = getPostFromElement(btn)

  $('#deletePostSubmit').data('id', postId)
})
$('#deletePostSubmit').click(function () {
  let postId = $(this).data('id')
  $.ajax({
    url: `/api/posts/${postId}`,
    type: 'DELETE',
    success: (data, status, xhr) => {
      if (xhr.status != 202) {
        alert('could not delete post')
        return
      }
      location.reload()
    },
  })
})
$('#confirmPinModal').on('show.bs.modal', (e) => {
  let btn = $(e.relatedTarget)
  let postId = getPostFromElement(btn)

  $('#confirmPinSubmit').data('id', postId)
})

$('#unpinModal').on('show.bs.modal', (e) => {
  let btn = $(e.relatedTarget)
  let postId = getPostFromElement(btn)

  $('#unpinModalSubmit').data('id', postId)
})
$('#unpinModalSubmit').click(function () {
  let postId = $(this).data('id')
  $.ajax({
    url: `/api/posts/${postId}`,
    type: 'PUT',
    data: { pinned: false },
    success: (data, status, xhr) => {
      if (xhr.status != 204) {
        alert('could not pinned post')
        return
      }
      location.reload()
    },
  })
})
$('#confirmPinSubmit').click(function () {
  let postId = $(this).data('id')
  $.ajax({
    url: `/api/posts/${postId}`,
    type: 'PUT',
    data: { pinned: true },
    success: (data, status, xhr) => {
      if (xhr.status != 204) {
        alert('could not pinned post')
        return
      }
      location.reload()
    },
  })
})
$('#upload-img').on('change', (e) => {
  let input = e.target
  if (input.files && input.files[0]) {
    let reader = new FileReader()
    reader.onload = (e) => {
      let image = document.querySelector('#image-preview')
      image.src = e.target.result

      if (cropper != undefined) {
        cropper.destroy()
      }
      cropper = new Cropper(image, {
        aspectRatio: 1 / 1,
        background: false,
      })
    }
    reader.readAsDataURL(input.files[0])
  } else console.log('nope')
})
$('#upload-cover').on('change', (e) => {
  let input = e.target
  if (input.files && input.files[0]) {
    let reader = new FileReader()
    reader.onload = (e) => {
      let image = document.querySelector('#cover-preview')
      image.src = e.target.result

      if (cropper != undefined) {
        cropper.destroy()
      }
      cropper = new Cropper(image, {
        aspectRatio: 16 / 9,
        background: false,
      })
    }
    reader.readAsDataURL(input.files[0])
  } else console.log('nope')
})
$('#uploadImageSubmit').click(() => {
  let canvas = cropper.getCroppedCanvas()
  if (canvas == null) {
    alert('alrt')
    return
  }
  canvas.toBlob((blob) => {
    let formData = new FormData()
    formData.append('croppedImage', blob)

    $.ajax({
      url: '/api/users/profilePicture',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: () => {
        location.reload()
      },
    })
  })
})
$('#uploadICoverSubmit').click(() => {
  let canvas = cropper.getCroppedCanvas()
  if (canvas == null) {
    alert('alrt')
    return
  }
  canvas.toBlob((blob) => {
    let formData = new FormData()
    formData.append('croppedImage', blob)

    $.ajax({
      url: '/api/users/coverPhoto',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: () => {
        location.reload()
      },
    })
  })
})
$('#create-chat-btn').click(() => {
  var data = JSON.stringify(selectedUsers)

  $.post('/api/chats', { users: data }, (chat) => {
    console.log(chat)
    if (!chat || !chat._id) return alert('invalid response from server')
    window.location.href = `/messages/${chat._id}`
  })
})
$('#user-search-textbox').keydown((e) => {
  clearTimeout(timer)
  var textbox = $(e.target)
  var value = textbox.val()
  console.log(e)

  if (value == '' && (e.which == 8 || e.keyCode == 8)) {
    // remove user from selectrion
    selectedUsers.pop()
    unpdateSelectedUserHtml()
    $('.results-wrapper').html('')
    if (!selectedUsers.length) $('#create-chat-btn').prop('disabled', true)
    return
  }

  timer = setTimeout(() => {
    value = textbox.val().trim()
    if (value == '') {
      $('.results-wrapper').html('')
    } else {
      searchUsers(value)
    }
  }, 1000)
})
$('#replyModal').on('hidden.bs.modal', () => $('.retweeted-container').html(''))

$(document).on('click', '.like-btn', (e) => {
  let btn = $(e.target)
  let postId = getPostFromElement(btn)

  if (postId == undefined) return

  $.ajax({
    url: `/api/posts/${postId}/like`,
    type: 'PUT',
    success: (postData) => {
      btn.find('span').text(postData.likes.length || '')
      if (postData.likes.includes(userInfo._id)) {
        btn.addClass('liked')
        emitNotification(postData.postedBy)
      } else btn.removeClass('liked')
    },
  })
})
$(document).on('click', '.retweet-btn', (e) => {
  let btn = $(e.target)
  let postId = getPostFromElement(btn)

  if (postId == undefined) return

  $.ajax({
    url: `/api/posts/${postId}/retweet`,
    type: 'POST',
    success: (postData) => {
      btn.find('span').text(postData.retweetUsers.length || '')
      if (postData.retweetUsers.includes(userInfo._id)) {
        btn.addClass('retweet')
        emitNotification(postData.postedBy)
      } else btn.removeClass('retweet')
    },
  })
})
$(document).on('click', '.message', (e) => {
  let element = $(e.target)
  let postId = getPostFromElement(element)

  if (postId != undefined && !element.is('button')) {
    window.location.href = `/posts/${postId}`
  }
})
$(document).on('click', '.follow-btn', (e) => {
  let btn = $(e.target)
  let userId = btn.data().user
  $.ajax({
    url: `/api/users/${userId}/follow`,
    type: 'PUT',
    success: (data, status, xhr) => {
      if (xhr.status === 404) {
        alert('user not found')
        return
      }
      let difference = 1
      if (data.following && data.following.includes(userId)) {
        btn.addClass('following')
        btn.text('Following')
        console.log('ok')
        emitNotification(userId)
      } else {
        btn.removeClass('following')
        btn.text('Follow')
        difference = -1
      }
      let followersLabel = $('.followers-value')

      if (followersLabel.length) {
        let followersText = followersLabel.text()
        followersLabel.text(+followersText + difference)
      }
    },
  })
})
$(document).on('click', '.notification.active', (e) => {
  var container = $(e.target)
  var notificationId = container.data().id
  var href = container.attr('href')
  e.preventDefault()
  var callback = () => (window.location = href)
  markNotificationAsOpened(notificationId, callback)
})
function getPostFromElement(elem) {
  let isRoot = elem.hasClass('message')
  let rootElement = isRoot ? elem : elem.closest('.message')
  let postId = rootElement.data().id

  if (!postId) return console.log('Id undefined')
  else return postId
}
function createPostHtml(postData, largeFont = false) {
  if (postData == null) {
    return alert('postdata is null')
  }

  let isRetweet = postData.retweetData != undefined
  let retweetedBy = isRetweet ? postData.postedBy.username : null
  postData = isRetweet ? postData.retweetData : postData
  let postedBy = postData.postedBy

  if (postedBy._id == undefined) return console.log('User object not populated')

  let liked = postData.likes.includes(userInfo._id) ? 'liked' : ''

  let retweet = postData.retweetUsers.includes(userInfo._id) ? 'retweet' : ''
  let retweetText = ''
  if (isRetweet) {
    retweetText = `<span>
    <i class='fas fa-retweet'></i>
    Retweeted by <a href='/profile/${retweetedBy}'>@${retweetedBy}</a>
    </span>`
  }
  let displayName = `${postedBy.firstName} ${postedBy.lastName}`
  let timestamp = timeDifference(new Date(), new Date(postData.createdAt))

  let replyFlag = ''
  if (postData.replyTo && postData.replyTo._id) {
    if (!postData.replyTo._id) {
      return alert('reply to is not populated')
    } else if (!postData.replyTo.postedBy._id) {
      return alert('Posted to is not populated')
    }
    let replyToUsername = postData.replyTo.postedBy.username
    replyFlag = `
    <span class='reply-flag'>
      Replying to <a href='/profile/${replyToUsername}'>@${replyToUsername}</a>
    </span>`
  }

  let buttons = ''
  let pinPostText = ''
  // Мое исправление
  if (postData.pinned) {
    pinPostText = `<span class='pinned-text'><i class='fas fa-thumbtack'></i><span>Pinned post</span></span>`
  }
  if (postData.postedBy._id == userInfo._id) {
    let pinClass = ''
    let dataTarget = '#confirmPinModal'
    if (postData.pinned === true) {
      pinClass = 'active'
      dataTarget = '#unpinModal'
    }
    buttons = `
    <div class='post-options'>
      <button  class='opt-container ${pinClass}' data-id=${postData._id} data-bs-toggle="modal"  data-bs-target='${dataTarget}'>
        <i class='fas fa-thumbtack'></i>
      </button>
      <button class='opt-container' id='delete-btn'  data-id=${postData._id} data-bs-toggle="modal"  data-bs-target='#deletePostModal'>
        <i class='fas fa-times'></i>
      </button>
    </div>
    `
  }

  let largeFontClass = largeFont ? 'large-font' : ''

  return `
  <div class="message ${largeFontClass}" data-id=${postData._id}>
    <div class='retweet-container'>
      ${retweetText}
      
    </div>
    <div class='message-wrapper'>
      <div class="post-pic">
        <img src='${postedBy.profilePic}' >
      </div>
      <div class="message-content">
        ${pinPostText}
        <div class='message-header'>
          <a class='message-name' href ='/profile/${postedBy.username}'>
            ${displayName}
          </a>
          <span class='message-username'>@${postedBy.username}</span>
          <span class='message-date'>${timestamp}</span>
          ${buttons}
        </div>
        ${replyFlag}
        <div class="message-text">${postData.content}</div>
        <div class="message-footer">
          <div class='message-btn'>
            <button class='btn-container' data-bs-toggle="modal"  data-bs-target='#replyModal'>
              <i class='far fa-comment'></i>
                  <span>23</span>
            </button>
          </div>
          <div class='message-btn retweet-btn'>
            <button class='btn-container ${retweet}' >
              <i class='fas fa-retweet'></i>
              <span>${postData.retweetUsers.length || ''}</span>
            </button>
          </div>
          <div class='message-btn like-btn'>
            <button class='btn-container ${liked}'>
              <i class='far fa-heart'></i>
              <span>${postData.likes.length || ''}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
}
function timeDifference(current, previous) {
  var msPerMinute = 60 * 1000
  var msPerHour = msPerMinute * 60
  var msPerDay = msPerHour * 24
  var msPerMonth = msPerDay * 30
  var msPerYear = msPerDay * 365

  var elapsed = current - previous

  if (elapsed < msPerMinute) {
    if (elapsed / 1000 < 30) return 'Just now'
    return Math.round(elapsed / 1000) + ' seconds ago'
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + ' minutes ago'
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + ' hours ago'
  } else if (elapsed < msPerMonth) {
    return Math.round(elapsed / msPerDay) + ' days ago'
  } else if (elapsed < msPerYear) {
    return Math.round(elapsed / msPerMonth) + ' months ago'
  } else {
    return Math.round(elapsed / msPerYear) + ' years ago'
  }
}
function outputPost(results, container) {
  container.html('')
  if (!Array.isArray(results)) results = [results]
  results.forEach((res) => {
    let html = createPostHtml(res)
    container.append(html)
  })
  if (!results.length) {
    container.append(`<span class='no-results'>Nothing to show</span>`)
  }
}

function outputPostWithReplies(results, container) {
  container.html('')

  if (results.replyTo != undefined && results.replyTo._id != undefined) {
    let html = createPostHtml(results.replyTo)
    container.append(html)
  }
  let html = createPostHtml(results.postData, true)
  container.append(html)

  results.replies.forEach((res) => {
    let html = createPostHtml(res)
    container.append(html)
  })
}
function outputUser(results, container) {
  container.html('')
  if (!results.length)
    container.append(`<span class='no-results'>Nothing to show</span>`)
  results.forEach((res) => {
    let html = createUserHtml(res, true)
    container.append(html)
  })
}
function createUserHtml(userData, showFollowButton = false) {
  let isFollowing =
    userInfo.following && userInfo.following.includes(userData._id)
  let text = isFollowing ? 'Following' : 'Follow'

  let btnClass = isFollowing ? 'follow-btn following' : 'follow-btn'

  let followBtn = ''
  if (showFollowButton && userInfo._id != userData._id) {
    followBtn = `
    <button class='${btnClass} profile-btn' data-user=${userData._id}>${text}</button>
    `
  }
  return `
    <div class='user'>
      <div class='user-image post-pic'>
        <img src='${userData.profilePic}' >
      </div>
      <div class='user-title'>
        <a href='/profile/${userData._id}'>
          ${userData.firstName} ${userData.lastName} 
        </a>
        <span class='user-username'>@${userData.username}</span>
      </div>
      ${followBtn}
    </div>
  `
}
function searchUsers(searchTerm) {
  $.get('/api/users', { search: searchTerm }, (results) => {
    outputSelectableUsers(results, $('.results-wrapper'))
  })
}
function outputSelectableUsers(results, container) {
  container.html('')
  console.log(userInfo)
  if (!results.length)
    container.append(`<span class='no-results'>Nothing to show</span>`)
  results.forEach((res) => {
    if (
      res._id == userInfo._id ||
      selectedUsers.some((u) => u._id == res._id)
    ) {
      return
    }
    let html = createUserHtml(res, false)
    let element = $(html)
    element.click(() => userSelected(res))
    container.append(element)
  })
}
function userSelected(user) {
  selectedUsers.push(user)
  unpdateSelectedUserHtml()
  $('#user-search-textbox').val('').focus()
  $('.results-wrapper').html('')
  $('#create-chat-btn').prop('disabled', false)
}
function unpdateSelectedUserHtml() {
  let elements = []

  selectedUsers.forEach((user) => {
    var name = user.firstName + ' ' + user.lastName
    var userElement = $(`<span class='selectedUser'>${name}</name>`)
    elements.push(userElement)
  })
  $('.selectedUser').remove()
  $('#selected-user').prepend(elements)
}

function getChatName(chatData) {
  var chatName = chatData.chatName
  if (!chatName) {
    var otherChatUsers = getOtherChatUsers(chatData.users)
    var namesArray = otherChatUsers.map(
      (user) => user.firstName + '' + user.lastName
    )
    chatName = namesArray.join(', ')
  }
  return chatName
}
function getOtherChatUsers(users) {
  if (users.length == 1) return users
  return users.filter((user) => user._id != userInfo._id)
}

function messageReceived(newMessage) {
  if ($('.chat-main-wrapper').length == 0) {
    showMessagePopup(newMessage)
  } else {
    addChatMessageHtml(newMessage)
  }
  refreshMessagesBadge()
}

function markNotificationAsOpened(notificationId = null, callback = null) {
  if (callback == null) callback = () => location.reload()

  var url =
    notificationId != null
      ? `/api/notifications/${notificationId}/markAsOpened`
      : `/api/notifications/markAsOpened`
  $.ajax({
    url,
    type: 'PUT',
    success: () => callback(),
  })
}

function refreshMessagesBadge() {
  $.get('/api/chats/', { unreadOnly: true }, (data) => {
    var numResults = data.length
    if (numResults > 0) {
      $('#messages-badge').text(numResults).addClass('active')
    } else {
      $('#messages-badge').text('').removeClass('active')
    }
  })
}

function refreshNotificationsBadge() {
  $.get('/api/notifications', { unreadOnly: true }, (data) => {
    var numResults = data.length
    if (numResults > 0) {
      $('#notification-badge').text(numResults).addClass('active')
    } else {
      $('#notification-badge').text('').removeClass('active')
    }
  })
}
function notificationList(notifications, container) {
  notifications.forEach((notification) => {
    var html = createNotificationHtml(notification)
    container.append(html)
  })
  if (notifications.length == 0) {
    container.append(`<span class='no-results'>Nothing to show</span>`)
  }
}
function createNotificationHtml(notification) {
  var userFrom = notification.userFrom
  var text = getNotificationText(notification)
  var href = getNotificationUrl(notification)
  var className = notification.opened ? '' : 'active'
  return `
    <a href='${href}' class='results-chatlist ${className} notification' data-id='${notification._id}'>
      <div class='chat-images'>
        <img src='${userFrom.profilePic}' class=''>
      </div>
      <div class='results-datail ellipsis'>
          ${text}
      </div>
    </a>
  `
}
function getNotificationText(notification) {
  var userFrom = notification.userFrom
  if (!userFrom.firstName || !userFrom.lastName) {
    return alert('user from data not populated')
  }
  var userFromName = `${userFrom.firstName} ${userFrom.lastName}`
  var text

  if (notification.notificationType == 'retweet') {
    text = `${userFromName} retweeted one of your post`
  } else if (notification.notificationType == 'postLike') {
    text = `${userFromName} like one of your post`
  } else if (notification.notificationType == 'reply') {
    text = `${userFromName} replied one of your post`
  } else if (notification.notificationType == 'follow') {
    text = `${userFromName} follow you`
  }
  return `<span class='ellipsis'>${text}</span>`
}
function getNotificationUrl(notification) {
  var url = '#'

  if (
    notification.notificationType == 'retweet' ||
    notification.notificationType == 'postLike' ||
    notification.notificationType == 'reply'
  ) {
    url = `/posts/${notification.entityId}`
  } else if (notification.notificationType == 'follow') {
    url = `/profile/${notification.entityId}`
  }
  return url
}
function showNotificationPopup(data) {
  var html = createNotificationHtml(data)
  var element = $(html)
  element.hide().prependTo('#notificationList').slideDown('fast')

  setTimeout(() => element.fadeOut(400), 5000)
}
function showMessagePopup(data) {
  if (!data.chat.latestMessage._id) {
    data.chat.latestMessage = data
  }
  var html = createChatHtml(data.chat)
  var element = $(html)
  element.hide().prependTo('#notificationList').slideDown('fast')

  setTimeout(() => element.fadeOut(400), 5000)
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

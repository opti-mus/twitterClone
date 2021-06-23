$('#postText').keyup((e) => {
  let textbox = $(e.target)
  let postBtn = $('#postSubmit')
  let value = textbox.val().trim()

  if (!postBtn || !textbox) console.log('no fields')

  if (!value) {
    postBtn.prop('disabled', true)
    return
  }
  postBtn.prop('disabled', false)
})
$('#postSubmit').click((e) => {
  let btn = e.target
  let textbox = $('#postText')
  let data = {
    content: textbox.val(),
  }
  $.post('/api/posts', data, (postData, status, xhr) => {
    console.log(postData)
    let postHtml = createPostHtml(postData)
    $('.post-wrapper').prepend(postHtml)
  })
})
$(document).on('click', '.like-btn', (e) => {
  let btn = $(e.target)
  let postId = getPostFromElement(btn)

  if (postId === undefined) return

  $.ajax({
    url: `/api/posts/${postId}/like`,
    type: 'PUT',
    success: (postData) => {
      btn.find('span').text(postData.likes.length || '')
    },
  })
})
function getPostFromElement(elem) {
  let isRoot = elem.hasClass('message')
  let rootElement = isRoot ? elem : elem.closest('.message')
  let postId = rootElement.data().id

  if (!postId) return console.log('Id undefined')
  else return postId
}
function createPostHtml(postData) {
  let userInfo = postData.postedBy
  if (userInfo._id === undefined) {
    return console.log('User object not populated')
  }
  let isLiked = postData.likes.includes(userInfo._id)
  let liked = isLiked ? 'liked' : ''
  console.log(isLiked)
  let displayName = `${userInfo.firstName} ${userInfo.lastName}`
  let timestamp = timeDifference(new Date(), new Date(postData.createdAt))
  return `
  <div class="message" data-id=${postData._id}>
    <div class="post-pic">
      <img src='${userInfo.profilePic}' >
    </div>
    <div class="message-content">
      <div class='pos-header'>
        <a class='message-name' href ='/profile/${
          userInfo.username
        }'>${displayName}</a>
        <spam class='message-username'>@${userInfo.username}</span>
        <spam class='message-date'>${timestamp}</span>
      </div>
      <div class="message-text">${postData.content}</div>
      <div class="message-footer">
        <i class='message-btn far fa-comment'></i>
        <i class='message-btn fas fa-retweet'></i>
        <div class='${liked} message-btn like-btn>
          <i class='far fa-heart'></i>
          <span>${postData.likes.length || ''}</span>
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

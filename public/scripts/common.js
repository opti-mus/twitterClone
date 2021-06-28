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
      location.reload()
    } else {
      let postHtml = createPostHtml(postData)
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
$('#replyModal').on('hidden.bs.modal', () => $('.retweeted-container').html(''))

$(document).on('click', '.like-btn', (e) => {
  let btn = $(e.target)
  let postId = getPostFromElement(btn)

  if (postId === undefined) return

  $.ajax({
    url: `/api/posts/${postId}/like`,
    type: 'PUT',
    success: (postData) => {
      btn.find('span').text(postData.likes.length || '')
      if (postData.likes.includes(userInfo._id)) btn.addClass('liked')
      else btn.removeClass('liked')
    },
  })
})
$(document).on('click', '.retweet-btn', (e) => {
  let btn = $(e.target)
  let postId = getPostFromElement(btn)

  if (postId === undefined) return

  $.ajax({
    url: `/api/posts/${postId}/retweet`,
    type: 'POST',
    success: (postData) => {
      btn.find('span').text(postData.retweetUsers.length || '')
      if (postData.retweetUsers.includes(userInfo._id)) btn.addClass('retweet')
      else btn.removeClass('retweet')
    },
  })
})
$(document).on('click', '.message', (e) => {
  let element = $(e.target)
  let postId = getPostFromElement(element)

  if (postId !== undefined && !element.is('button')) {
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
      } else {
        btn.removeClass('following')
        btn.text('Follow')
        difference = -1
      }
      let followersLabel = $('.followers-value')
      console.log(followersLabel.length)
      if (followersLabel.length) {
        let followersText = followersLabel.text()
        followersLabel.text(+followersText + difference)
      }
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
function createPostHtml(postData, largeFont = false) {
  if (postData == null) return alert('postdata is null')

  let isRetweet = postData.retweetData != undefined
  let retweetedBy = isRetweet ? postData.postedBy.username : null
  postData = isRetweet ? postData.retweetData : postData
  let postedBy = postData.postedBy

  if (postedBy._id === undefined)
    return console.log('User object not populated')

  let liked = postData.likes.includes(userInfo._id) ? 'liked' : ''

  let retweet = postData.retweetUsers.includes(postedBy._id) ? 'retweet' : ''
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
  console.log(postData.postedBy._id, userInfo._id)
  let button = ''
  if (postData.postedBy._id == userInfo._id) {
    button = `
    <button  id='delete-btn' data-id=${postData._id} data-bs-toggle="modal"  data-bs-target='#deletePostModal'>
      <i class='fas fa-times'></i>
    </button>`
  }

  let largeFontClass = largeFont ? 'large-font' : ''

  return `
  <div class="message ${largeFontClass}" data-id=${postData._id}>
    <div class='retweet-container'>
      ${retweetText}
    </div>
    <div class='message-wrapper'>
      <div class="post-pic">
        <img src='${userInfo.profilePic}' >
      </div>
      <div class="message-content">
        <div class='message-header'>
          <a class='message-name' href ='/profile/${postedBy.username}'>
            ${displayName}
          </a>
          <span class='message-username'>@${postedBy.username}</span>
          <span class='message-date'>${timestamp}</span>
          ${button}
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

  if (results.replyTo !== undefined && results.replyTo._id !== undefined) {
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

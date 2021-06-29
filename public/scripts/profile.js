$(document).ready(() => {
  $('.profile-posts').html('')
  if (selectedTab === 'replies') loadReplies()
  else loadPosts()
})

function loadPosts() {
  $.get('/api/posts', { postedBy: profileUserId, pinned: true }, (result) => {
    outputPinnedPost(result, $('.pin-post-container'))
  })
  $.get(
    '/api/posts',
    { postedBy: profileUserId, isReply: false, pinned: false },
    (result) => {
      outputPost(result, $('.profile-posts'))
      // Added pinned:false
    }
  )
}
function loadReplies() {
  $.get('/api/posts', { postedBy: profileUserId, isReply: true }, (result) => {
    console.log(result)
    outputPost(result, $('.profile-posts'))
  })
}
function outputPinnedPost(results, container) {
  if (results.length == 0) {
    container.hide()
    return
  }
  container.html('')

  results.forEach((res) => {
    let html = createPostHtml(res)
    container.append(html)
  })
}

$(document).ready(() => {
  $('.profile-posts').html('')
  if (selectedTab === 'replies') loadReplies()
  else loadPosts()
})

function loadPosts() {
  $.get('/api/posts', { postedBy: profileUserId, isReply: false }, (result) => {
    outputPost(result, $('.profile-posts'))
  })
}
function loadReplies() {
  $.get('/api/posts', { postedBy: profileUserId, isReply: true }, (result) => {
    outputPost(result, $('.profile-posts'))
  })
}

$(document).ready(() => {
  $('.profile-posts').html('')
  if (selectedTab === 'replies') loadReplies()
  else loadPosts()
  $('.profile-camera').click(() => {
    $('#upload-img').click()
    $('#upload-img').on('change', (e) => {
      console.log(e.target.value)
    })
  })
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

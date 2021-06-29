$(document).ready(() => {
  $('.post-wrapper ').html('')
  if (selectedTab === 'followings') loadFollowings()
  else loadFollowers()
})

function loadFollowings() {
  $.get(`/api/users/${profileUserId}/followings`, (result) => {
    outputUser(result.following, $('.post-wrapper '))
  })
}
function loadFollowers() {
  $.get(`/api/users/${profileUserId}/followers`, (result) => {
    outputUser(result.followers, $('.post-wrapper '))
  })
}

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
function outputUser(results, container) {
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

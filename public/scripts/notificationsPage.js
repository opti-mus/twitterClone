$(document).ready(() => {
  $.get('/api/notifications', (data) => {
    notificationList(data, $('.results-wrapper '))
  })
})
$('#mark-notification-read').click(()=>{
  markNotificationAsOpened()
})
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

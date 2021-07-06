$(document).ready(() => {
  $.get('/api/notifications', (data) => {
    notificationList(data, $('.results-wrapper '))
  })
})
$('#mark-notification-read').click(()=>{
  markNotificationAsOpened()
})

$(document).ready(() => {
  $.get('/api/posts', { followingOnly: true }, (result) => {
    outputPost(result, $('.post-wrapper'))
    $('.loading-container').remove()
    $('.post-wrapper').css('visibility', 'visible')
  })
})

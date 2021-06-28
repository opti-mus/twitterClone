$(document).ready(() => {
  $.get('/api/posts', { followingOnly: true }, (result) => {
    console.log(result)
    outputPost(result, $('.post-wrapper'))
  })
})

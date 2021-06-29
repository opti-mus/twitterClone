$(document).ready(() => {
  $.get('/api/posts', { followingOnly: true }, (result) => {
   
    outputPost(result, $('.post-wrapper'))
  })
})

$(document).ready(() => {
  $.get('/api/posts', (result) => {
    outputPost(result, $('.post-wrapper'))
  })
})



$(document).ready(() => {
  $.get('/api/posts', (result) => {
    outputPost(result, $('.post-wrapper'))
  })
})

function outputPost(results, container) {
  container.html('')

  results.forEach((res) => {
    let html = createPostHtml(res)
    container.append(html)
  })
  if (!results.length) {
    container.append(`<span class='no-results'>Nothing to show</span>`)
  }
}

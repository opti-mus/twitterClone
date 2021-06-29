
$('#search-box').keydown((e) => {
  clearTimeout(timer)
  var textbox = $(e.target)
  var value = textbox.val()
  var searchType = textbox.data().search

  timer = setTimeout(() => {
    value = textbox.val().trim()
    if (value == '') {
      $('.results-container ').html('')
    } else {
      search(value, searchType)
    }
  }, 1000)
})
function search(searchItem, searchType) {
  var url = searchType == 'users' ? '/api/users' : '/api/posts'

  $.get(url, { search: searchItem }, (result) => {
    if (searchType == 'users') {
      outputUser(result, $('.results-container'))
    } else {
      outputPost(result, $('.results-container'))
    }
  })
}

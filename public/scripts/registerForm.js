var loginForm = document.querySelector('.login-form')

loginForm.addEventListener('submit', (e) => {
  e.preventDefault()
  validForm()
})

function validForm() {
  var passField = document.querySelector('#password')
  var passConfField = document.querySelector('#passConfField')

  if (passField.value != passConfField.value) {
    alert('password do not match!')
  } else loginForm.submit()
}

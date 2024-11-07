import { API_URL } from '../config.js';
import { showSpiner, hideSpiner } from './helpers.js';
///////////////////////////////////
// Variables
const loginHeaderText = document.querySelector('.title-text .login');
const loginSlider = document.querySelector('label.login');
const signupSlider = document.querySelector('label.signup');
const signupLink = document.querySelector('.btn-create-new');
const resetBtn = document.querySelector('.btn-reset');
const signupForm = document.querySelector('.signup-form');
const loginForm = document.querySelector('.login-form');
const errorMsgContainer = document.querySelector('.error-msg-container');
const toAppLink = document.querySelector('.to-app-link');
const toResetLink = document.querySelector('.to-reset-email-link');
const showPassCheckbox = document.querySelector('#show-pass-checkbox');
const signupBtn = document.querySelector('.signup-btn');
const loginBtn = document.querySelector('.login-btn');
let passwordInput = document.querySelector('.signup-password');
let confPasswordInput = document.querySelector('.confirm-password');

signupSlider.onclick = () => {
  loginForm.style.marginLeft = '-50%';
  loginHeaderText.style.marginLeft = '-50%';
};
loginSlider.onclick = () => {
  loginForm.style.marginLeft = '0%';
  loginHeaderText.style.marginLeft = '0%';
};
signupLink.onclick = () => {
  signupSlider.click();
  return false;
};

resetBtn.onclick = e => {
  toResetLink.click();
};

signupForm.addEventListener('submit', async e => {
  try {
    e.preventDefault();
    let emailInput = document.querySelector('.signup-email');
    let passwordInput = document.querySelector('.signup-password');
    let confPasswordInput = document.querySelector('.confirm-password');
    // Display loading spin
    showSpiner(signupBtn);

    let res = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      body: JSON.stringify({
        email: emailInput.value,
        password: passwordInput.value,
        confirmPassword: confPasswordInput.value,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    let data = await res.json();
    if (data.statusCode !== 200) {
      throw new Error(data.message);
    }
    emailInput.value = '';
    passwordInput.value = '';
    confPasswordInput.value = '';
    errorMsgContainer.innerText = '';
    hideSignupPassword();
    hideSpiner(signupBtn, 'SignUp');
    loginSlider.click();
  } catch (err) {
    errorMsgContainer.innerText = '';
    errorMsgContainer.insertAdjacentText('afterbegin', err.message);
    // Hide loading spin
    hideSpiner(signupBtn, 'SignUp');
  }
});

loginForm.addEventListener('submit', async e => {
  try {
    e.preventDefault();
    let emailInput = document.querySelector('.login-email');
    let passwordInput = document.querySelector('.login-password');
    showSpiner(loginBtn);
    let res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: emailInput.value,
        password: passwordInput.value,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    let data = await res.json();
    if (data.statusCode !== 200) {
      throw new Error(data.message);
    }
    // Save Token in local storage
    localStorage.setItem('todo-app-token', JSON.stringify(data.token));

    // Delete all todos in local storage to prepare local storage for new user todos
    localStorage.removeItem('todos');

    hideSpiner(loginBtn, 'Login');
    errorMsgContainer.innerText = '';
    // Redirect to main todo apps
    toAppLink.click();
  } catch (err) {
    errorMsgContainer.innerText = '';
    errorMsgContainer.insertAdjacentText('afterbegin', err.message);
    hideSpiner(loginBtn, 'Login');
  }
});

showPassCheckbox.addEventListener('change', e => {
  if (showPassCheckbox.value === 'unchecked') {
    showPassCheckbox.value = 'checked';
    passwordInput.setAttribute('type', 'text');
    confPasswordInput.setAttribute('type', 'text');
  } else {
    showPassCheckbox.value = 'unchecked';
    passwordInput.setAttribute('type', 'password');
    confPasswordInput.setAttribute('type', 'password');
  }
});

function hideSignupPassword() {
  if (showPassCheckbox.value === 'checked') showPassCheckbox.click();
}

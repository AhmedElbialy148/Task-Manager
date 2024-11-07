import { API_URL } from '../config.js';
import { showSpiner, hideSpiner } from './helpers.js';
//////////////////////////////////////
// Variables
const resetnewPassForm = document.querySelector('.new-password-form');
const errorMsgContainer = document.querySelector('.error-msg-container');
const toFormBtn = document.querySelector('.to-form-btn');
const toFormLink = document.querySelector('.to-form-link');
const submitNewPasswordBtn = document.querySelector('.submit-newPassword-btn');
const showPassCheckbox = document.querySelector('#show-pass-checkbox');
let passwordInput = document.querySelector('.new-password');
let confPasswordInput = document.querySelector('.confirm-new-password');
//////////////////////////////////////
// Functions
toFormBtn.onclick = () => {
  toFormLink.click();
};

resetnewPassForm.onsubmit = async e => {
  try {
    e.preventDefault();
    showSpiner(submitNewPasswordBtn);
    const newPassInput = document.querySelector('.new-password');
    const confirmNewPassInput = document.querySelector('.confirm-new-password');
    const email = JSON.parse(localStorage.getItem('todo-app-reset-email'));
    const verifCode = JSON.parse(
      localStorage.getItem('todo-app-reset-verifcode')
    );
    if (!email || !verifCode) {
      hideSpiner(submitNewPasswordBtn, 'Submit');
      return toFormLink.click();
    }
    let res = await fetch(`${API_URL}/newPassword`, {
      method: 'POST',
      body: JSON.stringify({
        email: email,
        verifCode: verifCode,
        newPassword: newPassInput.value,
        confirmNewPassword: confirmNewPassInput.value,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    let data = await res.json();
    console.log(data);
    if (data.statusCode !== 200) {
      throw new Error(data.message);
    }
    localStorage.removeItem('todo-app-reset-email');
    localStorage.removeItem('todo-app-reset-verifcode');
    hideSpiner(submitNewPasswordBtn, 'Submit');
    hideNewPassword();
    errorMsgContainer.innerText = '';
    toFormLink.click();
  } catch (err) {
    errorMsgContainer.innerText = '';
    errorMsgContainer.insertAdjacentText('afterbegin', err.message);
    hideSpiner(submitNewPasswordBtn, 'Submit');
  }
};

showPassCheckbox.addEventListener('change', e => {
  if (showPassCheckbox.value === 'unchecked') {
    showNewPassword();
  } else {
    hideNewPassword();
  }
});

function showNewPassword() {
  showPassCheckbox.value = 'checked';
  passwordInput.setAttribute('type', 'text');
  confPasswordInput.setAttribute('type', 'text');
}
function hideNewPassword() {
  showPassCheckbox.value = 'unchecked';
  passwordInput.setAttribute('type', 'password');
  confPasswordInput.setAttribute('type', 'password');
}

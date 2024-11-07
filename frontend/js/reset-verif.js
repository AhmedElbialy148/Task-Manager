import { API_URL } from '../config.js';
import { showSpiner, hideSpiner } from './helpers.js';
//////////////////////////////////////
// Variables
const resetVerifCodeForm = document.querySelector('.verify-code-form');
const errorMsgContainer = document.querySelector('.error-msg-container');
const toNewPasswordLink = document.querySelector('.to-newPassword-link');
const toFormBtn = document.querySelector('.to-form-btn');
const toFormLink = document.querySelector('.to-form-link');
const verifyCodeBtn = document.querySelector('.verify-code-btn');
//////////////////////////////////////
// Functions
toFormBtn.onclick = () => {
  toFormLink.click();
};

resetVerifCodeForm.addEventListener('submit', async e => {
  try {
    e.preventDefault();
    showSpiner(verifyCodeBtn);

    const verifCodeInput = document.querySelector('.verification-code');
    const email = JSON.parse(localStorage.getItem('todo-app-reset-email'));
    if (!email) {
      hideSpiner(verifyCodeBtn, 'Verify');
      return toFormLink.click();
    }
    let res = await fetch(`${API_URL}/verifcode`, {
      method: 'POST',
      body: JSON.stringify({
        verifCode: verifCodeInput.value,
        email: email,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    let data = await res.json();
    if (data.statusCode !== 200) {
      throw new Error(data.message);
    }
    localStorage.setItem(
      'todo-app-reset-verifcode',
      JSON.stringify(verifCodeInput.value)
    );
    hideSpiner(verifyCodeBtn, 'Verify');
    errorMsgContainer.innerText = '';
    toNewPasswordLink.click();
  } catch (err) {
    errorMsgContainer.innerText = '';
    errorMsgContainer.insertAdjacentText('afterbegin', err.message);
    hideSpiner(verifyCodeBtn, 'Verify');
  }
});

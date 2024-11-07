import { API_URL } from '../config.js';
import { showSpiner, hideSpiner } from './helpers.js';
//////////////////////////////////////
// Variables
const resetEmailForm = document.querySelector('.reset-email-form');
const errorMsgContainer = document.querySelector('.error-msg-container');
const toFormBtn = document.querySelector('.to-form-btn');
const toFormLink = document.querySelector('.to-form-link');
const toVerifCodeLink = document.querySelector('.to-verifcode-link');
const sendEmailBtn = document.querySelector('.send-email-btn');
//////////////////////////////////////
// Functions
resetEmailForm.addEventListener('submit', async e => {
  try {
    e.preventDefault();
    showSpiner(sendEmailBtn);
    const emailInput = document.querySelector('.email');
    console.log(emailInput.value);
    let res = await fetch(`${API_URL}/email`, {
      method: 'POST',
      body: JSON.stringify({
        email: emailInput.value,
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
    localStorage.setItem(
      'todo-app-reset-email',
      JSON.stringify(emailInput.value)
    );
    hideSpiner(sendEmailBtn, 'Send');
    errorMsgContainer.innerText = '';
    toVerifCodeLink.click();
  } catch (err) {
    errorMsgContainer.innerText = '';
    errorMsgContainer.insertAdjacentText('afterbegin', err.message);
    hideSpiner(sendEmailBtn, 'Send');
  }
});

toFormBtn.onclick = () => {
  toFormLink.click();
};

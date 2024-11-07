export function showSpiner(element) {
  // Display loading spin
  element.innerText = '';
  element.insertAdjacentHTML('afterbegin', '<div class="loading"></div>');
  element.setAttribute('disabled', 'disabled');
}

export function hideSpiner(element, displayedText) {
  element.innerText = '';
  element.insertAdjacentText('afterbegin', displayedText);
  element.removeAttribute('disabled');
}

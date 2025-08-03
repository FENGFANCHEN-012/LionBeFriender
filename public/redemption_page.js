// public/js/redemption_page.js

function getJWT() {
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    window.location.href = '/signin.html';
    throw new Error('Not logged in');
  }
  return token;
}

async function fetchCart() {
  const res = await fetch('/cart', {
    headers: { Authorization: `Bearer ${getJWT()}` }
  });
  const { cart } = await res.json();
  const listEl = document.getElementById('cart-list');
  listEl.innerHTML = '';
  let total = 0;
  cart.forEach(item => {
    total += item.cost_points * item.quantity;
    const li = document.createElement('li');
    li.innerHTML = `
      ${item.quantity}× ${item.title}
      <span class="float-end">${item.cost_points * item.quantity} LC</span>
    `;
    listEl.appendChild(li);
  });
  document.getElementById('total-cost').textContent = `${total} LionCoins`;
  return cart;
}

function allFieldsFilled() {
  const vals = [
    document.getElementById('firstName').value.trim(),
    document.getElementById('lastName').value.trim(),
    document.getElementById('email').value.trim(),
    document.getElementById('phone').value.trim()
  ];
  const method = document.querySelector('input[name="delivery"]:checked');
  return vals.every(v => v) && method;
}

function toggleConfirmBtn() {
  document.getElementById('confirmBtn').disabled = !allFieldsFilled();
}

// wire up validation
['firstName','lastName','email','phone'].forEach(id => {
  document.getElementById(id).addEventListener('input', toggleConfirmBtn);
});
document.querySelectorAll('input[name="delivery"]').forEach(el => {
  el.addEventListener('change', toggleConfirmBtn);
});

// on load: fetch cart
let currentCart = [];
document.addEventListener('DOMContentLoaded', async () => {
  currentCart = await fetchCart();
});

// on confirm click
document.getElementById('confirmBtn').addEventListener('click', async () => {
  try {
    // Checkout API
    const res = await fetch('/cart/checkout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${getJWT()}` }
    });
    if (!res.ok) throw new Error('Checkout failed');

    showSuccess('Redemption successful!');
    // refresh cart panel
    currentCart = await fetchCart();
  } catch (err) {
    console.error(err);
    showError('Could not complete redemption.');
  }
});

// public/js/rewards_page.js

function getJWT() {
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    window.location.href = '/signin.html';
    throw new Error('Not logged in');
  }
  return token;
}

async function fetchPoints() {
  const res = await fetch('/points', {
    headers: { Authorization: `Bearer ${getJWT()}` }
  });
  const { points } = await res.json();
  document.getElementById('user-points').innerHTML = `<span>${points}</span>`;
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
      <span>${item.quantity}× ${item.title}</span>
      <span>${item.cost_points * item.quantity} LC 
        <button class="btn btn-link btn-sm" onclick="removeFromCart(${item.cart_id})">remove</button>
      </span>
    `;
    listEl.appendChild(li);
  });
  document.getElementById('total-cost').textContent = `${total} LionCoins`;
}

async function addToCart(voucherId) {
  await fetch('/cart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getJWT()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ voucher_id: voucherId, quantity: 1 })
  });
  fetchCart();
}

async function removeFromCart(cartId) {
  await fetch(`/cart/${cartId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getJWT()}` }
  });
  fetchCart();
}

document.addEventListener('DOMContentLoaded', () => {
  fetchPoints();
  fetchCart();
});

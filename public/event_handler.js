
// Initialize event page on DOM load
document.addEventListener("DOMContentLoaded", function() {
  setupEventPage();
});

// Inject CSS styles for alerts
function injectAlertStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .alert-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0,0,0,0.85);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 99999;
    }
    .alert-box {
      background-color: #ffffff;
      padding: 50px 60px;
      border-radius: 25px;
      box-shadow: 0 15px 40px rgba(0,0,0,0.5);
      width: 70%;
      max-width: 700px;
      min-width: 500px;
      text-align: center;
      border: 4px solid #f5f5f5;
    }
    .alert-message {
      font-size: 32px;
      margin-bottom: 40px;
      color: #111111;
      line-height: 1.8;
      font-weight: 600;
      letter-spacing: 1px;
    }
    .alert-button {
      background: linear-gradient(135deg, #193C78 0%, #265BB8 100%);
      color: white;
      border: none;
      padding: 25px 50px;
      font-size: 28px;
      border-radius: 15px;
      cursor: pointer;
      transition: all 0.3s;
      min-width: 250px;
      box-shadow: 0 8px 16px rgba(0,0,0,0.2);
      font-weight efficacious: 600;
      letter-spacing: 1px;
      position: relative;
      overflow: hidden;
    }
    .alert-button::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255,255,255,0.2),
        transparent
      );
      transition: 0.5s;
    }
    .alert-button:hover::before {
      left: 100%;
    }
    .alert-button:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.3);
    }
    .alert-button:active {
      transform: translateY(2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }
    .cancel-btn {
      background: linear-gradient(135deg, #ff4d4d 0%, #e63939 100%);
    }
    .cancel-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 24px rgba(255,77,77,0.3);
    }
    .cancel-btn:active {
      transform: translateY(2px);
      box-shadow: 0 4px 8px rgba(255,77,77,0.2);
    }
    @media (max-width: 768px) {
      .alert-box {
        width: 90%;
        min-width: 90%;
        padding: 40px 30px;
      }
      .alert-message {
        font-size: 28px;
        margin-bottom: 30px;
      }
      .alert-button {
        font-size: 24px;
        padding: 20px 40px;
        min-width: 80%;
      }
    }
  `;
  document.head.appendChild(style);
}

// Show a generic alert
function showAlert(message, buttonText = 'OK', onClose = null) {
  const overlay = document.createElement('div');
  overlay.className = 'alert-overlay';
  
  const alertBox = document.createElement('div');
  alertBox.className = 'alert-box';
  
  const messageElement = document.createElement('div');
  messageElement.className = 'alert-message';
  messageElement.textContent = message;
  
  const button = document.createElement('button');
  button.className = 'alert-button';
  button.textContent = buttonText;
  
  alertBox.appendChild(messageElement);
  alertBox.appendChild(button);
  overlay.appendChild(alertBox);
  document.body.appendChild(overlay);
  
  button.onclick = () => {
    document.body.removeChild(overlay);
    if (onClose) onClose();
  };
}

// Show success alert
function showSuccess(message = 'Operation successful!') {
  showAlert(message, 'OK');
}

// Show error alert
function showError(message = 'An error occurred') {
  showAlert(message, 'Try Again');
}

// Show confirmation dialog
function showConfirm(message) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'alert-overlay';
    
    const alertBox = document.createElement('div');
    alertBox.className = 'alert-box';
    
    const messageElement = document.createElement('div');
    messageElement.className = 'alert-message';
    messageElement.textContent = message;
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '20px';
    buttonContainer.style.justifyContent = 'center';
    
    const confirmButton = document.createElement('button');
    confirmButton.className = 'alert-button';
    confirmButton.textContent = 'Confirm';
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'alert-button cancel-btn';
    cancelButton.textContent = 'Cancel';
    
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(confirmButton);
    alertBox.appendChild(messageElement);
    alertBox.appendChild(buttonContainer);
    overlay.appendChild(alertBox);
    document.body.appendChild(overlay);
    
    const cleanup = () => {
      document.body.removeChild(overlay);
    };
    
    confirmButton.onclick = () => {
      cleanup();
      resolve(true);
    };
    
    cancelButton.onclick = () => {
      cleanup();
      resolve(false);
    };
  });
}

// Format date for display
function formatDate(dateString) {
  if (!dateString) return 'Not specified';
  
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Date(dateString).toLocaleDateString('en-US', options);
}

// Initialize event page
async function setupEventPage() {
  injectAlertStyles();
  
  if (!localStorage.getItem("user_id")) {
    localStorage.setItem("user_id", "1");
  }
  
  const eventData = JSON.parse(localStorage.getItem('currentEvent')) || {};
  displayEventDetails(eventData);
  
  try {
    const isRegistered = await checkRegistrationStatus();
    updateButtonUI(isRegistered);
  } catch (error) {
    console.error("Error checking registration status:", error);
    showError("Failed to check registration status");
  }
}

// Display event details
function displayEventDetails(eventData) {
  const eventNameElement = document.getElementById('event_name_text');
  if (eventData.name) {
    eventNameElement.textContent = eventData.name;
  } else if (eventData.url) {
    eventNameElement.innerHTML = `For more details, visit <a href="${eventData.url}" target="_blank" style="color: var(--primary-blue); text-decoration: underline;">website</a>`;
  } else {
    eventNameElement.textContent = "Event Name Not Available";
  }

  document.getElementById('event_location').textContent = eventData.location || "Location not specified";
  
  const eventTime = document.getElementById('event_time');
  if (eventData.start && eventData.end) {
    eventTime.textContent = `${formatDate(eventData.start)} to ${formatDate(eventData.end)}`;
  } else {
    eventTime.textContent = eventData.time || "Date and time not specified";
  }
  
  document.getElementById('event_fee').textContent = eventData.fee || "Free";
  document.getElementById('event_description').textContent = eventData.description || "No description available";
  
  const eventImage = document.getElementById('event_image');
  const noImage = document.getElementById('no_image');
  
  if (eventData.image) {
    eventImage.src = eventData.image;
    eventImage.style.display = 'block';
    noImage.style.display = 'none';
  } else {
    eventImage.style.display = 'none';
    noImage.style.display = 'block';
  }

  const websiteBtn = document.getElementById('websiteBtn');
  if (eventData.url) {
    websiteBtn.href = eventData.url;
    websiteBtn.style.display = 'flex';
  } else {
    websiteBtn.style.display = 'none';
  }
}

// Check registration status
async function checkRegistrationStatus() {
  try {
    const eventData = JSON.parse(localStorage.getItem('currentEvent'));
    if (!eventData?.event_id) {
      console.error("Invalid event data");
      return false;
    }

    const userId = localStorage.getItem("user_id") || "1";
    const response = await fetch(`http://localhost:3000/events/status?event_id=${eventData.event_id}&user_id=${userId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    return data.exists && data.status === 'signed_up';
  } catch (error) {
    console.error("Error checking registration status:", error);
    return false;
  }
}

// Update button UI based on registration status
function updateButtonUI(isRegistered) {
  const button = document.getElementById("eventActionBtn");
  
  if (!button) {
    console.error("Button element not found");
    return;
  }

  if (isRegistered) {
    button.innerHTML = '<i class="fas fa-user-minus"></i> Cancel Registration';
    button.className = "blue-button cancel-btn";
    button.onclick = handleCancelRegistration;
  } else {
    button.innerHTML = '<i class="fas fa-user-plus"></i> Sign Up';
    button.className = "blue-button signup-btn";
    button.onclick = handleSignUp;
  }
}

// Handle event sign-up
async function handleSignUp() {
  try {
    const eventData = JSON.parse(localStorage.getItem('currentEvent'));
    if (!eventData?.event_id) {
      throw new Error("Invalid event data");
    }

    const userId = localStorage.getItem("user_id") || "1";
    const response = await fetch('http://localhost:3000/user_event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: parseInt(eventData.event_id),
        user_id: parseInt(userId)
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Sign-up failed");
    }

    const data = await response.json();
    showSuccess(data.message || "Sign-up successful!");
    updateButtonUI(true);
  } catch (error) {
    showError(error.message || "Sign-up failed, please try again");
  }
}

// Handle event cancellation
async function handleCancelRegistration() {
  const confirmed = await showConfirm("Are you sure you want to cancel your registration?");
  if (!confirmed) return;

  try {
    const eventData = JSON.parse(localStorage.getItem('currentEvent'));
    if (!eventData?.event_id) {
      throw new Error("Invalid event data");
    }

    const userId = localStorage.getItem("user_id") || "1";
    const response = await fetch('http://localhost:3000/user_event', {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_id: parseInt(eventData.event_id),
        user_id: parseInt(userId)
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Cancellation failed");
    }

    const data = await response.json();
    showSuccess(data.message || "Registration cancelled successfully");
    updateButtonUI(false);
  } catch (error) {
    showError(error.message || "Failed to cancel registration, please try again");
  }
}

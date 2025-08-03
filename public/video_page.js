// public/js/video_page.js

function getJWT() {
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    window.location.href = '/signin.html';
    throw new Error('Not logged in');
  }
  return token;
}

let player;
let videoFinished = false;
let currentPointValue = 0;

// 1) Called by YouTube IFrame API once it's ready
function onYouTubeIframeAPIReady() {
  const params = new URLSearchParams(window.location.search);
  const taskId = params.get('task_id');
  if (!taskId) {
    showError('No task specified');
    return;
  }

  fetch(`/video-tasks/${taskId}`, {
    headers: { Authorization: `Bearer ${getJWT()}` }
  })
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then(({ task }) => {
      currentPointValue = task.point_value;
      player = new YT.Player('player', {
        height: '390',
        width: '640',
        videoId: task.youtube_id,
        playerVars: {
          autoplay: 1,
          controls: 0,         // hide controls so they can't skip
          disablekb: 1         // disable keyboard shortcuts
        },
        events: { onStateChange: onPlayerStateChange }
      });
    })
    .catch(err => {
      console.error(err);
      showError('Failed to load video');
    });
}

// 2) Enable the button when video truly ends
function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    videoFinished = true;
    const btn = document.getElementById('completeBtn');
    btn.disabled = false;
    btn.classList.add('enabled');
  }
}

// 3) Wire up the completion flow
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('completeBtn');
  btn.addEventListener('click', async () => {
    if (!videoFinished) return;

    const taskId = new URLSearchParams(window.location.search).get('task_id');

    try {
      // record the watch
      const watchRes = await fetch('/video-watches', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getJWT()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ task_id: taskId })
      });
      if (!watchRes.ok) throw new Error('Watch logging failed');

      // award the points
      const ptsRes = await fetch('/points', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${getJWT()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ delta: currentPointValue })
      });
      if (!ptsRes.ok) throw new Error('Points award failed');

      // show the success alert, then redirect
      showSuccess(
        `You earned ${currentPointValue} LionCoins!`,
        () => window.location.href = 'earn_points.html'
      );
    } catch (err) {
      console.error('❌ completeTask error', err);
      showError('Could not award points. Please try again.');
    }
  });
});

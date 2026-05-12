const audioPlayer = document.getElementById('audio-player');
const audioSource = document.getElementById('audio-source');
const trackName = document.getElementById('track-name');
const fileInput = document.getElementById('file-input');
const dropZone = document.getElementById('drop-zone');
const playlist = document.getElementById('playlist');
const newTrackForm = document.getElementById('new-track-form');
const trackNameInput = document.getElementById('track-name-input');
const trackSrcInput = document.getElementById('track-src-input');
const formMessage = document.getElementById('form-message');
const apiBase = '/api';

function setFormMessage(message, type = 'info') {
  formMessage.textContent = message;
  formMessage.className = `form-message ${type}`;
}

function isValidMp3Url(url) {
  try {
    const parsed = new URL(url);
    return /^https?:$/i.test(parsed.protocol) && /\.mp3(?:[?#].*)?$/i.test(parsed.pathname);
  } catch (error) {
    return false;
  }
}

function loadTrack(track) {
  audioSource.src = track.src;
  audioPlayer.load();
  trackName.textContent = track.name;
  audioPlayer.play().catch(() => {
    console.log('User interaction required to play audio.');
  });
}

function renderPlaylist(tracks) {
  playlist.innerHTML = tracks
    .map(
      (track) => `
      <li data-src="${track.src}">
        <span>${track.name}</span>
        <small>Phát</small>
      </li>`
    )
    .join('');
}

async function loadPlaylist() {
  try {
    const response = await fetch(`${apiBase}/tracks`);
    const tracks = await response.json();
    renderPlaylist(tracks);
  } catch (error) {
    console.error('Không thể tải playlist:', error);
    playlist.innerHTML = '<li>Không thể tải dữ liệu từ server.</li>';
  }
}

playlist.addEventListener('click', (event) => {
  const item = event.target.closest('li');
  if (!item) return;
  const track = {
    name: item.querySelector('span').textContent,
    src: item.dataset.src,
  };
  loadTrack(track);
});

newTrackForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const newTrack = {
    name: trackNameInput.value.trim(),
    src: trackSrcInput.value.trim(),
  };

  if (!newTrack.name || !newTrack.src) {
    setFormMessage('Vui lòng nhập tên và đường dẫn MP3.', 'error');
    return;
  }

  if (!isValidMp3Url(newTrack.src)) {
    setFormMessage('URL phải là đường dẫn MP3 trực tiếp (ví dụ: https://.../file.mp3).', 'error');
    return;
  }

  setFormMessage('Đang gửi bài hát...', 'info');

  try {
    const response = await fetch(`${apiBase}/tracks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTrack),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || 'Lỗi khi thêm bài hát.';
      throw new Error(errorMessage);
    }

    trackNameInput.value = '';
    trackSrcInput.value = '';
    setFormMessage('Đã thêm bài hát vào database. Danh sách đang cập nhật...', 'success');
    loadPlaylist();
  } catch (error) {
    console.error(error);
    setFormMessage('Không thể thêm bài hát. Hãy kiểm tra lại URL và thử lại.', 'error');
  }
});

fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  trackName.textContent = file.name;
  audioSource.src = url;
  audioPlayer.load();
  audioPlayer.play();
});

dropZone.addEventListener('dragover', (event) => {
  event.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (event) => {
  event.preventDefault();
  dropZone.classList.remove('dragover');
  const file = event.dataTransfer.files[0];
  if (!file || !file.type.startsWith('audio/')) return;
  const url = URL.createObjectURL(file);
  trackName.textContent = file.name;
  audioSource.src = url;
  audioPlayer.load();
  audioPlayer.play();
});

loadPlaylist();

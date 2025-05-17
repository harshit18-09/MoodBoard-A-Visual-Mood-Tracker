const calendar = document.getElementById('calendar');
const modal = document.getElementById('moodModal');
const emojiGrid = document.getElementById('emojiGrid');
const noteInput = document.getElementById('note');
const colorInput = document.getElementById('color');
const saveBtn = document.getElementById('saveMood');
const monthYear = document.getElementById('monthYear');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const moodChart = document.getElementById('moodChart');
const topMood = document.getElementById('topMood');
const clearAllBtn = document.getElementById('clearAll');
const toggleThemeBtn = document.getElementById('toggleTheme');

let selectedDate = null;
let selectedEmoji = null;
let current = new Date();
let chartInstance = null;

const emojiOptions = ["😊","😐","😔","😡","😴","😎","😁","😢","😇","🤔","😤","🥳"];

function generateEmojiGrid() {
  emojiGrid.innerHTML = "";
  emojiOptions.forEach(e => {
    const span = document.createElement('span');
    span.textContent = e;
    span.className = "emoji-option";
    span.addEventListener('click', () => {
      document.querySelectorAll('.emoji-option').forEach(el => el.classList.remove('selected'));
      span.classList.add('selected');
      selectedEmoji = e;
    });
    emojiGrid.appendChild(span);
  });
}

function getKey(date) {
  return `mood-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function loadCalendar(year, month) {
  calendar.innerHTML = "";
  monthYear.textContent = `${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}`;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const moodCount = {};

  for (let i = 1; i <= daysInMonth; i++) {
    const dayDate = new Date(year, month, i);
    const key = getKey(dayDate);
    const data = JSON.parse(localStorage.getItem(key));
    const day = document.createElement('div');
    day.className = "day";
    day.textContent = i;

    if (data) {
      day.innerHTML = `<div style="font-size:22px">${data.emoji}</div>`;
      day.style.border = `3px solid ${data.color}`;
      moodCount[data.emoji] = (moodCount[data.emoji] || 0) + 1;
    }

    day.addEventListener('click', () => {
      selectedDate = dayDate;
      modal.style.display = 'flex';
      selectedEmoji = null;
      document.querySelectorAll('.emoji-option').forEach(el => el.classList.remove('selected'));
      noteInput.value = data ? data.note : '';
      colorInput.value = data ? data.color : '#2196f3';
    });

    calendar.appendChild(day);
  }

  updateChart(moodCount);
}

function updateChart(data) {
  const labels = Object.keys(data);
  const counts = Object.values(data);
  const backgroundColors = labels.map(() => '#' + Math.floor(Math.random()*16777215).toString(16));

  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(moodChart, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: counts,
        backgroundColor: backgroundColors
      }]
    },
    options: {
      plugins: {
        legend: {
          labels: {
            color: document.body.classList.contains('dark') ? 'white' : 'black'
          }
        }
      }
    }
  });

  if (counts.length > 0) {
    let max = Math.max(...counts);
    let index = counts.indexOf(max);
    topMood.textContent = `Top Mood: ${labels[index]}`;
  } else {
    topMood.textContent = '';
  }
}

prevMonthBtn.addEventListener('click', () => {
  current.setMonth(current.getMonth() - 1);
  loadCalendar(current.getFullYear(), current.getMonth());
});

nextMonthBtn.addEventListener('click', () => {
  current.setMonth(current.getMonth() + 1);
  loadCalendar(current.getFullYear(), current.getMonth());
});

saveBtn.addEventListener('click', () => {
  if (!selectedEmoji) {
    alert('Please select a mood emoji!');
    return;
  }
  const key = getKey(selectedDate);
  const moodData = {
    emoji: selectedEmoji,
    note: noteInput.value,
    color: colorInput.value
  };
  localStorage.setItem(key, JSON.stringify(moodData));
  modal.style.display = 'none';
  loadCalendar(current.getFullYear(), current.getMonth());
});

window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

clearAllBtn.addEventListener('click', () => {
  if (confirm('Clear all saved moods?')) {
    for (let i=0; i<localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('mood-')) {
        localStorage.removeItem(key);
        i--;
      }
    }
    loadCalendar(current.getFullYear(), current.getMonth());
  }
});

toggleThemeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  toggleThemeBtn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
  loadCalendar(current.getFullYear(), current.getMonth());
});

generateEmojiGrid();
loadCalendar(current.getFullYear(), current.getMonth());

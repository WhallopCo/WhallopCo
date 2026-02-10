 function toggleTheme() {
    const body = document.body;
    const btn = document.getElementById('theme-toggle');
    
    body.classList.toggle('light-mode');
    
    if (body.classList.contains('light-mode')) {
      btn.innerHTML = "Midnight Mode";
    } else {
      btn.innerHTML = "White Mode";
    }
  }
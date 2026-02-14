// 1. IMMEDIATE EXECUTION: Sets the theme BEFORE the page draws to prevent flashing
(function() {
    const savedTheme = localStorage.getItem('theme') || 'midnight';
    if (savedTheme === 'light') {
        document.documentElement.classList.add('light-mode');
    }
})();

// 2. TOGGLE FUNCTION
function toggleTheme() {
    const isLight = document.documentElement.classList.toggle('light-mode');
    const theme = isLight ? 'light' : 'midnight';
    localStorage.setItem('theme', theme);
    
    // Also toggle the midnight-mode class on body if still using it for specific CSS
    document.body.classList.toggle('midnight-mode', !isLight);
}

// 3. SYNC: Ensures the body class matches the saved preference on load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.remove('midnight-mode');
    }
});
// 1. IMMEDIATE EXECUTION: Sets the theme BEFORE the page draws to prevent flashing
(function() {
    const savedTheme = localStorage.getItem('theme') || 'midnight';
    if (savedTheme === 'light') {
        document.documentElement.classList.add('light-mode');
        // We use documentElement (HTML tag) because body might not exist yet
    }
})();

// 2. TOGGLE FUNCTION: Globally accessible for your onclick buttons
function toggleTheme() {
    const isLight = document.documentElement.classList.toggle('light-mode');
    const theme = isLight ? 'light' : 'midnight';
    localStorage.setItem('theme', theme);
    
    // Also toggle the midnight-mode class on body if you're still using it for specific CSS
    document.body.classList.toggle('midnight-mode', !isLight);
}

// 3. SYNC: Ensures the body class matches the saved preference on load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.remove('midnight-mode');
    }
});
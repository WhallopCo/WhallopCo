async function loadArchive() {
  try {
    const response = await fetch('data/content.json');
    let works = await response.json();
    
    // Sort by date: Newest First
    works.sort((a, b) => new Date(b.date) - new Date(a.date));

    works.forEach(work => {
      const section = document.getElementById(work.category);
      if (section) {
        const article = document.createElement('article');
        article.className = 'article-preview';
        
        const contentHtml = work.type === 'poem' 
          ? `<div class="poetry-block">${work.content}</div>`
          : `<p class="excerpt">${work.content}</p>`;

        // Format the date for the reader (e.g., "February 2026")
        const dateOptions = { month: 'long', year: 'numeric' };
        const displayDate = new Date(work.date).toLocaleDateString(undefined, dateOptions);
        // Inside your works.forEach loop in loader.js:

        // Create a URL-friendly version of the title (e.g., "The Cerulean Gate" -> "the-cerulean-gate")
        const articleUrl = work.title.replace(/\s+/g, '-').toLowerCase();

        article.innerHTML = `
            <span class="metadata">${work.date} • Volume I</span>
            <h2>${work.title}</h2>
            <div class="byline">By ${work.author}</div>
            ${contentHtml}
            <a href="article.html?id=${articleUrl}" class="btn-read">Full Manuscript</a>
        `;
        
        section.appendChild(article);
      }
    });
  } catch (error) {
    console.error("Archive Load Error:", error);
  }
}

loadArchive();

// TASK 4: Filter by Category (Verse, Prose, Research)
function filterCategory(target) {
  const categories = ['poetry', 'prose', 'research'];
  
  categories.forEach(cat => {
    const section = document.getElementById(`${cat}-section`);
    if (section) {
      if (target === 'all' || cat === target) {
        section.classList.remove('hidden-element');
        // Ensure articles inside are also visible
        section.querySelectorAll('.article-preview').forEach(a => a.classList.remove('hidden-element'));
      } else {
        section.classList.add('hidden-element');
      }
    }
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// NEW TASK: Filter by Author
function filterByAuthor(name) {
  // 1. Reset everything to visible first
  const sections = document.querySelectorAll('.category-section');
  const articles = document.querySelectorAll('.article-preview');
  sections.forEach(s => s.classList.remove('hidden-element'));
  articles.forEach(a => a.classList.remove('hidden-element'));

  // 2. Hide articles that don't match the name
  articles.forEach(article => {
    const byline = article.querySelector('.byline').innerText;
    if (!byline.includes(name)) {
      article.classList.add('hidden-element');
    }
  });

  // 3. Hide sections that now contain only hidden articles
  sections.forEach(section => {
    const visibleArticles = section.querySelectorAll('.article-preview:not(.hidden-element)');
    if (visibleArticles.length === 0) {
      section.classList.add('hidden-element');
    }
  });

  window.scrollTo({ top: 400, behavior: 'smooth' });
}

// Reset everything to the original state
function resetFilters() {
  document.querySelectorAll('.hidden-element').forEach(el => el.classList.remove('hidden-element'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
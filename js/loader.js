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
        
        // IMPROVED SUMMARY LOGIC: 
        // 1. Use summary if it exists.
        // 2. If no summary and it's a PDF, use a placeholder.
        // 3. Otherwise, take a 200-character snippet of the text content.
        let previewText = "";
        if (work.summary) {
          previewText = work.summary;
        } else if (work.content.endsWith('.pdf')) {
          previewText = "Manuscript available in PDF format. Click below to view.";
        } else {
          previewText = work.content.substring(0, 200) + "...";
        }

        const contentHtml = work.type === 'poem' 
          ? `<div class="poetry-block">${previewText}</div>`
          : `<p class="excerpt">${previewText}</p>`;

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

// LENS SYSTEM: Filter by Category
function filterCategory(target) {
  const categories = ['poetry', 'prose', 'research'];
  
  categories.forEach(cat => {
    const section = document.getElementById(`${cat}-section`);
    if (section) {
      if (target === 'all' || cat === target) {
        section.classList.remove('hidden-element');
        section.querySelectorAll('.article-preview').forEach(a => a.classList.remove('hidden-element'));
      } else {
        section.classList.add('hidden-element');
      }
    }
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// LENS SYSTEM: Filter by Author
function filterByAuthor(name) {
  const sections = document.querySelectorAll('.category-section');
  const articles = document.querySelectorAll('.article-preview');

  sections.forEach(s => s.classList.remove('hidden-element'));
  articles.forEach(a => a.classList.remove('hidden-element'));

  articles.forEach(article => {
    const byline = article.querySelector('.byline').innerText;
    if (!byline.includes(name)) {
      article.classList.add('hidden-element');
    }
  });

  sections.forEach(section => {
    const visibleArticles = section.querySelectorAll('.article-preview:not(.hidden-element)');
    if (visibleArticles.length === 0) {
      section.classList.add('hidden-element');
    }
  });
  window.scrollTo({ top: 400, behavior: 'smooth' });
}

function resetFilters() {
  document.querySelectorAll('.hidden-element').forEach(el => el.classList.remove('hidden-element'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

loadArchive();
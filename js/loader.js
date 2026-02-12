// Global state for the Chunk Loader
let allWorks = [];
let displayCounts = {
  poetry: 5,
  prose: 5,
  research: 5
};

async function loadArchive() {
  try {
    const response = await fetch('data/content.json');
    allWorks = await response.json();
    
    // Sort by date: Newest First
    allWorks.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Initial render for each category
    renderCategory('poetry');
    renderCategory('prose');
    renderCategory('research');
    
  } catch (error) {
    console.error("Archive Load Error:", error);
  }
}

function romanize(num) {
    if (isNaN(num)) return "I";
    const lookup = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1};
    let roman = '';
    for (let i in lookup) {
        while (num >= lookup[i]) {
            roman += i;
            num -= lookup[i];
        }
    }
    return roman;
}

function renderCategory(category) {
  const container = document.getElementById(category);
  const sectionWrapper = document.getElementById(`${category}-section`);
  
  // Clear container before rendering (useful for filters)
  container.innerHTML = '';
  
  // Filter works by category
  const categoryWorks = allWorks.filter(w => w.category === category);
  
  // Determine how many to show
  const limit = displayCounts[category];
  const itemsToShow = categoryWorks.slice(0, limit);

  itemsToShow.forEach(work => {
    const article = document.createElement('article');
    article.className = 'article-preview';
    
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

    const volLabel = work.volume ? romanize(work.volume) : "I";

    article.innerHTML = `
      <span class="metadata">${work.date} • Volume ${volLabel}</span>
      <h2>${work.title}</h2>
      <div class="byline">By ${work.author}</div>
      ${contentHtml}
      <a href="article.html?id=${articleUrl}" class="btn-read">Full Manuscript</a>
    `;
    
    container.appendChild(article);
  });

  // Handle the "Load More" button
  updateLoadMoreButton(category, categoryWorks.length);
}

function updateLoadMoreButton(category, totalCount) {
  const sectionWrapper = document.getElementById(`${category}-section`);
  let btn = sectionWrapper.querySelector('.load-more-btn');
  
  // Remove existing button if it's there
  if (btn) btn.remove();

  // Only add button if there are more items to show
  if (displayCounts[category] < totalCount) {
    btn = document.createElement('button');
    btn.className = 'load-more-btn';
    btn.innerText = `View More ${category.charAt(0).toUpperCase() + category.slice(1)}`;
    btn.onclick = () => {
      displayCounts[category] += 5;
      renderCategory(category);
    };
    sectionWrapper.appendChild(btn);
  }
}

// LENS SYSTEM: Adjusted to reset counts when filtering
function filterCategory(target) {
  const categories = ['poetry', 'prose', 'research'];
  categories.forEach(cat => {
    const section = document.getElementById(`${cat}-section`);
    if (target === 'all' || cat === target) {
      section.classList.remove('hidden-element');
    } else {
      section.classList.add('hidden-element');
    }
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function filterByAuthor(name) {
  // Reveal all, then filter
  resetFilters();
  const articles = document.querySelectorAll('.article-preview');
  articles.forEach(article => {
    if (!article.querySelector('.byline').innerText.includes(name)) {
      article.classList.add('hidden-element');
    }
  });
}

function resetFilters() {
  document.querySelectorAll('.hidden-element').forEach(el => el.classList.remove('hidden-element'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function searchArchive() {
  const query = document.getElementById('archiveSearch').value.toLowerCase();
  const categories = ['poetry', 'prose', 'research'];

  // 1. THE RESET LOGIC: If the search bar is empty, restore the chunked view
  if (query === "") {
    categories.forEach(cat => {
      const section = document.getElementById(`${cat}-section`);
      section.style.display = 'block';
      renderCategory(cat);
    });
    return;
  }

  // 2. THE FILTER LOGIC: Search through the master list
  const filtered = allWorks.filter(work => {
    const volNum = work.volume ? work.volume.toString() : "";
    const volRoman = work.volume ? romanize(work.volume).toLowerCase() : "";
    return (
      work.title.toLowerCase().includes(query) || 
      work.author.toLowerCase().includes(query) || 
      (work.summary && work.summary.toLowerCase().includes(query)) ||
      volNum.includes(query) ||        // Matches "1", "2"
      volRoman.includes(query)         // Matches "i", "ii", "iv"
    );
  });

  // 3. THE DISPLAY LOGIC: Clear containers and show results
  categories.forEach(cat => {
    const container = document.getElementById(cat);
    const section = document.getElementById(`${cat}-section`);
    if (!container || !section) return;
    container.innerHTML = ''; // Clear the "Chunked" view
    const btn = section.querySelector('.load-more-btn');
    if (btn) btn.style.display = 'none';

    const matches = filtered.filter(w => w.category === cat);
    
    if (matches.length > 0) {
      section.style.display = 'block';
      matches.forEach(work => {
        // Re-use your existing article creation logic
        const article = document.createElement('article');
        article.className = 'article-preview';
        
        // Ensure \n line breaks are handled in search previews too
        const volLabel = work.volume ? romanize(work.volume) : "I";
        const previewText = (work.summary ? work.summary : work.content.substring(0, 200) + "...").replace(/\\n/g, '<br>');
        const articleUrl = work.title.replace(/\s+/g, '-').toLowerCase();

        article.innerHTML = `
          <span class="metadata">${work.date} • Volume ${volLabel}</span>
          <h2>${work.title}</h2>
          <div class="byline">By ${work.author}</div>
          <p class="excerpt">${previewText}</p>
          <a href="article.html?id=${articleUrl}" class="btn-read">Full Manuscript</a>
        `;
        container.appendChild(article);
      });
    } else {
      section.style.display = 'none';
    }
  });
}

loadArchive();
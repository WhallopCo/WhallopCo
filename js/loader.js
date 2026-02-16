// Global state for the Chunk Loader
let allWorks = [];
let displayCounts = {
  poetry: 5,
  prose: 5,
  research: 5
};
let activeAuthorFilter = null;

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
    container.innerHTML = '';
  // Filter works by category
  let categoryWorks = allWorks.filter(w => w.category === category);
  if (activeAuthorFilter) {
    categoryWorks = categoryWorks.filter(w => w.author.includes(activeAuthorFilter));
  }

  if (categoryWorks.length === 0) {
    sectionWrapper.classList.add('hidden-element');
    sectionWrapper.style.display = 'none'; // Double ensure it hides
  } else {
    sectionWrapper.classList.remove('hidden-element');
    sectionWrapper.style.display = 'block';
  }

  // Determine how many to show
  const limit = displayCounts[category];
  const itemsToShow = categoryWorks.slice(0, limit);

  itemsToShow.forEach(work => {
    const article = document.createElement('article');
    article.className = 'article-preview';
    
    // 1. DEFINE VARIABLES FIRST
    const volLabel = work.volume ? romanize(work.volume) : "I";
    const articleUrl = work.id;

    let previewText = work.summary || "View manuscript for full details.";
    previewText = previewText.replace(/\\n/g, '<br>');

    if (work.content && work.content.endsWith('.pdf')) {
      previewText = "Manuscript available in PDF format. Click below to view.";
    }

    const contentHtml = work.type === 'poem' 
      ? `<div class="poetry-block">${previewText}</div>`
      : `<p class="excerpt">${previewText}</p>`;

    // 3. RENDER ONCE
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

// LENS SYSTEM
function filterCategory(target) {
  const categories = ['poetry', 'prose', 'research'];
  const heroSection = document.querySelector('.hero');

  if (heroSection) {
    heroSection.classList.add('hero-hidden');
  }

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
  // 1. Set the global memory
  activeAuthorFilter = name;

  // 2. Reset the counts so the user starts at the top of the author's list
  displayCounts = { poetry: 5, prose: 5, research: 5 };

  // 3. Hide the Hero
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
     heroSection.classList.add('hero-hidden');
  }

  // 4. Re-render all categories (renderCategory will now see the activeAuthorFilter)
  renderCategory('poetry');
  renderCategory('prose');
  renderCategory('research');

  // 5. Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function resetFilters() {
  // 1. Clear the memory
  activeAuthorFilter = null;
  
  // 2. Reset counts
  displayCounts = { poetry: 5, prose: 5, research: 5 };

  // 3. Show Hero
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    heroSection.classList.remove('hero-hidden');
  }

  // 4. Re-render everything normally
  renderCategory('poetry');
  renderCategory('prose');
  renderCategory('research');

  // 5. Ensure all sections are visible (in case they were hidden by empty author results)
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
    const workDate = work.date ? work.date.toLowerCase() : "";
    const volFullNum = `volume ${volNum}`;
    const volFullRoman = `volume ${volRoman}`;
    const volShortNum = `vol ${volNum}`;
    const volShortRoman = `vol ${volRoman}`;
    return (
      work.title.toLowerCase().includes(query) || 
      work.author.toLowerCase().includes(query) || 
      (work.summary && work.summary.toLowerCase().includes(query)) ||
      volFullNum.includes(query) ||        // Matches "volume 10" or just "10"
      volFullRoman.includes(query) ||      // Matches "volume x" or just "x"
      volShortNum.includes(query) ||       // Matches "vol 10"
      volShortRoman.includes(query) ||     // Matches "vol x"
      workDate.includes(query)             // Matches "2025" or "2025-11"
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
        const article = document.createElement('article');
        article.className = 'article-preview';
        
        const volLabel = work.volume ? romanize(work.volume) : "I";
        const articleUrl = work.id; 
        let previewText = work.summary || "View manuscript for full details.";
        previewText = previewText.replace(/\\n/g, '<br>');

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
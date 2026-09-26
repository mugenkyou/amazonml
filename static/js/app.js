/**
 * Unstop Leaderboard Explorer Frontend JavaScript
 * Provides debounced autocomplete and keyboard navigation for organization search.
 */

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("org-search-input");
  const autocompleteList = document.getElementById("autocomplete-list");
  const searchForm = document.getElementById("search-form");

  if (!searchInput || !autocompleteList) return;

  let debounceTimer = null;
  let currentFocusIndex = -1;
  let items = [];

  function debounce(func, delay) {
    return (...args) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(this, args), delay);
    };
  }

  async function fetchSuggestions(query) {
    if (!query || query.trim().length < 1) {
      autocompleteList.style.display = "none";
      autocompleteList.innerHTML = "";
      items = [];
      return;
    }

    try {
      const response = await fetch(`/api/organizations?q=${encodeURIComponent(query.trim())}&limit=8`);
      if (!response.ok) return;

      const data = await response.json();
      renderSuggestions(data.organizations || []);
    } catch (err) {
      console.error("Autocomplete fetch error:", err);
    }
  }

  function renderSuggestions(orgs) {
    if (!orgs || orgs.length === 0) {
      autocompleteList.style.display = "none";
      autocompleteList.innerHTML = "";
      items = [];
      return;
    }

    currentFocusIndex = -1;
    autocompleteList.innerHTML = "";

    orgs.forEach((org, index) => {
      const itemEl = document.createElement("div");
      itemEl.className = "autocomplete-item";
      itemEl.dataset.index = index;
      itemEl.innerHTML = `
        <span class="autocomplete-name">${escapeHtml(org.organization)}</span>
        <span class="autocomplete-meta">${org.team_count} teams</span>
      `;

      itemEl.addEventListener("click", () => {
        searchInput.value = org.organization;
        autocompleteList.style.display = "none";
        if (searchForm) {
          searchForm.submit();
        }
      });

      autocompleteList.appendChild(itemEl);
    });

    items = autocompleteList.querySelectorAll(".autocomplete-item");
    autocompleteList.style.display = "block";
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function setActive(index) {
    items.forEach((item, idx) => {
      if (idx === index) {
        item.classList.add("active");
        item.scrollIntoView({ block: "nearest" });
      } else {
        item.classList.remove("active");
      }
    });
  }

  const debouncedFetch = debounce((e) => {
    fetchSuggestions(e.target.value);
  }, 200);

  searchInput.addEventListener("input", debouncedFetch);

  searchInput.addEventListener("keydown", (e) => {
    if (autocompleteList.style.display !== "block" || items.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      currentFocusIndex = (currentFocusIndex + 1) % items.length;
      setActive(currentFocusIndex);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      currentFocusIndex = (currentFocusIndex - 1 + items.length) % items.length;
      setActive(currentFocusIndex);
    } else if (e.key === "Enter") {
      if (currentFocusIndex >= 0 && items[currentFocusIndex]) {
        e.preventDefault();
        items[currentFocusIndex].click();
      }
    } else if (e.key === "Escape") {
      autocompleteList.style.display = "none";
    }
  });

  // Close dropdown on outside click
  document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target) && !autocompleteList.contains(e.target)) {
      autocompleteList.style.display = "none";
    }
  });
});

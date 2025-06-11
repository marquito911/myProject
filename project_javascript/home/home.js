import { readFromLS, writeToLS } from "../register/util.js";
import { filtrareSortare } from "./filtrare.js";

const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
if (!loggedInUser) {
  window.location.href = "../login/login.html";
}
const sortareSelect = document.querySelector("#sortareSelect");

sortareSelect.addEventListener("change", () => {
  const sortKey = sortareSelect.value;
  applyFiltersAndSorting(sortKey);
});

const userName = loggedInUser.userNameInput;
const tableBody = document.querySelector("#anuntadaugat");
const paginationContainer = document.createElement("div");
paginationContainer.id = "pagination";
document.querySelector("main").appendChild(paginationContainer);

const outPutPagination = document.createElement("div");
outPutPagination.id = "outPut";
document.querySelector("main").appendChild(outPutPagination);

let allAnnouncements = [];
let filteredAnnouncements = [];
const itemsPerPage = 5;
let currentPage = 1;
let sortOrder = "asc";

const loadAnnouncements = () => {
  tableBody.innerHTML = "";
  allAnnouncements = [];
  const announcementsFromLS = readFromLS("announcements") || {};
  Object.keys(announcementsFromLS).forEach((user) => {
    announcementsFromLS[user].forEach((announcement) => {
      allAnnouncements.push(announcement);
    });
  });
  applyFiltersAndSorting();
};

const showPage = (page, data = filteredAnnouncements) => {
  tableBody.innerHTML = "";
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageItems = data.slice(startIndex, endIndex);

  pageItems.forEach((announcement) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${announcement.oras}</td>
      <td>${announcement.strada}</td>
      <td>${announcement.numar}</td>
      <td>${announcement.metri} ㎡</td>
      <td>${announcement.aerConditionat}</td>
      <td>${announcement.an}</td>
      <td>${announcement.pret} €</td>
      <td>${new Date(announcement.disponibilitate).toLocaleDateString("ro-RO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}</td>
    `;

    const favoriteBtn = document.createElement("button");
    favoriteBtn.textContent = "Adauga anunt favorit";
    favoriteBtn.className = "favoritebtn";

    const favorites = getFavorites();
    const isFavo = favorites.some(
      (fav) => JSON.stringify(fav) === JSON.stringify(announcement)
    );
    if (isFavo) {
      favoriteBtn.textContent = "Elimina anuntul din favorite";
      favoriteBtn.style.backgroundColor = "#316203";
    }

    favoriteBtn.addEventListener("click", () => toggleFavorite(announcement));
    const favoriteCell = document.createElement("td");
    favoriteCell.appendChild(favoriteBtn);
    row.appendChild(favoriteCell);
    tableBody.appendChild(row);
  });
};
const updatePagination = () => {
  paginationContainer.innerHTML = "";
  const totalPages = Math.ceil(filteredAnnouncements.length / itemsPerPage);

  if (totalPages < 1) {
    return;
  }
  const prevPageBtn = document.createElement("button");
  prevPageBtn.textContent = "Pagina Anterioara";
  prevPageBtn.disabled = currentPage === 1;
  prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      showPage(currentPage);
      updatePagination();
    }
  });
  paginationContainer.appendChild(prevPageBtn);

  // const firstPageBtn = document.createElement("button");
  // firstPageBtn.textContent = "1";
  // firstPageBtn.className = currentPage === 1 ? "active-page" : "";
  // firstPageBtn.addEventListener("click", () => {
  //   currentPage = 1;
  //   showPage(currentPage);
  //   updatePagination();
  // });
  // paginationContainer.appendChild(firstPageBtn);

  // const totalPagesToShow = Math.min(totalPages, 0);
  // for (let i = 2; i <= totalPagesToShow; i++) {
  //   const pageBtn = document.createElement("button");
  //   pageBtn.textContent = i;
  //   pageBtn.className = i === currentPage ? "active-page" : "";
  //   pageBtn.addEventListener("click", () => {
  //     currentPage = i;
  //     showPage(currentPage);
  //     updatePagination();
  //   });
  //   paginationContainer.appendChild(pageBtn);
  // }

  const nextPageBtn = document.createElement("button");
  nextPageBtn.textContent = "Pagina Urmatoare";
  nextPageBtn.disabled = currentPage === totalPages;
  nextPageBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      showPage(currentPage);
      updatePagination();
    }
  });
  paginationContainer.appendChild(nextPageBtn);

  let pageIndicator = document.querySelector("#pageIndicator");
  if (!pageIndicator) {
    pageIndicator = document.createElement("span");
    pageIndicator.id = "pageIndicator"; 
    outPutPagination.appendChild(pageIndicator);
  }
  pageIndicator.textContent = `Pagina ${currentPage} din ${totalPages}`;
};

const applyFiltersAndSorting = () => {
  const filters = {
    oras: document.querySelector("#filtreOras").value,
    pretMin: document.querySelector("#filtrePretMin").value,
    pretMax: document.querySelector("#filtrePretMax").value,
    metriMin: document.querySelector("#filtreMetriMin").value,
    metriMax: document.querySelector("#filtreMetriMax").value,
  };
  const sortKey = document.querySelector("#sortareSelect").value;
  currentPage = 1;
  filteredAnnouncements = filtrareSortare(
    allAnnouncements,
    filters,
    sortKey,
    sortOrder
  );
  showPage(currentPage);
  updatePagination();
};
const filterInputs = document.querySelectorAll(
  "#filtreOras, #filtrePretMin, #filtrePretMax, #filtreMetriMin, #filtreMetriMax"
);

filterInputs.forEach((input) => {
  input.addEventListener("input", () => {
    applyFiltersAndSorting();
  });
});

document.querySelector("#sortBtn").addEventListener("click", () => {
  sortOrder = sortOrder === "asc" ? "desc" : "asc";
  document.querySelector("#sortBtn").textContent =
    sortOrder === "asc" ? "Ascendent" : "Descendent";

  applyFiltersAndSorting();
});

const getFavorites = () => {
  const favorites = readFromLS("favorit") || {};
  return favorites[userName] || [];
};

const saveFavorites = (favorites) => {
  let allFavorites = readFromLS("favorit") || {};
  allFavorites[userName] = favorites;
  writeToLS("favorit", allFavorites);
};

const toggleFavorite = (announcement) => {
  let favorites = getFavorites();
  const index = favorites.findIndex(
    (fav) => JSON.stringify(fav) === JSON.stringify(announcement)
  );
  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(announcement);
  }
  saveFavorites(favorites);
  showPage(currentPage);
  updatePagination();
  // loadAnnouncements();
};

loadAnnouncements();

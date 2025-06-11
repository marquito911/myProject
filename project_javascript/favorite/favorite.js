import { readFromLS, writeToLS } from "../register/util.js";

const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
if (!loggedInUser) {
  window.location.href = "../login/login.html";
}

const userName = loggedInUser.userNameInput;
const tableBody = document.querySelector("#addTable");
const paginationContainer = document.createElement("div");
paginationContainer.id = "pagination";
document.querySelector("main").appendChild(paginationContainer);
const outPutPagination = document.createElement("div");
outPutPagination.id = "outPut";
document.querySelector("main").appendChild(outPutPagination);

let favorites = [];
const itemsPerPage = 5;
let currentPage = 1;

const getFavorites = () => {
  const favoritesFromLS = readFromLS("favorit") || {};
  return favoritesFromLS[userName] || [];
};

const saveFavorites = (favorites) => {
  let allFavorites = readFromLS("favorit") || {};
  allFavorites[userName] = favorites;
  writeToLS("favorit", allFavorites);
};

const loadFavorites = () => {
  tableBody.innerHTML = "";
  favorites = getFavorites();

  if (favorites.length > 0) {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageFavorites = favorites.slice(startIndex, endIndex);

    pageFavorites.forEach((announcement) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${announcement.oras}</td>
        <td>${announcement.strada}</td>
        <td>${announcement.numar}</td>
        <td>${announcement.metri} ㎡</td>
        <td>${announcement.aerConditionat}</td>
        <td>${announcement.an}</td>
        <td>${announcement.pret} €</td>
        <td>${new Date(announcement.disponibilitate).toLocaleDateString(
          "ro-RO",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        )}</td>
      `;

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "Sterge anunt favorit";
      removeBtn.className = "removefavoritebtn";
      removeBtn.addEventListener("click", () => removeFavorite(announcement));
      const removeCell = document.createElement("td");
      removeCell.appendChild(removeBtn);
      row.appendChild(removeCell);

      tableBody.appendChild(row);
    });
  } else {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="9">Nu exista anunt favorit.</td>`;
    tableBody.appendChild(row);
  }

  updatePagination();
};

const removeFavorite = (announcement) => {
  let favorites = getFavorites();
  favorites = favorites.filter(
    (fav) => JSON.stringify(fav) !== JSON.stringify(announcement)
  );
  saveFavorites(favorites);
  loadFavorites();
};

const updatePagination = () => {
  paginationContainer.innerHTML = "";
  const totalPages = Math.ceil(favorites.length / itemsPerPage);

  if (totalPages <= 1) {
    return;
  }

  const prevPageBtn = document.createElement("button");
  prevPageBtn.textContent = "Pagina Anterioara";
  prevPageBtn.disabled = currentPage === 1;
  prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      loadFavorites();
    }
  });
  paginationContainer.appendChild(prevPageBtn);

  const nextPageBtn = document.createElement("button");
  nextPageBtn.textContent = "Pagina Urmatoare";
  nextPageBtn.disabled = currentPage === totalPages;
  nextPageBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      loadFavorites();
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

loadFavorites();

import { readFromLS } from "../register/util.js";
import { filtrareSortare } from "./filtrare.js";

const tableBody = document.querySelector("#anuntadaugat");
const paginationContainer = document.createElement("div");
paginationContainer.id = "pagination";
document.querySelector("main").appendChild(paginationContainer);
const outPutPagination = document.createElement("div");
outPutPagination.id = "outPut";
document.querySelector("main").appendChild(outPutPagination);

const itemsPerPage = 5;
let currentPage = 1;
let allAnnouncements = [];

const loadAnnouncements = () => {
  tableBody.innerHTML = "";
  allAnnouncements = [];
  const announcementsFromLS = readFromLS("announcements") || {};
  Object.values(announcementsFromLS).forEach((userAnnouncements) => {
    allAnnouncements.push(...userAnnouncements);
  });
  showPage(currentPage);
  updatePagination();
};

const showPage = (page) => {
  tableBody.innerHTML = "";
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageItems = allAnnouncements.slice(startIndex, endIndex);

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
    tableBody.appendChild(row);
  });
};

const updatePagination = () => {
  paginationContainer.innerHTML = "";
  const totalPages = Math.ceil(allAnnouncements.length / itemsPerPage);

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

loadAnnouncements();

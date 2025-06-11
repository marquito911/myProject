const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
if (!loggedInUser) {
  window.location.href = "../login/login.html";
}

const userName = loggedInUser.userNameInput;
const announcementsFromLS =
  JSON.parse(localStorage.getItem("announcements")) || {};
let favoritFromLs = JSON.parse(localStorage.getItem("favorit")) || {};
if (!favoritFromLs[userName]) {
  favoritFromLs[userName] = [];
}

const tableBody = document.querySelector("#addTable");
tableBody.innerHTML = "";

let filteredAnnouncements = announcementsFromLS[userName] || [];
const itemsPerPage = 5;
let currentPage = 1;
const paginationContainer = document.createElement("div");
paginationContainer.id = "pagination";
document.querySelector("main").appendChild(paginationContainer);
const outPutPagination = document.createElement("div");
outPutPagination.id = "outPut";
document.querySelector("main").appendChild(outPutPagination);

const showPage = (page) => {
  tableBody.innerHTML = "";
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageItems = filteredAnnouncements.slice(startIndex, endIndex);

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
      <td><button class="deletebtnadd">Sterge anunt</button></td>
      <td><button class="editbtnadd">Editare anunt</button></td>
    `;
    tableBody.appendChild(row);
    row.querySelector(".deletebtnadd").addEventListener("click", () => {
      const confirmareStergere = window.confirm(
        "Anuntul se va sterge. Sigur doriti sa il stergeti?"
      );
      if (confirmareStergere) {
        announcementsFromLS[userName].splice(
          filteredAnnouncements.indexOf(announcement),
          1
        );
        localStorage.setItem(
          "announcements",
          JSON.stringify(announcementsFromLS)
        );
        Object.keys(favoritFromLs).forEach((key) => {
          favoritFromLs[key] = favoritFromLs[key].filter((fav) => {
            return (
              fav.oras !== announcement.oras ||
              fav.strada !== announcement.strada ||
              fav.numar !== announcement.numar ||
              fav.metri !== announcement.metri ||
              fav.aerConditionat !== announcement.aerConditionat ||
              fav.an !== announcement.an ||
              fav.pret !== announcement.pret ||
              new Date(fav.disponibilitate).toLocaleDateString("ro-RO", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }) !==
                new Date(announcement.disponibilitate).toLocaleDateString(
                  "ro-RO",
                  { year: "numeric", month: "long", day: "numeric" }
                )
            );
          });
        });
        localStorage.setItem("favorit", JSON.stringify(favoritFromLs));
        row.remove();
        showPage(currentPage);
        updatePagination();
      }
    });
    row.querySelector(".editbtnadd").addEventListener("click", () => {
      localStorage.setItem("editAnnouncementnou", JSON.stringify(announcement));
      window.location.href = "../myflats/edit.html";
    });
  });
};
const updatePagination = () => {
  paginationContainer.innerHTML = "";
  const totalPages = Math.ceil(filteredAnnouncements.length / itemsPerPage);

  if (totalPages <= 1) {
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

showPage(currentPage);
updatePagination();

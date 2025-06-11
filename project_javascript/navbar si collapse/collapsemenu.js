import { removeFromLS } from "../register/util.js";
import { readFromLS } from "../register/util.js";
import { logoutInvalidSession } from "../register/util.js";
import { CHECK_INTERVAL } from "../register/util.js";

document.getElementById("profilBtn").addEventListener("click", function () {
  document.getElementById("profilMenu").classList.toggle("active");
});
document.addEventListener("click", function (event) {
  let menu = document.getElementById("profilMenu");
  let button = document.getElementById("profilBtn");
  if (!menu.contains(event.target) && event.target !== button) {
    menu.classList.remove("active");
  }
});

const currentUserInfo = document.querySelector(".currentUserClass");
const loggedUser = readFromLS("loggedInUser") || {};

const sessionCheckInterval = setInterval(
  () => logoutInvalidSession(loggedUser, sessionCheckInterval),
  CHECK_INTERVAL
);

if (!loggedUser) {
  location.assign("./register.html");
}

const { userNameInput } = loggedUser;

// console.log(currentUserInfo);
currentUserInfo.innerHTML = `Bun venit,  <span style="color:black">${userNameInput}</span> `;

logOutBtn.addEventListener("click", (e) => {
  e.preventDefault();
  removeFromLS("loggedInUser");
  location.assign("../login/login.html");
});

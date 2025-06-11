import { readFromLS } from "../register/util.js";
import { checkIfUserExistAndLogin } from "../register/util.js";
import { isUserLoggedIn } from "../register/util.js";

const loggedUser = readFromLS("loggedInUser") || {};
const users = readFromLS("users") || [];

if (isUserLoggedIn(loggedUser)) {
  location.assign("../home/home.html");
}

const userNameInput = document.querySelector("#usernameInput");
const passwordInput = document.querySelector("#passwordInput");
const loginBtn = document.querySelector("#loginBtn");

loginBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const userNameInputValue = userNameInput.value;
  const passwordInputValue = passwordInput.value;
  checkIfUserExistAndLogin(
    users,
    userNameInputValue,
    passwordInputValue,
    "loggedInUser"
  );
});

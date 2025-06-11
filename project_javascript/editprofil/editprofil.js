import { writeToLS } from "../register/util.js";
import { readFromLS } from "../register/util.js";
import { logoutInvalidSession } from "../register/util.js";
import { CHECK_INTERVAL } from "../register/util.js";

const userName = document.getElementById("userName");
const email = document.getElementById("email");
const password = document.getElementById("password");
const confirmpassword = document.getElementById("confirmpassword");
const editbtn = document.getElementById("editbtn");
const error = document.getElementById("error");
const mesaj = document.getElementById("mesaj");
const loggedInUser = readFromLS("loggedInUser") || {};

userName.disabled = true;
email.disabled = true;
password.disabled = true;
confirmpassword.disabled = true;

const sessionCheckInterval = setInterval(
  () => logoutInvalidSession(loggedInUser, sessionCheckInterval),
  CHECK_INTERVAL
);

if (!loggedInUser || Object.keys(loggedInUser).length === 0) {
  location.assign("../login/login.html");
}

userName.value = loggedInUser.userNameInput;
email.value = loggedInUser.emailInput;
console.log(userName.value, email.value);
console.log("aici");

editbtn.addEventListener("click", (e) => {
  e.preventDefault();
  mesaj.innerHTML =
    "Pentru orice modificare este necesara introducerea parolei!";
  if (userName.disabled) {
    userName.disabled = false;
    email.disabled = false;
    password.disabled = false;
    confirmpassword.disabled = false;
    editbtn.textContent = "Salveaza modificarile";
  } else {
    error.innerHTML = "";
    const updatedUserInfo = {
      userNameInput: userName.value,
      emailInput: email.value,
      passwordInput: btoa(password.value),
      confirmpasswordInput: btoa(confirmpassword.value),
      loginTime: Date.now(),
    };

    if (
      updatedUserInfo.userNameInput === "" ||
      updatedUserInfo.emailInput === "" ||
      updatedUserInfo.passwordInput === "" ||
      updatedUserInfo.confirmpasswordInput === ""
    ) {
      error.innerHTML = `<sup>*</sup> Va rugam sa completati toate campurile.`;
      return;
    }

    if (
      updatedUserInfo.passwordInput !== updatedUserInfo.confirmpasswordInput
    ) {
      error.innerHTML = `<sup>*</sup> Parolele nu coincid.`;
      return;
    }

    if (!validateEmail(updatedUserInfo.emailInput)) {
      error.innerHTML = `<sup>*</sup> Emailul nu este valid.`;
      return;
    }

    if (!validatePassword(updatedUserInfo.passwordInput)) {
      return;
    }

    const users = readFromLS("users") || [];
    const userIndex = users.findIndex(
      (user) => user.userNameInput === loggedInUser.userNameInput
    );

    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updatedUserInfo };
      writeToLS("users", users);
      writeToLS("loggedInUser", users[userIndex]);
      window.location.assign("../editprofil/editprofil.html");
    } else {
      error.innerHTML = `<sup>*</sup> Utilizatorul nu a fost gasit.`;
    }
    userName.disabled = true;
    email.disabled = true;
    password.disabled = true;
    confirmpassword.disabled = true;
    editbtn.textContent = "Editeaza profilul";
  }
});

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePassword(password) {
  const decryptedpassword = atob(password);
  const upperCaseRegex = /[A-Z]/;
  const lowerCaseRegex = /[a-z]/;
  const numberCaseRegex = /[0-9]/;
  const specialCharRegex = /[!@#]/;
  if (decryptedpassword.length < 6) {
    error.innerHTML = `<sup>*</sup> Parola trebuie sa aiba minim 6 caractere`;
    return false;
  } else if (!upperCaseRegex.test(decryptedpassword)) {
    error.innerHTML = `<sup>*</sup> Parola trebuie sa aiba o litera mare`;
    return false;
  } else if (!lowerCaseRegex.test(decryptedpassword)) {
    error.innerHTML = `<sup>*</sup> Parola trebuie sa aiba o litera mica`;
    return false;
  } else if (!numberCaseRegex.test(decryptedpassword)) {
    error.innerHTML = `<sup>*</sup> Parola trebuie sa aiba o cifra`;
    return false;
  } else if (!specialCharRegex.test(decryptedpassword)) {
    error.innerHTML = `<sup>*</sup> Parola trebuie sa aiba un caracter special`;
    return false;
  }
  return true;
}

logOutBtn.addEventListener("click", (e) => {
  e.preventDefault();
  removeFromLS("loggedInUser");
  location.assign("../login/login.html");
});

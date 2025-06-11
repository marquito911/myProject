import { writeToLS, readFromLS, isUserLoggedIn } from "./util.js";
const userName = document.getElementById("userName");
const email = document.getElementById("email");
const lastName = document.getElementById("lastName");
const firstName = document.getElementById("firstName");
const password = document.getElementById("password");
const confirmpassword = document.getElementById("confirmpassword");
const age = document.getElementById("age");
let registerbtn = document.getElementById("registerbtn");
const error = document.getElementById("error");
const users = readFromLS("users") || [];
const loggedInUser = readFromLS("loggedInUser") || {};

if (isUserLoggedIn(loggedInUser)) {
  location.assign("../home/home.html");
}

registerbtn.addEventListener("click", (e) => {
  e.preventDefault();

  const formLetterFirstName = capsNameReg(firstName.value);
  const formLetterLastName = capsNameReg(lastName.value);

  const userInfo = {
    userNameInput: userName.value,
    emailInput: email.value,
    lastNameInput: formLetterLastName,
    firstNameInput: formLetterFirstName,
    passwordInput: btoa(password.value),
    confirmpasswordInput: btoa(confirmpassword.value),
    ageInput: age.value,
    loginTime: Date.now(),
  };

  if (
    userInfo.userNameInput === "" ||
    userInfo.emailInput === "" ||
    userInfo.firstNameInput === "" ||
    userInfo.lastNameInput === "" ||
    userInfo.passwordInput === "" ||
    userInfo.confirmpasswordInput === "" ||
    userInfo.ageInput === ""
  ) {
    error.innerHTML = `<sup>*</sup> Va rugam sa completati campurile goale.`;
    return;
  }

  if (userInfo.passwordInput !== userInfo.confirmpasswordInput) {
    console.log(userInfo.passwordInput, userInfo.confirmpasswordInput);
    error.innerHTML = `<sup>*</sup> Parolele nu coincid.`;
    return;
  }

  if (!validateEmail(userInfo.emailInput)) {
    error.innerHTML = `<sup>*</sup> Emailul nu este valid`;
    return;
  }

  if (!validatePassword(userInfo.passwordInput)) {
    return;
  }

  const userAge = calculateAge(userInfo.ageInput);
  if (userAge < 18) {
    error.innerHTML = `<sup>*</sup> Trebuie sa aveti peste 18 ani`;
    return;
  }

  const userArray = users.map((user) => user.userNameInput);
  const emailsArray = users.map((user) => user.emailInput);

  if (userArray.includes(userInfo.userNameInput)) {
    error.innerHTML = `<sup>*</sup> Username-ul este deja folosit de catre altcineva`;
    return;
  }

  if (emailsArray.includes(userInfo.emailInput)) {
    error.innerHTML = `<sup>*</sup> Email-ul este deja folosit de catre altcineva`;
    return;
  }

  users.push(userInfo);
  writeToLS("users", users);
  writeToLS("loggedInUser", userInfo);
  window.location.assign("../home/home.html");
});

function calculateAge(birthDate1) {
  const birthDate = new Date(birthDate1);
  const currentDate = new Date();

  let age = currentDate.getFullYear() - birthDate.getFullYear();
  const monthDifference = currentDate.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && currentDate.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePassword(password) {
  password = atob(password);
  // console.log(password)
  // return
  const upperCaseRegex = /[A-Z]/;
  const lowerCaseRegex = /[a-z]/;
  const numberCaseRegex = /[0-9]/;
  const specialCharRegex = /[!@#]/;
  const spaceRegex = /\s/;

  if (password.length < 6) {
    error.innerHTML = `<sup>*</sup> Parola trebuie sa aiba minim 6 caractere`;
    return false;
  } else if (!upperCaseRegex.test(password)) {
    error.innerHTML = `<sup>*</sup> Parola trebuie sa aiba o litera mare`;
    return false;
  } else if (spaceRegex.test(password)) {
    error.innerHTML = `<sup>*</sup> Parola nu poate contine spatii`;
    return false;
  } else if (!lowerCaseRegex.test(password)) {
    error.innerHTML = `<sup>*</sup> Parola trebuie sa aiba o litera mica`;
    return false;
  } else if (!numberCaseRegex.test(password)) {
    error.innerHTML = `<sup>*</sup> Parola trebuie sa aiba o cifra`;
    return false;
  } else if (!specialCharRegex.test(password)) {
    error.innerHTML = `<sup>*</sup> Parola trebuie sa aiba un caracter special`;
    return false;
  }
  return true;
}

function capsNameReg(word) {
  if (word && word.length > 0) {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }
  return word;
}

export const sessionTimeOut = 5 * 60 * 1000;

export const writeToLS = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};
export const readFromLS = (key) => {
  return JSON.parse(localStorage.getItem(key));
};
export const removeFromLS = (key) => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    return true;
  }
  return false;
};

export const checkIfUserExistAndLogin = (
  users,
  userNameInputValue,
  passwordInputValue,
  keyForLs
) => {
  const error = document.querySelector("#error");
  // console.log(passwordInputValue);
  const userExist = users.find(
    (user) =>
      user.userNameInput === userNameInputValue.trim() &&
      atob(user.passwordInput) === passwordInputValue.trim()
  );
  if (userExist) {
    userExist.loginTime = Date.now();
    localStorage.setItem(keyForLs, JSON.stringify(userExist));
    location.assign("../home/home.html");
  } else {
    error.innerHTML = `<sup>*</sup> Username sau parola incorecta`;
    error.innerHTML.color = "red";
  }
};

export const isUserLoggedIn = (loggedUser) =>
  Object.keys(loggedUser).length > 0;

export const CHECK_INTERVAL = 5000;

export function isSessionValid(loggedUser) {
  const currentTime = Date.now();
  const loginTime = loggedUser.loginTime || 0;
  return currentTime - loginTime < sessionTimeOut;
}

export function logoutInvalidSession(loggedUser, intervalID) {
  // console.log("test");
  if (!isSessionValid(loggedUser)) {
    clearInterval(intervalID);
    alert("Sesiunea a expirat");
    removeFromLS("loggedInUser");
    location.assign("../login/login.html");
  }
}

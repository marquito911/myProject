import { readFromLS, writeToLS } from "../register/util.js";

let users = readFromLS("users");
if (!Array.isArray(users)) {
  users = [];
}
writeToLS("users", users);

const loggedInUser = readFromLS("loggedInUser") || {};
const userName = loggedInUser.userNameInput || "";
const announcementsFromLS =
  JSON.parse(localStorage.getItem("announcements")) || {};
const orasInput = document.querySelector("#oras");
const stradaInput = document.querySelector("#strada");
const numarInput = document.querySelector("#numar");
const metriInput = document.querySelector("#metri");
const checkbtnInput = document.querySelector("#checkbtn");
const anInput = document.querySelector("#an");
const pretInput = document.querySelector("#pret");
const disponibilitateInput = document.querySelector("#disponibilitate");
const error = document.querySelector("#error");
const addBtn = document.querySelector(".addbtn");
const onlyLetterRegExp = /^[A-Za-z\s]+$/;
const stradaRegExp = /^(?:[a-zA-Z\-]+\s?)+(\d{1,2}\s[a-zA-Z\-]+(\s\d{4})?)?$/;
const numarStradaRegExp = /^\d{1,5}[a-zA-Z]{0,1}$/;
const validateNewAddForm = () => {
  error.innerHTML = "";
  let isValid = true;
  const today = new Date().toISOString().split("T")[0];
  orasInput.value = firstLetterUp(orasInput.value.trim());
  stradaInput.value = firstLetterUp(stradaInput.value.trim());
  if (!onlyLetterRegExp.test(orasInput.value.trim())) {
    error.innerHTML += `<p><sup>*</sup> Orasul trebuie alcatuit doar din litere.</p>`;
    isValid = false;
  }
  if (isNaN(metriInput.value) || metriInput.value <= 0) {
    error.innerHTML += `<p><sup>*</sup> Va rugam sa introduceti metrii patrati.</p>`;
    isValid = false;
  }
  if (
    isNaN(anInput.value) ||
    anInput.value < 1850 ||
    anInput.value > new Date().getFullYear()
  ) {
    error.innerHTML += `<p><sup>*</sup> Anul constructiei trebuie sa fie minim 1850.</p>`;
    isValid = false;
  }
  if (isNaN(pretInput.value) || pretInput.value <= 0) {
    error.innerHTML += `<p><sup>*</sup> Pretul nu este corect.</p>`;
    isValid = false;
  }
  if (!disponibilitateInput.value || disponibilitateInput.value < today) {
    error.innerHTML += `<p><sup>*</sup> Anuntul se poate posta doar incepand cu ziua (${new Date(
      today
    ).toLocaleDateString("ro-RO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}).</p>`;
    isValid = false;
  }
  if (!stradaRegExp.test(stradaInput.value.trim())) {
    error.innerHTML += `<p><sup>*</sup> Strada nu este valida.</p>`;
    isValid = false;
  }
  if (!numarStradaRegExp.test(numarInput.value.trim())) {
    error.innerHTML += `<p><sup>*</sup> Numarul strazii nu este valid</p>`;
    isValid = false;
  }
  return isValid;
};
addBtn.addEventListener("click", (e) => {
  e.preventDefault();
  console.log(checkbtnInput.checked);
  if (validateNewAddForm()) {
    const newAnnouncement = {
      oras: orasInput.value.trim(),
      strada: stradaInput.value.trim(),
      numar: numarInput.value.trim(),
      metri: metriInput.value.trim(),
      an: anInput.value.trim(),
      pret: pretInput.value.trim(),
      disponibilitate: disponibilitateInput.value.trim(),
      aerConditionat: !!checkbtnInput.checked ? "Da" : "Nu",
    };
    const announcementsFromLS = readFromLS("announcements") || {};
    if (!announcementsFromLS[userName]) {
      announcementsFromLS[userName] = [];
    }
    announcementsFromLS[userName].push(newAnnouncement);

    writeToLS("announcements", announcementsFromLS);
    localStorage.setItem("announcements", JSON.stringify(announcementsFromLS));
    window.location.assign("../home/home.html");
  }
});

const firstLetterUp = (word) => {
  return word
    .split(" ")
    .map((word) => {
      if (/[a-zA-Z]/.test(word.charAt(0))) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      } else {
        return word;
      }
    })
    .join(" ");
};

//de facut un regex cu orase

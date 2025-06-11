window.onload = function () {
  const anuntEditare = JSON.parse(localStorage.getItem("editAnnouncementnou"));
  if (anuntEditare) {
    document.getElementById("oras").value = firstLetterUp(anuntEditare.oras);
    document.getElementById("strada").value = firstLetterUp(anuntEditare.strada);
    document.getElementById("numar").value = anuntEditare.numar;
    document.getElementById("metri").value = anuntEditare.metri;
    document.getElementById("an").value = anuntEditare.an;
    document.getElementById("pret").value = anuntEditare.pret;
    document.getElementById("disponibilitate").value = new Date(
      anuntEditare.disponibilitate
    )
      .toISOString()
      .slice(0, 10);
  }
  document.querySelector(".addbtn").addEventListener("click", function (e) {
    e.preventDefault();
    // console.log("merge butonul");
    const anuntUpdate = {
      oras: firstLetterUp(document.getElementById("oras").value.trim()),
      strada: firstLetterUp(document.getElementById("strada").value.trim()),
      numar: document.getElementById("numar").value.trim(),
      metri: document.getElementById("metri").value.trim(),
      an: document.getElementById("an").value.trim(),
      pret: document.getElementById("pret").value.trim(),
      disponibilitate: document.getElementById("disponibilitate").value.trim(),
    };
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    const userName = loggedInUser.userNameInput;
    let announcements = JSON.parse(localStorage.getItem("announcements")) || {};
    // console.log("anunt principatl:", announcements);
    let userAnnouncements = announcements[userName];
    const index = userAnnouncements.findIndex(
      (a) =>
        a.oras.trim().toLowerCase() ===
          anuntEditare.oras.trim().toLowerCase() &&
        a.pret.toString() === anuntEditare.pret.toString() &&
        a.metri.toString() === anuntEditare.metri.toString()
    );
    if (index !== -1) {
      userAnnouncements[index] = {
        ...userAnnouncements[index],
        ...anuntUpdate,
      };
      announcements[userName] = userAnnouncements;
      localStorage.setItem("announcements", JSON.stringify(announcements));
      localStorage.removeItem("editAnnouncementnou");
      console.log("modificare", userAnnouncements[index]);
      window.location.href = "../myflats/myflats.html";
    }
  });
};

//mapeaza si fa cu find
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
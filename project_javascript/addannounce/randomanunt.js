const generateRandomAnnouncement = (userName) => {
  const orasList = [
    "Bucuresti",
    "Cluj-Napoca",
    "Iasi",
    "Timisoara",
    "Constanta",
    "Brasov",
    "Galati",
    "Craiova",
    "Ploiesti",
    "Oradea",
    "Sibiu",
    "Arad",
    "Bacau",
    "Buzau",
    "Suceava",
    "Pitesti",
    "Targu Mures",
    "Satu Mare",
    "Focsani",
    "Piatra Neamt",
    "Bistrita",
    "Slatina",
    "Baia Mare",
    "Rimnicu Vilcea",
    "Zalau",
  ];
  const stradaList = [
    "Strada Lipscani",
    "Strada Mihai Eminescu",
    "Strada Magheru",
    "Strada Calea Victoriei",
    "Strada Lascar Catargiu",
    "Strada Dorobanti",
    "Strada Unirii",
    "Strada Eroilor",
    "Strada Bdul. Ion Mihalache",
    "Strada Academiei",
    "Strada Stefan Cel Mare",
    "Strada Banu Manta",
    "Strada Buzești",
    "Strada Apusului",
    "Strada Oltenitei",
    "Strada Calea Mosilor",
    "Strada 13 Septembrie",
    "Strada 1 Decembrie 1989",
    "Strada Ion Creanga",
    "Strada George Enescu",
    "Strada Nicolae Titulescu",
    "Strada Mircea Vulcanescu",
    "Strada Calea Floreasca",
    "Strada Pache Protopopescu",
    "Strada Berceni",
    "Strada Rahovei",
    "Strada Theodor Pallady",
  ];
  const numarList = [
    "12",
    "34A",
    "56B",
    "78",
    "9",
    "11",
    "22",
    "33C",
    "44D",
    "55",
    "67",
    "88A",
    "99B",
    "100",
    "21",
    "13",
    "45",
    "67B",
    "89A",
    "101",
  ];
  const anList = ["1990", "2000", "2010", "2015", "2020"];
  const pretList = ["50000", "75000", "100000", "120000", "150000"];
  const disponibilitateList = ["2025-02-10", "2025-03-01", "2025-04-15"];
  const oras = orasList[Math.floor(Math.random() * orasList.length)];
  const strada = stradaList[Math.floor(Math.random() * stradaList.length)];
  const numar = numarList[Math.floor(Math.random() * numarList.length)];
  const metri = Math.floor(Math.random() * 200 + 40);
  const an = anList[Math.floor(Math.random() * anList.length)];
  const pret = Math.floor(Math.random() * (2000 - 100 + 1)) + 100;
  const disponibilitate =
    disponibilitateList[Math.floor(Math.random() * disponibilitateList.length)];
  const aerConditionat = Math.random() < 0.5 ? "Da" : "Nu";

  return {
    oras,
    strada,
    numar,
    metri,
    an,
    pret,
    disponibilitate,
    aerConditionat,
  };
};

const addRandomAnnouncementsToLocalStorage = (userName, count = 100) => {
  const announcementsFromLS =
    JSON.parse(localStorage.getItem("announcements")) || {};
  if (!announcementsFromLS[userName]) {
    announcementsFromLS[userName] = [];
  }

  for (let i = 0; i < count; i++) {
    const randomAnnouncement = generateRandomAnnouncement(userName);
    announcementsFromLS[userName].push(randomAnnouncement);
  }

  localStorage.setItem("announcements", JSON.stringify(announcementsFromLS));
};

addRandomAnnouncementsToLocalStorage("marius", 50);
addRandomAnnouncementsToLocalStorage("test2", 50);
addRandomAnnouncementsToLocalStorage("stefan", 50);
addRandomAnnouncementsToLocalStorage("rzvan", 50);

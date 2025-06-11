import type { IFlat } from "../interfaces/IFlats";

export const validateFlat = (flat: IFlat) => {
  const errors: any = {};

  if (!flat.city) errors.city = "City is required";
  if (!flat.streetName) errors.streetName = "Street name is required";
  if (flat.streetNumber <= 0) errors.streetNumber = "Street number is required";
  if (flat.areaSize <= 0) errors.areaSize = "Area size is required";
  if (flat.rentPrice <= 0) errors.rentPrice = "Rent price is required";
  if (!flat.dateAvailable) {
    errors.dateAvailable = "Date available is required";
  } else if (flat.dateAvailable < new Date()) {
    errors.dateAvailable = "Date available cannot be in the past";
  }
  if (flat.yearBuilt <= 1850 || flat.yearBuilt > new Date().getFullYear())
    errors.yearBuilt = "Year built must be between 1850 and the current year";
  if (flat.description && flat.description.length > 500)
    errors.description = "Description should be less than 500 characters";
  if (flat.city && flat.city.length > 25) {
    errors.city = "City name must be max 25 characters";
  }
  if (flat.streetName && flat.streetName.length > 45) {
    errors.streetName = "Street name must be max 45 characters";
  }
  return errors;
};

export const cityList = [
  "Aiud",
  "Alba Iulia",
  "Alexandria",
  "Arad",
  "Avrig",
  "Baia Mare",
  "Baia Sprie",
  "Baicoi",
  "Bacau",
  "Baile Olanesti",
  "Baile Govora",
  "Bistrita",
  "Bocsa",
  "Bolintin-Vale",
  "Botosani",
  "Brasov",
  "Blaj",
  "Bragadiru",
  "Breaza",
  "Bucuresti",
  "Buzau",
  "Calarasi",
  "Cajvana",
  "Campia Turzii",
  "Campulung",
  "Caransebes",
  "Cernavoda",
  "Cluj-Napoca",
  "Codlea",
  "Comanesti",
  "Constanta",
  "Curtea de Arges",
  "Cugir",
  "Deva",
  "Drobeta-Turnu Severin",
  "Fagaras",
  "Falticeni",
  "Fetesti",
  "Fierbinti-Targ",
  "Focsani",
  "Galati",
  "Gheorgheni",
  "Giurgiu",
  "Gura Humorului",
  "Harlau",
  "Horezu",
  "Husi",
  "Ianca",
  "Iasi",
  "Ineu",
  "Isaccea",
  "Ladesti",
  "Liteni",
  "Lugoj",
  "Macin",
  "Miercurea Nirajului",
  "Miercurea Sibiului",
  "Medias",
  "Mizil",
  "Moldova Noua",
  "Mures",
  "Mihailesti",
  "Moldoveni",
  "Nasad",
  "Nehoiu",
  "Negresti-Oas",
  "Ocna Mures",
  "Odobesti",
  "Odorheiu Secuiesc",
  "Oradea",
  "Oravita",
  "Otopeni",
  "Piatra Neamt",
  "Piatra-Olt",
  "Pucioasa",
  "Pecica",
  "Pitesti",
  "Pogoanele",
  "Ploiesti",
  "Petrila",
  "Roman",
  "Sacele",
  "Sageata",
  "Salonta",
  "Salcea",
  "Sapoca",
  "Sighisoara",
  "Segarcea",
  "Sinaia",
  "Simeria",
  "Simleu Silvaniei",
  "Sovata",
  "Suceava",
  "Tasnada",
  "Targu Jiu",
  "Targu Mures",
  "Targu Frumos",
  "Targu Secuiesc",
  "Targu Lapus",
  "Ticleni",
  "Timisoara",
  "Turda",
  "Urziceni",
  "Uricani",
  "Valenii de Munte",
  "Vaslui",
  "Varasti",
  "Vanju Mare",
  "Vladimirescu",
  "Voluntari",
  "Zalau",
  "Zarnesti",
  "Zimnicea",
  "Zlatna",
];

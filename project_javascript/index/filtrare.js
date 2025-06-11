function filtrareSortare(array, filters, sortKey = "pret", order = "asc") {
  let filteredData = array.filter((item) => {
    return Object.keys(filters).every((key) => {
      const filterValue = filters[key];
      if (
        filterValue === "" ||
        filterValue === null ||
        filterValue === undefined
      )
        return true;

      if (key === "oras" && typeof item[key] === "string") {
        return item[key].toLowerCase().includes(filterValue.toLowerCase());
      }

      if (key === "pretMin" && Number(item.pret) < Number(filterValue))
        return false;
      if (key === "pretMax" && Number(item.pret) > Number(filterValue))
        return false;
      if (key === "metriMin" && Number(item.metri) < Number(filterValue))
        return false;
      if (key === "metriMax" && Number(item.metri) > Number(filterValue))
        return false;

      return true;
    });
  });

  return filteredData.sort((a, b) => {
    let valA = a[sortKey];
    let valB = b[sortKey];
    if (!isNaN(valA) && !isNaN(valB)) {
      return order === "asc"
        ? Number(valA) - Number(valB)
        : Number(valB) - Number(valA);
    }
    if (typeof valA === "string" && typeof valB === "string") {
      return order === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }
    return 0;
  });
}

export { filtrareSortare };

export function getStoredAnnouncements() {
  const announcements = readFromLS("announcements");
  return announcements ? Object.values(announcements).flat() : [];
}

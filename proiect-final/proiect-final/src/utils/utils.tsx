import {
  collection,
  deleteDoc,
  getDocs,
  Timestamp,
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { firestore, db } from "../firebase";
import type { IFlat } from "../interfaces/IFlats";
import dayjs from "dayjs"; 

export const fetchFlats = async (
  setError?: (msg: string) => void
): Promise<IFlat[]> => {
  try {
    const flatsCollection = collection(firestore, "flats");
    const flatsSnapshot = await getDocs(flatsCollection);

    return flatsSnapshot.docs.map((doc) => {
      const data = doc.data();

      const flat: IFlat = {
        ownerId: "",
        id: doc.id,
        city: data.city || "",
        streetName: data.streetName || "",
        streetNumber: data.streetNumber || "",
        areaSize: data.areaSize || 0,
        rentPrice: data.rentPrice || 0,
        yearBuilt: data.yearBuilt || 0,
        hasAC: data.hasAC ?? false,
        description: data.description || "",
        imageUrl: data.imageUrl || "",
        userId: data.userId || "",
        dateAvailable: data.dateAvailable
          ? data.dateAvailable instanceof Timestamp
            ? data.dateAvailable.toDate()
            : new Date(data.dateAvailable)
          : new Date(),
      };

      return flat;
    });
  } catch (error: any) {
    setError?.(error.message || "An error occurred while fetching flats.");
    return [];
  }
};

export const getUserDetails = async (
  userId: string,
  setError?: (msg: string) => void
): Promise<{ firstname: string; lastname: string }> => {
  try {
    const usersRef = collection(firestore, "users");
    const usersSnapshot = await getDocs(usersRef);
    const userData = usersSnapshot.docs
      .find((doc) => doc.id === userId)
      ?.data();

    return {
      firstname: userData?.firstname || "Unknown",
      lastname: userData?.lastname || "User",
    };
  } catch (error: any) {
    setError?.(error.message || "Failed to retrieve user details.");
    return { firstname: "Unknown", lastname: "User" };
  }
};

export const filterFlats = (
  flats: IFlat[],
  city: string,
  minPrice: number,
  maxPrice: number,
  minArea: number,
  maxArea: number
): IFlat[] => {
  return flats.filter(
    (flat) =>
      (!city || flat.city.toLowerCase().includes(city.toLowerCase())) &&
      flat.rentPrice >= minPrice &&
      flat.rentPrice <= maxPrice &&
      flat.areaSize >= minArea &&
      flat.areaSize <= maxArea
  );
};

export const sortFlats = (
  flats: IFlat[],
  sortBy: string,
  sortOrder: "asc" | "desc"
): IFlat[] => {
  return [...flats].sort((a, b) => {
    let comparison = 0;
    if (sortBy === "city") {
      comparison = a.city.localeCompare(b.city);
    } else if (sortBy === "price") {
      comparison = a.rentPrice - b.rentPrice;
    } else if (sortBy === "area") {
      comparison = a.areaSize - b.areaSize;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });
};

export const formatDate = (date: Date | null): string => {
  return date ? dayjs(date).format("DD/MM/YYYY") : "N/A";
};

export const toggleFavoriteFlat = async (
  userId: string,
  flat: IFlat,
  isAlreadyFavorite: boolean,
  setError?: (msg: string) => void
): Promise<void> => {
  if (!flat.id) {
    setError?.("The flat does not have a valid ID.");
    return;
  }

  try {
    const favRef = doc(db, "users", userId, "favorites", flat.id);

    if (isAlreadyFavorite) {
      await deleteDoc(favRef);
    } else {
      await setDoc(favRef, flat);
    }
  } catch (error: any) {
    setError?.(error.message || "An error occurred while updating favorites.");
  }
};

export const isFlatFavorite = (
  favoriteFlats: IFlat[],
  flat: IFlat
): boolean => {
  return favoriteFlats.some((f) => f.id === flat.id);
};

export const fetchFavoriteFlats = async (
  userId: string,
  setError?: (msg: string) => void
): Promise<IFlat[]> => {
  try {
    const favsCollection = collection(db, "users", userId, "favorites");
    const favsSnapshot = await getDocs(favsCollection);

    return favsSnapshot.docs.map((doc) => {
      const data = doc.data();

      const flat: IFlat = { 
        id: doc.id,
        city: data.city || "",
        streetName: data.streetName || "",
        streetNumber: data.streetNumber || "",
        areaSize: data.areaSize || 0,
        rentPrice: data.rentPrice || 0,
        yearBuilt: data.yearBuilt || 0,
        hasAC: data.hasAC ?? false,
        description: data.description || "",
        imageUrl: data.imageUrl || "",
        userId: data.userId || "",
        ownerId: data.ownerId || data.userId, 
        dateAvailable: data.dateAvailable
          ? data.dateAvailable instanceof Timestamp
            ? data.dateAvailable.toDate()
            : new Date(data.dateAvailable)
          : new Date(),
      };

      return flat;
    });
  } catch (error: any) {
    setError?.(
      error.message || "An error occurred while fetching favorite flats."
    );
    return [];
  }
};


export const updateFlatDetails = async (flat: IFlat) => {
  const flatRef = doc(db, "flats", flat.id);
  await updateDoc(flatRef, {
    rentPrice: flat.rentPrice,
    description: flat.description,
    imageUrl: flat.imageUrl,
  });
};

export const deleteFlat = async (flatId: string) => {
  try {
    const flatRef = doc(db, "flats", flatId);
    await deleteDoc(flatRef);
  } catch (error) {}
};

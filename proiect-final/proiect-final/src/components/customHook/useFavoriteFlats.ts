import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, Timestamp } from "firebase/firestore"; 
import type { IFlat } from "../../interfaces/IFlats";
import { db } from "../../firebase";

export const useFavoriteFlats = (userId: string | undefined) => {
  const [flats, setFlats] = useState<IFlat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!userId) return;

    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, "users", userId, "favorites"));
        const favs = snapshot.docs.map((doc) => {
          const data = doc.data();
          const dateAvailable =
            data.dateAvailable instanceof Timestamp
              ? data.dateAvailable.toDate()
              : new Date(data.dateAvailable);

          return {
            id: doc.id,
            ...data,
            dateAvailable,
          } as IFlat;
        });
        setFlats(favs);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unknown error while fetching favorites.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [userId]);

  const removeFlat = async (flatId: string) => {
    if (!userId) return;
    try {
      await deleteDoc(doc(db, "users", userId, "favorites", flatId));
      setFlats((prev) => prev.filter((flat) => flat.id !== flatId));
      return true;
    } catch {
      return false;
    }
  };

  return { flats, loading, error, removeFlat };
};

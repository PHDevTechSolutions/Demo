
import React, { useState, useEffect } from "react";
import { FaSpinner } from "react-icons/fa";

const UserFetcher: React.FC<{
  children: (user: Record<string, any> | null, loading: boolean) => React.ReactNode;
}> = ({ children }) => {
  const [user, setUser] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get("id");

    if (userId) {
      const cachedUser = localStorage.getItem(`user-${userId}`);
      if (cachedUser) {
        setUser(JSON.parse(cachedUser));
        setLoading(false);
      } else {
        fetch(`/api/user?id=${encodeURIComponent(userId)}`)
          .then((response) => {
            if (!response.ok) {
              throw new Error("Failed to fetch user data");
            }
            return response.json();
          })
          .then((data) => {
            setUser(data);
            localStorage.setItem(`user-${userId}`, JSON.stringify(data));
          })
          .catch((error) => {
            console.error("Error fetching user data:", error);
            setUser(null);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center">
          <FaSpinner className="animate-spin text-gray-500" size={24} />
        </div>
      ) : (
        children(user, loading)
      )}
    </>
  );
};

export default UserFetcher;


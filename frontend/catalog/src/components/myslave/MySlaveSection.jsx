import { useEffect, useState } from "react";
import { getCurrentUser } from "../../services/auth/userService";
import SlaveProfileSkeleton from "./SlaveProfileSkeleton";
import SlaveProfileCard from "./SlaveProfileCard";

const MySlaveSection = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    getCurrentUser()
      .then((res) => setUser(res))
      .catch((err) => console.error("Failed to fetch user:", err));
  }, []);

  return !user ? <SlaveProfileSkeleton /> : <SlaveProfileCard user={user} />;
};

export default MySlaveSection;

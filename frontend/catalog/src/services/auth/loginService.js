import { loginUser } from "../../services/auth/loginService";
import { getCurrentUser } from "../../services/auth/userService";
import { useAuthStore } from "../../store/useAuthStore";

const login = useAuthStore((state) => state.login);

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const { access, refresh } = await loginUser(formData);
    const user = await getCurrentUser(access);
    login(user, access, refresh);
    navigate("/");
  } catch (error) {
    console.error("Login failed:", error.response?.data || error.message);
  }
};

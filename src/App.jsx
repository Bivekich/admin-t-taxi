import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import axios from "axios"; // Добавляем axios для запросов к серверу
import Home from "./pages/client/Home";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Settings from "./pages/admin/Settings";
import AllRides from "./pages/admin/AllRides";

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const App = () => {
  const [phoneNumber, setPhoneNumber] = useState(
    localStorage.getItem("phoneNumber")
  );
  const [userRoles, setUserRoles] = useState([]); // Массив для хранения ролей пользователя
  const query = useQuery();
  const navigate = useNavigate();

  useEffect(() => {
    const phoneFromUrl = query.get("phoneNumber");
    if (phoneFromUrl) {
      setPhoneNumber(phoneFromUrl);
      localStorage.setItem("phoneNumber", phoneFromUrl);
    }

    // Запрос данных о профиле пользователя
    const fetchUserProfile = async () => {
      if (phoneNumber && userRoles.length === 0) {
        try {
          const response = await axios.get(
            `http://localhost:3000/api/user/profile/${phoneNumber}`
          );
          console.log(response);
          const roles = response.data.map((role) => role.type); // Извлекаем роли в массив
          setUserRoles(roles); // Сохраняем массив ролей пользователя
        } catch (error) {
          console.error("Ошибка при получении профиля пользователя:", error);
        }
      }
    };

    if (phoneNumber) {
      fetchUserProfile();
    }
  }, [query, phoneNumber]);

  // Проверка доступа по ролям
  const hasAccess = (roles) => {
    return roles.includes("admin"); // Проверяем, является ли пользователь администратором
  };

  // Если нет доступа, можно реализовать логику перенаправления или отображения ошибки
  useEffect(() => {
    if (userRoles.length > 0 && !hasAccess(userRoles)) {
      navigate("/"); // Перенаправляем пользователя на домашнюю страницу, если нет доступа
    }
  }, [userRoles, navigate]);

  return (
    <Routes>
      {/* Маршруты для администратора */}
      {userRoles.includes("admin") && (
        <>
          <Route path="/" element={<AdminDashboard />}>
            <Route index element={<AllRides />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </>
      )}

      {/* Общий fallback на случай, если у пользователя нет роли */}
      <Route path="*" element={<Home />} />
    </Routes>
  );
};

export default function Root() {
  return (
    <Router>
      <App />
    </Router>
  );
}

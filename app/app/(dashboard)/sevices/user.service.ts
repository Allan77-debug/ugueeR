import axios from "axios";
import { UserData} from "../interfaces/interfaces";

const getUser = async (userId: number, token: string) => {
  try {
    const response = await axios.get<UserData>(
      `http://192.168.56.1:8000/api/user/profile${userId}/`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

export default {
  getUser
};

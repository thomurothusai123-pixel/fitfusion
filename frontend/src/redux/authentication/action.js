import axios from "axios";
import { SET_AUTH } from "./actionType";
import { BASEURL } from "../../utils";
import { toast } from "react-toastify";

// ✅ Called after login/signup — loads user from Atlas by ID and stores in Redux + localStorage
export const getLogin = (userId) => async (dispatch) => {
  try {
    if (!userId) {
      toast.error("No user ID provided");
      return;
    }

    const { data } = await axios.get(`${BASEURL}/getuser?userID=${userId}`);

    if (data?._id) {
      // Persist userId so session survives page refresh
      localStorage.setItem("fitfusion_userId", data._id);
      dispatch({ type: SET_AUTH, payload: data });
      console.log("✅ User loaded into Redux from Atlas:", data.name);
    } else {
      toast.error("User not found in database");
    }
  } catch (err) {
    console.error("getLogin error:", err);
    toast.error("Failed to load user. Please log in again.");
  }
};

// ✅ On app load — re-hydrate Redux from localStorage if userId is saved
export const rehydrateAuth = () => async (dispatch) => {
  try {
    const savedId =
      new URLSearchParams(window.location.search).get("userID") ||
      localStorage.getItem("fitfusion_userId");

    if (!savedId) return;

    const { data } = await axios.get(`${BASEURL}/getuser?userID=${savedId}`);
    if (data?._id) {
      localStorage.setItem("fitfusion_userId", data._id);
      dispatch({ type: SET_AUTH, payload: data });
      console.log("🔄 Session restored from Atlas for:", data.name);
    }
  } catch (err) {
    console.warn("Session restore failed:", err.message);
    localStorage.removeItem("fitfusion_userId");
  }
};

// ✅ Logout — clear Redux + localStorage
export const logoutUser = () => (dispatch) => {
  localStorage.removeItem("fitfusion_userId");
  dispatch({ type: "LOGOUT" });
};

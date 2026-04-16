import axios from "axios";
import { BASEURL } from "../../utils";

// GET /notifications?userId=xxx
export const getNotifications = async (userId) => {
  try {
    const res = await axios.get(`${BASEURL}/notifications`, { params: { userId } });
    return res;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { data: { notifications: [] } };
  }
};

// POST /notifications
export const createNotification = async (payload) => {
  try {
    const res = await axios.post(`${BASEURL}/notifications`, payload);
    return res;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

// PATCH /notifications/:id/read
export const markAsRead = async (id) => {
  try {
    const res = await axios.patch(`${BASEURL}/notifications/${id}/read`);
    return res;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return null;
  }
};

// PATCH /notifications/markallread
export const markAllRead = async (userId) => {
  try {
    const res = await axios.patch(`${BASEURL}/notifications/markallread`, { userId });
    return res;
  } catch (error) {
    console.error("Error marking all as read:", error);
    return null;
  }
};

// DELETE /notifications/:id
export const deleteNotification = async (id) => {
  try {
    const res = await axios.delete(`${BASEURL}/notifications/${id}`);
    return res;
  } catch (error) {
    console.error("Error deleting notification:", error);
    return null;
  }
};

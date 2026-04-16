import axios from 'axios';
import { BASEURL } from '../../utils';

export const getPosts = async () => {
    try {
        const res = await axios.get(`${BASEURL}/posts/getallpost`);
        return res;
    } catch (error) {
        console.error("Using mock posts data", error);
        return { data: { posts: [{
            _id: "64598234fed123",
            username: "FitnessGuru",
            email: "guru@example.com",
            title: "Welcome to FitFusion!",
            description: "This is a mock post because the API is unreachable.",
            img: "https://i.pinimg.com/originals/6f/8e/de/6f8ede4dab23b0518f0efc61e5810d71.gif",
            comments: [],
            createdAt: new Date().toISOString()
        }] } };
    }
};
export const createPost = (newPost) => axios.post(`${BASEURL}/posts/addpost`, newPost);
export const createComment = (comment) => axios.post(`${BASEURL}/posts/comment`, comment);
export const deletePost = (id) => axios.delete(`${BASEURL}/posts/deletepost/${id}`);
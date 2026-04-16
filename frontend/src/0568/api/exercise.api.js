import axios from "axios";
import { EXCERCISE_API } from "../../utils";

// bodypart, equipment, target, exercise
const cache = {};
export const getExercises = async () => {
	try {
		const response = await axios.request({
			method: "GET",
			url: `${EXCERCISE_API}/exercise`,
		});
		return response.data;
	} catch (error) {
		console.error(error);
	}
};

export const getBodyPartList = async () => {
	const url = `${EXCERCISE_API}/bodypart`;
	try {
		const response = await axios.request({
			method: "GET",
			url,
		});
		return response.data;
	} catch (error) {
		console.error("Using mock data for BodyPartList", error);
        return ["back", "cardio", "chest", "lower arms", "lower legs", "neck", "shoulders", "upper arms", "upper legs", "waist"];
	}
};

export const getLIstByBodyPart = async (bodyPart, page = 1) => {
	const url = `${EXCERCISE_API}/exercise?bodyPart=${bodyPart}`;
	try {
		const response = await axios.get(url, {
			params: { bodyPart}
		});
		return response.data;
	} catch (error) {
		console.error("Using mock exercise data", error);
        return [{id: "1", name: "Deadlift", bodyPart: "back", target: "back", equipment: "barbell", gifUrl: "https://i.pinimg.com/originals/6f/8e/de/6f8ede4dab23b0518f0efc61e5810d71.gif"}];
	}
};

export const getEquipmentList = async () => {
	const url = `${EXCERCISE_API}/equipment`;

	try {
		const response = await axios.request({
			method: "GET",
			url,
		});
		return response.data;
	} catch (error) {
		console.error("Using mock equipment data", error);
        return ["barbell", "dumbbell", "body weight", "cable", "kettlebell"];
	}
};

export const getListByEquipment = async (equipment) => {
	const url = `${EXCERCISE_API}/exercise?equipment=${equipment}`;
	if (cache[equipment]) {
		console.log("cache hit");
		return cache[equipment];
	}
	try {
		console.log("fetching.....");
		const response = await axios.request({
			method: "GET",
			url,
		});
		cache[equipment] = response.data;
		return response.data;
	} catch (error) {
		console.error(error);
	}
};

export const getMusculeTargetList = async () => {
	const url = `${EXCERCISE_API}/target`;
	try {
		const response = await axios.request({
			method: "GET",
			url,
		});
		return response.data;
	} catch (error) {
		console.error("Using mock target data", error);
        return ["abs", "back", "biceps", "calves", "chest", "forearms", "glutes", "hamstrings", "lats", "quads", "shoulders", "triceps"];
	}
};

export const getListByMusculeTarget = async (target) => {
	const url = `${EXCERCISE_API}/exercise?target=${target}`;
	if (cache[target]) {
		console.log("cache hit");
		return cache[target];
	}
	try {
		const response = await axios.request({
			method: "GET",
			url,
		});
		cache[target] = response.data;
		return response.data;
	} catch (error) {
		console.error(error);
	}
};

export const getListByName = async (name) => {
	const url = `${EXCERCISE_API}/exercise?name=${name}`;

	try {
		const response = await axios.request({
			method: "GET",
			url, // hammer,abs,chest
		});
		return response.data;
	} catch (error) {
		console.error(error);
	}
};

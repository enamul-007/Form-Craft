import axios from "axios";

class ApiService {
    constructor() {
        this.client = axios.create({
            baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    // -------- GENERIC METHODS --------
    get(url, config = {}) {
        return this.client.get(url, config);
    }

    post(url, data, config = {}) {
        return this.client.post(url, data, config);
    }

    patch(url, data, config = {}) {
        return this.client.patch(url, data, config);
    }

    delete(url, config = {}) {
        return this.client.delete(url, config);
    }

    // -------- OPTIONAL SHORTCUT METHODS --------
    getById(resource, id) {
        return this.get(`${resource}/${id}`);
    }

    create(resource, data) {
        return this.post(resource, data);
    }

    update(resource, id, data) {
        return this.patch(`${resource}/${id}`, data);
    }

    remove(resource, id) {
        return this.delete(`${resource}/${id}`);
    }
}

const apiService = new ApiService();
export default apiService;

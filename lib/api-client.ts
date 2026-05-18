const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export class APIClient {
  static async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("owner_token")
        : null;

    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "API request failed");
    }

    return response.json();
  }

  static async ownerLogin(email: string, password: string) {
    const data = await this.request("/auth/owner-login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data.token) localStorage.setItem("owner_token", data.token);
    return data;
  }

  static logout() {
    localStorage.removeItem("owner_token");
  }

  static async getCurrentOwner() {
    return this.request("/auth/owner-me");
  }

  static async listRestaurants() {
    return this.request("/owner/restaurants");
  }

  static async getRestaurant(id: string) {
    return this.request(`/owner/restaurants/${id}`);
  }

  static async createRestaurant(body: Record<string, unknown>) {
    return this.request("/owner/restaurants", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  static async updateRestaurant(id: string, body: Record<string, unknown>) {
    return this.request(`/owner/restaurants/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  static async deleteRestaurant(id: string) {
    return this.request(`/owner/restaurants/${id}`, { method: "DELETE" });
  }
}

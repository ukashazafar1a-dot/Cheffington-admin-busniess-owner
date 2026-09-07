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

    let response: Response;
    try {
      response = await fetch(url, { ...options, headers });
    } catch {
      throw new Error(
        `Cannot reach API at ${API_BASE_URL}. Is the backend running on port 5000?`
      );
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "API request failed");
    }

    return response.json();
  }

  static async uploadRestaurantImageFile(
    file: File,
    fields: {
      restaurantId: string;
      restaurantName: string;
      kind: "hero" | "section" | "logo";
    }
  ) {
    const url = `${API_BASE_URL}/owner/uploads`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("restaurantId", fields.restaurantId);
    formData.append("restaurantName", fields.restaurantName);
    formData.append("kind", fields.kind);

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("owner_token")
        : null;

    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
      });
    } catch {
      throw new Error(
        `Cannot reach API at ${API_BASE_URL}. Is the backend running on port 5000?`
      );
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Image upload failed");
    }

    return data.data as {
      publicUrl: string;
      key: string;
      displayUrl: string;
    };
  }

  static async resolveImageDisplayUrls(urls: string[]) {
    const res = await this.request("/owner/uploads/resolve-display", {
      method: "POST",
      body: JSON.stringify({ urls }),
    });
    return res.data.resolved as { stored: string; display: string }[];
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

  static async getDashboardStats() {
    return this.request("/owner/dashboard/stats");
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

  static async presignRestaurantImage(body: {
    restaurantId: string;
    restaurantName: string;
    kind: "hero" | "section" | "logo";
    contentType: string;
    filename: string;
    contentLength?: number;
  }) {
    const res = await this.request("/owner/uploads/presign", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return res.data as {
      uploadUrl: string;
      publicUrl: string;
      key: string;
      expiresIn: number;
    };
  }

  static async uploadFileToPresignedUrl(uploadUrl: string, file: File) {
    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!response.ok) {
      throw new Error("Failed to upload image to storage");
    }
  }
}

export const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024;

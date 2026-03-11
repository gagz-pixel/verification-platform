import apiClient from "../api/apiClient";

// Face enrollment
export const enrollFace = async (formData) => {
  try {
    const response = await apiClient.post(
      "/verification/register-face",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    );
    return response.data;
  } catch (error) {
    // Axios throws on 4xx/5xx — return the error body instead of crashing
    if (error.response?.data) {
      return error.response.data; // { success: false, message: "..." }
    }
    throw error; // only re-throw on network failures
  }
};

// Face verification
export const verifyFace = async (formData) => {
  try {
    const response = await apiClient.post(
      "/verification/verify",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    );
    return response.data;
  } catch (error) {
    // Axios throws on 4xx/5xx — return the error body instead of crashing
    if (error.response?.data) {
      return error.response.data; // { success: false, message: "..." }
    }
    throw error; // only re-throw on network failures
  }
};

export const getChallenge = async () => {
  const res = await apiClient.get("/voice/challenge");
  return res.data;
};

export const enrollVoice = async (formData) => {
  const res = await apiClient.post("/voice/enroll", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data;
};

export const verifyVoice = async (formData) => {
  const res = await apiClient.post("/voice/verify", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data;
};

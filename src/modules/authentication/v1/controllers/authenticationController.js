import authenticationService from "../services/authenticationService.js";

const register = async(req, res) => {
  try {
    const registerResponse = await authenticationService.register(req.body, res);
    return registerResponse
  } catch (error) {
    console.log("error", error)
  }
};


export default { register  };







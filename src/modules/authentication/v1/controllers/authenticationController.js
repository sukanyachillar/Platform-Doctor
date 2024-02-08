import authenticationService from "../services/authenticationService.js";

const register = async(req, res) => {
  try {
    const registerResponse = await authenticationService.register(req.body, res);
    return registerResponse
  } catch (error) {
    console.log("error", error)
  }
};

const addProfile =async(req,res)=>{
  try{
    const profileAdded = await authenticationService.addProfile(req.body, req.file, res);
    return profileAdded;
  }catch(error){
    console.log({error})
  }
};

const getProfile =async(req,res)=>{
  try{
    const getProfile = await authenticationService.getProfile(req.body, res);
    return getProfile;
  }catch(error){
    console.log({error})
  }
};


const getGeneralSettings =async(req,res)=>{
  try{
    const getSettings = await authenticationService.getGeneralSettings(req, res);
    return getSettings;
  }catch(error){
    console.log({error})
  }
};

const addDept = async(req,res) =>{
  try{
    const dept = await authenticationService.addDept(req.body,req.user,res);
    return dept;
  }catch(error){
    console.log({error})
  }
}

export default { register, addProfile, getProfile, addDept, getGeneralSettings };








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
    const profileAdded = await authenticationService.addProfile(req.body,res);
    return profileAdded;
  }catch(error){
    console.log({error})
  }
}

const addDept = async(req,res) =>{
  try{
    const dept = await authenticationService.addDept(req.body,res);
    return dept;
  }catch(error){
    console.log({error})
  }
}


export default { register,addProfile ,addDept };







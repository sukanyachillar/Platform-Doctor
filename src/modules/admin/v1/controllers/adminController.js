import adminServices from '../services/adminServices.js'

const adminRegister = async (req, res) => {
    try {
        let data = await adminServices.adminRegister(req.body, res)
        return data
    } catch (error) {
        console.log({ error })
    }
}

const adminLogin = async (req, res) => {
    try {
        let data = await adminServices.adminLogin(req.body, res)
        return data
    } catch (error) {
        console.log({ error })
    }
}

const addDepart = async (req, res) => {
    try {
        const dept = await adminServices.addDept(req.body, req.body, res)
        return dept
    } catch (error) {
        console.log({ error })
    }
}

const listDoctors = async (req, res) => {
    try {
        let data = await adminServices.doctorsList(req.query, res)
        return data
    } catch (err) {
        console.log({ err })
    }
}

const listEntity = async (req, res) => {
    try {
        let data = await adminServices.entityList(req.query, res)
        return data
    } catch (err) {
        console.log({ err })
    }
}

const transactionHistory = async (req, res) => {
    try {
      let data = await adminServices.transactionHistory(req.query, res);
      return data;
    } catch (err) {
      console.log({ err });
    }
};

const addProfile = async(req,res)=>{
    try{
        let data = await adminServices.addProfile(req.body,res);
        return data
    }catch(error){
        console.log({error})
    }
}

  const listAllCustomers = async (req, res) => {
    try {
        let data = await adminServices.listAllCustomers(req.body, res)
    } catch (error) {
        
    }
  }

export default {
    adminRegister,
    adminLogin,
    addDepart,
    listDoctors,
    listEntity,
    transactionHistory,
    addProfile,
    listAllCustomers,
}

import adminServices from '../services/adminServices.js';
import customerServices from '../../../customer/services/customerServices.js';

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
        const dept = await adminServices.addDept(req.body, res)
        return dept
    } catch (error) {
        console.log({ error })
    }
}

const listDoctors = async (req, res) => {
    try {
        let data = await adminServices.doctorsList(req.body, res)
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
        let data = await adminServices.transactionHistory(req.query, res)
        return data
    } catch (err) {
        console.log({ err })
    }
}

const addProfile = async (req, res) => {
    try {
        let data = await adminServices.addProfile( 
            req.body,
            req.file,
            res,
            )
        return data
    } catch (error) {
        console.log({ error })
    }
}

const addBankDetails = async(req,res)=>{
    try{
        let data = await adminServices.addBankDetails(req.body,res);
        return data;
    }catch(err){
        console.log(err)
    }
}

const listAllCustomers = async (req, res) => {
    try {
      let data = await adminServices.listAllCustomers(req.body, res)
      return data;

    } catch (error) {
      console.log({ err });
        
    }
  }
  const customerHistory = async (req, res) => {
    try {
      let data = await adminServices.customerHistory(req, res)
      return data;

    } catch (error) {
      console.log({ err });
        
    }
  }

  const addClinic = async (req, res)=> {
    try {
        const data = await adminServices.addClinic(
            req.body,
            req.file,
            res,
        );
        return data;
    } catch (error) {
        
    }
  }

  
  const listDistrict = async (req, res)=> {
    try {
        const data = await adminServices.listDistrict(
            req,
            res,
        );
        return data;
    } catch (error) {
        
    }
  }

  const listState = async (req, res)=> {
    try {
        const data = await adminServices.listState(
            req,
            res,
        );
        return data;
    } catch (error) {
        
    }
  }

  const listClinic = async (req, res)=> {
    try {
        const data = await adminServices.listClinic(
            req.query,
            res,
        );
        return data;
    } catch (error) {
        
    }
  }

  
const updateClinicStatus = async (req, res) => {
    try {
        let data = await adminServices.updateClinicStatus(
            req.body,
            res
        )
        return data;
    } catch (err) {
        console.log({ err })
    }
};

const listDoctorsByClinic = async (req, res) => {
    try {
        let data = await customerServices.listDoctorsForCustomers(
            req.body,
            res
        )
        return data;
    } catch (err) {
        console.log({ err })
    }
};

const clinicProfile = async (req, res) => {
    try {
        const data = await customerServices.getOneEntityDetails(req, res );
        return data;
    } catch (err) {
        console.log({ err })
    }
};

const updateDept = async (req, res) => {
    try {
        const data = await adminServices.updateDept(req.body, res);
        return data;
    } catch (err) {
        console.log({ err })
    }
};

const deleteDept = async (req, res) => {
    try {
        const data = await adminServices.deleteDept(req.body, res);
        return data;
    } catch (err) {
        console.log({ err })
    }
};


const listDepartments = async (req, res) => {
    try {
        let data = await adminServices.departmentList(
            req.body,
            req.query,
            res
        )
        return data;
    } catch (err) {
        console.log({ err })
    }
};

const listDeptByClinic = async (req, res) => {
    try {
        let data = await adminServices.listDeptByClinic(
            req.body,
            res
        )
        return data;
    } catch (err) {
        console.log({ err })
    }
};

const getDeptDetails = async (req, res) => {
    try {
        let data = await adminServices.getDeptDetails(
            req.body,
            res
        )
        return data;
    } catch (err) {
        console.log({ err })
    }
};

const totalNoOfbookings = async (req, res) => {
    try {
        let data = await adminServices.totalNoOfbookings(
            req.body,
            res
        );
        return data;
    } catch (err) {
        console.log({ err })
    }
};

const graphData = async (req, res) => {
    try {
        let data = await adminServices.graphData(
            req.body,
            res
        );
        return data;
    } catch (err) {
        console.log({ err })
    }
};

const bookingReport_admin = async (req, res) => {
    try {
        let data = await adminServices.bookingReport_admin(
            req.body,
            res
        );
        return data;
    } catch (err) {
        console.log({ err })
    }
};

export default {
    adminRegister,
    adminLogin,
    addDepart,
    listDoctors,
    listEntity,
    transactionHistory,
    addProfile,
    listAllCustomers,
    addBankDetails,
    customerHistory,
    addClinic,
    listState,
    listDistrict,
    listClinic,
    updateClinicStatus,
    listDoctorsByClinic,
    clinicProfile,
    updateDept,
    deleteDept,
    listDepartments,
    listDeptByClinic,
    getDeptDetails,
    totalNoOfbookings,
    graphData,
    bookingReport_admin,
}

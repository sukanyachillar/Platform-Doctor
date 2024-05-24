
import adminServices from '../services/adminServices.js';
import customerServices from '../../../customer/services/customerServices.js';
import bookingService from '../../../booking/v1/services/bookingService.js';
import clinicServices from '../../../clinic/services/clinicServices.js';

const adminRegister = async (req, res) => {
    try {
        let data = await adminServices.adminRegister(req.body, res);
        return data
    } catch (error) {
        console.log({ error })
    }
};

const adminLogin = async (req, res) => {
    try {
        let data = await adminServices.adminLogin(req.body, res);
        return data
    } catch (error) {
        console.log({ error })
    }
};

const addDepart = async (req, res) => {
    try {
        const dept = await adminServices.addDept(req.body, res);
        return dept
    } catch (error) {
        console.log({ error })
    }
};

const listDoctors_admin = async (req, res) => {
    try {
        let data = await adminServices.listDoctors_admin(req.query, req.body, res);
        return data
    } catch (err) {
        console.log({ err })
    };
};

const listEntity = async (req, res) => {
    try {
        let data = await adminServices.entityList(req.query, res);
        return data
    } catch (err) {
        console.log({ err })
    }
};

const transactionHistory = async (req, res) => {
    try {
        let data = await adminServices.transactionHistory(req.query, res);
        return data
    } catch (err) {
        console.log({ err })
    }
}

const addNewDoctor = async (req, res) => {
    try {
        let data = await adminServices.addNewDoctor( 
            req.body,
            req.file,
            res,
            );
        return data;
    } catch (error) {
        console.log({ error })
    }
}

const addBankDetails = async(req,res)=>{
    try {
        let data = await adminServices.addBankDetails(req.body,res);
        return data;
    } catch(err){
        console.log(err)
    };
};

const listAllCustomers = async (req, res) => {
    try {
      let data = await adminServices.listAllCustomers(req.body, res);
      return data;

    } catch (error) {
      console.log({ err });
        
    }
  }
  const customerHistory = async (req, res) => {
    try {
      let data = await adminServices.customerHistory(req, res);
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
        console.log({ err })
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
        console.log({ err })
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
        console.log({ err })
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
        const data = await customerServices.getSingleEntityDetails(req, res );
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
            req.query,
            req.body,
            res
        );
        return data;
    } catch (err) {
        console.log({ err })
    }
};

const listClinicName = async (req, res) => {
    try {
        let data = await adminServices.listClinicName(
            req.body,
            res
        );
        return data;
    } catch (err) {
        console.log({ err })
    }
};

const viewDoctor = async (req, res) => {
    try {
        let data = await adminServices.viewDoctor(
            req.body,
            res
        );
        return data;
    } catch (err) {
        console.log({ err })
    }
};

const updateDoctor = async (req, res) => {
    try {
        let data = await adminServices.updateDoctor(
            req.body,
            req.file,
            res,
        );
        return data;
    } catch (err) {
        console.log({ err })
    };
};
const findDrByPhoneNo = async (req, res) => {
    try {
        let data = await adminServices.findDrByPhoneNo(
            req.body,
            res,
        );
        return data;
    } catch (err) {
        console.log({ err })
    }
};
const findDoctorByID = async (req, res) => {
    try {
        let data = await adminServices.findDoctorByID(
            req.body,
            res,
        );
        return data;
    } catch (err) {
        console.log({ err })
    }
};
const listBooking_admin = async (req, res) => {
    try {
        let data = await bookingService.listBooking_admin(
            req.body,
            req.query,
            res,
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
    listDoctors_admin,
    listEntity,
    transactionHistory,
    addNewDoctor,
    viewDoctor,
    updateDoctor,
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
    listClinicName,
    findDrByPhoneNo,
    findDoctorByID,
    listBooking_admin,
};

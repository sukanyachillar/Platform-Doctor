
import customerServices from '../services/customerServices.js'

const listDoctorsForCustomers = async (req, res) => {
    try {
        let data = await customerServices.listDoctorsForCustomers(req.body, res)
        return data
    } catch (err) {
        console.log({ err });
    }
}


const getSingleEntityDetails = async (req, res)=> {
    try {
        const data = await customerServices.getSingleEntityDetails(req, res );
        return data;
    } catch (error) {
        console.log({ err });
    }
  };

  
const amountDetails = async (req, res)=> {
    try {
        const data = await customerServices.amountDetails(req, res );
        return data;
    } catch (error) {
        console.log({ err });
    }
  };


export default { listDoctorsForCustomers, getSingleEntityDetails, amountDetails };
    
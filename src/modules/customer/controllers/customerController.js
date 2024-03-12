
import customerServices from '../services/customerServices.js'

const listDoctorsForCustomers = async (req, res) => {
    try {
        let data = await customerServices.listDoctorsForCustomers(req.body, res)
        return data
    } catch (err) {
        console.log({ err });
    }
}

export default { listDoctorsForCustomers };
    
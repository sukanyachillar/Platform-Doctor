import authenticationService from '../services/authenticationService.js'

const register = async (req, res) => {
    try {
        const registerResponse = await authenticationService.register(
            req.body,
            res
        )
        return registerResponse
    } catch (error) {
        console.log('error', error)
    }
}

const addProfile = async (req, res) => {
    try {
        const profileAdded = await authenticationService.addProfile(
            req.body,
            req.user,
            req.file,
            res
        )
        return profileAdded
    } catch (error) {
        console.log({ error })
    }
}

const getProfile = async (req, res) => {
    try {
        const getProfile = await authenticationService.getProfile(req, res)
        return getProfile
    } catch (error) {
        console.log({ error })
    }
}

const getProfileForCustomer = async (req, res) => {
    try {
        const getProfile = await authenticationService.getProfileForCustomer(
            req.body,
            res
        )
        return getProfile
    } catch (error) {
        console.log({ error })
    }
}

const getGeneralSettings = async (req, res) => {
    try {
        const getSettings = await authenticationService.getGeneralSettings(
            req,
            res
        )
        return getSettings
    } catch (error) {
        console.log({ error })
    }
}

const addDept = async (req, res) => {
    try {
        const dept = await authenticationService.addDept(
            req.body,
            req.user,
            res
        )
        return dept
    } catch (error) {
        console.log({ error })
    }
}

const fetchBankDetails = async (req, res) => {
    try {
        let bankData = await authenticationService.getBankDetails(req.user, res)
        return bankData
    } catch (err) {
        console.log({ err })
    }
}

const updateEntityStatus = async (req, res) => {
    try {
        let data = await authenticationService.updateEntityStatus(req.user, res)
        return data
    } catch (err) {
        console.log({ err })
    }
}

const updateProfile = async (req, res) => {
    try {
        let data = await authenticationService.updateProfileDetails(
            req.body,
            req.query,
            res
        )
        return data
    } catch (error) {
        console.log({ error })
    }
}

export default {
    register,
    addProfile,
    getProfile,
    addDept,
    getGeneralSettings,
    fetchBankDetails,
    getProfileForCustomer,
    updateEntityStatus,
    updateProfile,
    
}

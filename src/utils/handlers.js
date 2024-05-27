export const handleResponse = async (responseObj) => {
    
    const { res, statusCode, message, data } = responseObj;
    try {
        return res.status(200).json({ statusCode, message, data })
    } catch (error) {
        console.log(error)
        return res
            .status(500)
            .json({ statusCode: '500', message: 'INTERNAL_ERROR' })
    }
}

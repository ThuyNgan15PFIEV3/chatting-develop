
export default class Response {

    static returnSuccess (res, data) {
        if (res === undefined) {
            return data;
        }
        return res.status(200).json({
            success: true,
            data
        });
    }

    static returnError (res, error) {
        console.error(error);
        if (res === undefined) {
            return Promise.reject(error);
        }
        return res.status(400).json({
            success: false,
            error: error.message
        })
    }

}
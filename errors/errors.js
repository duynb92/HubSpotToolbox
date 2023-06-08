/*
100: Blog does not exist
101: Publish time is required
102: Too many medias. Right now HubSpot only support 1 media per social post.
*/

class CustomError {
    constructor(code) {
        this._code = code
    }

    get code() {
        return this._code;
    }

    get category() {
        if (this._code <= 199) {
            return 'Bad Request';
        }
        return 'Undefined error category';
    }

    get message() {
        switch (this._code) {
            case 100:
                return 'Blog does not exist';
            case 101:
                return 'Publish time is required';
            case 102:
                return 'Too many medias. Right now HubSpot only support 1 media per social post.'
            default:
                return 'Undefine error message';
        }
    }
}

module.exports = {
    throwError: (z, errorObj) => {
        throw new z.errors.Error(errorObj.message, errorObj.category, errorObj.code);
    },
    customError: CustomError
}
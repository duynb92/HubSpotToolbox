/*
100: Feature Image is required
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
            return 'InvalidData';
        }
        return 'Undefined error category';
    }

    get message() {
        switch (this._code) {
            case 100:
                return 'Feature Image is required';
            default:
                return 'Undefine error message';
        }
    }
}

module.exports = {
    throwError: (z, errorObj) => {
        throw new z.errors.Error(errorObj.message, errorObj.category, 100);
    },
    customError: CustomError
}
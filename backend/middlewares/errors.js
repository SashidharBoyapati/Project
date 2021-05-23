const ErrorHandler = require('../utils/errorHandler');

// module.exports = (err,req,res,next) =>{
//     err.statusCode = err.statusCode || 500; // 500 internal server error
//     err.message = err.message || 'Internal server error'

//     res.status(err.statusCode).json({
//         success: false,
//         error: err.stack,
//         message: err.message,
//         process: process.env.NODE_ENV
//     })
// }

module.exports = (err,req,res,next) =>{
    err.statusCode = err.statusCode || 500; // 500 internal server error
   
    if(process.env.NODE_ENV === 'DEVELOPMENT') {
        res.status(err.statusCode).json({
            success:false,
            error: err,
            errMessage: err.message,
            stack: err.stack
        })
    }

    if(process.env.NODE_ENV === 'PRODUCTION') {
        let error = {...err};

        error.message = err.message;

        //Wrong Mongoose Object Id Error
        if(err.name === 'CastError'){
            const message = `Resource not Found. Invalid ${err.path}`
            error = new ErrorHandler(message,400)
        }

        // Handling Mongoose Validation Error
        if(err.name === 'ValidationError'){
            const message = Object.values(err.errors).map(value => value.message)
            error = new ErrorHandler(message,400)
        }


        //Handling the mongoose duplicate key error
        if(err.code===11000){
            const message = `Duplicate ${Object.keys(err.keyValue)} entered`
            error = new ErrorHandler(message,400)
        }

        //Handling wrong JWT Error
        if(err.name === 'JsonWebTokenError'){
            const message = `JSON Web Token is invalid. Try again!1`
            error = new ErrorHandler(message,400)
        }
        //Handling wrong JWT Error
        if(err.name === 'TokenExpiredError'){
            const message = `JSON Web Token is expired. Try again!1`
            error = new ErrorHandler(message,400)
        }

        res.status(error.statusCode).json({
            success:false,
            message: error.message || 'Internal server Error'
        })
    }
}
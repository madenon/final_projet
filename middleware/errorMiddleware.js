// ne support pas (400) routes 

const notFound = (req, res, next)=>{
    const error = new Error(`Non Trouvé - ${req.originalUrl}`)
    res.status(404)
    next(error)
}

//  Les middlewares pour gérer les erreurs
const errorHandler = (error, req, res, next) =>{
    if(res.headerSent){
        return next(error)
    }

    res.status(error.code || 500).json({message:error.message || "Une erreur inconnue s'est produite"})
}


module.exports = {notFound, errorHandler}
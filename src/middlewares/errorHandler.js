const errorHandler = (error,req,res,next) =>{
    if(error.name==='CastError') return res.status(400).send({status:"error",error:"Invalid id format"});
    if(error.name==='ValidationError') return res.status(400).send({status:"error",error:error.message});
    if(error.name==='JsonWebTokenError') return res.status(401).send({status:"error",error:"Invalid token"});
    console.error(error);
    res.status(500).send({status:"error",error:"Internal server error"});
}

export default errorHandler;

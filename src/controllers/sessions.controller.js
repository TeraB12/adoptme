import { usersService } from "../services/index.js";
import { createHash, passwordValidation } from "../utils/index.js";
import jwt from 'jsonwebtoken';
import UserDTO from '../dto/User.dto.js';

const register = async(req,res,next) => {
    try {
        const { first_name, last_name, email, password } = req.body;
        if (!first_name || !last_name || !email || !password) return res.status(400).send({ status: "error", error: "Incomplete values" });
        const exists = await usersService.getUserByEmail(email);
        if (exists) return res.status(400).send({ status: "error", error: "User already exists" });
        const hashedPassword = await createHash(password);
        const user = {
            first_name,
            last_name,
            email,
            password: hashedPassword
        }
        const result = await usersService.create(user);
        res.send({ status: "success", payload: result._id });
    } catch (error) {
        next(error)
    }
}

const login = async(req,res,next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).send({ status: "error", error: "Incomplete values" });
        const user = await usersService.getUserByEmail(email);
        if(!user) return res.status(404).send({status:"error",error:"User doesn't exist"});
        const isValidPassword = await passwordValidation(user,password);
        if(!isValidPassword) return res.status(400).send({status:"error",error:"Incorrect password"});
        const userDto = UserDTO.getUserTokenFrom(user);
        const token = jwt.sign(userDto,process.env.JWT_SECRET,{expiresIn:"1h"});
        res.cookie('coderCookie',token,{maxAge:3600000}).send({status:"success",message:"Logged in"})
    } catch (error) {
        next(error)
    }
}

const current = async(req,res,next) =>{
    try {
        const cookie = req.cookies['coderCookie'];
        if(!cookie) return res.status(401).send({status:"error",error:"No active session"});
        const user = jwt.verify(cookie,process.env.JWT_SECRET);
        res.send({status:"success",payload:user})
    } catch (error) {
        next(error)
    }
}

const unprotectedLogin = async(req,res,next) =>{
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).send({ status: "error", error: "Incomplete values" });
        const user = await usersService.getUserByEmail(email);
        if(!user) return res.status(404).send({status:"error",error:"User doesn't exist"});
        const isValidPassword = await passwordValidation(user,password);
        if(!isValidPassword) return res.status(400).send({status:"error",error:"Incorrect password"});
        const token = jwt.sign(user.toObject(),process.env.JWT_SECRET,{expiresIn:"1h"});
        res.cookie('unprotectedCookie',token,{maxAge:3600000}).send({status:"success",message:"Unprotected Logged in"})
    } catch (error) {
        next(error)
    }
}

const unprotectedCurrent = async(req,res,next)=>{
    try {
        const cookie = req.cookies['unprotectedCookie'];
        if(!cookie) return res.status(401).send({status:"error",error:"No active session"});
        const user = jwt.verify(cookie,process.env.JWT_SECRET);
        res.send({status:"success",payload:user})
    } catch (error) {
        next(error)
    }
}

export default {
    current,
    login,
    register,
    unprotectedLogin,
    unprotectedCurrent
}

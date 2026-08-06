import {usersService,petsService} from "../services/index.js";
import {generateUsers,generatePets} from "../utils/mocking.js";

const parseQuantity = (value,fallback) =>{
    if(value===undefined) return fallback;
    const quantity = Number(value);
    if(!Number.isInteger(quantity)||quantity<0) return null;
    return quantity;
}

const getMockingPets = async(req,res)=>{
    const quantity = parseQuantity(req.query.quantity,100);
    if(quantity===null) return res.status(400).send({status:"error",error:"Quantity must be a positive integer"})
    const pets = generatePets(quantity);
    res.send({status:"success",payload:pets})
}

const getMockingUsers = async(req,res)=>{
    const quantity = parseQuantity(req.query.quantity,50);
    if(quantity===null) return res.status(400).send({status:"error",error:"Quantity must be a positive integer"})
    const users = await generateUsers(quantity);
    res.send({status:"success",payload:users})
}

const generateData = async(req,res)=>{
    const {users,pets} = req.body;
    const usersQuantity = parseQuantity(users,null);
    const petsQuantity = parseQuantity(pets,null);
    if(usersQuantity===null||petsQuantity===null) return res.status(400).send({status:"error",error:"Users and pets must be positive integers"})
    const newUsers = await generateUsers(usersQuantity);
    const newPets = generatePets(petsQuantity);
    if(newUsers.length) await usersService.createMany(newUsers);
    if(newPets.length) await petsService.createMany(newPets);
    res.send({status:"success",message:`${newUsers.length} users and ${newPets.length} pets inserted`})
}

export default {
    getMockingPets,
    getMockingUsers,
    generateData
}

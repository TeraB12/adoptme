import {faker} from '@faker-js/faker';
import mongoose from 'mongoose';
import {createHash} from './index.js';

const roles = ['user','admin'];
const species = ['dog','cat','bird','rabbit','hamster'];

let passwordHash = null;

const getPasswordHash = async() =>{
    if(!passwordHash) passwordHash = await createHash('coder123');
    return passwordHash;
}

export const generateUsers = async(quantity) =>{
    const password = await getPasswordHash();
    const users = [];
    for(let i=0;i<quantity;i++){
        const first_name = faker.person.firstName();
        const last_name = faker.person.lastName();
        users.push({
            _id:new mongoose.Types.ObjectId(),
            first_name,
            last_name,
            email:`${first_name}.${last_name}.${faker.string.alphanumeric(6)}@coder.com`.toLowerCase().replace(/[^a-z0-9@.]/g,''),
            password,
            role:faker.helpers.arrayElement(roles),
            pets:[],
            __v:0
        })
    }
    return users;
}

export const generatePets = (quantity) =>{
    const pets = [];
    for(let i=0;i<quantity;i++){
        pets.push({
            _id:new mongoose.Types.ObjectId(),
            name:faker.person.firstName(),
            specie:faker.helpers.arrayElement(species),
            birthDate:faker.date.birthdate({min:1,max:15,mode:'age'}),
            adopted:false,
            __v:0
        })
    }
    return pets;
}

export default {
    generateUsers,
    generatePets
}

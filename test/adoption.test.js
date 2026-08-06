import 'dotenv/config';
import {expect} from 'chai';
import supertest from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import userModel from '../src/dao/models/User.js';
import petModel from '../src/dao/models/Pet.js';
import adoptionModel from '../src/dao/models/Adoption.js';

const requester = supertest(app);

const createUser = () =>{
    return userModel.create({
        first_name:'Mateo',
        last_name:'Pereyra',
        email:`test.${Date.now()}${Math.random()}@coder.com`,
        password:'coder123'
    })
}

const createPet = () =>{
    return petModel.create({
        name:'Rocky',
        specie:'dog',
        birthDate:'2020-05-10'
    })
}

describe('Tests funcionales del router de adopciones',function(){

    before(async function(){
        await mongoose.connect(process.env.MONGO_URL_TEST);
    })

    beforeEach(async function(){
        await adoptionModel.deleteMany({});
        await userModel.deleteMany({});
        await petModel.deleteMany({});
    })

    after(async function(){
        await adoptionModel.deleteMany({});
        await userModel.deleteMany({});
        await petModel.deleteMany({});
        await mongoose.disconnect();
    })

    describe('GET /api/adoptions',function(){

        it('Devuelve un array vacio cuando no hay adopciones cargadas',async function(){
            const {statusCode,body} = await requester.get('/api/adoptions');
            expect(statusCode).to.equal(200);
            expect(body.status).to.equal('success');
            expect(body.payload).to.be.an('array').that.is.empty;
        })

        it('Devuelve todas las adopciones existentes',async function(){
            const user = await createUser();
            const pet = await createPet();
            await adoptionModel.create({owner:user._id,pet:pet._id});

            const {statusCode,body} = await requester.get('/api/adoptions');
            expect(statusCode).to.equal(200);
            expect(body.payload).to.have.lengthOf(1);
            expect(body.payload[0].owner).to.equal(user._id.toString());
            expect(body.payload[0].pet).to.equal(pet._id.toString());
        })
    })

    describe('GET /api/adoptions/:aid',function(){

        it('Devuelve la adopcion que corresponde al id enviado',async function(){
            const user = await createUser();
            const pet = await createPet();
            const adoption = await adoptionModel.create({owner:user._id,pet:pet._id});

            const {statusCode,body} = await requester.get(`/api/adoptions/${adoption._id}`);
            expect(statusCode).to.equal(200);
            expect(body.status).to.equal('success');
            expect(body.payload._id).to.equal(adoption._id.toString());
        })

        it('Devuelve 404 si la adopcion no existe',async function(){
            const inexistente = new mongoose.Types.ObjectId();

            const {statusCode,body} = await requester.get(`/api/adoptions/${inexistente}`);
            expect(statusCode).to.equal(404);
            expect(body.status).to.equal('error');
            expect(body.error).to.equal('Adoption not found');
        })

        it('Devuelve 400 si el id no tiene el formato de un ObjectId',async function(){
            const {statusCode,body} = await requester.get('/api/adoptions/123');
            expect(statusCode).to.equal(400);
            expect(body.status).to.equal('error');
            expect(body.error).to.equal('Invalid id format');
        })

        it('La API sigue respondiendo despues de recibir un id invalido',async function(){
            await requester.get('/api/adoptions/123');

            const {statusCode} = await requester.get('/api/adoptions');
            expect(statusCode).to.equal(200);
        })
    })

    describe('POST /api/adoptions/:uid/:pid',function(){

        it('Crea la adopcion cuando el usuario y la mascota existen',async function(){
            const user = await createUser();
            const pet = await createPet();

            const {statusCode,body} = await requester.post(`/api/adoptions/${user._id}/${pet._id}`);
            expect(statusCode).to.equal(200);
            expect(body.status).to.equal('success');
            expect(body.message).to.equal('Pet adopted');
        })

        it('Guarda la adopcion y actualiza la mascota y el usuario',async function(){
            const user = await createUser();
            const pet = await createPet();

            await requester.post(`/api/adoptions/${user._id}/${pet._id}`);

            const petActualizada = await petModel.findById(pet._id);
            expect(petActualizada.adopted).to.equal(true);
            expect(petActualizada.owner.toString()).to.equal(user._id.toString());

            const usuarioActualizado = await userModel.findById(user._id);
            expect(usuarioActualizado.pets).to.have.lengthOf(1);
            expect(usuarioActualizado.pets[0]._id.toString()).to.equal(pet._id.toString());

            const adopcion = await adoptionModel.findOne({owner:user._id,pet:pet._id});
            expect(adopcion).to.not.be.null;
        })

        it('Devuelve 404 si el usuario no existe',async function(){
            const pet = await createPet();
            const usuarioInexistente = new mongoose.Types.ObjectId();

            const {statusCode,body} = await requester.post(`/api/adoptions/${usuarioInexistente}/${pet._id}`);
            expect(statusCode).to.equal(404);
            expect(body.status).to.equal('error');
            expect(body.error).to.equal('user Not found');
        })

        it('Devuelve 404 si la mascota no existe',async function(){
            const user = await createUser();
            const petInexistente = new mongoose.Types.ObjectId();

            const {statusCode,body} = await requester.post(`/api/adoptions/${user._id}/${petInexistente}`);
            expect(statusCode).to.equal(404);
            expect(body.status).to.equal('error');
            expect(body.error).to.equal('Pet not found');
        })

        it('Devuelve 400 si la mascota ya fue adoptada',async function(){
            const user = await createUser();
            const pet = await createPet();
            await petModel.findByIdAndUpdate(pet._id,{adopted:true});

            const {statusCode,body} = await requester.post(`/api/adoptions/${user._id}/${pet._id}`);
            expect(statusCode).to.equal(400);
            expect(body.status).to.equal('error');
            expect(body.error).to.equal('Pet is already adopted');
        })

        it('Devuelve 400 si el id del usuario no tiene el formato de un ObjectId',async function(){
            const pet = await createPet();

            const {statusCode,body} = await requester.post(`/api/adoptions/123/${pet._id}`);
            expect(statusCode).to.equal(400);
            expect(body.error).to.equal('Invalid id format');
        })

        it('Devuelve 400 si el id de la mascota no tiene el formato de un ObjectId',async function(){
            const user = await createUser();

            const {statusCode,body} = await requester.post(`/api/adoptions/${user._id}/123`);
            expect(statusCode).to.equal(400);
            expect(body.error).to.equal('Invalid id format');
        })

        it('No permite adoptar dos veces la misma mascota',async function(){
            const user = await createUser();
            const pet = await createPet();

            await requester.post(`/api/adoptions/${user._id}/${pet._id}`);
            const {statusCode,body} = await requester.post(`/api/adoptions/${user._id}/${pet._id}`);

            expect(statusCode).to.equal(400);
            expect(body.error).to.equal('Pet is already adopted');
            const adopciones = await adoptionModel.find({pet:pet._id});
            expect(adopciones).to.have.lengthOf(1);
        })
    })
})

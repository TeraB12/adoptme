import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition:{
        openapi:'3.0.1',
        info:{
            title:'Documentacion de AdoptMe',
            version:'1.0.0',
            description:'Documentacion de la API del proyecto AdoptMe'
        }
    },
    apis:['./src/docs/*.yaml']
}

export default swaggerJsdoc(options);

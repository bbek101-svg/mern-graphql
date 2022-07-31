const {projects, clients} = require('../sampleData.js');

const Project = require('../models/Project');
const Client = require('../models/Client');

const {
   GraphQLObjectType,
   GraphQLID,
   GraphQLString,
   GraphQLSchema,
   GraphQLList,
   GraphQLNonNull,
   GraphQLEnumType
} = require('graphql');

//clientType

const ClientType = new GraphQLObjectType({
   name:'Client',
   fields: () => ({
      id: { type: GraphQLID },
      name:{ type: GraphQLString },
      email: { type: GraphQLString },
      phone: { type: GraphQLString }
   })
});

//Project Type
const ProjectType = new GraphQLObjectType({
   name:'Project',
   fields: () => ({
      id: { type: GraphQLID },
      name:{ type: GraphQLString },
      description: { type: GraphQLString },
      status: { type: GraphQLString },
      client:{
         type:ClientType,
         resolve(parent,args){
            return Client.findById(parent.clientId);

            //here client is a child elem of
            //project so to access any project elements inside of a child you just use parent.
            //and clientId is just what the key is in projects object
         }
      }
   })
});
// to make a query
//say get a client by an ID we need a root Query
// here fields is an object to get something
const RootQuery = new GraphQLObjectType({
   name: 'RootQueryType',
   fields:{
      projects: {
         type: new GraphQLList(ProjectType),
         resolve(parent,args){
            return Project.find();
         }
      },
      project:{
         type: ProjectType,
         args:{id: {type: GraphQLID}},
         resolve(parent, args){
            // moongose func
            return Project.findById(args.id);
         }
      },
      clients: {
         type: new GraphQLList(ClientType),
         resolve(parent,args){
            return Client.find();
         }
      },
      client:{
         type: ClientType,
         args:{id: {type: GraphQLID}},
         resolve(parent, args){
            // moongose func
            return Client.findById(args.id);
         }
      }
   }
});

// mutations
const mutation = new GraphQLObjectType({
   name:'Mutation',
   fields:{
      //add a client
      addClient: {
         type: ClientType,
         args:{
            name: {type: new GraphQLNonNull(GraphQLString)},
            email: {type: new GraphQLNonNull(GraphQLString)},
            phone: {type: new GraphQLNonNull(GraphQLString)},

         },
         resolve(parent, args){
            //creating new client using mongoose model
            const client = new Client({
               name: args.name,
               email:args.email,
               phone: args.phone,
            });
            return client.save();
         }
      },

      //Delete a client
      deleteClient :{
         type:ClientType,
         args: {
            id: {type: new GraphQLNonNull(GraphQLID)},
         },
         resolve(parents, args){
            return Client.findByIdAndRemove(args.id);
         }
      },
      //add a project
      addProject :{
         type: ProjectType,
         args: {
            name: {type: new GraphQLNonNull(GraphQLString)},
            description: {type: new GraphQLNonNull(GraphQLString)},
            status: {
               type: new GraphQLEnumType({
                  name: 'ProjectStatus',
                  values:{
                     'new': { value: 'Not Started' },
                     'progress': { value: 'In Progress' },
                     'completed': { value: 'completed' },
                  }
               }),
               defaultValue: 'Not Started',
            },
            clientId: { type: new GraphQLNonNull(GraphQLID)},
         },
         resolve(parent, args){
            const project = new Project({
               name: args.name,
               description: args.description,
               status: args.status,
               clientId: args.clientId,
            });
            return project.save()
         }
      },
       //Delete a project
       deleteProject: {
          type: ProjectType,
          args: {
             id: { type: new GraphQLNonNull(GraphQLID)},

          },
          resolve(parents, args){
             return Project.findByIdAndDelete(args.id);
          }
       },

       //Update a project
       updateProject: {
          type: ProjectType,
          args: {
             id: { type: new GraphQLNonNull(GraphQLID)},
             name: { type: GraphQLString},
             description: { type: GraphQLString},
             status: {
               type: new GraphQLEnumType({
                  name: 'ProjectStatusUpdate',
                  values:{
                     'new': { value: 'Not Started' },
                     'progress': { value: 'In Progress' },
                     'completed': { value: 'completed' },
                  },
               }),
            
            },
          },
          resolve(parent, args){
             return Project.findByIdAndUpdate(
               args.id,
               {
                  $set: {
                     name: args.name,
                     description: args.description,
                     status: args.status,
                  },
               },
               {new:true}
             );
          }
       }
   }
})

module.exports = new GraphQLSchema({
   query:RootQuery,
   mutation
})
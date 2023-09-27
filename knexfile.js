require("dotenv").config();
module.exports  = {
    development:{
    client:process.env.DB,
    connection:{
        filename:'./.data/db/users.db3',
    },
    useNullAsDefault:true,
    migrations:{
        directory:'./.data/db/migration', 
    },
    seed:{
        directory:'./.data/db/seed'
    },

    pool:{
        afterCreate:(conn, done) => {
        conn('Pragma foreign_key', done)   
    }
},
    },
};

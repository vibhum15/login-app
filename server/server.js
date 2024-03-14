import express from 'express'
import cors from 'cors'
import morgan from 'morgan';
import connect from './database/conn.js';
import router from './router/route.js';

const app = express();

// middleware

app.use(express.json());
app.use(cors());
app.use(morgan('tiny'));
app.disable('x-powered-by');
app.use(express.urlencoded({ extended: true }));

const port = 8080;

// HTTP GET REQUEST

app.get('/',(req,res) =>{
  res.status(201).json("Home get request");
})

// api routes
app.use('/api',router);


connect().then(()=>{
  try{
    app.listen(port,()=>{
      console.log(`server is connected to http://localhost:${port}`);
    })
  }
  catch (error){
    console.log("cannot connect to the server");
  }
}).catch(err =>{
  console.log("Invalid database connected ....");
})

// start server only when we have valid connection
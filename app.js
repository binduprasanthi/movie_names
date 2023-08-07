const express = require("express");
const path = require('path');
const {open} = require('sqlite');
const sqlite3 = require('sqlite3');
const app = express();
app.use(express.json());

const databasePath = path.join(__dirname,"moviesData.db");

let dataBase = null

const initializeDbAndServer = async()=>{
       try{
           dataBase = await open({
               filename:databasePath,
               driver:sqlite3.Database
           });
        app.listen(3000,()=>
        console.log("Server running at http://localhost:3000/");
        );
       }
       catch(error){
           console.log(`Database Error: ${error.message}`);
           process.exit(1);
       }
};

initializeDbAndServer();

const convertMovieDbObjectToResponseObject = (dbObject) =>{
    return {
        movie_id:dbObject.movieId,
        director_id:dbObject.directorId,
        movie_name:dbObject.movieName,
        lead_actor:dbObject.leadActor,
    };
};

const convertDirectorDbObjectToResponseObject = (dbObject)=>{
    return {
        director_id:dbObject.directorId,
        director_name:dbObject.directorName,
    };
};
//1

app.get("/movies",async(request,response)=>{
    const getMoviesQuery = `
    SELECT movie_name 
    FROM movie; `;
    const moviesArray = dataBase.all(getMoviesQuery);
    response.send(
        moviesArray.map((eachMovie)=>({movieName:eachMovie.movie_name}))
    );
});

//2

app.get("/movies/:movieId/",async(request,response)=>{
    const {movieId} = request.params;
    const eachMovieQuery = `
    SELECT * 
    FROM movie 
    WHERE movie_id = ${movieId};`;
    const movie = dataBase.get(eachMovieQuery);
    response.send(convertMovieDbObjectToResponseObject(movie));
});


//3

app.post("/movies/",async(request,response)=>{
    const {directorID,movieName,leadActor} = request.body;
    const postMovieQuery = `
    INSERT INTO movie(director_id,movie_name,lead_actor) 
    VALUES (${directorId},'${movieName}','${leadActor}');`;
    await dataBase.run(postMovieQuery);
    response.send("Movie Successfully Added");
});

//4
app.put("/movies/:movieId/",async(request,response)=>{
    const {directorId,movieName,leadActor} = request.body;
    const {movieId} = request.params;
    const updateMovieQuery = `
    UPDATE movie 
    SET director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE movie_id = ${movieId};`;
    await dataBase.run(updateMovieQuery);
    response.send("Movie Successfully Updated");


});

//5 
app.delete("/movies/:movieId/",async(request,response)=>{
    const {movieId} = request.params;
    const deleteMovieQuery = `
    DELETE FROM movie 
    WHERE movie_id = '${movieId};`;
    await dataBase.run(deleteMovieQuery);
    response.send("Movie Deleted Successfully");
});


//6
app.get("/directors/",async(request,response)=>{
    const getDirectorsQuery = `
    SELECT * 
    FROM director;`;
    const directorArray = await dataBase.all(getDirectorsQuery);
    response.send(directorArray.map((each_director)=> 
        convertDirectorDbObjectToResponseObject(each_director);
    ));

});

//7 
app.get("/directors/:directorId/movies/",async(request,response)=>{
    const {directorId} = request.params; 
    const getMoviesDirectedByDirector = `
    SELECT * 
    FROM movie 
    WHERE director_id = '${directorId}';`;
    const directedMovies =  await dataBase.all(getMoviesDirectedByDirector);
    response.send(directedMovies.map(eachMovie)=>
        ({movie_name:eachMovie.movie_name})
    );
});
module.exports = app;
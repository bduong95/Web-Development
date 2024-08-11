import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
const apiKey = "8668b98f-55d5-4197-b765-940a41c19b48";
const API_URL = "https://api.balldontlie.io/v1/teams";
const weather_apiKey = "9012c27a5eb37b52d8834037d5096797";
const weather_API_URL = "https://api.openweathermap.org/data/2.5/weather";
let teams;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
    try {
        const response = await axios.get(API_URL, {
            headers: {
                Authorization: apiKey,
            }
        });
        teams = response.data.data;

        res.render("index.ejs", {
            teams: teams
        });
    } 
    catch(error) {
        res.render("index.ejs", {
            teams: teams,
            error: error.message
        })
    }
});

app.post("/getTeam", async (req, res) => {
    try {
        const response = await axios.get(API_URL, {
            headers: {
                Authorization: apiKey,
            }
        });
        const team_list = response.data.data;
        const team_id = parseInt(req.body["teamID"]);
        console.log(req.body);

        let team = getTeam(team_list, team_id);
        team.logo = displayLogo(team_list, team_id);
        console.log(team.logo);

        let weather = await getWeather(team_list, team_id);
        console.log(weather);

        res.render("index.ejs", {
            teams: team_list,
            city: team.city,
            name: team.name,
            logo: team.logo,
            weather: weather
        });
    } 
    catch(error) {
        res.render("index.ejs", {
            teams: teams,
            error: error.message
        })
    }
});

app.post("/randomTeam", async (req, res) => {
    try {
        const response = await axios.get(API_URL, {
            headers: {
                Authorization: apiKey,
            }
        });
        const team_list = response.data.data;
        const team_id = Math.floor((Math.random() * 30) + 1);

       let team = getTeam(team_list, team_id);
       team.logo = displayLogo(team_list, team_id);

       let weather = await getWeather(team_list, team_id);
       console.log(weather);

        res.render("index.ejs", {
            teams: team_list,
            city: team.city,
            name: team.name,
            logo: team.logo,
            weather: weather
        });
    } 
    catch(error) {
        if (res.status(429))
        {
            res.redirect("/");
        }
        else {
            res.render("index.ejs", {
                teams: teams,
                error: error.message
            })
        }
    }
});

app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
})

// Helper functions
function getTeam(list, id)
{
    let team = {
        city: "",
        name: ""
    }

    for (let i = 0; i < list.length; i++)
    {
        if (list[i].id === id)
        {
            team.city = list[i].city;
            team.name = list[i].name
            break;
        }
    }
    return team;
}

function displayLogo(list, name) 
{
    let team = getTeam(list, name);
    let logo = "";
    
    for (let i = 0; i < list.length; i++)
    {
        if (team.name === list[i].name)
        {
            logo = team.name.toLowerCase() + ".png";
            break;
        }
        //console.log(logo);
    }
    return logo;
} 

async function getWeather(list, id) 
{ 
    let city = getTeam(list, id).city;
    console.log(city);

    // GS and LA is not a real place
    if (city === "Golden State")
    {
        city = "san francisco";
    } 
    else if (city === "LA") {
        city = "los angeles";
    }

    try {
        let result = await axios.get(weather_API_URL + "?q=" + city + "&appid=" + weather_apiKey + "&units=metric");
        console.log(city);
        let weather = {
            temp: result.data.main.temp,
            image: "http://openweathermap.org/img/wn/" + result.data.weather[0].icon + "@2x.png",
            description: result.data.weather[0].description
        }
        
        return weather;
        
    } catch(error) {
        console.log(error);
    }
}
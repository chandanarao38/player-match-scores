const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())
module.exports = app

const dbPath = path.join(__dirname, 'cricketMatchDetails.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

const resultFunc1 = item => {
  return {
    playerId: item.player_id,
    playerName: item.player_name,
  }
}

const resultFunc2 = item => {
  return {
    matchId: item.match_id,
    match: item.match,
    year: item.year,
  }
}

//API 1
app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
    SELECT *
    FROM player_details
    `
  const result = await db.all(getPlayersQuery)
  console.log(result.map(item => resultFunc1(item)))
  response.send(result.map(item => resultFunc1(item)))
})

//API 2
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerDetails = `
  SELECT *
  FROM player_details
  WHERE player_id = ${playerId}
  `
  const result = await db.get(getPlayerDetails)
  console.log(resultFunc1(result))
  response.send(resultFunc1(result))
})

//API 3
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const {playerName} = request.body
  const updatePlayerQuery = `
    UPDATE player_details
    SET player_name = '${playerName}'
    WHERE player_id = ${playerId}
  `
  await db.run(updatePlayerQuery)
  console.log('Player Details Updated')
  response.send('Player Details Updated')
})

//API 4
app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const getMatchQuery = `
    SELECT *
    FROM match_details
    WHERE match_id = ${matchId}
  `
  const result = await db.get(getMatchQuery)
  console.log(resultFunc2(result))
  response.send(resultFunc2(result))
})

//API 5
app.get('/players/:playerId/matches', async (request, response) => {
  const {playerId} = request.params
  const getMatchDetails = `
    SELECT match_id as matchId, match, year
    FROM player_match_score NATURAL JOIN match_details
    WHERE player_id = ${playerId}
  `
  const result = await db.all(getMatchDetails)
  console.log(result)
  response.send(result)
})

//API 6
app.get('/matches/:matchId/players', async (request, response) => {
  const {matchId} = request.params
  const getPlayerDetailsQuery = `
    SELECT player_id as playerId, player_name as playerName
    FROM player_match_score natural join player_details
    WHERE match_id = ${matchId}
  `
  const result = await db.all(getPlayerDetailsQuery)
  console.log(result)
  response.send(result)
})

//API 7
app.get('/players/:playerId/playerScores', async (request, response) => {
  const {playerId} = request.params
  const getstatsPlayerDataQuery = `
    SELECT 
      player_id as playerId,
      player_name as playerName,
      SUM(score) as totalScore,
      SUM(fours) as totalFours,
      SUM(sixes) as totalSixes
    FROM player_match_score natural join player_details
    WHERE player_id = ${playerId}
  `
  const result = await db.get(getstatsPlayerDataQuery)
  console.log(result)
  response.send(result)
})

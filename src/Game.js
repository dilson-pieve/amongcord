const GameStages = require('./GameStages')
const Player = require('./Player')
const PlayerColors = require('./PlayerColors')

class Game {
  constructor (voiceChannel) {
    this.voiceChannel = voiceChannel
    this.gameStage = GameStages.LOBBY
    this.players = []
  }

  setStage (stage) {
    this.gameStage = stage
    this.players.forEach(player => {
      if (stage.toLowerCase() === GameStages.LOBBY) player.setAlive(true)
      this.updatePlayerMute(player)
    })
  }

  addPlayer (member, color) {
    const player = new Player(member, color)
    this.players.push(player)
    return player
  }

  removePlayer (member) {
    const player = this.getPlayer(member)
    this.players.splice(this.players.indexOf(player), 1)
  }

  getPlayer (member) {
    return this.players.find(p => p.member.user.id === member.user.id)
  }

  getPlayerByColor (color) {
    return this.players.find(p => p.color === color)
  }

  setPlayerAlive (member, alive) {
    const player = this.getPlayer(member)
    player.setAlive(alive)
    this.updatePlayerMute(player)
  }

  isColorOccupied (color) {
    return !!this.getPlayerByColor(color.toLowerCase())
  }

  getAvailableColors () {
    return Object.keys(PlayerColors).map(k => PlayerColors[k]).filter(c => !this.getPlayerByColor(c))
  }

  getOccupiedColors () {
    return Object.keys(PlayerColors).map(k => PlayerColors[k]).filter(c => !!this.getPlayerByColor(c))
  }

  getDeadColors () {
    return this.players.filter(p => !p.alive).map(p => p.color)
  }

  getAliveColors () {
    return this.players.filter(p => !!p.alive).map(p => p.color)
  }

  updatePlayerMute (player) {
    if (player.member.user.bot) return
    switch (this.gameStage) {
      case GameStages.LOBBY: 
        player.member.voice.setMute(false)
        break
      case GameStages.DISCUSSION:
        if (player.alive) {
          player.member.voice.setMute(false)
        } else {
          player.member.voice.setMute(true)
        }
        break
      case GameStages.TASKS:
        player.member.voice.setMute(true)
        break
    }
  }
}

module.exports = Game
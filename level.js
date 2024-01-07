const ACTORS = {
    'o': Coin,
    '@': Player,
    'v': Lava,
    '|': Lava,
    '=': Lava,

}
const STATICS = {
    'x': 'wall',
    '!': 'lava',
    'q': 'cornerUpL',
    'e': 'cornerUpR',
    'a': 'cornerDwL',
    'd': 'cornerDwR',
    's': 'cornerDwSharp',
    'w': 'cornerUpSharp',
    'y': 'lavaUpL',
    'r': 'lavaUpR',
    'h': 'lavaDwL',
    'f': 'lavaDwR'
}
const MAX_STEP = 0.05
const coinAudio = new Audio('/sound/coin.wav')
function Level(plan) {
    if (!validateLevel(plan)) throw new Error('Error en el nivel. Necessitamos al menos un player y una moneda')
    this.width = plan[0].length
    this.height = plan.length
    this.status = null
    this.finishDelay = 2
    this.grid = []
    this.actors = []
    this.actor = null
    for (let y = 0; y < this.height; y++) {
        let line = plan[y]
        let gridLine = []
        for (let x = 0; x < this.width; x++) {
            let char = line[x]
            let charType = null

            let Actor = ACTORS[char]
            if (Actor) {

                this.actors.push(new Actor(new Vector(x, y), char))
            }

            if (char in STATICS) { charType = STATICS[char] }
            gridLine.push(charType)
        }
        this.grid.push(gridLine)
    }
    
    this.player = this.actors.filter((act) => act.type === 'player')[0]

}

Level.prototype.isFinished = function() {
    return (this.status !== null && this.finishDelay < 0)}

Level.prototype.animate = function (step, keys) {
    
    if (this.status !== null) {
        
        this.finishDelay -= step
    }
    while (step > 0) {
        let thisStep = Math.min(step, MAX_STEP)
        this.actors.forEach(actor => actor.act(thisStep, this, keys))
        step -= thisStep
    }
}


Level.prototype.obstacleAt = function (position, size)  {
    
    let xStart = Math.floor(position.x)
    let xEnd = Math.ceil(position.x + size.x)
    let yStart = Math.floor(position.y)
    let yEnd = Math.ceil(position.y + size.y)
    
    if (xStart < 0 || xEnd > this.width || yStart < 0) return 'wall'
    if (yEnd > this.height) return 'lava'

    for (let y = yStart; y < yEnd; y++) {
        for (let x = xStart; x < xEnd; x++) {
            let fieldType = this.grid[y][x]
            if (fieldType) return fieldType
        }
    }
}
Level.prototype.actorAt = function (actor) {
    for (let i = 0; i < this.actors.length; i++) {
        let other = this.actors[i]
        if(actor !== other && 
        actor.position.x + actor.size.x > other.position.x &&
        actor.position.x < other.position.x + other.size.x &&
        actor.position.y + actor.size.y > other.position.y &&
        actor.position.y < other.position.y + other.size.y) return other
    }
}

Level.prototype.playerTouched = function (type, actor) {


    if (type === 'lava' & this.status === null) {
        this.status = 'lost'
        this.finishDelay = 1
    } else if (type === 'coin') {
        playAudio()
        this.actors = this.actors.filter(otherActor => otherActor !== actor)
        if (!remainCoins(this.actors)){
            this.status = 'won'
            this.finishDelay = 2
        }
    }
}
function remainCoins (actors) {return actors.some(actor => actor.type === 'coin')}
function validateLevel(level) {return level.toString().trim('').indexOf('@') !== -1 && level.toString().trim('').indexOf('o') !== -1}

function playAudio () {
    coinAudio.pause()
    coinAudio.currentTime = 0
    coinAudio.play()
}
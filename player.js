const playerSpeed = 7
const gravity = 28
const jumpSpeed = 22

function Player (initialPosition) {
    this.position = initialPosition.plus(new Vector(0, -0.6))
    this.size = new Vector(0.6, 1.5)
    this.speed = new Vector(0, 0)
}

Player.prototype.type = 'player'

Player.prototype.moveX = function (step, level, keys) {
    this.speed.x = 0
    if (keys.left) this.speed.x -= playerSpeed
    if (keys.right) this.speed.x += playerSpeed
    let motion = new Vector(this.speed.x * step, 0)
    let newPosition = this.position.plus(motion)
    let obstacle = level.obstacleAt(newPosition, this.size)
    if (obstacle) level.playerTouched(obstacle)
    else this.position = newPosition
}

Player.prototype.moveY = function (step, level, keys) {
    this.speed.y += step * gravity
    let motion = new Vector(0, this.speed.y * step)
    let newPosition = this.position.plus(motion)
    let obstacle = level.obstacleAt(newPosition, this.size)

    if (obstacle) {
        level.playerTouched(obstacle)
        if (keys.jump && this.speed.y > 0) this.speed.y = -jumpSpeed
        else this.speed.y = 0
    } else {
        this.position = newPosition
    }
}

Player.prototype.act = function (step, level, keys) {
    this.moveX(step, level, keys)
    this.moveY(step, level, keys)
    let otherActor = level.actorAt(this)
    if (otherActor) level.playerTouched(otherActor.type, otherActor)
    if (level.status === 'lost') {
        this.position.y += step*2
        this.size.y -= step
    }
}
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const width = canvas.width
const height = canvas.height
const blockSize = 10
const widthInBlock = width / blockSize
const heightInBlock = height / blockSize
let score = 0
let animationTime = 300
let playing = true

const drawBorder = function() {
    ctx.fillStyle = 'grey';        
    ctx.fillRect(0, 0, width, blockSize);       
    ctx.fillRect(0, 0, blockSize, height);       
    ctx.fillRect(0, height-blockSize, width, blockSize);       
    ctx.fillRect(width-blockSize, 0, blockSize, height); 
}
const drawScore = function() {
    ctx.font = '20px Courier';
    ctx.fillStyle = 'black'
    ctx.textAlign='left';
    ctx.textBaseline='top';
    ctx.fillText(`Счет: ${score}`, blockSize, blockSize);    
} 
const gameOver = function() {
    playing = false
    ctx.font = '60px Courier'
    ctx.fillStyle = 'black'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`Конец игры`, width / 2, height / 2);    
}
const circle = function(x, y, r, fillCircle) {
    ctx.beginPath();    
    ctx.arc(x, y, r, 0, 2*Math.PI, false)
    if (fillCircle) {
        ctx.fill()
    } ctx.stroke();    
}

const Block = function(col, row) {
    this.row = row
    this.col = col
}
Block.prototype.drawSquare = function(color) {
    let x = this.col * blockSize
    let y = this.row * blockSize
    ctx.fillStyle = color
    ctx.fillRect(x, y, blockSize, blockSize)
}
Block.prototype.drawCircle = function(color) {
    let centerX = this.col * blockSize + blockSize / 2
    let centerY = this.row * blockSize + blockSize / 2
    ctx.fillStyle = color
    circle(centerX, centerY, blockSize / 2, true)    
}
Block.prototype.equal = function(otherBlock) {
    return this.col === otherBlock.col && this.row === otherBlock.row
}

const Snake = function() {
    this.segments = [
        new Block(7, 5),
        new Block(6, 5),
        new Block(5, 5)
    ]
    this.direction = 'right'
    this.nextDirection = 'right'
}
Snake.prototype.draw = function() {
    for (let i = 0 ; i < this.segments.length ; i++){ 
        if ( i % 2 === 0 ) {
            this.segments[i].drawSquare('black')
        } else this.segments[i].drawSquare('yellow')
    }
    this.segments[0].drawSquare('LimeGreen')
}
Snake.prototype.move = function() {
    let head = this.segments[0]
    let newHead
    this.direction = this.nextDirection   

    if (this.direction === 'right') {
        newHead = new Block(head.col + 1, head.row)
    } else if (this.direction === 'left') {
        newHead = new Block(head.col - 1, head.row)
    } else if (this.direction === 'up') {
        newHead = new Block(head.col, head.row - 1)
    } else if (this.direction === 'down') {
        newHead = new Block(head.col, head.row + 1)
    }    
    if (this.checkCollision(newHead)) {
        gameOver()
        return
    }
    this.segments.unshift(newHead)

    if (newHead.equal(apple.position)){
        score++
        apple.move(this.segments)
        animationTime -= 10
    } else  this.segments.pop()       
}
Snake.prototype.checkCollision = function(head) {
    const leftCollision = head.col === 0
    const rightCollision = head.col === widthInBlock - 1
    const topCollision = head.row === 0
    const bottomCollision = head.row === heightInBlock - 1
    const wallCollision = leftCollision || rightCollision || topCollision || bottomCollision
    
    let selfCollision = false
    for (let i = 0 ; i < this.segments.length ; i++) {
        if (head.equal(this.segments[i])) {
            selfCollision = true
        }
    }   
    return wallCollision || selfCollision
}
Snake.prototype.setDirection = function(newDirection) {
    if (this.direction === 'up' && newDirection === 'down') {
        return
    } else if (this.direction === 'right' && newDirection === 'left') {
        return
    } else if (this.direction === 'down' && newDirection === 'up') {
        return
    } else if (this.direction === 'left' && newDirection === 'right') {
        return
    }
    this.nextDirection = newDirection
}

const Apple = function() {
    this.position = new Block(10, 10)
}
Apple.prototype.draw = function() {
    this.position.drawCircle('LimeGreen')
}
Apple.prototype.move = function(occupiedBlocks) {
    let randomCol = Math.floor(Math.random() * (widthInBlock - 2)) + 1
    let randomRaw = Math.floor(Math.random() * (heightInBlock - 2)) + 1
    this.position = new Block(randomCol, randomRaw)
    
    occupiedBlocks.forEach(element => {
        if (element === this.position) {
            this.move(occupiedBlocks)
            return
        }  
    })
}

const directions = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
}

const snake = new Snake()
let apple = new Apple()

const gameLoop = function() {
    ctx.clearRect(0, 0, width, height)
    drawScore()
    snake.move()
    snake.draw()
    apple.draw()
    drawBorder()

    if (playing) {
        setTimeout(gameLoop, animationTime)
    }
}
gameLoop()

jQuery(() => {
    $('body').keydown(function (e) { 
        let newDirection = directions[e.keyCode]  
        if(newDirection) {
            snake.setDirection(newDirection)
        }
    });
})

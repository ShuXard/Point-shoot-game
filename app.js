const canvas = document.querySelector('#canvas1')
const ctx = canvas.getContext('2d')
canvas.width = window.innerWidth
canvas.height = window.innerHeight
const collisionCanvas = document.querySelector('#collisionCanvas')
const collisionCtx = collisionCanvas.getContext('2d')
collisionCanvas.width = window.innerWidth
collisionCanvas.height = window.innerHeight
let timeToNextRaven = 0
let ravenInterval = 500
let lastTime = 0
let score = 0
ctx.font = '50px Impact'
let gameOver = false


let explosions = []
let ravens = []

class Raven {
    constructor(){
        this.spriteWidth = 271;
        this.spriteHeight = 194;
        this.sizeModifiere = Math.random() * 0.6 + 0.4;
        this.width = this.spriteWidth * this.sizeModifiere;
        this.height = this.spriteHeight * this.sizeModifiere;
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - this.height);
        this.directionX = Math.random() * 5 + 3;
        this.directionY = Math.random() * 5 - 2.5;
        this.image = new Image();
        this.image.src = 'src/raven.png';
        this.frame = 0;
        this.maxFrame = 4;
        this.marckedForDeletion = false;
        this.timeSinceFlap = 0
        this.flapInterval = Math.random() * 50 + 50
        this.randomColors = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)]
        this.color = 'rgb(' + this.randomColors[0] + ',' + this.randomColors[1] + ',' + this.randomColors[2] + ')'
    }
    update(deltaTime){
        if(this.y < 0 || this.y > canvas.height - this.height){
            this.directionY = this.directionY * -1
        }
        this.x -= this.directionX;
        this.y -= this.directionY
        if(this.x < 0 - this.width){
            this.marckedForDeletion = true;
        }
        this.timeSinceFlap += deltaTime
        if(this.timeSinceFlap > this.flapInterval){
            if(this.frame > this.maxFrame){
                this.frame = 0
            } else{
                this.frame++
                this.timeSinceFlap = 0
            }
        }
        if(this.x < 0 - this.width){
            gameOver = true
        }
    }
    draw(){
        collisionCtx.fillStyle = this.color
        collisionCtx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height)
    }

}




class Explosion {
    constructor(x, y, size){
     
        this.spriteWidth = 200
        this.spriteHeight = 179
        this.width = this.spriteWidth * 0.7
        this.height = this.spriteHeight * 0.7
        this.size = size
        this.x = x
        this.y = y
        this.image = new Image()
        this.image.src = 'src/boom.png'
        this.frame = 0
        this.angle = Math.random() * 6.2
        this.sound = new Audio()
        this.sound.src = 'src/boom1.wav'
        this.timeSinceLastFrame = 0
        this.frameInterval = 200
        this.marckedForDeletion = false;
    }
    update(deltaTime){
        if(this.frame === 0){
            this.sound.play()
        }
        this.timeSinceLastFrame += deltaTime
        if(this.timeSinceLastFrame > this.frameInterval){
            this.frame++
            this.timeSinceLastFrame = 0
            if(this.frame > 5){
                this.marckedForDeletion = true
            }
        }
        
    }
    draw(){
        // ctx.save()
        // ctx.translate(this.x, this.y)
        // ctx.rotate(this.angle)
        ctx.drawImage(this.image, this.spriteWidth * this.frame, 0, this.spriteWidth, this.spriteHeight, this.x, this.y - this.size/4, this.size, this.size)
        // ctx.restore()
    }
}



function drawScore(){
    ctx.fillStyle = 'black'
    ctx.fillText('Score: ' + score, 50, 75)
    ctx.fillStyle = 'white'
    ctx.fillText('Score: ' + score, 55, 80)
}

function drawGameOver(){
    ctx.textAlign = 'center'
    ctx.fillStyle = 'black'
    ctx.fillText('GAME OVER, your score is ' + score, canvas.width/2, canvas.height/2)
    ctx.fillStyle = 'white'
    ctx.fillText('GAME OVER, your score is ' + score, canvas.width/2 + 5, canvas.height/2 + 5)
}


window.addEventListener('click', (e) => {
    const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1)
    const pc = detectPixelColor.data
    ravens.forEach(object => {
        if(object.randomColors[0] === pc[0] && object.randomColors[1] === pc[1] && object.randomColors[2] === pc[2]){
            object.marckedForDeletion = true
            score++
            explosions.push(new Explosion(object.x, object.y, object.width))
        }
    })
})


function animate(timestamp){
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    collisionCtx.clearRect(0, 0, canvas.width, canvas.height)
    let deltaTime = timestamp - lastTime
    lastTime = timestamp
    timeToNextRaven += deltaTime
    if(timeToNextRaven > ravenInterval){
        ravens.push(new Raven())
        timeToNextRaven = 0
        ravens.sort(function(a, b){
            return a.width - b.width
        })
    }
    drawScore();
    [...ravens,...explosions].forEach(object => object.update(deltaTime));
    [...ravens,...explosions].forEach(object => object.draw());
    ravens = ravens.filter(object => !object.marckedForDeletion)
    explosions = explosions.filter(object => !object.marckedForDeletion)
    if(!gameOver){
        requestAnimationFrame(animate)
    } else {
        drawGameOver()
    }
}

animate(0)










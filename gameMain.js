

let precisionX = 8
let precisionY = 8
const gameSeconds = 50;

const play = (audio,time = 0,volume = 1) => {
  audio.currentTime = 0;
  audio.volume = volume;
  audio.play()
}

// for explosion
const loopRate = 20;
const toExplode = [];
const frameWidth = 50;
const frameHeight = 50;
const maxCol = 4;
const maxRow = 4;

function Explosion(x, y, s) {
  this.x = x;
  this.y = y;
  this.s = s;
  this.exploded = false;
  this.row = 0;
  this.col = 0;
}

const showExploded = (target) => {
  const {x,y} = target.position;
  const {width,height} = target.size;
  const s = (width + height)/2
  toExplode.push(new Explosion(x, y, s))
}

const updateExplosions = e => {
  toExplode.forEach(explosion => {
    ctx.drawImage(explosionSpriteFrame, explosion.col * frameWidth, explosion.row * frameWidth, frameWidth, frameHeight, explosion.x, explosion.y, explosion.s, explosion.s)

    if (explosion.col < maxCol) {
      explosion.col++
    } else if (explosion.row < maxRow) {
      explosion.row++
      explosion.col = 0
    } else {
      explosion.exploded = true
    }
  })

  toExplode.filter(explosion => (!explosion.exploded))
}
      
      
const getAngle = (obj1,obj2) => {
  const dx = obj2.position.x - obj1.position.x;
  const dy = obj2.position.y - obj1.position.y;
  
  const radian = Math.atan2(dx,dy);
  
  return -radian
}

const getVelocity = (obj1, obj2, speed) => {
  const angle = Math.atan2(obj2.position.y - obj1.position.y, obj2.position.x - obj1.position.x);
  const velocity = {
    x: Math.cos(angle) * speed,
    y: Math.sin(angle) * speed
  };
  
  return velocity;
}

// for shaking 
let shake = false;
const shakeMin = -5;
const shakeMax = 5;
let tx = 0;
let ty = 0;
const updateShakes = e => {
  if(shake){
  tx = random(shakeMin,shakeMax);
  ty = random(shakeMin,shakeMax);
  }else{
   ctx.translate(0,0);
   tx = 0;
   ty = 0
  }
}

let {speed,rockSize,rockHp,roundExtras,
bulletDp,bulletRate,rockRate,extraReleaseInterval,
rock_producer,bullet_producer,Bullet,Rock,User,Bomb}
= {};
let [bulletSpeed,GameBoss,gameLoop] = [];
let gameTime = 0;
let previousTime = 0;

const updateTimers = (bulletInterval = Game.rounds[Game.currentRound - 1].bulletRate,rockInterval = Game.rounds[Game.currentRound - 1].rockRate) => {
  clearInterval(rock_producer);
  clearInterval(bullet_producer);
  Game.last_bullet_rate = bulletInterval;
  Game.last_rock_rate = rockInterval
    
  bullet_producer = setInterval(e => {
    if((!Game.holded || !Game.freezed) && !User.dieing){
    Game.bullets.push(new Bullet({
      x: User.position.x + User.size.width/2 - User.bulletSize.width/2,
      y: User.position.y + User.size.height/2 - User.bulletSize.height/2
    }));
    
    if(bulletRate != Game.last_bullet_rate){
       updateTimers(bulletRate,rockRate);
    }
    }
  },bulletInterval * 1000)
  
if(Game.currentRound == Game.rounds.length+1) return;
  if((!Game.holded || !Game.freezed) && !User.dieing){
  rock_producer = setInterval(e => {
    Game.rocks.push(new Rock());
    if(Game.last_rock_rate !== rockRate){
       updateTimers(bulletRate,rockRate);
    }
  },rockInterval * 1000)
  }
}


const startGame = e => {
  Game.bgSoundVolume = .5;
  Game.holded = false;
  Game.ended = false;

  const changeRound = (round,callback = null) => {
    state.textContent = `Round ${round}`
    state.style.animationName = 'up';
    ({speed, rockSize, rockHp, bulletDp, bulletRate, rockRate, roundDistance, roundExtras,bulletSpeed} = Game.rounds[round - 1]);
    User.bulletDp = bulletDp
    extraReleaseInterval = Math.round(roundDistance / roundExtras) // release time for power
   // changing rock frames
    rockFrame.src = `./frames/rockFrame${Game.currentRound}.png`
  //  Game.holded = (Game.currentRound == Game.rounds.length+1)
    Game.freeze()
    
   // console.log(extraReleaseInterval)
        
    setTimeout(e => {
      callback ? callback() : null;
       Game.unfreeze();
       Game.last_rock_rate = rockRate;
       Game.last_bullet_rate = bulletRate;
       
       state.style.bottom = '-100%';
       state.style.animationName = null;
       
       updateTimers()
       showNav()
     }, Game.roundChangeDelay * 1000)
  }
  
   
  
  Sections.open(gameField)
  
  Bomb = function(frame,position,velocity,timeLeft,dp,size,hp){
    if(Game.holded || Game.freezed) return
    this.position = position;
    this.velocity = velocity;
    this.timeLeft = timeLeft;
    this.frame = frame;
    this.dp = dp;
    this.size = size
    this.hp = hp
    
    this.draw = e => {
      if(this.timeLeft  > 0){
      if(!has_collided(this,User)){
      ctx.drawImage(this.frame,this.position.x,this.position.y,this.size.width,this.size.height)
      if(this.position.x + this.size.width >= cw || this.position.x <= 0){
        this.velocity.x = -this.velocity.x;
        play(hitSound)
      }
      
      if(this.position.y + this.size.height >= ch || this.position.y <= 0){
        this.velocity.y = -this.velocity.y
        play(hitSound)
      }
      
      Game.bullets.forEach(bullet => {
        if(has_collided(this,bullet)){
          if(this.hp > 0){
            this.hp -= bullet.dp
          }else{
            GameBoss.bomb.bombs = GameBoss.bomb.bombs.remove(this)
            play(explosionSound,0,Game.explosionSoundVolume);
            showExploded(this)
          }
          
         Game.bullets = Game.bullets.remove(bullet)
        }
      })
      
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
      
      this.timeLeft--
      }else{
        if(!User.isSafed && !User.dieing){
        User.currentHp -= this.dp;
        play(planeHitSound)
        }else if(User.isSafed){
        showExploded(this);
        play(explosionSound,0,Game.explosionSoundVolume)
        }
        GameBoss.bomb.bombs = GameBoss.bomb.bombs.remove(this);
      }
      }else{
        GameBoss.bomb.bombs = GameBoss.bomb.bombs.remove(this)
      }
    }
    
    
  }
  
    
  Rock = function (frame = rockFrame){
    this.size = {
      width: random(rockSize/2,rockSize),
      height: random(rockSize/2,rockSize)
    };
    
    
    this.position = {
      x: random(0 + 10,cw - this.size.width - 10), // 10 for rock margin from blocks
      y: random(-this.size.height,-this.size.height - 100) // 50 hide rock
    }
    
    
    this.frame = frame
    
    
    this.hp = (((this.size.width + this.size.height) / 2)  / rockSize) * rockHp
    
    this.draw = function(){
    
      if(this.hp > 0 && this.position.y < ch){
       Game.bullets.forEach(bullet => {
          if(has_collided(this,bullet)){
           Game.bullets = Game.bullets.remove(bullet)
           this.hp -= bullet.dp
          }
        })
        
        this.position.y += speed // rock speed
        ctx.drawImage(this.frame,this.position.x , this.position.y, this.size.width, this.size.height);
       }else{
        Game.rocks = Game.rocks.remove(this);
        if(this.hp < 0){
        play(explosionSound,0,0.4)
        showExploded(this)
        }
      }
      
    }
    
  }
  
   Bullet = function(position = {x:0, y:0},dp = User.bulletDp,frame = bulletFrame,radian = 0,velocity = {x: 0,y: -bulletSpeed},size = {width: User.bulletSize.width,height: User.bulletSize.height},producer = 'User'){
    this.size = size;
    this.frame = frame;
    this.angle = radian;
    this.velocity = velocity
    this.position = position;
    this.producer = producer
    this.dp = dp;
   
  
  !Game.holded && !Game.freezed && this.producer == "User" ? play(shootSound,.1,Game.shootSoundVolume) : null
  // play sound on creation
  this.draw = function(){
    ctx.save();
    ctx.translate(this.position.x,this.position.y);
    ctx.rotate(this.angle);
    this.position.y += this.velocity.y
    this.position.x += this.velocity.x// bullet move fast
    ctx.drawImage(this.frame,0,0,this.size.width,this.size.height)
    ctx.restore();
  }
  }
  



const backgrounds = [
  {
    y: -ch
  },
  {
    y: 0
  }]

 gameLoop = (runningTime = 0) => {
  Game.animationFrameId = requestAnimationFrame(gameLoop);
  if(!previousTime) previousTime = runningTime
  gameTime = runningTime - previousTime;
  if(!Game.holded){
  ctx.clearRect(0,0,cw,ch);
  Game.distance = Math.floor(speed * (gameTime / 1000));
  // distance = speed * time

  ctx.save();
  ctx.translate(tx,ty)
  backgrounds.forEach(background => {
  ctx.drawImage(bgFrame,0,background.y,cw,ch + Game.speed * 2);
  background.y += speed - 1; // -1 for speed
  if(background.y >= ch){
    background.y = -ch 
  }
  })
  ctx.restore()
  
  
  
  Game.bullets.forEach(bullet => bullet.draw())
  Game.rocks.forEach(rock => rock.draw());
   
  if(bgSound.paused){
    play(bgSound,0,Game.bgSoundVolume)
  }else if(bgSound.currentTime >= bgSound.duration-10){
    play(bgSound,5)
  }
  
  let lifes = '';
  
  if(User.life){
  let lifeCounts = 0;
  while(lifeCounts !== User.life){
    lifes += '❤️'
    lifeCounts++
  }
  lifeDisplay.textContent = `Life: ${lifes}`;
  }else{
    lifeDisplay.textContent = `Life: 0`;
     // end game life ends
      Game.defeated = true;
      Game.defeater = 'asteroid'
      User.die()
  }
  
  // for user blink
  Game.rocks.forEach(rock => {
    if(has_collided(User,rock)){
      if(User.life && !User.pending && !User.isSafed){
      User.timeCapt = gameTime;
      play(planeHitSound)
      User.pending = true;
      setTimeout(e => {
        User.pending = false;
      },User.blinkDuration * 1000);
      User.life--
      }else if(User.isSafed){
        showExploded(rock);
        play(explosionSound,0,Game.explosionSoundVolume)
      }
      Game.rocks = Game.rocks.remove(rock)
    }
  })
 
 if(User.pending || User.blinking){
   if(Math.round(gameTime - User.timeCapt) >= (User.blinkRate * 1000)){
   User.visible = !User.visible;
   User.timeCapt = gameTime;
   }
 }else{
   User.visible = true
 }
 
 // drawing user
 ctx.save();
 if(User.visible && !User.dieing){
 ctx.translate(User.position.x,User.position.y);
 ctx.drawImage(User.frame,0,0,User.size.width,User.size.height)
 if(User.isSafed){
   ctx.restore()
   ctx.save()
   ctx.translate(User.position.x + User.size.width/2,User.position.y + User.size.width/2);
   ctx.rotate(User.shieldRadian)
   ctx.drawImage(shieldFrame,-User.shieldSize.width/2,-User.shieldSize.height/2,User.shieldSize.width,User.shieldSize.height);
   User.shieldRadian += 0.05
 }
 }
 ctx.restore()
 
 roundDisplay.textContent = Game.currentRound !== Game.rounds.length+1 ? `Round: ${Game.currentRound}` : 'Boss Round';
 speedDisplay.textContent = `Speed: ${speed} M/S`;
 distDisplay.textContent = `Distance: ${Game.distance} Meters`;
 
 // to change round
 if(Game.distance >= roundDistance){
   if(Game.currentRound !== Game.rounds.length+1){
   Game.currentRound++
   changeRound(Game.currentRound);
   }else{
     // boss logic start
     
     Game.currentRound = Game.rounds.length+1
     if(!GameBoss){
     Game.extraReleaseSpeed = 3 // for gameboss
     Game.lastExtraReleaseTime = Game.distance;
     extraReleaseInterval = 200 // for gameboss
     roundExtras = "♾️" // infinite extras
     
     Sections.open(messageSection)
     Game.bgSoundVolume = .2
     Game.holded = true
     
     const messages = [
       `Congratulations On Passing All The Rounds In This Game 🎉🎉,
       Am Sadiq And Am The Developer Of This Game 😎😎, Tap To Continue...`,
       `You Should Defeat The Last Boss In This Game, To Get Your Award When You Are First Defeater 😊😊`,
       `Please Be Curiuos And Smart, He May Kill You 🙄, Good Luck, Tap To Proceed...`
       ]
       
     let isTyping = false;
     let typingSpeed = random(20,30)
     
     const type = (text,target) => {
       if(!isTyping){
       let typingIndex = 0;
       target.textContent = '';
       isTyping = true
       const typer = setInterval(e => {
         if(target.textContent.length !== text.length){
           target.textContent += text.charAt(typingIndex);
           typingIndex++
         }else{
           clearInterval(typer);
           isTyping = false;
           typingStick.style.animationName = 'blink'
         }
       },typingSpeed)
       }
     }
     
     let state;
     if(gameData.isNewUser){
       state = 0// 0 state
     }else{
       state = 3
     }
     
     
     const proceed = e => {
       typingStick.style.animationName = 'null'
       if(state < messages.length && !isTyping){
         type(messages[state],textDisplay)
         state++
       }else if(state >= messages.length){
         removeEventListener('click',proceed);
         messageSection.style.display = 'none';
         Game.holded = false;
         User.blinkDuration = 2 // for gameBoss
         Game.unfreeze();
         clearInterval(rock_producer);
         bulletRate = .2 // for gameboss
         User.bulletDp = 50 // for gameboss
         Game.rocks = [];
         Game.bgSoundVolume = .5;
         Sections.open(gameField)
         if(state == messages.length){
           state++
           proceed();
         }
       }
     }
     
     addEventListener('click',proceed)
     document.body.click();
     
     GameBoss = {
       hidden: false,
       idle: true,
       idleDuration: 2,
       velocity: {
         x: 5,
         y: 8
       },
       maxHp: 5000,
       currentHp: 5000,
       dp: 150,
       size: {
         width: 200,
         height: 150
       },
       normalPosition: {},
       bullet: {
         bullets: [],
         producing: false,
         producer: null,
         frame: bossBulletFrame,
         rate: .4,
         speed: 8,
         size: {
           width: 12,
           height: 30,
         },
         dp: 50,
         type: 'normal', // following or normal
         produce: function(type){
           if(!this.producing){
           this.type = type
           this.producing = true;
           this.type == 'normal' ? GameBoss.velocity.x = GameBoss.speed : GameBoss.velocity.x = GameBoss.speed/2
           
           const create = e => {
             const {x,y} = GameBoss.position;
             const {width,height} = GameBoss.size;
             let [lPosition,rPosition] = []
           
           
           lPosition = {
             x: x + 50,
             y: y + (height/2)
           }
 
           rPosition = {
             x: (x + width) - 60,
             y: y + (height/2)
           }
           
           lPosition.size = this.size;
           rPosition.size = this.size
           
           lPosition.position = lPosition;
           rPosition.position = rPosition
           
           // to remove padding
           const virtualUser = {};
           virtualUser.position = {
             x: User.position.x + 30,
             y: User.position.y + User.size.height
           }
           
           let rRadian = getAngle(rPosition,virtualUser);
           let lRadian = getAngle(lPosition,virtualUser);
           let lVelocity = getVelocity(lPosition,virtualUser,this.speed)
           let rVelocity = getVelocity(rPosition,virtualUser,this.speed);
           
           if(this.type == 'normal'){
             lVelocity = {x: 0,y: GameBoss.speed};
             rVelocity = {x: 0,y: GameBoss.speed};
             lRadian = 0;
             rRadian = 0
           }
          
            this.bullets.push(new Bullet(lPosition,this.dp,this.frame,lRadian,lVelocity,this.size,"Boss"));
            this.bullets.push(new Bullet(rPosition,this.dp,this.frame,rRadian,rVelocity,this.size,"Boss"));
     
           }
           
           create()
           
           this.producer = setInterval(e => {
             create()
          },this.rate * 1000)
         }
         
         }
       },
       bomb: {
         bombs: [],
         producing: false,
         rate: 2,
         maxVelocity: 8,
         frame: bombFrame,
         duration: 20 * gameSeconds,
         dp: 70,
         amount: 2,
         size: {
           width: 40,
           height: 40
         },
         producer: '',
         hp: 30,
         produce: function(){
           if(!this.producing){
             this.producing = true;
             
             const create = e => {
               let i = 0;
               if(GameBoss.bomb.bombs.length < 1){
               while (i !== this.amount) {
                 let position = {
                   x: random(0, cw - this.size.width),
                   y: random(0, ch - this.size.height)
                 }
                 
                 
                 const velocity = {
                   x: random(this.maxVelocity - 2, this.maxVelocity),
                   y: random(this.maxVelocity - 2, this.maxVelocity)
                 }
                 
                 let bomb = new Bomb(this.frame, position, velocity, this.duration, this.dp, this.size,this.hp);
                 while(has_collided(bomb,User)){
                   position = {
                     x: random(0, cw - this.size.width),
                     y: random(0, ch - this.size.height)
                   }
                   bomb = new Bomb(this.frame, position, velocity, this.duration, this.dp, this.size,this.hp)
                 }
         
                 this.bombs.push(bomb)
                 i++
               }
             }
             }
             
             
             create()
             
             this.producer = setInterval(e => {
              create()
             },this.rate * 1000);
             
           }
         }
       },
       entered: false,
       entryPoint: '',
       defeatTypes: [
       {
         id: 'bombs',
         duration: 20 * gameSeconds,
       },
       {
         id: 'bullet',
         duration: 20 * gameSeconds
       },
       {
         id: 'move',
         duration: 10 * gameSeconds
       },
       {
         id: 'moveWithBullet',
         duration: 20 * gameSeconds
       }
                    ],
       waitDuration: 3 * gameSeconds,
       capturedPosition: null,
       capturedVelocity: null,
       scale: 1,
       vibration: {
         started: false,
         duration: 3
       },
       defeating: {id: 'idle',duration: 5 * gameSeconds},
       defeat: function(){
         let newDefeating = {...this.defeatTypes[random(0,this.defeatTypes.length-1)]};
         while(newDefeating.id == this.defeating.id){
           newDefeating = {...this.defeatTypes[random(0,this.defeatTypes.length-1)]};
         }
         this.defeating = newDefeating;
       },
       showNavs: false,
       dieing: false,
       die: function(){
         if(!this.dieing){
           this.dieing = true;
           this.idle = true;
           shake = true
           !this.vibration.started ? navigator.vibrate(this.vibration.duration * 1000) : null;
           this.vibration.started = true;
           setTimeout(e => {
             showExploded(this);
             play(dieExplosionSound);
             this.alpha = 0;
             this.hidden = true; 
             setTimeout(e => {
              shake = false;
              Game.freezed = true;
              let mover = setInterval(e => {
                hideNav();
                 if(User.position.y > -(User.size.height * 2)){
                   User.position.y -= 2 // move user up on victory
                 }else{
                   clearInterval(mover);
                   Game.end()
                 }
               })
             },1000)
           },this.vibration.duration * 1000)
           this.vibration.started = true;
         }
         
       },
       alpha: 1,
       speed: 8
     }
     
     
    
     // entry point
     precisionX = GameBoss.speed;
     precisionY = GameBoss.speed
     
    GameBoss.defeating.duration = GameBoss.idleDuration * gameSeconds//GameBoss.idleDuration * gameSeconds
     
    GameBoss.normalPosition.position = {
      x: Math.trunc(cw / 2 - (GameBoss.size.width / 2)),
      y: Math.trunc(GameBoss.size.height / 2)
    }
     
    
    const {x,y} = User.position;
     
     if(x <= 100 && y > 200 && y < ch - 200){
       GameBoss.position = {
         x: -GameBoss.size.width-100,
         y: y - GameBoss.size.height/2
       }
       GameBoss.entryPoint = 'left'
     }else if(x > 100 && y > 200 && y < ch - 200){
       GameBoss.position = {
         x: cw + GameBoss.size.width+100,
         y: y - GameBoss.size.height/2
       }
       GameBoss.entryPoint = 'right'
     }else if(y <= 170){
       GameBoss.position = {
         x: x - GameBoss.size.width/2,
         y: -GameBoss.size.height - 100 
       }
       GameBoss.entryPoint = 'top'
     }else{
       GameBoss.position = {
         x: x - GameBoss.size.width/2,
         y: ch + GameBoss.size.height + 100
       }
       GameBoss.entryPoint = 'bottom'
     }
     
     GameBoss.capturedPosition = {x,y};
     
   
 }
 
 
     
 if(!GameBoss.entered){
   const {x,y} = GameBoss.position;
   const xPoint = cw/2 - (GameBoss.size.width/2);
   const yPoint = GameBoss.size.height/2 
   
   if(GameBoss.entryPoint == 'left' && x <= xPoint){
     GameBoss.position.x += GameBoss.speed
   }else if(GameBoss.entryPoint == 'right' && x >= xPoint){
     GameBoss.position.x -= GameBoss.speed
   }else if(GameBoss.entryPoint == 'top' && y <= yPoint){
     GameBoss.position.y += GameBoss.speed
   }else if(GameBoss.entryPoint == 'bottom' && y >= yPoint){
     GameBoss.position.y -= GameBoss.speed
   }else{
     const velocity = getVelocity(GameBoss,GameBoss.normalPosition,GameBoss.speed)
     const {x,y} = GameBoss.position;
     const precisionX = Math.abs(velocity.x);
     const precisionY = Math.abs(velocity.y)
     
     const {xPoint,yPoint} = {xPoint: GameBoss.normalPosition.position.x,yPoint: GameBoss.normalPosition.position.y};
    if(Math.abs(x - xPoint) > precisionX || Math.abs(y - yPoint) > precisionY){
      GameBoss.position.x += velocity.x;
      GameBoss.position.y += velocity.y
    }else{
       hideNav()
       GameBoss.entered = true
       GameBoss.showNavs = true
       bulletSpeed = 5;
       User.bulletDp = 7 
       updateTimers(.1,1)
     }
     
   }
}
  
   Game.bullets.forEach(bullet => {
     if(has_collided(GameBoss,bullet) && !GameBoss.hidden && GameBoss.entered){
       GameBoss.currentHp -= bullet.dp
       Game.bullets = Game.bullets.remove(bullet);
       }
   })
   

   
   // stop defeat when User die 
   if(User.dieing){
     GameBoss.idle = true;
   }
   
   
   // Boss defeating
   
  if(GameBoss.entered){
  
  const {id,duration} = GameBoss.defeating;
  const {x,y} = GameBoss.position;
  const {width,height} = GameBoss.size;
  
  
   if(!GameBoss.idle && !GameBoss.dieing){
     // not idle
     if(id == 'bullet'){
       GameBoss.bullet.produce('following');
      if(x <= Math.round(-width/2) || x + width >= Math.round(cw + width/2)){
        GameBoss.velocity.x = -GameBoss.velocity.x
      }
      
      GameBoss.position.x += GameBoss.velocity.x// for speed

       
     }else if(id == 'bombs'){
       if(GameBoss.alpha > 0){
         GameBoss.alpha -= 0.01
       }else{
         GameBoss.alpha = 0
         GameBoss.hidden = true
       }
       GameBoss.bomb.produce();
       GameBoss.bomb.bombs.forEach(bomb => {
         bomb.draw()
       })
     }else if(id == 'move'){
       if(!GameBoss.velocity.x || !GameBoss.velocity.y){
         GameBoss.velocity = {x: 5,y: 12}
       }
       GameBoss.capturedVelocity = false
       if(y > ch){
         GameBoss.position.y = -height
       }else{
         GameBoss.position.y += GameBoss.velocity.y
       }
       if(x + width >= cw || x <= 0){
         GameBoss.velocity.x = -GameBoss.velocity.x
       }
       GameBoss.position.x += GameBoss.velocity.x
    }else if(id == 'moveWithBullet'){
      GameBoss.bullet.produce('normal')
      if(x <= Math.round(-width/2) || x + width >= Math.round(cw + width/2)){
        GameBoss.velocity.x = -GameBoss.velocity.x
      }
      
      if(Math.abs(y) > User.size.height/2){
        GameBoss.position.y -= Game.speed
      }
      
      GameBoss.position.x += GameBoss.velocity.x// for speed
    }
      
  
  }else{
    // idle
    clearInterval(GameBoss.bullet.producer);
    clearInterval(GameBoss.bomb.producer);
    GameBoss.bomb.producing = false;
    GameBoss.bullet.producing = false;
    GameBoss.bullet.bullets = [];
    GameBoss.bomb.bullets = [];
    GameBoss.velocity = { x: 0, y: 0 }
    GameBoss.bullet.producing = false;
    GameBoss.bomb.producing = false
    
    if(!GameBoss.dieing){
    if(GameBoss.alpha < 1){
      GameBoss.alpha += 0.01
    }else{
      GameBoss.alpha = 1
      GameBoss.hidden = false
    }
    }
    
    const nx = GameBoss.normalPosition.position.x;
    const ny = GameBoss.normalPosition.position.y;
    
    if(Math.abs(x - nx) > precisionX || Math.abs(y - ny) > precisionY){
      velocity = getVelocity(GameBoss,GameBoss.normalPosition,GameBoss.speed);
      GameBoss.position.x += velocity.x;
      GameBoss.position.y += velocity.y
    }
    
  }
  
  // change defeat when user dont die
  if(!User.dieing && !GameBoss.dieing){
  if(duration){
    GameBoss.defeating.duration--
  }else if(GameBoss.idle){
    GameBoss.idle = false
    GameBoss.defeat()
  }else if(!GameBoss.idle){
    GameBoss.idle = true;
    GameBoss.defeating.duration = GameBoss.idleDuration * gameSeconds
  }
  }
  }
 
 
 // drawing boss bullet 
 
 
 GameBoss.bullet.bullets.forEach(bullet => {
   const { x, y } = bullet.position;
   const { width, height } = bullet.size;
   bullet.draw()
   bullet.position.x += bullet.velocity.x;
   bullet.position.y += bullet.velocity.y
 
   const collided = has_collided(User, bullet);
 
   if (collided || y + height >= ch || x <= 0 || x >= cw) {
     GameBoss.bullet.bullets = GameBoss.bullet.bullets.remove(bullet);
    if(collided && !User.isSafed && !User.dieing){
     User.currentHp -= bullet.dp;
     collided ? play(planeHitSound) : null
    }
    
   }
 
 })
   
   
   
   if(GameBoss.entered && GameBoss.defeat.id){
     if(GameBoss.defeat.id == 'bullet'){
       GameBoss.bullets.forEach(bullet => {
         bullet.draw()
       })
     }
   }
  
  ctx.save()
  // showing boss and displays
  ctx.globalAlpha = GameBoss.alpha;
  ctx.translate(tx,ty)
  ctx.drawImage(bossFrame,GameBoss.position.x,GameBoss.position.y,GameBoss.size.width,GameBoss.size.height);
  ctx.restore()
  
  // showing boss nabs
  if(GameBoss.showNavs){
     
   // for boss life
   if(GameBoss.currentHp > 0){
    ctx.fillStyle = 'red';
    ctx.fillRect(35,40,(GameBoss.currentHp / GameBoss.maxHp) * 250,5);
    ctx.lineWidth = '2'
    ctx.strokeRect(35,40,250,5);
   }else{
     ctx.fillStyle = 'red';
     ctx.fillRect(35, 40, 0, 5);
     ctx.lineWidth = '2'
     ctx.strokeRect(35, 40, 250, 5);
     Game.defeated = false;
     GameBoss.die()
   }
   
  ctx.font = '1rem SadiqCyber'
  
  // for user life 
  if(User.currentHp > 0){
    ctx.fillStyle = 'white';
    ctx.fillText('Life',10,25,30);
    ctx.fillStyle = '#83FE7B';
    ctx.fillRect(50,15,(User.currentHp / User.maxHp) * 250,10);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = '2'
    ctx.strokeRect(50,15,250,10);
  }else{
    ctx.fillStyle = 'white';
    ctx.fillText('Life', 10, 25, 30);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = '2'
    ctx.strokeRect(50, 15, 250, 10);
    Game.defeated = true;
    Game.defeater = 'boss'
    User.die()
  }
  
  }
   
   // user and boss collision life reduction
   if(has_collided(User,GameBoss) && !User.pending && User.currentHp && !GameBoss.hidden){
     if(!User.isSafed){
       User.currentHp -= GameBoss.dp
       User.pending = true;
       play(planeHitSound)
       setTimeout(e => {
         User.pending = false
       },User.blinkDuration * 1000)
     }
   }
   

// boss logic end
}
  }
 
  
 
 if(roundExtras || roundExtras == "♾️"){
   if(Game.distance >= Game.lastExtraReleaseTime + extraReleaseInterval){
     Game.lastExtraReleaseTime = Game.distance;
     let extra = {...Game.extras[random(0,Game.extras.length-1)]}; // copy not use
     while(extra.id == User.extra.id){
       let extra = {...Game.extras[random(0,Game.extras.length-1)]}; // copy not use
     }
     extra.size = {
       width: Game.extraSize,
       height: Game.extraSize
     }
     
     extra.position = {
       x: random(0,cw - extra.size.width),
       y: -extra.size.height - 50 // extra release height
     }
     
     if(extra.id == 'saver'){
       extra.scale = 1;
       extra.isLarge = true;
       extra.minScale = .5; // minimum extra size
       extra.maxScale = 1; // maximum extra size
     }else if(extra.id == 'blast'){
       extra.radian = 0;
     }else{
       extra.velocityX = 2
     }
     
     
     Game.toRelease.push(extra);
   }
 }
 
Game.toRelease.forEach(extra => {
  ctx.save();
  extra.position.y += Game.extraReleaseSpeed;

// adding animation to extra
  if(extra.id == 'saver'){
     if(extra.isLarge){
       extra.scale -= 0.01
       extra.isLarge = extra.scale <= extra.minScale ? false : true
     }else{
       extra.scale += 0.01
       extra.isLarge = extra.scale >= extra.maxScale ? true : false
     }
     
    ctx.translate(extra.position.x + extra.size.width/2,extra.position.y + extra.size.height/2)
    ctx.scale(extra.scale,extra.scale);
    ctx.drawImage(extra.frame,-extra.size.width/2,-extra.size.height/2,extra.size.width,extra.size.height);
   }else if(extra.id == 'blast'){
     extra.radian >= 4 * Math.PI ? extra.radian = 0 : extra.radian += 0.02
     ctx.translate(extra.position.x,extra.position.y);
     ctx.rotate(extra.radian)
     ctx.drawImage(extra.frame,-extra.size.width/2,-extra.size.height/2,extra.size.width,extra.size.height);
   }else{
     if(extra.position.x + extra.size.width >= cw || extra.position.x <= 0){
       extra.velocityX = -extra.velocityX
     }
     
    
     ctx.drawImage(extra.frame,extra.position.x,extra.position.y,extra.size.width,extra.size.height);
     extra.position.x += extra.velocityX
   }
   
   let collided = has_collided(User,extra)
   if(extra.position.y >= ch + extra.size.height || collided){
     Game.toRelease = Game.toRelease.remove(extra);
     if(collided){
       if(!User.dieing){
       User.extra.push(extra)
       eval(extra.action);
       extra.initialised = true
       }
     }
   }
   
   ctx.restore()
})
 
 // handling extras 
 
 User.extra = User.extra.filter(extra => {
  if(extra.initialised){
   if(extra.duration > 0){
     extra.duration--
     return true
   }else{
     if(extra.id == 'star'){
         if(Game.currentRound !== Game.rounds.length+1){
         ({speed, rockSize, rockHp, bulletDp, bulletRate, rockRate, roundDistance, roundExtras,bulletSpeed} = Game.rounds[Game.currentRound - 1]);
         User.bulletDp = bulletDp
         }else{
           User.bulletDp = 10;
           bulletRate = .2; // for bos
           bulletSpeed = 7
         }
         User.frame = planeFrame
      }else if(extra.id == 'saver'){
        User.isSafed = false
      };
      
      return false
   }
   
  }
 });
 
}
 
 // to show explosions
 updateExplosions()
 
 // to avoid rocks from merging
 const space = 10;
 Game.rocks.forEach(rock => {
   i = 0;
   while(i < Game.rocks.length){
     const rck = Game.rocks[i];
     if(rock !== rck){
       if(rock.position.x + rock.size.width + space >= rck.position.x && 
       rock.position.x < (rck.position.x + rck.size.width) - space 
       && rock.position.y + rock.size.height + space >= rck.position.y &&  
       rock.position.y <= (rck.position.y + rck.size.height) - space){
         Game.rocks = Game.rocks.remove(rock)
       }
     }
     i++
   }
 })

updateShakes()
bgSound.volume = Game.bgSoundVolume;
shootSound.volume = Game.shootSoundVolume
 
}


changeRound(Game.currentRound,gameLoop);

const threshold = 3
const changeUserPosition = e => {
  if(!Game.freezed && !Game.holded){
  const {clientX,clientY} = e.touches[0];
  // updating user position only when defference is greater than or equal to threshold
  // to allow ram and cpu to rest increasing effeciency
  if(Math.abs(clientX - User.position.x) >= threshold && Math.abs(clientY - User.position.y) >= threshold){
  if(clientX > 0 + User.size.width/2 && clientX < cw + User.size.width/2 
  && clientY > 0 + User.size.height/2 && clientY < ch + User.size.height/2){
  User.position.x = Math.round(clientX - User.size.width/2);
  User.position.y = Math.round(clientY - User.size.height/2);
  }
  }
}
}


 window.addEventListener(innerWidth >= 600 ? "touchmove" : "mousemove", e => {
   if(innerWidth >= 600){
     changeUserPosition(e)
   }else{
     changeUserPosition({
       touches: [{
         clientX: e.clientX,
         clientY: e.clientY
       }]
     })
   }
 })

}






// game defination

let Game = {
  author: 'Sadiq Abubakar',
  name: 'Space Shooter Game',
  authorContact: '+2348145742404',
  animationFrameId: 1,
  start: function(){
    Game.holded = false;
    Game.unfreeze()
   
   User = {
    size: {
      width: 70,
      height: 70
    },
    shieldRadian: 0,
    life: 3,
    blinking: false,
    visible: true,
    blinkRate: .3, // in seconds,
    blinkDuration: 8, // in seconds
    pending: false,
    timeCapt: 0,
    bulletSize: {
      width: 15,
      height: 40
    },
    extra: [],
    frame: planeFrame,
    isSafed: false,
    currentHp: 2000,
    maxHp: 2000,
    bulletDp: 10,
    dieing: false,
    die: function (){
      if(!this.dieing){
        this.dieing = true;
        play(dieExplosionSound);
        showExploded(this);
        setTimeout(Game.end,3000);
      }
    }
  }
  
  
  User.position = {
    x: cw/2 - (User.size.width/2),
    y: ch - User.size.height - 20// 20 for user margin in bottom
  }
  
  User.shieldSize = {
    width: User.size.width + 20, // 20 is shield constant
    height: User.size.height + 20
  }
   
   Game.extras = [
  {
    frame: saferPlaneFrame,
    duration: 15 * gameSeconds,
    id: 'saver',
    action: `User.isSafed = true`,
    initialised: false
  },
  {
    frame: blastFrame,
    duration: 1 * gameSeconds,
    id: 'blast',
    action: `
    if(Game.currentRound !== Game.rounds.length+1){
     Game.rocks = Game.rocks.filter(rock => {
     showExploded(rock); 
     return (rock.position.y < 0 - rock.size.height - 50)
     })
    }else{
      if(!GameBoss.hidden){
      let explodes = [];
      let maxExplode = 8
      let explodeSize = {width: 50,height: 50}
      
      while(explodes.length !== maxExplode){
        explodes.push({
           position: {
             x: random(GameBoss.position.x,GameBoss.position.x + GameBoss.size.width),
             y: random(GameBoss.position.y,GameBoss.position.y + GameBoss.size.height)
           },
           size: explodeSize
        })
      }
      
      explodes.forEach(explode => showExploded(explode))
      GameBoss.currentHp -= GameBoss.maxHp / 15 // for gameboss
      }else{
      GameBoss.bomb.bombs.forEach(bomb => {
        showExploded(bomb)
      })
      
      GameBoss.bomb.bombs = [];
      GameBoss.bullet.bullets = []
      }
    }
    
    play(explosionSound)`,
     initialised: false
  },
  {
    frame: powerFrame,
    duration: 15 * gameSeconds,
    id: 'star',
    action: 'User.frame = poweredPlaneFrame; bulletSpeed = 10; bulletRate = .1; User.bulletDp = Game.currentRound == Game.rounds.length+1 ? 20 : 10',
    initialised: false
  }
 ]
   startGame();
  },
  speed: 2,
  rocks: [],
  bullets: [],
  rockSize: 100,
  rockHp: 10,
  bulletDp: 3,
  bullet_production_interval: .3,
  rock_production_interval: 1,
  bullet_producer: 1,
  // speed rockSize rockHp bulletDp bulletRate rockRate ,Proceed Code
rounds: [
  {
    speed: 2,
    rockSize: 60, 
    rockHp: 5,
    bulletDp: 2.5,
    bulletRate: 0.35,
    rockRate: 0.5,
    roundDistance: 200, // 100
    roundExtras: 3,
    bulletSpeed: 3
  },
  {
    speed: 3,
    rockSize: 80,
    rockHp: 15,
    bulletDp: 3.5,
    bulletRate: 0.3,
    rockRate: 0.45,
    roundDistance: 500, // 350
    roundExtras: 5,
    bulletSpeed: 4
  },
  {
    speed: 4,
    rockSize: 100,
    rockHp: 20,
    bulletDp: 4.5,
    bulletRate: 0.25,
    rockRate: 0.6,
    roundDistance: 1000,
    roundExtras: 7,
    bulletSpeed: 5
  },
  {
    speed: 5,
    rockSize: 90,
    rockHp: 25,
    bulletDp: 5.5,
    bulletRate: 0.2,
    rockRate: 0.35, 
    roundDistance: 1500,
    roundExtras: 10,
    bulletSpeed: 6
  },
  {
    speed: 6,
    rockSize: 100,
    rockHp: 35,
    bulletDp: 8,
    bulletRate: 0.15,
    rockRate: 0.32,
    roundDistance: 0, //2500
    roundExtras: 0,
    bulletSpeed: 7
  }
]
,
  currentRound: 1,//1
  freezed: false,
  freeze: function(){
    Game.bullets = [];
    Game.rocks = []
    clearInterval(rock_producer);
    clearInterval(bullet_producer);
    Object.freeze(User);
    Object.freeze(this);
    Game.freezed = true;
  },
  unfreeze: function(){
    this.freezed = false
    User = {...User};
    Game = {...Game};
  },
  distance: 0,
  roundChangeDelay: 2,
  extraSize: 50,
  toRelease: [],
  extraReleaseSpeed: 1.5,
  last_rock_rate: '',
  last_bullet_rate: '',
  holded: false,
  blastDp: 30,
  lastExtraReleaseTime: 0,
  defeated: false,
  defeater: null,
  end: function(){
    Game.ended = true;
    Game.holded = true;
    Game.freezed = true;
    if(Game.defeated){
    endText.textContent = `You Are Defeated By ${Game.defeater}`;
    endImage.src = Game.defeater == 'asteroid' ? './frames/asteroidDefeatFrame.png' : './frames/bossFrame.png'
    Sections.open(endSection);
    }else{
      if(gameData.isNewUser){
        Sections.open(rewardSection)
      }else{
      endText.textContent = 'You Win The Game,Click To Replay';
      endImage.src = './frames/successFrame.png';
      Sections.open(endSection)
      gameData.isNewUser = false;
      setData(Game.name,gameData)
      }
     }
  },
  ended: false,
  defaultData: {
    isNewUser: true
  },
  bgSoundVolume: .5,
  explosionSoundVolume: .2,
  shootSoundVolume: .5
}


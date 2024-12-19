
let toClose = false;
const closeGame = e => {
  while(true){
    toClose = true
    history.back()
  }
}

const assets = [
  { type: 'image', src: './frames/bgFrame.png', variable: 'bgFrame' },
  { type: 'image', src: './frames/bulletFrame.png', variable: 'bulletFrame' },
  { type: 'image', src: './frames/planeFrame.png', variable: 'planeFrame' },
  { type: 'image', src: './frames/rockFrame1.png', variable: 'rockFrame' },
  { type: 'image', src: './frames/rockFrame2.png', variable: 'rockFrame2'},
  { type: 'image', src: './frames/rockFrame3.png', variable: 'rockFrame3'},
  { type: 'image', src: './frames/rockFrame4.png', variable: 'rockFrame4'},
  { type: 'image', src: './frames/rockFrame5.png', variable: 'rockFrame5'},
  { type: 'image', src: './frames/saferPlaneFrame.png', variable: 'saferPlaneFrame' },
  { type: 'image', src: './frames/blastFrame.png', variable: 'blastFrame' },
  { type: 'image', src: './frames/powerFrame.png', variable: 'powerFrame' },
  { type: 'image', src: './frames/poweredPlaneFrame.png', variable: 'poweredPlaneFrame' },
  { type: 'image', src: './frames/bossFrame.png', variable: 'bossFrame' },
  { type: 'audio', src: './sounds/shootSound.mp3', variable: 'shootSound' },
  { type: 'audio', src: './sounds/explosionSound.mp3', variable: 'explosionSound' },
  { type: 'audio', src: './sounds/bgSound.mp3', variable: 'bgSound' },
  { type: 'image', src: './frames/bossBulletFrame.png', variable: 'bossBulletFrame'},
  { type: 'image', src: './frames/bombFrame.png', variable: 'bombFrame'},
  { type: 'audio', src: './sounds/hitSound.mp3', variable: 'hitSound'},
  { type: 'audio', src: './sounds/planeHitSound.mp3', variable: 'planeHitSound'},
  { type: 'image', src: './frames/shieldFrame.png', variable: 'shieldFrame'},
  { type: 'image', src: './frames/explosionSpriteFrame.png', variable: 'explosionSpriteFrame'},
  { type: 'audio', src: './sounds/dieExplosionSound.mp3', variable: 'dieExplosionSound'},
 ];
 


const url = location.href;
const $ = ele => ele.includes('*') ? 
document.querySelectorAll(ele.replace('*',''))
: document.querySelector(ele);

const getData = key => localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : false
const setData = (key,value) => localStorage.setItem(key,JSON.stringify(value))
const delData = key => localStorage.removeItem(key)

const gameData = getData(Game.name);
!gameData ? setData(Game.name,Game.defaultData) : null;

Array.prototype.remove = function(ele){
  return this.filter(el => el !== ele ? el : null)
}

const sections = $('*.section');
const [gameHome,gameLoader,gameField,messageSection,endSection,rewardSection] = sections;
const [nav,state,gameCanvas] = [...gameField.children];
const [lifeDisplay,roundDisplay,speedDisplay] = [...nav.children];
const distDisplay = $('.distDisplay')

const blurer = $('.blurer');
const confirmBox = $('.confirmBar');
const [confirmMsg,confirmActionBtns] = confirmBox.querySelectorAll('*')
const [noBtn,yesBtn] = confirmActionBtns.querySelectorAll('*');
const [endText,endImage,endActions,endDev] = [...endSection.children]
const [replayGame,quitGame] = [...endActions.children]

const rewardForm = $('form');
const [phoneInput,nameInput] = rewardForm.querySelectorAll('input');
const experienceInput = rewardForm.querySelector('textarea')
const formSendBtn = rewardForm.querySelector('.submit')

const [icon,name,actions,dev] = [...gameHome.children];
const [playBtn,closeBtn] = [...actions.children];

const hideNav = e => {
  nav.style.animationName = 'hide';
}

const showNav = e => {
  nav.style.animationName = "show"
}


const confirmation = (message,callback) => {
  history.pushState('confirmation',null,url);
  lastSection = 'confirmation'
	confirmBox.style.display = 'flex';
	blurer.style.display = 'block';
	confirmMsg.textContent = message;
	yesBtn.onclick = e => callback(true)
	noBtn.onclick = e => callback(false);

	[...confirmActionBtns.children].forEach(btn => {
		btn.addEventListener('click',e => {
			confirmBox.style.display = 'none';
			blurer.style.display = 'none';
		})
	})
}


const [devImage,msgDisplay,devM] = [...messageSection.children];
const [textDisplay,typingStick] = [...msgDisplay.children];

const cw = gameCanvas.width = innerWidth;
const ch = gameCanvas.height = innerHeight;
const ctx = gameCanvas.getContext('2d');

const random = (min,max) => {
  max++
  return Math.floor(Math.random() * (max - min) + min)
};


const has_collided = (obj1,obj2) => {
  return (
     obj1.position.x + obj1.size.width >= obj2.position.x &&
     obj1.position.x <= obj2.position.x + obj2.size.width &&
     obj1.position.y + obj1.size.height >= obj2.position.y &&
     obj1.position.y <= obj2.position.y + obj2.size.height
    )
}


const resetGame = e => {
        // resetting Game
        cancelAnimationFrame(Game.animationFrameId)
        if(window['bgSound']) {
          window['bgSound'].volume = 1;
          window['bgSound'].currentTime = 0;
          window['bgSound'].pause();
        }
        
        ctx.clearRect(0, 0, cw, ch)
        speed = Game.speed;
        Game.currentRound = 1
        Game.distance = 0;
        Game.ended = true;
        previousTime = 0;
        clearInterval(bullet_producer);
        clearInterval(rock_producer);
        GameBoss = false;
        Game.toRelease = [];
        
}


const loadGame = e => {
  const [icon,name,loadText,loader] = [...gameLoader.children];
  name.textContent = Game.name;

resetGame();

let loaded = 0;


const loadItems = assets.length;

assets.forEach(asset => {
  const { variable, type, src } = asset;
  window[variable] = type === 'image' ? new Image() : new Audio(src);
  type === 'image' ? window[variable].src = src : null;
  const loader = new Promise((res, rej) => {
    let checker;
    let hasLoaded;
    const check = e => {
      if (hasLoaded) {
        clearInterval(checker);
        res();
      }
    };
    checker = setInterval(check);
    try {
      type === 'image'
        ? (window[variable].onload = e => (hasLoaded = true))
        : (window[variable].onloadeddata = e => (hasLoaded = true));
    } catch (err) {
      type == "image" ? window[variable].src = src : window[variable].load()
    }
  })
    .then(e => loaded++)
    .catch(er => alert(er));
  
});

  Sections.open(gameLoader)
      
  let loadedPercent = 0;
  
  const loadAnimator = setInterval(e => {
    const loadLength = Math.floor((loaded / loadItems) * 100);
    
    if(loadLength !== 100 || loadedPercent !== 100){
     loadedPercent !== loadLength ? loadedPercent++ : null
    }else{
      clearInterval(loadAnimator);
      Game.start()
    }
    
    loadText.textContent = `Loading Game ${loadedPercent}%`;
    loader.style.backgroundImage = `linear-gradient(to right,white ${loadedPercent}%,transparent ${100-loadedPercent}%)`
  },20)
  
}

const init = e => {
  resetGame();
  
  dev.textContent = `Developed By ${Game.author} @Copyright`
  endDev.textContent = `Developed By ${Game.author} @Copyright`
  devM.textContent = `Developed By ${Game.author} @Copyright`

  name.textContent = Game.name;
  
  Sections.open(gameHome)
  
  playBtn.onclick = loadGame
}


init() // initialise game

closeBtn.onclick = e => closeGame()
replayGame.onclick = e => loadGame();
quitGame.onclick = e => init()

navigator.serviceWorker.register("/gameSw.js")

let gameAssets = [];
const assets = [
  { type: 'image', src: './frames/bgFrame.png', variable: 'bgFrame' },
  { type: 'image', src: './frames/bulletFrame.png', variable: 'bulletFrame' },
  { type: 'image', src: './frames/planeFrame.png', variable: 'planeFrame' },
  { type: 'image', src: './frames/rockFrame1.png', variable: 'rockFrame' },
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
  { type: 'image', src: './frames/devFrame.png'},
  { type: 'image', src: './frames/explosionSpriteFrame.png', variable: 'explosionSpriteFrame'},
  { type: 'audio', src: './sounds/dieExplosionSound.mp3', variable: 'dieExplosionSound'},
  { type: "js", src: "gameMain.js"},
  { type: "html", src: "game.html"},
  { type: "css", src: "game.css"},
  { type: "js", src: "gameLoader.js"},
  { type: "js", src: "rewardController.js"},
  { type: "js", src: "sectionController.js"},
  { type: "font", src: "SadiqCyberFont.ttf"},
  { type: "json", src: "manifest.json"},
  { type: "sw", src: "gameSw.js"},
];

assets.forEach(asset => gameAssets.push(asset.src))
const cacheName = "Space Shooter Game";

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(gameAssets);
    })
  );
})


self.addEventListener('fetch',e => {
  e.respondWith(
     caches.match(e.request).then(response => {
       return response ? response : fetch(e.request)
     })
    )
})
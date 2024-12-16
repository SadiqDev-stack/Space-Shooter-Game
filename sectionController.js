

const getId = section => {
  let id;
  sections.forEach((sect,ind) => {
    sect == section ? id = ind : null
  })
  return id
}

let lastId = 0;

const Sections = {
  histories: [],
  open: function(section){
    toClose = false
    const id = getId(section);
    history.pushState(id,null,url);
    this.histories.push(id)
    sections.forEach((sect,ind) => {
      sect.style.display = ind == id ? 'flex' : 'none'
    })
  },
  back: function(){
   if(!Game.ended && lastId !== 3){
      Game.holded = true
      confirmation("Are You Sure You Want To Quit This Game",state => {
        state ? init() : Game.holded = false
      })
    }else if(lastId == 0){
      confirmation("Are You Sure You Want To Close This Game",state => {
        if(state){
          closeGame()
        }
      })
    }else if(lastId == 5){
      confirmation("Closing This Section, You Will Loose Your Reward",state => {
        state ? init() : null
      })
    }else if(lastId == 4){
      init();
    }else{
      toClose = false
    }
    
  }
}

setInterval(e => {
  lastId = Sections.histories.at(-1);
})


addEventListener('popstate', e => {
  !toClose ? history.forward(1) : close();
  Sections.back()
})



// to hold / pause game when 
document.addEventListener("visibilitychange", e => {
  if(document.visibilityState == 'visible'){
    Game.holded = false;
    if(lastId == 2 || lastId == 4 || lastId == 6){
    bgSound.play()
    }
  }else{
    bgSound.pause();
    Game.holded = true
  }
})

addEventListener('dblclick',e => {
  if(!Game.ended && lastId !== 3){
    Game.holded = !Game.holded
  }
})

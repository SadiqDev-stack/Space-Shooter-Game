const formspreeEndpoint = "https://formspree.io/f/mjkvqbqw";

const formData = {
  Phone: "",
  Fullname: "",
  Experience: ""
};

phoneInput.addEventListener('input',e => {
  formData.Phone = phoneInput.value.trim()
})

nameInput.addEventListener('input',e => {
  formData.Fullname = nameInput.value.trim()
})

experienceInput.addEventListener('input',e => {
  formData.Experience = experienceInput.value.trim()
})

const disableBtn = e => {
  formSendBtn.textContent = "Sending Details...";
  formSendBtn.disabled = true
}

const enableBtn = e => {
  formSendBtn.textContent = "Submit"
  formSendBtn.disabled = false
}

const clearForm = e => {
  phoneInput.value = "";
  nameInput.value = "";
  experienceInput.value = "";
}

rewardForm.addEventListener('submit',e => {
  e.preventDefault();
  disableBtn()
  
  fetch(formspreeEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(formData)
  })
  .then(response => {
    if (response.ok) {
      confirmation("Your Details Are Received, And You Will Get Your Reward Soon, if You Are The First Winner",e => {
        gameData.isNewUser = false;
        setData(Game.name,gameData);
        init()
      })
    } else {
      confirmation("Error Occured Sending Details Check Your Connection, Click Yes To Continue, Click No To Go Home...",state => {
        if(!state){
          init()
        }
      })
    }
  })
  .catch(error => {
    confirmation("Error Occured Sending Details Check Your Connection, Click Yes To Continue, Click No To Go Home...", state => {
      if (!state) {
        init()
      }
    })
  })
  .finally(e => {
    enableBtn();
    clearForm()
  })
})
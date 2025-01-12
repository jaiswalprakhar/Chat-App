const toastBody = document.getElementsByClassName('toast-body')[0];
const toastLiveExample = document.getElementById('liveToast');

const showToastResult = (message) => {
    toastBody.textContent = message;
    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample);
    toastBootstrap.show();
};

window.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname === '/FRONTEND/components/Layout/login.html') {
    const token = localStorage.getItem('token');
    if(!token) {
      //console.log("User not Logged in");
      return;
    }

    axios.get('http://localhost:3000/user/verify-login', { headers: {"Authorization": token} })
      .then((response) => {
          if(response.status == 200) {
              //console.log(response.data.message);
              showToastResult(response.data.message);
              window.location.href = response.data.redirect;
          }
      })
      .catch((err) => {
          //console.log(err);
          if(err.response.status === 500) {
              showToastResult("Something went wrong at Backend");
          }
          else  {
              showToastResult(err.response.data.message);
          }
      })
  }
});

export const handleLoginSubmit = (event) => {
    event.preventDefault();
    const emailId = event.target.emailId.value;
    const password = event.target.password.value;

    const myobj = {
        emailId: emailId,
        password: password
      }
    
    event.target.reset();  
    loginUser(myobj);
};

const loginUser = (obj) => {
    axios.post("http://localhost:3000/user/login-user", obj)
    .then((response) => {
        showToastResult(response.data.message);
        localStorage.setItem('token', response.data.token);
        if(response.data.redirect)
        {
            window.location.href = response.data.redirect;
        }
    })
    .catch((err) => {
      //console.log(err);
      if(err.response.status === 500) {
        showToastResult("Something went wrong at Backend");
      }
      else  {
        if(err.response.data.err.errors) {
          showToastResult(err.response.data.err.errors[0].message);
        }
        else {
          showToastResult(err.response.data.message);
        }
      }
    })
}
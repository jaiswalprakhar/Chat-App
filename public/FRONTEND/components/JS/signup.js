const toastBody = document.getElementsByClassName('toast-body')[0];
const toastLiveExample = document.getElementById('liveToast');

const showToastResult = (message) => {
    toastBody.textContent = message;
    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample);
    toastBootstrap.show();
};

export const handleSignupSubmit = (event) => {
  event.preventDefault();
  const fullName = event.target.fullName.value;
  const emailId = event.target.emailId.value;
  const phoneNumber = event.target.phoneNumber.value;
  const password = event.target.password.value;
  const confirmPassword = event.target.confirmPassword.value;

  if (password !== confirmPassword) {
    const message = `Password & Confirm Password field not matching`;
    showToastResult(message);
  } else {
    const myobj = {
      fullName: fullName,
      emailId: emailId,
      phoneNumber: phoneNumber,
      password: password
    };
    createUser(myobj);
    event.target.reset();
  }
};

const createUser = (obj) => {
    axios.post("http://localhost:3000/user/create-user", obj)
    .then((response) => {
        showToastResult(response.data.message);
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
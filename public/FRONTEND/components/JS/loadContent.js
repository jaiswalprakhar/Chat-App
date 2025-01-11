export const loadContent = () => {
  axios.get('../Layout/header.html')
    .then(response => {
      document.querySelector('header').innerHTML = response.data;
    })
    .catch(error => {
      console.error('Error loading header:', error);
    });
}
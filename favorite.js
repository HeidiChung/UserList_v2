const BASE_URL = 'https://user-list.alphacamp.io/'
const INDEX_URL = BASE_URL + 'api/v1/users/';
// 收藏清單
const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector('#paginator')
const users = JSON.parse(localStorage.getItem('favoriteUsers'));
let filteredUsers = [];

//函式一：渲染使用者小卡
function renderUserCards(data) {
  let rawHTML = "";
  data.forEach((user) => {
    rawHTML += `
    <div class="col-sm-3 mb-2">
      <div class="card">
        <img src="${user.avatar}" class="card-img-top" alt="User-img" data-bs-toggle="modal" data-bs-target="#user-modal" data-id="${user.id}">
        <div class="card-body">
          <h5 class="card-title">${user.name} ${user.surname}</h5>
          <div class="heart position-absolute top-0 end-0 "> 
            <i class="fa-solid fa-heart btn btn-add-favorite text-danger" data-id="${user.id}"></i>
          </div>
        </div>
      </div>    
    </div>`;
  });
  dataPanel.innerHTML = rawHTML;
}

//函式二：顯示使用者資訊
function showUserModal(id) {
  const modalTitle = document.querySelector("#user-modal-title");
  const modalImage = document.querySelector("#user-modal-image");
  const modalGender = document.querySelector("#user-modal-gender");
  const modalAge = document.querySelector("#user-modal-age");
  const modalRegion = document.querySelector("#user-modal-region");
  const modalEmail = document.querySelector("#user-modal-email");
  const modalBirthday = document.querySelector("#user-modal-birthday");

  axios.get(INDEX_URL + id).then((response) => {
    console.log(response.data);
    const data = response.data;
    modalTitle.innerText = data.name +" "+ data.surname;
    modalImage.innerHTML = `<img src="${data.avatar}" alt="user-img" class="img-fluid">`;
    modalGender.innerText = "Gender: " + data.gender;
    modalAge.innerText = "Age: " + data.age;
    modalRegion.innerText = "Region: " + data.region;
    modalEmail.innerText = "Email: " + data.email;
    modalBirthday.innerText = "Birthday: " + data.birthday;
  })
  .catch((error) => console.log(error));
}

//函式三：移除摯愛
function removeFromFavorite(id) {
  if (!users || !users.length) return

  //透過 id 找到要刪除清單的 index
  const userIndex = users.findIndex((user) => user.id === id);
  if (userIndex === -1) return //一旦傳入的 id 在收藏清單中不存在，如果users陣列中沒有id和傳入的id相同的資料，usersIndex的值就會是-1，

  //刪除該筆清單
  users.splice(userIndex, 1)
  //存回 local storage
  localStorage.setItem('favoriteUsers', JSON.stringify(users))
  alert('Just removed it successfully!') 
  return
  //更新頁面
  renderUserCards(users)
}


//事件監聽一
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".card-img-top")) {
    showUserModal((event.target.dataset.id));
  } else if (event.target.matches(".btn-add-favorite")) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
});

renderUserCards(users)
const BASE_URL = 'https://user-list.alphacamp.io/'
const INDEX_URL = BASE_URL + 'api/v1/users/';

//宣告變數
const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector('#paginator')
const users = [];
const list = JSON.parse(localStorage.getItem('favoriteUsers')) || []
const User_PER_PAGE = 12 //每一頁有12部電影
let filteredUsers = [];// 收藏清單


// 函式一：渲染使用者小卡
function renderUserCards(data) {
  let rawHTML = "";
  data.forEach((user) => {
    rawHTML += `
    <div class="col-sm-3 mb-2">
      <div class="card">
        <img src="${user.avatar}" class="card-img-top" alt="User-img" data-bs-toggle="modal" data-bs-target="#user-modal" data-id="${user.id}">
        <div class="card-body">
          <h5 class="card-title" data-id=${user.id}>${user.name} ${user.surname}</h5>
          <div class="heart position-absolute top-0 end-0 "> 
            <i class="${list.some((friend) => friend.id === user.id) ? "fa-solid" : "fa-regular" }  fa-heart btn btn-add-favorite text-danger" data-id="${user.id}"></i>
          </div>
        </div>
      </div>    
    </div>`;
  });
  dataPanel.innerHTML = rawHTML;
}

//函式二：渲染主頁使用者列表
function renderUserList(){
  axios
  .get(INDEX_URL)
  .then((response) => {
    users.push(...response.data.results);
    renderPaginator(users.length)
    renderUserCards(getUsersByPage(1));
  })
  .catch((err) => console.log(err));
}

// 函式三：顯示使用者資訊
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
  });
}

//函式四：添加摯友
function addToFavorite(id) {
  //宣告變數，找出users當中的id與資料id相符合
  const user = users.find((user) => user.id === id);

  if (list.some((user) => user.id === id)) {
    let index = list.findIndex((user)=> user.id === id)
    //移除list位置中的一個
    list.splice(index,1)

    return localStorage.setItem('favoriteUsers', JSON.stringify(list))
  }
  //將資料放進list
  list.push(user)
  //設定將資料轉成json字串，放進local storage
  localStorage.setItem('favoriteUsers', JSON.stringify(list))
  alert('Just added it successfully !')
  return
}

//函式五：資料分頁
function getUsersByPage(page) {
  // 以下解釋為 如果filteredUser為有東西的就回傳filteredUsers ,沒有就回傳users
  const data = filteredUsers.length ? filteredUsers : users
  const startIndex = (page - 1) * User_PER_PAGE
  return data.slice(startIndex, startIndex + User_PER_PAGE)
}

//函式六：分頁渲染
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / User_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += ` <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

//事件監聽一：顯示使用者資訊 & 加入、移除摯友
dataPanel.addEventListener("click", function onPanelClicked(event) {
  const target = event.target
  //條件一：如果目標節點有符合.card-img-top
  if (target.matches(".card-img-top")) {
     //將目標id帶入函式三
    showUserModal((target.dataset.id));
  //條件二：如果目標節點有符合.btn-add-favorite
  } else if (target.matches('.btn-add-favorite')){
     //目標class觸發fa-solid
    target.classList.toggle('fa-solid')
    
    //如果目標節點有符合.fa-solid
      if(target.matches('.fa-solid')){
        target.classList.remove('fa-regular')
      }else{
        target.classList.add('fa-regular')
      }
    //將目標id帶入函式四
    addToFavorite(Number(target.dataset.id))
  }   
});

//事件監聽二：搜尋名字
searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();
  console.log("click");
  const keyword = searchInput.value.trim().toLowerCase();

  filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(keyword) || user.surname.toLowerCase().includes(keyword)
  );
  //錯誤處理：無符合條件的結果
  if (filteredUsers.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的User`);
  }
  //重新輸出至畫面
  renderPaginator(filteredUsers.length)
  renderUserCards(getUsersByPage(1));

});

//事件監聽三：點擊分頁
paginator.addEventListener("click", function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return;
  const page = Number(event.target.dataset.page)
  renderUserCards(getUsersByPage(page))
})


//渲染
renderUserList();
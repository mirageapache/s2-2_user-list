const INDEX_URL = "https://lighthouse-user-api.herokuapp.com/api/v1/users"
const user_panel = document.querySelector('#user_panel') //人員資料
const search_input = document.querySelector('#search_input') //搜尋
const no_search_result = document.querySelector('#no_search_result') //無搜尋資料
const paginator = document.querySelector('#paginator')  //分頁器
const no_favorite = document.querySelector('#no_favorite_item') //無收藏資料

// const users = []
let filter_user = []
let favorite_users = JSON.parse(localStorage.getItem('favorites')) || []

let user_per_page = 20


// 在user panel顯示User資料
function renderUserList(data) {

  let rawHTML = ''
  user_panel.innerHTML = ''
  if (favorite_users.length > 0) {
    //有收藏資料
    search_input.removeAttribute('hidden')
    no_favorite.textContent = ""
    // 判斷搜尋是否有結果
    if (no_search_result.textContent.length === 0) {
      data.forEach((item) => {
        rawHTML += `
      <div class="card m-2" style="cursor:pointer">
        <img class="user_img card-img-top" src="${item.avatar}" data-id="${item.id}" data-bs-toggle="modal" data-bs-target="#user_modal">
        <div class="card-body" data-bs-toggle="modal" data-bs-target="#user_modal" data-id="${item.id}">
          <p class="user_name" data-id="${item.id}">${item.name}</p>
        </div>
        <button type="button" class="favorite_btn btn" data-toggle="tooltip" data-placement="top" title="remove favorite" data-id="${item.id}">
          <i class="bi bi-star-fill favorite_icon" data-id="${item.id}"></i>
        </button>
      </div>
      `
      })
      user_panel.innerHTML = rawHTML
    }
  }
  else {
    // 無收藏資料
    no_favorite.textContent = "No Favorite Item!"
    search_input.setAttribute('hidden', 'true')
  }


}

// 圖片點擊函式
function cardOnClick(event) {
  const id = Number(event.target.dataset.id)
  if (!id) { return }

  if (event.target.matches('.favorite_icon')) {
    // 調整收藏按鈕樣式
    if (event.target.matches('.bi-star-fill')) {
      event.target.classList.remove('bi-star-fill')
      event.target.classList.add('bi-star')
      event.target.title = 'add favorite'
    } else {
      event.target.classList.remove('bi-star')
      event.target.classList.add('bi-star-fill')
      event.target.title = 'remove favorite'
    }
    // add or remove favorit
    addRemoveFavorite(id)
  }
  else {
    // show modal
    showUserModal(id)
  }
}

// 取得人員資料並顯示在Mdoal
function showUserModal(id) {
  const modal_body = document.querySelector('#user_modal_body')
  modal_body.innerHTML = ''
  axios.get(INDEX_URL + '/' + id)
    .then((response) => {
      const user_arr = response.data
      let raw_html = ''
      raw_html = `<div class="row">
                  <div class="col-sm-4">
                    <img id="user_modal_img" src="${user_arr.avatar}" alt="image" >
                  </div>
                  <div class="col-sm-8">
                    <p id="user_modal_id">ID：${user_arr.id}</p>
                    <p id="user_modal_name">Name：${user_arr.name} ${user_arr.surname}</p>
                    <p id="user_modal_email">E-Mail：${user_arr.email}</p>
                    <p id="user_modal_gender">Gender：${user_arr.gender}</p>
                    <p id="user_modal_age">Age：${user_arr.age}</p>
                    <p id="user_modal_region">Region：${user_arr.region}</p>
                    <p id="user_modal_birthday">Birthday：${user_arr.birthday}</p>
                  </div>
                </div>
                `
      modal_body.innerHTML = raw_html
    })
    .catch((error) => {
      console.log(error)
    })


}

// 刪除收藏清單
function addRemoveFavorite(id) {
  favorite_users = JSON.parse(localStorage.getItem('favorites')) || []
  const index = favorite_users.findIndex(user => user.id === id)
  favorite_users.splice(index, 1)
  localStorage.setItem('favorites', JSON.stringify(favorite_users))

  // 重新顯示資料及分頁
  renderUserList(getUserBypage(1))
  renderPaginator(favorite_users.length)
}

// 計算每頁顯示資料
function getUserBypage(page) {
  const index = (page - 1) * user_per_page //計算出每頁資料的開始位置(index)
  let data = filter_user.length ? filter_user : favorite_users
  return data.slice(index, index + user_per_page)
}

// 產生分頁按鈕
function renderPaginator(amount) {
  let rawHTML = ""
  const number_of_page = Math.ceil(amount / user_per_page)
  for (let page = 1; page <= number_of_page; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

// 產生Favotrie User資料 
renderUserList(getUserBypage(1))
renderPaginator(favorite_users.length)

// 圖片點擊監聽事件
user_panel.addEventListener('click', cardOnClick)

// 搜尋人員監聽事件
search_input.addEventListener('input', function onInputChanged(event) {
  const no_search_result = document.querySelector('#no_search_result')
  let search_str = event.target.value.trim().toLowerCase()

  filter_user = favorite_users.filter((user) => user.name.toLowerCase().includes(search_str))

  if (filter_user.length == 0) {
    no_search_result.textContent = "Can't find anyone!! \n Your search keyword：" + search_str
  }
  else {
    no_search_result.textContent = ""
  }
  renderUserList(filter_user)
})

// 分頁監聽事件
paginator.addEventListener('click', function onPaginatorClicked(event) {
  let page = Number(event.target.dataset.page)
  window.scrollTo(0, 0); //回到頁面上方
  renderUserList(getUserBypage(page))
})
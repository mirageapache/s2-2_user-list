const INDEX_URL = "https://lighthouse-user-api.herokuapp.com/api/v1/users"
const user_panel = document.querySelector('#user_panel') //人員資料
const search_input = document.querySelector('#search_input') //搜尋
const no_search_result = document.querySelector('#no_search_result') //無搜尋資料
const paginator = document.querySelector('#paginator') //分頁器

const users = [] //人員陣列資料
let filter_users = [] //搜尋陣列資料
let favorite_users = JSON.parse(localStorage.getItem('favorites')) || []

const user_per_page = 20 //每頁20筆資料

// 在user panel顯示User資料
function renderUserList(data) {
  let rawHTML = ''
  let added_favortie = ''
  let tooltip = ''

  // 搜尋不到資料時不顯示
  if (no_search_result.textContent.length === 0) {
    data.forEach((item) => {
      // 判斷是否已收藏
      if (favorite_users.some(user => user.id === item.id)) {
        added_favortie = 'bi-star-fill'
        tooltip = 'remove favortie'
      }
      else {
        added_favortie = 'bi-star'
        tooltip = 'add favortie'
      }
      rawHTML += `
    <div class="card m-2" style="cursor:pointer">
      <img class="user_img card-img-top" src="${item.avatar}" data-id="${item.id}" data-bs-toggle="modal" data-bs-target="#user_modal">
      <div class="card-body" data-bs-toggle="modal" data-bs-target="#user_modal" data-id="${item.id}">
        <p class="user_name" data-id="${item.id}">${item.name}</p>
      </div>
      <button type="button" class="favorite_btn btn" data-toggle="tooltip" data-placement="top" title="${tooltip}" data-id="${item.id}">
        <i class="bi ${added_favortie} favorite_icon" data-id="${item.id}"></i>
      </button>
    </div>
    `
    })
    user_panel.innerHTML = rawHTML
  }
  else {
    user_panel.innerHTML = ''
  }

}

// 圖片點擊函式
function cardOnClick(event) {
  const id = Number(event.target.dataset.id)
  if (!id) { return }

  if (event.target.matches('.favorite_icon')) {
    // 調整按鈕樣式
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
// 新增&刪除 收藏清單
function addRemoveFavorite(id) {
  const user = users.find(user => user.id === id) // 用find()找到相對應的id

  // 判斷是否已在收藏清單中
  if (favorite_users.some(user => user.id === id)) {
    // 刪除
    const index = favorite_users.findIndex(user => user.id === id)
    favorite_users.splice(index, 1)
  }
  else {
    // 新增
    favorite_users.push(user)
  }
  localStorage.setItem('favorites', JSON.stringify(favorite_users))
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

// 計算每頁顯示資料
function getUserByPage(page) {
  const index = (page - 1) * user_per_page //計算出每頁資料的開始位置(index)
  let data = filter_users.length ? filter_users : users //當filter_users沒搜尋資料(空陣列)時，則回傳users陣列
  return data.slice(index, index + user_per_page)
}

// 取得Users資料 
axios.get(INDEX_URL)
  .then((response) => {
    users.push(...response.data.results)
    renderPaginator(users.length)
    renderUserList(getUserByPage(1))
  })
  .catch((err) => {
    console.log(err)
  });

// 圖片點擊監聽事件
user_panel.addEventListener('click', cardOnClick)

// 搜尋人員監聽事件
search_input.addEventListener('input', function onInputChanged(event) {
  let search_str = event.target.value.trim().toLowerCase()
  filter_users = users.filter((user) => user.name.toLowerCase().includes(search_str)) //

  if (filter_users.length == 0) {
    no_search_result.innerText = "Can't find anyone!! \n Your search keyword：" + search_str
  }
  else {
    no_search_result.innerText = ""
  }
  renderPaginator(filter_users.length)
  renderUserList(getUserByPage(1))

})

// 分頁監聽事件
paginator.addEventListener('click', function onPaginatorClicked(event) {
  let page = Number(event.target.dataset.page)
  window.scrollTo(0, 0); //回到頁面上方
  renderUserList(getUserByPage(page))
})
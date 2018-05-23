import axios from 'axios';

const postAPI = axios.create({
  baseURL: process.env.API_URL
});
const rootEl = document.querySelector('.root');

function login(token){
  localStorage.setItem('token',token); 
  postAPI.defaults.headers['Authorization'] = `Bearer ${token}`;
  rootEl.classList.add('root--authed'); 
}

function logout(){
  localStorage.removeItem('token');
  delete postAPI.defaults.headers['Authorization'];
  rootEl.classList.remove('root--authed');
}
const templates = {
  postList: document.querySelector('#post-list').content,
  postItem: document.querySelector('#post-item').content,
  postContent: document.querySelector('#post-content').content,
  login: document.querySelector('#login').content,
  postForm: document.querySelector('#post-form').content,
  modifyForm: document.querySelector('#modify-form').content
}

function render(fragment){
  rootEl.textContent = "";  
  rootEl.appendChild(fragment);
}

async function indexPage(){
   const res = await postAPI.get('/posts');
   const listFragment = document.importNode(templates.postList, true);
  
   listFragment.querySelector('.post-list__login-btn').addEventListener('click', e=>{
    loginPage();
   })

   listFragment.querySelector('.post-list__logout-btn').addEventListener('click', e=>{
     logout();
     indexPage();
   })

   listFragment.querySelector('.post-list__new-post-btn').addEventListener('click', e=>{
    postFormPage();
   })

   res.data.forEach(post => {
     const fragment = document.importNode(templates.postItem, true);
     const pEl = fragment.querySelector('.post-item__title');
     pEl.textContent = post.title;
     pEl.addEventListener('click', e=>{
       postContentPage(post.id);
     })
     listFragment.querySelector('.post-list').appendChild(fragment);
   })
   render(listFragment);
}

async function postContentPage(postId){
  const res = await postAPI.get(`/posts/${postId}`);
  const fragment = document.importNode(templates.postContent, true);
  fragment.querySelector('.post-content__title').textContent = res.data.title;
  fragment.querySelector('.post-content__body').textContent = res.data.body;
  fragment.querySelector('.post-content__back-btn').addEventListener('click', e=>{
    indexPage();
  })
  // ** 게시글 클릭후 나오는 페이지에서 삭제버튼 클릭시 보고있는 해당 글 삭제 ** //
  fragment.querySelector('.post-content__delete-btn').addEventListener('click', async e=>{
    await postAPI.delete(`/posts/${postId}`);
    indexPage();
  })
    // ** 게시글 클릭후 나오는 페이지에서 수정버튼 클릭시 수정페이지로이동 ** //
  fragment.querySelector('.post-content__modify-btn').addEventListener('click', e=>{
    modifyFormPage(postId);
  })
  render(fragment);
}

async function loginPage(){
  const fragment = document.importNode(templates.login, true);
  const formEl = fragment.querySelector('.login__form');
  formEl.addEventListener('submit', async e=>{
    // e.target.elements.username.value === fragment.querySelector('.login__username');
    const payload = {
      username: e.target.elements.username.value,
      password: e.target.elements.password.value
    };
    e.preventDefault();
    const res = await postAPI.post('/users/login',payload);
    login(res.data.token);  
    indexPage();
  })
  render(fragment);
}

async function postFormPage(){
  const fragment = document.importNode(templates.postForm, true);
  fragment.querySelector('.post-form__back-btn').addEventListener('click', e=>{
    e.preventDefault();
    indexPage();
  })

  fragment.querySelector('.post-form').addEventListener('submit', async e=>{
    e.preventDefault();
    const payload = {
      title: e.target.elements.title.value,
      body: e.target.elements.body.value
    };

    const res = await postAPI.post('/posts',payload);
    console.log(res);
    postContentPage(res.data.id);
  })

  render(fragment);
}

  // 수정기능 구현
async function modifyFormPage(postId){
  const res = await postAPI.get(`/posts/${postId}`);
  const fragment = document.importNode(templates.modifyForm, true);
  fragment.querySelector('.modify-form__title').value = res.data.title;
  fragment.querySelector('.modify-form__body').value = res.data.body;

  // 수정페이지에서 뒤로가기버튼 구현 , 뒤로가기를 누르면 수정하려던 원래본문으로 돌아간다
  fragment.querySelector('.modify-form__back-btn').addEventListener('click', e=>{
    e.preventDefault();
    postContentPage(postId);
  })
  
  // 수정페이지에서 수정 submit event 구현
  fragment.querySelector('.modify-form').addEventListener('submit', async e=>{
    e.preventDefault();
    const payload = {
      title: e.target.elements.title.value,
      body: e.target.elements.body.value
    };
    const res = await postAPI.patch(`/posts/${postId}`,payload);
    console.log(res);
    postContentPage(res.data.id);
  })
  render(fragment);
}




if(localStorage.getItem('token')){
  login(localStorage.getItem('token'));
}

indexPage();

// postContentPage(1);
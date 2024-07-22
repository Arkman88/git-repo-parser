const inputBox = document.getElementById('input-box');
const resultBox = document.querySelector('.search-box__result');
const repoBox = document.querySelector('.search-box__repo');


// запрос
const fetchData = async (input) => {
  try {
    const response = await fetch(`https://api.github.com/search/repositories?q=${input}`);
    if (!response.ok) {
      throw new Error('Ошибка при получении данных');
    }
    const data = await response.json();
    showResults(data.items);
  } catch (error) {
    console.error('Ошибка при получении данных:', error);
  }
};

// отображение
function showResults(results) {
  const content = results.map(item => {
    const repoName = item.full_name
    return `<li onclick="selectRepo('${item.full_name}')">${repoName}</li>`
  }).join('');

  resultBox.innerHTML = `<ul>${content}</ul>`;
}

// выбор репо
async function selectRepo(fullName) {
  try {
    const response = await fetch(`https://api.github.com/repos/${fullName}`);
    if (!response.ok) {
      throw new Error('Ошибка при получении данных о репозитории');
    }
    const repoData = await response.json();
    addRepoToList(repoData);
  } catch (error) {
    console.error('Ошибка при получении данных о репозитории:', error);
  }
}

// добавление в список
function addRepoToList(repoData) {
 
  const repoNameParts = repoData.full_name.split('/');
  const repoName = repoNameParts.length > 1 ? repoNameParts[1] : repoData.full_name;
  const ownerName = repoNameParts.length > 1 ? repoNameParts[0] : repoData.full_name;
  const stars = repoData.stargazers_count;

  if (isDuplicate(ownerName)) {
    alert('Этот элемент уже добавлен в список');
    return;
  }

  const listItem = document.createElement('li');

  const repoLink = document.createElement('a');
  repoLink.href = repoData.html_url;
  repoLink.textContent = repoName;
  repoLink.target = '_blank';

  listItem.innerHTML = `
    <div class="search-box__repo-details">
      <span>Name: ${repoLink.outerHTML}</span><br>
      <span>Owner: ${ownerName}</span><br>
      <span>Stars: ${stars}</span>
    </div>
  `;

  const deleteButton = document.createElement('img');
  deleteButton.src = 'images/delete-btn.svg';
  deleteButton.classList.add('delete-btn')

  deleteButton.onclick = function() {
    listItem.remove();
    const repoList = repoBox.querySelector('ul');
    if (repoList && repoList.children.length === 0) repoList.remove();
  };

  listItem.appendChild(deleteButton);

  let repoList = repoBox.querySelector('ul');
  if (!repoList) {
    repoList = document.createElement('ul');
    repoBox.appendChild(repoList);
  }

  repoList.appendChild(listItem);
  clearResults();
  inputBox.value = '';
}

// проверка добавленных
function isDuplicate(ownerName) {
  const listItems = repoBox.querySelectorAll('ul li');
  for (let i = 0; i < listItems.length; i++) {
    const textContent = listItems[i].textContent;
    const searchOwnerName = textContent.split(': ')[2].split('\n')[0];
    if (searchOwnerName === ownerName) {
      return true;
    }
  }
  return false;
}

// очистка результатов
function clearResults() {
  resultBox.innerHTML = '';
}

// debounce
const debounce = (fn, debounceTime) => {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, debounceTime);
  };
};

// main
const debounceTime = 400; 
inputBox.addEventListener('input', debounce(function() {
  let input = inputBox.value.trim();
  
  if (input.length > 0) {
    resultBox.innerHTML = '';
    fetchData(input);
  } else {
    resultBox.innerHTML = '';
    if (repoBox.querySelector('ul') && repoBox.querySelector('ul').children.length === 0) {
      repoBox.innerHTML = '';
    }
  }
}, debounceTime));

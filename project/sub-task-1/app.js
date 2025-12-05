// Vanilla JS mirror of your Angular todo UI

const API_URL = 'https://jsonplaceholder.typicode.com/todos?_limit=10';

let todos = []; // { id, name, description, creationDate: Date, done }
let filterStart = null;
let filterEnd = null;
let sortKey = 'name'; // 'name' | 'date'
let sortAsc = true;
let selectedId = null;

// DOM refs
let tbody;
let startDateInput;
let endDateInput;
let applyFilterBtn;
let resetFilterBtn;
let filterToggleBtn;
let filtersContainer;
let filtersCloseBtn;
let listSection;

let nameHeader;
let dateHeader;
let nameSortIndicator;
let dateSortIndicator;

let panelSection;
let descTextarea;
let saveDescBtn;
let closeDescBtn;

document.addEventListener('DOMContentLoaded', () => {
  cacheDom();
  attachEvents();
  loadTodos();
});

function cacheDom() {
  tbody = document.getElementById('todoTbody');
  startDateInput = document.getElementById('startDateInput');
  endDateInput = document.getElementById('endDateInput');
  applyFilterBtn = document.getElementById('applyFilterBtn');
  resetFilterBtn = document.getElementById('resetFilterBtn');
  filterToggleBtn = document.getElementById('filterToggleBtn');
  filtersContainer = document.getElementById('filtersContainer');
  filtersCloseBtn = document.getElementById('filtersCloseBtn');
  listSection = document.getElementById('listSection');

  nameHeader = document.getElementById('nameHeader');
  dateHeader = document.getElementById('dateHeader');
  nameSortIndicator = document.getElementById('nameSortIndicator');
  dateSortIndicator = document.getElementById('dateSortIndicator');

  panelSection = document.getElementById('panelSection');
  descTextarea = document.getElementById('descTextarea');
  saveDescBtn = document.getElementById('saveDescBtn');
  closeDescBtn = document.getElementById('closeDescBtn');
}

function attachEvents() {
  // Filters
  applyFilterBtn.addEventListener('click', () => {
    filterStart = startDateInput.value ? new Date(startDateInput.value) : null;
    filterEnd = endDateInput.value ? new Date(endDateInput.value) : null;
    render();
    closeFilterSidebar();
  });

  resetFilterBtn.addEventListener('click', () => {
    startDateInput.value = '';
    endDateInput.value = '';
    filterStart = null;
    filterEnd = null;
    render();
    closeFilterSidebar();
  });

  filterToggleBtn.addEventListener('click', () => {
    filtersContainer.classList.add('open');
  });

  filtersCloseBtn.addEventListener('click', () => {
    closeFilterSidebar();
  });

  // Sorting
  nameHeader.addEventListener('click', () => changeSort('name'));
  dateHeader.addEventListener('click', () => changeSort('date'));

  // Sidebar actions
  saveDescBtn.addEventListener('click', onSaveDescription);
  closeDescBtn.addEventListener('click', closeSidebar);

  // Event delegation for table actions
  tbody.addEventListener('click', handleTableClick);
}

function closeFilterSidebar() {
  filtersContainer.classList.remove('open');
}

function loadTodos() {
  fetch(API_URL)
    .then((res) => res.json())
    .then((data) => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-07-01');

      todos = data.map((item) => ({
        id: item.id,
        name: item.title,
        description: `Lorem Ipsum is simply dummy text of the printing.\n\nSource: ${item.title}`,
        creationDate: randomDate(start, end),
        done: !!item.completed
      }));

      render();
    })
    .catch((err) => {
      console.error('Failed to load todos:', err);
    });
}

function randomDate(start, end) {
  const t = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(t);
}

// Compute visible todos based on filter + sort
function getVisibleTodos() {
  let list = [...todos];

  if (filterStart) {
    list = list.filter((item) => item.creationDate >= filterStart);
  }
  if (filterEnd) {
    const endDay = new Date(filterEnd);
    endDay.setHours(23, 59, 59, 999);
    list = list.filter((item) => item.creationDate <= endDay);
  }

  if (sortKey === 'name') {
    list.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortKey === 'date') {
    list.sort((a, b) => a.creationDate - b.creationDate);
  }

  if (!sortAsc) list.reverse();

  return list;
}

function render() {
  renderTable();
  renderSidebar();
  renderSortIndicators();
}

function renderTable() {
  const visible = getVisibleTodos();
  tbody.innerHTML = '';

  visible.forEach((item) => {
    const tr = document.createElement('tr');
    tr.dataset.id = String(item.id);
    if (item.id === selectedId) tr.classList.add('selected');

    // Checkbox
    const tdCheck = document.createElement('td');
    tdCheck.className = 'col-check';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = item.done;
    checkbox.dataset.action = 'toggle-done';
    checkbox.dataset.id = String(item.id);
    tdCheck.appendChild(checkbox);

    // Edit icon (square with pencil)
    const tdIcon = document.createElement('td');
    tdIcon.className = 'col-icon';
    const iconBtn = document.createElement('button');
    iconBtn.className = 'icon-btn';
    iconBtn.dataset.action = 'edit-desc';
    iconBtn.dataset.id = String(item.id);
    const square = document.createElement('span');
    square.className = 'icon-square';
    const pencil = document.createElement('span');
    pencil.className = 'material-icons';
    pencil.style.fontSize = '12px';
    pencil.textContent = 'edit';
    square.appendChild(pencil);
    iconBtn.appendChild(square);
    tdIcon.appendChild(iconBtn);

    // Name
    const tdName = document.createElement('td');
    const nameSpan = document.createElement('span');
    nameSpan.textContent = item.name;
    if (item.done) nameSpan.classList.add('completed');
    tdName.appendChild(nameSpan);

    // Date
    const tdDate = document.createElement('td');
    tdDate.className = 'col-date';
    tdDate.textContent = formatDate(item.creationDate);

    // Trash
    const tdTrash = document.createElement('td');
    tdTrash.className = 'col-trash';
    const delBtn = document.createElement('button');
    delBtn.className = 'icon-btn';
    delBtn.dataset.action = 'delete';
    delBtn.dataset.id = String(item.id);
    const delIcon = document.createElement('span');
    delIcon.className = 'material-icons';
    delIcon.textContent = 'delete';
    delBtn.appendChild(delIcon);
    tdTrash.appendChild(delBtn);

    tr.appendChild(tdCheck);
    tr.appendChild(tdIcon);
    tr.appendChild(tdName);
    tr.appendChild(tdDate);
    tr.appendChild(tdTrash);

    tbody.appendChild(tr);
  });
}

function renderSidebar() {
  if (selectedId == null) {
    panelSection.classList.remove('open');
    listSection.classList.remove('dimmed');
    return;
  }

  const item = todos.find((t) => t.id === selectedId);
  if (!item) {
    panelSection.classList.remove('open');
    listSection.classList.remove('dimmed');
    return;
  }

  descTextarea.value = item.description;
  panelSection.classList.add('open');
  listSection.classList.add('dimmed');
}

function renderSortIndicators() {
  nameSortIndicator.textContent = '';
  dateSortIndicator.textContent = '';

  if (sortKey === 'name') {
    nameSortIndicator.textContent = sortAsc ? ' ▲' : ' ▼';
  } else if (sortKey === 'date') {
    dateSortIndicator.textContent = sortAsc ? ' ▲' : ' ▼';
  }
}

function changeSort(key) {
  if (key === sortKey) {
    sortAsc = !sortAsc;
  } else {
    sortKey = key;
    sortAsc = true;
  }
  render();
}

function handleTableClick(event) {
  const target = event.target;

  // DELETE
  const deleteBtn = target.closest('[data-action="delete"]');
  if (deleteBtn) {
    event.stopPropagation();
    const id = Number(deleteBtn.dataset.id);
    todos = todos.filter((t) => t.id !== id);
    if (selectedId === id) selectedId = null;
    render();
    return;
  }

  // TOGGLE DONE
  if (target.dataset && target.dataset.action === 'toggle-done') {
    event.stopPropagation();
    const id = Number(target.dataset.id);
    todos = todos.map((t) =>
      t.id === id ? { ...t, done: !t.done } : t
    );
    render();
    return;
  }

  // EDIT DESCRIPTION via icon
  const editBtn = target.closest('[data-action="edit-desc"]');
  if (editBtn) {
    event.stopPropagation();
    selectedId = Number(editBtn.dataset.id);
    render();
    return;
  }

  // Row click: also open description
  const row = target.closest('tr');
  if (row && row.dataset.id) {
    selectedId = Number(row.dataset.id);
    render();
  }
}

function onSaveDescription() {
  if (selectedId == null) return;
  const newDesc = descTextarea.value;
  todos = todos.map((t) =>
    t.id === selectedId ? { ...t, description: newDesc } : t
  );
  selectedId = null;
  render();
}

function closeSidebar() {
  selectedId = null;
  render();
}

function formatDate(d) {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

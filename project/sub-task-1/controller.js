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
let editBackdrop;

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
  editBackdrop = document.getElementById('editBackdrop');

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

//   filterToggleBtn.addEventListener('click', () => {
//     filtersContainer.classList.add('open');
//   });

//   filtersCloseBtn.addEventListener('click', () => {
//     closeFilterSidebar();
//   });

  // Sorting
  nameHeader.addEventListener('click', () => changeSort('name'));
  dateHeader.addEventListener('click', () => changeSort('date'));

  // Sidebar actions
  saveDescBtn.addEventListener('click', onSaveDescription);
  closeDescBtn.addEventListener('click', closeSidebar);

  // Event delegation for table actions
  tbody.addEventListener('click', handleTableClick);

  editBackdrop.addEventListener('click', closeSidebar);
}

function closeFilterSidebar() {
  if (window.matchMedia && window.matchMedia('(max-width: 700px)').matches) {
    return;
  }
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
    tdCheck.dataset.label = 'Done';
    /**
     *  <label class="custom-checkbox">
                                        <input type="checkbox" [checked]="item.completed" (change)="toggleDone(item)"
                                            (click)="$event.stopPropagation()">
                                        <span class="custom-checkbox"></span>
                                    </label>
     */

    const checkboxlb = document.createElement('label');
    checkboxlb.className = 'custom-checkbox';
    const checkboxspan = document.createElement('span');
    checkboxspan.className = 'custom-checkbox';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = item.done;
    checkbox.dataset.action = 'toggle-done';
    checkbox.dataset.id = String(item.id);
    tdCheck.appendChild(checkbox);
    checkboxlb.appendChild(checkboxspan);
    checkboxlb.appendChild(checkbox);
    tdCheck.appendChild(checkboxlb);

    // Edit icon (square with pencil)
    const tdIcon = document.createElement('td');
    const iconBtn = document.createElement('button');

    iconBtn.dataset.action = 'edit-desc';
    iconBtn.dataset.id = String(item.id);
    tdIcon.dataset.label = 'Edit';
    const square = document.createElement('span');

    const editIcon = document.createElement('img');
    editIcon.src = 'images/create-outline.svg';
    editIcon.alt = 'Edit todo';
    editIcon.width = 16;
    editIcon.height = 16;
    square.appendChild(editIcon);
    iconBtn.appendChild(square);
    tdIcon.appendChild(iconBtn);

    // Name
    const tdName = document.createElement('td');
    const nameSpan = document.createElement('span');
    nameSpan.textContent = item.name;
    if (item.done) nameSpan.classList.add('completed');
    tdName.appendChild(nameSpan);
    tdName.dataset.label = 'Name';

    // Date
    const tdDate = document.createElement('td');
    tdDate.className = 'col-date';
    tdDate.textContent = formatDate(item.creationDate);
    tdDate.dataset.label = 'Creation Date';

    // Trash
    const tdTrash = document.createElement('td');
    tdTrash.dataset.label = 'Delete';


    tr.appendChild(tdCheck);
    tr.appendChild(tdIcon);
    tr.appendChild(tdName);
    tr.appendChild(tdDate);

    // 3. Create the <svg> element (the trashcan icon)
    let svg = getDeleteBtn();
    createButton(item, tdTrash, 'Delete', svg, 'delete', () => {
      todos = todos.filter((t) => t.id !== item.id);
      if (selectedId === item.id) selectedId = null;
      render();
    });
    tr.appendChild(tdTrash);

    tbody.appendChild(tr);
  });
}
function getDeleteBtn() {

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute('xmlns', svgNS);
  svg.setAttribute('viewBox', '0 0 512 512');

  // Set the SVG color based on the original image's style (or use CSS)
  // svg.style.color = '#E74C3C'; 

  // 4. Define all the <path> elements (the icon geometry)
  const pathData = [
    "M112 112l20 320c.95 18.49 14.4 32 32 32h184c17.67 0 30.87-13.51 32-32l20-320",
    "M80 112h352",
    "M192 112V72h0a23.93 23.93 0 0124-24h80a23.93 23.93 0 0124 24h0v40M256 176v224M184 176l8 224M328 176l-8 224"
  ];

  // Create and append the paths
  pathData.forEach((d, index) => {

    const path = document.createElementNS(svgNS, "path");
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'currentColor'); // Use parent color

    // Apply specific attributes based on the original SVG paths
    if (index === 0) {
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
    } else if (index === 1) {
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-miterlimit', '10');
    } else {
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
    }
    path.setAttribute('stroke-width', '32');

    svg.appendChild(path);
  });
  return svg
}
function createButton(item, parentElement, text, icon, action, deleteActionCallback) {

  // 1. Create the <button> element
  const button = document.createElement('button');
  button.className = 'icon-btn';
  button.title = text;
  button.dataset.action = action;
  button.dataset.id = String(item.id);
  // 2. Attach the click handler (equivalent to Angular's (click))
  button.addEventListener('click', (event) => {
    // Equivalent to $event.stopPropagation()
    event.stopPropagation();

    // Equivalent to deleteItem(item)
    if (typeof deleteActionCallback === 'function') {
      deleteActionCallback(item);
    }

    // Optional: Remove the button/row visually after the action
    // button.closest('.table-row').remove();
  });
  if (icon)
  parentElement.appendChild(icon);

  return icon;
}

function renderSidebar() {
  if (selectedId == null) {
    panelSection.classList.remove('open');
    panelSection.classList.add('hidden');
    listSection.classList.remove('dimmed');
    return;
  }

  const item = todos.find((t) => t.id === selectedId);
  if (!item) {
    panelSection.classList.remove('open');
    panelSection.classList.add('hidden');
    listSection.classList.remove('dimmed');
    return;
  }

  descTextarea.value = item.description;
  panelSection.classList.add('open');
  panelSection.classList.remove('hidden');
  listSection.classList.add('dimmed');
}

function renderSortIndicators() {
  nameSortIndicator.textContent = '';
  dateSortIndicator.textContent = '';
  if (sortKey === 'name') {
    nameSortIndicator.textContent = sortAsc ? ' ⌃' : '⌄';
  } else if (sortKey === 'date') {
    dateSortIndicator.textContent = sortAsc ? ' ⌃' : '⌄';
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
  console.log('Table clicked:', target);
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

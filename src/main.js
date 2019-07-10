/// UTILS
var _table_ = document.createElement('table'),
  _tr_ = document.createElement('tr'),
  _th_ = document.createElement('th'),
  _td_ = document.createElement('td');

function buildHtmlTable(arr) {
  var table = _table_.cloneNode(false),
    columns = addAllColumnHeaders(arr, table);
  for (var i = 0, maxi = arr.length; i < maxi; ++i) {
    var tr = _tr_.cloneNode(false);
    for (var j = 0, maxj = columns.length; j < maxj; ++j) {
      var td = _td_.cloneNode(false);
      cellValue = arr[i][columns[j]];
      td.appendChild(document.createTextNode(arr[i][columns[j]] || ''));
      tr.appendChild(td);
    }
    table.appendChild(tr);
  };
  table.setAttribute('class', 'table');
  table.setAttribute('id', 'mytable');
  return table;
}

function addAllColumnHeaders(arr, table) {
  var columnSet = [],
    tr = _tr_.cloneNode(false);
  for (var i = 0, l = arr.length; i < l; i++) {
    for (var key in arr[i]) {
      if (arr[i].hasOwnProperty(key) && columnSet.indexOf(key) === -1) {
        columnSet.push(key);
        var th = _th_.cloneNode(false);
        th.appendChild(document.createTextNode(key));
        tr.appendChild(th);
      }
    }
  }
  table.appendChild(tr);
  return columnSet;
}

// API PART eg. in API.js
const HOST = 'http://localhost:3000';
const cities_url = HOST + '/cities';
const countries_url = HOST + '/countries';
const states_url = HOST + '/states';
const users_url = HOST + '/users';


function api_call(method, url, payload) {
  var req = new XMLHttpRequest();
  req.onload = function () {
    return JSON.parse(req.responseText);
  };
  req.open(method, url, false);
  req.setRequestHeader('Content-Type', 'application/json');
  if (payload) {
    req.send(JSON.stringify(payload));
  } else {
    req.send();
  };

  return JSON.parse(req.response);
};

// get all users
function fetch_users() {
  var all_users = api_call('GET', users_url);

  //foreach user retrieve related data
  all_users.forEach(element => {
    element.state = api_call('GET', states_url + '/' + element.state_id);
    element.country = api_call('GET', countries_url + '/' + element.country_id);
    element.city = api_call('GET', cities_url + '/' + element.city_id);
  });
  return all_users
};

function set_opts(data, target) {
  {
    var select = document.getElementById(target);
    data.forEach(element => {
      select.options[select.options.length] = new Option(element.name, element.id);
    });
  };
};

function load_options(url, select_name) {
  set_opts(api_call('GET', url), select_name);
};
// draw usres
function normalize_user(user_obj) {
  user_obj.state = api_call('GET', states_url + '/' + user_obj.state_id);
  user_obj.country = api_call('GET', countries_url + '/' + user_obj.country_id);
  user_obj.city = api_call('GET', cities_url + '/' + user_obj.city_id);
  return {
    'Name': user_obj.name,
    'Email': user_obj.email,
    'Phone number': user_obj.phone_number,
    'Country, state, city names': ''.concat([user_obj.country.name, user_obj.city.name, user_obj.state.name]),
    'Creation date': new Date(user_obj.createdAt).toISOString()
  };
};

function render_users_list(users_list_response) {
  let normalized_users = new Array();
  users_list_response.forEach(function (element) {
    let normalized_user = normalize_user(element);
    normalized_users.push(normalized_user);
  });
  return normalized_users;
};

function submitRegistrationFormHandler(form) {

  document.getElementById('users-container').appendChild(buildHtmlTable(render_users_list(fetch_users())));
};


window.onload = function () {
  // INITIALIZE FORM
  load_options(countries_url, 'country');
  load_options(states_url, 'state');
  load_options(cities_url, 'city');

  // hide some fields
  document.getElementById('state').style.visibility = 'hidden';
  document.getElementById('state_label').style.visibility = 'hidden';
  document.getElementById('city').style.visibility = 'hidden';
  document.getElementById('city_label').style.visibility = 'hidden';

  // select country handler
  document.getElementById('country').addEventListener('change', function (ev) {
    var state_select = document.getElementById('state');
    var state_label = document.getElementById('state_label');
    if (ev.target.value == " ") {
      state_select.disabled = true;
    } else {
      state_select.disabled = false;
      state_select.style.visibility = 'visible';
      state_label.style.visibility = 'visible';
    }
  });
  //select state handler
  document.getElementById('state').addEventListener('change', function (ev) {
    var city_select = document.getElementById('city');
    var city_label = document.getElementById('city_label');
    if (ev.target.value == " ") {
      city_select.disabled = true;
    } else {
      city_select.disabled = false;
      city_select.style.visibility = 'visible';
      city_label.style.visibility = 'visible';
    }
  });
  document.getElementById('registration_form').addEventListener('submit', function (event) {
    event.preventDefault();
    if (this.checkValidity() === false) {
      this.classList.add('was-validated');
    } else {
      var request_payload = {};
      for (i = 0; i < this.elements.length; i++) {
        var field = this.elements[i];
        if (field.tagName != 'BUTTON') {
          if (field.name == 'state') {
            request_payload.state_id = field.value;
          } else if (field.name == 'country') {
            request_payload.country_id = field.value;
          } else if (field.name == 'city') {
            request_payload.city_id = field.value;
          } else {
            request_payload[field.name] = field.value;
          }
        }
      };
      //  submit valid form data
      new_user = normalize_user(api_call('POST', users_url, request_payload));

      var tr = _tr_.cloneNode(false);
      for (k in new_user) {
        var td = _td_.cloneNode(false);
        td.appendChild(document.createTextNode(new_user[k] || ''));
        tr.appendChild(td);
      };
      document.getElementById('mytable').appendChild(tr);
      this.reset();
    };
    return false;
  });
};

document.getElementById('users-container').appendChild(buildHtmlTable(render_users_list(fetch_users())));

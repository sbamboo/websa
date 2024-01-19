var url = new URL(window.location.href);
var urlParams = new URLSearchParams(window.location.search);

var markdownUrl = urlParams.get('markdown');
var cssUrl = urlParams.get('css');
var styleP = urlParams.get("style")
var jsonUrl = urlParams.get('json')

var infoMd   = document.getElementById("info-md");
var infoCSS  = document.getElementById("info-css");
var infoJSON = document.getElementById("info-json");
var infoReadme = document.getElementById("info-readme");
var infoTodo = document.getElementById("info-todo");

var defState = "expanded";
var expanded_prefix = '<p id="folderPref">˅</p>';
var collapsed_prefix = '<p id="folderPref">˄</p>';

// Css autofill
function localRedirect(urlObj,where) {
  parts = urlObj.pathname.split("/");
  parts.pop();
  parts.push(where);
  if (parts[0] == "") {
    parts.shift()
  }
  var origin = urlObj.origin;
  if (origin.slice(-1) == "/") {} else {
    origin = origin + "/"
  }
  return origin + parts.join("/");
}
if (urlParams.has("css")) {} else {
  var style = "standardauto";
  if (urlParams.has("style")) {
    style = styleP
  }
  cssUrl = localRedirect(url,"styles/"+ style + ".css");
  urlParams.set("css",cssUrl);
}

// AdditionalInfo autofill
if (urlParams.has('defState')) {
  defState = urlParams.get('defState');
}
if (urlParams.has('markdown')) {
  const infoMd_url = new URL(markdownUrl);
  infoMd.innerHTML = '<p class="addinfo-data">MD:   <a class="css-link" href="' + markdownUrl + '">' + infoMd_url.hostname + '</a></p>'
}
if (urlParams.has('css')) {
  const infoCSS_url = new URL(cssUrl);
  infoCSS.innerHTML = '<p class="addinfo-data">CSS:  <a class="css-link" href="' + cssUrl + '">' + infoCSS_url.hostname + '</a></p>'
}
if (urlParams.has('json')) {
  const infoJSON_url = new URL(jsonUrl);
  infoJSON.innerHTML = '<p class="addinfo-data">JSON: <a class="css-link" href="' + jsonUrl + '">' + infoJSON_url.hostname + '</a></p>'
} else if (urlParams.has('jsonRaw')) {
  infoJSON.innerHTML = '<p class="addinfo-data">JSON: RAW</p>'
}

// AdditionalInfo links
var baseUrl = url.href.replace(url.search,"");
var todoUrl = baseUrl.concat("?markdown=" + localRedirect(url,"todo.md") + "&css=" + localRedirect(url,"styles/standardauto.css") +"&json=" + localRedirect(url,"files.json"))
var readmeUrl = baseUrl.concat("?markdown=" + localRedirect(url,"readme.md") + "&css=" + localRedirect(url,"styles/standardauto.css") +"&json=" + localRedirect(url,"files.json"))
infoTodo.innerHTML = '<p>Readme: <a class="css-link" href="' + todoUrl + '">' + url.origin + '</a></p>'
infoReadme.innerHTML = '<p>Dev Todo: <a class="css-link" href="' + readmeUrl + '">' + url.origin + '</a></p>'

// AdditionalInfo toggle code
var addinfo = document.getElementById("addinfo-toggle");
addinfo.innerHTML = collapsed_prefix + addinfo.textContent

function toggleAdditionalInfo() {
  var btn = document.getElementById("addinfo-toggle");
  var inf = document.getElementById("addinfo");
  if (inf.classList.contains("collapsed-info")) {
    inf.classList.remove("collapsed-info");
    inf.classList.add("expanded-info");
    btn.innerHTML = btn.innerHTML.replace(collapsed_prefix,expanded_prefix)
  } else if (inf.classList.contains("expanded-info")) {
    inf.classList.remove("expanded-info");
    inf.classList.add("collapsed-info");
    btn.innerHTML = btn.innerHTML.replace(expanded_prefix,collapsed_prefix)
  }
}

//Markdown & CSS code
function processMarkdown(data) {
  var converter = new showdown.Converter();
  const html = converter.makeHtml(data);
  document.getElementById('markdown-content').innerHTML = html;
}

function applyCss(css) {
  const blob = new Blob([css], { type: 'text/css' });
  const cssurl = URL.createObjectURL(blob);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = cssurl;
  document.head.appendChild(link);
}

if (cssUrl) {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const css = xhr.responseText;
      applyCss(css);
    }
  };
  xhr.open('GET', cssUrl, true);
  xhr.send();
}

if (markdownUrl) {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      processMarkdown(xhr.responseText);
    }
  };
  xhr.open('GET', markdownUrl, true);
  xhr.send();
}

//Sidebar code
function toggleUlFromButtom(id) {
  var btn = document.getElementById(id);
  var ul = document.getElementById("parent@"+id);
  if (ul.classList.contains('collapsed')) {
    ul.classList.remove('collapsed');
    ul.classList.add('expanded');
    btn.innerHTML = btn.innerHTML.replace(collapsed_prefix,expanded_prefix)
  } else if (ul.classList.contains('expanded')) {
    ul.classList.remove('expanded');
    ul.classList.add('collapsed');
    btn.innerHTML = btn.innerHTML.replace(expanded_prefix,collapsed_prefix)
  }
}
function buildFileTree(jsonData, parent, depth, parentId, preClass) {
  console.log(preClass);
  var ul = document.createElement('ul'); // Create parent ul
  ul.classList.add("no-list-style");
  parent.appendChild(ul);
  if (parentId != "") {
    ul.id = "parent@" + parentId
    ul.classList.add(preClass)
  }

  var ind = 0;
  for (var key in jsonData) {
    ind += 1;
    var value = jsonData[key];
    if (typeof value === 'object') {
      msg = "object at depth: " + depth + ", id: " + String(ind)
      console.log(msg,key,value);
      // Create
      var li = document.createElement('li'); // Folder so create a ul
      var button = document.createElement('button'); // Add an element for our folder
      button.id = "button;object;" + String(depth) + ";" + String(ind);
      li.id = "li;object;" + String(depth) + ";" + String(ind);
      // Add content
      if (preClass == "collapsed") {
        prefix = collapsed_prefix
      } else {
        prefix = expanded_prefix
      }
      button.innerHTML = prefix+'<p id="folderTxt"> 📁'+key+'</p>';
      button.onclick = toggleUlFromButtom.bind(null, button.id);
      button.classList.add("collapseButton");
      button.classList.add("sb-item")
      console.log(button.onclick);
      // Add
      li.appendChild(button);
      ul.appendChild(li);
      buildFileTree(value,li,depth+1,button.id,preClass);
    } else {
      msg = "item at depth: " + depth + ", id: " + String(ind)
      console.log(msg,key,value)
      // Create
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.classList.add("no-text-decoration");
      a.id = "a;item;" + String(depth) + ";" + String(ind);
      li.id = "li;item;" + String(depth) + ";" + String(ind);
      li.classList.add("sb-item")
      // Add content
      a.innerHTML = '<p id="itemTxt"> 📄'+key+'</p>';
      // Handle noNewWindow
      if (value.includes("_blank:")) {
        value = value.replace("_blank:","")
        a.target = '_blank';
      }
      // Add with link
      a.href = value;
      li.appendChild(a);
      ul.appendChild(li);
    }
  }
}

function loadFileTreeFromJson(jsonUrl) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', jsonUrl, true);

  xhr.onload = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      var jsonData = JSON.parse(xhr.responseText);
      var sidebar = document.getElementById('sidebar');
      buildFileTree(jsonData, sidebar.querySelector('#filetree'), 0, "", defState);
    }
  };

  xhr.send();
}

function getFirstH1Text(element, fallback = "page") {
  // Use querySelector to find the first h1 element within the specified element
  var firstH1 = element.querySelector('h1');

  // Check if an h1 element was found
  return firstH1 ? firstH1.textContent : fallback;
}

function addElemForPage(parent) {
  var ul = document.createElement('ul'); // Create parent ul
  ul.classList.add("no-list-style");
  parent.appendChild(ul);
  // Get key & value
  var content = document.getElementById('markdown-content');
  var key = getFirstH1Text(content,"Current Page");
  var value = window.location.href;
  // Generate
  var li = document.createElement('li');
  var a = document.createElement('a');
  a.classList.add("no-text-decoration");
  a.id = "a;item;0;0";
  li.id = "li;item;0;0";
  li.classList.add("sb-item")
  // Add content
  a.innerHTML = '<p id="itemTxt"> 📄'+key+'</p>';
  // Add with link
  a.href = value;
  li.appendChild(a);
  ul.appendChild(li);
}

if (jsonUrl) {
  loadFileTreeFromJson(jsonUrl);
} else {
  if (urlParams.has('jsonRaw')) {
    var jsonrawValue = urlParams.get('jsonRaw');
    try {
      var jsonData = JSON.parse(jsonrawValue);
      var sidebar = document.getElementById('sidebar');
      buildFileTree(jsonData, sidebar.querySelector('#filetree'), 0, "", defState);
    } catch (error) {
      console.log(error);
    }
  } else {
    var sidebar = document.getElementById('sidebar');
    addElemForPage(sidebar.querySelector('#filetree'));
  }
}
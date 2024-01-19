var url = new URL(window.location.href);
var urlParams = new URLSearchParams(window.location.search);

var markdownUrl = urlParams.get('markdown');
var cssUrl = urlParams.get('css');
var styleP = urlParams.get("style")
var jsonUrl = urlParams.get('json')

var infoMd   = document.getElementById("info-md");
var infoCSS  = document.getElementById("info-css");
var infoJSON = document.getElementById("info-json");

var defState = "expanded";
var expanded_prefix = '<p id="folderPref">˅</p>';
var collapsed_prefix = '<p id="folderPref">˄</p>';

// Css autofill
if (urlParams.has("css")) {} else {
  style = "standardauto";
  if (urlParams.has("style")) {
    style = styleP
  }
  parts = url.pathname.split("/");
  parts.pop();
  parts.push("styles/"+ style + ".css");
  if (parts[0] == "") {
    parts.shift()
  }
  cssUrl = url.origin + parts.join("/");
  console.log(cssUrl);
  urlParams.set("css",cssUrl);
}

// AdditionalInfo autofill
if (urlParams.has('defState')) {
  defState = urlParams.get('defState');
}
if (urlParams.has('markdown')) {
  const infoMd_url = new URL(markdownUrl);
  infoMd.innerHTML = '<p class="addinfo-data">MD:   <a href="' + markdownUrl + '">' + infoMd_url.hostname + '</a></p>'
}
if (urlParams.has('css')) {
  const infoCSS_url = new URL(cssUrl);
  infoCSS.innerHTML = '<p class="addinfo-data">CSS:  <a href="' + cssUrl + '">' + infoCSS_url.hostname + '</a></p>'
}
if (urlParams.has('json')) {
  const infoJSON_url = new URL(jsonUrl);
  infoJSON.innerHTML = '<p class="addinfo-data">JSON: <a href="' + jsonUrl + '">' + infoJSON_url.hostname + '</a></p>'
} else if (urlParams.has('jsonRaw')) {
  infoJSON.innerHTML = '<p class="addinfo-data">JSON: RAW</p>'
}

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
      a.id = "a;item;" + String(depth) + ";" + String(ind);
      li.id = "li;item;" + String(depth) + ";" + String(ind);
      li.classList.add("sb-item")
      // Add content
      a.innerHTML = '<p id="itemTxt"> 📄'+key+'</p>';
      // Add with link
      a.href = value;
      a.target = '_blank';
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
  }
}
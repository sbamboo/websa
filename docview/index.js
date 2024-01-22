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
var infoExample = document.getElementById("info-example");

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
var exampleUrl = baseUrl.concat("?markdown=" + localRedirect(url,"testing/examples/readme.md") + "&css=" + localRedirect(url,"styles/standardauto.css") +"&json=" + localRedirect(url,"testing/testing.json"))
infoTodo.innerHTML = '<p>Dev Todo: <a class="css-link" href="' + todoUrl + '">' + url.origin + '</a></p>'
infoReadme.innerHTML = '<p>Readme: <a class="css-link" href="' + readmeUrl + '">' + url.origin + '</a></p>'
infoExample.innerHTML = '<p>Example: <a class="css-link" href="' + exampleUrl + '">' + url.origin + '</a></p>'

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

function addEmptyPageInfo() {
  var content = document.getElementById('markdown-content');
  // Fill page
  var wrapper = document.createElement('div');
  var div = document.createElement('div');
  wrapper.classList.add("no-loaded-page-info-wrapper");
  div.classList.add("no-loaded-page-info");
  div.innerHTML = '<h2>No page loaded</h2><br><p>To view a markdown document on this page ad the <i>?markdown=</i> urlParameter with a link to the document.<br>Alternatively go to the "Additional Info" section in the sidebar and goto Todo or Readme.<br><i>(Incase you have passed json and have a sidebar you can of course use that to view a page)</i></p>';
  wrapper.appendChild(div);
  content.appendChild(wrapper);
}

function buildFileTree(jsonData, parent, depth, parentId, preClass, preTempClass=null) {
  console.log("building file tree: ",preClass,preTempClass);
  var ul = document.createElement('ul'); // Create parent ul
  ul.classList.add("no-list-style");
  parent.appendChild(ul);
  // Overwrite pretempclass if alExpand is set
  if (preTempClass != null && urlParams.has("alExpand")) {
    preTempClass = null;
  }
  // handle class
  if (parentId != "") {
    ul.id = "parent@" + parentId;
    if (preTempClass != null) {
      ul.classList.add(preTempClass);
      preTempClass = null;
    } else {
      ul.classList.add(preClass);
    }
  }

  var ind = 0;
  for (var key in jsonData) {
    ind += 1;
    var value = jsonData[key];
    if (typeof value === 'object') {
      msg = "object at depth: " + depth + ", id: " + String(ind)
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
      // Icon handle
      if (key.includes("noicon:")) {
        console.log("Found noicon in: "+key);
        key = key.replace("noicon:","");
        if (key.includes(";imgst;")) {
          console.log("Found image in: "+key);
          key = key.replace(";imgst;","");
          keyParts = key.split(";imgen;");
          key = '<img src="' + keyParts[0] + '" class="itemname-img" alt="CustomIcon">' + keyParts[1];
        }
      } else {
        key = "📁"+key;
      }
      // Handle collapse/expanded tags
      if (key.includes("collapsed:")) {
        key = key.replace("collapsed:","");
        preTempClass = "collapsed";
        console.log("Found " + preTempClass + " in: "+key);
      } else if (key.includes("expanded:")) {
        key = key.replace("expanded:","");
        preTempClass = "expanded";
        console.log("Found " + preTempClass + " in: "+key);
      }
      // Add content
      button.innerHTML = prefix+'<p id="folderTxt"> '+key+'</p>';
      button.onclick = toggleUlFromButtom.bind(null, button.id);
      button.classList.add("collapseButton");
      button.classList.add("sb-item")
      // Add
      li.appendChild(button);
      ul.appendChild(li);
      buildFileTree(value,li,depth+1,button.id,preClass,preTempClass);
    } else {
      msg = "item at depth: " + depth + ", id: " + String(ind)
      // Create
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.classList.add("no-text-decoration");
      a.id = "a;item;" + String(depth) + ";" + String(ind);
      li.id = "li;item;" + String(depth) + ";" + String(ind);
      li.classList.add("sb-item")
      // Icon handle
      if (key.includes("noicon:")) {
        console.log("Found noicon in: "+key);
        key = key.replace("noicon:","");
        if (key.includes(";imgst;")) {
          console.log("Found image in: "+key);
          key = key.replace(";imgst;","");
          keyParts = key.split(";imgen;");
          key = '<img src="' + keyParts[0] + '" class="itemname-img" alt="CustomIcon">' + keyParts[1];
        }
      } else {
        key = "📄"+key;
      }
      // Add content
      a.innerHTML = '<p id="itemTxt"> '+key+'</p>';
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
      buildFileTree(jsonData, sidebar.querySelector('#filetree'), 0, "", defState, null);
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

function addElemForPage(urlParams,parent) {
  var ul = document.createElement('ul'); // Create parent ul
  ul.classList.add("no-list-style");
  parent.appendChild(ul);
  // Get key & value
  var content = document.getElementById('markdown-content');
  if (urlParams.has('markdown')) {
    var fallback = "Current Page";
  } else {
    var fallback = "Empty Page";
  }
  var key = getFirstH1Text(content,fallback);
  var value = window.location.href;
  // Fill page
  addEmptyPageInfo();
  // Generate
  var li = document.createElement('li');
  var a = document.createElement('a');
  a.classList.add("no-text-decoration");
  a.id = "a;item;0;0";
  li.id = "li;item;0;0";
  li.classList.add("sb-item")
  // Icon handle
  if (key.includes("noicon:")) {
    console.log("Found noicon in: "+key);
    key = key.replace("noicon:","");
    if (key.includes(";imgst;")) {
      console.log("Found imgst in: "+key);
      key = key.replace(";imgst;","");
      keyParts = key.split(";imgen;");
      key = '<img src="' + keyParts[0] + '" class="itemname-img" alt="CustomIcon">' + keyParts[1];
    }
  } else {
    key = "📄"+key;
  }
  // Add content
  a.innerHTML = '<p id="itemTxt"> '+key+'</p>';
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

if (jsonUrl) {
  loadFileTreeFromJson(jsonUrl);
  if (urlParams.has("markdown")) {} else {
    addEmptyPageInfo();
  }
} else {
  if (urlParams.has('jsonRaw')) {
    var jsonrawValue = urlParams.get('jsonRaw');
    try {
      var jsonData = JSON.parse(jsonrawValue);
      var sidebar = document.getElementById('sidebar');
      buildFileTree(jsonData, sidebar.querySelector('#filetree'), 0, "", defState,null);
    } catch (error) {
      console.log(error);
    }
  } else {
    var sidebar = document.getElementById('sidebar');
    addElemForPage(urlParams,sidebar.querySelector('#filetree'));
  }
}
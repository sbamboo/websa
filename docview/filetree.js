function buildFileTree(jsonData, parent) {
    var ul = document.createElement('ul');
    parent.appendChild(ul);

    for (var key in jsonData) {
      var value = jsonData[key];

      if (typeof value === 'object') {
        // Folder
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.textContent = "📁"+key;
        li.appendChild(a);
        ul.appendChild(li);
        buildFileTree(value, li);
      } else {
        // File
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.textContent = "📄"+key;
        a.href = value;
        a.target = '_blank';
        li.appendChild(a);
        ul.appendChild(li);
        
        // Add click event listener to files to redirect to the URL
        a.addEventListener('click', function(e) {
          e.preventDefault();
          window.location.href = this.href;
        });
      }
      
      // Add click event listener to folders to render the sidebar
      if (typeof value === 'object') {
        a.addEventListener('click', function(e) {
          e.preventDefault();
          renderSidebar(value);
        });
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
        buildFileTree(jsonData, sidebar.querySelector('#filetree'));
      }
    };

    xhr.send();
  }
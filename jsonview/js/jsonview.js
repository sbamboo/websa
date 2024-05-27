document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const jsonUrl = decodeURIComponent(urlParams.get('url'));
    const collapsedDefault = urlParams.get('collapsed') === 'true';
    const decorateExpanded = urlParams.get('decorate-expanded') === 'true';
    const alternativeSymbols = urlParams.get('altsym') === 'true';
    const retUrl = decodeURIComponent(urlParams.get('return-url'));
    const retUrlSym = urlParams.get('return-sym');

    if (jsonUrl) {
        fetch(jsonUrl)
            .then(response => response.json())
            .then(data => {
                const container = document.getElementById('jsonViewer');
                displayJson(data, container, collapsedDefault, decorateExpanded, alternativeSymbols);
            })
            .catch(error => {
                console.error('Error fetching the JSON file:', error);
            });
    } else {
        console.error('No URL parameter provided.');
    }

    const topbar = document.getElementById("topbar");
    const returnContainer = document.createElement("div");
    const returnBtn = document.createElement("a");
    returnContainer.classList.add("returnbtn-wrapper");
    returnBtn.classList.add("returnbtn");
    if (retUrl) {
        returnBtn.href = retUrl;
    } else if (retUrl === "history-back") {
        returnBtn.onclick = () => { window.history.back(); };
    }
    if (retUrlSym) {
        returnBtn.innerText = retUrlSym;
    } else {
        if (alternativeSymbols === true) {
            returnBtn.innerText = "⟪";
            returnBtn.style.paddingLeft = "10px";
            returnBtn.style.paddingRight = "11px";
            returnBtn.style.paddingTop = "3px";
        } else {
            returnBtn.innerText = "« Back";
            returnBtn.style.fontSize = "16px"
        }
    }
    returnContainer.appendChild(returnBtn);
    topbar.appendChild(returnContainer);
});

function displayJson(obj, parentElement, collapsedDefault, decorateExpanded, alternativeSymbols) {
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            const propertyDiv = document.createElement('div');
            propertyDiv.classList.add('property');
            const dataType = typeof obj[key];
            if (dataType === 'object' && obj[key] !== null) {
                propertyDiv.classList.add(Array.isArray(obj[key]) ? 'list' : 'obj');
            } else if (dataType === 'number') {
                propertyDiv.classList.add(Number.isInteger(obj[key]) ? 'int' : 'float');
            } else if (dataType === 'string') {
                const isUrl = /^https?:\/\/\S+$/i.test(obj[key]);
                if (isUrl) {
                    propertyDiv.classList.add('link');
                    if (/\.png$|\.jpg$|\.jpeg$|\.gif$/i.test(obj[key])) {
                        propertyDiv.classList.add('isimage');
                    }
                } else {
                    propertyDiv.classList.add('string');
                }
                if (/^data:image\/(png|jpg|jpeg|gif);base64,/.test(obj[key])) {
                    propertyDiv.classList.add('isimage');
                }
            } else {
                propertyDiv.classList.add(dataType);
            }

            const keySpan = document.createElement('span');
            keySpan.classList.add('key');
            keySpan.textContent = key;

            const delimSpan = document.createElement('span');
            delimSpan.classList.add('delim');
            delimSpan.textContent = ': ';

            propertyDiv.appendChild(keySpan);
            propertyDiv.appendChild(delimSpan);

            const topDeco = document.createElement("span");
            topDeco.classList.add("expanded-decoration-top");
            topDeco.style.display = "none";
            if (decorateExpanded === true) {
                if (Array.isArray(obj[key])) {
                    topDeco.innerText = "[";
                } else {
                    topDeco.innerText = "{";
                }
            }

            const botDeco = document.createElement("span");
            botDeco.classList.add("expanded-decoration-bottom");
            botDeco.style.display = "none";
            if (decorateExpanded === true) {
                if (Array.isArray(obj[key])) {
                    botDeco.innerText = "]";
                } else {
                    botDeco.innerText = "}";
                }
            }

            propertyDiv.appendChild(topDeco);

            let previewToggleSpan;
            let valueWrapper;

            if (propertyDiv.classList.contains('isimage')) {
                previewToggleSpan = document.createElement('span');
                previewToggleSpan.classList.add('preview-toggle');
                previewToggleSpan.textContent = '(show preview) ';
                propertyDiv.appendChild(previewToggleSpan);
                propertyDiv.appendChild(document.createElement("br"));

                valueWrapper = document.createElement("div");
                valueWrapper.classList.add("value-wrapper");
                propertyDiv.appendChild(valueWrapper)
            }
            

            const contentDiv = document.createElement('div');
            contentDiv.classList.add('content');
            let isSingleLine = false;

            const collapsible = document.createElement('span');
            if (alternativeSymbols === true) {
                collapsible.classList.add("altsym");
            }
            propertyDiv.insertBefore(collapsible, keySpan);

            if (dataType === 'object' && obj[key] !== null) {
                collapsible.classList.add('collapsible');
                if (collapsedDefault) {
                    collapsible.classList.add('collapsed');
                } else {
                    collapsible.classList.add('expanded');
                }
                displayJson(obj[key], contentDiv, collapsedDefault, decorateExpanded, alternativeSymbols);

                const placeholderSpan = document.createElement('span');
                placeholderSpan.classList.add('placeholder');
                if (Array.isArray(obj[key])) {
                    placeholderSpan.textContent = '[...]';
                } else {
                    placeholderSpan.textContent = '{...}';
                }

                if (collapsedDefault) {
                    contentDiv.style.display = 'none';
                    placeholderSpan.style.display = 'inline';
                } else {
                    placeholderSpan.style.display = 'none';
                }

                const toggleDisplay = () => {
                    if (collapsible.classList.contains('collapsed')) {
                        collapsible.classList.remove('collapsed');
                        collapsible.classList.add('expanded');
                        contentDiv.style.display = 'block';
                        placeholderSpan.style.display = 'none';
                        if (decorateExpanded === true) {
                            topDeco.style.display = "inline";
                            botDeco.style.display = "block";
                        }
                    } else {
                        collapsible.classList.remove('expanded');
                        collapsible.classList.add('collapsed');
                        contentDiv.style.display = 'none';
                        placeholderSpan.style.display = 'inline';
                        if (decorateExpanded === true) {
                            topDeco.style.display = "none";
                            botDeco.style.display = "none";
                        }
                    }
                };

                collapsible.addEventListener('click', toggleDisplay);
                placeholderSpan.addEventListener('click', toggleDisplay);

                if (propertyDiv.classList.contains('isimage')) {
                    valueWrapper.appendChild(placeholderSpan);
                    valueWrapper.appendChild(contentDiv);
                } else {
                    propertyDiv.appendChild(placeholderSpan);
                    propertyDiv.appendChild(contentDiv);
                }
            } else {
                collapsible.classList.add("indent");
                const value = obj[key];
                let valueElement;
                if (propertyDiv.classList.contains('link')) {
                    valueElement = document.createElement('a');
                    valueElement.classList.add('value');
                    valueElement.href = value;
                    valueElement.textContent = getDomainFromUrl(value);
                    valueElement.target = '_blank';
                } else {
                    valueElement = document.createElement('span');
                    valueElement.classList.add('value');
                    valueElement.textContent = value;
                }

                if (typeof value === 'string' && value.includes('\n')) {
                    contentDiv.textContent = value;
                    const textCollapsible = document.createElement('span');
                    textCollapsible.classList.add('collapsible');
                    if (collapsedDefault) {
                        textCollapsible.classList.add('collapsed');
                    } else {
                        textCollapsible.classList.add('expanded');
                    }
                    propertyDiv.insertBefore(textCollapsible, keySpan);

                    if (propertyDiv.classList.contains('isimage')) {
                        valueWrapper.appendChild(contentDiv);
                    } else {
                        propertyDiv.appendChild(contentDiv);
                    }

                    const placeholderSpan = document.createElement('span');
                    placeholderSpan.classList.add('placeholder');
                    placeholderSpan.textContent = '...';

                    if (collapsedDefault) {
                        contentDiv.style.display = 'none';
                        placeholderSpan.style.display = 'inline';
                    } else {
                        placeholderSpan.style.display = 'none';
                    }

                    textCollapsible.addEventListener('click', () => {
                        if (textCollapsible.classList.contains('collapsed')) {
                            textCollapsible.classList.remove('collapsed');
                            textCollapsible.classList.add('expanded');
                            contentDiv.style.display = 'block';
                            placeholderSpan.style.display = 'none';
                        } else {
                            textCollapsible.classList.remove('expanded');
                            textCollapsible.classList.add('collapsed');
                            contentDiv.style.display = 'none';
                            placeholderSpan.style.display = 'inline';
                        }
                    });

                    placeholderSpan.addEventListener('click', () => {
                        if (textCollapsible.classList.contains('collapsed')) {
                            textCollapsible.classList.remove('collapsed');
                            textCollapsible.classList.add('expanded');
                            contentDiv.style.display = 'block';
                            placeholderSpan.style.display = 'none';
                        } else {
                            textCollapsible.classList.remove('expanded');
                            textCollapsible.classList.add('collapsed');
                            contentDiv.style.display = 'none';
                            placeholderSpan.style.display = 'inline';
                        }
                    });

                    if (propertyDiv.classList.contains('isimage')) {
                        valueWrapper.appendChild(placeholderSpan);
                    } else {
                        propertyDiv.appendChild(placeholderSpan);
                    }
                } else {
                    isSingleLine = true;
                }
                if (propertyDiv.classList.contains('isimage')) {
                    valueWrapper.appendChild(valueElement);
                } else {
                    propertyDiv.appendChild(valueElement);
                }
            }

            if (propertyDiv.classList.contains('isimage')) {
                const imageDiv = document.createElement('div');
                imageDiv.classList.add('image-preview');
                imageDiv.style.display = 'none';
            
                const image = document.createElement('img');
                image.src = obj[key];
                imageDiv.appendChild(image);
                valueWrapper.appendChild(imageDiv);
            
                previewToggleSpan.addEventListener('click', () => {
                    if (previewToggleSpan.textContent === '(show preview) ') {
                        previewToggleSpan.textContent = '(hide preview) ';
                        imageDiv.style.display = 'block';
                        imageDiv.addEventListener('click', () => {
                            if (previewToggleSpan.textContent !== '(show preview) ') {
                                previewToggleSpan.textContent = '(show preview) ';
                                imageDiv.style.display = 'none';
                                if (propertyDiv.classList.contains("image-preview-expanded")) {
                                    propertyDiv.classList.remove("image-preview-expanded");
                                }
                            }
                        });
                        propertyDiv.classList.add("image-preview-expanded");
                    } else {
                        previewToggleSpan.textContent = '(show preview) ';
                        imageDiv.style.display = 'none';
                        if (propertyDiv.classList.contains("image-preview-expanded")) {
                            propertyDiv.classList.remove("image-preview-expanded");
                        }
                    }
                });
            }

            parentElement.appendChild(propertyDiv);

            propertyDiv.appendChild(botDeco);
            
        }
    }
}


function getDomainFromUrl(url) {
    try {
        const urlObj = new URL(url);
        const path = urlObj.pathname;
        const isFile = path.includes('.') && !path.endsWith('/');
        if (isFile) {
            let fileName = path.substring(path.lastIndexOf('/') + 1);
            const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
            if (fileName.length > 20) {
                fileName = fileName.substring(0, 20) + '...' + fileExtension;
            }
            return `${urlObj.hostname}/.../${fileName}`;
        } else {
            return urlObj.hostname;
        }
    } catch (e) {
        return url; // Fallback in case of an invalid URL
    }
}

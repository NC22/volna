/* 
    default system tools
    KellyTools v1.0
*/

function gid(n) {
    return document.getElementById(n);
}

function lloc(n) {
    return typeof ENVDATA["loc_" + ENVDATA.lng][n] == 'undefined' ? n : ENVDATA["loc_" + ENVDATA.lng][n];
}   

KellyTools = { cLock : false, spoilEvents : [], version : false };

KellyTools.locked = function(silent) {
    if (KellyTools.cLock !== false) {
        if (!silent) KellyTools.showNotice(KellyTools.cLock == true ? 'Дождитесь окончания операции...' : KellyTools.cLock); 
        return true;
    } else return false;        
};

   
KellyTools.updateSpoilerBounds = function() {
    var swrap = document.querySelectorAll('.k-options-additions-wrap.show');
    for (var i = 0; i < swrap.length; i++) {
        swrap[i].style.maxHeight = (swrap[i].children[0].getBoundingClientRect().height + 6) + 'px';
    }
};

KellyTools.initSpoilers = function() {
    
    var sEvents = KellyTools.spoilEvents;    
    for (var i = 0; i < sEvents.length; i++) sEvents[i][0].removeEventListener('click', sEvents[i][1]);
    
    KellyTools.spoilEvents = [];
    var spoilers = document.getElementsByClassName('k-options-additions-show');
    var sclick = function(e) {
            
            if (e.target.classList.contains('k-options-row-help')) {
                KellyTools.showNotice(lloc(e.target.getAttribute('data-help')));
                return false;
            }
            
            for (var i = 0; i < spoilers.length; i++) {
                if (spoilers[i] != this) {
                    var t = document.getElementById(spoilers[i].getAttribute('data-for'));
                        t.classList.remove('show');
                        t.style.maxHeight = '';
                }
            }
            
            var additions = document.getElementById(this.getAttribute('data-for'));
            if (additions.classList.contains('show')) {
                
              additions.classList.remove('show');
              additions.style.maxHeight = '';
              
            } else {
                
               additions.classList.add('show'); 
            }
            
            KellyTools.updateSpoilerBounds();
    };
        
    for (var i = 0; i < spoilers.length; i++) {        
        spoilers[i].addEventListener('click', sclick);  
        KellyTools.spoilEvents.push([spoilers[i], sclick]);
    }
};
    
KellyTools.showTitle = function(subpage) {
    document.title = subpage ? lloc('title') + ' - ' + subpage : lloc('title');
    
    var host = "kelly.catface.ru/";
    if (lloc('title').indexOf('2BW42') != -1) host = "volna42.com/author/?from=webui";    
    
    var html =  '<a href="/" class="kelly-app-name">' + lloc('title') + (KellyTools.version ? ' <span class="kelly-app-version">v' + KellyTools.version : '') + '</span></a>';
        html += '<span class="kelly-copyright">created by <a href="https:/' + '/' + host + '" target="_blank">nradiowave</a></span>';
        
    document.getElementById('header').innerHTML = html;
};
    
KellyTools.downloadFile = function(data, name, mime) {
    
     var link = document.createElement("A");
         link.style.display = 'none';
         link.onclick = function() {
        
            var url = window.URL.createObjectURL(new Blob([data], {type: mime}));
            
            this.href = url;
            this.download = name;
            
            setTimeout(function() {  window.URL.revokeObjectURL(url);  }, 4000); // link.parentElement.removeChild(link); 
        };
        
        link.click();
};
    
KellyTools.showNotice = function(notice, error, onDomUpdated) {
    
    if (!onDomUpdated) onDomUpdated = function() {};
    var result = gid('result'); 
    
    if (!KellyTools.noticeInit) {
        
        KellyTools.noticeInit = true;
        
        document.addEventListener('click', function (e) {
             if (result.classList.contains('show')) {
                if (e.target.id == 'result-close' || !KellyTools.getParentByClass(e.target, 'notice')) KellyTools.showNotice(false);
             }
        });
    }
           
    if (notice) {
        
        if (result.classList.contains('show')) {
            
            KellyTools.showNotice(false);
            setTimeout(function() { KellyTools.showNotice(notice, error); }, 500);
            return;
        }
        
        result.children[1].innerHTML = notice;
        onDomUpdated();
        setTimeout(function() { result.style.bottom = '12px'; result.classList.add('show'); }, 100);      
        
        error ? result.classList.add('error') : result.classList.remove('error'); 
        
    } else {
        
        result.style.bottom = "-" + result.getBoundingClientRect().height + "px";
        result.classList.remove('show');
    }
};

KellyTools.getExt = function(str) {
    
    if (!str) return '';
    var dot = str.lastIndexOf('.');
    if (dot === -1) return '';
    
    var ext =  str.substr(dot).split(".");
    if (ext.length < 2) return '';
    
    ext = ext[1];
    return ext.toLocaleLowerCase().trim();
};

KellyTools.validateInt = function(val) {

    if (typeof val == 'number') return val;
    if (!val) return 0;
    
    val = val.trim();
    val = parseInt(val);
    
    if (isNaN(val) || !val) return 0;
    return val;    
};
    
KellyTools.validateFloat = function(val) {

    if (typeof val == 'number') return val;
    if (!val) return 0.0;
    
    val = val.trim();
    val = val.replace(',', '.');
    val = parseFloat(val);
    
    if (isNaN(val) || !val) return 0.0;
    
    return val;    
};
 
KellyTools.detectLanguage = function() {

    var language = window.navigator.userLanguage || window.navigator.language;
    if (typeof ENVDATA.cfgSaved != 'undefined' && typeof ENVDATA.cfgSaved["__LOCALE"] != 'undefined') {
        language = ENVDATA.cfgSaved["__LOCALE"];
    }
    
    if (language) {
        if (language.indexOf('-') != -1) language = language.split('-')[0];            
        language = language.trim();

        ENVDATA.lng = language;
        
    } else ENVDATA.lng = 'en';
    
    if (typeof ENVDATA["loc_" + ENVDATA.lng] == "undefined") {
        ENVDATA["loc_" + ENVDATA.lng] = ENVLOCALE;        
    }
    
    return ENVDATA.lng;
};

KellyTools.getParentByClass = function(el, className) {
    
    var parent = el; 
    while (parent && !parent.classList.contains(className)) {
        parent = parent.parentElement;
    }
    
    return parent;
};
    
KellyTools.cfetch = function(url, cfg, callback, aCfg) {
    
     var frequest = {controller : new AbortController()};     
     cfg.signal = frequest.controller.signal;
     
     fetch(url, cfg).then(function(response) {
        
        clearTimeout(frequest.timeout);
        
        if (response.status == 200) {
            
                 if (cfg.responseType == 'blob') return response.blob().then(callback);
            else if (cfg.responseType == 'json') return response.json().then(callback);
            else if (cfg.responseType == 'text') return response.text().then(callback);
            else if (cfg.responseType == 'binary' || cfg.responseType == 'arrayBuffer') return response.arrayBuffer().then(callback);

        } else {
            
            callback(false, 'Устройство не доступно ' + response.status);
        }        
        
    }).then(function(text) {})
    .catch(function(error) {
        clearTimeout(frequest.timeout);
        callback(false, error);
    }); 
    
    frequest.abort = function(bytimeout) {
        if (!frequest.controller) return;
        frequest.controller.abort();
        frequest.controller = false;
        
        if (bytimeout) debugger;
    };
    
    frequest.timeout = setTimeout(function() {
        frequest.abort(true);
    }, aCfg && aCfg.timeout ? aCfg.timeout : 10000); 
  
    return frequest;
};
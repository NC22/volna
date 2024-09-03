
KellyTools.getSelectWidget = function(cfg) {
                        
    var wg = {}; 
        wg.create = function(cfg) {
            
            wg.cfg = cfg;
            if (cfg.list) wg.list = cfg.list;
            wg.inputEl = gid(cfg.inputId);  
            wg.selected = [];
            wg.valueIndex = wg.cfg.valueIndex ? wg.cfg.valueIndex : 0;
            wg.containerEl = gid(cfg.cId);
        };
        
        wg.commit = function() {
            
            var result = '';
            for (var i = 0; i < wg.selected.length; i++) {
                result += (result ? ',' : '') + wg.list[i][wg.valueIndex];
                if (!wg.cfg.multiselect) break;
            }
            if (wg.inputEl) {
                wg.inputEl.setAttribute('data-updated', '1');
                wg.inputEl.value = result;
            }
        };
        
        wg.updateList = function() {
            
            wg.containerEl.innerHTML = '';
            
            if (wg.lastError) {
                
                wg.containerEl.innerText = 'Не удалось загрузить список : ' + wg.lastError;
                
            } else if (!wg.list) {
                
                wg.containerEl.innerText = 'Ошибка обработки данных списка';
                
            } else if (wg.list.length > 0) {
                
                var html = '';
                for (var i = 0; i < wg.list.length; i++) {
                    
                    var htmlTitle = wg.cfg.tpl;
                    for (var b = 0; b < wg.list[i].length; b++) {
                        htmlTitle = htmlTitle.replace('#' + b + '#', wg.list[i][b]);
                    }
                    
                    htmlTitle = htmlTitle.replace('#index#', i);
                    
                    html += '<li class="dselect-item' + (wg.selected.indexOf(i) != -1 ? ' selected' : '') + '" data-index="' + i + '" data-value="' + wg.list[i][wg.valueIndex] +'">';
                    html += htmlTitle + '</li>';
                }
                
                wg.containerEl.innerHTML = html;
                var items = wg.containerEl.getElementsByClassName('dselect-item');
                for (var i = 0; i < items.length; i++) {                        
                    items[i].onclick = function() {
                        
                        var index = parseInt(this.getAttribute('data-index'));
                        if (wg.selected.indexOf(index) == -1) {
                            if (wg.cfg.multiselect) wg.selected.push(index);
                            else wg.selected = [index];
                        } else {
                            if (wg.cfg.multiselect) wg.selected.splice(index, 1);
                            else wg.selected = [];
                        }
                        
                        wg.commit();
                        if (wg.cfg.onSelectItem && wg.cfg.onSelectItem(wg, this, wg.selected.indexOf(index) == -1 ? false : true)) return false;
                                                
                        wg.updateList();
                    };
                }
                
            }
            
            if (wg.cfg.onUpdate) wg.cfg.onUpdate(wg);
        };
        
        wg.show = function(onLoaded) {
            
            if (typeof onLoaded == 'undefined') onLoaded = function() {};
            
            wg.containerEl.classList.add('shown');
            if (wg.containerEl.classList.contains('loading')) return;
            if (!wg.list) {
                 
                 wg.containerEl.classList.add('loading');
                 wg.lastError = false;
                 
                 if (wg.cfg.onUpdate) wg.cfg.onUpdate(wg);
                 
                 KellyTools.cfetch(wg.cfg.getListUrl, {method: 'GET', responseType : 'json'}, function(response, error) {
                     wg.containerEl.classList.remove('loading');
                     if (response) {
                         
                         if (wg.cfg.onLoadList) response = wg.cfg.onLoadList(wg, response);
                         
                         wg.list = response;
                         wg.updateList();
                         onLoaded(true);
                        
                     } else {
                         
                         wg.list = [];
                         wg.lastError = error;
                         console.log('List error : ' + error);
                         wg.updateList();
                         onLoaded(false);
                     }
                     
                 });
            } else {
                onLoaded(true);
                wg.updateList();
            }
            
            return false;
        };
        
        wg.create(cfg);
        return wg;
};

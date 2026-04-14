(function () {
    var G = window || this;
    var even = G.BLOG.even || 'click';
    var $ = function (id) { return document.getElementById(id.replace('#', '')); };
    
    var searchIco = $('#search');
    var searchWrap = $('#search-wrap');
    var keyInput = $('#key');
    var back = $('#back');
    var searchPanel = $('#search-panel');
    var searchResult = $('#search-result');
    var searchTpl = $('#search-tpl').innerHTML;
    var JSON_DATA = (G.BLOG.ROOT + '/content.json').replace(/\/{2}/g, '/');
    var searchData;

    if (!searchIco || !searchWrap || !keyInput) return;

    function loadData(success) {
        if (!searchData) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', JSON_DATA, true);
            xhr.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    var res = JSON.parse(this.response);
                    searchData = res instanceof Array ? res : res.posts;
                    success(searchData);
                } else {
                    console.error(this.statusText);
                }
            };
            xhr.onerror = function () { console.error(this.statusText); };
            xhr.send();
        } else {
            success(searchData);
        }
    }

    function tpl(html, data) {
        return html.replace(/\{\w+\}/g, function (str) {
            var prop = str.replace(/\{|\}/g, '');
            return data[prop] || '';
        });
    }

    var Control = {
        show: function () {
            if (window.innerWidth < 760) document.documentElement.classList.add('lock-size');
            if (searchPanel) searchPanel.classList.add('in');
        },
        hide: function () {
            if (window.innerWidth < 760) document.documentElement.classList.remove('lock-size');
            if (searchPanel) searchPanel.classList.remove('in');
        }
    };

    function render(data) {
        var html = '';
        if (data.length) {
            html = data.map(function (post) {
                return tpl(searchTpl, {
                    title: post.title,
                    path: (G.BLOG.ROOT + '/' + post.path).replace(/\/{2,}/g, '/'),
                    date: new Date(post.date).toLocaleDateString(),
                    tags: post.tags.map(function (tag) {
                        return '<span>#' + tag.name + '</span>';
                    }).join('')
                });
            }).join('');
        } else {
            html = '<li class="tips"><i class="icon icon-coffee icon-3x"></i><p>Results not found!</p></li>';
        }
        searchResult.innerHTML = html;
    }

    function doSearch(e) {
        var key = keyInput.value.trim();
        if (!key) {
            searchResult.innerHTML = '';
            Control.hide();
            return;
        }

        var regExp = new RegExp(key.replace(/[ ]/g, '|'), 'gmi');
        loadData(function (data) {
            var result = data.filter(function (post) {
                return regExp.test(post.title) || post.tags.some(function (tag) {
                    return regExp.test(tag.name);
                }) || regExp.test(post.text);
            });
            render(result);
            Control.show();
        });
        if (e) e.preventDefault();
    }

    searchIco.addEventListener(even, function () {
        searchWrap.classList.toggle('in');
        keyInput.value = '';
        searchResult.innerHTML = '';
        Control.hide();
        searchWrap.classList.contains('in') ? keyInput.focus() : keyInput.blur();
    });

    back.addEventListener(even, function () {
        searchWrap.classList.remove('in');
        Control.hide();
    });

    document.addEventListener(even, function (e) {
        if (e.target.id !== 'key' && even === 'click') {
            Control.hide();
        }
    });

    keyInput.addEventListener('keyup', doSearch);

}).call(this);

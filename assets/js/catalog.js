(function () {
    function initCatalog(root) {
        root.querySelectorAll('.tab').forEach(function (tab) {
            tab.addEventListener('click', function () {
                root.querySelectorAll('.tab').forEach(function (t) {
                    t.classList.remove('active');
                });
                tab.classList.add('active');
                var view = tab.getAttribute('data-view');
                root.querySelectorAll('.view').forEach(function (v) {
                    v.classList.toggle('active', v.getAttribute('data-view') === view);
                });
            });
        });

        root.querySelectorAll('.subtab').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var view = btn.closest('.view');
                if (!view) return;
                view.querySelectorAll('.subtab').forEach(function (b) {
                    b.classList.remove('active');
                });
                btn.classList.add('active');
                var mode = btn.getAttribute('data-mode');
                view.querySelectorAll('.mode').forEach(function (m) {
                    m.classList.toggle('active', m.getAttribute('data-mode') === mode);
                });
            });
        });

        var floorSelect = root.querySelector('[data-view="floor"] select');
        if (floorSelect) {
            floorSelect.addEventListener('change', function () {
                var val = this.value;
                root.querySelectorAll('[data-view="floor"] [data-floor]').forEach(function (el) {
                    el.classList.toggle('active', el.getAttribute('data-floor') === val);
                });
            });
        }

        function initRange(range) {
            var inputs = range.querySelectorAll('input[type=range]');
            var minInput = inputs[0], maxInput = inputs[1];
            if (!minInput || !maxInput) return;
            var fill = range.querySelector('.fill');
            var labels = range.querySelectorAll(':scope > span');
            var min = parseFloat(minInput.min), max = parseFloat(minInput.max);
            var suffix = range.getAttribute('data-suffix') || '';

            function fmt(v) {
                return Number(v).toLocaleString('ru-RU') + suffix;
            }

            function update() {
                var a = parseFloat(minInput.value), b = parseFloat(maxInput.value);
                if (a > b) {
                    var t = a;
                    a = b;
                    b = t;
                }
                var pa = (a - min) / (max - min) * 100;
                var pb = (b - min) / (max - min) * 100;
                if (fill) {
                    fill.style.left = pa + '%';
                    fill.style.width = (pb - pa) + '%';
                }
                if (labels[0]) labels[0].textContent = 'от ' + fmt(minInput.value);
                if (labels[1]) labels[1].textContent = 'до ' + fmt(maxInput.value);
            }

            minInput.addEventListener('input', update);
            maxInput.addEventListener('input', update);
            update();
        }

        root.querySelectorAll('.range').forEach(initRange);

        function within(el) {
            return (el && root.contains(el)) ? el : null;
        }

        function setActiveFloorTrigger(floorNum) {
            root.querySelectorAll('.building-slid-click.active').forEach(function (g) {
                g.classList.remove('active');
            });
            if (floorNum == null) return;
            var g = root.querySelector('.building-slid-click[data-floor="' + floorNum + '"]');
            if (g) g.classList.add('active');
        }

        var STATUS_LABEL = { free: 'Свободна', reserved: 'Забронирована', sold: 'Продана' };

        function fillPanelFromCell(panel, cell) {
            var ps = cell.querySelectorAll('p');
            var line1 = ps[0] ? ps[0].textContent.trim() : '';
            var price = ps[1] ? ps[1].textContent.trim() : '';
            var statusLabel = ps[2] ? ps[2].textContent.trim() : '';
            var finish = ps[3] ? ps[3].textContent.trim() : '';
            var numMatch = line1.match(/№(\d+)/);
            var num = numMatch ? numMatch[1] : '';
            var areaMatch = line1.match(/([\d.,]+)\s*м²/);
            var area = areaMatch ? areaMatch[1] + ' м²' : '';
            var row = cell.closest('.chessrow');
            var floorLabel = row ? row.querySelector('p') : null;
            var floor = floorLabel ? floorLabel.textContent.trim() : '';
            var status = 'free';
            if (cell.classList.contains('reserved')) status = 'reserved';
            else if (cell.classList.contains('sold')) status = 'sold';

            function setText(field, value) {
                var el = panel.querySelector('[data-field="' + field + '"]');
                if (el) el.textContent = value;
            }
            setText('title', 'Квартира ' + line1);
            setText('price', price);
            setText('area', area);
            setText('num', num);
            setText('entrance', '1');
            setText('floor', floor);
            setText('finish', finish);
            var statusEl = panel.querySelector('[data-field="status"]');
            if (statusEl) {
                statusEl.textContent = statusLabel;
                statusEl.className = 'status ' + status;
            }
            var planEl = panel.querySelector('[data-field="plan"]');
            if (planEl) {
                planEl.setAttribute('src', './assets/img/atc-1.png');
                planEl.setAttribute('alt', 'Планировка квартиры №' + num);
            }
        }

        function fillPanelFromTile(panel, tile) {
            var tip = tile.querySelector('.tip');
            var ps = tip ? tip.querySelectorAll('p') : [];
            var line1 = ps[0] ? ps[0].textContent.trim() : '';
            var price = ps[1] ? ps[1].textContent.trim() : '';
            var statusLabel = ps[2] ? ps[2].textContent.trim() : '';
            var finishEl = tile.querySelector('.finish');
            var finish = finishEl ? finishEl.textContent.trim() : '';
            var floorEl = tile.querySelector('.floor');
            var floor = floorEl ? floorEl.textContent.trim() : '';
            var numMatch = line1.match(/№(\d+)/);
            var num = numMatch ? numMatch[1] : '';
            var areaMatch = line1.match(/([\d.,]+)\s*м²/);
            var area = areaMatch ? areaMatch[1] + ' м²' : '';
            var status = 'free';
            if (tile.classList.contains('reserved')) status = 'reserved';
            else if (tile.classList.contains('sold')) status = 'sold';

            function setText(field, value) {
                var el = panel.querySelector('[data-field="' + field + '"]');
                if (el) el.textContent = value;
            }
            setText('title', 'Квартира ' + line1);
            setText('price', price);
            setText('area', area);
            setText('num', num);
            setText('entrance', '1');
            setText('floor', floor);
            setText('finish', finish);
            var statusEl = panel.querySelector('[data-field="status"]');
            if (statusEl) {
                statusEl.textContent = statusLabel;
                statusEl.className = 'status ' + status;
            }
            var planEl = panel.querySelector('[data-field="plan"]');
            if (planEl) {
                planEl.setAttribute('src', './assets/img/atc-1.png');
                planEl.setAttribute('alt', 'Планировка квартиры №' + num);
            }
        }

        function fillPanelFromPricedTile(panel, tile) {
            var priceEl = tile.querySelector('span');
            var price = priceEl ? priceEl.textContent.trim() : '';
            var full = tile.textContent.trim();
            var numText = price ? full.slice(0, full.indexOf(price)).trim() : full;
            var numMatch = numText.match(/№(\d+)/);
            var num = numMatch ? numMatch[1] : '';
            var status = 'free';
            if (tile.classList.contains('reserved')) status = 'reserved';
            else if (tile.classList.contains('sold')) status = 'sold';
            var statusLabel = STATUS_LABEL[status] || '';

            function setText(field, value) {
                var el = panel.querySelector('[data-field="' + field + '"]');
                if (el) el.textContent = value;
            }
            setText('title', num ? 'Квартира №' + num : '');
            setText('price', price);
            setText('area', '');
            setText('num', num);
            setText('entrance', '1');
            setText('floor', '');
            setText('finish', '');
            var statusEl = panel.querySelector('[data-field="status"]');
            if (statusEl) {
                statusEl.textContent = statusLabel;
                statusEl.className = 'status ' + status;
            }
            var planEl = panel.querySelector('[data-field="plan"]');
            if (planEl) {
                planEl.setAttribute('src', './assets/img/atc-1.png');
                planEl.setAttribute('alt', num ? 'Планировка квартиры №' + num : '');
            }
        }

        root.addEventListener('click', function (e) {
            var closeBtn = within(e.target.closest('.close'));
            if (closeBtn) {
                var p = closeBtn.closest('.panel');
                if (p) p.classList.remove('active');
                setActiveFloorTrigger(null);
                return;
            }
            var navBtn = within(e.target.closest('.navfloor'));
            if (navBtn) {
                var currentPanel = navBtn.closest('.panel');
                if (!currentPanel) return;
                var dir = parseInt(navBtn.getAttribute('data-dir'), 10);
                var target = parseInt(currentPanel.getAttribute('data-floor'), 10) + dir;
                var targetPanel = root.querySelector('.building-slid-svg .panel[data-floor="' + target + '"]');
                root.querySelectorAll('.panel.active').forEach(function (p) {
                    p.classList.remove('active');
                });
                if (targetPanel) targetPanel.classList.add('active');
                setActiveFloorTrigger(target);
                return;
            }
            var slideTrigger = within(e.target.closest('.building-slid-click'));
            if (slideTrigger) {
                var floorNum = slideTrigger.getAttribute('data-floor');
                var slidePanel = root.querySelector('.building-slid-svg .panel[data-floor="' + floorNum + '"]');
                root.querySelectorAll('.panel.active').forEach(function (p) {
                    if (p !== slidePanel) p.classList.remove('active');
                });
                if (slidePanel) slidePanel.classList.add('active');
                setActiveFloorTrigger(floorNum);
                return;
            }
            var cellTrigger = within(e.target.closest('.cell'));
            if (cellTrigger) {
                var cellMode = cellTrigger.closest('.mode');
                var cellPanel = cellMode ? cellMode.querySelector('.panel') : null;
                if (cellPanel) fillPanelFromCell(cellPanel, cellTrigger);
                root.querySelectorAll('.panel.active').forEach(function (p) {
                    if (p !== cellPanel) p.classList.remove('active');
                });
                if (cellPanel) cellPanel.classList.add('active');
                setActiveFloorTrigger(null);
                return;
            }
            var tileTrigger = within(e.target.closest('.tile'));
            if (tileTrigger) {
                var tileMode = tileTrigger.closest('.mode');
                var tilePanel = tileMode ? tileMode.querySelector('.panel') : null;
                if (tilePanel) {
                    if (tileTrigger.querySelector('.tip')) {
                        fillPanelFromTile(tilePanel, tileTrigger);
                    } else {
                        fillPanelFromPricedTile(tilePanel, tileTrigger);
                    }
                }
                root.querySelectorAll('.panel.active').forEach(function (p) {
                    if (p !== tilePanel) p.classList.remove('active');
                });
                if (tilePanel) tilePanel.classList.add('active');
                setActiveFloorTrigger(null);
                return;
            }
            var trigger = within(e.target.closest('.zone,tbody tr'));
            if (trigger) {
                var panel = trigger.querySelector('.panel');
                root.querySelectorAll('.panel.active').forEach(function (p) {
                    if (p !== panel) p.classList.remove('active');
                });
                if (panel) panel.classList.add('active');
                setActiveFloorTrigger(null);
                return;
            }
            if (!within(e.target.closest('.panel'))) {
                root.querySelectorAll('.panel.active').forEach(function (p) {
                    p.classList.remove('active');
                });
                setActiveFloorTrigger(null);
            }
        });
    }

    function start() {
        document.querySelectorAll('.catalog').forEach(initCatalog);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
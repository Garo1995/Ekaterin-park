function initPoiMap(cfg) {
    var mapDiv = document.getElementById(cfg.mapId);
    if (!mapDiv) return;

    var $ = function (id) {
        return id ? document.getElementById(id) : null;
    };

    var glyphs = {
        cup: '<path d="M4 4h13v7a5 5 0 01-5 5H9a5 5 0 01-5-5V4z"/><path d="M17 6h1.5a2.5 2.5 0 010 5H17"/><path d="M4 19h13"/>',
        gift: '<rect x="3" y="8" width="18" height="13" rx="1"/><path d="M3 12h18"/><path d="M12 8v13"/>',
        doc: '<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M8 8h8M8 12h8M8 16h5"/>',
        mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
        camera: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7l2-3h4l2 3"/><circle cx="12" cy="13.5" r="3.5"/>',
        tree: '<path d="M12 3l6 8h-4l5 7H5l5-7H6z"/><path d="M12 18v3"/>'
    };

    var pins = cfg.pins;
    var map, placemarks = {}, openId = null, calloutEl = null, openMarkerEl = null, tempMarker = null;
    var normalLayout, selectedLayout;
    var coordReadout = $(cfg.coordReadoutId);

    function whenReady(cb) {
        if (window.ymaps) ymaps.ready(cb);
        else setTimeout(function () {
            whenReady(cb);
        }, 150);
    }

    function toLocal(coords) {
        if (!map || !map.projection) return null;
        var px = map.converter.globalToPage(map.projection.toGlobalPixels(coords, map.getZoom()));
        var r = mapDiv.getBoundingClientRect();
        return [px[0] - (r.left + window.pageXOffset), px[1] - (r.top + window.pageYOffset)];
    }

    function closeCallout() {
        if (calloutEl) {
            calloutEl.remove();
            calloutEl = null;
        }
        if (openId != null && placemarks[openId]) placemarks[openId].options.set('iconLayout', normalLayout);
        openId = null;
        openMarkerEl = null;
    }

    function positionCallout() {
        if (!calloutEl || !openMarkerEl) return;
        var mRect = openMarkerEl.getBoundingClientRect();
        var outerRect = mapDiv.parentElement.getBoundingClientRect();
        calloutEl.style.left = (mRect.right - outerRect.left + 8) + 'px';
        calloutEl.style.top = (mRect.top + mRect.height / 2 - outerRect.top) + 'px';
    }

    function findMarkerEl(pinId) {
        return mapDiv.parentElement.querySelector('.poi-marker[data-pin="' + pinId + '"]');
    }

    function openCallout(p) {
        if (openId === p.id) {
            closeCallout();
            return;
        }
        closeCallout();
        placemarks[p.id].options.set('iconLayout', selectedLayout);
        openMarkerEl = findMarkerEl(p.id);
        calloutEl = document.createElement('div');
        calloutEl.className = 'poi-callout';
        calloutEl.textContent = p.label;
        calloutEl.style.position = 'absolute';
        mapDiv.parentElement.appendChild(calloutEl);
        openId = p.id;
        requestAnimationFrame(function () {
            openMarkerEl = findMarkerEl(p.id) || openMarkerEl;
            positionCallout();
        });
    }

    function checkSwap(moved) {
        var closest = null, closestDist = Infinity;
        pins.forEach(function (other) {
            if (other.id === moved.id) return;
            var dx = other.coords[0] - moved.coords[0], dy = other.coords[1] - moved.coords[1];
            var d = Math.sqrt(dx * dx + dy * dy);
            if (d < closestDist) {
                closestDist = d;
                closest = other;
            }
        });
        if (closest && closestDist < 0.0006) {
            var tmp = closest.coords;
            closest.coords = moved.coords;
            moved.coords = tmp;
            placemarks[closest.id].geometry.setCoordinates(closest.coords);
            placemarks[moved.id].geometry.setCoordinates(moved.coords);
        }
    }

    function makeIconLayout(selected) {
        var cls = selected ? 'poi-marker selected' : 'poi-marker';
        return ymaps.templateLayoutFactory.createClass(
            '<div class="' + cls + '" data-pin="$[properties.pinId]"><div class="poi-body">$[properties.iconSvg]</div></div>'
        );
    }

    function buildMarkers() {
        normalLayout = makeIconLayout(false);
        selectedLayout = makeIconLayout(true);
        pins.forEach(function (p) {
            var pm = new ymaps.Placemark(p.coords, {
                iconSvg: '<svg viewBox="0 0 24 24">' + glyphs[p.icon] + '</svg>',
                pinId: p.id
            }, {
                iconLayout: normalLayout,
                iconShape: {type: 'Circle', coordinates: [0, 0], radius: 17},
                draggable: !!cfg.draggable
            });

            if (cfg.draggable) {
                pm.events.add('dragend', function () {
                    p.coords = pm.geometry.getCoordinates();
                    checkSwap(p);
                    if (openId === p.id) positionCallout();
                });
            }

            pm.events.add('click', function () {
                openCallout(p);
            });
            map.geoObjects.add(pm);
            placemarks[p.id] = pm;
        });
    }

    // ---- Кнопки управления (есть только у карт, где переданы соответствующие ID) ----
    function requireMap() {
        if (map) return true;
        var w = $(cfg.warnId);
        if (w) w.style.display = 'block';
        return false;
    }

    var zoomIn = $(cfg.zoomInId), zoomOut = $(cfg.zoomOutId), geoBtn = $(cfg.geoBtnId), tiltBtn = $(cfg.tiltBtnId);

    if (zoomIn) zoomIn.addEventListener('click', function () {
        if (requireMap()) map.setZoom(map.getZoom() + 1, {checkZoomRange: true});
    });
    if (zoomOut) zoomOut.addEventListener('click', function () {
        if (requireMap()) map.setZoom(map.getZoom() - 1, {checkZoomRange: true});
    });
    if (geoBtn) geoBtn.addEventListener('click', function () {
        if (!requireMap()) return;
        map.setCenter(cfg.center, cfg.zoom, {duration: 400});
    });
    if (tiltBtn) tiltBtn.addEventListener('click', function () {
        alert('3D-наклон зданий не поддерживается публичным JS API Яндекс.Карт (только в мобильном приложении).');
    });

    setTimeout(function () {
        if (!map) {
            var w = $(cfg.warnId);
            if (w) w.style.display = 'block';
        }
    }, 4000);

    whenReady(function () {
        map = new ymaps.Map(cfg.mapId, {
            center: cfg.center,
            zoom: cfg.zoom,
            controls: []
        }, {suppressMapOpenBlock: true});

        buildMarkers();

        map.events.add(['boundschange', 'actiontick', 'actionend'], function () {
            if (openId != null) positionCallout();
            if (tempMarker && tempMarker._coords) {
                var pos = toLocal(tempMarker._coords);
                if (pos) {
                    tempMarker.style.left = pos[0] + 'px';
                    tempMarker.style.top = pos[1] + 'px';
                }
            }
        });

        map.events.add('click', function (e) {
            closeCallout();
            if (!cfg.showCoordPicker) return;

            if (!tempMarker) {
                tempMarker = document.createElement('div');
                tempMarker.style.cssText = 'position:absolute;width:10px;height:10px;margin:-5px;border-radius:50%;background:#5aa4ff;box-shadow:0 0 0 5px rgba(90,164,255,.3);z-index:20;';
                mapDiv.parentElement.appendChild(tempMarker);
            }
            var coords = e.get('coords');
            tempMarker._coords = coords;
            var pos = toLocal(coords);
            if (pos) {
                tempMarker.style.left = pos[0] + 'px';
                tempMarker.style.top = pos[1] + 'px';
            }

            if (!coordReadout) return;
            coordReadout.style.display = 'block';
            coordReadout.innerHTML =
                '<b>Координаты:</b> ' + coords[0].toFixed(6) + ', ' + coords[1].toFixed(6) +
                '<br><span class="copy-btn" id="copyCoordBtn-' + cfg.mapId + '">скопировать</span>';
            $('copyCoordBtn-' + cfg.mapId).onclick = function () {
                var text = '{id:' + (pins.length + 1) + ', coords:[' + coords[0].toFixed(6) + ', ' + coords[1].toFixed(6) + '], icon:\'doc\', label:\'Новая метка\'}';
                navigator.clipboard.writeText(text).then(function () {
                    $('copyCoordBtn-' + cfg.mapId).textContent = 'скопировано!';
                });
            };
        });
    });
}

// Общий набор меток — одинаковый для обеих карт
var sharedPins = [
    {id: 1, coords: [59.90745, 30.26510], icon: 'cup', label: 'Кафе'},
    {id: 2, coords: [59.90748, 30.26580], icon: 'gift', label: 'Свадебный зал'},
    {id: 3, coords: [59.90715, 30.26480], icon: 'doc', label: 'набережная Бумажного канала'},
    {id: 4, coords: [59.90685, 30.26520], icon: 'mail', label: 'Ароматный Мир'},
    {id: 5, coords: [59.90680, 30.26600], icon: 'camera', label: 'Фотостудия «Царская»'},
    {id: 6, coords: [59.90650, 30.26490], icon: 'tree', label: 'Медвек'}
];

// ---- Карта №1: верхняя, простая, без кнопок управления ----
initPoiMap({
    mapId: 'map-route',
    warnId: 'warn-route',
    pins: JSON.parse(JSON.stringify(sharedPins)), // своя независимая копия меток
    center: [59.9070, 30.2655],
    zoom: 17.5,
    draggable: false,
    showCoordPicker: false
});

// ---- Карта №2: нижняя, основная, с зумом / геолокацией / 3D ----
initPoiMap({
    mapId: 'map-main',
    warnId: 'warn-main',
    coordReadoutId: 'coordReadout-main',
    zoomInId: 'zoomIn-main',
    zoomOutId: 'zoomOut-main',
    geoBtnId: 'geoBtn-main',
    tiltBtnId: 'tiltBtn-main',
    pins: JSON.parse(JSON.stringify(sharedPins)), // своя независимая копия меток
    center: [59.9070, 30.2655],
    zoom: 17,
    draggable: true,
    showCoordPicker: true
});
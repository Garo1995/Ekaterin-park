(function(){
    if (!document.querySelector('[data-fancybox]')) return;

    Fancybox.bind('[data-fancybox]', {

    });
})();




(function () {
    const inputs = document.querySelectorAll('input[name="phone"]');
    if (!inputs.length) return;
    if (typeof IMask === 'undefined') {
        console.warn('IMask не загружен');
        return;
    }
    inputs.forEach(function (input) {
        IMask(input, {
            mask: '+{7} (000) 000-00-00'
        });
    });
})();


/*------------------ open-menu-start ----------------*/



const openMenuBtn = document.querySelector('.open-menu');
const mobileMenu = document.querySelector('.mobile-menu');

openMenuBtn.addEventListener('click', () => {
    openMenuBtn.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.classList.toggle('menu-open');
});

// Закрытие меню при клике на пункт списка
document.querySelectorAll('.mobile-menu .nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        openMenuBtn.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
    });
});

/*------------------ open-menu-end ----------------*/







/*------------------ Modal-start ----------------*/


(function () {
    // ---- универсальный движок модалок ----
    // Работает с любым количеством модалок на странице:
    // <button data-modal-open="ID">, модалка <div class="modal-overlay" id="ID">
    // закрытие: [data-modal-close], клик по фону, клавиша Esc

    let lastFocused = null;

    function openModal(id) {
        const modal = document.getElementById(id);
        if (!modal) return;
        lastFocused = document.activeElement;
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        // фокус на первое поле, после завершения анимации
        const firstField = modal.querySelector('input, select, textarea');
        setTimeout(() => firstField && firstField.focus(), 400);
    }

    function closeModal(modal) {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (lastFocused) lastFocused.focus();
    }

    // открытие
    document.addEventListener('click', function (e) {
        const openTrigger = e.target.closest('[data-modal-open]');
        if (openTrigger) {
            openModal(openTrigger.getAttribute('data-modal-open'));
        }
    });

    // закрытие по крестику / клику на фон
    document.addEventListener('click', function (e) {
        const closeTrigger = e.target.closest('[data-modal-close]');
        if (closeTrigger) {
            closeModal(closeTrigger.closest('.modal-overlay'));
            return;
        }
        if (e.target.classList.contains('modal-overlay')) {
            closeModal(e.target);
        }
    });

    // закрытие по Esc
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.is-open').forEach(closeModal);
        }
    });

    // отправка формы (демо)
    const form = document.getElementById('viewing-form-el');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const modal = form.closest('.modal-overlay');
            alert('Заявка отправлена!'); // заменить на реальный fetch/AJAX
            closeModal(modal);
            form.reset();
        });
    }
})();


/*------------------ Modal-end ----------------*/








(function(){
    const ringFg   = document.getElementById('ringFg');
    const countCur = document.getElementById('countCurrent');
    const countTot = document.getElementById('countTotal');
    const mainSwiperEl   = document.getElementById('mainSwiper');
    const thumbsSwiperEl = document.getElementById('thumbsSwiper');

    // Guard: bail out quietly on any page that doesn't have this exact
    // banner (missing markup, or Swiper not loaded on that page).
    if(!ringFg || !countCur || !countTot || !mainSwiperEl || !thumbsSwiperEl) return;
    if(typeof Swiper === 'undefined') return;

    const slidesCount = mainSwiperEl.querySelectorAll('.swiper-slide').length;
    if(slidesCount === 0) return;

    const R = 45;
    const CIRCUMFERENCE = 2 * Math.PI * R;
    ringFg.style.strokeDasharray = CIRCUMFERENCE;
    ringFg.style.strokeDashoffset = CIRCUMFERENCE;
    countTot.textContent = '/' + String(slidesCount).padStart(2, '0');

    // миниатюры слева — Swiper-галерея, управляющая главным слайдером
    const thumbsSwiper = new Swiper(thumbsSwiperEl, {
        direction: 'vertical',
        slidesPerView: slidesCount,
        watchSlidesProgress: true,
    });

    // главный слайдер: обычное листание (мышкой и автоматически), без fade
    new Swiper(mainSwiperEl, {
        effect: 'slide',
        speed: 500,
        loop: true,
        grabCursor: true,              // курсор-"рука" при наведении — понятно, что можно тащить мышкой
        simulateTouch: true,           // разрешает "перетаскивание" мышкой как тач на десктопе
        autoplay: { delay: 6000, disableOnInteraction: false },
        thumbs: { swiper: thumbsSwiper },
        on: {
            // тикает во время автоплея — двигаем обводку кольца в реальном времени
            autoplayTimeLeft(swiper, time, progress) {
                ringFg.style.strokeDashoffset = CIRCUMFERENCE * progress;
            },
            slideChangeTransitionStart(swiper) {
                countCur.textContent = String(swiper.realIndex + 1).padStart(2, '0');
            },
        },

        breakpoints: {
            1020: {
                autoplay: { delay: 6000, disableOnInteraction: false },
            },
            767: {
                autoplay: { delay: 3000, disableOnInteraction: false },
                slidesPerView: 1.4,
                speed: 650,

            },
            320: {
                slidesPerView: 1.2,
                speed: 650,
            },
        },
    });
})();
















(function(){
    const AUTOPLAY_MS = 6000;

    const cardsWrap  = document.getElementById('parkNearby');
    const viewportEl = document.getElementById('parkViewport');
    const detailsWrap = document.getElementById('placeDetails');

    // Guard: this script only does something on pages that actually have
    // the interactive block. If any required container is missing, or the
    // block is empty, bail out quietly instead of throwing errors.
    if(!cardsWrap || !viewportEl || !detailsWrap) return;

    const cards   = Array.from(cardsWrap.querySelectorAll('.park-card'));
    const details = Array.from(detailsWrap.querySelectorAll('.park-detail'));

    if(cards.length === 0 || details.length === 0 || cards.length !== details.length) return;

    const mq = window.matchMedia('(max-width:1199px)');

    let current = 0;
    let timer   = null;
    let paused  = false;
    let carouselX = 0;

    // On mobile, keep the active circle centered on screen — neighbouring
    // circles stay partially visible at the edges, like a peek carousel.
    function updateCarousel(){
        if(!mq.matches){
            cardsWrap.style.transform = 'translateX(0)';
            carouselX = 0;
            return;
        }
        const viewportRect = viewportEl.getBoundingClientRect();
        const slotRect = cards[current].parentElement.getBoundingClientRect();
        carouselX += (viewportRect.left + viewportRect.width / 2) - (slotRect.left + slotRect.width / 2);
        cardsWrap.style.transform = `translateX(${carouselX}px)`;
    }

    function activate(index, userTriggered){
        if(index === current){
            if(userTriggered) restart();
            return;
        }
        cards[current].classList.remove('is-active','is-timing');
        cards[current].setAttribute('aria-selected','false');
        details[current].classList.remove('is-active');

        current = index;

        cards[current].classList.add('is-active');
        cards[current].setAttribute('aria-selected','true');
        details[current].classList.add('is-active');

        updateCarousel();

        if(userTriggered) restart();
        requestAnimationFrame(() => cards[current].classList.add('is-timing'));
    }

    function tick(){ activate((current + 1) % cards.length, false); }

    function restart(){
        clearInterval(timer);
        if(!paused) timer = setInterval(tick, AUTOPLAY_MS);
    }

    cards.forEach((card, i) => {
        card.addEventListener('click', () => activate(i, true));
    });

    cardsWrap.addEventListener('mouseenter', () => {
        paused = true;
        clearInterval(timer);
        cards[current].classList.remove('is-timing');
    });
    cardsWrap.addEventListener('mouseleave', () => {
        paused = false;
        requestAnimationFrame(() => cards[current].classList.add('is-timing'));
        restart();
    });

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => { carouselX = 0; updateCarousel(); }, 120);
    });

    requestAnimationFrame(() => {
        cards[0].classList.add('is-timing');
        updateCarousel();
    });
    restart();

})();



















document.addEventListener('DOMContentLoaded', function () {
    const slider = document.getElementById('compareSlider');

    if (slider) {

        const before = slider.querySelector('.img-before');
        const divider = slider.querySelector('.divider');
        const handle = slider.querySelector('.handle');

        let dragging = false;

        function setPosition(percent) {
            percent = Math.min(100, Math.max(0, percent));
            before.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
            divider.style.left = percent + '%';
            handle.style.left = percent + '%';
            slider.setAttribute('aria-valuenow', Math.round(percent));
        }

        function positionFromEvent(clientX) {
            const rect = slider.getBoundingClientRect();
            const x = clientX - rect.left;
            return (x / rect.width) * 100;
        }

        function onMove(clientX) {
            setPosition(positionFromEvent(clientX));
        }

        slider.addEventListener('mousedown', (e) => {
            dragging = true;
            onMove(e.clientX);
        });
        document.addEventListener('mousemove', (e) => {
            if (dragging) onMove(e.clientX);
        });
        document.addEventListener('mouseup', () => dragging = false);

        slider.addEventListener('touchstart', (e) => {
            dragging = true;
            onMove(e.touches[0].clientX);
        }, { passive: true });
        document.addEventListener('touchmove', (e) => {
            if (dragging) onMove(e.touches[0].clientX);
        }, { passive: true });
        document.addEventListener('touchend', () => dragging = false);
        document.addEventListener('touchcancel', () => dragging = false);

        slider.addEventListener('keydown', (e) => {
            const current = parseFloat(slider.getAttribute('aria-valuenow')) || 50;
            if (e.key === 'ArrowLeft') { setPosition(current - 5); e.preventDefault(); }
            if (e.key === 'ArrowRight') { setPosition(current + 5); e.preventDefault(); }
        });

        setPosition(50);

    } else {

    }
});





























(function () {
    const menuItems = document.querySelectorAll('.see-house');
    const contentBlocks = document.querySelectorAll('.see-house-js');

    // Если на текущей странице этих элементов нет — выходим,
    // скрипт не будет выполняться на других страницах
    if (!menuItems.length || !contentBlocks.length) return;

    const swiperInstances = {};
    const swiperConfig = {
        slidesPerView: 3,
        loop: true,
        navigation: {
            nextEl: ".house-slider-next",
            prevEl: ".house-slider-prev",
        },
        breakpoints: {
            1020: {
                slidesPerView: 3,
                loop: true,
            },
            575: {
                slidesPerView: 2,
            },
            320: {
                slidesPerView: 1.2,
                slidesPerGroup: 1,
            },
        },
    };

    function initSwiperFor(block) {
        const key = block.dataset.content;
        if (swiperInstances[key]) return;

        const swiperEl = block.querySelector('.swiper');
        if (swiperEl) {
            swiperInstances[key] = new Swiper(swiperEl, swiperConfig);
        }
    }

    function showBlock(targetKey) {
        contentBlocks.forEach((block) => {
            if (block.dataset.content === targetKey) {
                block.style.display = '';
                initSwiperFor(block);
                if (swiperInstances[targetKey]) {
                    swiperInstances[targetKey].update();
                }
            } else {
                block.style.display = 'none';
            }
        });
    }

    menuItems.forEach((item) => {
        item.addEventListener('click', () => {
            menuItems.forEach((el) => el.classList.remove('see-house-active'));
            item.classList.add('see-house-active');
            showBlock(item.dataset.target);
        });
    });

    const activeItem = document.querySelector('.see-house-active');
    if (activeItem) {
        showBlock(activeItem.dataset.target);
    }
})();


























(function () {
    const blocks = document.querySelectorAll('.sales-progress');
    if (!blocks.length) return;

    blocks.forEach((block) => {
        const sold = parseInt(block.dataset.sold, 10) || 0;
        const total = parseInt(block.dataset.total, 10) || 1;
        const percent = Math.min(100, Math.max(0, (sold / total) * 100));

        const circle = block.querySelector('.sales-progress__ring-fill');
        const radius = circle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;

        circle.style.strokeDasharray = circumference;
        circle.style.strokeDashoffset = circumference - (percent / 100) * circumference;

        const soldEl = block.querySelector('.sales-progress__sold');
        const totalEl = block.querySelector('.sales-progress__total');
        soldEl.textContent = sold;
        totalEl.textContent = total;
    });
})();


















/*------------------ mortgage-calcualtor-start ----------------*/


(function(){
    // Скрипт работает только если на странице реально есть блок калькулятора.
    const calc = document.querySelector('.mortgage-calc');
    if (!calc) return;

    const RATE = 19.5; // % годовых
    const GOLD = '#c9a876';
    const TRACK = '#3a4661';

    // id используются только для реальных input/input[range] — остальное ищем по классам внутри calc.
    const priceRange = calc.querySelector('#priceRange');
    const priceInput = calc.querySelector('#priceInput');
    const downRange = calc.querySelector('#downRange');
    const downInput = calc.querySelector('#downInput');
    const termRange = calc.querySelector('#termRange');
    const termInput = calc.querySelector('#termInput');

    const downHint = calc.querySelector('.field-hint');
    const paymentOut = calc.querySelector('.payment-value');
    const overpaymentOut = calc.querySelector('.overpayment-value');
    const deductionOut = calc.querySelector('.deduction-value');

    if (!priceRange || !priceInput || !downRange || !downInput ||
        !termRange || !termInput || !downHint ||
        !paymentOut || !overpaymentOut || !deductionOut) return;

    function formatMoney(n){
        return Math.round(n).toLocaleString('ru-RU') + ' ₽';
    }
    function parseMoney(str){
        const n = parseInt(String(str).replace(/[^\d]/g, ''), 10);
        return isNaN(n) ? 0 : n;
    }
    function pluralYears(n){
        const mod10 = n % 10, mod100 = n % 100;
        if (mod10 === 1 && mod100 !== 11) return 'год';
        if ([2,3,4].includes(mod10) && ![12,13,14].includes(mod100)) return 'года';
        return 'лет';
    }

    function paintRange(rangeEl){
        const min = +rangeEl.min, max = +rangeEl.max, val = +rangeEl.value;
        const pct = max > min ? ((val - min) / (max - min)) * 100 : 0;
        rangeEl.style.background =
            'linear-gradient(to right, ' + GOLD + ' 0%, ' + GOLD + ' ' + pct + '%, ' + TRACK + ' ' + pct + '%, ' + TRACK + ' 100%)';
    }

    function clampDownPayment(){
        const price = parseInt(priceRange.value, 10);
        const maxDown = Math.floor(price * 0.9);
        downRange.max = maxDown;
        if (parseInt(downRange.value, 10) > maxDown) downRange.value = maxDown;
    }

    function calculate(){
        const price = parseInt(priceRange.value, 10);
        const down = parseInt(downRange.value, 10);
        const years = parseInt(termRange.value, 10);
        const months = years * 12;

        const loan = Math.max(price - down, 0);
        const monthlyRate = (RATE / 100) / 12;

        let payment;
        if (monthlyRate > 0){
            const pow = Math.pow(1 + monthlyRate, months);
            payment = loan * (monthlyRate * pow) / (pow - 1);
        } else {
            payment = loan / months;
        }
        if (!isFinite(payment) || loan <= 0) payment = 0;

        const totalPaid = payment * months;
        const overpayment = Math.max(totalPaid - loan, 0);

        // Налоговый вычет: 13% от стоимости квартиры (макс. база 2 000 000)
        // + 13% от процентов по кредиту (макс. база 3 000 000)
        const propertyBase = Math.min(price, 2000000);
        const interestBase = Math.min(overpayment, 3000000);
        const deduction = (propertyBase + interestBase) * 0.13;

        paymentOut.textContent = formatMoney(payment);
        overpaymentOut.textContent = formatMoney(overpayment);
        deductionOut.textContent = formatMoney(deduction);

        const percent = price > 0 ? Math.round((down / price) * 100) : 0;
        downHint.textContent = '≈ ' + percent + '% от стоимости квартиры';

        priceInput.value = formatMoney(price);
        downInput.value = formatMoney(down);
        termInput.value = years + ' ' + pluralYears(years);

        paintRange(priceRange);
        paintRange(downRange);
        paintRange(termRange);
    }

    // range -> text
    priceRange.addEventListener('input', () => { clampDownPayment(); calculate(); });
    downRange.addEventListener('input', calculate);
    termRange.addEventListener('input', calculate);

    // text -> range
    priceInput.addEventListener('change', () => {
        let v = parseMoney(priceInput.value);
        v = Math.min(Math.max(v, +priceRange.min), +priceRange.max);
        priceRange.value = v;
        clampDownPayment();
        calculate();
    });
    downInput.addEventListener('change', () => {
        let v = parseMoney(downInput.value);
        v = Math.min(Math.max(v, +downRange.min), +downRange.max);
        downRange.value = v;
        calculate();
    });

    calculate();
})();


/*------------------ mortgage-calcualtor-end ----------------*/











/*------------------ apartment-slider-start ----------------*/



document.querySelectorAll('.might-slider').forEach(function (sliderEl) {
    const wrapper = sliderEl.closest('.might-look-apart');

    const nextEl = wrapper.querySelector('.might-button-next');
    const prevEl = wrapper.querySelector('.might-button-prev');

    new Swiper(sliderEl, {
        slidesPerView: 3,
        spaceBetween: 0,
        speed: 600,
        loop: true,

        navigation: {
            nextEl: nextEl,
            prevEl: prevEl,
        },
        breakpoints: {
            1299: {
                slidesPerView: 3,
                loop: true,
            },
            1020: {
                slidesPerView: 2,
            },
            320: {
                slidesPerView: 1,
                slidesPerGroup: 1,
            },
        },
    });
});



/*------------------ apartment-slider-end ----------------*/




















/*------------------ accordion-start ----------------*/


(function () {
    // Находим ВСЕ аккордеоны на странице, а не только первый
    const accordions = document.querySelectorAll('.faq-accordion');
    if (!accordions.length) return;

    function openItem(item) {
        const body = item.querySelector('.faq-body');
        body.style.maxHeight = body.scrollHeight + 'px';
    }

    function closeItem(item) {
        const body = item.querySelector('.faq-body');
        body.style.maxHeight = 0;
    }

    // Проходим по каждому аккордеону отдельно
    accordions.forEach(function (accordion) {
        const items = accordion.querySelectorAll('.faq-item');

        items.forEach(function (item) {
            const header = item.querySelector('.faq-header');

            if (item.classList.contains('active')) openItem(item);

            header.addEventListener('click', function () {
                const isActive = item.classList.contains('active');

                // Закрываем только элементы ЭТОГО аккордеона,
                // а не все на странице
                items.forEach(function (i) {
                    i.classList.remove('active');
                    closeItem(i);
                });

                if (!isActive) {
                    item.classList.add('active');
                    openItem(item);
                }
            });
        });
    });

    // Пересчитываем высоту активных элементов во всех аккордеонах при ресайзе
    window.addEventListener('resize', function () {
        accordions.forEach(function (accordion) {
            const items = accordion.querySelectorAll('.faq-item');
            items.forEach(function (item) {
                if (item.classList.contains('active')) openItem(item);
            });
        });
    });
})();



/*------------------ accordion-end ----------------*/









let projectsSwiper = null;

function initProjectsSlider() {
    const breakpoint = window.matchMedia('(max-width: 1299px)'); // добавлен px

    if (breakpoint.matches) {
        // Мобильная версия — инициализируем Swiper
        if (!projectsSwiper) {
            projectsSwiper = new Swiper('.projects-slider', {
                slidesPerView: 2.15,
                loop: false,

                breakpoints: {
                    1020: {
                        slidesPerView: 2.15,

                        loop: true,
                    },
                    767: {
                        slidesPerView: 1.4,
                    },
                    320: {
                        slidesPerView: 1.2,

                    },
                },
            });
        }
    } else {
        // Десктоп — уничтожаем Swiper, чтобы карточки шли обычным гридом
        if (projectsSwiper) {
            projectsSwiper.destroy(true, true);
            projectsSwiper = null;
        }
    }
}

// Запуск при загрузке
initProjectsSlider();

// Пересчёт при ресайзе окна
window.addEventListener('resize', initProjectsSlider);

























document.addEventListener('DOMContentLoaded', function () {
    const mobileBtn = document.querySelector('.see-house-mobile');
    const menu = document.querySelector('.see-house-menu');

    if (mobileBtn && menu) {
        // блоки есть на странице — инициализируем меню
        const mobileLabel = mobileBtn.querySelector('span');
        const items = menu.querySelectorAll('.see-house');

        // Открыть/закрыть меню по клику на кнопку
        mobileBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            mobileBtn.classList.toggle('see-house-mobile-open');
            menu.classList.toggle('see-house-menu-open');
        });

        // Клик по пункту меню
        items.forEach(function (item) {
            item.addEventListener('click', function () {
                // Снимаем активный класс со всех, ставим на выбранный
                items.forEach(function (i) {
                    i.classList.remove('see-house-active');
                });
                item.classList.add('see-house-active');

                // Переносим текст пункта в кнопку
                mobileLabel.textContent = item.textContent.trim();

                // Закрываем меню
                mobileBtn.classList.remove('see-house-mobile-open');
                menu.classList.remove('see-house-menu-open');

                // Сообщаем остальной странице, какой раздел выбран
                const target = item.getAttribute('data-target');
                document.dispatchEvent(new CustomEvent('seeHouseChange', { detail: { target: target } }));
            });
        });

        // Закрытие меню при клике вне его
        document.addEventListener('click', function (e) {
            if (!mobileBtn.contains(e.target) && !menu.contains(e.target)) {
                mobileBtn.classList.remove('see-house-mobile-open');
                menu.classList.remove('see-house-menu-open');
            }
        });

    } else {

    }
});






























const sliderThumbs = new Swiper('.sm-catalog-slider', {
    direction: 'vertical',
    slidesPerView: 7,
    spaceBetween: 20,
    loop: true,
    freeMode: true,
    breakpoints: {
        0: {
            direction: 'horizontal',
            freeMode: false,
            spaceBetween: 14,
        },
        768: {
            direction: 'vertical',

        }
    }
});


const sliderImages = new Swiper('.catalog-slider', {

    slidesPerView: 1,
    spaceBetween: 16,
    mousewheel: true,
    loop: true,
    grabCursor: true,
    thumbs: {
        swiper: sliderThumbs
    },
    navigation: {
        nextEl: ".catalog-btn-next",
        prevEl: ".catalog-btn-prev",
    },
    breakpoints: {
        1200: {
            slidesPerView: 1,
            loop: true,
            spaceBetween: 1,

        },
        1199: {
            slidesPerView: 2.15,
            loop: true,
            spaceBetween: 1,

        },
        1020: {
            slidesPerView: 2.25,
            spaceBetween: 1,

        },
        575: {
            slidesPerView: 1.4,
            spaceBetween: 1,

        },
        320: {
            slidesPerView: 1.2,
            spaceBetween: 1,

        },
    },
});













document.addEventListener("DOMContentLoaded", () => {
    const cookieBlock = document.querySelector(".cookie");

    // Если блока .cookie нет на странице — скрипт дальше не выполняется
    if (!cookieBlock) return;

    // Находим ВСЕ кнопки с этим классом, а не только первую
    const acceptBtns = document.querySelectorAll(".cookie__btn");

    if (!localStorage.getItem("cookieAccepted")) {
        cookieBlock.style.display = "flex";
    } else {
        cookieBlock.style.display = "none";
    }

    // Вешаем обработчик на каждую кнопку отдельно
    acceptBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            localStorage.setItem("cookieAccepted", "true");
            cookieBlock.style.display = "none";
        });
    });
});

const wrap = document.getElementById('fabWrap');
const main = document.getElementById('fabMain');

if (wrap && main) {
    main.addEventListener('click', () => {
        wrap.classList.toggle('open');
    });
}


















// Faq page

(function () {
    // Проверяем, есть ли нужная разметка на странице
    var menu = document.querySelector('.faq-menu');
    var content = document.querySelector('.faq-cnt');

    if (!menu || !content) {
        return; // если блоков нет — скрипт ничего не делает
    }

    var menuItems = menu.querySelectorAll('.faq-click');
    var contentBoxes = content.querySelectorAll('.faq-cnt-box');

    menuItems.forEach(function (item) {
        item.addEventListener('click', function () {
            var target = item.getAttribute('data-faq');

            // Снимаем активность со всех пунктов меню
            menuItems.forEach(function (el) {
                el.classList.remove('active');
            });
            // Активируем нажатый пункт
            item.classList.add('active');

            // Скрываем все блоки контента
            contentBoxes.forEach(function (box) {
                box.classList.remove('active');
            });
            // Показываем нужный блок
            var activeBox = content.querySelector('.faq-cnt-box[data-faq="' + target + '"]');
            if (activeBox) {
                activeBox.classList.add('active');
            }
        });
    });
})();



// Faq page



function initStyledSelects() {
    const wrappers = document.querySelectorAll('.styled-select');

    if (wrappers.length === 0) return;

    wrappers.forEach(wrapper => {
        if (wrapper.dataset.initialized) return;
        wrapper.dataset.initialized = 'true';

        const select = wrapper.querySelector('select');
        if (!select) return;

        const optionsData = Array.from(select.options).map(o => ({
            value: o.value,
            label: o.textContent
        }));

        // создаём видимый блок
        const box = document.createElement('div');
        box.className = 'select-box';
        box.innerHTML = `<span class="select-label">${optionsData[0].label}</span><div class="arrow"></div>`;

        const list = document.createElement('div');
        list.className = 'options-list';
        optionsData.forEach((opt, i) => {
            if (i === 0 && opt.value === '') return; // пропускаем пустой placeholder
            const item = document.createElement('div');
            item.className = 'option-item';
            item.textContent = opt.label;
            item.dataset.value = opt.value;
            list.appendChild(item);
        });

        wrapper.appendChild(box);
        wrapper.appendChild(list);

        const label = box.querySelector('.select-label');

        box.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.styled-select.open').forEach(w => {
                if (w !== wrapper) w.classList.remove('open');
            });
            wrapper.classList.toggle('open');
        });

        list.querySelectorAll('.option-item').forEach(item => {
            item.addEventListener('click', () => {
                list.querySelectorAll('.option-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                label.textContent = item.textContent;
                select.value = item.dataset.value;
                select.dispatchEvent(new Event('change', { bubbles: true }));
                wrapper.classList.remove('open');
            });
        });
    });

    document.addEventListener('click', () => {
        document.querySelectorAll('.styled-select.open').forEach(w => w.classList.remove('open'));
    });
}

initStyledSelects();

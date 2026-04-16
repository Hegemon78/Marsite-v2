/* Capsule Renovation Calculator */
(function () {
    var area = document.getElementById('calc-area');
    var areaVal = document.getElementById('calc-area-val');
    var total = document.getElementById('calc-total');
    var duration = document.getElementById('calc-duration');
    var styleBtns = document.querySelectorAll('.capsule-calc__style-btn');
    var checkboxes = document.querySelectorAll('.capsule-calc__options input[type="checkbox"]');

    if (!area || !total) return;

    var selectedPrice = 15000;

    function formatPrice(n) {
        return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽';
    }

    function calcDuration(sqm) {
        if (sqm <= 35) return '40-45 дней';
        if (sqm <= 55) return '45-50 дней';
        if (sqm <= 75) return '50-55 дней';
        return '55-60 дней';
    }

    function update() {
        var sqm = parseInt(area.value, 10);
        areaVal.textContent = sqm;

        var base = sqm * selectedPrice;
        var extras = 0;
        checkboxes.forEach(function (cb) {
            if (cb.checked) extras += parseInt(cb.dataset.add, 10);
        });

        total.textContent = formatPrice(base + extras);
        duration.textContent = calcDuration(sqm);
    }

    area.addEventListener('input', update);

    styleBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            styleBtns.forEach(function (b) { b.classList.remove('capsule-calc__style-btn--active'); });
            btn.classList.add('capsule-calc__style-btn--active');
            selectedPrice = parseInt(btn.dataset.price, 10);
            update();
        });
    });

    checkboxes.forEach(function (cb) {
        cb.addEventListener('change', update);
    });

    update();
})();

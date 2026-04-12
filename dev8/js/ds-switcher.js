(function() {
    var allVariants = {
        typo: ['typo-a', 'typo-b', 'typo-c'],
        space: ['space-airy', 'space-normal', 'space-compact'],
        gold: ['gold-min', 'gold-normal', 'gold-max']
    };
    var defaults = { typo: 'typo-b', space: 'space-normal', gold: 'gold-normal' };
    var current = { typo: 'typo-b', space: 'space-normal', gold: 'gold-normal' };

    function applyVariant(group, variant) {
        allVariants[group].forEach(function(v) {
            document.body.classList.remove(v);
        });
        if (variant !== defaults[group]) {
            document.body.classList.add(variant);
        }
        current[group] = variant;

        var btns = document.querySelectorAll('[data-group="' + group + '"]');
        for (var i = 0; i < btns.length; i++) {
            if (btns[i].dataset.variant === variant) {
                btns[i].classList.add('ds-switcher__btn--active');
            } else {
                btns[i].classList.remove('ds-switcher__btn--active');
            }
        }
    }

    var panel = document.getElementById('dsSwitcher');
    if (panel) {
        panel.addEventListener('click', function(e) {
            var btn = e.target;
            while (btn && !btn.classList.contains('ds-switcher__btn')) {
                btn = btn.parentElement;
            }
            if (!btn || !btn.dataset.group) return;
            applyVariant(btn.dataset.group, btn.dataset.variant);
        });
    }

    var params = new URLSearchParams(location.search);
    ['typo', 'space', 'gold'].forEach(function(g) {
        var v = params.get(g);
        if (v && allVariants[g].indexOf(v) !== -1) applyVariant(g, v);
    });
})();

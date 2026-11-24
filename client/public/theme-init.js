(function () {
  try {
    var stored = localStorage.getItem('pt-theme');
    var dark =
      stored === 'dark' ||
      (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
    var root = document.documentElement;

    if (dark) root.classList.add('dark');
    root.dataset.tsMode = dark ? 'dark' : 'light';

    // Biến CSS của theme đã lưu, được useTheme ghi sẵn cho cả 2 chế độ.
    // Áp dụng trước khi React mount để không nháy về bảng màu mặc định.
    var raw = localStorage.getItem('ptbrain.studio.vars.v1');
    var hasConfig = !!localStorage.getItem('ptbrain.studio.v1');
    if (raw && hasConfig) {
      var boot = JSON.parse(raw);
      var vars = boot && boot[dark ? 'dark' : 'light'];
      if (vars) {
        for (var name in vars) {
          if (Object.prototype.hasOwnProperty.call(vars, name)) {
            root.style.setProperty(name, vars[name]);
          }
        }
        if (vars['--ts-shell']) {
          var meta = document.querySelector('meta[name="theme-color"]');
          if (meta) meta.setAttribute('content', 'rgb(' + vars['--ts-shell'] + ')');
        }
      }
      if (boot && boot.themeId) root.dataset.tsTheme = boot.themeId;
    }
  } catch {
    // localStorage có thể bị chặn; dùng fallback trong index.css.
  }
})();

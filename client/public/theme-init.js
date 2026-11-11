(function () {
  try {
    var stored = localStorage.getItem('pt-theme');
    var dark =
      stored === 'dark' ||
      (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
  } catch {
    // localStorage có thể bị chặn; bỏ qua và dùng theme mặc định của hệ thống.
  }
})();

document.addEventListener("DOMContentLoaded", () => {
  // 3-Line Hamburger Menu Toggle Logic
  const menuToggle = document.getElementById("menuToggle");
  const closeDrawer = document.getElementById("closeDrawer");
  const navDrawer = document.getElementById("navDrawer");
  const navBackdrop = document.getElementById("navBackdrop");

  if (menuToggle && closeDrawer && navDrawer && navBackdrop) {
    function toggleNav() {
      menuToggle.classList.toggle("active");
      navDrawer.classList.toggle("open");
      navBackdrop.classList.toggle("open");
    }

    menuToggle.addEventListener("click", toggleNav);
    closeDrawer.addEventListener("click", toggleNav);
    navBackdrop.addEventListener("click", toggleNav);
  }
});

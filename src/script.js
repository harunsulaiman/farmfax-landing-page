// FAQ accordion
document.querySelectorAll('.accordion-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const content = btn.nextElementSibling;
    content.style.display = content.style.display === 'block' ? 'none' : 'block';
  });
});

// Intersection fade animations
const faders = document.querySelectorAll('.fade-in, .fade-up');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.2 });
faders.forEach(el => observer.observe(el));

// Mobile nav toggle
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
menuToggle.addEventListener('click', () => navLinks.classList.toggle('active'));

// Parallax hero effect
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const bg = document.querySelector('.parallax-bg');
  bg.style.transform = `translateY(${scrollY * 0.4}px)`;
});

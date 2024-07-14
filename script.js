const professions = ["recent graduate.", "software engineer.", "backend developer.", "frontend developer."];
let professionIndex = 0;
let charIndex = 0;
let currentProfession = professions[professionIndex];
const professionElement = document.querySelector('.profession');
let isScrolling = false;

function typeProfession() {
    if (charIndex < currentProfession.length) {
        professionElement.textContent += currentProfession.charAt(charIndex);
        charIndex++;
        setTimeout(typeProfession, 125);
    } else {
        setTimeout(deleteProfession, 1000);
    }
}

function deleteProfession() {
    if (charIndex > 0) {
        professionElement.textContent = currentProfession.substring(0, charIndex - 1);
        charIndex--;
        setTimeout(deleteProfession, 50);
    } else {
        professionIndex = (professionIndex + 1) % professions.length;
        currentProfession = professions[professionIndex];
        setTimeout(typeProfession, 300);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(typeProfession, 500);
});

let lastScrollTop = 0;

function scrollHandler() {
    if (isScrolling) return;

    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;
    const scrollDirection = scrollPosition > lastScrollTop ? 'down' : 'up';

    if (scrollPosition < windowHeight) {
        isScrolling = true;
        if (scrollPosition > 0 && scrollDirection === 'down') {
            window.scrollTo({
                top: windowHeight,
                behavior: 'smooth'
            });
        } else if (scrollDirection === 'up' && scrollPosition < windowHeight * 0.90) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    } else {
        isScrolling = false;
    }

    lastScrollTop = scrollPosition <= 0 ? 0 : scrollPosition;
}

window.addEventListener('scroll', () => {
    if (window.scrollY > window.innerHeight / 2) {
        document.body.classList.add('scrolled');
    } else {
        document.body.classList.remove('scrolled');
    }
});

window.addEventListener('scroll', scrollHandler);
window.addEventListener('wheel', (e) => {
    if (isScrolling) {
        e.preventDefault();
    }
});

window.addEventListener('scrollend', () => {
    isScrolling = false;
});

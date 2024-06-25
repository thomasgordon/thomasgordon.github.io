const typingElement = document.getElementById('typing');
const textToType = "Creating the future, one line of code at a time...";
let index = 0;

function typeText() {
    if (index < textToType.length) {
        typingElement.textContent = textToType.slice(0, index + 1);
        index++;
        setTimeout(typeText, 100);
    } else {
        typingElement.classList.add('typing-done');
    }
}

window.addEventListener('load', typeText);

const animationElement = document.querySelector('.animation-element');
let x = 0;
let y = 0;
let dx = 3;
let dy = 3;

function animate() {
    const boxX = animationElement.parentElement.clientWidth;
    const boxY = animationElement.parentElement.clientHeight;
    const ballR = animationElement.clientWidth;

    x += dx;
    y += dy;

    if (x + ballR > boxX && y + ballR > boxY) {
        dx = 0;
        dy = -dy;
    }

    if (y < 0 && x + ballR > boxX) {
        dx = -3;
        dy = -dy;
    }

    if (x < 0 && y + ballR > boxY) {
        dy = -dy;
        dx = 0;
    }

    if (x < 0 && y < 0) {
        dx = 3;
        dy = 3;
    }

    animationElement.style.left = `${x}px`;
    animationElement.style.top = `${y}px`;

    requestAnimationFrame(animate);
}

window.addEventListener('load', animate);

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth',
        });
    });
});
document.addEventListener('DOMContentLoaded', function() {
    const scrollContainer = document.querySelector('.scroll-container');

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    document.querySelectorAll('.project-card-link').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.querySelector('.project-card').style.transform = 'translateY(-5px)';
        });
        card.addEventListener('mouseleave', function() {
            this.querySelector('.project-card').style.transform = 'translateY(0)';
        });
    });

    let lastScrollTop = 0;
    scrollContainer.addEventListener('scroll', function() {
        const st = scrollContainer.scrollTop;
        if (st > lastScrollTop) {
            document.body.style.paddingTop = `-${st}px`;
        } else {
            document.body.style.paddingTop = `0px`;
        }
        lastScrollTop = st <= 0 ? 0 : st;
    }, false);
});
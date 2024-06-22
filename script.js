document.addEventListener("DOMContentLoaded", () => {
    const projects = [
        {
            title: "Project One",
            description: "Description for project one."
        },
        {
            title: "Project Two",
            description: "Description for project two."
        },
        // Add more projects here
    ];

    const projectsContainer = document.getElementById('projects-container');
    const projectTemplate = document.getElementById('project-template');

    projects.forEach(project => {
        const projectElement = projectTemplate.cloneNode(true);
        projectElement.style.display = 'block';
        projectElement.querySelector('h3').textContent = project.title;
        projectElement.querySelector('p').textContent = project.description;
        projectsContainer.appendChild(projectElement);
    });
});

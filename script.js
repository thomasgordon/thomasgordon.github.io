document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('input');
    const output = document.getElementById('output');
    const themeLink = document.getElementById('theme-link');
    let currentDirectory = '/';
    const fileSystem = {
        '/': ['projects', 'education.html', 'contact.html'],
        '/projects': []
    };
    let themes = [];
    let autocompleteIndex = -1;
    let autocompleteList = [];

    fetchProjects();
    fetchThemes();

    input.addEventListener('keydown', handleInput);

    setInterval(() => {
        input.style.caretColor = input.style.caretColor === 'transparent' ? '#c5c8c6' : 'transparent';
    }, 500);

    function fetchProjects() {
        fetch('/projects/')
            .then(response => response.text())
            .then(data => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(data, 'text/html');
                const files = [...doc.querySelectorAll('a')]
                    .map(a => a.href.split('/').pop())
                    .filter(file => file.endsWith('.html'));
                fileSystem['/projects'] = files;
            })
            .catch(error => console.error('Error fetching projects:', error));
    }

    function fetchThemes() {
        fetch('/themes/')
            .then(response => response.text())
            .then(data => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(data, 'text/html');
                themes = [...doc.querySelectorAll('a')]
                    .map(a => `themes/${a.href.split('/').pop()}`)
                    .filter(file => file.endsWith('.css'));
            })
            .catch(error => console.error('Error fetching themes:', error));
    }

    function handleInput(event) {
        if (event.key === 'Enter') {
            const command = input.value.trim();
            executeCommand(command);
            input.value = '';
            resetAutocomplete();
        } else if (event.key === 'Tab') {
            event.preventDefault();
            autocompleteCommand();
        }
    }

    function executeCommand(command) {
        let responseText = '';

        const [baseCommand, ...args] = command.split(' ');
        const arg = args.join(' ');

        switch (baseCommand) {
            case 'ls':
            case 'la':
            case 'll':
            case 'l':
            case 'ls -a':
            case 'ls -l':
            case 'ls -la':
            case 'ls -ll':
                responseText = listDirectoryContents();
                break;
            case 'cd':
                responseText = changeDirectory(arg);
                break;
            case 'nvim':
                responseText = openFile(arg);
                break;
            case 'clear':
                responseText = clearConsole();
                break;
            case '-help':
                responseText = getHelpText();
                break;
            case 'theme':
                responseText = arg === '-list' ? listThemes() : changeTheme(arg);
                break;
            case '~':
                responseText = changeDirectory('/');
                break;
            default:
                responseText = `zsh: command not found: ${command}. Use '-help' for more information.`;
        }

        createOutputLine('response', responseText);
        scrollToBottom();
    }

    function createOutputLine(className, text) {
        const line = document.createElement('p');
        line.className = className;
        line.innerHTML = text;
        output.appendChild(line);
    }

    function listDirectoryContents() {
        return `.<br>..` + fileSystem[currentDirectory].map(item => {
            const isDirectory = !item.includes('.html');
            return `<br>${isDirectory ? '📁' : '📄'} ${item}`;
        }).join('');
    }

    function changeDirectory(dir) {
        if (dir === '..') {
            if (currentDirectory !== '/') {
                currentDirectory = currentDirectory.split('/').slice(0, -1).join('/') || '/';
            }
        } else {
            const newPath = currentDirectory === '/' ? `/${dir}` : `${currentDirectory}/${dir}`;
            if (fileSystem[newPath]) {
                currentDirectory = newPath;
            } else {
                return `zsh: command not found: cd ${dir}. Use '-help' for more information.`;
            }
        }
        return `Changed directory to ${currentDirectory}`;
    }

    function openFile(file) {
        const filePath = currentDirectory === '/' ? `./${file}` : `./${currentDirectory}/${file}`;
        if (fileSystem[currentDirectory].includes(file)) {
            fetch(filePath)
                .then(response => response.text())
                .then(data => {
                    createOutputLine('nvim', `
                        <div class="nvim-header">NVIM - ${filePath}</div>
                        <div class="nvim-content">${data}</div>
                    `);
                    scrollToBottom();
                })
                .catch(error => console.error('Error opening file:', error));
            return '';
        } else {
            return `zsh: file not found: ${file}. Use '-help' for more information.`;
        }
    }

    function clearConsole() {
        output.innerHTML = '';
        return '';
    }

    function changeTheme(theme) {
        const themePath = `themes/${theme}.css`;
        if (themes.includes(themePath)) {
            themeLink.href = themePath;
            return `Changed theme to ${theme}`;
        } else {
            return `zsh: theme not found: ${theme}. Available themes: ${themes.map(t => t.split('/').pop().replace('.css', '')).join(', ')}.`;
        }
    }

    function listThemes() {
        return `
            <strong>Available themes:</strong><br>
            ${themes.map(t => t.split('/').pop().replace('.css', '')).join('<br>')}
        `;
    }

    function getHelpText() {
        return `
            <strong>Available commands:</strong><br>
            <strong>ls</strong> - List all files and folders in the current directory<br>
            <strong>cd [directory]</strong> - Change directory<br>
            <strong>cd ..</strong> - Go up one directory level<br>
            <strong>nvim [file]</strong> - Open file in terminal<br>
            <strong>clear</strong> - Clear the console<br>
            <strong>theme [theme]</strong> - Change terminal theme<br>
            <strong>theme -list</strong> - List all available themes<br>
            <strong>-help</strong> - Show this help message
        `;
    }

    function autocompleteCommand() {
        const command = input.value.trim();
        const [base, partial = ''] = command.split(' ');

        let possibilities = [];
        switch (base) {
            case 'cd':
                const currentDirContents = currentDirectory === '/' ? fileSystem['/'] : fileSystem[currentDirectory] || [];
                possibilities = currentDirContents.filter(item => !item.includes('.html') && item.startsWith(partial));
                break;
            case 'nvim':
                possibilities = fileSystem[currentDirectory].filter(file => file.startsWith(partial));
                break;
            case 'theme':
                possibilities = themes.map(t => t.split('/').pop().replace('.css', '')).filter(theme => theme.startsWith(partial));
                break;
            default:
                possibilities = ['ls', 'cd ', 'nvim ', 'theme ', '-help'].filter(cmd => cmd.startsWith(partial));
        }

        if (possibilities.length) {
            autocompleteList = possibilities;
            autocompleteIndex = (autocompleteIndex + 1) % autocompleteList.length;
            input.value = `${base} ${autocompleteList[autocompleteIndex]}`.trim();
        }
    }

    function resetAutocomplete() {
        autocompleteIndex = -1;
        autocompleteList = [];
    }

    function scrollToBottom() {
        output.scrollTop = output.scrollHeight;
    }
});

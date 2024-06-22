document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('input');
    const output = document.getElementById('output');
    const themeLink = document.getElementById('theme-link');
    let currentDirectory = '/';
    let fileSystem = {
        '/': ['projects', 'education.html', 'contact.html'],
        '/projects': []
    };
    let themes = [];
    let autocompleteIndex = -1;
    let autocompleteList = [];

    // Fetch the list of projects and themes dynamically
    fetchProjects();
    fetchThemes();

    input.addEventListener('keydown', handleInput);

    // Add blinking cursor
    setInterval(() => {
        if (input.style.caretColor === 'transparent') {
            input.style.caretColor = '#c5c8c6';
        } else {
            input.style.caretColor = 'transparent';
        }
    }, 500);

    function fetchProjects() {
        fetch('./projects/')
            .then(response => response.text())
            .then(data => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(data, 'text/html');
                const files = [...doc.querySelectorAll('a')].map(a => a.href.split('/').pop()).filter(file => file.endsWith('.html'));
                fileSystem['/projects'] = files;
            })
            .catch(error => console.error('Error fetching projects:', error));
    }

    function fetchThemes() {
        fetch('./themes/')
            .then(response => response.text())
            .then(data => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(data, 'text/html');
                themes = [...doc.querySelectorAll('a')].map(a => `themes/${a.href.split('/').pop()}`).filter(file => file.endsWith('.css'));
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

        if (command === 'ls' || command === 'ls -a' || command === 'ls -l' || command === 'ls -la' || command === 'ls -ll' || command === 'la') {
            responseText = listDirectoryContents();
        }
        else if (command.startsWith('cd ')) {
            responseText = changeDirectory(command.split(' ')[1]);
        }
        else if (command.startsWith('nvim ')) {
            responseText = openFile(command.split(' ')[1]);
        }
        else if (command === 'clear') {
            responseText = clearConsole();
        }
        else if (command === '--help') {
            responseText = getHelpText();
        }
        else if (command.startsWith('theme ')) {
            const subcommand = command.split(' ')[1];
            if (subcommand === '--list') {
                responseText = listThemes();
            } else {
                responseText = changeTheme(subcommand);
            }
        }
        else if (command === '~') {
            responseText = changeDirectory('/');
        }
        else {
            responseText = `zsh: command not found: ${command}. Use '--help' for more information.`;
        }

        createOutputLine('response', responseText);
        scrollToBottom();
    }

    function createOutputLine(className, text) {
        const line = document.createElement('p');
        line.className = className;
        line.innerHTML = text;
        output.appendChild(line);
        return line;
    }

    function listDirectoryContents() {
        return `.<br>..` + fileSystem[currentDirectory].map(item => {
            const isDirectory = !item.includes('.html');
            const icon = isDirectory ? '📁' : '📄 ';
            return `<br>${icon} ${item}`;
        }).join('');
    }

    function changeDirectory(dir) {
        if (dir === '..') {
            if (currentDirectory !== '/') {
                currentDirectory = currentDirectory.split('/').slice(0, -1).join('/') || '/';
            }
            return `Changed directory to ${currentDirectory}`;
        } else {
            const newPath = currentDirectory === '/' ? `/${dir}` : `${currentDirectory}/${dir}`;
            if (fileSystem[newPath]) {
                currentDirectory = newPath;
                return `Changed directory to ${currentDirectory}`;
            } else {
                return `zsh: command not found: cd ${dir}. Use '--help' for more information.`;
            }
        }
    }

    function openFile(file) {
        const filePath = currentDirectory === '/' ? `./${file}` : `./${currentDirectory}/${file}`;
        if (fileSystem[currentDirectory].includes(file)) {
            fetch(filePath)
                .then(response => response.text())
                .then(data => {
                    createOutputLine('nvim', `
                        <div class="nvim-header">NVIM - ${filePath}</div>
                        <div class="nvim-content">${escapeHtml(data)}</div>
                    `);
                    scrollToBottom();
                })
                .catch(error => console.error('Error opening file:', error));
            return '';
        } else {
            return `zsh: file not found: ${file}. Use '--help' for more information.`;
        }
    }

    function clearConsole() {
        output.innerHTML = '';
        return '';
    }

    function escapeHtml(unsafe) {
        return unsafe.replace(/[&<"']/g, function (m) {
            switch (m) {
                case '&':
                    return '&amp;';
                case '<':
                    return '&lt;';
                case '>':
                    return '&gt;';
                case '"':
                    return '&quot;';
                case "'":
                    return '&#039;';
                default:
                    return m;
            }
        });
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
            <strong>theme --list</strong> - List all available themes<br>
            <strong>~</strong> - Go to the home directory<br>
            <strong>--help</strong> - Show this help message
        `;
    }

    function autocompleteCommand() {
        const command = input.value.trim();
        const parts = command.split(' ');
        const base = parts[0];
        const partial = parts[1] || '';

        let possibilities = [];
        if (base === 'cd') {
            const currentDirContents = currentDirectory === '/' ? fileSystem['/'] : fileSystem[currentDirectory] || [];
            possibilities = currentDirContents.filter(item => !item.includes('.html') && item.startsWith(partial));
        } else if (base === 'nvim') {
            possibilities = fileSystem[currentDirectory].filter(file => file.startsWith(partial));
        } else if (base === 'theme') {
            possibilities = themes.map(t => t.split('/').pop().replace('.css', '')).filter(theme => theme.startsWith(partial));
        } else if (!base) {
            possibilities = ['ls', 'cd ', 'nvim ', 'theme ', '--help'].filter(cmd => cmd.startsWith(partial));
        }

        if (possibilities.length > 0) {
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

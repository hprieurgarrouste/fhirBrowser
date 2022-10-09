customElements.define('app-linear-progress', class AppLinearProgress extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'closed' }).appendChild(AppLinearProgressTemplate.content.cloneNode(true));
    }
});

const AppLinearProgressTemplate = document.createElement('template');
AppLinearProgressTemplate.innerHTML = `
    <style>
        main {
            background-color: var(--border-color);
            overflow: hidden;
        }
        .thumb {
            height: 0.1em;
            width: 50%;
            background-color: var(--primary-color);
            left: -50%;
            position: relative;
            animation: loading 2s ease-in 0.5s infinite;
        }
        @keyframes loading {
            0% {transform:translateX(0)}
            to {transform:translateX(400%)}
        }
    </style>
    <main>
        <div class="thumb" />
    </main>
`;
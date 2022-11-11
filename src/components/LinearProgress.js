(function () {
    class LinearProgress extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'closed' }).appendChild(template.content.cloneNode(true));
        }
    };

    const template = document.createElement('template');
    template.innerHTML = `
        <style>
            main {
                background-color: var(--border-color);
                overflow: hidden;
            }
            .thumb {
                height: 0.2em;
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

    window.customElements.define('linear-progress', LinearProgress);
})();

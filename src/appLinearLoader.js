customElements.define('app-linear-loader', class AppLinearLoader extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'closed' }).innerHTML = `
            <style>
                .track {
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
            <div class="track">
                <div class="thumb" />
            </div>
       `;
    }
});

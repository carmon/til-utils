// TS -> HTML

import { BUTTON, DEFAULTS, DIV, H1, INPUT } from './styles';

export default (
    code: string,
) => {
    return `
        <head>
            <title>til-utils</title>
            <script>
                const createBlog = () => {
                    const name = document.getElementById("name").value;
                    window.location = '/create?code=${code}&name=' + name;
                }
            </script>
            <style>
                ${DEFAULTS}
                ${DIV}
                ${H1}
                label {
                    margin-top: 10px;
                    color: rgb(40, 13, 95);
                    font-size: 13px;
                    font-weight: bold;
                }
                ${INPUT}
                ${BUTTON}
            </style>
        </head>
        <body>
            <div>
                <h1>TilUtils</h1>
                <label for="name">Repository name</label>
                <input id="name" autocomplete="off" type="text" />
                <button onclick="createBlog()">Create your blog!</button>
            </div>
        </body>
    `;
};
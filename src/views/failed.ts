// TS -> HTML
import { DEFAULTS, DIV, H1 } from './styles';

export default (
    name: string,
) => {
    return `
        <head>
            <title>til-utils</title>
            <style>
                ${DEFAULTS}
                ${DIV}
                ${H1}
                span {
                    color: rgb(40, 13, 95);
                }
            </style>
        </head>
        <body>
            <div>
                <h1>TilUtils</h1>
                <p>There was an error creating blog's repo with name <b>${name}</b>.</p>
                <span>Check out if you don't a repo with the same name and trying again in a few minutes.<span>
            </div>
        </body>
    `;
};
// TS -> HTML
import { getA } from './tags';
import { DEFAULTS, DIV, H1 } from './styles';

export default (
    owner: string,
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
                <p>Static blog repo created with name <b>${name}</b> for user ${owner}, ${getA(`https://github.com/${owner}/${name}`, 'check it out')}.</p>
                <span>Check out your build job in the github action.</span>
                <span>You'll need a deployment service to put your blog online, check out the docs.</span>
            </div>
        </body>
    `;
};
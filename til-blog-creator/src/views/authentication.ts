// TS -> HTML
import { getA } from './tags';
import { BUTTON, DEFAULTS, DIV, H1 } from './styles';

const defaultScope = 'repo';

export default (
    client_id: string,
    scope: string = defaultScope
) => `
<head>
    <title>til-utils</title>
    <script>
        const redirectToOauth = () => {
            window.location = 'https://github.com/login/oauth/authorize?client_id=${client_id}&scope=${scope}';
        }
    </script>
    <style>
        ${DEFAULTS}
        ${DIV}
        ${H1}
        p {
            color: rgb(40, 13, 95);
            font-weight: 400;
            line-height: 1.5;
            margin-bottom: 25px;
            margin-top: 10px;
        }
        ${BUTTON}
        span {
            color: rgb(40, 13, 95);
            font-size: 12px;
            font-weight: 400;
        }
    </style>
</head>
<body>
    <div>
        <h1>TilUtils</h1>
        <p>The #1 static blog creator on Github Repository Chain.</p>                
        <button onclick="redirectToOauth()">Grant Github auth</button>
        <br/>
        <span>You can revoke the access later in your ${getA('https://github.com/settings/applications?o=used-desc', 'github settings')}.</span>
        <span>Your github user account will NOT be compromised.</span>
        <span>This app code can be access ${getA('https://github.com/carmon/til-utils', 'here')}.</span>
    </div>
</body>
`;
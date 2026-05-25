const BASE = 'https://img.shields.io/badge';
const STYLE = 'for-the-badge';

const badge = (label, color, logo, logoColor = 'white') =>
    `${BASE}/${encodeURIComponent(label)}-${color}?style=${STYLE}&logo=${logo}&logoColor=${logoColor}`;

export const badges = {
    python: badge('Python', '3776AB', 'python'),
    fastapi: badge('FastAPI', '009688', 'fastapi'),
    postgresql: badge('PostgreSQL', '4169E1', 'postgresql'),
    dotnet: badge('.NET', '512BD4', 'sharp'),
    unity: badge('Unity', '000000', 'unity'),
    blender: badge('Blender', 'F5792A', 'blender'),
    threedsmax: badge('3ds Max', '0696D7', 'autodesk'),
    aws: badge('AWS', '232F3E', 'elasticstack'),
    go: badge('Go', '00ADD8', 'go'),
    angular: badge('Angular', 'DD0031', 'angular'),
    mysql: badge('MySQL', '4479A1', 'mysql'),
};

export const badgeLabels = {
    python: 'Python',
    fastapi: 'FastAPI',
    postgresql: 'PostgreSQL',
    dotnet: '.NET',
    unity: 'Unity',
    blender: 'Blender',
    threedsmax: '3ds Max',
    aws: 'AWS',
    go: 'Go',
    angular: 'Angular',
    mysql: 'MySQL',
};

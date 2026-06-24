const BASE = 'https://img.shields.io/badge';
const STYLE = 'for-the-badge';

// Preserve forward slashes - shields needs them intact inside data URI logos
const encodeLogo = (logo) => encodeURIComponent(logo).replace(/%2F/gi, '/');

const badge = (label, color, logo, logoColor = 'white') => {
    const base = `${BASE}/${encodeURIComponent(label)}-${color}?style=${STYLE}&logoColor=${logoColor}`;
    return logo ? `${base}&logo=${encodeLogo(logo)}` : base;
};

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
    java: badge('Java', 'ED8B00', 'openjdk'),
    kafka: badge('Kafka', '231F20', 'apachekafka'),
    zookeeper: badge('Zookeeper', '525252'),
    tensorflow: badge('TensorFlow', 'FF6F00', 'tensorflow'),
    keras: badge('Keras', 'D00000', 'keras'),
    flask: badge('Flask', '000000', 'flask'),
    photoshop: badge('Photoshop', '31A8FF'),
    premierepro: badge('Premiere Pro', '9999FF'),
    flutter: badge('Flutter', '02569B', 'flutter'),
    cloudflare: badge('Cloudflare', 'F38020', 'cloudflare'),
};

/**
 * Adobe logo resolver
 * Adobe marks were removed from Simple Icons, so shields cannot resolve their
 * slugs - load the local white SVGs and inline them as data URI logos instead
 */
const ADOBE_LOGOS = {
    photoshop: { label: 'Photoshop', color: '31A8FF', file: 'src/img/badges/photoshop.svg' },
    premierepro: { label: 'Premiere Pro', color: '9999FF', file: 'src/img/badges/premiere.svg' },
};

const fileLogo = async (path) => {
    const res = await fetch(path);
    const svg = await res.text();
    return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export async function resolveBadges() {
    await Promise.all(Object.entries(ADOBE_LOGOS).map(async ([key, { label, color, file }]) => {
        try {
            const logo = await fileLogo(file);
            badges[key] = badge(label, color, logo);
        } catch {
            // Keep the text-only fallback if the SVG fails to load
        }
    }));
}

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
    java: 'Java',
    kafka: 'Kafka',
    zookeeper: 'Zookeeper',
    tensorflow: 'TensorFlow',
    keras: 'Keras',
    flask: 'Flask',
    photoshop: 'Photoshop',
    premierepro: 'Premiere Pro',
    flutter: 'Flutter',
    cloudflare: 'Cloudflare',
};

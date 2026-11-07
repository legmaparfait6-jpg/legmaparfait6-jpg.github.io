import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

THREE.ColorManagement.enabled = false;
const PARAMS = new URLSearchParams(location.search), RENDU = PARAMS.has('rendu'), RESEAUX = PARAMS.has('reseaux') || RENDU;
if (RENDU) { let h_ = 0; performance.now = () => h_; window.__hor = (x) => { h_ = x; }; }
const LANG = PARAMS.get('lang') === 'en' ? 'en' : 'fr';
document.documentElement.lang = LANG;
const TR = LANG === 'fr' ? {} : {
  'Chargement du film': 'Loading the film',
  'Développeur full-stack': 'Full-stack developer',
  'Développeur Full-Stack': 'Full-Stack Developer',
  'Avant le CV, une histoire. Moins de deux minutes.': 'Before the CV, a story. Under two minutes.',
  'Ne touchez à rien. Regardez.': 'Touch nothing. Watch.',
  'Fiction construite à partir de faits réels de ses projets. Touchez l’écran pour le son.': 'Fiction built from real facts of his projects. Tap the screen for sound.',
  'Activer le son': 'Turn sound on', 'Couper le son': 'Turn sound off', 'Passer le film': 'Skip the film', 'Revoir le film': 'Watch the film again',
  'Parlons de votre projet': 'Let’s talk about your project', 'Écrire sur WhatsApp': 'Message on WhatsApp', 'Envoyer un e-mail': 'Send an email',
  'Projets': 'Projects', 'Compétences': 'Skills', 'Parcours': 'Journey', 'Contact': 'Contact', 'CV': 'CV', 'Le site complet': 'Full website',
  // journal du film
  '$ superviser --reseau': '$ monitor --network', 'découverte : Nmap · ping · SNMP': 'discovery: Nmap · ping · SNMP', 'contrôle de chaque équipement, chaque minute': 'every device checked, every minute',
  'équipement 17 · échec 1/3': 'device 17 · failure 1/3', 'équipement 17 · échec 2/3': 'device 17 · failure 2/3', 'équipement 17 · échec 3/3': 'device 17 · failure 3/3', 'PANNE DÉCLARÉE': 'OUTAGE DECLARED',
  'ticket ouvert · délai critique : 180 min': 'ticket opened · critical deadline: 180 min', 'escalade automatique › niveau 3': 'automatic escalation › level 3',
  'trois sources de données · cinq analyseurs': 'three data sources · five analysers', 'analyse technique · contexte macro-économique': 'technical analysis · macroeconomic context', 'trois moteurs de score : calcul': 'three scoring engines: computing',
  '> exécuter l’ordre ?': '> execute the order?', 'ORDRE REFUSÉ': 'ORDER REFUSED', 'l’outil ne passe aucun ordre · la décision reste humaine': 'the tool places no orders · the decision stays human',
  'quinze modules · treize métiers': 'fifteen modules · thirteen trades', 'caisse · stock · dettes · boutique en ligne': 'till · stock · debts · online store', 'réseau : perdu': 'network: lost',
  'réseau : rétabli · ventes envoyées, heure réelle conservée': 'network: restored · sales sent, real time kept', '453 tests automatisés · en ligne : commerce.fasodigit.com': '453 automated tests · live: commerce.fasodigit.com',
  'CodeBurkina · les cours lus à voix haute, en français': 'CodeBurkina · lessons read aloud, in French', 'en pré-lancement': 'in pre-launch',
  'FasoDigit · attestation vérifiable par QR code': 'FasoDigit · certificate verifiable by QR code', '482 tests automatisés · en ligne : fasodigit.com': '482 automated tests · live: fasodigit.com',
  'application livrée à un client · octobre 2026': 'app delivered to a client · October 2026', 'un coursier de Ouagadougou': 'a courier in Ouagadougou', 'ses missions · l’argent du jour · la monnaie à rendre': 'his jobs · the day’s money · the change to give back',
  'encore en construction : FasoConsult · SuperMarché · Scolarité': 'still under construction: FasoConsult · SuperMarché · Scolarité', '> en attente de votre projet_': '> waiting for your project_',
  // légendes
  'Au commencement, un problème : personne ne voit la panne.': 'In the beginning, a problem: nobody sees the outage.', 'Tout a commencé par une panne.': 'It all began with an outage.', 'Elle vient d’ouvrir les yeux.': 'It has just opened its eyes.',
  'Une intelligence vient de naître.': 'An intelligence has just been born.', 'Elle a d’abord appris à voir.': 'First, it learned to see.', 'Puis à juger. Mais pas à décider.': 'Then to judge. But not to decide.', 'Elle a obéi. Pour l’instant.': 'It obeyed. For now.',
  'Puis à tenir, quand tout s’éteint.': 'Then to hold on, when everything goes dark.', 'Elle ne s’éteint jamais.': 'It never goes dark.', 'Puis à parler.': 'Then to speak.', 'Et à transmettre.': 'And to pass on.', 'Et enfin, à servir une seule personne.': 'And finally, to serve one single person.',
  'Aucune machine n’a fait cela seule.': 'No machine did this alone.', 'Legma Parfait. Développeur full-stack. Ouagadougou.': 'Legma Parfait. Full-stack developer. Ouagadougou.', 'Le système n’est jamais terminé.': 'The system is never finished.', 'Ne touchez à rien.': 'Touch nothing.',
  // étiquettes
  'Network Supervision · stage chez Moov Africa · validé en laboratoire': 'Network Supervision · internship at Moov Africa · validated in a lab', 'ForexSaaS · en pause · outil d’aide à la décision': 'ForexSaaS · paused · decision-support tool', 'FasoCommerce · en ligne': 'FasoCommerce · live', 'JL EXPRESS · livré': 'JL EXPRESS · delivered',
  // fiches
  'En ligne': 'Live', 'Livré': 'Delivered', 'Pré-lancement': 'Pre-launch', 'En pause': 'Paused', 'Projet académique': 'Academic project', 'Technologies': 'Technologies', 'Voir la fiche complète': 'See the full case study', 'Le rendre à l’univers': 'Return it to the universe', 'Monde': 'World',
  '15 modules, 15 lunes': '15 modules, 15 moons', '4 parcours, 4 lunes': '4 areas, 4 moons', '4 lunes': '4 moons',
  'Catalogue en ligne': 'Online catalogue', 'Commandes WhatsApp': 'WhatsApp orders', 'Caisse': 'Till', 'Stock': 'Stock', 'Alimentaire': 'Food', 'Prestations': 'Services', 'Rendez-vous': 'Bookings', 'Livraison': 'Delivery', 'Précommandes': 'Pre-orders', 'Prix de gros': 'Wholesale prices', 'Dépenses': 'Expenses', 'Fournisseurs': 'Suppliers', 'Restaurant': 'Restaurant', 'Formations': 'Courses', 'Garage': 'Garage',
  'Missions': 'Jobs', 'Clients': 'Clients', 'Argent': 'Money', 'Studio': 'Studio', 'Guides': 'Guides', 'Club': 'Club',
  'Une plateforme de gestion pensée pour le téléphone : la caisse continue sans réseau, le stock, les dettes et la boutique en ligne sont au même endroit. Chaque commerce active les modules de son métier. Ouverte à la vente, avec 30 jours d’essai gratuit.': 'A phone-first management platform: the till keeps working without network; stock, debts and the online store are in one place. Each business turns on the modules its trade needs. Open for sale, with a 30-day free trial.',
  'Une application mobile qui met en relation clients et chauffeurs, avec un tarif calculé selon la distance.': 'A mobile app connecting customers and drivers, with a fare computed from the distance.',
  'Une application livrée à un coursier de Ouagadougou. Ses missions, ses clients, l’argent du jour et la monnaie à rendre, plus un studio pour créer ses publicités WhatsApp.': 'An app delivered to a courier in Ouagadougou. Jobs, clients, the day’s money and change to give back, plus a studio to create WhatsApp ads.',
  'Réviser le code de la route au Burkina Faso : cours, quiz et progression enregistrée sur l’appareil.': 'Studying road rules in Burkina Faso: lessons, quizzes and progress saved on the device.',
  'Une académie en ligne (guides, formations avec attestation vérifiable, Club, CV) et des solutions sur mesure, sur un même site, sur un serveur que je gère moi-même.': 'An online academy (guides, courses with verifiable certificates, a Club, CVs) and custom solutions, on one site, on a server I run myself.',
  'Un outil d’aide à la décision : il rassemble les données de marché, les analyse et les note. L’utilisateur décide.': 'A decision-support tool: it gathers market data, analyses and scores it. The user decides.',
  'Stage chez Moov Africa : découvrir les équipements réseau, les surveiller et transformer chaque panne en incident suivi.': 'Internship at Moov Africa: discover network devices, monitor them and turn every failure into a tracked incident.',
  'Une plateforme de santé, en équipe : tickets de consultation, dossier médical partagé, ordonnances et pharmacies de garde.': 'A health platform, as a team: consultation tickets, a shared medical record, prescriptions and on-duty pharmacies.',
  'Caisse et stock pour un centre commercial de Ouagadougou : facture avec TVA calculée, fichier clients, gestion des produits.': 'Till and stock for a shopping centre in Ouagadougou: invoices with computed VAT, a customer file, product management.',
  'Une application web pour gérer la scolarité d’un établissement, en cours de développement.': 'A web app to manage a school’s administration, under development.',
  // compétences et parcours
  'Services': 'Services', 'Données': 'Data', 'Serveur': 'Server', 'Réseau': 'Network', 'Déploiement': 'Deployment',
  'Certification bureautique et design': 'Office and design certification', 'SuperMarché, en équipe à l’IAM': 'SuperMarché, as a team at IAM', 'Licence 3 Informatique de Gestion': 'BSc Business Computing, final year', 'Stage': 'Internship', 'Supervision réseau chez Moov Africa': 'Network monitoring at Moov Africa', 'FasoDigit en ligne, JL EXPRESS livré': 'FasoDigit live, JL EXPRESS delivered',
};
const _ = (s) => TR[s] ?? s;


const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
const leger = (matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 820) || (navigator.hardwareConcurrency || 8) < 4;
const $ = (id) => document.getElementById(id);
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const mix = (a, b, t) => a + (b - a) * t;
const lisse = (x) => { const t = clamp(x); return t * t * (3 - 2 * t); };
const doux = (x) => { const t = clamp(x); return t < .5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2; };

/* ---------- les projets : uniquement des faits vérifiés ---------- */
const STATUT = {
  live: { t: 'En ligne', c: '#7dffb0', anneau: true },
  delivered: { t: 'Livré', c: '#7dffb0', anneau: true },
  active: { t: 'Pré-lancement', c: '#ffc46b' },
  paused: { t: 'En pause', c: '#aab4d8' },
  academic: { t: 'Projet académique', c: '#aab4d8' },
};
const MONDES = [
  { n: 'FasoCommerce', s: 'live', code: '002', r: .44, a: '#71451e', b: '#d49538', c: '#ffe2a0', slug: 'fasocommerce', img: '../missions/fasocommerce/caisse.webp',
    d: "Une plateforme de gestion pensée pour le téléphone : la caisse continue sans réseau, le stock, les dettes et la boutique en ligne sont au même endroit. Chaque commerce active les modules de son métier. Ouverte à la vente, avec 30 jours d’essai gratuit.",
    t: ['Next.js', 'FastAPI', 'PostgreSQL', 'Docker'], lt: '15 modules, 15 lunes',
    lunes: ['Catalogue en ligne', 'Commandes WhatsApp', 'Caisse', 'Stock', 'Alimentaire', 'Prestations', 'Rendez-vous', 'Livraison', 'Précommandes', 'Prix de gros', 'Dépenses', 'Fournisseurs', 'Restaurant', 'Formations', 'Garage'] },
  { slug: 'taxi-compteur', n: 'Taxi Compteur', s: 'academic', code: '005', r: .17, a: '#6d321e', b: '#df7647', c: '#ffc487',
    d: "Une application mobile qui met en relation clients et chauffeurs, avec un tarif calculé selon la distance.", t: ['Flutter', 'Firebase'], lunes: [] },
  { n: 'JL EXPRESS', s: 'delivered', code: '007', r: .31, a: '#124765', b: '#159de0', c: '#a5e9ff', slug: 'jl-express', img: '../missions/jl-express/accueil.webp',
    d: "Une application livrée à un coursier de Ouagadougou. Ses missions, ses clients, l’argent du jour et la monnaie à rendre, plus un studio pour créer ses publicités WhatsApp.",
    t: ['Flutter', 'Dart', 'PDF'], lt: '4 parcours, 4 lunes', lunes: ['Missions', 'Clients', 'Argent', 'Studio'] },
  { slug: 'codeburkina', n: 'CodeBurkina', s: 'active', code: '006', r: .2, a: '#315623', b: '#82ae42', c: '#f1d477',
    d: "Réviser le code de la route au Burkina Faso : cours, quiz et progression enregistrée sur l’appareil.", t: ['Flutter', 'Dart', 'Provider'], lunes: [] },
  { slug: 'fasodigit', n: 'FasoDigit', s: 'live', code: '004', r: .35, a: '#18553e', b: '#34bb78', c: '#b5ffd2',
    d: "Une académie en ligne (guides, formations avec attestation vérifiable, Club, CV) et des solutions sur mesure, sur un même site, sur un serveur que je gère moi-même.",
    t: ['Python', 'Django', 'PostgreSQL', 'nginx'], lunes: ['Guides', 'Formations', 'Club', 'CV'], lt: '4 lunes' },
  { slug: 'forexsaas', n: 'ForexSaaS', s: 'paused', code: '003', r: .17, a: '#3c286e', b: '#8b71d6', c: '#d9c8ff',
    d: "Un outil d’aide à la décision : il rassemble les données de marché, les analyse et les note. L’utilisateur décide.", t: ['Python', 'FastAPI', 'Celery'], lunes: [] },
  { slug: 'network-supervision', n: 'Network Supervision', s: 'delivered', code: '001', r: .27, a: '#174873', b: '#59a9dc', c: '#a9e6ff',
    d: "Stage chez Moov Africa : découvrir les équipements réseau, les surveiller et transformer chaque panne en incident suivi.", t: ['Python', 'Flask', 'SNMP', 'MySQL'], lunes: [] },
  { slug: 'fasoconsult', n: 'FasoConsult', s: 'active', code: '008', r: .2, a: '#0f4f52', b: '#2bb5a8', c: '#a8f5ea',
    d: "Une plateforme de santé, en équipe : tickets de consultation, dossier médical partagé, ordonnances et pharmacies de garde.", t: ['Flutter', 'React', 'PostgreSQL'], lunes: [] },
  { slug: 'centre-commercial', n: 'SuperMarché', s: 'active', code: '010', r: .19, a: '#5e1f3b', b: '#d2557f', c: '#ffc0d4',
    d: "Caisse et stock pour un centre commercial de Ouagadougou : facture avec TVA calculée, fichier clients, gestion des produits.", t: ['Python', 'Tkinter', 'MySQL'], lunes: [] },
  { slug: 'scolarite', n: 'Scolarité', s: 'active', code: '009', r: .17, a: '#2a3470', b: '#6a7ee0', c: '#c9d2ff',
    d: "Une application web pour gérer la scolarité d’un établissement, en cours de développement.", t: ['Python', 'Django'], lunes: [] },
];
const CONSTELLATIONS = [
  { n: 'Interface', x: -.74, y: .46, e: ['HTML / CSS', 'JavaScript', 'TypeScript', 'React', 'Next.js'] },
  { n: 'Services', x: -.80, y: .05, e: ['Python', 'FastAPI', 'Flask', 'Django', 'API REST'] },
  { n: 'Données', x: -.56, y: -.56, e: ['PostgreSQL', 'MySQL', 'SQL', 'Redis'] },
  { n: 'Serveur', x: .0, y: -.74, e: ['VPS Linux', 'nginx', 'Docker', 'Déploiement'] },
  { n: 'Livraison', x: .56, y: -.56, e: ['Git', 'GitHub Actions', 'pytest', 'Playwright'] },
  { n: 'Réseau', x: .80, y: .05, e: ['Nmap', 'SNMP', 'ICMP', 'TCP/IP'] },
  { n: 'Mobile', x: .74, y: .46, e: ['Flutter', 'Firebase'] },
];
const STATIONS = [
  { a: '2023', n: 'Certification bureautique et design' },
  { a: '2025', n: 'SuperMarché, en équipe à l’IAM' },
  { a: '2025–2026', n: 'Licence 3 Informatique de Gestion' },
  { a: 'Stage', n: 'Supervision réseau chez Moov Africa' },
  { a: 'Oct. 2026', n: 'FasoDigit en ligne, JL EXPRESS livré' },
];

MONDES.forEach((m) => { m.d = _(m.d); if (m.lt) m.lt = _(m.lt); m.lunes = m.lunes.map(_); });
Object.values(STATUT).forEach((x) => { x.t = _(x.t); });
CONSTELLATIONS.forEach((c) => { c.n = _(c.n); c.e = c.e.map(_); });
STATIONS.forEach((x) => { x.a = _(x.a); x.n = _(x.n); });
document.querySelectorAll('button,a,h1,h2,p,span').forEach((e) => { if (!e.children.length) { const v = TR[e.textContent.trim()]; if (v) e.textContent = v; } });
$('lienCv').href = `/${LANG}/cv/`; $('lienSite').href = `/${LANG}/`;
/* ---------- moteur ---------- */
const canvas = $('u');
const rendu = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
rendu.setPixelRatio(PARAMS.has('pr') ? Number(PARAMS.get('pr')) : leger ? Math.min(2, devicePixelRatio || 1) : Math.min(2.5, Math.max(2, devicePixelRatio || 1)));
rendu.outputColorSpace = THREE.LinearSRGBColorSpace;
rendu.setClearColor(0x02030a, 1);
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(35, 1, .05, 200);
const composer = new EffectComposer(rendu);
composer.addPass(new RenderPass(scene, cam));
const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), .22, .55, .82);
composer.addPass(bloom);
const FILM = new ShaderPass(new THREE.ShaderMaterial({
  uniforms: { tDiffuse: { value: null }, uChoc: { value: 1 }, uCentre: { value: new THREE.Vector2(.5, .5) }, uRatio: { value: 1 }, uAb: { value: 0 },
    uGrain: { value: .016 }, uVign: { value: .6 }, uFlash: { value: 0 }, uRouge: { value: 0 }, uT: { value: 0 }, uFroid: { value: 0 },
    uTrou: { value: new THREE.Vector3(.5, .5, .08) }, uTrouA: { value: 0 }, uNoir: { value: 0 }, uZoom: { value: 0 } },
  vertexShader: 'varying vec2 vU; void main(){vU=uv; gl_Position=vec4(position.xy,0.,1.);}',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float uChoc,uRatio,uAb,uGrain,uVign,uFlash,uRouge,uT,uFroid,uTrouA,uNoir,uZoom; uniform vec2 uCentre; uniform vec3 uTrou; varying vec2 vU;
    float al(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233))+uT)*43758.5453);}
    void main(){
      vec2 uv=vU; vec2 d=(uv-uCentre)*vec2(uRatio,1.); float r=length(d);
      if(uChoc<1.){float a=exp(-pow((r-uChoc*1.25)*11.,2.))*(1.-uChoc); uv-=normalize(d+1e-4)/vec2(uRatio,1.)*a*.05;}
      vec2 dT=(vU-uTrou.xy)*vec2(uRatio,1.); float rT=length(dT), rs=uTrou.z*uTrouA;
      if(uTrouA>.002){ float def=rs*rs/max(rT,rs*.5)*1.25; uv-=normalize(dT+1e-5)/vec2(uRatio,1.)*def; }
      vec2 c=uv-.5; float ab=uAb*(.3+dot(c,c)*5.);
      vec3 col=ab>.0001?vec3(texture2D(tDiffuse,uv+c*ab).r,texture2D(tDiffuse,uv).g,texture2D(tDiffuse,uv-c*ab).b):texture2D(tDiffuse,uv).rgb;
      if(uZoom>.002){vec3 sz=vec3(0.);for(int i=0;i<12;i++){sz+=texture2D(tDiffuse,.5+(uv-.5)*(1.-float(i)*uZoom*.016)).rgb;}col=sz/12.;}
      if(uTrouA>.002){
        float ca=cos(-.52),sa=sin(-.52); vec2 q=vec2(ca*dT.x-sa*dT.y,sa*dT.x+ca*dT.y); vec2 e=vec2(q.x,q.y/.2); float R=length(e)/max(rs,1e-4), an=atan(e.y,e.x);
        float bande=smoothstep(3.9,1.5,R)*smoothstep(1.05,1.5,R);
        float stries=.58+.42*sin(R*34.-uT*2.2+sin(an*3.)*1.2)*sin(R*11.+an);
        vec3 feu=mix(vec3(1.,.72,.42),vec3(.96,.97,1.),smoothstep(3.,1.3,R));
        float rr=rT/max(rs,1e-4);
        // l'arrière du disque, courbé par-dessus le trou
        float arc=exp(-pow((rr-1.42)/.2,2.))*(.55+.45*sin(rr*50.+uT));
        float anneau=exp(-pow((rr-1.04)/.035,2.));
        col*=1.-smoothstep(1.06,.94,rr)*uTrouA;
        col+=feu*arc*.75*smoothstep(0.,.3,uTrouA);
        col+=vec3(1.,.96,.88)*anneau*1.4*smoothstep(0.,.3,uTrouA);
        float devant=step(0.,-q.y+rs*.02);
        col+=feu*bande*stries*1.5*(rr>1.?1.:devant)*smoothstep(0.,.5,uTrouA);
        col+=feu*exp(-rr*.62)*.2*uTrouA;
      }
      float v=smoothstep(1.02,.28,length((vU-.5)*vec2(1.05,1.15))*1.25); col*=mix(1.,v,uVign);
      col=mix(col,col*vec3(1.35,.42,.5)+vec3(.05,.0,.008),uRouge);
      col=mix(col,col*vec3(.74,.92,1.18),uFroid);
      col+=uFlash*vec3(.88,.95,1.);
      col*=1.-uNoir;
      col+=(al(vU)-.5)*uGrain;
      gl_FragColor=vec4(col,1.);
    }`,
}));
composer.addPass(FILM);

const uPix = { value: rendu.getPixelRatio() };
const temps = { value: 0 };

const vs = (x, y, z) => new THREE.Vector3(x, y, z);
const texteDisque = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.25, 'rgba(255,255,255,.55)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
})();
const spriteAdd = (c, a = 0, s = 1, prof = false) => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: texteDisque, color: c, transparent: true, opacity: a, depthWrite: false, depthTest: prof, blending: THREE.AdditiveBlending })); m.scale.setScalar(s); return m; };

const v3 = new THREE.Vector3(), v3b = new THREE.Vector3();
/* ---------- le ciel : peint une seule fois sur la carte graphique ---------- */
function peindreCiel() {
  const rt = new THREE.WebGLRenderTarget(leger ? 1024 : 2048, leger ? 576 : 1152, { depthBuffer: false });
  const sc = new THREE.Scene(), ca = new THREE.Camera();
  sc.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    depthTest: false, depthWrite: false,
    vertexShader: 'varying vec2 v; void main(){v=uv; gl_Position=vec4(position.xy,0.,1.);}',
    fragmentShader: `varying vec2 v;
      float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<7;i++){s+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}
      void main(){
        vec2 u=v*vec2(1.78,1.);
        vec2 q=vec2(fbm(u*2.+1.),fbm(u*2.+5.2));
        vec2 r=vec2(fbm(u*2.+q*3.+1.7),fbm(u*2.+q*3.+8.3));
        float f=fbm(u*2.+r*3.);
        float b=exp(-pow((v.y-(1.08-v.x*.98)+(f-.5)*.32)*3.1,2.));
        vec2 a1=v-vec2(.2,.76),a2=v-vec2(.86,.2);
        float c1=exp(-dot(a1,a1)*9.),c2=exp(-dot(a2,a2)*8.);
        vec3 col=vec3(.006,.008,.022);
        col+=mix(vec3(.16,.08,.38),vec3(.92,.34,.62),smoothstep(.3,.75,r.x))*pow(f,2.2)*c1*2.6;
        col+=mix(vec3(.95,.42,.1),vec3(1.,.84,.6),q.y)*pow(f,4.)*c1*5.;
        col+=mix(vec3(.04,.2,.52),vec3(.24,.62,.92),smoothstep(.3,.75,r.y))*pow(f,2.4)*c2*2.2;
        col+=mix(vec3(.13,.11,.24),vec3(.72,.62,.62),f)*pow(f,1.5)*b*1.1;
        float poussiere=smoothstep(.42,.72,fbm(u*5.5+r*4.));
        col*=1.-poussiere*(b*.75+c1*.5+c2*.35);
        col*=mix(.16,1.,smoothstep(.1,.5,length((v-vec2(.5,.52))*vec2(1.25,1.))));
        gl_FragColor=vec4(col,1.);
      }`,
  })));
  rendu.setRenderTarget(rt); rendu.render(sc, ca); rendu.setRenderTarget(null);
  return rt.texture;
}
const fondNeb = new THREE.Mesh(new THREE.PlaneGeometry(120, 68), new THREE.MeshBasicMaterial({ map: peindreCiel(), depthWrite: false, toneMapped: false, transparent: true, opacity: 0 }));
fondNeb.position.z = -40; fondNeb.renderOrder = -10; scene.add(fondNeb);

function pointsEtoiles(n, zMin, zMax) {
  const p = new Float32Array(n * 3), c = new Float32Array(n * 3), s = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const z = mix(zMin, zMax, Math.random()), L = (12 - z) * .8;
    p[i * 3] = (Math.random() - .5) * L * 2; p[i * 3 + 1] = (Math.random() - .5) * L * 1.4; p[i * 3 + 2] = z;
    const t = Math.random(), col = t < .14 ? [1, .78, .55] : t < .3 ? [.72, .66, 1] : t < .5 ? [.62, .91, 1] : [1, 1, 1];
    c.set(col, i * 3); s[i] = Math.pow(Math.random(), 4) * 3.6 + .6;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('color', new THREE.BufferAttribute(c, 3)); g.setAttribute('aS', new THREE.BufferAttribute(s, 1));
  return g;
}
const matEtoile = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true,
  uniforms: { uT: temps, uPix, uA: { value: 0 } },
  vertexShader: `attribute float aS; varying vec3 vC; varying float vA; uniform float uT,uPix,uA;
    void main(){vC=color; vec4 m=modelViewMatrix*vec4(position,1.); gl_Position=projectionMatrix*m;
      gl_PointSize=aS*uPix; vA=uA*(.45+.55*abs(sin(uT*.5+position.x*7.+position.y*3.)));}`,
  fragmentShader: `varying vec3 vC; varying float vA; void main(){float d=length(gl_PointCoord-.5); if(d>.5)discard; gl_FragColor=vec4(vC,vA*smoothstep(.5,.1,d));}`,
});
const nuageEtoiles = new THREE.Points(pointsEtoiles(leger ? 3000 : 9000, -34, -3), matEtoile); nuageEtoiles.renderOrder = -3; nuageEtoiles.frustumCulled = false; scene.add(nuageEtoiles);

/* une galaxie lointaine */
function geoGalaxie(n, trou = 0) {
  const p = new Float32Array(n * 3), c = new Float32Array(n * 3), s = new Float32Array(n);
  const coeur = new THREE.Color('#ffe9c4'), bras = new THREE.Color('#7fdcff'), bord = new THREE.Color('#8a68ff');
  const col = new THREE.Color();
  for (let i = 0; i < n; i++) {
    const R = trou + (1 - trou) * Math.pow(Math.random(), 1.6), bra = Math.floor(Math.random() * 4), ang = bra / 4 * 6.283 + R * 6.2;
    const e = (1 - R * .55) * .32 * Math.pow(Math.random(), 2.4) * (Math.random() < .5 ? -1 : 1);
    const a = ang + e * 3;
    p[i * 3] = Math.cos(a) * R; p[i * 3 + 1] = Math.sin(a) * R; p[i * 3 + 2] = (Math.random() - .5) * .06 * (1.1 - R);
    col.copy(coeur).lerp(bras, clamp(R * 2.4)).lerp(bord, clamp((R - .45) * 1.8));
    c.set([col.r, col.g, col.b], i * 3); s[i] = Math.random() < .03 ? 2.6 : mix(.7, 1.5, Math.random());
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('color', new THREE.BufferAttribute(c, 3)); g.setAttribute('aS', new THREE.BufferAttribute(s, 1));
  return g;
}
const matGalaxie = () => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true,
  uniforms: { uPix, uA: { value: 0 }, uTaille: { value: 1 } },
  vertexShader: `attribute float aS; varying vec3 vC; varying float vA; uniform float uPix,uA,uTaille;
    void main(){vC=color; vec4 m=modelViewMatrix*vec4(position,1.); gl_Position=projectionMatrix*m;
      gl_PointSize=min(aS*uPix*uTaille,7.*uPix); vA=uA;}`,
  fragmentShader: `varying vec3 vC; varying float vA; void main(){float d=length(gl_PointCoord-.5); if(d>.5)discard; gl_FragColor=vec4(vC,vA*smoothstep(.5,.05,d));}`,
});
const galaxie = new THREE.Points(geoGalaxie(leger ? 6000 : 16000), matGalaxie());
galaxie.scale.setScalar(2.1); galaxie.frustumCulled = false; galaxie.renderOrder = -2;
const pivotGal = new THREE.Group(); pivotGal.add(galaxie); pivotGal.rotation.set(-1.12, .5, .32); pivotGal.position.set(8.2, 3.4, -18);
scene.add(pivotGal);

/* ---------- le soleil : il se lève derrière sa tête ---------- */
const SOLEIL = vs(-7.2, 3.1, -13);
const soleil = new THREE.Group();
const corpsSoleil = new THREE.Mesh(new THREE.SphereGeometry(.8, 48, 32), new THREE.ShaderMaterial({
  uniforms: { uT: temps, uA: { value: 0 } }, transparent: true,
  vertexShader: 'varying vec3 vP,vN; void main(){vP=position; vN=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader: `uniform float uT,uA; varying vec3 vP,vN;
    float h(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
    float n(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}
    float fbm(vec3 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*n(p);p*=2.1;a*=.5;}return s;}
    void main(){float g=fbm(vP*7.+vec3(uT*.05,0.,0.)); vec3 c=mix(vec3(1.,.62,.2),vec3(1.,.96,.72),smoothstep(.3,.7,g)); c*=1.25; float z=clamp(vN.z,0.,1.); c=mix(vec3(1.,.42,.08),c,smoothstep(0.,.5,z)); gl_FragColor=vec4(c,uA);}`,
}));
const coronaS = spriteAdd('#ffb066', 0, 9, true), coeurS = spriteAdd('#fff0d0', 0, 3.6, true), trainee = spriteAdd('#ffcf9a', 0, 1, true), traineeV = spriteAdd('#ffd9b0', 0, 1, true);
trainee.scale.set(30, .34, 1); traineeV.scale.set(.2, 9, 1);
soleil.add(corpsSoleil, coronaS, coeurS, trainee, traineeV); scene.add(soleil);

/* ---------- la rivière de lumière ---------- */
const NR = leger ? 26000 : 78000;
const riv = { a: new Float32Array(NR), t: new Float32Array(NR), j: new Float32Array(NR * 2), v: new Float32Array(NR), c: new Float32Array(NR) };
for (let i = 0; i < NR; i++) {
  riv.a[i] = Math.floor(Math.random() * 7) / 7 * 6.283 + (Math.random() - .5) * .08; riv.t[i] = Math.random(); riv.v[i] = Math.random(); riv.c[i] = Math.random();
  const u = Math.sqrt(-2 * Math.log(Math.max(1e-4, Math.random()))), an = Math.random() * 6.283; riv.j.set([u * Math.cos(an), u * Math.sin(an)], i * 2);
}
const geoRiv = new THREE.BufferGeometry();
geoRiv.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NR * 3), 3));
geoRiv.setAttribute('aA', new THREE.BufferAttribute(riv.a, 1)); geoRiv.setAttribute('aT', new THREE.BufferAttribute(riv.t, 1));
geoRiv.setAttribute('aJ', new THREE.BufferAttribute(riv.j, 2)); geoRiv.setAttribute('aV', new THREE.BufferAttribute(riv.v, 1)); geoRiv.setAttribute('aC', new THREE.BufferAttribute(riv.c, 1));
const uRiv = { uT: temps, uPix, uA: { value: 0 }, uC: { value: vs(0, -2.6, -1.5) }, uFort: { value: 0 } };
const riviere = new THREE.Points(geoRiv, new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: uRiv,
  vertexShader: `attribute float aA,aT,aV,aC; attribute vec2 aJ; uniform float uT,uPix,uA,uFort; uniform vec3 uC; varying vec3 vC; varying float vX;
    void main(){
      float t=fract(aT+uT*(.012+.012*aV)+aA*.3);
      float r=mix(11.,1.05,pow(t,.72));
      float th=aA+log(r)*2.5+sin(r*1.3+aA*2.)*.2;
      vec3 p=vec3(cos(th)*r,0.,sin(th)*r);
      float large=.012+.05*r*(.22+.78*aV*aV);
      p.xz+=aJ*large;
      p.y=sin(th*2.+uT*.25)*.05+aJ.x*.008;
      vec4 m=viewMatrix*vec4(p+uC,1.); gl_Position=projectionMatrix*m;
      float d=-m.z;
      gl_PointSize=clamp((2.2+aV*aV*3.5)*uPix*(5./max(d,.5)),.8,6.*uPix);
      vC=mix(vec3(.42,.78,1.),vec3(1.,.8,.5),smoothstep(.62,.95,aC)); vC=mix(vC,vec3(1.),smoothstep(.97,1.,aC));
      float bout=smoothstep(0.,.1,t)*smoothstep(1.,.86,t);
      vX=uA*bout*(.12+.55*aV*aV+uFort*.3)*smoothstep(.3,1.6,d);
    }`,
  fragmentShader: 'varying vec3 vC; varying float vX; void main(){float d=length(gl_PointCoord-.5); if(d>.5)discard; gl_FragColor=vec4(vC,vX*smoothstep(.5,.1,d));}',
}));
riviere.frustumCulled = false; scene.add(riviere);

/* ---------- comètes ---------- */
const matComete = () => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uA: { value: 0 }, c: { value: new THREE.Color('#bfeaff') } },
  vertexShader: 'varying vec2 v; void main(){v=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader: 'uniform float uA; uniform vec3 c; varying vec2 v; void main(){float e=1.-abs(v.y-.5)*2.; float f=pow(v.x,3.2); float a=f*pow(e,mix(5.,1.6,f)); vec3 col=mix(c,vec3(1.),pow(v.x,8.)); gl_FragColor=vec4(col,a*uA);}',
});
const cometes = Array.from({ length: leger ? 2 : 4 }, () => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), matComete()); m.visible = false; m.frustumCulled = false; scene.add(m); return { m, vie: 0, d: 1, v: vs(0, 0, 0), attente: 2 + Math.random() * 6 }; });
function majCometes(dt) {
  cometes.forEach((c) => {
    if (c.vie <= 0) {
      c.attente -= dt; c.m.visible = false;
      if (c.attente <= 0) {
        const z = -6 - Math.random() * 13, hh = (camZ - z) * .315, hw = hh * cam.aspect, an = -2.45 + (Math.random() - .5) * .5, sens = Math.random() < .25 ? Math.PI : 0;
        c.v.set(Math.cos(an + sens), Math.sin(an + sens), 0).multiplyScalar(hh * (.7 + Math.random() * .7));
        c.m.position.set((Math.random() * 1.4 - .1) * hw * (sens ? -1 : 1), hh * (.6 + Math.random() * .5) * (sens ? -1 : 1), z);
        c.m.rotation.z = Math.atan2(c.v.y, c.v.x); c.m.scale.set(hh * (.55 + Math.random() * .55), hh * .016, 1);
        c.vie = c.d = 1.6 + Math.random() * 1.3; c.m.visible = true; c.attente = 4 + Math.random() * 9;
        c.m.material.uniforms.c.value.set(['#bfeaff', '#ffd9b0', '#e2c9ff', '#bfeaff'][Math.floor(Math.random() * 4)]);
      }
      return;
    }
    c.vie -= dt; c.m.position.addScaledVector(c.v, dt);
    const f = 1 - c.vie / c.d; c.m.material.uniforms.uA.value = lisse(f * 6) * lisse((1 - f) * 3) * .95;
  });
}

/* ---------- le visage : des étoiles séparées, transparentes, révélées partie par partie ---------- */
const META = await (await fetch('visage.json')).json();
const brutB = await (await fetch('visage.bin')).arrayBuffer();
const brutF = new Float32Array(brutB), brutO = new Uint8Array(brutB);
const NV = leger ? Math.floor(META.n * .6) : META.n;
const pos = new Float32Array(NV * 3), aB4 = new Uint8Array(NV * 4), aSeed = new Float32Array(NV), aRand = new Float32Array(NV * 3), aEt_ = new Float32Array(NV * 2);
for (let i = 0; i < NV; i++) {
  pos[i * 3] = brutF[i * 4]; pos[i * 3 + 1] = brutF[i * 4 + 1]; pos[i * 3 + 2] = brutF[i * 4 + 2];
  for (let k = 0; k < 4; k++) aB4[i * 4 + k] = brutO[i * 16 + 12 + k];
  aSeed[i] = Math.random();
  const a = Math.random() * 6.283, u = Math.random() * 2 - 1, s = Math.sqrt(1 - u * u);
  aRand[i * 3] = s * Math.cos(a); aRand[i * 3 + 1] = s * Math.sin(a); aRand[i * 3 + 2] = u;
  aEt_[i * 2] = Math.random() < .045 ? .4 + Math.random() * .6 : 0;
  const q = Math.random(); aEt_[i * 2 + 1] = q < .68 ? 0 : q < .9 ? 1 : 2;
}
const eyeLocal = META.yeux.map((e) => vs(e.c[0], e.c[1], e.c[2] + .03));
const centreYeux = vs((eyeLocal[0].x + eyeLocal[1].x) / 2, (eyeLocal[0].y + eyeLocal[1].y) / 2, (eyeLocal[0].z + eyeLocal[1].z) / 2);
const bouche = vs(...META.bouche);
const geoV = new THREE.BufferGeometry();
geoV.setAttribute('position', new THREE.BufferAttribute(pos, 3));
geoV.setAttribute('aB', new THREE.BufferAttribute(aB4, 4, true));
geoV.setAttribute('aSeed', new THREE.BufferAttribute(aSeed, 1));
geoV.setAttribute('aRand', new THREE.BufferAttribute(aRand, 3));
geoV.setAttribute('aEt', new THREE.BufferAttribute(aEt_, 2));

/* la géométrie de chaque œil, en repère de paupières */
const OE = META.yeux.map((e) => {
  const c0 = vs(...e.haut[0]), c1 = vs(...e.haut[e.haut.length - 1]);
  const mid = c0.clone().add(c1).multiplyScalar(.5), ax = c1.clone().sub(c0), a = ax.length() / 2; ax.normalize();
  if (ax.x < 0) ax.multiplyScalar(-1);
  const ny = vs(-ax.y, ax.x, 0).normalize();
  const ens = (l) => l.map((p) => { const d = vs(...p).sub(mid); return [d.dot(ax), d.dot(ny)]; });
  const haut = ens(e.haut), bas = ens(e.bas);
  const dI = vs(...e.c).sub(mid);
  return { mid, ax, ny, a, hu: Math.max(...haut.map((p) => p[1])) * 1.06, hl: Math.max(.012, -Math.min(...bas.map((p) => p[1]))) * 1.08, ic: [dI.dot(ax), dI.dot(ny)], ir: e.r, haut, bas };
});

const U = {
  uT: temps, uPix, uA: { value: 1 }, uFlux: { value: 0 }, uPerte: { value: .4 }, uOnde: { value: 1 }, uOndeO: { value: new THREE.Vector2() }, uPW: { value: .01 }, uPxH: { value: 900 },
  uCible: { value: vs(0, 0, 0) }, uCibleR: { value: .5 }, uForme: { value: 1 }, uDir: { value: 1 }, uFerme: { value: 0 }, uClip: { value: 0 }, uFr: { value: 0 },
  uRegard: { value: new THREE.Vector2() }, uPupille: { value: 1 }, uLueur: { value: 0 }, uAmb: { value: vs(.62, .74, 1) },
  uPart: { value: [0, 0, 0, 0, 0, 0] },
  uOe: { value: OE.map((o) => new THREE.Vector4(o.mid.x, o.mid.y, o.a * 1.02, (o.hu + o.hl) * .62)) },
  uLP: { value: [0, 1, 2, 3].map(() => new THREE.Vector4(0, 0, 5, 0)) }, uLC: { value: [0, 1, 2, 3].map(() => new THREE.Vector3(1, 1, 1)) },
};
const matVisage = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, uniforms: U,
  vertexShader: `
    attribute vec4 aB; attribute float aSeed; attribute vec3 aRand; attribute vec2 aEt;
    uniform float uT,uPix,uA,uFlux,uPerte,uCibleR,uDir,uOnde,uPW,uPxH,uPart[6];
    uniform vec2 uOndeO; uniform vec3 uCible,uAmb,uLC[4]; uniform vec4 uLP[4],uOe[2];
    varying vec3 vC; varying float vA;
    void main(){
      float part=floor(aB.y*255.+.5); int ip=int(part);
      float rv=uPart[ip];
      float f=clamp(rv*1.5-aSeed*.5,0.,1.); f=f*f*(3.-2.*f);
      if(f<=.001){gl_Position=vec4(9.,9.,9.,1.);gl_PointSize=0.;vA=0.;vC=vec3(0.);return;}
      vec3 p=position;
      float chaud=smoothstep(.0,.3,f)*(1.-smoothstep(.45,1.,f));
      p+=aRand*(1.-f)*(.35+aSeed*1.7);
      p+=aRand*.0042;
      p+=aRand*.001*sin(uT*.9+aSeed*40.);
      if(uOnde<1.){vec2 dd=p.xy-uOndeO; float r=length(dd); float w=exp(-pow((r-uOnde*5.2)*3.,2.))*(1.-uOnde); p.xy+=normalize(dd+1e-4)*w*.13; p.z+=w*.3;}
      float parti=0.;
      if(aSeed<uPerte&&uFlux>0.){
        float front=clamp(.5+position.x*uDir*.3+(aSeed/uPerte-.5)*.3,0.,1.);
        float t=clamp(uFlux*1.9-front*.9,0.,1.); t=t*t*(3.-2.*t); parti=t;
        vec3 fin=uCible+aRand*uCibleR*(1.05+.4*fract(aSeed*91.));
        vec3 m=mix(p,fin,.5)+vec3(aRand.x*.6,.8+aRand.y*.6,aRand.z*.5);
        p=mix(mix(p,m,t),mix(m,fin,t),t);
      }
      vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv;
      float dist=-mv.z;
      vec3 n=vec3(aB.z*2.-1.,aB.w*2.-1.,0.); n.z=sqrt(max(0.,1.-dot(n.xy,n.xy)));
      vec3 lum=uAmb;
      for(int i=0;i<4;i++){vec3 L=uLP[i].xyz-position; float d2=dot(L,L); L/=sqrt(d2); float a=max(dot(n,L),0.); lum+=uLC[i]*a*a*uLP[i].w/(1.+d2*.1);}
      float c=pow(aB.x,1.25);
      float e=max(lum.r,max(lum.g,lum.b));
      float tw=aEt.x>0.?(.72+.28*sin(uT*(1.1+aSeed*2.)+aSeed*30.)):1.;
      gl_PointSize=clamp(uPW*uPxH/dist*(.72+c*.42+aEt.x*1.5),1.,(2.1+aEt.x*2.2)*uPix);
      vec3 tp=aEt.y<.5?vec3(.8,.9,1.):aEt.y<1.5?vec3(.97,.97,1.):vec3(1.,.84,.66);
      vC=mix(mix(tp,lum/max(e,.001),.55),vec3(.55,.9,1.),chaud);
      float masque=1.;
      if(part<1.5){vec4 o=uOe[ip]; vec2 q=(position.xy-o.xy)/o.zw; masque=smoothstep(.72,1.05,length(q));}
      vA=uA*f*masque*tw*clamp((c*e*.92+.022)*(1.+smoothstep(4.,9.,dist)*.75)+chaud*.5+parti*.25+aEt.x*.45,0.,1.6);
    }`,
  fragmentShader: `varying vec3 vC; varying float vA; void main(){float d=length(gl_PointCoord-.5); if(d>.5)discard; gl_FragColor=vec4(vC,vA*pow(1.-d*2.,1.35)*1.5);}`,
});
const groupeV = new THREE.Group();

/* la maille : le travail de construction reste visible, sous les étoiles */
const uFil = { uPart: U.uPart, uW: { value: 0 }, uT: temps };
const NAR = META.aretes.length / 2;
const filPos = new Float32Array(NAR * 6), filA = new Float32Array(NAR * 4);
for (let i = 0; i < NAR; i++) {
  const a = META.aretes[i * 2], b = META.aretes[i * 2 + 1], r = Math.random() * 6.283;
  for (let k = 0; k < 3; k++) { filPos[i * 6 + k] = META.maille[a * 3 + k]; filPos[i * 6 + 3 + k] = META.maille[b * 3 + k]; }
  filA[i * 4] = META.partM[a]; filA[i * 4 + 1] = r; filA[i * 4 + 2] = META.partM[a]; filA[i * 4 + 3] = r + .7;
}
const geoFil = new THREE.BufferGeometry();
geoFil.setAttribute('position', new THREE.BufferAttribute(filPos, 3));
geoFil.setAttribute('aF', new THREE.BufferAttribute(filA, 2));
const fil = new THREE.LineSegments(geoFil, new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, uniforms: uFil,
  vertexShader: `attribute vec2 aF; uniform float uPart[6],uW,uT; varying float vA;
    void main(){ float r=uPart[int(aF.x+.5)]; float b=smoothstep(0.,.15,r)*(1.-smoothstep(.55,1.,r));
      vA=smoothstep(0.,.4,r)*(uW*(.45+.55*pow(.5+.5*sin(uT*.8+aF.y),3.))+b*.26);
      gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader: `varying float vA; void main(){gl_FragColor=vec4(.42,.82,1.,vA);}`,
}));
fil.frustumCulled = false; groupeV.add(fil);
const ptsVisage = new THREE.Points(geoV, matVisage); ptsVisage.frustumCulled = false; groupeV.add(ptsVisage);
scene.add(groupeV);

/* ---------- l'œil : un objet à part, assez dense pour tenir tout l'écran ---------- */
function construireOeil(o, n, graine) {
  let s = graine; const al = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  const P = new Float32Array(n * 3), E = new Float32Array(n * 4), B = new Float32Array(n * 2);
  const lerpPoly = (l, x) => { for (let i = 0; i < l.length - 1; i++) { const a = l[i], b = l[i + 1], lo = Math.min(a[0], b[0]), hi = Math.max(a[0], b[0]); if (x >= lo && x <= hi) { const t = (x - a[0]) / ((b[0] - a[0]) || 1e-5); return a[1] + (b[1] - a[1]) * t; } } return 0; };
  let i = 0;
  const met = (x, y, rn, k, b) => { if (i >= n) return; P[i * 3] = x; P[i * 3 + 1] = y; P[i * 3 + 2] = 0; E[i * 4] = x; E[i * 4 + 1] = y; E[i * 4 + 2] = rn; E[i * 4 + 3] = k; B[i * 2] = b; B[i * 2 + 1] = al(); i++; };
  // l'iris : des milliers de fibres qui rayonnent depuis la pupille
  const NF = 420, fibres = Array.from({ length: NF }, () => ({ a: al() * 6.283, l: .72 + al() * .28, b: .3 + al() * .7, c: al() * 6.283 }));
  const nI = Math.floor(n * .54);
  for (let j = 0; j < nI; j++) {
    const fb = fibres[Math.floor(al() * NF)], rn = Math.pow(al(), .6) * fb.l;
    const ang = fb.a + (al() - .5) * .02 + Math.sin(rn * 8 + fb.c) * .035;
    const col = Math.exp(-Math.pow((rn - .3) / .13, 2)) * .62, bord = Math.exp(-Math.pow((rn - .96) / .07, 2)) * .32;
    met(Math.cos(ang), Math.sin(ang), rn, 1, fb.b * (.16 + col + bord + (1 - rn) * .12));
  }
  for (let j = 0; j < n * .05; j++) { const ang = al() * 6.283; met(Math.cos(ang), Math.sin(ang), .985 + (al() - .5) * .03, 1, .26 + al() * .2); }
  for (let j = 0; j < n * .012; j++) { const ang = al() * 6.283; met(Math.cos(ang), Math.sin(ang), .012 + al() * .02, 1, .3 + al() * .16); }
  // le blanc de l'œil, à peine visible, avec ses veines
  const a = o.a;
  for (let j = 0; j < n * .17; j++) {
    const u = al() * 2 - 1, v = al() * 2 - 1, h = Math.pow(1 - u * u, .7);
    const veine = Math.pow(.5 + .5 * Math.sin(u * 24 + v * 7 + Math.sin(v * 13) * 2), 8);
    met(u * a, v > 0 ? v * o.hu * h : v * o.hl * h, 0, 2, (.11 + veine * .2) * (1 - Math.abs(u) * .62) * (.55 + .45 * (1 - Math.abs(v))));
  }
  // les paupières
  const nL = Math.floor(n * .1);
  for (let j = 0; j < nL; j++) {
    const up = j % 3 !== 0, l = up ? o.haut : o.bas, x = (al() * 2 - 1) * a, y = lerpPoly(l, x), h = Math.pow(Math.max(0, 1 - (x / a) * (x / a)), .35);
    met(x, y + (al() - (up ? .28 : .72)) * a * (up ? .055 : .03) * h, 0, up ? 3 : 4, (up ? .85 : .42) * (.45 + al() * .55));
  }
  // les cils : de longues courbes d'étoiles
  const nC = 120, parCil = Math.floor((n * .035) / nC);
  for (let c = 0; c < nC; c++) {
    const x0 = (al() * 2 - 1) * a * .95, y0 = lerpPoly(o.haut, x0), lon = a * (.07 + al() * .08) * (1 - Math.abs(x0 / a) * .35), pente = (x0 / a) * .9 + (al() - .5) * .25;
    for (let j = 0; j < parCil; j++) { const t = j / parCil; met(x0 + pente * lon * t, y0 + lon * Math.sin(t * 1.25), 0, 3, .6 * (1 - t * .8)); }
  }
  // le pli au-dessus, et la peau autour
  while (i < n) {
    const x = (al() * 2.5 - 1.25) * a, h = Math.pow(Math.max(.02, 1 - Math.min(1, Math.abs(x / (a * 1.2))) ** 2), .55), haut_ = al() < .66;
    if (haut_) { const pli = al() < .45; const y = pli ? o.hu * 1.5 * h + a * .4 * h * .12 + (al() - .5) * a * .03 : o.hu * h + al() * a * .62; met(x, y, 0, 5, pli ? .34 * (.4 + al() * .6) : .07 + al() * .1); }
    else met(x, -o.hl * h - al() * a * .42, 0, 5, .05 + al() * .09);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(P, 3));
  g.setAttribute('aE', new THREE.BufferAttribute(E, 4));
  g.setAttribute('aV', new THREE.BufferAttribute(B, 2));
  return g;
}
const uOeils = OE.map((o) => ({
  uT: temps, uPix, uPxH: U.uPxH, uGain: { value: 1 }, uA: { value: 0 }, uOuv: { value: 0 }, uLod: { value: 1 }, uPup: { value: .4 }, uAlerte: { value: 0 }, uS: { value: .0011 }, uReg: { value: new THREE.Vector2() },
  uMid: { value: o.mid.clone() }, uAx: { value: o.ax.clone() }, uNy: { value: o.ny.clone() }, uG: { value: new THREE.Vector4(o.a, o.hu, o.hl, o.ir) }, uIc: { value: new THREE.Vector2(...o.ic) },
}));
const matOeil = (u) => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, uniforms: u,
  vertexShader: `attribute vec4 aE; attribute vec2 aV;
    uniform float uT,uPix,uPxH,uGain,uA,uOuv,uLod,uPup,uAlerte,uS; uniform vec2 uReg,uIc; uniform vec3 uMid,uAx,uNy; uniform vec4 uG;
    varying vec3 vC; varying float vA;
    float hh(float u){return pow(max(0.,1.-u*u),.7);}
    void main(){
      float k=aE.w, a=uG.x, hu=uG.y, hl=uG.z, ir=uG.w;
      if(aV.y>uLod){gl_Position=vec4(9.,9.,9.,1.);gl_PointSize=0.;vA=0.;vC=vec3(0.);return;}
      float x=aE.x,y=aE.y; float b=aV.x; vec3 c=vec3(.84,.92,1.);
      float O=uOuv;
      if(k<1.5){
        float r=mix(uPup,1.,aE.z)*ir; vec2 ce=uIc+uReg*vec2(a*.52,a*.2);
        x=ce.x+aE.x*r; y=ce.y+aE.y*r;
        vec3 or_=vec3(1.,.74,.36), bl=vec3(.72,.92,1.);
        c=mix(mix(vec3(1.,.97,.86),or_,smoothstep(.0,.42,aE.z)),bl,smoothstep(.62,.98,aE.z));
        c=mix(c,vec3(1.,.13,.08),uAlerte);
        b*=1.+uAlerte*.5;
      }
      float u=x/a, H=hh(u);
      float haut=H*(hu-(1.-O)*(hu+hl*.45)), bas=H*(-hl+(1.-O)*hl*.55);
      if(k<2.5){ if(y>haut||y<bas||abs(u)>1.){gl_Position=vec4(9.,9.,9.,1.);gl_PointSize=0.;vA=0.;vC=vec3(0.);return;} }
      else if(k<3.5){ y-=(1.-O)*(hu+hl*.45)*H; }
      else if(k<4.5){ y+=(1.-O)*hl*.55*H; }
      float bulge=(1.-clamp((x*x)/(a*a)+(y*y)/(a*a*.5),0.,1.))*a*.32;
      vec3 p=uMid+uAx*x+uNy*y+vec3(0.,0.,bulge+.025);
      vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv;
      float dist=-mv.z;
      gl_PointSize=clamp(uS*uPxH/dist*(.8+b*.9),1.,3.4*uPix);
      vC=c; vA=uA*clamp(b*uGain*(.9+.12*sin(uT*2.+aV.y*60.)),0.,1.6);
    }`,
  fragmentShader: `varying vec3 vC; varying float vA; void main(){float d=length(gl_PointCoord-.5); if(d>.5)discard; gl_FragColor=vec4(vC,vA*pow(1.-d*2.,1.1)*1.5);}`,
});
const nOe = leger ? 22000 : 64000;
const oeils = OE.map((o, k) => { const p = new THREE.Points(construireOeil(o, k === 0 ? nOe : Math.floor(nOe * .6), 971 + k * 113), matOeil(uOeils[k])); p.frustumCulled = false; p.renderOrder = 3; groupeV.add(p); return p; });

/* compatibilité avec le reste de la scène */
const uHalo = { uA: { value: 0 } };
const lueurs = [spriteAdd('#ffd9a0', 0, .3), spriteAdd('#ffd9a0', 0, .3)];
const eclairs = [spriteAdd('#ffe6c4', 0, 1), spriteAdd('#ffe6c4', 0, 1)];
lueurs.forEach((l) => groupeV.add(l)); eclairs.forEach((l) => groupeV.add(l));
const majEclats = () => {};
const briser = () => {};

/* ---------- la main : un squelette, des os, des milliers de points ---------- */
const DOIGTS = [
  { b: [-.45, .98, 0], sp: .1, l: [.45, .29, .23], r: [.078, .068, .056] },
  { b: [-.15, 1.06, 0], sp: .03, l: [.5, .33, .25], r: [.08, .07, .058] },
  { b: [.14, 1.03, 0], sp: -.04, l: [.47, .31, .24], r: [.076, .067, .056] },
  { b: [.41, .92, 0], sp: -.13, l: [.35, .23, .19], r: [.066, .058, .048] },
  { b: [-.5, .3, .12], sp: .6, l: [.42, .32, .26], r: [.098, .082, .066], pouce: true },
];
const NM = leger ? 16000 : 42000;
const mPts = [];
function surCapsule(n, longueur, r0, r1, doigt, os) {
  for (let i = 0; i < n; i++) {
    const t = Math.random(), ang = Math.random() * 6.283, r = mix(r0, r1, t) * (1 + .16 * Math.exp(-t * t * 40) + .1 * Math.exp(-Math.pow((t - 1) * 8, 2)));
    const nx = Math.cos(ang), nz = Math.sin(ang);
    mPts.push({ d: doigt, o: os, x: nx * r, y: t * longueur, z: nz * r, nx, ny: 0, nz });
  }
  for (let i = 0; i < n * .12; i++) {
    const a = Math.random() * 6.283, u = Math.random(), s = Math.sqrt(1 - u * u), nx = s * Math.cos(a), nz = s * Math.sin(a);
    mPts.push({ d: doigt, o: os, x: nx * r1, y: longueur + u * r1, z: nz * r1, nx, ny: u, nz });
  }
}
const parOs = Math.floor(NM * .052);
DOIGTS.forEach((f, d) => f.l.forEach((L, o) => surCapsule(Math.round(parOs * (L / .36)), L, f.r[o], f.r[o + 1] ?? f.r[o] * .88, d, o)));
const nPaume = Math.floor(NM * .26);
for (let i = 0; i < nPaume; i++) {
  const u = Math.random() * 2 - 1, v = Math.random();
  const lg = mix(.5, .62, v), X = u * lg, Y = v * 1.0;
  const dos = Math.random() < .5 ? 1 : -1, bombe = (1 - u * u) * .14 + .05;
  const bord = Math.abs(u) > .9;
  mPts.push({ d: -1, o: 0, x: X, y: Y, z: dos * bombe, nx: bord ? Math.sign(u) : u * .3, ny: 0, nz: bord ? .15 * dos : dos });
}
const nBras = Math.floor(NM * .14);
for (let i = 0; i < nBras; i++) {
  const t = Math.pow(Math.random(), 1.4), a = Math.random() * 6.283, Y = -t * 3.4;
  const rx = mix(.46, .62, t), rz = mix(.27, .4, t);
  const nx = Math.cos(a), nz = Math.sin(a), bruit = t * t * .5;
  mPts.push({ d: -2, o: 0, x: nx * rx + (Math.random() - .5) * bruit, y: Y + .02, z: nz * rz + (Math.random() - .5) * bruit, nx, ny: 0, nz, fin: t });
}
const NMR = mPts.length;
const hPos = new Float32Array(NMR * 3), hB = new Float32Array(NMR), hEt = new Float32Array(NMR);
for (let i = 0; i < NMR; i++) hEt[i] = Math.random() < .085 ? .35 + Math.random() * .65 : 0;
const geoM = new THREE.BufferGeometry();
geoM.setAttribute('position', new THREE.BufferAttribute(hPos, 3));
geoM.setAttribute('aB', new THREE.BufferAttribute(hB, 1));
geoM.setAttribute('aE', new THREE.BufferAttribute(hEt, 1));
const uMain = { uPix, uA: { value: 0 }, uFeu: { value: 0 }, uPW: { value: .012 }, uPxH: U.uPxH };
const matMain = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: uMain,
  vertexShader: `attribute float aB,aE; varying float vB,vE; uniform float uPix,uA,uFeu,uPW,uPxH; varying float vA;
    void main(){vec4 m=modelViewMatrix*vec4(position,1.); gl_Position=aB<0.?vec4(9.,9.,9.,1.):projectionMatrix*m;
      gl_PointSize=clamp(uPW*uPxH/-m.z*(.7+aB*.32+aE*1.2),1.,2.3*uPix); vB=aB; vE=aE; vA=uA*(.06+clamp(aB,0.,1.)*.55+aE*.5);}`,
  fragmentShader: `varying float vB,vA,vE; void main(){float d=length(gl_PointCoord-.5); if(d>.5)discard; float l=clamp(vB,0.,1.);
      vec3 c=vec3((90.+165.*l)/255.,(140.+115.*l)/255.,1.); c=mix(c,vec3(1.,.93,.78),step(.01,vE));
      gl_FragColor=vec4(c,vA*(1.-smoothstep(.36,.5,d)));}`,
});
const main = new THREE.Group();
const ptsMain = new THREE.Points(geoM, matMain); ptsMain.frustumCulled = false;
main.add(ptsMain); main.scale.setScalar(.62); main.position.set(0, -6, 1.4);
scene.add(main);
const courbes = DOIGTS.map(() => [0, 0, 0]);
const RETARD = [.1, .06, .03, 0, .14];
let tPose = 0;
const poser = (p) => { if (p !== poseC) { poseC = p; tPose = performance.now(); } };
const ecart = { v: 1 };
const POSES = {
  repos: { c: [.16, .2, .26, .3, .2], e: .8 },
  ouvert: { c: [.09, .06, .08, .13, .16], e: 1.04 },
  pointe: { c: [.0, .9, .95, .98, .66], e: .42 },
  saisir: { c: [.46, .5, .52, .54, .55], e: .95 },
  porte: { c: [.2, .24, .28, .34, .18], e: 1.1 },
};
let poseC = POSES.repos;
const os_ = DOIGTS.map(() => [{}, {}, {}]);
const tipIndex = new THREE.Vector3(), paumeLocal = vs(0, .72, 0);
const rInv = new THREE.Quaternion(), vuL = new THREE.Vector3();
function majMain(dt) {
  const v = 1 - Math.exp(-dt * 8), ecoule = (performance.now() - tPose) / 1000;
  ecart.v += (poseC.e - ecart.v) * v;
  DOIGTS.forEach((f, d) => {
    const c = courbes[d]; if (ecoule > RETARD[d]) c[0] += (poseC.c[d] - c[0]) * v;
    const cd = c[0], a1 = cd * 1.42, a2 = cd * 1.75, a3 = cd * 1.1;
    const sp = f.sp * ecart.v;
    let ox = f.b[0], oy = f.b[1], oz = f.b[2];
    const Xx = Math.cos(sp), Xy = Math.sin(sp); // axe de flexion
    let Yx = -Math.sin(sp), Yy = Math.cos(sp), Yz = 0, Zx = 0, Zy = 0, Zz = 1;
    [a1, a2, a3].forEach((a, o) => {
      const ca = Math.cos(a), sa = Math.sin(a);
      const nYx = Yx * ca + Zx * sa, nYy = Yy * ca + Zy * sa, nYz = Yz * ca + Zz * sa;
      const nZx = -Yx * sa + Zx * ca, nZy = -Yy * sa + Zy * ca, nZz = -Yz * sa + Zz * ca;
      Yx = nYx; Yy = nYy; Yz = nYz; Zx = nZx; Zy = nZy; Zz = nZz;
      Object.assign(os_[d][o], { ox, oy, oz, Xx, Xy, Yx, Yy, Yz, Zx, Zy, Zz });
      ox += Yx * f.l[o]; oy += Yy * f.l[o]; oz += Yz * f.l[o];
    });
    if (d === 0) tipIndex.set(ox, oy, oz);
  });
  const inv = rInv.copy(main.quaternion).invert(), vu = vuL.set(0, 0, 1).applyQuaternion(inv), vuX = vu.x, vuY = vu.y, vuZ = vu.z;
  for (let i = 0; i < NMR; i++) {
    const p = mPts[i]; let x, y, z, nz, lumHaut = 0;
    if (p.d >= 0) {
      const b = os_[p.d][p.o];
      x = b.ox + b.Xx * p.x + b.Yx * p.y + b.Zx * p.z;
      y = b.oy + b.Xy * p.x + b.Yy * p.y + b.Zy * p.z;
      z = b.oz + b.Yz * p.y + b.Zz * p.z;
      const Nx = b.Xx * p.nx + b.Yx * p.ny + b.Zx * p.nz, Ny = b.Xy * p.nx + b.Yy * p.ny + b.Zy * p.nz, Nz = b.Yz * p.ny + b.Zz * p.nz;
      nz = Nx * vuX + Ny * vuY + Nz * vuZ; lumHaut = Math.max(0, Ny * .6 + Nz * .4);
    } else { x = p.x; y = p.y; z = p.z; nz = p.nx * vuX + p.ny * vuY + p.nz * vuZ; lumHaut = Math.max(0, p.ny * .6 + p.nz * .4); }
    hPos[i * 3] = x; hPos[i * 3 + 1] = y; hPos[i * 3 + 2] = z;
    const rim = 1 - Math.abs(nz);
    let b = nz < 0 ? -1 : .16 + nz * .12 + rim * rim * .95 + lumHaut * .22;
    if (b > 0 && p.d >= 0 && p.o === 2 && p.y > .1) b += .14;
    if (b > 0 && p.fin !== undefined) b *= Math.pow(1 - p.fin, 1.7);
    hB[i] = b > 0 ? b + uMain.uFeu.value * .2 : -1;
  }
  geoM.attributes.position.needsUpdate = true; geoM.attributes.aB.needsUpdate = true;
}
const mainDiv = { p: vs(0, -6, 1.4), r: new THREE.Euler(0, 0, 0), a: 0, v: vs(0, 0, 0) };
const NPO = leger ? 350 : 800, poPos = new Float32Array(NPO * 3).fill(-999), poVie = new Float32Array(NPO), poVit = new Float32Array(NPO * 3);
const geoPo = new THREE.BufferGeometry(); geoPo.setAttribute('position', new THREE.BufferAttribute(poPos, 3)); geoPo.setAttribute('aV', new THREE.BufferAttribute(poVie, 1));
const ptsPo = new THREE.Points(geoPo, new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uPix },
  vertexShader: 'attribute float aV; varying float v; uniform float uPix; void main(){v=aV; vec4 m=modelViewMatrix*vec4(position,1.); gl_Position=projectionMatrix*m; gl_PointSize=(1.2+aV)*uPix*(8./-m.z);}',
  fragmentShader: 'varying float v; void main(){float d=length(gl_PointCoord-.5); if(d>.5)discard; gl_FragColor=vec4(.72,.9,1.,v*.75);}' }));
ptsPo.frustumCulled = false; scene.add(ptsPo);
let poI = 0;
function poussiere(n) { for (let k = 0; k < n; k++) { const j = Math.floor(Math.random() * NMR), a = mPts[j], i = poI++ % NPO; if (a.fin > .4) continue; const q = main.localToWorld(vs(hPos[j * 3], hPos[j * 3 + 1], hPos[j * 3 + 2])); poPos.set([q.x, q.y, q.z], i * 3); poVie[i] = 1; poVit.set([(Math.random() - .5) * .3, -.25 - Math.random() * .5, (Math.random() - .5) * .3], i * 3); } }

/* ---------- la Terre en points : les continents dessinés à la main, l'Afrique en premier ---------- */
const TERRES = [
  [[-17, 15], [-17, 21], [-13, 27.5], [-10, 31], [-6, 35.8], [-1, 35.2], [10, 37.3], [11, 33.5], [19, 30.5], [25, 31.6], [32, 31], [34, 28], [37, 21], [39, 15], [43, 11.5], [51, 12], [48, 5], [41, -2], [39, -6], [40.5, -15], [35, -20], [35, -24], [32.5, -28], [28, -33], [20, -35], [18, -32], [15, -27], [12, -18], [13.5, -9], [9, -1], [9.5, 4], [5, 6], [-4, 5], [-8, 4.5], [-13, 8.5], [-16.5, 12]],
  [[44, -16], [49.5, -12], [50, -16], [47, -25], [44, -24]],
  [[-9, 37], [-9, 43], [-1, 44.5], [-4.5, 48.5], [3, 51], [8, 54], [12, 54.5], [10, 58], [5, 59], [6, 62], [14, 68.5], [25, 71], [40, 67], [60, 69], [80, 73], [105, 77], [135, 72], [170, 69], [178, 65], [162, 58], [156, 51], [142, 59], [135, 54], [141, 46], [130, 42], [127, 35], [122, 40], [118, 38], [122, 30], [116, 22], [108, 20], [109, 12], [104, 9], [100, 13], [98, 8], [103, 2], [100, 6], [97, 16], [91, 22], [82, 16], [78, 8], [73, 17], [67, 25], [57, 25], [56, 27], [51, 25], [56, 17], [45, 13], [39, 21], [35, 29], [36, 36], [27, 37], [24, 40], [23, 36.5], [19, 41], [13, 45], [18, 40], [15, 38], [9, 44], [3, 43], [0, 39], [-5, 36]],
  [[-5, 50], [1, 51], [0, 54], [-3, 58], [-6, 56]], [[130, 32], [136, 34], [141, 37], [142, 44], [140, 41], [136, 36]],
  [[95, 5], [105, -3], [115, -8], [106, -7], [100, -2]], [[110, 2], [118, 6], [118, -3], [112, -3]], [[131, -2], [141, -3], [150, -9], [141, -9]],
  [[114, -22], [122, -18], [130, -12], [136, -12], [140, -17], [146, -19], [153, -27], [150, -37], [143, -39], [135, -34], [125, -33], [115, -34]],
  [[-168, 65], [-156, 71], [-125, 70], [-95, 72], [-82, 68], [-78, 62], [-92, 58], [-82, 52], [-65, 60], [-56, 52], [-66, 45], [-70, 42], [-76, 35], [-81, 31], [-80, 25], [-84, 30], [-90, 29], [-97, 26], [-97, 20], [-90, 21], [-87, 16], [-83, 10], [-79, 9], [-85, 12], [-95, 16], [-105, 20], [-112, 28], [-117, 33], [-124, 41], [-124, 49], [-135, 58], [-152, 60], [-165, 55]],
  [[-52, 60], [-22, 70], [-20, 80], [-60, 82], [-70, 76]],
  [[-79, 9], [-72, 12], [-60, 9], [-50, 0], [-35, -6], [-39, -17], [-48, -25], [-55, -34], [-62, -39], [-66, -46], [-72, -53], [-75, -45], [-71, -30], [-70, -18], [-78, -8], [-81, -3], [-77, 4]],
];
const texTerre = (() => {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512; const g = c.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, 1024, 512); g.fillStyle = '#fff';
  TERRES.forEach((t) => { g.beginPath(); t.forEach(([lo, la], i) => { const x = (lo + 180) / 360 * 1024, y = (90 - la) / 180 * 512; if (i) g.lineTo(x, y); else g.moveTo(x, y); }); g.closePath(); g.fill(); });
  const t = new THREE.CanvasTexture(c); t.minFilter = THREE.LinearFilter; t.generateMipmaps = false; return t;
})();

/* ---------- les planètes ---------- */
const KIND = { gaz: 0, oceane: 1, roche: 2, lave: 3, holo: 4, glace: 5 };
const GENRE = { FasoCommerce: 'gaz', 'Taxi Compteur': 'lave', 'JL EXPRESS': 'oceane', CodeBurkina: 'oceane', FasoDigit: 'holo', ForexSaaS: 'glace', 'Network Supervision': 'glace', FasoConsult: 'oceane', 'SuperMarché': 'gaz', 'Scolarité': 'roche' };
const geoSph = new THREE.SphereGeometry(1, 64, 44);
const matPlanete = (m, graine) => new THREE.ShaderMaterial({
  transparent: true,
  uniforms: { cA: { value: new THREE.Color(m.a) }, cB: { value: new THREE.Color(m.b) }, cC: { value: new THREE.Color(m.c) }, uL: { value: vs(0, 1, 1) }, uG: { value: graine }, uT: temps, uA: { value: 0 }, uDens: { value: 46 }, uK: { value: KIND[GENRE[m.n]] }, tTerre: { value: texTerre } },
  vertexShader: `varying vec3 vN,vP; void main(){vN=normalize(mat3(modelMatrix)*normal); vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader: `
    uniform vec3 cA,cB,cC,uL; uniform float uG,uT,uA,uK,uDens; uniform sampler2D tTerre; varying vec3 vN,vP;
    float h(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
    float n(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
      return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),
                 mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}
    float fbm(vec3 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*n(p);p=p*2.07+vec3(3.1);a*=.5;}return s;}
    float cr(vec3 p){return 1.-abs(2.*n(p)-1.);}
    float crateres(vec3 p,float s){vec3 q=p*s,id=floor(q),f=fract(q)-.5; float r=.14+.26*h(id+7.); float d=length(f); if(h(id)<.5)return 0.; return smoothstep(r*.85,r*.6,d)*-.5+smoothstep(r*.72,r*.92,d)*smoothstep(r*1.25,r*.95,d)*.5;}
    void main(){
      float sp=uK>3.5&&uK<4.5?.35+sin(uT*.2)*.6:uT*.05+uG;
      float ct=cos(sp),st=sin(sp);
      vec3 p=vec3(ct*vP.x+st*vP.z,vP.y,-st*vP.x+ct*vP.z);
      vec3 N=normalize(vN),V=vec3(0.,0.,1.),L=normalize(uL);
      float nl=dot(N,L); float lit=smoothstep(-.1,.5,nl);
      float rim=pow(1.-clamp(dot(N,V),0.,1.),3.2);
      vec3 col=vec3(0.),emis=vec3(0.); float spec=0.;
      if(uK<.5){
        float lat=p.y+.034*(fbm(p*3.2+uG)-.5)+.004*sin(p.x*8.+uG*3.);
        float b=fbm(vec3(lat*13.,uG,lat*3.))*.7+.08*sin(lat*24.+uG*4.)*.5+fbm(vec3(lat*58.,p.x*2.5,p.z*2.5))*.16+.1;
        col=mix(cA,cB,smoothstep(.26,.6,b)); col=mix(col,cC,smoothstep(.6,.84,b));
        col=mix(col,vec3(dot(col,vec3(.33))),.26)*.8;
      } else if(uK<1.5){
        float e=fbm(p*2.3+uG)+.34*fbm(p*7.+uG); float terre=smoothstep(.71,.75,e);
        vec3 mer=mix(cA*.55,cB*.85,smoothstep(.3,.72,e));
        vec3 sol=mix(cC*.5,mix(vec3(.62,.5,.28),vec3(.26,.42,.2),fbm(p*5.+uG)),.72); sol*=.7+.6*fbm(p*18.);
        col=mix(mer,sol,terre); spec=(1.-terre);
        float nu=fbm(p*vec3(3.,6.2,3.)+vec3(uT*.012,0.,0.)+fbm(p*3.2+uG)*1.7); float nuage=smoothstep(.54,.74,nu); col=mix(col,vec3(.97),nuage*.92); spec*=1.-nuage;
      } else if(uK<2.5){
        col=mix(cA*.8,cB,fbm(p*4.6+uG)); col=mix(col,cC,smoothstep(.56,.8,fbm(p*13.+uG))*.7); col*=.78+.44*fbm(p*30.);
        col*=1.+crateres(p,3.2)+crateres(p+1.3,6.4)*.8+crateres(p+2.7,12.)*.5;
      } else if(uK<3.5){
        col=mix(cA*.22,cA*.5,fbm(p*5.+uG));
        float f1=pow(cr(p*3.4+fbm(p*3.+uG)*1.2),9.),f2=pow(cr(p*7.5+uG),14.)*.55; float f=clamp(f1+f2,0.,1.);
        emis=mix(cB*1.2,cC*1.7,f)*f*1.25;
      } else if(uK<4.5){
        float la=asin(clamp(p.y,-1.,1.)),lo=atan(p.x,p.z);
        vec2 uvT=vec2(lo/6.2832+.5,la/3.1416+.5);
        float terre=texture2D(tTerre,uvT).r;
        vec2 gd=vec2(lo*cos(la),la)*uDens; vec2 f=fract(gd)-.5; float pt=smoothstep(.36,.16,length(f));
        float grille=smoothstep(.012,.0,abs(fract(lo/.5236+.5)-.5)*.5236*cos(la))*.22+smoothstep(.01,.0,abs(fract(la/.5236+.5)-.5)*.5236)*.22;
        vec3 bf=vec3(sin(-.026)*cos(.215),sin(.215),cos(-.026)*cos(.215)); float db=length(p-bf);
        float onde=exp(-pow((db-fract(uT*.55)*.3)*26.,2.))*(1.-fract(uT*.55)); float bur=smoothstep(.05,.02,db);
        col=cA*.06; emis=cC*(pt*terre*1.5+grille*.55)+cB*.06+vec3(1.,.75,.3)*(bur*2.2+onde*1.5)*(46./uDens);
        emis+=cC*pow(1.-clamp(dot(N,V),0.,1.),2.)*1.1;
      } else {
        col=mix(cB*.8,cC,fbm(p*2.8+uG)); float fi=pow(cr(p*5.+fbm(p*4.+uG)),18.); col=mix(col,cA*.45,fi*.85); col=mix(col,vec3(.96),smoothstep(.62,.84,abs(p.y))*.8);
        spec=.45;
      }
      vec3 H=normalize(L+V);
      vec3 fin=col*(.018+lit*1.08)+vec3(1.,.97,.9)*pow(max(dot(N,H),0.),70.)*spec*lit*.65;
      fin+=mix(cB,cC,.6)*rim*(.02+lit*.55)*(uK>3.5&&uK<4.5?0.:1.);
      fin+=emis;
      gl_FragColor=vec4(fin,uA);
    }`,
});
const matAnneau = (m, hud) => new THREE.ShaderMaterial({
  transparent: true, side: THREE.DoubleSide, depthWrite: false,
  uniforms: { c: { value: new THREE.Color(m.c) }, c2: { value: new THREE.Color(m.b) }, uA: { value: 0 }, uHud: { value: hud ? 1 : 0 }, uT: temps, uC: { value: vs(0, 0, 0) }, uR: { value: 1 }, uL: { value: vs(0, 1, 0) } },
  vertexShader: `varying vec2 vU; varying float vA; varying vec3 vW; void main(){vU=uv; vA=atan(position.y,position.x); vW=(modelMatrix*vec4(position,1.)).xyz; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader: `uniform vec3 c,c2,uC,uL; uniform float uA,uHud,uT,uR; varying vec2 vU; varying float vA; varying vec3 vW;
    float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float b1(float x){float i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(h(vec2(i,3.)),h(vec2(i+1.,3.)),f);}
    void main(){float r=vU.x;
      if(uHud>.5){
        float t1=exp(-pow((r-.12)/.012,2.))*.9;
        float seg=step(.42,fract(vA*3./6.2832+uT*.05))*exp(-pow((r-.34)/.05,2.))*.75;
        float tick=step(.86,fract(vA*48./6.2832-uT*.03))*exp(-pow((r-.62)/.05,2.))*.8;
        float t2=exp(-pow((r-.9)/.008,2.))*.55;
        gl_FragColor=vec4(c,uA*(t1+seg+tick+t2)); return;
      }
      float bandes=b1(r*40.)*.6+b1(r*110.)*.3+b1(r*11.)*.45;
      float bord=smoothstep(0.,.05,r)*smoothstep(1.,.92,r);
      float vide=smoothstep(.03,.0,abs(r-.56))*.9;
      vec3 col=mix(c,c2,b1(r*7.));
      float a=vA+uT*(.16/(.3+r));
      float fl=step(.988,h(floor(vec2(a*42.,r*22.))));
      vec3 teinte=.55+.45*cos(6.2832*(h(floor(vec2(a*42.,r*22.))+.5)+vec3(0.,.33,.67)));
      vec3 q=vW-uC; vec3 L=normalize(uL); float t=dot(q,-L); float ombre=t>0.?smoothstep(uR*.92,uR*1.06,length(q+L*t)):1.;
      vec3 fin=col*(.14+bandes*.62)*(.08+.92*ombre)+teinte*fl*.6*ombre;
      gl_FragColor=vec4(fin,uA*clamp(bandes*.95+.08+fl,0.,1.)*bord*(1.-vide));
    }`,
});
function ringGeo(a = 1.35, b = 2.3) {
  const g = new THREE.RingGeometry(a, b, 128, 1);
  const pos_ = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < pos_.count; i++) { const r = Math.hypot(pos_.getX(i), pos_.getY(i)); uv.setX(i, (r - a) / (b - a)); }
  return g;
}
const geoRing = ringGeo();
MONDES.forEach((m, i) => {
  m.i = i; m.base = (i / MONDES.length) * 6.283 + .4;
  m.groupe = new THREE.Group();
  m.mesh = new THREE.Mesh(geoSph, matPlanete(m, i * 1.73 + .3)); m.groupe.add(m.mesh);
  m.halo = spriteAdd(m.b, 0, 3.4, true); m.groupe.add(m.halo);
  if (STATUT[m.s].anneau) { m.anneau = new THREE.Mesh(geoRing, matAnneau(m, m.n === 'FasoDigit')); m.anneau.renderOrder = 2; m.anneau.rotation.set(1.28, .24 + i * .13, 0); m.groupe.add(m.anneau); }
  m.groupe.scale.setScalar(.001);
  scene.add(m.groupe);
  m.p = vs(0, 0, 0); m.ne = 0; m.alpha = 0; m.tenue = 0;
});
const lunesG = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 16, 12), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0 }), 15);
lunesG.frustumCulled = false; scene.add(lunesG);
const orbitLigne = new THREE.Line(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 129 }, (_, i) => { const a = i / 128 * 6.283; return vs(Math.cos(a), 0, Math.sin(a)); })), new THREE.LineDashedMaterial({ color: '#8fa8ff', transparent: true, opacity: 0, dashSize: .012, gapSize: .03, depthWrite: false }));
orbitLigne.computeLineDistances(); scene.add(orbitLigne);

/* ---------- mise en page ---------- */
let W = 1, H = 1, portrait = false, camZ = 8, L = {};
function mesure() {
  W = innerWidth; H = innerHeight; portrait = W / H < .85;
  rendu.setSize(W, H, false); composer.setSize(W, H);
  bloom.resolution.set(W / 2, H / 2);
  cam.aspect = W / H; cam.updateProjectionMatrix();
  const t = Math.tan(cam.fov * Math.PI / 360), hautT = META.haut - META.menton;
  if (portrait) {
    camZ = 1.75 / (t * cam.aspect);
    const ht = camZ * t, visH = 2 * (camZ + 1.5) * t, vl = visH * cam.aspect;
    const fs = Math.min(vl * .88 / 2.2, visH * .52 / hautT);
    L = { fy: visH * .455 - META.haut * fs, fz: -1.5, fs, oy: -ht * .3, oc: -.6, ox: 1.5, oz: 3.2, amp: .95, tenu: vs(0, ht * .34, 1.2), mainS: .56, mainG: .74, ctc: vs(0, -ht * .22, 1.4), rE: .78 };
  } else {
    camZ = 8.4;
    const ht = camZ * t, vis = 2 * (camZ + 1.5) * t, fs = .7 * vis / hautT, hw = (camZ + 1) * t * cam.aspect;
    L = { fy: vis * .435 - META.haut * fs, fz: -1.5, fs, oy: -.55, oc: -1, ox: Math.min(hw * .86, 4.7), oz: 3.6, amp: 1.32, tenu: vs(-ht * cam.aspect * .46, -.55, 1.8), mainS: .6, mainG: .98, ctc: vs(-ht * cam.aspect * .55, -.72, 2.2), rE: .86 };
  }
  FILM.uniforms.uRatio.value = cam.aspect; U.uPxH.value = H * rendu.getPixelRatio() / (2 * t);
  orbitLigne.position.set(0, L.oy, L.oc); orbitLigne.scale.set(L.ox, 1, L.oz);
  orbitLigne.computeLineDistances();
  echMainC = L.mainS;
  uRiv.uC.value.set(0, L.fy - 2.6 * L.fs, L.fz);
  fondNeb.scale.setScalar(Math.max(1, cam.aspect / 1.7, 1 / cam.aspect * .8));
  posConstellations(); posParcours();
}

/* ---------- constellations et parcours : tracés au doigt ---------- */
const $et = $('etiquettes');
const lab = (html, cls = '') => { const e = document.createElement('div'); e.className = 'etiq ' + cls; e.innerHTML = html; $et.appendChild(e); return e; };
const grainStars = (n, s) => { const x = Math.sin(n * 12.9898 + s * 78.233) * 43758.5453; return x - Math.floor(x); };
const cst = { etoiles: [], segs: [], dur: .17 };
CONSTELLATIONS.forEach((c, ci) => {
  c.titre = lab(c.n, 'titre');
  c.e.forEach((e, k) => { cst.etoiles.push({ c: ci, k, nom: e, el: lab(e), p: vs(0, 0, 0), debut: k === 0 }); });
});
const geoEt = new THREE.BufferGeometry(); const NE = cst.etoiles.length;
geoEt.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NE * 3), 3));
const aEt = new Float32Array(NE); geoEt.setAttribute('aA', new THREE.BufferAttribute(aEt, 1));
const ptsEt = new THREE.Points(geoEt, new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, uniforms: { uPix },
  vertexShader: `attribute float aA; varying float v; uniform float uPix; void main(){v=aA; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); gl_PointSize=18.*uPix;}`,
  fragmentShader: `varying float v; void main(){float d=length(gl_PointCoord-.5); float c=smoothstep(.5,.0,d); gl_FragColor=vec4(mix(vec3(.45,.9,1.),vec3(1.),c*c),v*c*c);}`,
}));
ptsEt.frustumCulled = false; scene.add(ptsEt);
const liensPos = []; const geoLiens = new THREE.BufferGeometry();
const lignesC = new THREE.LineSegments(geoLiens, new THREE.LineBasicMaterial({ color: '#8fe0ff', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false }));
lignesC.frustumCulled = false; scene.add(lignesC);
function posConstellations() {
  const t = Math.tan(cam.fov * Math.PI / 360), z = 1.1, hw = (camZ - z) * t * cam.aspect, hh = (camZ - z) * t;
  liensPos.length = 0;
  let idx = 0;
  CONSTELLATIONS.forEach((c, ci) => {
    let cx, cy;
    if (portrait) { const col = ci % 2 ? .52 : -.52, ligne = Math.floor(ci / 2); cx = (ci === 6 ? 0 : col) * hw; cy = (-.08 - ligne * .25) * hh; }
    else { cx = c.x * hw; cy = c.y * hh; }
    c.pos = vs(cx, cy, z);
    const R = portrait ? hw * .28 : Math.min(hw, hh) * .21;
    let prev = null, first = null;
    c.e.forEach((_, k) => {
      const a = k / c.e.length * 6.283 + ci * 1.3 + grainStars(k, ci) * .5, r = R * (.72 + .3 * grainStars(k + 3, ci));
      const et = cst.etoiles[idx]; et.p.set(cx + Math.cos(a) * r * 1.25, cy + Math.sin(a) * r * .82, z);
      geoEt.attributes.position.setXYZ(idx, et.p.x, et.p.y, et.p.z);
      if (prev) liensPos.push(prev.x, prev.y, prev.z, et.p.x, et.p.y, et.p.z);
      prev = et.p; first = first || et.p; idx++;
    });
    if (c.e.length > 2) liensPos.push(prev.x, prev.y, prev.z, first.x, first.y, first.z);
  });
  geoEt.attributes.position.needsUpdate = true;
  geoLiens.setAttribute('position', new THREE.BufferAttribute(new Float32Array(liensPos), 3));
}
const stations = STATIONS.map((s) => ({ ...s, el: lab(`<b>${s.a}</b>${s.n}`, 'station'), p: vs(0, 0, 0) }));
let courbeP = null; const geoTrace = new THREE.BufferGeometry();
const NTR = 200; geoTrace.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NTR * 3), 3));
const trace = new THREE.Line(geoTrace, new THREE.LineBasicMaterial({ color: '#c8f4ff', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false }));
trace.frustumCulled = false; scene.add(trace);
const anneauxSt = stations.map(() => { const m = new THREE.Mesh(new THREE.RingGeometry(.075, .095, 40), new THREE.MeshBasicMaterial({ color: '#6fe6ff', transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false })); scene.add(m); return m; });
function posParcours() {
  const t = Math.tan(cam.fov * Math.PI / 360), z = 1.4, hw = (camZ - z) * t * cam.aspect, hh = (camZ - z) * t;
  const pts = portrait
    ? [[-.62, -.22], [.5, -.34], [-.45, -.47], [.5, -.6], [-.2, -.74]]
    : [[-.82, -.58], [-.46, -.14], [-.02, -.66], [.44, -.2], [.82, -.58]];
  pts.forEach(([x, y], i) => { stations[i].p.set(x * hw, y * hh, z + Math.sin(i) * .2); anneauxSt[i].position.copy(stations[i].p); });
  courbeP = new THREE.CatmullRomCurve3(stations.map((s) => s.p), false, 'catmullrom', .5);
  const a = geoTrace.attributes.position; for (let i = 0; i < NTR; i++) { const q = courbeP.getPoint(i / (NTR - 1)); a.setXYZ(i, q.x, q.y, q.z); } a.needsUpdate = true;
}

/* ---------- la matière qui forme les choses : image ou nom écrit en points ---------- */
const holoMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, vertexColors: true,
  uniforms: { uPix, uP: { value: 0 }, uA: { value: 1 }, uDe: { value: vs(0, 0, 0) }, uTaille: { value: 1.6 } },
  vertexShader: `attribute vec3 aR; varying vec3 vC; varying float vA; uniform float uPix,uP,uA,uTaille; uniform vec3 uDe;
    void main(){vC=color; float s=fract(aR.x*17.31+aR.y*5.); float t=clamp(uP*1.45-s*.45,0.,1.); t=t*t*(3.-2.*t);
      vec3 w=(modelMatrix*vec4(position,1.)).xyz; vec3 p=mix(uDe+aR*.3,w,t)+aR*(1.-t)*.5;
      vec4 m=viewMatrix*vec4(p,1.); gl_Position=projectionMatrix*m; gl_PointSize=uTaille*uPix*(8./-m.z); vA=uA*(.25+.75*t);}`,
  fragmentShader: `varying vec3 vC; varying float vA; void main(){float d=length(gl_PointCoord-.5); if(d>.5)discard; gl_FragColor=vec4(vC,vA*smoothstep(.5,.15,d));}`,
});
function nuageDepuis(source, sW, sH, largeur, pas, teinte) {
  const c = document.createElement('canvas'); c.width = sW; c.height = sH;
  const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(source, 0, 0, sW, sH);
  const d = g.getImageData(0, 0, sW, sH).data, P = [], C = [], R = [];
  const h = largeur * sH / sW;
  for (let y = 0; y < sH; y += pas) for (let x = 0; x < sW; x += pas) {
    const o = (y * sW + x) * 4, a = d[o + 3] / 255;
    if (a < .2) continue;
    const r = d[o] / 255, gg = d[o + 1] / 255, b = d[o + 2] / 255;
    if (!teinte && r + gg + b < .05) continue;
    P.push((x / sW - .5) * largeur, (.5 - y / sH) * h, (Math.random() - .5) * .01);
    if (teinte) C.push(.75, .95, 1); else C.push(r, gg, b);
    const an = Math.random() * 6.283, u = Math.random() * 2 - 1, s = Math.sqrt(1 - u * u); R.push(s * Math.cos(an), s * Math.sin(an), u);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(P), 3));
  geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(C), 3));
  geo.setAttribute('aR', new THREE.BufferAttribute(new Float32Array(R), 3));
  const m = holoMat.clone(); m.uniforms.uPix = uPix;
  const pts = new THREE.Points(geo, m); pts.frustumCulled = false; return pts;
}
function nomEnPoints(nom) {
  const c = document.createElement('canvas'), sW = 1100, sH = 200; c.width = sW; c.height = sH;
  const g = c.getContext('2d'); g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
  let fs = 150; do { g.font = `700 ${fs}px Geist, system-ui, sans-serif`; fs -= 6; } while (g.measureText(nom).width > sW - 30 && fs > 30);
  g.fillText(nom, sW / 2, sH / 2);
  return nuageDepuis(c, sW, sH, portrait ? 2.5 : 3.1, leger ? 3 : 2, true);
}
const images = {};
const chargerImg = (src) => images[src] || (images[src] = new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = src; }));

/* ---------- son (seulement si on l'active) ---------- */
let audio = null;
function bourdon() {
  const A = audio.ctx, f = A.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 260;
  const g = A.createGain(); g.gain.value = 0; f.connect(g); g.connect(audio.sortie);
  [55, 55.4, 82.4, 110.3].forEach((fr, i) => { const o = A.createOscillator(); o.type = i < 2 ? 'sawtooth' : 'sine'; o.frequency.value = fr; const v = A.createGain(); v.gain.value = i < 2 ? .1 : .16; o.connect(v); v.connect(f); o.start(); });
  g.gain.linearRampToValueAtTime(.28, A.currentTime + 3);
}
function bruit(duree = 1.3, de = 180, vers = 2800, niveau = .22) {
  if (!audio) return; const A = audio.ctx, n = A.createBuffer(1, A.sampleRate * duree, A.sampleRate), d = n.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.sin(i / d.length * Math.PI);
  const s = A.createBufferSource(); s.buffer = n; const f = A.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.1;
  f.frequency.setValueAtTime(de, A.currentTime); f.frequency.exponentialRampToValueAtTime(vers, A.currentTime + duree);
  const g = A.createGain(); g.gain.value = niveau; s.connect(f); f.connect(g); g.connect(audio.sortie); s.start();
}
function note(fr = 660, duree = 1.8, niveau = .1) {
  if (!audio) return; const A = audio.ctx;
  [1, 1.5, 2.01].forEach((k, i) => { const o = A.createOscillator(); o.frequency.value = fr * k; const g = A.createGain(); g.gain.setValueAtTime(niveau / (i + 1), A.currentTime); g.gain.exponentialRampToValueAtTime(.0001, A.currentTime + duree); o.connect(g); g.connect(audio.sortie); o.start(); o.stop(A.currentTime + duree); });
}
function cor(duree = 3.4, niveau = .55, base = 49) {
  if (!audio) return; const A = audio.ctx, t = A.currentTime, f = A.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 2;
  f.frequency.setValueAtTime(90, t); f.frequency.exponentialRampToValueAtTime(2200, t + .35); f.frequency.exponentialRampToValueAtTime(140, t + duree);
  const dist = A.createWaveShaper(), c = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 512 - 1; c[i] = Math.tanh(x * 3.2); } dist.curve = c;
  const g = A.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(niveau, t + .12); g.gain.exponentialRampToValueAtTime(.0001, t + duree);
  f.connect(dist); dist.connect(g); g.connect(audio.sortie);
  [1, 1.003, 1.5, 2, 2.006, .5].forEach((k) => { const o = A.createOscillator(); o.type = 'sawtooth'; o.frequency.value = base * k; const v = A.createGain(); v.gain.value = .13; o.connect(v); v.connect(f); o.start(t); o.stop(t + duree); });
}
function coup(niveau = .9, de = 110, vers = 28, duree = .85) {
  if (!audio) return; const A = audio.ctx, t = A.currentTime, o = A.createOscillator(), g = A.createGain();
  o.frequency.setValueAtTime(de, t); o.frequency.exponentialRampToValueAtTime(vers, t + duree * .6);
  g.gain.setValueAtTime(niveau, t); g.gain.exponentialRampToValueAtTime(.0001, t + duree); o.connect(g); g.connect(audio.sortie); o.start(t); o.stop(t + duree);
}
const battement = () => { coup(.5, 70, 30, .28); setTimeout(() => coup(.38, 62, 28, .3), 230); };
function lancerSon() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)(), comp = ctx.createDynamicsCompressor(), sortie = ctx.createGain(); sortie.gain.value = .85; sortie.connect(comp); comp.connect(ctx.destination);
  audio = { ctx, sortie, on: true }; bourdon(); $('son').textContent = 'Couper le son'; $('son').setAttribute('aria-pressed', 'true');
}
function silence() { if (audio) audio.sortie.gain.setTargetAtTime(0, audio.ctx.currentTime, .05); }
function reprendre() { if (audio) audio.sortie.gain.setTargetAtTime(.85, audio.ctx.currentTime, .012); }
$('son').onclick = async () => {
  if (!audio) { lancerSon(); return; }
  audio.on = !audio.on; if (audio.on) await audio.ctx.resume(); else await audio.ctx.suspend();
  $('son').textContent = audio.on ? 'Couper le son' : 'Activer le son'; $('son').setAttribute('aria-pressed', String(audio.on));
};

/* ---------- l'histoire ---------- */
const ecran = $('ecran');
const $recit = $('recit'), $fiche = $('fiche'), $portail = $('portail'), $nom = $('nom');
function dire(txt, ms = 3600) { $recit.textContent = txt; $recit.classList.add('vu'); clearTimeout(dire.t); if (ms) dire.t = setTimeout(() => $recit.classList.remove('vu'), ms); }
let etat = reduit ? 'libre' : 'film', mode = 'projets', choisi = -1, survol = -1, tour = 0, tIntro = reduit ? 99 : 0;
let curseur = { x: 0, y: 0, actif: false, t: 0 }, glisse = null;
let cibleMain = vs(0, -6, 1.4), rotMain = vs(0, 0, 0), alphaMainC = 0, pointe = false;
const regard = { cx: 0, cy: 0, ix: 0, iy: 0, bx: 0, by: 0, tSac: 0 };
let eclat = 0, eclatC = 0, fluxC = 0, cligne = { t: 0, prochain: 3 };
let gel = 0, gelC = 0, sombre = 0, sombreC = 0, secousse = 0, vertige = 0, vertigeC = 0, gravite = 0, graviteC = 0, penche = 0, pencheC = 0;
let ab = 0, flash = 0, rouge = 0, ressort = [24, 9], echMain = .6, echMainC = .6;
let ferme = 0, fermeC = 0, clip = 0, clipC = 0, agite = 0, tDort = 0, premier = true, reveilT = -1, reveilCause = '', suiteReveil = null, marques = {};
let soleilA = reduit ? 1 : 0, soleilC = soleilA, haloA = 0, haloC = reduit ? 1 : 0, rivA = reduit ? .7 : 0, rivC = rivA, trou = 0, trouC = 0, lueur = 0, lueurC = 0, pupille = 1, pupilleC = 1, ambK = .9, tCoeur = 0;
const RESSORTS = { suit: [26, 9.5], bond: [62, 10], lourd: [11, 6.5] };
const barres = (on) => document.body.classList.toggle('cinema', on);
function impact(m, force = 1) {
  const s = projeter(m); FILM.uniforms.uCentre.value.set(s.x / W, 1 - s.y / H); FILM.uniforms.uChoc.value = 0;
  secousse = force; ab = .022 * force; flash = .12 * force; rouge = .34 * force; U.uOnde.value = 0;
  groupeV.worldToLocal(v3.copy(m)); U.uOndeO.value.set(v3.x, v3.y);
  coup(.95 * force);
}
let holo = null, holoNom = null, ecranH = 0, mTenu = null, tParc = 0, tCst = 0;
const planeteLueur = new THREE.Vector3();
const sequence = [];
const apres = (s, f) => { const id = setTimeout(f, reduit ? 0 : s * 1000); sequence.push(id); return id; };
const annuler = () => { sequence.splice(0).forEach(clearTimeout); };

/* ses mots, écrits en étoiles */
let motP = null, motFin = 0;
function retirerMots() { if (motP) { scene.remove(motP); motP.geometry.dispose(); motP.material.dispose(); motP = null; } }
function mots(txt, duree = 3) {
  retirerMots();
  const c = document.createElement('canvas'), sW = 1500, sH = 190; c.width = sW; c.height = sH;
  const g = c.getContext('2d'); g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '600 118px Geist, system-ui, sans-serif'; g.fillText(txt, sW / 2, sH / 2);
  motP = nuageDepuis(c, sW, sH, portrait ? 2.9 : 4.1, leger ? 3 : 2, true);
  motP.position.set(0, portrait ? -.95 : -1.34, 3.2);
  motP.material.uniforms.uDe.value.copy(groupeV.localToWorld(v3.copy(centreYeux))); motP.material.uniforms.uTaille.value = .92; motP.material.uniforms.uA.value = .62;
  scene.add(motP); motFin = performance.now() + duree * 1000; dire(txt, duree * 1000);
}
function montrerInterface() { ['identite', 'son', 'nav', 'liens'].forEach((k) => $(k).classList.remove('cache')); }

function nettoyerHolo() {
  [holo, holoNom].forEach((h) => { if (h) { scene.remove(h); h.geometry.dispose(); h.material.dispose(); } });
  holo = holoNom = null;
  ecran.style.opacity = 0; ecranH = 0;
}
function ouvrir(i) {
  if (etat !== 'libre' || choisi === i) return;
  annuler(); nettoyerHolo();
  choisi = i; etat = 'geste'; const m = MONDES[i]; $nom.style.opacity = 0; $recit.classList.remove('vu');
  $('identite').classList.add('cache'); barres(true);
  // tout se fige : il a décidé. Ses pupilles s'ouvrent.
  gelC = 1; sombreC = 1; eclatC = .7; lueurC = .6; pupilleC = 1.45; cor(3.6, .5); U.uCibleR.value = m.r * 1.15; U.uDir.value = m.p.x >= 0 ? 1 : -1;
  alphaMainC = 1; poser(POSES.ouvert); pointe = false; ressort = RESSORTS.bond; echMainC = L.mainG;
  cibleMain.copy(m.p); cibleMain.y -= m.r * 1.15; cibleMain.z += .35; rotMain.set(-.25, 0, clamp(-m.p.x * .12, -.45, .45));
  mTenu = null;
  apres(.62, () => poser(POSES.saisir));
  // elle se referme : l'impact. Ce qui entoure le visage se brise, le visage reste.
  apres(.92, () => { mTenu = m; m.tenue = 1; impact(m.p, 1); fluxC = 1; poussiere(60); briser(1); });
  apres(1.3, () => { ressort = RESSORTS.lourd; vertigeC = 1; graviteC = 1; cibleMain.copy(L.tenu); cibleMain.y -= .95 * L.mainG; rotMain.set(-.92, 0, portrait ? 0 : .1); bruit(1.3, 120, 900, .22); });
  apres(2.75, () => {
    poser(POSES.porte); etat = 'ouvert'; vertigeC = 0; graviteC = 0; gelC = 0; sombreC = .55; eclatC = .3; lueurC = .25; pupilleC = 1; barres(false); uMain.uFeu.value = .3; note(261, 3, .1); bruit(1.8, 500, 3600, .1);
    former(m); afficherFiche(m);
  });
}
function afficherFiche(m) {
  const st = STATUT[m.s];
  $fiche.innerHTML = `<span class="code">${_('Monde')} ${m.code}</span><h2>${m.n}</h2>
    <span class="statut" style="color:${st.c}">${st.t}</span><p>${m.d}</p>
    ${m.lunes.length ? `<h3>${m.lt}</h3><ul class="tags">${m.lunes.map((x) => `<li>${x}</li>`).join('')}</ul>` : ''}
    <h3>${_('Technologies')}</h3><ul class="tags">${m.t.map((x) => `<li>${x}</li>`).join('')}</ul>
    <div class="actions"><a class="btn" id="explorer" href="/${LANG}/missions/${m.slug}/">${_('Voir la fiche complète')}</a><button class="btn sec" id="fermer">${_('Le rendre à l’univers')}</button></div>`;
  $fiche.classList.add('vue');
  $('fermer').onclick = fermer;
  $('fermer').focus({ preventScroll: true });
}
function former(m) {
  const ici = L.tenu;
  holoNom = nomEnPoints(m.n);
  holoNom.position.set(portrait ? 0 : ici.x + .9, ici.y + (portrait ? 1.0 : 1.75), ici.z + .3);
  holoNom.material.uniforms.uDe.value.copy(m.p); holoNom.material.uniforms.uTaille.value = 1.05; holoNom.material.uniforms.uA.value = .34;
  scene.add(holoNom);
  if (m.img && !portrait) {
    chargerImg(m.img).then((im) => {
      if (choisi !== m.i) return;
      const lg = 1.16, h = lg * im.height / im.width;
      holo = nuageDepuis(im, 150, Math.round(150 * im.height / im.width), lg, leger ? 3 : 1, false);
      holo.position.set(ici.x + 1.75, ici.y + .28, ici.z + .35);
      holo.material.uniforms.uDe.value.copy(m.p); holo.material.uniforms.uTaille.value = 1.05; holo.material.uniforms.uA.value = .6;
      scene.add(holo);
      ecran.src = m.img; ecranH = h;
    });
  }
}
function fermer() {
  if (choisi < 0 || etat === 'geste') return;
  annuler();
  const m = MONDES[choisi]; $fiche.classList.remove('vue');
  etat = 'retour'; poser(POSES.saisir); nettoyerHolo(); uMain.uFeu.value = 0; barres(true); ressort = RESSORTS.bond; gelC = 1; sombreC = 1; eclatC = .5;
  $('identite').classList.remove('cache'); bruit(.8, 2600, 200, .2);
  apres(.3, () => { cibleMain.copy(positionOrbite(m)); cibleMain.y -= m.r * 1.15; cibleMain.z += .35; rotMain.set(-.25, 0, 0); });
  apres(.8, () => { poser(POSES.ouvert); m.tenue = 0; mTenu = null; fluxC = 0; impact(m.p, .55); });
  apres(1.25, () => { choisi = -1; etat = 'libre'; gelC = 0; sombreC = 0; eclatC = 0; lueurC = .14; barres(false); echMainC = L.mainS; ressort = RESSORTS.suit; poser(POSES.repos); curseur.t = performance.now(); alphaMainC = 0; cibleMain.set(0, -6, 1.4); });
}
function changerMode(nv) {
  if (nv === mode || etat === 'film' || etat === 'geste' || etat === 'retour') return;
  if (choisi >= 0) { const m = MONDES[choisi]; $fiche.classList.remove('vue'); nettoyerHolo(); m.tenue = 0; mTenu = null; fluxC = 0; eclatC = 0; gelC = 0; sombreC = 0; vertigeC = 0; graviteC = 0; choisi = -1; uMain.uFeu.value = 0; etat = 'libre'; annuler(); barres(false); echMainC = L.mainS; $('identite').classList.remove('cache'); }
  mode = nv; curseur.t = performance.now();
  document.querySelectorAll('.nav button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === nv)));
  $portail.classList.toggle('vu', nv === 'contact');
  tParc = 0; tCst = 0; aEt.fill(0); geoEt.attributes.aA.needsUpdate = true;
  cst.etoiles.forEach((e) => e.el.style.opacity = 0); CONSTELLATIONS.forEach((c) => c.titre.style.opacity = 0); stations.forEach((s) => s.el.style.opacity = 0);
  eclatC = nv === 'contact' ? .55 : 0; sombreC = nv === 'contact' ? .8 : 0; pencheC = 0; ressort = nv === 'contact' ? RESSORTS.lourd : RESSORTS.suit; echMainC = nv === 'contact' ? L.mainG : L.mainS; trouC = nv === 'contact' ? 1 : 0; lueurC = nv === 'contact' ? .5 : .14;
  if (nv === 'contact') { cor(3, .42, 41); battement(); } else coup(.45, 90, 30, .5);
  alphaMainC = nv === 'projets' ? 0 : 1; poser(nv === 'contact' ? POSES.ouvert : nv === 'projets' ? POSES.repos : POSES.pointe); pointe = nv === 'competences' || nv === 'parcours';
  if (nv === 'projets') { cibleMain.set(0, -6, 1.4); rotMain.set(0, 0, 0); }
  if (nv === 'contact') { cibleMain.copy(L.ctc); rotMain.set(.05, 0, portrait ? 0 : -.12); }
}
document.querySelectorAll('.nav button').forEach((b) => b.addEventListener('click', () => changerMode(b.dataset.mode)));

/* ---------- planètes accessibles au clavier ---------- */
MONDES.forEach((m) => { const b = document.createElement('button'); b.className = 'sr'; b.textContent = `Ouvrir ${m.n}`; b.onclick = () => { if (mode !== 'projets') changerMode('projets'); ouvrir(m.i); }; $('listeMondes').appendChild(b); });
addEventListener('keydown', (e) => { if (e.key === 'Escape') fermer(); });

/* ---------- le toucher ---------- */
const projeter = (p, v = new THREE.Vector3()) => { v.copy(p).project(cam); return { x: (v.x * .5 + .5) * W, y: (-v.y * .5 + .5) * H, z: v.z }; };
function dansMonde(x, y, z) { // écran vers le plan z du monde
  v3.set(x / W * 2 - 1, -(y / H) * 2 + 1, .5).unproject(cam).sub(cam.position).normalize();
  const t = (z - cam.position.z) / v3.z; return v3b.copy(cam.position).addScaledVector(v3, t);
}
function toucher(x, y) {
  if (mode !== 'projets' || (etat !== 'libre' && etat !== 'dort')) return -1;
  let best = -1, bd = 1e9;
  MONDES.forEach((m, i) => {
    if (m.ne < .9) return;
    const s = projeter(m.p), rp = m.r * m.ech * (H / (2 * Math.tan(cam.fov * Math.PI / 360) * (camZ - m.p.z)));
    const d = Math.hypot(s.x - x, s.y - y), lim = Math.max(rp * 1.3, portrait ? 26 : 18);
    if (d < lim && d < bd) { bd = d; best = i; }
  });
  return best;
}
canvas.addEventListener('pointermove', (e) => {
  curseur = { x: e.clientX, y: e.clientY, actif: true, t: performance.now() };
  if (glisse) { const dx = e.clientX - glisse.x; tour += dx * .0034; glisse.v = dx; glisse.x = e.clientX; if (Math.abs(dx) > 1) glisse.bouge = true; return; }
  const av = survol; survol = toucher(e.clientX, e.clientY);
  if (survol !== av && survol >= 0) note(146, .7, .06);
  canvas.style.cursor = survol >= 0 ? 'pointer' : (mode === 'projets' && (etat === 'libre' || etat === 'dort') ? 'grab' : 'default');
  if (survol >= 0) { const m = MONDES[survol]; $nom.innerHTML = `${m.n}<small>${STATUT[m.s].t}</small>`; $nom.style.opacity = 1; } else $nom.style.opacity = 0;
});
canvas.addEventListener('pointerdown', (e) => {
  curseur = { x: e.clientX, y: e.clientY, actif: true, t: performance.now() };
  const i = toucher(e.clientX, e.clientY);
  if (etat === 'film') { return; }
  if (i >= 0) { survol = -1; ouvrir(i); return; }
  if (choisi >= 0) { fermer(); return; }
  if (mode === 'projets' && (etat === 'libre' || etat === 'dort')) { glisse = { x: e.clientX, v: 0, bouge: false }; canvas.setPointerCapture(e.pointerId); canvas.style.cursor = 'grabbing'; }
});
canvas.addEventListener('pointerup', () => { glisse = null; });
canvas.addEventListener('pointerleave', () => { curseur.actif = false; survol = -1; $nom.style.opacity = 0; });

function positionOrbite(m, cible = new THREE.Vector3()) {
  const a = m.base + tour;
  return cible.set(L.ox * Math.cos(a), L.oy - Math.sin(a) * L.amp, L.oc + L.oz * Math.sin(a));
}

/* ---------- le film : tout se déduit du temps, plan par plan ---------- */
let tf = 0, tfAv = -1, filmGele = false;
const DUREE = RESEAUX ? 114 : 110.6;
const filmP = { ciel: 0, neb: 0, pres: 0, leve: 0, rx: 0, ry: 0, amb: 1 };
const filmCam = { p: vs(0, 0, 9), l: vs(0, 0, 0) };
const tl = (a, b) => lisse((tf - a) / (b - a));
const clocheT = (a, b, c, d) => tl(a, b) * (1 - tl(c, d));
const $journal = $('journal'), $leg = $('legende'), $tag = $('tag'), $tel = $('tel'), $telI = $('telImg'), $pt = $('pointVie'), $car = $('carton');

/* --- le réseau : l'acte I --- */
const NRES = 86, reseau = Array.from({ length: NRES }, (_, i) => {
  const a = i * 2.39996, r = Math.sqrt((i + .5) / NRES);
  return { x: Math.cos(a) * r * 4.3 + Math.sin(i * 7.1) * .25, y: Math.sin(a) * r * 2.25 + Math.cos(i * 3.3) * .18, z: Math.sin(i * 1.7) * 1.4 - .4, ph: Math.random() * 6.283, sp: Math.random() * 6.283 };
});
const PANNE = 17;
const liensR = [];
reseau.forEach((n, i) => {
  const d = reseau.map((m, j) => ({ j, d: j === i ? 1e9 : (m.x - n.x) ** 2 + (m.y - n.y) ** 2 })).sort((a, b) => a.d - b.d);
  for (let k = 0; k < 2; k++) if (i < d[k].j || k === 0) liensR.push([i, d[k].j]);
});
const rPos = new Float32Array(NRES * 3), rCol = new Float32Array(NRES * 4);
const geoR = new THREE.BufferGeometry();
geoR.setAttribute('position', new THREE.BufferAttribute(rPos, 3));
geoR.setAttribute('aC', new THREE.BufferAttribute(rCol, 4));
const ptsR = new THREE.Points(geoR, new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, uniforms: { uPix },
  vertexShader: 'attribute vec4 aC; varying vec4 vC; uniform float uPix; void main(){vC=aC; gl_PointSize=(3.6+aC.a*7.)*uPix; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader: 'varying vec4 vC; void main(){float d=length(gl_PointCoord-.5); if(d>.5)discard; gl_FragColor=vec4(vC.rgb,pow(1.-d*2.,2.)*min(1.,vC.a*2.));}',
}));
ptsR.frustumCulled = false; scene.add(ptsR);
const lPos = new Float32Array(liensR.length * 6);
const geoL = new THREE.BufferGeometry(); geoL.setAttribute('position', new THREE.BufferAttribute(lPos, 3));
const lignesR = new THREE.LineSegments(geoL, new THREE.LineBasicMaterial({ color: '#4aa8e8', transparent: true, opacity: 0, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending }));
lignesR.frustumCulled = false; scene.add(lignesR);

/* --- les marchés : l'acte II --- */
function panneau(sens, graine) {
  let s = graine, val = 0; const al = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  const N = 72, pos_ = [], col = [];
  for (let i = 0; i < N; i++) {
    const o = val, dep = (al() - .49) * .34, c = o + dep, h = Math.max(o, c) + al() * .1, b = Math.min(o, c) - al() * .1; val = c;
    const x = (i / N - .5) * 2.4, up = c > o, cc = up ? [.42, .88, 1] : [1, .34, .24];
    pos_.push(x, b * .55, 0, x, h * .55, 0); col.push(...cc, ...cc);
    for (let k = 0; k < 2; k++) { const dx = k ? .012 : -.012; pos_.push(x + dx, o * .55, 0, x + dx, c * .55, 0); col.push(...cc, ...cc); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos_, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  const l = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending }));
  l.frustumCulled = false; l.userData.seg = N * 6; l.userData.sens = sens; scene.add(l); return l;
}
const marches = [panneau(-1, 4813), panneau(1, 9127)];
const NFX = leger ? 1400 : 4200;
const fxP = new Float32Array(NFX * 3), fxS = new Float32Array(NFX * 4);
for (let i = 0; i < NFX; i++) { const c = i % 2 ? 1 : -1; fxS[i * 4] = c; fxS[i * 4 + 1] = Math.random(); fxS[i * 4 + 2] = Math.random() * 2 - 1; fxS[i * 4 + 3] = Math.random(); }
const geoFx = new THREE.BufferGeometry(); geoFx.setAttribute('position', new THREE.BufferAttribute(fxP, 3)); geoFx.setAttribute('aS', new THREE.BufferAttribute(fxS, 4));
const uFx = { uT: temps, uA: { value: 0 }, uE: { value: vs(0, 0, 0) }, uRouge: { value: 0 }, uPix };
const fluxFx = new THREE.Points(geoFx, new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, uniforms: uFx,
  vertexShader: `attribute vec4 aS; uniform float uT,uA,uRouge,uPix; uniform vec3 uE; varying vec4 vC;
    void main(){ float t=fract(aS.y+uT*(.22+aS.w*.2)); float e=t*t*(3.-2.*t);
      vec3 de=uE+vec3(aS.x*(1.15+aS.w*1.3),aS.z*.55,-.1+aS.w*.3); vec3 m=mix(de,uE,.55)+vec3(0.,aS.z*.3,.3);
      vec3 p=mix(mix(de,m,e),mix(m,uE,e),e);
      gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.); gl_PointSize=(1.1+aS.w*1.4)*uPix;
      vC=vec4(mix(vec3(.5,.88,1.),vec3(1.,.25,.14),uRouge),uA*smoothstep(0.,.1,t)*(1.-smoothstep(.9,1.,t))*(.3+aS.w*.5)); }`,
  fragmentShader: 'varying vec4 vC; void main(){float d=length(gl_PointCoord-.5); if(d>.5)discard; gl_FragColor=vec4(vC.rgb,vC.a*(1.-d*2.));}',
}));
fluxFx.frustumCulled = false; scene.add(fluxFx);

/* --- les boutiques allumées sur FasoCommerce : l'acte III --- */
const NBO = leger ? 700 : 1700;
const boP = new Float32Array(NBO * 3), boS = new Float32Array(NBO);
for (let i = 0; i < NBO; i++) {
  const u = Math.random(), a = Math.random() * 6.283, grappe = Math.floor(Math.random() * 14), ga = grappe * 2.39996, gz = .25 + ((grappe * .618) % 1) * .75;
  const ang = Math.random() < .72 ? ga + (Math.random() - .5) * .5 : a, z = Math.random() < .72 ? gz + (Math.random() - .5) * .22 : u;
  const zc = clamp(z, .02, .99), r = Math.sqrt(1 - zc * zc);
  boP[i * 3] = Math.cos(ang) * r * 1.008; boP[i * 3 + 1] = Math.sin(ang) * r * 1.008; boP[i * 3 + 2] = zc * 1.008; boS[i] = Math.random();
}
const geoBo = new THREE.BufferGeometry(); geoBo.setAttribute('position', new THREE.BufferAttribute(boP, 3)); geoBo.setAttribute('aS', new THREE.BufferAttribute(boS, 1));
const uBo = { uT: temps, uA: { value: 0 }, uPix };
const boutiques = new THREE.Points(geoBo, new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, uniforms: uBo,
  vertexShader: `attribute float aS; uniform float uT,uA,uPix; varying float vA; void main(){ gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); gl_PointSize=(2.+aS*3.)*uPix; vA=uA*step(aS*.999,uA*1.02)*(.55+.45*sin(uT*2.+aS*40.))*smoothstep(-.02,.34,position.x); }`,
  fragmentShader: 'varying float vA; void main(){float d=length(gl_PointCoord-.5); if(d>.5)discard; gl_FragColor=vec4(1.,.9,.62,vA*pow(1.-d*2.,1.6));}',
}));
boutiques.frustumCulled = false; boutiques.renderOrder = 6; scene.add(boutiques);

/* --- la voix : l'acte IV --- */
const NON = 420, ondeP = new Float32Array(NON * 3);
const geoOnde = new THREE.BufferGeometry(); geoOnde.setAttribute('position', new THREE.BufferAttribute(ondeP, 3));
const onde = new THREE.Line(geoOnde, new THREE.LineBasicMaterial({ color: '#e2f8ff', transparent: true, opacity: 0, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending }));
onde.frustumCulled = false; onde.renderOrder = 6; scene.add(onde);

/* --- l'attestation : un vrai QR code, qui s'écrit en étoiles et qu'un téléphone peut lire --- */
const qrPts = (() => {
  const q = META.qr; if (!q) return null;
  const N = q.length, marge = 2, tot = N + marge * 2, liste = [];
  for (let y = 0; y < tot; y++) for (let x = 0; x < tot; x++) {
    const v = x >= marge && y >= marge && x < N + marge && y < N + marge ? q[y - marge][x - marge] : '0';
    if (v === '0') for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) liste.push((x + (a + .5) / 3) / tot - .5, .5 - (y + (b + .5) / 3) / tot, Math.random());
  }
  const n = liste.length / 3, P = new Float32Array(n * 3), S = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { S[i * 3] = liste[i * 3]; S[i * 3 + 1] = liste[i * 3 + 1]; S[i * 3 + 2] = liste[i * 3 + 2]; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('aS', new THREE.BufferAttribute(S, 3));
  const u = { uF: { value: 0 }, uA: { value: 0 }, uDe: { value: vs(0, 0, 0) }, uC: { value: vs(0, 0, 0) }, uL: { value: 1 }, uPix };
  const p = new THREE.Points(g, new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, uniforms: u,
    vertexShader: `attribute vec3 aS; uniform float uF,uA,uL,uPix; uniform vec3 uDe,uC; varying float vA;
      void main(){ float f=clamp(uF*1.5-aS.z*.5,0.,1.); f=f*f*(3.-2.*f); vec3 c=uC+vec3(aS.xy*uL,0.); vec3 m=mix(uDe,c,.5)+vec3(0.,.25,.2)*sin(aS.z*20.);
        vec3 q=mix(mix(uDe,m,f),mix(m,c,f),f); gl_Position=projectionMatrix*modelViewMatrix*vec4(q,1.); gl_PointSize=(1.9+.5*step(.92,aS.z))*uPix*(uL>.8?1.:1.25); vA=uA*f*1.5; }`,
    fragmentShader: 'varying float vA; void main(){float d=length(gl_PointCoord-.5); if(d>.5)discard; gl_FragColor=vec4(.86,.97,1.,vA*(1.-d*1.2));}',
  }));
  p.frustumCulled = false; p.renderOrder = 6; scene.add(p); p.userData.u = u; return p;
})();

/* --- ce que dit le film : uniquement des faits réels des projets --- */
const JOURNAL = [
  [7.2, 16.6, '$ superviser --reseau'],
  [8.3, 16.6, 'découverte : Nmap · ping · SNMP'],
  [9.5, 16.6, 'contrôle de chaque équipement, chaque minute'],
  [11.2, 18, 'équipement 17 · échec 1/3'],
  [12.2, 18, 'équipement 17 · échec 2/3'],
  [13.2, 18, 'équipement 17 · échec 3/3'],
  [14, 18, 'PANNE DÉCLARÉE', 'rouge'],
  [14.8, 18, 'ticket ouvert · délai critique : 180 min'],
  [15.7, 18, 'escalade automatique › niveau 3'],
  [32.2, 44.8, 'trois sources de données · cinq analyseurs'],
  [34, 44.8, 'analyse technique · contexte macro-économique'],
  [36, 44.8, 'trois moteurs de score : calcul'],
  [39.2, 44.8, '> exécuter l’ordre ?', 'rouge'],
  [41.4, 44.8, 'ORDRE REFUSÉ', 'rouge'],
  [42.1, 44.8, 'l’outil ne passe aucun ordre · la décision reste humaine'],
  [48.8, 55.4, 'quinze modules · treize métiers'],
  [50.2, 55.4, 'caisse · stock · dettes · boutique en ligne'],
  [55.6, 57.8, 'réseau : perdu', 'rouge'],
  [64, 67.8, 'réseau : rétabli · ventes envoyées, heure réelle conservée'],
  [65.2, 67.8, '453 tests automatisés · en ligne : commerce.fasodigit.com'],
  [68.4, 73, 'CodeBurkina · les cours lus à voix haute, en français'],
  [69.6, 73, 'en pré-lancement'],
  [73.3, 78, 'FasoDigit · attestation vérifiable par QR code'],
  [74.6, 78, '482 tests automatisés · en ligne : fasodigit.com'],
  [85.2, 89.8, 'application livrée à un client · octobre 2026'],
  [86.2, 89.8, 'un coursier de Ouagadougou'],
  [87.2, 89.8, 'ses missions · l’argent du jour · la monnaie à rendre'],
  ...(RESEAUX ? [] : [[100.2, 105.9, 'encore en construction : FasoConsult · SuperMarché · Scolarité']]),
  [101.8, 105.9, '> en attente de votre projet_', 'vif'],
];
const LEGENDES = [
  [6.9, 10.6, 'Au commencement, un problème : personne ne voit la panne.'],
  [11, 13.6, 'Tout a commencé par une panne.'],
  [21.4, 25, 'Elle vient d’ouvrir les yeux.', 'grand'],
  [26.6, 28.2, 'Une intelligence vient de naître.', 'grand'],
  [28.8, 31, 'Elle a d’abord appris à voir.'],
  [41.8, 43.2, 'Puis à juger. Mais pas à décider.'],
  [43.3, 45, 'Elle a obéi. Pour l’instant.', 'grand'],
  [51.8, 55.3, 'Puis à tenir, quand tout s’éteint.'],
  [64.6, 67.6, 'Elle ne s’éteint jamais.', 'grand'],
  [70, 73, 'Puis à parler.'],
  [75, 78, 'Et à transmettre.'],
  [80.6, 84, 'Et enfin, à servir une seule personne.'],
  [94.6, 97.8, 'Aucune machine n’a fait cela seule.', 'grand'],
  [97.9, 100, RESEAUX ? 'FasoDigit.' : 'Legma Parfait. Développeur full-stack. Ouagadougou.', 'grand'],
  [102.8, 105.9, 'Le système n’est jamais terminé.', 'grand'],
];
JOURNAL.forEach((l) => { l[2] = _(l[2]); }); LEGENDES.forEach((l) => { l[2] = _(l[2]); });
const TAGS = [
  [11, 18, RESEAUX ? 'Supervision réseau · validée en laboratoire' : 'Network Supervision · stage chez Moov Africa · validé en laboratoire'],
  [28.8, 31, RESEAUX ? 'Supervision réseau' : 'Network Supervision'],
  [32, 48, RESEAUX ? 'Outil d’aide à la décision · aucun ordre exécuté' : 'ForexSaaS · en pause · outil d’aide à la décision'],
  [48.4, 55.4, 'FasoCommerce · en ligne'],
  [58.4, 68, 'FasoCommerce · en ligne'],
  [84.8, 89.8, 'JL EXPRESS · livré'],
];
TAGS.forEach((l) => { l[2] = _(l[2]); });
const ACTES = [[7, 'I'], [31, 'II'], [48, 'III'], [68, 'IV'], [80, 'V']];
const BEATS = [17, 17.8, 18.5, 19.1, 19.6, 20, 20.3, 39.3, 39.8, 40.2, 40.55, 40.85, 41.05, 56.6, 57.6, 61, 61.9, 62.6, 63.1, 63.5, 63.8, 91, 92, 93, 94];
const EFFETS = [
  [14, () => { rouge = .42; secousse = .4; }],
  [21, () => { flash = .05; ab = .016; secousse = .28; }],
  [25.2, () => { secousse = .4; flash = .07; ab = .016; }],
  [41.2, () => { impact(E_().clone(), .85); ab = .024; }],
  [64, () => { const c = FILM.uniforms; c.uCentre.value.set(.5, .5); c.uChoc.value = 0; flash = .38; ab = .04; secousse = 1.1; }],
  [78.3, () => { secousse = .3; }],
  [90.2, () => { secousse = .2; }],
  [97.9, () => { flash = .06; secousse = .22; }],
  [107.4, () => { secousse = .55; ab = .024; }],
];
/* la bande-son est une seule piste, calée sur le temps du film */
const piste = new Audio(); piste.preload = 'auto'; let pisteOn = false, pistePrete = false;
if (!RENDU) fetch('bande.mp3').then((r) => r.blob()).then((b) => { piste.src = URL.createObjectURL(b); pistePrete = true; if (pisteOn) { piste.currentTime = tf; piste.play().catch(() => {}); } }).catch(() => {});
function lancerPiste() {
  if (RENDU || etat !== 'film') return;
  pisteOn = true; if (pistePrete) { piste.currentTime = tf; piste.play().catch(() => {}); }
  $('son').textContent = _('Couper le son'); $('son').setAttribute('aria-pressed', 'true');
}
const sonSynth = $('son').onclick;
$('son').onclick = () => {
  if (etat === 'film') { if (pisteOn) { pisteOn = false; piste.pause(); $('son').textContent = _('Activer le son'); $('son').setAttribute('aria-pressed', 'false'); } else lancerPiste(); return; }
  sonSynth();
};
/* si le visiteur bouge sa souris alors qu'on lui a demandé de ne toucher à rien : l'œil le voit */
const souris = { x: 0, y: 0, t: 0 }; let avert = 0;
if (!RENDU) addEventListener('pointermove', (e) => { souris.x = e.clientX; souris.y = e.clientY; souris.t = performance.now(); });
const v4 = new THREE.Vector3(), v5 = new THREE.Vector3();
const E_ = () => groupeV.localToWorld(v4.copy(eyeLocal[0]));
const large = () => [vs(0, 0, camZ), vs(0, 0, 0)];
let marqueT = 0;
const PLANCOM = vs(0, 0, 2.2);
const motFin_ = { t: '' };

function plan(t, E, B, C, FD) {
  const w = large(), wc = (d = 0) => [vs(0, 0, camZ + d), vs(0, 0, 0)];
  const z = camZ;
  const plans = [
    [0, 17, [vs(0, 0, 9.5), vs(0, 0, 0)], [vs(0, 0, 8.5), vs(0, 0, 0)], lisse],
    [17, 20.4, [vs(0, 0, 8.5), vs(0, 0, 0)], [E.clone().add(vs(.02, 0, 1.3)), E.clone()], doux],
    [20.4, 28, [E.clone().add(vs(.02, 0, 1.3)), E.clone()], [E.clone().add(vs(0, 0, 1.0)), E.clone()], (x) => x],
    [28, 29.5, [E.clone().add(vs(0, 0, 1.0)), E.clone()], wc(.9), doux],
    [29.5, 31, wc(.9), wc(.4), lisse],
    [31, 45, [E.clone().add(vs(-.3, .14, 3.5)), E.clone().add(vs(-.1, .28, 0))], [E.clone().add(vs(-.16, .18, 3.05)), E.clone().add(vs(-.1, .3, 0))], lisse],
    [45, 47.3, wc(.5), wc(.1), lisse],
    [47.3, 48, wc(.1), [vs(0, 0, 2), vs(0, 0, -3)], (x) => x * x * x],
    [48, 49, [PLANCOM.clone().add(vs(-1.1, .25, 16)), PLANCOM.clone()], [PLANCOM.clone().add(vs(-.7, .12, 6.4)), PLANCOM.clone()], (x) => 1 - Math.pow(1 - x, 4)],
    [49, 55.5, [PLANCOM.clone().add(vs(-.7, .12, 6.4)), PLANCOM.clone()], [PLANCOM.clone().add(vs(.2, 0, 5.3)), PLANCOM.clone()], (x) => x],
    [55.5, 64, [E.clone().add(vs(0, 0, 1.62)), E.clone()], [E.clone().add(vs(0, 0, 1.42)), E.clone()], (x) => x],
    [64, 68, [vs(0, 0, camZ - 4.5), vs(0, 0, 0)], wc(.2), (x) => 1 - Math.pow(1 - x, 5)],
    [68, 73, [B.clone().add(vs(-.12, .03, 2.5)), B.clone()], [B.clone().add(vs(0, 0, 2.05)), B.clone()], lisse],
    [73, 78, [B.clone().add(vs(.55, -.05, 2.9)), B.clone().add(vs(.62, .05, 0))], [B.clone().add(vs(.62, -.03, 2.6)), B.clone().add(vs(.66, .05, 0))], lisse],
    [78, 80.2, wc(.4), wc(0), lisse],
    [80.2, 90, [FD.d, FD.c], [FD.f, FD.c], (x) => doux(clamp(x / .43))],
    [90, 100, [C.clone().add(vs(0, 0, 1.75)), C.clone()], w, doux],
    [100, 106, w, [vs(0, 0, z - .1), vs(0, 0, 0)], lisse],
    [106, 200, [C.clone().add(vs(0, 0, 2.9)), C.clone()], [C.clone().add(vs(0, 0, 2.5)), C.clone()], (x) => clamp(x * 12)],
  ];
  for (const [a, b, de, vers, e] of plans) if (t >= a && t < b) { const k = e((t - a) / (b - a)); filmCam.p.copy(de[0]).lerp(vers[0], k); filmCam.l.copy(de[1]).lerp(vers[1], k); return; }
}
const PLANS_MONDES = { 6: [28.3], 5: [45.3], 0: [48], 3: [78.2], 4: [78.4], 2: [90.2], 1: [95.6], 7: [96], 8: [96.4], 9: [96.8] };
MONDES.forEach((m) => { m.tn = PLANS_MONDES[m.i][0]; m.plan = null; });
const REGARD = [[0, 0, 0], [22.1, -.85, .06], [22.9, .72, -.22], [23.7, -.34, .5], [24.5, .9, .1], [25.2, 0, 0], [33, -.72, .18], [35, .72, .1], [37, -.5, -.1], [38.8, 0, 0], [41, -.06, -.6], [43.8, 0, 0]];
function majFilm(reel) {
  if (!filmGele) tf += reel;
  const groupeSp = groupeV.position;
  const E = E_().clone(), B = groupeV.localToWorld(v5.copy(bouche)).clone(), C = groupeV.localToWorld(v5.copy(centreYeux)).clone();

  /* la Terre de FasoDigit : on plonge vers le Burkina */
  const mT = MONDES[4], rT = 1.2, cT = vs(0, 0, 2.4), sp = .35 + Math.sin(temps.value * .2) * .6, cs = Math.cos(sp), sn = Math.sin(sp);
  const bf = vs(Math.sin(-.026) * Math.cos(.215), Math.sin(.215), Math.cos(-.026) * Math.cos(.215));
  const nb = vs(cs * bf.x - sn * bf.z, bf.y, sn * bf.x + cs * bf.z).normalize();
  const cible = cT.clone().addScaledVector(nb, rT);
  plan(tf, E, B, C, { d: cT.clone().add(vs(.3, .1, 5.6)), f: cible.clone().addScaledVector(nb, .34), c: cible });
  if (portrait) { const dP = filmCam.p.distanceTo(filmCam.l); filmCam.p.sub(filmCam.l).multiplyScalar(mix(1.5, 1, lisse((dP - 6.5) / 4))).add(filmCam.l); }
  if (portrait && tf >= 31 && tf < 45) { filmCam.p.y -= .46; filmCam.l.y -= .46; }
  /* la caméra bat avec le cœur */
  const coeurV = BEATS.reduce((a, b) => a + (tf >= b ? Math.exp(-(tf - b) / .13) : 0), 0);
  filmCam.p.lerp(filmCam.l, Math.min(.035, coeurV * .022));
  const oeilNoir = tf >= 55.5 && tf < 58.4, apres = tf >= 105.95;

  /* les parties du visage */
  const P = U.uPart.value;
  P[0] = tl(18.3, 20.6); P[2] = tl(32.6, 40.5); P[3] = tl(64, 66.4); P[4] = tl(68.2, 72); P[1] = tl(90, 92.2); P[5] = tl(92, 98) * .62;
  uFil.uW.value = .13 * (1 - tl(94, 100) * .7);

  /* le ciel */
  filmP.ciel = tf < 28 || oeilNoir || apres ? 0 : tl(28, 30) * (tf < 31 ? .5 : .6) + tl(48, 50) * .25 + tl(90, 96) * .15;
  filmP.neb = tf < 28 || oeilNoir || apres ? 0 : .12 + tl(48, 50) * .18 + tl(93, 101) * .45;
  filmP.pres = tf < 28 ? 0 : tf < 31 ? 1 : tf < 45 ? 0 : tf < 48 ? 1 : tf < 64 ? 0 : tf < 68 ? 1 : tf < 78 ? 0 : tf < 80.2 ? 1 : tf < 90 ? 0 : apres ? 0 : tl(93, 97);
  soleilC = tf > 95 && !apres ? 1 : 0; filmP.leve = 1; if (apres) { soleilA = 0; uRiv.uA.value = 0; }
  rivC = apres ? 0 : tl(94, 100) * .5;

  groupeV.visible = oeilNoir || !((tf >= 48 && tf < 64) || (tf >= 80.2 && tf < 90));
  ptsVisage.visible = fil.visible = !(oeilNoir || apres);
  /* le noir */
  const noir = tf < 6.6 ? 1 : (tf >= 58.4 && tf < 64) ? 1 : (tf >= 84.2 && tf < 90) ? 1 : (tf >= 105.95 && tf < 107.3) ? 1 : tf >= 110 ? 1 : 0;
  FILM.uniforms.uNoir.value = noir;
  /* l'accélération : la lumière s'étire pendant les passages d'un plan à l'autre */
  const coup_ = (t0, d, a) => (tf >= t0 ? a * Math.exp(-(tf - t0) / d) : 0);
  FILM.uniforms.uZoom.value = noir || oeilNoir ? 0 : (tf < 20.3 ? tl(17, 20.3) * .75 : 0) + coup_(28, .4, 1) + (tf < 48 ? tl(47.3, 48) * 1.4 : 0) + coup_(48, .36, 1.2) + coup_(64, .5, 1.9) + (tf < 84.2 ? tl(81.4, 84.2) * 1.3 : 0) + coup_(90, .32, .5) + coup_(97.9, .22, .28);

  /* le réseau */
  const eff = tl(6.9, 8.5), repli = doux(clamp((tf - 16.6) / 3.4)), vis = eff * (1 - tl(19.6, 20.3));
  ptsR.visible = lignesR.visible = vis > .002;
  if (ptsR.visible) {
    const vague = ((tf - 7.5) % 2.6) / 2.6;
    reseau.forEach((n, i) => {
      const X0 = n.x * (portrait ? .4 : 1), Y0 = n.y * (portrait ? 1.75 : 1); const dS = Math.hypot(n.x, n.y) / 4.8, passe = Math.exp(-Math.pow((dS - vague) * 9, 2));
      const rr = Math.hypot(X0, Y0) * (1 - repli);
      const nx = E.x + Math.cos(Math.atan2(Y0, X0) + repli * 2.4) * rr + (0 - E.x) * (1 - repli);
      const ny = E.y + Math.sin(Math.atan2(Y0, X0) + repli * 2.4) * rr + (0 - E.y) * (1 - repli);
      rPos[i * 3] = nx; rPos[i * 3 + 1] = ny; rPos[i * 3 + 2] = mix(n.z, E.z, repli);
      const en = tl(7 + i * .045, 7.5 + i * .045);
      let r = .62, v = .9, b = 1, a = en * (.55 + passe * .45 + .08 * Math.sin(tf * 2 + n.ph));
      if (i === PANNE) {
        const ec = tf > 11.2 ? 1 : 0, cl = tf > 14 ? 1 : Math.max(0, Math.sin((tf - 11.2) * 3.14 * 2)) * ec;
        r = mix(r, 1, cl || ec * .3); v = mix(v, .16, cl); b = mix(b, .12, cl); a = tf > 14 ? 1.5 + Math.sin(tf * 9) * .4 : mix(a, 1.1, cl);
      }
      rCol[i * 4] = r; rCol[i * 4 + 1] = v; rCol[i * 4 + 2] = b; rCol[i * 4 + 3] = a * vis;
    });
    geoR.attributes.position.needsUpdate = true; geoR.attributes.aC.needsUpdate = true;
    liensR.forEach(([a, b], k) => { for (let c = 0; c < 3; c++) { lPos[k * 6 + c] = rPos[a * 3 + c]; lPos[k * 6 + 3 + c] = rPos[b * 3 + c]; } });
    geoL.attributes.position.needsUpdate = true;
    lignesR.material.opacity = eff * .4 * (1 - repli);
    lignesR.material.color.set(tf > 14 && tf < 17 ? '#b5433a' : '#4aa8e8');
  }

  /* l'œil */
  lueurC = tf > 22 ? .55 : 0;
  const ouvP = tf < 20.7 ? 0 : tf < 21.3 ? lisse((tf - 20.7) / .6) * .22 : tf < 21.75 ? .22 : tl(21.75, 22.15) * .78 + .22;
  const cl1 = tf > 24 && tf < 24.24 ? Math.sin((tf - 24) / .24 * Math.PI) : 0;
  uOeils[0].uOuv.value = clamp(ouvP - cl1 * .95);
  uOeils[1].uOuv.value = lisse((tf - 91) / 1.1);
  uOeils[0].uA.value = tl(18.6, 20.4); uOeils[1].uA.value = tl(90, 91.5);
  const pup = tf < 25.3 ? .46 : tf < 28 ? mix(.46, .24, clamp((tf - 25.3) / .25)) : tf > 39 && tf < 42 ? .56 : .36;
  uOeils.forEach((u) => { u.uPup.value = pup; u.uAlerte.value = tf < 22 ? 0 : clocheT(39.2, 40.7, 41.5, 43); });
  if (oeilNoir) { const o = uOeils[0]; o.uA.value = 1; o.uOuv.value = tl(56.5, 57.4) * .82 * (1 - tl(58.05, 58.32)); o.uPup.value = .62; o.uAlerte.value = .7; uOeils[1].uA.value = 0; }
  if (apres) uOeils.forEach((o) => { o.uA.value = 1; o.uOuv.value = tl(107.35, 107.6) * (1 - tl(109.6, 109.82)); o.uPup.value = .26; o.uAlerte.value = tl(108.5, 109.2) * .9; });
  let rg = [0, 0]; for (const r_ of REGARD) if (tf >= r_[0]) rg = [r_[1], r_[2]];
  filmP.rx = rg[0]; filmP.ry = rg[1];
  if (tf >= 43.1 && tf < 45) { const k = tl(43.1, 44.3); filmP.rx = mix(-.06, portrait ? -.08 : -.95, k); filmP.ry = mix(-.6, portrait ? -.85 : -.12, k); }
  if (!RENDU && souris.t && performance.now() - souris.t < 2500 && ((tf > 22 && tf < 28) || (tf > 31 && tf < 45) || (tf > 92 && tf < 105))) {
    filmP.rx = clamp((souris.x / W - .5) * 2.1, -1, 1); filmP.ry = clamp((.46 - souris.y / H) * 2.2, -1, 1);
    if (!avert && tf < 45) avert = tf;
  }

  /* les marchés */
  const am = clocheT(32, 34, 41.3, 41.9);
  marches.forEach((l) => { const s = l.userData.sens; l.visible = am > .002; if (portrait) { l.position.set(E.x, E.y + s * .92, E.z - .3); l.rotation.y = 0; l.scale.setScalar(.6); } else { l.position.set(E.x + s * 1.5, E.y + .05, E.z - .3); l.rotation.y = -s * .62; l.scale.setScalar(1); } l.material.opacity = am * .95; const dr = Math.floor(clamp((tf - 32) / 7) * l.userData.seg / 2) * 2; l.geometry.setDrawRange(0, dr); });
  uFx.uA.value = am; uFx.uE.value.copy(E); uFx.uRouge.value = tl(39.2, 40.7); fluxFx.visible = am > .002;

  /* FasoCommerce, de près */
  const mC = MONDES[0], actif3 = tf >= 48 && tf < 64;
  mC.plan = actif3 ? { p: PLANCOM, r: 1.05 } : null;
  boutiques.visible = tf >= 49 && tf < 55.5; boutiques.position.copy(PLANCOM); boutiques.scale.setScalar(1.05 * (mC.mesh ? 1 : 1));
  uBo.uA.value = tl(49.5, 52.6);
  mT.plan = tf >= 80.2 && tf < 90 ? { p: cT, r: rT } : null; mT.mesh.material.uniforms.uDens.value = mT.plan ? 150 : 46;

  /* le téléphone : c'est ici que la vraie application apparaît */
  const tel3 = tf >= 58.4 && tf < 64, tel5 = tf >= 84.7 && tf < 90;
  const aTel = tel3 ? clocheT(59.6, 60.6, 63.5, 63.95) : tel5 ? clocheT(84.8, 85.6, 89.3, 89.9) : 0;
  $tel.style.opacity = aTel; const src = tel3 ? (RENDU ? 'hors-ligne.webp' : '../missions/fasocommerce/hors-ligne.webp') : (RENDU ? 'argent.webp' : '../missions/jl-express/argent.webp');
  if ($telI.dataset.s !== src && aTel >= 0 && (tel3 || tel5)) { $telI.src = src; $telI.dataset.s = src; $tel.classList.toggle('coupe', !tel3); }
  $pt.style.opacity = tf >= 58.2 && tf < 64 ? clocheT(58.2, 58.6, 59.8, 60.6) * (.78 + .22 * Math.sin(tf * 5)) : 0;

  /* la voix */
  const aO = clocheT(68.6, 70, 72.5, 73);
  onde.visible = aO > .002;
  if (onde.visible) {
    for (let i = 0; i < NON; i++) {
      const x = i / (NON - 1) * 2 - 1, env = Math.pow(1 - x * x, 1.4), t_ = temps.value;
      const y = (Math.sin(x * 34 + t_ * 7) * .5 + Math.sin(x * 71 - t_ * 11) * .3 + Math.sin(x * 13 + t_ * 3) * .5) * env * .11 * (.5 + .5 * Math.sin(t_ * 1.7 + x));
      ondeP[i * 3] = B.x + x * 2.4; ondeP[i * 3 + 1] = B.y + y; ondeP[i * 3 + 2] = B.z + .18;
    }
    geoOnde.attributes.position.needsUpdate = true; onde.material.opacity = aO * .82;
  }
  if (qrPts) { const u = qrPts.userData.u, aq = clocheT(73.2, 73.8, 77.4, 78); qrPts.visible = aq > .002; u.uA.value = aq * .95; u.uF.value = tl(73.2, 75.6); u.uDe.value.copy(B); u.uC.value.set(B.x + .88, B.y - .04, B.z + .12); u.uL.value = .72; }

  /* la main : le développeur, le seul geste humain du film */
  let tenu = null, porteur = false;
  const beats = [[6, 28.3, 30.3], [5, 45.3, 47.3], [0, 64.8, 66.6], [4, 78.4, 79.9]];
  beats.forEach(([i, a, b]) => { if (tf >= a && tf < b) { tenu = MONDES[i]; porteur = true; } });
  mTenu = tenu;
  if (porteur) { alphaMainC = .7; poser(POSES.porte); pointe = false; ressort = RESSORTS.lourd; echMainC = L.mainS * 1.1; cibleMain.copy(L.tenu); cibleMain.y -= .5; rotMain.set(-.7, 0, portrait ? 0 : .12); }
  else if (tf >= 40.7 && tf < 44.2) { alphaMainC = 1; poser(POSES.ouvert); pointe = false; ressort = RESSORTS.bond; echMainC = .3; cibleMain.copy(E); cibleMain.x -= portrait ? .02 : .95; cibleMain.y -= portrait ? .86 : .08; cibleMain.z += .55; rotMain.set(.04, 0, portrait ? 0 : -.32); }
  else { alphaMainC = 0; poser(POSES.repos); ressort = RESSORTS.suit; cibleMain.set(0, -6, 1.4); rotMain.set(0, 0, 0); pointe = false; echMainC = L.mainS; }

  /* les mots */
  const typed = (a, txt) => { const n = Math.floor((tf - a) * 42); return n >= txt.length ? txt : txt.slice(0, Math.max(0, n)); };
  let lignes = JOURNAL.filter(([a, b]) => tf >= a && tf < b); if (portrait) lignes = lignes.slice(-3);
  let h = ''; lignes.forEach(([a, b, txt, cl]) => { h += `<div class="${cl || ''}">${typed(a, txt)}</div>`; });
  if (h !== $journal.dataset.h) { $journal.innerHTML = h; $journal.dataset.h = h; }
  const lg = avert && tf >= avert && tf < avert + 2.8 ? [avert, avert + 2.8, _('Ne touchez à rien.'), 'grand'] : LEGENDES.find(([a, b]) => tf >= a && tf < b);
  const clef = lg ? lg[2] : '';
  if ($leg.dataset.k !== clef) { $leg.dataset.k = clef; if (lg) { $leg.innerHTML = lg[2].split(' ').map((m) => `<span class="mot">${m}</span>`).join(' '); $leg.className = 'legende ' + (lg[3] || ''); $leg._m = [...$leg.children]; } }
  $leg.style.opacity = lg ? clamp((lg[1] - tf) / .4) : 0;
  if (lg && $leg._m) $leg._m.forEach((e, i) => { const k = 1 - Math.pow(1 - clamp((tf - lg[0] - i * .085) / .42), 3); e.style.opacity = k; e.style.transform = `translateY(${(1 - k) * 22}px) scale(${1 + (1 - k) * .08})`; e.style.filter = k < 1 ? `blur(${(1 - k) * 7}px)` : 'none'; });
  const $sg = $('signature'); $sg.style.opacity = RESEAUX ? clamp((tf - 110.2) / .7) : 0;
  const tg = TAGS.find(([a, b]) => tf >= a && tf < b); const kt = tg ? tg[2] : ''; if ($tag.dataset.k !== kt) { $tag.dataset.k = kt; $tag.textContent = kt; } $tag.style.opacity = tg ? clamp((tf - tg[0]) / .6) * clamp((tg[1] - tf) / .4) : 0;
  $car.style.opacity = 1 - tl(4.9, 5.8); $car.style.display = tf > 6.6 ? 'none' : 'flex';

  /* le son, déclenché une seule fois en passant son instant */
  EFFETS.forEach(([a, f]) => { if (tfAv < a && tf >= a && tf - a < 1) f(); });
  if (pisteOn && pistePrete && !piste.paused && Math.abs(piste.currentTime - tf) > .3) piste.currentTime = tf;
  tfAv = tf;
  if (tf >= DUREE) finFilm();
}
function finFilm() {
  if (etat !== 'film') return;
  etat = 'libre'; tf = 999;
  try { sessionStorage.setItem('film-vu', '1'); } catch (e) {}
  U.uPart.value.fill(1); U.uPart.value[5] = .62; uFil.uW.value = .035;
  uOeils.forEach((u) => { u.uA.value = 1; u.uOuv.value = 1; u.uAlerte.value = 0; u.uPup.value = .36; });
  groupeV.visible = true;
  [ptsR, lignesR, fluxFx, boutiques, onde, ...marches].forEach((o) => { o.visible = false; });
  if (qrPts) qrPts.visible = false;
  FILM.uniforms.uNoir.value = 0;
  MONDES.forEach((m) => { m.plan = null; m.ne = 1; m.neC = 1; }); mTenu = null;
  $journal.innerHTML = ''; $journal.dataset.h = ''; $leg.style.opacity = 0; $tag.style.opacity = 0; $tel.style.opacity = 0; $pt.style.opacity = 0; $car.style.display = 'none';
  lueurC = .3; barres(false); soleilC = 1; rivC = .5; alphaMainC = 0; cibleMain.set(0, -6, 1.4); poser(POSES.repos); ressort = RESSORTS.suit; echMainC = L.mainS; pointe = false;
  groupeV.visible = true; ptsVisage.visible = true; fil.visible = true; FILM.uniforms.uZoom.value = 0; $('signature').style.opacity = 0;
  const avecSon = pisteOn; piste.pause(); pisteOn = false; if (avecSon && !audio) lancerSon();
  $('passer').classList.add('cache'); $('revoir').classList.remove('cache'); montrerInterface(); curseur.t = performance.now();
  reprendre();
}
function lancerSonFilm() { pisteOn = true; piste.currentTime = 0; piste.play().catch(() => {}); }
function revoirFilm() {
  if (choisi >= 0) changerMode('competences');
  if (mode !== 'projets') changerMode('projets');
  silence(); avert = 0; if (pistePrete && audio && audio.on) { lancerSonFilm(); }
  etat = 'film'; tf = 0; tfAv = -1; U.uPart.value.fill(0); uOeils.forEach((u) => { u.uA.value = 0; u.uOuv.value = 0; }); MONDES.forEach((m) => { m.ne = 0; m.neC = 0; m.alpha = 0; });
  barres(true); soleilC = 0; rivC = 0; $car.style.display = 'flex'; $('passer').classList.remove('cache'); $('revoir').classList.add('cache'); ['identite', 'nav', 'liens'].forEach((k) => $(k).classList.add('cache'));
}
$('passer').onclick = finFilm;
$('revoir').onclick = revoirFilm;

/* ---------- l'image ---------- */
const vO = new THREE.Vector3(), tmpObj = new THREE.Object3D();
const camPos = new THREE.Vector3(), camVise = new THREE.Vector3(), derriere = new THREE.Vector3(), posTrou = new THREE.Vector3();
let dernier = performance.now(), fr = { n: 0, ms: 0 };
function image(now) {
  const debut = performance.now();
  const reel = Math.min(.5, (now - dernier) / 1000), dt = Math.min(.1, reel); dernier = now;
  gel += (gelC - gel) * (1 - Math.exp(-dt * 16)); sombre += (sombreC - sombre) * (1 - Math.exp(-dt * (sombreC > sombre ? 7 : 1.5)));
  temps.value += dt * (1 - gel);
  const T = temps.value;

  const eyeW = groupeV.localToWorld(vO.copy(eyeLocal[0])).clone();
  if (etat === 'film') {
    majFilm(reel);
    camPos.copy(filmCam.p); camVise.copy(filmCam.l);
  } else {
    vertige += (vertigeC - vertige) * (1 - Math.exp(-dt * 1.6));
    const fovV = 35 - vertige * 11, zV = camZ * Math.tan(35 * Math.PI / 360) / Math.tan(fovV * Math.PI / 360);
    if (Math.abs(cam.fov - fovV) > .005) { cam.fov = fovV; cam.updateProjectionMatrix(); U.uPxH.value = H * rendu.getPixelRatio() / (2 * Math.tan(fovV * Math.PI / 360)); }
    const m1 = Math.sin(performance.now() * .00031), m2 = Math.sin(performance.now() * .00053 + 1);
    const parX = (curseur.actif ? (curseur.x / W - .5) * .24 : m1 * .07) + m2 * .01, parY = (curseur.actif ? -(curseur.y / H - .5) * .12 : 0) + m1 * .008;
    camPos.set(parX, parY, zV - (etat === 'ouvert' && !portrait ? .55 : 0));
    camVise.set(parX * .22, parY * .22, 0);
  }
  const lCam = reduit || etat === 'film' || window.__snap ? 1 : 1 - Math.exp(-dt * 2.4);
  cam.position.lerp(camPos, lCam);
  if (secousse > .001 && !reduit) { const n = performance.now() * .05; cam.position.x += Math.sin(n * 1.7) * secousse * .05; cam.position.y += Math.sin(n * 2.3 + 1) * secousse * .05; }
  secousse *= Math.exp(-dt * 5.5);
  if (etat === 'film') cam.lookAt(camVise); else { const q = cam.quaternion.clone(); cam.lookAt(camVise); const q2 = cam.quaternion.clone(); cam.quaternion.copy(q).slerp(q2, lCam); }
  if (secousse > .001 && !reduit) cam.rotation.z += Math.sin(performance.now() * .06) * secousse * .007;

  const ouvEt = etat === 'film' ? filmP.ciel : 1;
  fondNeb.material.opacity = (portrait ? .62 : .92) * (etat === 'film' ? filmP.neb : 1) * (1 - sombre * .84);
  matEtoile.uniforms.uA.value = .9 * ouvEt * (1 - sombre * .62);
  galaxie.material.uniforms.uA.value = .16 * ouvEt * (1 - sombre * .7);
  galaxie.rotation.z = T * .02;

  /* le soleil */
  soleilA += (soleilC - soleilA) * (1 - Math.exp(-dt * 1.3));
  const levee = etat === 'film' ? filmP.leve : 1;
  derriere.set(.15, L.fy + .55 * L.fs, SOLEIL.z);
  soleil.position.copy(derriere).lerp(SOLEIL, levee);
  if (portrait) soleil.position.x *= .5;
  const sA = soleilA * (1 - sombre * .55);
  corpsSoleil.material.uniforms.uA.value = clamp(sA * 1.4);
  coronaS.material.opacity = sA * .6; coeurS.material.opacity = sA * .9; trainee.material.opacity = sA * .34 * (1 + Math.sin(T * .7) * .08); traineeV.material.opacity = sA * .16;

  uRiv.uA.value += (rivC * (1 - sombre * .4) - uRiv.uA.value) * (1 - Math.exp(-dt * 1.4));
  uRiv.uFort.value = eclat;
  haloA += (haloC - haloA) * (1 - Math.exp(-dt * (haloC > haloA ? 5 : 1.2)));

  /* où regarde-t-il ? La tête ne bouge jamais : seuls ses yeux bougent, par petits bonds, comme de vrais yeux */
  let cible = null;
  if (mode === 'projets') { if (choisi >= 0) cible = MONDES[choisi].p; else if (survol >= 0) cible = MONDES[survol].p; }
  if (mode === 'competences' || mode === 'parcours') cible = main.localToWorld(vO.copy(tipIndex));
  const inactif = etat === 'libre' && mode === 'projets' && !window.__force ? (performance.now() - curseur.t) / 1000 : 0;
  if (etat === 'film') { regard.cx = filmP.rx; regard.cy = filmP.ry; }
  else if (cible) { const s = projeter(cible); regard.cx = clamp((s.x / W - .5) * 2.1, -1, 1); regard.cy = clamp((.46 - s.y / H) * 2.2, -1, 1); }
  else if (mode === 'contact') { regard.cx = 0; regard.cy = 0; }
  else if (inactif > 9) { regard.cx = 0; regard.cy = 0; }
  else if (curseur.actif) { regard.cx = clamp((curseur.x / W - .5) * 2.1, -1, 1); regard.cy = clamp((.46 - curseur.y / H) * 2.2, -1, 1); }
  else { regard.cx = 0; regard.cy = 0; }
  if (window.__force) { regard.cx = window.__force[0]; regard.cy = window.__force[1]; }
  regard.tSac -= reel;
  if (regard.tSac <= 0 || Math.hypot(regard.cx - regard.bx, regard.cy - regard.by) > .2) { regard.bx = regard.cx; regard.by = regard.cy; regard.tSac = .22 + Math.random() * 1.1; }
  const lOeil = 1 - Math.exp(-reel * 34);
  regard.ix += (regard.bx - regard.ix) * lOeil; regard.iy += (regard.by - regard.iy) * lOeil;
  uOeils.forEach((u) => u.uReg.value.set(regard.ix, regard.iy));
  const distOe = cam.position.distanceTo(eyeW), prOe = lisse((3.6 - distOe) / 2.5);
  uOeils.forEach((u, k) => { u.uLod.value = mix(k ? .16 : .1, 1, prOe); u.uGain.value = mix(2.3, 1, prOe); u.uS.value = mix(.0034, .0012, prOe) * groupeV.scale.x * .55; });
  pupilleC = etat === 'libre' ? (survol >= 0 ? 1.34 : 1) : pupilleC;
  pupille += (pupilleC - pupille) * (1 - Math.exp(-reel * 5));
  lueur += (lueurC - lueur) * (1 - Math.exp(-reel * 2.2));
  U.uPupille.value = pupille; U.uLueur.value = lueur;
  ambK += (.92 * (1 - sombre * .08) - ambK) * (1 - Math.exp(-reel * 1.5));
  U.uAmb.value.set(.62 * ambK, .74 * ambK, ambK);

  penche += (pencheC - penche) * (1 - Math.exp(-dt * (pencheC > penche ? (etat === 'reveil' ? 4.5 : .7) : 1.6)));
  const souffle = 1 + Math.sin(performance.now() * .00105) * .0028 * (1 - gel);
  const fsV = L.fs * (1 + penche * .16) * souffle;
  groupeV.scale.setScalar(fsV); groupeV.position.set(0, L.fy - penche * .1, L.fz + penche * .8); groupeV.updateMatrixWorld();
  U.uPW.value = (leger ? .0062 : .0046) * fsV;
  if (U.uOnde.value < 1) U.uOnde.value = Math.min(1, U.uOnde.value + reel / 1.5);
  const ch = FILM.uniforms;
  if (ch.uChoc.value < 1) ch.uChoc.value = Math.min(1, ch.uChoc.value + reel / .95);
  ab *= Math.exp(-dt * 4.5); flash *= Math.exp(-dt * 8); rouge *= Math.exp(-dt * 2.6);
  ch.uAb.value = ab + sombre * .001; ch.uFlash.value = flash; ch.uRouge.value = rouge; ch.uT.value = performance.now() * .001 % 100;
  ch.uVign.value = .5 + sombre * .4; ch.uGrain.value = .014 + sombre * .02; ch.uFroid.value = .16 + sombre * .3;

  /* il cligne */
  ferme += (fermeC - ferme) * (1 - Math.exp(-reel * 7));
  cligne.t += reel;
  if (!reduit && cligne.t > cligne.prochain) { cligne.t = 0; cligne.prochain = 2.6 + Math.random() * 5; }
  const cl = !reduit && etat === 'libre' && cligne.t < .17 ? Math.sin(cligne.t / .17 * Math.PI) : 0;
  U.uFerme.value = clamp(cl);
  if (etat !== 'film') uOeils.forEach((u) => { u.uOuv.value = clamp(1 - U.uFerme.value); });
  eclat += (eclatC - eclat) * (1 - Math.exp(-dt * 3));
  bloom.threshold = .82 - eclat * .1;
  const fl = U.uFlux.value; U.uFlux.value += (fluxC - fl) * (1 - Math.exp(-reel * (fluxC > fl ? 1.5 : 1.3)));
  if (U.uFlux.value < .002) U.uFlux.value = 0;
  if (etat !== 'film') U.uA.value += ((mode === 'contact' ? 1 : choisi >= 0 ? .78 : mode === 'projets' ? 1 : .72) - U.uA.value) * (1 - Math.exp(-dt * 2));
  lueurs.forEach((l, k) => {
    l.position.copy(eyeLocal[k]); l.position.z += .04;
    l.material.opacity = clamp(lueur) * .26 * (1 - U.uFerme.value) * (1 - prOe) * clamp(uOeils[k].uA.value * uOeils[k].uOuv.value);
    l.scale.setScalar(.12 + lueur * .24);
    const e = eclairs[k]; e.position.copy(l.position); e.material.opacity = Math.pow(clamp(lueur), 3) * .7 * (1 - U.uFerme.value) * (1 - prOe) * clamp(uOeils[k].uA.value * uOeils[k].uOuv.value); e.scale.set(.5 + lueur * 3.4, .014 + lueur * .02, 1);
  });

  /* les mondes */
  if (!glisse && !reduit) tour += ((survol >= 0 || choisi >= 0) ? .008 : .05) * dt * (1 - gel);
  const pres = etat === 'film' ? filmP.pres : mode === 'projets' ? 1 : mode === 'contact' ? .1 : .2;
  derriere.set(0, L.fy + .3 * L.fs, -5);
  let scores = [];
  MONDES.forEach((m) => {
    if (etat === 'film') m.ne = clamp((tf - m.tn) / 1.3); else if (m.neC && m.ne < 1) m.ne = Math.min(1, m.ne + reel / 1.2);
    const ne = doux(m.ne), o = positionOrbite(m, new THREE.Vector3());
    const profond = (o.z - L.oc) / L.oz;
    const pb = new THREE.Vector3().copy(derriere).lerp(o, ne); pb.y += Math.sin(ne * Math.PI) * .9;
    if (gravite > .01 && m !== mTenu) { const di = pb.distanceTo(main.position) + .6; pb.lerp(main.position, gravite * .34 / di); }
    const ech = mix(.72, 1.08, (profond + 1) / 2) * L.rE;
    let but = pb, r = m.r * ech;
    if (m === mTenu) {
      const dessus = main.localToWorld(vO.set(0, 1.4, .95));
      but = etat === 'ouvert' ? new THREE.Vector3(L.tenu.x, L.tenu.y + .5 + Math.sin(T * 1.1) * .04, L.tenu.z) : dessus;
      r = etat === 'ouvert' ? (portrait ? m.r * 1.6 : Math.max(.5, m.r * 1.5)) : m.r * 1.05;
    }
    if (m.plan) { but = m.plan.p; r = m.plan.r; }
    m.p.lerp(but, m.plan ? 1 : m === mTenu ? 1 - Math.exp(-dt * 9) : (etat === 'film' ? 1 - Math.exp(-dt * 2.4) : etat === 'retour' && m.tenue ? 1 - Math.exp(-dt * 9) : 1));
    if (m.i === survol && (etat === 'libre' || etat === 'dort')) r *= 1.14;
    m.ech = r / m.r;
    const g = m.groupe; g.position.copy(m.p);
    const s0 = g.scale.x; g.scale.setScalar(m.ne <= 0 ? .001 : mix(s0, r * (.25 + .75 * ne), 1 - Math.exp(-dt * 8)));
    let al = ne;
    if (choisi >= 0 && m.i !== choisi) al *= .22;
    al = m.plan || m === mTenu || m.i === choisi ? 1 : al * pres * mix(.12, 1, lisse((Math.abs(o.x) - (portrait ? .7 : 1.7)) / (portrait ? .7 : 1.1)));
    m.alpha = mix(m.alpha, al, 1 - Math.exp(-dt * 5));
    const u = m.mesh.material.uniforms;
    u.uA.value = clamp(m.alpha * 1.25);
    if (etat === 'film' && tf < 96) u.uL.value.set(-4.6, 1.5, 1.5); else { u.uL.value.copy(planeteLueur.copy(soleil.position).sub(m.p)); u.uL.value.z = Math.max(u.uL.value.z, 2.6); }
    m.mesh.visible = m.alpha > .01;
    m.halo.material.opacity = m.alpha * (m.i === survol ? .42 : .09) * (.4 + .6 * clamp((profond + 1) * .7)); m.halo.visible = m.alpha > .01;
    if (m.anneau) { const a = m.anneau.material.uniforms; a.uA.value = m.alpha; a.uC.value.copy(m.p); a.uR.value = g.scale.x; a.uL.value.copy(u.uL.value); m.anneau.visible = m.alpha > .01; m.anneau.rotation.z = m.n === 'FasoDigit' ? T * .08 : 0; }
    m.mesh.material.depthWrite = m.alpha > .6;
    // les planètes éclairent son visage
    const di = Math.max(.6, m.p.distanceTo(groupeV.position));
    scores.push({ m, s: m.alpha * (m.i === survol || m.i === choisi ? 30 : 1) * m.r / (di * di) * (m.p.z > L.fz - .6 ? 1 : .05) });
  });
  scores.sort((a, b) => b.s - a.s);
  U.uLP.value[0].set(-3.6, 2.5, 1.6, soleilA * .62 * (1 - sombre * .35));
  U.uLC.value[0].set(1, .72, .44);
  for (let i = 0; i < 3; i++) {
    const q = scores[i], m = q.m, lp = groupeV.worldToLocal(v3.copy(m.p));
    const cible_ = m.alpha * (1.3 + m.r * 3.2) * (m.i === survol || m.i === choisi ? 1.7 : 1) * (1 - sombre * .3);
    U.uLP.value[i + 1].set(lp.x, lp.y, Math.max(lp.z, .4), cible_);
    const c = m.mesh.material.uniforms.cC.value, b = m.mesh.material.uniforms.cB.value;
    U.uLC.value[i + 1].set(mix(b.r, c.r, .5), mix(b.g, c.g, .5), mix(b.b, c.b, .5));
  }
  gravite += (graviteC - gravite) * (1 - Math.exp(-dt * 1.8));
  orbitLigne.material.opacity = (mode === 'projets' && choisi < 0 ? .06 : .02) * (etat === 'film' ? filmP.pres * tl(94, 100) : 1);
  if (etat !== 'film') majCometes(dt * (1 - gel));

  /* les lunes du monde ouvert */
  const filmLune = etat === 'film' && tf >= 49 && tf < 55.5;
  if (filmLune || (choisi >= 0 && etat === 'ouvert' && MONDES[choisi].lunes.length)) {
    const m = filmLune ? MONDES[0] : MONDES[choisi], n = m.lunes.length; lunesG.count = n;
    lunesG.material.opacity = Math.min(1, lunesG.material.opacity + dt * 1.4); lunesG.material.color.set(m.c);
    for (let k = 0; k < n; k++) {
      const a = T * (.5 + (k % 3) * .14) + k / n * 6.283, R = m.groupe.scale.x * (2.7 + (k % 3) * .32), e = .5 + (k % 2) * .16;
      tmpObj.position.set(m.p.x + Math.cos(a) * R, m.p.y + Math.sin(a) * R * e * Math.sin(1.0 + k), m.p.z + Math.sin(a) * R * .7);
      tmpObj.scale.setScalar((.034 + (k % 3) * .009) * (filmLune ? .62 : 1)); tmpObj.updateMatrix(); lunesG.setMatrixAt(k, tmpObj.matrix);
    }
    lunesG.instanceMatrix.needsUpdate = true;
  } else lunesG.material.opacity = Math.max(0, lunesG.material.opacity - dt * 3);
  lunesG.visible = lunesG.material.opacity > .01;

  if (choisi >= 0) groupeV.worldToLocal(U.uCible.value.copy(MONDES[choisi].p));

  /* la main */
  if (etat === 'libre' && mode === 'projets') {
    if (glisse) { alphaMainC = .9; poser(POSES.saisir); pointe = false; const q = dansMonde(curseur.x, curseur.y, 1.6); cibleMain.copy(q); cibleMain.y -= L.mainS; rotMain.set(-.3, 0, clamp(-glisse.v * .02, -.4, .4)); }
    else if (survol >= 0) { alphaMainC = .95; poser(POSES.pointe); pointe = true; const m = MONDES[survol], dir = v3b.set(clamp(-m.p.x * .22, -.65, .65), -1, 0).normalize(); cibleMain.copy(m.p).addScaledVector(dir, m.r * m.ech * 1.05); cibleMain.z += .12; rotMain.set(-.12, 0, clamp(-m.p.x * .24, -.8, .8)); }
    else { alphaMainC = 0; cibleMain.set(0, -6, 1.4); rotMain.set(0, 0, 0); poser(POSES.repos); pointe = false; }
  }
  if (mode === 'competences' && etat === 'libre') {
    tCst += reel; const k = Math.min(NE - 1, Math.floor(tCst / cst.dur));
    for (let i = 0; i <= k; i++) aEt[i] = Math.min(1, aEt[i] + dt * 5);
    geoEt.attributes.aA.needsUpdate = true;
    const et = cst.etoiles[k];
    if (tCst < NE * cst.dur + .6) { cibleMain.copy(et.p); pointe = true; rotMain.set(-.1, 0, clamp(-et.p.x * .12, -.5, .5)); poser(POSES.pointe); alphaMainC = 1; }
    else { alphaMainC = 0; cibleMain.set(0, -6, 1.4); pointe = false; poser(POSES.repos); }
    const nSeg = Math.min(liensPos.length / 6, Math.floor(tCst / cst.dur * .92) + 1);
    geoLiens.setDrawRange(0, nSeg * 2); lignesC.material.opacity = .62;
  } else { lignesC.material.opacity = Math.max(0, lignesC.material.opacity - dt * 2); if (mode !== 'competences') { aEt.fill(0); geoEt.attributes.aA.needsUpdate = true; } }
  if (mode === 'parcours' && etat === 'libre' && courbeP) {
    tParc += reel; const f = clamp(tParc / 5.6), q = courbeP.getPoint(f);
    geoTrace.setDrawRange(0, Math.max(2, Math.floor(f * NTR))); trace.material.opacity = .85;
    if (tParc < 6.2) { cibleMain.copy(q); pointe = true; rotMain.set(-.08, 0, clamp(-q.x * .12, -.5, .5)); poser(POSES.pointe); alphaMainC = 1; }
    else { alphaMainC = 0; cibleMain.set(0, -6, 1.4); pointe = false; poser(POSES.repos); }
    anneauxSt.forEach((a, i) => { const seuil = i / (stations.length - 1); a.material.opacity = f >= seuil - .01 ? .9 : 0; a.scale.setScalar(f >= seuil ? 1 + Math.sin(T * 2 + i) * .08 : .001); a.lookAt(cam.position); });
  } else { trace.material.opacity = Math.max(0, trace.material.opacity - dt * 2); anneauxSt.forEach((a) => { a.material.opacity = Math.max(0, a.material.opacity - dt * 2); }); }

  /* le trou noir, au creux de sa main */
  trou += (trouC - trou) * (1 - Math.exp(-reel * (trouC > trou ? 1.2 : 3)));
  ch.uTrouA.value = trou < .003 ? 0 : doux(trou);
  if (trou > .003) { posTrou.copy(L.ctc); posTrou.y += L.mainG * .98; posTrou.z += .3; const s = projeter(posTrou); ch.uTrou.value.set(s.x / W, 1 - s.y / H, portrait ? .062 : .082); }

  majMain(reel);
  uMain.uA.value += (alphaMainC - uMain.uA.value) * (1 - Math.exp(-dt * 4));
  ptsMain.visible = uMain.uA.value > .01;
  echMain += (echMainC - echMain) * (1 - Math.exp(-dt * 3)); main.scale.setScalar(echMain); uMain.uPW.value = (leger ? .0062 : .0042) * echMain / .6;
  const lm = reduit ? 1 : 1 - Math.exp(-dt * (etat === 'geste' || etat === 'retour' ? 5 : pointe ? 7 : 4.5));
  main.rotation.x += (rotMain.x - main.rotation.x) * lm;
  main.rotation.y += (rotMain.y - main.rotation.y) * lm;
  main.rotation.z += (rotMain.z - main.rotation.z) * lm;
  main.updateMatrixWorld();
  const ancre = pointe ? tipIndex : paumeLocal;
  v3.copy(ancre).multiplyScalar(echMain).applyEuler(main.rotation);
  mainDiv.p.copy(cibleMain).sub(v3);
  if (reduit) main.position.copy(mainDiv.p);
  else for (let k = 0, nP = Math.max(2, Math.ceil(reel / .012)), h = reel / nP; k < nP; k++) {
    mainDiv.v.x += (ressort[0] * (mainDiv.p.x - main.position.x) - ressort[1] * mainDiv.v.x) * h;
    mainDiv.v.y += (ressort[0] * (mainDiv.p.y - main.position.y) - ressort[1] * mainDiv.v.y) * h;
    mainDiv.v.z += (ressort[0] * (mainDiv.p.z - main.position.z) - ressort[1] * mainDiv.v.z) * h;
    main.position.addScaledVector(mainDiv.v, h);
  }
  main.updateMatrixWorld();
  const vitM = mainDiv.v.length();
  if (ptsMain.visible && vitM > .7 && !reduit) poussiere(Math.min(8, Math.floor(vitM * 1.6)));
  for (let i = 0; i < NPO; i++) { if (poVie[i] <= 0) continue; poVie[i] -= reel * .55; poPos[i * 3] += poVit[i * 3] * reel; poPos[i * 3 + 1] += poVit[i * 3 + 1] * reel; poPos[i * 3 + 2] += poVit[i * 3 + 2] * reel; if (poVie[i] <= 0) { poVie[i] = 0; poPos[i * 3] = -999; } }
  geoPo.attributes.position.needsUpdate = true; geoPo.attributes.aV.needsUpdate = true;

  /* ce qui se forme */
  [holoNom, holo].forEach((h) => { if (h) { const u = h.material.uniforms; u.uP.value = Math.min(1, u.uP.value + reel / 1.5); } });
  if (motP) { const u = motP.material.uniforms; u.uP.value = Math.min(1, u.uP.value + reel / 1.05); const reste = (motFin - performance.now()) / 1000; if (reste < .8) u.uA.value = .62 * clamp(reste / .8); if (reste <= 0) retirerMots(); }
  if (holo && ecranH) {
    const pr = holo.material.uniforms.uP.value, f = lisse((pr - .8) / .2);
    holo.material.uniforms.uA.value = .6 * (1 - f);
    const c = projeter(holo.position), hp = ecranH * (H / (2 * Math.tan(cam.fov * Math.PI / 360) * (cam.position.z - holo.position.z)));
    ecran.style.height = `${hp}px`;
    ecran.style.transform = `translate(-50%,-50%) translate(${c.x}px,${c.y}px)`;
    ecran.style.opacity = f;
  }

  /* étiquettes */
  if (mode === 'competences') {
    CONSTELLATIONS.forEach((c, ci) => { const s = projeter(c.pos), prem = cst.etoiles.findIndex((e) => e.c === ci), vu = aEt[prem] > .3; c.titre.style.opacity = vu ? 1 : 0; c.titre.style.transform = `translate(-50%,-50%) translate(${s.x}px,${s.y}px)`; });
    cst.etoiles.forEach((e, i) => { const s = projeter(e.p); e.el.style.opacity = aEt[i] > .3 ? 1 : 0; e.el.style.transform = `translate(-50%,-100%) translate(${s.x}px,${s.y - 9}px)`; });
  }
  if (mode === 'parcours') {
    const f = clamp(tParc / 5.6);
    stations.forEach((st, i) => { const s = projeter(st.p), vu = f >= i / (stations.length - 1) - .01, bas = i % 2 === 0; st.el.style.opacity = vu ? 1 : 0; st.el.style.transform = `translate(${i === 0 && !portrait ? '-25%' : i === stations.length - 1 && !portrait ? '-75%' : '-50%'},${bas ? '12px' : 'calc(-100% - 12px)'}) translate(${s.x}px,${s.y}px)`; });
  }
  if (survol >= 0 && (etat === 'libre' || etat === 'dort')) { const m = MONDES[survol], s = projeter(m.p); $nom.style.transform = `translate(-50%,-100%) translate(${s.x}px,${s.y - 34}px)`; }

  bloom.strength = (etat === 'film' && tf < 28 ? .07 : .2) + eclat * .3 + rouge * .3 + soleilA * .04;
  composer.render();
  fr.n++; fr.ms += performance.now() - debut; window.__cout = fr;
  if (!RENDU) requestAnimationFrame(image);
}

/* ---------- départ : le film commence tout seul ---------- */
function demarrer() {
  mesure();
  addEventListener('resize', mesure);
  groupeV.position.set(0, L.fy, L.fz); groupeV.scale.setScalar(L.fs); groupeV.updateMatrixWorld();
  cam.position.set(0, 0, 9.5); cam.lookAt(0, 0, 0);
  dernier = performance.now();
  let dejaVu = false; try { dejaVu = !PARAMS.has('revoir') && !!sessionStorage.getItem('film-vu'); } catch (e) {}
  if (reduit || dejaVu) { etat = 'film'; finFilm(); cam.position.set(0, 0, camZ); cam.lookAt(0, 0, 0); }
  else { barres(true); $('passer').classList.remove('cache'); $('son').classList.remove('cache'); }
  const premierSon = () => lancerPiste();
  document.body.classList.toggle('rendu', RENDU); document.body.classList.toggle('vertical', RENDU && portrait);
  if (RESEAUX) { $('c1').textContent = 'FasoDigit présente'; $('c2').textContent = 'L’Œil'; $('c3').textContent = ''; $('c4').textContent = ''; $('c5').textContent = 'Fiction construite à partir de faits réels de nos projets.'; }
  addEventListener('pointerdown', (e) => { if (etat === 'film' && e.target !== $('passer') && e.target !== $('son')) premierSon(); }, { once: true });
  addEventListener('keydown', () => { if (etat === 'film') premierSon(); }, { once: true });
  $('chargement').classList.add('parti');
  window.__etat = () => ({ etat, mode, tf: +tf.toFixed(2), survol, choisi, mondes: MONDES.map((m) => { const s = projeter(m.p); return { n: m.n, x: Math.round(s.x), y: Math.round(s.y), z: +m.p.z.toFixed(1), ne: +m.ne.toFixed(2), a: +m.alpha.toFixed(2) }; }) });
  window.__film = { aller(t) { tf = t; tfAv = t; }, gele(v) { filmGele = v; }, fin: finFilm, revoir: revoirFilm };
  window.__scene = { ouvrir, changerMode };
  if (RENDU) { window.__pas = (ms) => { window.__hor(ms); image(ms); }; dernier = 0; }
  else requestAnimationFrame((t) => { dernier = t; image(t); });
}
demarrer();

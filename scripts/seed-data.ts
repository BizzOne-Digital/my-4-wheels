/**
 * Initial content. Vehicles and blog posts are DEMO content (isDemo: true) with illustrative AI-generated photos from public/images.
 * They must be replaced or removed (Admin > Vehicles > "Remove demo content" or `npm run remove-demo`) before launch.
 */
import { localImageForStock } from "../src/lib/images";
const u = (id: string, _width = 1600) => localImageForStock(id);

export const ABOUT_EN = `At My 4 Wheels, we believe buying a car should be simple, honest, and affordable. We offer a carefully selected range of quality vehicles at fair prices, so you can drive away with confidence.

Every car on our lot is inspected before it’s sold, and our prices are clear and upfront: no hidden fees, no pressure. Whether you’re buying your first car, upgrading for your family, or looking for a reliable daily driver, we’ll help you find the right fit for your needs and budget.

We’re proud to serve Montréal and earn customers who come back again and again. Stop by, browse our inventory online, or give us a call. We’re here to help you find your next four wheels.`;

export const ABOUT_FR = `Chez My 4 Wheels, nous croyons qu’acheter une voiture devrait être simple, honnête et abordable. Nous offrons une sélection soignée de véhicules de qualité à prix justes, pour que vous puissiez partir en toute confiance.

Chaque voiture de notre terrain est inspectée avant d’être vendue, et nos prix sont clairs dès le départ : aucuns frais cachés, aucune pression. Que vous achetiez votre première voiture, un véhicule pour votre famille ou une voiture fiable pour le quotidien, nous vous aiderons à trouver celle qui convient à vos besoins et à votre budget.

Nous sommes fiers de servir Montréal et de gagner la confiance de clients qui reviennent encore et encore. Passez nous voir, parcourez notre inventaire en ligne ou appelez-nous. Nous sommes là pour vous aider à trouver vos prochaines quatre roues.`;

const L = (en: string, fr: string) => ({ en, fr });

export const SERVICES = [
  ["quality-used-cars", "car", "Quality Used Cars", "Voitures d’occasion de qualité", "A carefully selected range of inspected pre-owned vehicles at fair, upfront prices.", "Une sélection soignée de véhicules d’occasion inspectés à prix justes et clairs."],
  ["car-financing", "financing", "Car Financing", "Financement automobile", "We help you explore financing options that fit your budget. Approval and terms depend on the lender.", "Nous vous aidons à explorer des options adaptées à votre budget. L’approbation et les modalités dépendent du prêteur."],
  ["trade-ins", "tradein", "Trade-Ins", "Échanges", "Bring your current vehicle for an in-person evaluation and a competitive trade-in offer.", "Apportez votre véhicule pour une évaluation en personne et une offre d’échange compétitive."],
  ["we-buy-cars", "buy", "We Buy Cars", "Nous achetons votre voiture", "Thinking of selling? Tell us about your vehicle and we’ll arrange an evaluation.", "Vous pensez vendre? Parlez-nous de votre véhicule et nous organiserons une évaluation."],
  ["vehicle-inspections", "inspection", "Vehicle Inspections", "Inspections de véhicules", "Every car on our lot is inspected before it’s sold. Ask us about any vehicle’s inspection.", "Chaque voiture est inspectée avant d’être vendue. Demandez-nous les détails pour un véhicule précis."],
  ["vehicle-history-reports", "history", "Vehicle History Reports", "Rapports d’historique", "Ask us whether a history report is available for the vehicle you’re interested in.", "Demandez-nous si un rapport d’historique est disponible pour le véhicule qui vous intéresse."],
  ["extended-warranties", "warranty", "Extended Warranties", "Garanties prolongées", "Ask our team about extended warranty options and their terms before you buy.", "Renseignez-vous auprès de notre équipe sur les options de garantie prolongée et leurs conditions."],
  ["paperwork-registration", "paperwork", "Paperwork & Registration", "Formalités et immatriculation", "We guide you through the paperwork so your purchase is clear and straightforward.", "Nous vous guidons dans les formalités pour un achat clair et simple."],
  ["test-drives", "testdrive", "Test Drives", "Essais routiers", "Book a test drive online at a time that works for you.", "Réservez un essai routier en ligne au moment qui vous convient."],
  ["car-finder-service", "finder", "Car Finder Service", "Service de recherche de véhicule", "Can’t find what you want in our inventory? Tell us what you need and we’ll look for it.", "Vous ne trouvez pas ce que vous cherchez? Dites-nous ce qu’il vous faut et nous le chercherons."],
].map(([slug, icon, en, fr, sEn, sFr], i) => ({ slug, icon, title: L(en, fr), summary: L(sEn, sFr), body: L(sEn, sFr), priceNote: L("", ""), image: "", enabled: true, order: i + 1 }));

export const PAGES = [
  { key: "home.hero", label: "Homepage hero", image: u("1580273916550-e323be2ae537", 2000), imageAlt: L("Silver sports coupe under dramatic studio lighting", "Coupé sport argenté sous un éclairage de studio") },
  { key: "home.about", label: "Homepage about preview", image: u("1492144534655-ae79c964c9d7"), imageAlt: L("Row of cars inside a dealership garage", "Rangée de voitures dans le garage d’un concessionnaire") },
  { key: "home.cta", label: "Homepage booking CTA", image: u("1449965408869-eaa3f722e40d", 2000), imageAlt: L("Driver's hands on a steering wheel at dusk", "Mains d’un conducteur sur le volant au crépuscule") },
  { key: "about.main", label: "About page", body: L(ABOUT_EN, ABOUT_FR), image: u("1492144534655-ae79c964c9d7"), imageAlt: L("Cars inside a dealership garage", "Voitures dans le garage d’un concessionnaire") },
];

export const OFFERS = [
  {
    slug: "student-savings",
    title: L("Student savings up to 20%", "Économies étudiantes jusqu’à 20 %"),
    subtitle: L("Ask about eligibility", "Renseignez-vous sur l’admissibilité"),
    body: L("Students may be eligible for savings on selected vehicles. Contact us to confirm the details that apply to you.", "Les étudiants peuvent bénéficier d’économies sur certains véhicules. Contactez-nous pour connaître les détails qui s’appliquent à vous."),
    eligibility: L("Valid student ID required\nApplies to selected vehicles only\nConditions confirmed by our team before purchase", "Carte étudiante valide requise\nS’applique à certains véhicules seulement\nConditions confirmées par notre équipe avant l’achat"),
    visible: true,
    showOnHomepage: true,
    order: 1,
  },
];

const desc = (en: string, fr: string) => L(en, fr);

export const DEMO_VEHICLES = [
  { slug: "2021-honda-civic-demo", year: 2021, make: "Honda", model: "Civic", price: 21995, mileage: 56320, transmission: "automatic", bodyType: "sedan", fuelType: "gasoline", images: [u("1621007947382-bb3c3994e3fb", 1400)], featured: true, exteriorColor: "Grey", description: desc("Demo listing for layout purposes. Replace with a real vehicle before launch.", "Annonce de démonstration. Remplacez-la par un vrai véhicule avant le lancement.") },
  { slug: "2020-toyota-rav4-demo", year: 2020, make: "Toyota", model: "RAV4", price: 27495, mileage: 72418, transmission: "automatic", bodyType: "suv", fuelType: "gasoline", images: [u("1617469767053-d3b523a0b982", 1400)], featured: true, exteriorColor: "Silver", description: desc("Demo listing for layout purposes. Replace with a real vehicle before launch.", "Annonce de démonstration. Remplacez-la par un vrai véhicule avant le lancement.") },
  { slug: "2022-mazda-cx-5-demo", year: 2022, make: "Mazda", model: "CX-5", price: 29995, mileage: 41903, transmission: "automatic", bodyType: "suv", fuelType: "gasoline", images: [u("1550355291-bbee04a92027", 1400)], featured: true, exteriorColor: "Red", description: desc("Demo listing for layout purposes. Replace with a real vehicle before launch.", "Annonce de démonstration. Remplacez-la par un vrai véhicule avant le lancement.") },
  { slug: "2019-volkswagen-golf-demo", year: 2019, make: "Volkswagen", model: "Golf", price: 17995, mileage: 88210, transmission: "manual", bodyType: "hatchback", fuelType: "gasoline", images: [u("1541899481282-d53bffe3c35d", 1400)], featured: false, exteriorColor: "Blue", description: desc("Demo listing for layout purposes.", "Annonce de démonstration.") },
  { slug: "2021-hyundai-elantra-demo", year: 2021, make: "Hyundai", model: "Elantra", price: 19495, mileage: 61050, transmission: "automatic", bodyType: "sedan", fuelType: "gasoline", images: [u("1619767886558-efdc259cde1a", 1400)], featured: false, exteriorColor: "Black", description: desc("Demo listing for layout purposes.", "Annonce de démonstration.") },
  { slug: "2020-tesla-model-3-demo", year: 2020, make: "Tesla", model: "Model 3", price: 33995, mileage: 69800, transmission: "automatic", bodyType: "sedan", fuelType: "electric", images: [u("1560958089-b8a1929cea89", 1400)], featured: false, exteriorColor: "White", description: desc("Demo listing for layout purposes.", "Annonce de démonstration.") },
].map((v) => ({ ...v, isDemo: true, imagesIllustrative: true, published: true, status: "available", features: [] as string[] }));

export const DEMO_POSTS = [
  {
    slug: "used-car-buying-checklist",
    title: L("Your used car buying checklist", "Votre liste de vérification pour acheter une voiture d’occasion"),
    excerpt: L("Simple steps to help you choose a reliable pre-owned vehicle.", "Des étapes simples pour choisir un véhicule d’occasion fiable."),
    body: L("## Set your budget\n\nInclude taxes, registration and insurance in your total.\n\n## Book a test drive\n\n- Check visibility and comfort\n- Listen for unusual noises\n- Test the brakes and steering\n\nAsk for the inspection details of any vehicle you are considering.", "## Établissez votre budget\n\nIncluez les taxes, l’immatriculation et l’assurance.\n\n## Réservez un essai routier\n\n- Vérifiez la visibilité et le confort\n- Soyez attentif aux bruits inhabituels\n- Testez les freins et la direction\n\nDemandez les détails d’inspection de tout véhicule qui vous intéresse."),
    category: "buying-tips",
    coverImage: u("1503376780353-7e6692767b70"),
  },
  {
    slug: "preparing-your-car-for-winter",
    title: L("Preparing your car for a Montréal winter", "Préparer votre voiture pour l’hiver à Montréal"),
    excerpt: L("A short checklist before the snow arrives.", "Une courte liste avant l’arrivée de la neige."),
    body: L("## Winter tires\n\nIn Québec, winter tires are mandatory from December 1 to March 15.\n\n## Quick checks\n\n- Battery\n- Wiper blades and washer fluid\n- Tire pressure", "## Pneus d’hiver\n\nAu Québec, les pneus d’hiver sont obligatoires du 1er décembre au 15 mars.\n\n## Vérifications rapides\n\n- Batterie\n- Essuie-glaces et lave-glace\n- Pression des pneus"),
    category: "maintenance",
    coverImage: u("1517524008697-84bbe3c3fd98"),
  },
].map((p) => ({ ...p, status: "draft", isDemo: true, author: "My 4 Wheels" }));

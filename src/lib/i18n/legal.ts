import type { Locale } from "./config";

export type LegalSection = { h: string; p: string[] };

/** Generic templates. The client should have these reviewed by a qualified professional before launch. */
export function privacySections(locale: Locale, business: { name: string; email: string; phone: string; address: string }): LegalSection[] {
  const contact = [business.email, business.phone, business.address].filter(Boolean).join(" · ");
  if (locale === "fr")
    return [
      { h: "Renseignements recueillis", p: ["Nous recueillons les renseignements que vous nous fournissez dans nos formulaires : nom, courriel, téléphone, détails de rendez-vous et messages. Si vous créez un compte, nous conservons aussi un mot de passe chiffré."] },
      { h: "Utilisation", p: ["Ces renseignements servent uniquement à répondre à vos demandes, à gérer vos rendez-vous et à vous fournir nos services. Nous ne vendons pas vos renseignements personnels."] },
      { h: "Paiements", p: ["Les dépôts éventuels sont traités par Stripe. Nous ne conservons jamais vos numéros de carte."] },
      { h: "Témoins (cookies)", p: ["Nous utilisons des témoins essentiels pour la langue choisie et les sessions de connexion."] },
      { h: "Vos droits", p: ["Conformément à la Loi 25 du Québec, vous pouvez demander l’accès, la rectification ou la suppression de vos renseignements en nous écrivant."] },
      { h: "Nous joindre", p: [`${business.name} · ${contact}`] },
    ];
  return [
    { h: "Information we collect", p: ["We collect the information you provide in our forms: name, email, phone, appointment details and messages. If you create an account, we also store an encrypted password."] },
    { h: "How we use it", p: ["We use this information only to respond to your requests, manage your appointments and provide our services. We do not sell your personal information."] },
    { h: "Payments", p: ["Any deposits are processed by Stripe. We never store your card numbers."] },
    { h: "Cookies", p: ["We use essential cookies for your language preference and sign-in sessions."] },
    { h: "Your rights", p: ["In line with Québec’s Law 25, you can request access to, correction of, or deletion of your personal information by contacting us."] },
    { h: "Contact", p: [`${business.name} · ${contact}`] },
  ];
}

export function termsSections(locale: Locale): LegalSection[] {
  if (locale === "fr")
    return [
      { h: "Information sur les véhicules", p: ["Nous faisons de notre mieux pour que l’information soit exacte. Les prix, la disponibilité et les caractéristiques peuvent changer sans préavis et doivent être confirmés avec notre équipe avant l’achat."] },
      { h: "Photos", p: ["Certaines photos peuvent être à titre indicatif lorsque mentionné."] },
      { h: "Financement et échanges", p: ["Toute offre de financement est sujette à l’approbation du prêteur. Les valeurs d’échange sont confirmées après une évaluation en personne."] },
      { h: "Rendez-vous", p: ["Les rendez-vous sont confirmés par notre équipe. Nous pouvons vous contacter pour en modifier l’heure si nécessaire."] },
      { h: "Responsabilité", p: ["Le site est fourni tel quel. Pour toute décision d’achat, référez-vous aux documents signés chez le concessionnaire."] },
    ];
  return [
    { h: "Vehicle information", p: ["We do our best to keep information accurate. Prices, availability and specifications can change without notice and should be confirmed with our team before purchase."] },
    { h: "Photos", p: ["Some photos may be illustrative where indicated."] },
    { h: "Financing and trade-ins", p: ["Any financing is subject to lender approval. Trade-in values are confirmed after an in-person evaluation."] },
    { h: "Appointments", p: ["Appointments are confirmed by our team. We may contact you to adjust the time if needed."] },
    { h: "Liability", p: ["This website is provided as is. For any purchase decision, refer to the documents signed at the dealership."] },
  ];
}

export function faqItems(locale: Locale) {
  if (locale === "fr")
    return [
      { q: "Les véhicules sont-ils inspectés?", a: "Oui. Chaque voiture de notre terrain est inspectée avant d’être vendue. Demandez-nous les détails de l’inspection d’un véhicule précis." },
      { q: "Y a-t-il des frais cachés?", a: "Non. Nos prix sont clairs dès le départ. Les taxes et frais gouvernementaux obligatoires sont expliqués avant la signature." },
      { q: "Offrez-vous du financement?", a: "Nous vous aidons à explorer les options de financement. L’approbation, les taux et les modalités dépendent du prêteur et de votre dossier." },
      { q: "Puis-je échanger mon véhicule actuel?", a: "Oui. Remplissez notre formulaire d’échange ou réservez une évaluation; la valeur est confirmée après inspection en personne." },
      { q: "Comment réserver un essai routier?", a: "Utilisez la page de réservation en ligne, choisissez un véhicule et une heure disponible, ou appelez-nous." },
      { q: "Quelles sont vos heures d’ouverture?", a: "Nous sommes ouverts tous les jours de 10 h à 20 h." },
    ];
  return [
    { q: "Are your vehicles inspected?", a: "Yes. Every car on our lot is inspected before it’s sold. Ask us for the inspection details of any specific vehicle." },
    { q: "Are there hidden fees?", a: "No. Our prices are clear and upfront. Mandatory taxes and government fees are explained before you sign." },
    { q: "Do you offer financing?", a: "We help you explore financing options. Approval, rates and terms depend on the lender and your credit profile." },
    { q: "Can I trade in my current vehicle?", a: "Yes. Fill out our trade-in form or book a valuation; the value is confirmed after an in-person inspection." },
    { q: "How do I book a test drive?", a: "Use the online booking page, choose a vehicle and an available time, or give us a call." },
    { q: "What are your opening hours?", a: "We’re open every day from 10 AM to 8 PM." },
  ];
}

import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { serviceCategories } from "@shared/schema";

// Icons for each service category
const serviceIcons = {
  "Installateur": <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="14 5 14 9"/><line x1="16" x2="16" y1="7" y2="9"/><path d="M17 11h3a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1Z"/><path d="M12 15v3a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1Z"/><path d="M5 11H3a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1Z"/><path d="M10 7v4"/><path d="M4 7v4"/><path d="M14 3v4"/></svg>,
  "Elektriker": <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 3v4"/><path d="M14 3v4"/><path d="M10 3v4"/><path d="M6 3v4"/><path d="M18 21v-4"/><path d="M14 21v-4"/><path d="M10 21v-4"/><path d="M6 21v-4"/><rect width="16" height="10" x="4" y="7" rx="2"/></svg>,
  "Reinigung": <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5"/><path d="m3 11 3 9h4.3a2 2 0 0 0 1.7-1l4-7a2 2 0 0 1 1.7-1H21"/><path d="m3 11 9 3"/></svg>,
  "Umzug": <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 18V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v12"/><path d="M10 20v2h4v-2"/><path d="M12 2h2a2 2 0 0 1 2 2v2"/><path d="M7 8h10"/><path d="M7 12h10"/><circle cx="9" cy="16" r="1"/><circle cx="15" cy="16" r="1"/></svg>,
  "Transport": <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2L21 10"/><path d="M5 18H2s-.5-1.7-.8-2.8c-.1-.4-.2-.8-.2-1.2 0-.4.1-.8.2-1.2L2 10"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>,
  "Gartenpflege": <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22c1.25-.987 2.36-1.89 4-2a3.41 3.41 0 0 1 2.41.938c.263.211.559.38.876.487a2.59 2.59 0 0 0 1.02.085 2.43 2.43 0 0 0 1.49-.79A3.46 3.46 0 0 1 14.21 20c1.64.11 2.75 1.013 4 2"/><path d="M2 16c1.25-.987 2.36-1.89 4-2a3.41 3.41 0 0 1 2.41.938c.263.211.559.38.876.487a2.59 2.59 0 0 0 1.02.085 2.43 2.43 0 0 0 1.49-.79A3.46 3.46 0 0 1 14.21 14c1.64.11 2.75 1.013 4 2"/><path d="m7 16 3-2"/><path d="M7 20v-4"/></svg>,
  "Haushaltshilfe": <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg>,
  "Kinderbetreuung": <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>,
  "Seniorenbetreuung": <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66"/><path d="m18 15-2-2"/><path d="m15 18-2-2"/></svg>,
  "Nachhilfe": <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  "Computer & IT": <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="10" x="2" y="3" rx="2" ry="2"/><path d="m7 21 5-5 5 5"/><path d="M12 21v-8"/></svg>,
  "Handwerker": <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 11 12 1"/><path d="M10 2c4.1 2.4 6.4 6.6 8 13.1"/><path d="M4.9 7.9c2.7 2 5 4.5 6.7 7.7"/><path d="M10 21.9c4-2.6 6-6.5 6.8-11.4"/></svg>,
  "Maler": <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h18v12H3z"/><path d="m2 2 8 4 8-4"/><path d="m2 22 8-4 8 4"/><path d="M3 8a5 5 0 0 1 6 0 5 5 0 0 0 6 0 5 5 0 0 1 6 0"/><path d="M3 20a5 5 0 0 1 6 0 5 5 0 0 0 6 0 5 5 0 0 1 6 0"/></svg>,
  "Dachdecker": <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
  "Automechaniker": <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 5c0 1.5-.5 3-2 3s-3-1-6-1-3.5 1-4 2l13 5c.5-1 1-2.5 1-4 0-3-1.5-4-1.5-4"/><path d="M3 6c0 1 .5 2 1.5 3 1.5 2 3 2.5 3.5 3 .5.5 1 1.5 1 2.5 0 .5 0 3-2 5"/><path d="M11.5 6.5c1 1 2 2 2 3.5 0 1.5-1 2.25-2 3 .5 1.5 1 4 1 5.5 0 .5 0 2-1 2-1.5 0-1.5-2-1.5-2"/><path d="M10 17.5c-2 0-5 1-6.5 3"/></svg>,
  "Schlosser": <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="m7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  "Masseur": <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66"/><path d="m18 15-2-2"/><path d="m15 18-2-2"/></svg>
};

// Provider counts for display (should match actual categories)
const providerCounts = {
  "Installateur": 142,
  "Elektriker": 120,
  "Reinigung": 89,
  "Umzug": 64,
  "Transport": 45,
  "Gartenpflege": 76,
  "Haushaltshilfe": 53,
  "Kinderbetreuung": 32,
  "Seniorenbetreuung": 41,
  "Nachhilfe": 28,
  "Computer & IT": 67,
  "Handwerker": 98,
  "Maler": 81,
  "Dachdecker": 47,
  "Automechaniker": 55,
  "Schlosser": 39,
  "Masseur": 34
};

export default function FeaturedServices() {
  // Display only top 6 service categories
  const displayedServices = serviceCategories.slice(0, 6);
  
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold font-title">Beliebte Dienstleistungen</h2>
          <Link href="/suche" className="text-primary hover:underline font-medium hidden md:flex items-center">
            Alle anzeigen 
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {displayedServices.map((service) => (
            <Link 
              key={service} 
              href={`/suche?service=${encodeURIComponent(service)}`} 
              className="group bg-gray-50 hover:bg-gray-100 rounded-xl p-4 text-center transition"
            >
              <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center text-primary mx-auto mb-3">
                {serviceIcons[service as keyof typeof serviceIcons]}
              </div>
              <h3 className="font-medium text-gray-800 group-hover:text-primary">{service}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {providerCounts[service as keyof typeof providerCounts] || 0} Anbieter
              </p>
            </Link>
          ))}
        </div>
        
        <div className="mt-6 text-center md:hidden">
          <Link href="/suche">
            <Button variant="link" className="text-primary hover:underline font-medium">
              Alle anzeigen
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

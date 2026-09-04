// Static content for /guides and its subsections — hardcoded per the
// "start simple" recommendation in docs/OPTIMA_GUIDES_MASTER_PLAN.md.
// Replaces the broken external links to the legacy lanzaroteguidebook.com
// site with native, bilingual pages.

export type Lang = 'en' | 'es'

export interface Bi {
  en: string
  es: string
}

// ---------------------------------------------------------------------
// Landing page
// ---------------------------------------------------------------------

export const guidesLanding = {
  hero: {
    title: { en: 'Plan Your Lanzarote Adventure', es: 'Planea tu aventura en Lanzarote' } as Bi,
    subtitle: {
      en: 'Everything you need to know about Playa Blanca, Lanzarote & the Canary Islands',
      es: 'Todo lo que necesitas saber sobre Playa Blanca, Lanzarote y las Islas Canarias',
    } as Bi,
    cta: { en: 'Explore guides', es: 'Explorar guías' } as Bi,
  },
  stats: [
    { value: '300+', label: { en: 'days of sunshine', es: 'días de sol' } as Bi },
    { value: '17–29°C', label: { en: 'year-round', es: 'todo el año' } as Bi },
    { value: '25 min', label: { en: 'ferry to Fuerteventura', es: 'en ferry a Fuerteventura' } as Bi },
  ],
  cards: [
    {
      slug: 'playa-blanca',
      emoji: '📍',
      title: { en: 'Playa Blanca', es: 'Playa Blanca' } as Bi,
      description: {
        en: 'Beaches, things to do, practical info',
        es: 'Playas, qué hacer y datos prácticos',
      } as Bi,
      image: '/lanzarote2.jpg',
    },
    {
      slug: 'climate',
      emoji: '☀️',
      title: { en: 'Climate & Weather', es: 'Clima y Tiempo' } as Bi,
      description: {
        en: 'Monthly temperatures, best time to visit',
        es: 'Temperaturas mensuales, mejor época para viajar',
      } as Bi,
      image: '/lanzarote7.jpg',
    },
    {
      slug: 'ferries',
      emoji: '⛴️',
      title: { en: 'Ferries', es: 'Ferris' } as Bi,
      description: {
        en: 'Schedules & prices to Fuerteventura & La Graciosa',
        es: 'Horarios y precios a Fuerteventura y La Graciosa',
      } as Bi,
      image: '/lanzarote11.jpg',
    },
    {
      slug: 'beaches',
      emoji: '🏖️',
      title: { en: 'Beaches', es: 'Playas' } as Bi,
      description: {
        en: 'Top 10 beaches + hidden gems',
        es: 'Las 10 mejores playas + rincones escondidos',
      } as Bi,
      image: '/lanzarote4.jpg',
    },
  ],
  bonus: {
    title: { en: 'More to explore', es: 'Más para explorar' } as Bi,
    items: [
      {
        emoji: '🚌',
        title: { en: 'Getting Around', es: 'Cómo moverte' } as Bi,
        description: {
          en: 'Buses, car hire and driving on the island',
          es: 'Autobuses, alquiler de coche y conducir en la isla',
        } as Bi,
      },
      {
        emoji: '🍽️',
        title: { en: 'Food & Restaurants', es: 'Comida y restaurantes' } as Bi,
        description: {
          en: "Playa Blanca's best spots to eat and drink",
          es: 'Los mejores sitios para comer y beber en Playa Blanca',
        } as Bi,
      },
      {
        emoji: '🎭',
        title: { en: 'Day Trips & Excursions', es: 'Excursiones de un día' } as Bi,
        description: {
          en: 'Timanfaya, La Geria, the north and beyond',
          es: 'Timanfaya, La Geria, el norte de la isla y más',
        } as Bi,
      },
    ],
  },
  bottomCta: {
    text: { en: 'Have a question?', es: '¿Tienes alguna pregunta?' } as Bi,
    cta: { en: 'Message us on WhatsApp', es: 'Escríbenos por WhatsApp' } as Bi,
  },
}

// ---------------------------------------------------------------------
// Shared chrome (breadcrumbs, back links)
// ---------------------------------------------------------------------

export const guidesChrome = {
  breadcrumbHome: { en: 'Home', es: 'Inicio' } as Bi,
  breadcrumbGuides: { en: 'Guides', es: 'Guías' } as Bi,
  backToGuides: { en: 'Back to all guides', es: 'Volver a todas las guías' } as Bi,
  relatedGuides: { en: 'Related guides', es: 'Guías relacionadas' } as Bi,
}

// ---------------------------------------------------------------------
// /guides/playa-blanca
// ---------------------------------------------------------------------

export const playaBlancaGuide = {
  hero: {
    title: { en: 'Playa Blanca: Your Complete Guide', es: 'Playa Blanca: guía completa' } as Bi,
    subtitle: {
      en: "Lanzarote's sunniest, warmest resort",
      es: 'El resort más soleado y cálido de Lanzarote',
    } as Bi,
    image: '/lanzarote2.jpg',
  },
  toc: [
    { id: 'where', label: { en: 'Where is Playa Blanca?', es: '¿Dónde está Playa Blanca?' } as Bi },
    { id: 'about', label: { en: 'About the Resort', es: 'Sobre el resort' } as Bi },
    { id: 'beaches', label: { en: 'Beaches', es: 'Playas' } as Bi },
    { id: 'see-do', label: { en: 'Things to See & Do', es: 'Qué ver y hacer' } as Bi },
    { id: 'shopping', label: { en: 'Shopping & Restaurants', es: 'Compras y restaurantes' } as Bi },
    { id: 'getting-around', label: { en: 'Getting Around', es: 'Cómo moverte' } as Bi },
    { id: 'day-trips', label: { en: 'Day Trips', es: 'Excursiones' } as Bi },
    { id: 'practical', label: { en: 'Practical Info', es: 'Información práctica' } as Bi },
  ],
  where: {
    heading: { en: 'Where is Playa Blanca?', es: '¿Dónde está Playa Blanca?' } as Bi,
    body: {
      en: "Playa Blanca sits 80 miles off the coast of Africa in the Canary Islands, enjoying almost year-round sunshine with average temperatures of around 21°C (72°F). Thanks to Lanzarote's mountain ranges blocking the northeast trade winds, Playa Blanca tends to be drier and warmer than the north of the island.",
      es: 'Playa Blanca se encuentra a 130 km de la costa de África, en las Islas Canarias, y disfruta de sol casi todo el año con una temperatura media de unos 21°C. Gracias a que las cadenas montañosas de Lanzarote bloquean los vientos alisios del noreste, Playa Blanca suele ser más seca y cálida que el norte de la isla.',
    } as Bi,
  },
  about: {
    heading: { en: 'About the Resort', es: 'Sobre el resort' } as Bi,
    body: {
      en: "What started as a small fishing village has grown into one of Lanzarote's most popular resorts while keeping a quieter, more relaxed feel. There are no mega-nightclubs here. Instead, you'll find a tasteful mix of beachfront restaurants, boutique shops, the upscale Marina Rubicon and a 5-mile seafront promenade that stretches the full length of the resort.",
      es: 'Lo que empezó como un pequeño pueblo de pescadores se ha convertido en uno de los resorts más populares de Lanzarote, sin perder su ambiente tranquilo y relajado. Aquí no hay macrodiscotecas: encontrarás una elegante mezcla de restaurantes frente al mar, tiendas boutique, la exclusiva Marina Rubicón y un paseo marítimo de 8 km que recorre todo el resort.',
    } as Bi,
  },
  beaches: {
    heading: { en: 'Playa Blanca Beaches', es: 'Playas de Playa Blanca' } as Bi,
    items: [
      {
        name: { en: 'Playa Blanca Beach', es: 'Playa de Playa Blanca' } as Bi,
        points: [
          { en: 'Original beach, located right in the heart of town', es: 'La playa original, situada en pleno centro del pueblo' } as Bi,
          { en: 'Holds a European Blue Flag for water quality and cleanliness', es: 'Cuenta con Bandera Azul europea por la calidad y limpieza del agua' } as Bi,
          { en: 'Surrounded by restaurants and bars', es: 'Rodeada de restaurantes y bares' } as Bi,
          { en: 'Perfect for combining a morning swim with a seafront lunch', es: 'Ideal para combinar un baño matutino con una comida frente al mar' } as Bi,
        ],
      },
      {
        name: { en: 'Playa Dorada', es: 'Playa Dorada' } as Bi,
        points: [
          { en: 'The largest beach in the resort', es: 'La playa más grande del resort' } as Bi,
          { en: 'Fine sand, calm shallow waters', es: 'Arena fina, aguas tranquilas y poco profundas' } as Bi,
          { en: 'Sun loungers available for hire', es: 'Hamacas disponibles para alquilar' } as Bi,
          { en: 'Water sports: jet skis, kayaks, pedalos', es: 'Deportes acuáticos: motos de agua, kayaks, hidropedales' } as Bi,
          { en: 'Popular choice for families', es: 'Muy popular entre familias' } as Bi,
        ],
      },
      {
        name: { en: 'Playa Flamingo', es: 'Playa Flamingo' } as Bi,
        points: [
          { en: 'Located west of the town centre, close to Montaña Roja', es: 'Situada al oeste del centro, cerca de Montaña Roja' } as Bi,
          { en: 'Two breakwaters create sheltered, calm water — perfect for young children', es: 'Dos espigones crean aguas tranquilas y protegidas, ideales para niños pequeños' } as Bi,
          { en: 'Quieter option, especially beautiful at sunset', es: 'Opción más tranquila, especialmente bonita al atardecer' } as Bi,
          { en: 'Views across to Fuerteventura', es: 'Vistas a Fuerteventura' } as Bi,
        ],
      },
      {
        name: { en: 'Papagayo Beaches', es: 'Playas de Papagayo' } as Bi,
        points: [
          { en: 'Short drive east of the resort, within the protected Los Ajaches Natural Park', es: 'A poca distancia en coche al este del resort, dentro del parque natural protegido de Los Ajaches' } as Bi,
          { en: 'Series of golden-sand coves with crystal-clear turquoise water', es: 'Serie de calas de arena dorada con aguas turquesas cristalinas' } as Bi,
          { en: 'Widely considered the best beach area on the island', es: 'Consideradas ampliamente como la mejor zona de playas de la isla' } as Bi,
          { en: 'Access via unpaved track (small entry fee applies for vehicles, €3)', es: 'Acceso por pista sin asfaltar (pequeña tarifa de entrada para vehículos, 3 €)' } as Bi,
          { en: 'Can also be reached by boat from Marina Rubicon', es: 'También se puede llegar en barco desde Marina Rubicón' } as Bi,
          { en: 'Includes: Playa Mujeres, Playa del Pozo, Playa de la Cera', es: 'Incluye: Playa Mujeres, Playa del Pozo, Playa de la Cera' } as Bi,
        ],
      },
    ],
  },
  seeDo: {
    heading: { en: 'Things to See & Do', es: 'Qué ver y hacer' } as Bi,
    items: [
      {
        name: { en: 'Marina Rubicon', es: 'Marina Rubicón' } as Bi,
        body: {
          en: '20+ restaurants, boutique shops, a swimming pool and sports courts, plus a twice-weekly market (Wednesdays and Saturdays, 09:00–14:00). Boat trips, diving excursions and sailing courses all depart from here.',
          es: 'Más de 20 restaurantes, tiendas boutique, piscina y pistas deportivas, además de un mercadillo dos veces por semana (miércoles y sábados, 09:00–14:00). Desde aquí salen excursiones en barco, submarinismo y cursos de vela.',
        } as Bi,
      },
      {
        name: { en: 'Museo Atlántico', es: 'Museo Atlántico' } as Bi,
        body: {
          en: "Europe's first underwater sculpture museum, created by British artist Jason deCaires Taylor. Sculptures sit at around 14 metres deep — guided dives for beginners and experienced divers leave daily from Rubicon Diving at the marina.",
          es: 'El primer museo escultórico submarino de Europa, creado por el artista británico Jason deCaires Taylor. Las esculturas se encuentran a unos 14 metros de profundidad — hay inmersiones guiadas para principiantes y buceadores experimentados que salen a diario desde Rubicon Diving en la marina.',
        } as Bi,
      },
      {
        name: { en: 'Castillo de las Coloradas', es: 'Castillo de las Coloradas' } as Bi,
        body: {
          en: '18th-century watchtower, originally built to defend against pirate attacks. Now offers panoramic views across to Fuerteventura — free to visit and lovely at sunset.',
          es: 'Torre de vigilancia del siglo XVIII, construida originalmente para defenderse de los piratas. Hoy ofrece vistas panorámicas a Fuerteventura — entrada gratuita y un lugar precioso al atardecer.',
        } as Bi,
      },
      {
        name: { en: 'Faro de Pechiguera (Lighthouse)', es: 'Faro de Pechiguera' } as Bi,
        body: {
          en: 'Located at the western end of the resort. The coastal walk to the lighthouse is one of the most popular strolls in Playa Blanca, with excellent views across the Atlantic.',
          es: 'Situado en el extremo oeste del resort. El paseo costero hasta el faro es uno de los más populares en Playa Blanca, con excelentes vistas al Atlántico.',
        } as Bi,
      },
      {
        name: { en: 'Montaña Roja', es: 'Montaña Roja' } as Bi,
        body: {
          en: 'Dormant volcano on the western edge of the resort. The hike to the summit takes around 30 minutes and rewards you with 360° views of Playa Blanca, Fuerteventura and the southern coastline. Wear sturdy shoes and bring water.',
          es: 'Volcán inactivo en el extremo oeste del resort. La subida hasta la cima dura unos 30 minutos y ofrece vistas de 360° de Playa Blanca, Fuerteventura y la costa sur. Lleva calzado adecuado y agua.',
        } as Bi,
      },
      {
        name: { en: 'Aqualava Waterpark', es: 'Aqualava Waterpark' } as Bi,
        body: {
          en: 'Family-friendly waterpark with a wave pool, lazy river, water slides and a children\'s play area — a great day out with kids.',
          es: 'Parque acuático familiar con piscina de olas, río lento, toboganes y zona de juegos infantil — un plan estupendo con niños.',
        } as Bi,
      },
    ],
  },
  shopping: {
    heading: { en: 'The Seafront Promenade & Shopping', es: 'El paseo marítimo y las compras' } as Bi,
    promenade: {
      title: { en: 'Paseo Marítimo (Boardwalk)', es: 'Paseo Marítimo' } as Bi,
      body: {
        en: 'Runs the full 5-mile length of the resort, flat and wheelchair-friendly. It passes beaches, the harbour, Marina Rubicon and dozens of restaurants — ideal for walking, jogging or an evening stroll, with stunning sunset views.',
        es: 'Recorre los 8 km del resort, es llano y accesible para sillas de ruedas. Pasa junto a playas, el puerto, Marina Rubicón y decenas de restaurantes — ideal para pasear, correr o dar un paseo al atardecer, con vistas espectaculares.',
      } as Bi,
    },
    shopping: {
      title: { en: 'Shopping', es: 'Compras' } as Bi,
      points: [
        { en: 'Town centre: Calle Limones and surrounding streets (clothes, supermarkets, pharmacies, ATMs)', es: 'Centro del pueblo: Calle Limones y calles cercanas (ropa, supermercados, farmacias, cajeros)' } as Bi,
        { en: 'Marina Rubicon: Upscale boutiques', es: 'Marina Rubicón: boutiques de lujo' } as Bi,
        { en: 'Deiland (Arrecife): Bigger shopping centre', es: 'Deiland (Arrecife): centro comercial más grande' } as Bi,
        { en: 'Biosfera Plaza (Puerto del Carmen): Shopping centre', es: 'Biosfera Plaza (Puerto del Carmen): centro comercial' } as Bi,
        { en: 'Note: many shops in Arrecife close between 14:00 and 16:30', es: 'Aviso: muchas tiendas en Arrecife cierran de 14:00 a 16:30' } as Bi,
        { en: "Canary Islands low-tax status: alcohol, perfume and electronics often cheaper than in the UK", es: 'Gracias al régimen fiscal especial de Canarias, alcohol, perfumes y electrónica suelen ser más baratos que en el Reino Unido' } as Bi,
      ],
    },
    restaurants: {
      title: { en: 'Playa Blanca Restaurants', es: 'Restaurantes en Playa Blanca' } as Bi,
      intro: {
        en: 'Top-rated restaurants:',
        es: 'Restaurantes mejor valorados:',
      } as Bi,
      list: [
        'La Cocina de Colacho', 'Sergio', 'La Casa Roja', 'La Tapita', 'Avenida 55',
      ],
      note: {
        en: 'Local wines from the La Geria volcanic vineyards are well worth trying — especially the Malvasía whites, which pair beautifully with fresh fish.',
        es: 'Merece la pena probar los vinos locales de los viñedos volcánicos de La Geria — especialmente los blancos de Malvasía, que combinan de maravilla con pescado fresco.',
      } as Bi,
    },
  },
  gettingAround: {
    heading: { en: 'Getting Around', es: 'Cómo moverte' } as Bi,
    items: [
      {
        title: { en: 'Buses', es: 'Autobuses' } as Bi,
        points: [
          { en: 'Number 30: circular route around Playa Blanca, every 30 minutes, 06:30–23:00', es: 'Línea 30: ruta circular por Playa Blanca, cada 30 minutos, 06:30–23:00' } as Bi,
          { en: 'Cost: around €1.40 per trip', es: 'Coste: alrededor de 1,40 € por trayecto' } as Bi,
          { en: 'To airport, Puerto del Carmen, Arrecife: routes 161, 162-D, 60 and 62', es: 'Al aeropuerto, Puerto del Carmen, Arrecife: líneas 161, 162-D, 60 y 62' } as Bi,
          { en: 'Contactless card payments accepted', es: 'Se aceptan pagos con tarjeta sin contacto' } as Bi,
        ],
      },
      {
        title: { en: 'Car Hire', es: 'Alquiler de coche' } as Bi,
        points: [
          { en: 'Best way to explore the wider island at your own pace', es: 'La mejor forma de explorar la isla a tu ritmo' } as Bi,
          { en: 'Several rental companies have offices in the resort', es: 'Varias empresas de alquiler tienen oficina en el resort' } as Bi,
          { en: 'Gives easy access to Timanfaya, La Geria, northern attractions and remote beaches', es: 'Facilita el acceso a Timanfaya, La Geria, atractivos del norte y playas remotas' } as Bi,
        ],
      },
      {
        title: { en: 'Ferry to Fuerteventura', es: 'Ferry a Fuerteventura' } as Bi,
        points: [
          { en: "Playa Blanca's harbour is in the centre of town", es: 'El puerto de Playa Blanca está en el centro del pueblo' } as Bi,
          { en: 'Crossing takes around 25 minutes', es: 'La travesía dura unos 25 minutos' } as Bi,
          { en: 'Services run several times a day', es: 'Hay varias salidas al día' } as Bi,
          { en: 'Fantastic day trip option', es: 'Una excursión de un día estupenda' } as Bi,
        ],
      },
      {
        title: { en: 'Taxis', es: 'Taxis' } as Bi,
        points: [
          { en: 'Readily available throughout the resort', es: 'Fáciles de encontrar en todo el resort' } as Bi,
          { en: 'Reasonably priced for short journeys', es: 'Precios razonables para trayectos cortos' } as Bi,
          { en: 'From airport to Playa Blanca: around €45–55', es: 'Del aeropuerto a Playa Blanca: unos 45–55 €' } as Bi,
        ],
      },
    ],
  },
  dayTrips: {
    heading: { en: 'Day Trips from Playa Blanca', es: 'Excursiones desde Playa Blanca' } as Bi,
    items: [
      {
        title: { en: 'Timanfaya National Park', es: 'Parque Nacional de Timanfaya' } as Bi,
        body: {
          en: "Lanzarote's most famous attraction — a volcanic landscape with dormant craters, lava fields and geothermal demonstrations. Around 30 minutes' drive from Playa Blanca. Arrive early or book a tour to avoid queues.",
          es: 'La atracción más famosa de Lanzarote — un paisaje volcánico con cráteres inactivos, campos de lava y demostraciones geotérmicas. A unos 30 minutos en coche de Playa Blanca. Llega temprano o reserva una excursión para evitar colas.',
        } as Bi,
      },
      {
        title: { en: 'La Geria Wine Region', es: 'Región vinícola de La Geria' } as Bi,
        body: {
          en: 'Volcanic vineyards, one of the most photographed sights on the island. Vines grow in hollows dug into the volcanic ash, protected by semicircular stone walls. Several bodegas along the route offer tastings.',
          es: 'Viñedos volcánicos, uno de los paisajes más fotografiados de la isla. Las vides crecen en hoyos excavados en la ceniza volcánica, protegidos por muretes de piedra semicirculares. Varias bodegas a lo largo de la ruta ofrecen catas.',
        } as Bi,
      },
      {
        title: { en: 'Teguise Sunday Market', es: 'Mercadillo de Teguise (domingos)' } as Bi,
        body: {
          en: 'The largest weekly market in the Canary Islands, held every Sunday morning in the historic town of Teguise. Direct bus from Playa Blanca (route 13, departing 09:00).',
          es: 'El mercadillo semanal más grande de Canarias, cada domingo por la mañana en el histórico pueblo de Teguise. Autobús directo desde Playa Blanca (línea 13, salida 09:00).',
        } as Bi,
      },
      {
        title: { en: 'Northern Lanzarote', es: 'Norte de Lanzarote' } as Bi,
        body: {
          en: "Home to many of César Manrique's most famous creations: Jameos del Agua (a volcanic cave turned concert venue), Cueva de los Verdes (underground lava tubes) and Mirador del Río (a clifftop viewpoint overlooking La Graciosa). Allow a full day to explore.",
          es: 'Alberga muchas de las creaciones más famosas de César Manrique: Jameos del Agua (una cueva volcánica convertida en sala de conciertos), Cueva de los Verdes (tubos de lava subterráneos) y el Mirador del Río (un mirador sobre La Graciosa). Dedícale un día completo.',
        } as Bi,
      },
      {
        title: { en: 'Fuerteventura', es: 'Fuerteventura' } as Bi,
        body: {
          en: 'A 25-minute ferry ride from Playa Blanca. Corralejo sand dunes, an old town and beautiful beaches make it one of the most popular day trips from the resort.',
          es: 'A 25 minutos en ferry desde Playa Blanca. Las dunas de Corralejo, su casco antiguo y sus playas la convierten en una de las excursiones de un día más populares desde el resort.',
        } as Bi,
      },
    ],
  },
  practical: {
    heading: { en: 'Practical Information', es: 'Información práctica' } as Bi,
    rows: [
      {
        label: { en: 'Currency', es: 'Moneda' } as Bi,
        value: {
          en: 'Euro (€). Cashpoints are widely available in the town centre and at Marina Rubicon.',
          es: 'Euro (€). Hay cajeros automáticos por todo el centro y en Marina Rubicón.',
        } as Bi,
      },
      {
        label: { en: 'Language', es: 'Idioma' } as Bi,
        value: {
          en: 'Spanish, though English is widely spoken in the resort.',
          es: 'Español, aunque el inglés se habla ampliamente en el resort.',
        } as Bi,
      },
      {
        label: { en: 'Time zone', es: 'Zona horaria' } as Bi,
        value: {
          en: 'GMT (same as the UK). Clocks change on the same dates as in the UK.',
          es: 'GMT (igual que el Reino Unido). El cambio de hora ocurre las mismas fechas que en Reino Unido.',
        } as Bi,
      },
      {
        label: { en: 'Electricity', es: 'Electricidad' } as Bi,
        value: {
          en: 'European 2-pin plugs. Bring a UK-to-EU adapter.',
          es: 'Enchufes europeos de dos clavijas. Trae un adaptador si vienes del Reino Unido.',
        } as Bi,
      },
      {
        label: { en: 'Healthcare', es: 'Sanidad' } as Bi,
        value: {
          en: 'Medical clinics and pharmacies throughout the resort.',
          es: 'Clínicas médicas y farmacias por todo el resort.',
        } as Bi,
      },
      {
        label: { en: 'Weather', es: 'Clima' } as Bi,
        value: {
          en: 'Warm and sunny year-round — see our full climate guide.',
          es: 'Cálido y soleado todo el año — consulta nuestra guía de clima completa.',
        } as Bi,
      },
    ],
  },
}

// ---------------------------------------------------------------------
// /guides/climate
// ---------------------------------------------------------------------

const MONTHS: Bi[] = [
  { en: 'Jan', es: 'Ene' }, { en: 'Feb', es: 'Feb' }, { en: 'Mar', es: 'Mar' },
  { en: 'Apr', es: 'Abr' }, { en: 'May', es: 'May' }, { en: 'Jun', es: 'Jun' },
  { en: 'Jul', es: 'Jul' }, { en: 'Aug', es: 'Ago' }, { en: 'Sep', es: 'Sep' },
  { en: 'Oct', es: 'Oct' }, { en: 'Nov', es: 'Nov' }, { en: 'Dec', es: 'Dic' },
]

const MONTHLY_DATA = [
  { high: 21, low: 14, sun: 7, rain: 17, sea: 19 },
  { high: 21, low: 14, sun: 7, rain: 12, sea: 18 },
  { high: 22, low: 15, sun: 8, rain: 10, sea: 18 },
  { high: 23, low: 16, sun: 9, rain: 5, sea: 18 },
  { high: 24, low: 17, sun: 9, rain: 2, sea: 19 },
  { high: 26, low: 19, sun: 10, rain: 1, sea: 20 },
  { high: 28, low: 20, sun: 10, rain: 0, sea: 21 },
  { high: 29, low: 21, sun: 10, rain: 0, sea: 22 },
  { high: 28, low: 21, sun: 9, rain: 3, sea: 23 },
  { high: 26, low: 19, sun: 8, rain: 12, sea: 22 },
  { high: 24, low: 17, sun: 7, rain: 18, sea: 21 },
  { high: 22, low: 15, sun: 7, rain: 22, sea: 20 },
]

export const climateGuide = {
  hero: {
    title: { en: 'Lanzarote Weather & Climate', es: 'Clima y tiempo en Lanzarote' } as Bi,
    subtitle: {
      en: '300+ days of sunshine, 17–29°C year-round',
      es: 'Más de 300 días de sol, 17–29°C todo el año',
    } as Bi,
    image: '/lanzarote7.jpg',
  },
  overview: {
    heading: { en: 'Lanzarote Weather Overview', es: 'El clima de Lanzarote en resumen' } as Bi,
    paragraphs: [
      {
        en: 'Lanzarote has a subtropical desert climate, making it one of the warmest and driest destinations in Europe. The island is the second sunniest in the Canary Islands after Fuerteventura. It sees fewer than 150mm of rainfall per year and enjoys 7 to 10 hours of daily sunshine depending on the season.',
        es: 'Lanzarote tiene un clima subtropical desértico, lo que la convierte en uno de los destinos más cálidos y secos de Europa. Es la segunda isla más soleada de Canarias, después de Fuerteventura. Recibe menos de 150 mm de lluvia al año y disfruta de 7 a 10 horas de sol al día según la época.',
      } as Bi,
      {
        en: 'Because Lanzarote has no high mountains, it gets fewer clouds than the other Canary Islands. As a result, it has the most consistent climate in the archipelago. Daytime temperatures range from around 20°C in winter to 28°C in summer. Even in the coolest months, the thermometer rarely drops below 15°C at night.',
        es: 'Al no tener montañas altas, Lanzarote recibe menos nubosidad que el resto de las islas Canarias, lo que le da el clima más constante del archipiélago. Las temperaturas diurnas van de unos 20°C en invierno a 28°C en verano. Incluso en los meses más frescos, el termómetro rara vez baja de 15°C por la noche.',
      } as Bi,
    ],
  },
  monthlyTable: {
    heading: { en: 'Lanzarote Weather by Month', es: 'El clima de Lanzarote mes a mes' } as Bi,
    columns: {
      month: { en: 'Month', es: 'Mes' } as Bi,
      high: { en: 'High', es: 'Máx.' } as Bi,
      low: { en: 'Low', es: 'Mín.' } as Bi,
      sun: { en: 'Sunshine (h/day)', es: 'Sol (h/día)' } as Bi,
      rain: { en: 'Rain (mm)', es: 'Lluvia (mm)' } as Bi,
      sea: { en: 'Sea Temp', es: 'Temp. mar' } as Bi,
    },
    rows: MONTHS.map((month, i) => ({ month, ...MONTHLY_DATA[i] })),
    source: { en: 'Source: Climate-Data.org, local records', es: 'Fuente: Climate-Data.org, registros locales' } as Bi,
  },
  bestTime: {
    heading: { en: 'When Is the Best Time to Visit Lanzarote?', es: '¿Cuál es la mejor época para visitar Lanzarote?' } as Bi,
    intro: {
      en: 'The honest answer is: any time of year. Temperatures rarely fall below 20°C during the day, even in January.',
      es: 'La respuesta honesta es: en cualquier época del año. Las temperaturas rara vez bajan de 20°C durante el día, incluso en enero.',
    } as Bi,
    seasons: [
      {
        title: { en: 'Summer (June–September)', es: 'Verano (junio–septiembre)' } as Bi,
        points: [
          { en: 'Hottest period (26–29°C)', es: 'El período más cálido (26–29°C)' } as Bi,
          { en: 'Virtually no rain', es: 'Prácticamente sin lluvia' } as Bi,
          { en: 'Busiest time for tourism', es: 'La temporada más concurrida' } as Bi,
          { en: 'Sea temperatures peak at 22–23°C (ideal for swimming and water sports)', es: 'La temperatura del mar alcanza 22–23°C (ideal para nadar y deportes acuáticos)' } as Bi,
        ],
      },
      {
        title: { en: 'Autumn (October–November)', es: 'Otoño (octubre–noviembre)' } as Bi,
        points: [
          { en: 'Popular choice for avoiding crowds', es: 'Buena opción para evitar aglomeraciones' } as Bi,
          { en: 'Air temperatures still warm (24–26°C)', es: 'Temperaturas todavía cálidas (24–26°C)' } as Bi,
          { en: 'Sea remains comfortable', es: 'El mar sigue templado' } as Bi,
          { en: 'October is recommended — excellent weather, lower prices, less busy', es: 'Octubre es muy recomendable — buen tiempo, precios más bajos, menos gente' } as Bi,
        ],
      },
      {
        title: { en: 'Winter (December–February)', es: 'Invierno (diciembre–febrero)' } as Bi,
        points: [
          { en: 'Mild, pleasant conditions', es: 'Condiciones suaves y agradables' } as Bi,
          { en: 'Daytime highs of 21–22°C — far warmer than Northern Europe', es: 'Máximas diurnas de 21–22°C — mucho más cálido que el norte de Europa' } as Bi,
          { en: 'More chance of rain, but showers tend to be short-lived', es: 'Más probabilidad de lluvia, pero suelen ser chubascos cortos' } as Bi,
          { en: "Great time for walking, cycling and exploring the island's volcanic landscapes", es: 'Buena época para caminar, ir en bici y explorar los paisajes volcánicos' } as Bi,
        ],
      },
      {
        title: { en: 'Spring (March–May)', es: 'Primavera (marzo–mayo)' } as Bi,
        points: [
          { en: 'Temperatures climbing from 22°C to 24°C', es: 'Temperaturas subiendo de 22°C a 24°C' } as Bi,
          { en: 'Rain drops off quickly from March onwards', es: 'La lluvia disminuye rápidamente desde marzo' } as Bi,
          { en: 'Lovely time to visit, especially for excursions and outdoor activities', es: 'Una época preciosa para visitar, sobre todo para excursiones y actividades al aire libre' } as Bi,
        ],
      },
    ],
  },
  microclimate: {
    heading: { en: 'Lanzarote Weather in Playa Blanca', es: 'El clima en Playa Blanca' } as Bi,
    paragraphs: [
      {
        en: "The weather in Lanzarote varies across the island. Two mountain ranges block the prevailing northeast trade winds, which means the south is typically drier and warmer than the north. Playa Blanca sits right at the southern tip of the island. It enjoys more sunshine and higher temperatures than anywhere else on Lanzarote.",
        es: 'El clima varía según la zona de la isla. Dos cadenas montañosas bloquean los vientos alisios del noreste, por lo que el sur suele ser más seco y cálido que el norte. Playa Blanca se encuentra en el extremo sur de la isla y disfruta de más horas de sol y temperaturas más altas que cualquier otro punto de Lanzarote.',
      } as Bi,
      {
        en: "Even in winter, there's a noticeable difference between north and south. On a day when the north coast is cloudy and breezy, Playa Blanca can still be warm and sunny. This microclimate is one of the main reasons the resort has become so popular.",
        es: 'Incluso en invierno hay una diferencia notable entre el norte y el sur. En un día en que la costa norte está nublada y con viento, Playa Blanca puede seguir cálida y soleada. Este microclima es una de las razones por las que el resort se ha vuelto tan popular.',
      } as Bi,
      {
        en: 'In Playa Blanca, you can typically expect daytime highs of 28–29°C in summer and 21–22°C in winter. The lows rarely drop below 15°C, even at night.',
        es: 'En Playa Blanca puedes esperar máximas diurnas de 28–29°C en verano y 21–22°C en invierno. Las mínimas rara vez bajan de 15°C, incluso de noche.',
      } as Bi,
    ],
  },
  wind: {
    heading: { en: 'Wind & the Calima', es: 'Viento y la calima' } as Bi,
    paragraphs: [
      {
        en: 'Lanzarote is an exposed, low-lying island, so wind is a factor — particularly on the north and west coasts. The northeast trade winds blow steadily for much of the year. Playa Blanca is more sheltered than the north, but you may still feel a breeze on some days. This is rarely unpleasant and often provides welcome relief from the heat in summer.',
        es: 'Lanzarote es una isla expuesta y de poca altitud, así que el viento es un factor a tener en cuenta — sobre todo en las costas norte y oeste. Los vientos alisios del noreste soplan de forma constante gran parte del año. Playa Blanca está más protegida que el norte, aunque algunos días notarás brisa. Rara vez resulta molesta, y en verano suele ser un alivio bienvenido frente al calor.',
      } as Bi,
      {
        en: 'Occasionally, Lanzarote experiences the calima — a hot, dry wind that blows in from the Sahara Desert. This can push temperatures above 35°C and reduce visibility with dust and haze. The calima usually lasts 2–4 days and has become more frequent in recent years. When it passes, normal conditions return quickly.',
        es: 'De vez en cuando, Lanzarote sufre la calima — un viento cálido y seco procedente del desierto del Sáhara. Puede elevar las temperaturas por encima de 35°C y reducir la visibilidad por el polvo en suspensión. La calima suele durar entre 2 y 4 días y en los últimos años se ha vuelto más frecuente. Cuando pasa, las condiciones normales vuelven rápidamente.',
      } as Bi,
    ],
  },
  packing: {
    heading: { en: 'What to Pack for Lanzarote', es: 'Qué llevar a Lanzarote' } as Bi,
    items: [
      {
        title: { en: 'Sun protection', es: 'Protección solar' } as Bi,
        body: {
          en: 'High-factor sun cream essential year-round. The sun is much stronger here than in the UK, even on cloudy days. Bring a hat and sunglasses too.',
          es: 'Crema solar de factor alto imprescindible todo el año. El sol es mucho más fuerte aquí que en el norte de Europa, incluso en días nublados. Lleva también gorra y gafas de sol.',
        } as Bi,
      },
      {
        title: { en: 'Light layers', es: 'Capas ligeras' } as Bi,
        body: {
          en: 'Evenings can be cooler, especially between November and March. A light jacket or cardigan is useful for after-dark dining.',
          es: 'Las noches pueden refrescar, sobre todo entre noviembre y marzo. Una chaqueta ligera viene bien para cenar al aire libre.',
        } as Bi,
      },
      {
        title: { en: 'Comfortable shoes', es: 'Calzado cómodo' } as Bi,
        body: {
          en: "If you're planning to walk the promenade, hike Montaña Roja or explore Timanfaya, bring supportive footwear. Flip-flops are fine for the beach but not the volcanic terrain.",
          es: 'Si vas a pasear por el paseo marítimo, subir Montaña Roja o explorar Timanfaya, lleva calzado adecuado. Las chanclas están bien para la playa, pero no para el terreno volcánico.',
        } as Bi,
      },
      {
        title: { en: 'Swimwear', es: 'Bañador' } as Bi,
        body: {
          en: "You'll need it every day. Sea temperatures are warm enough for swimming from May to November, and many villas have heated private pools.",
          es: 'Lo necesitarás todos los días. La temperatura del mar es agradable para nadar de mayo a noviembre, y muchas villas tienen piscina privada climatizada.',
        } as Bi,
      },
      {
        title: { en: 'A windbreaker', es: 'Cortavientos' } as Bi,
        body: {
          en: 'Handy for breezy days, especially if heading to the north coast or Famara beach.',
          es: 'Útil para los días de viento, sobre todo si vas a la costa norte o a la playa de Famara.',
        } as Bi,
      },
      {
        title: { en: 'Plug adapter', es: 'Adaptador de enchufe' } as Bi,
        body: {
          en: 'Lanzarote uses European 2-pin plugs. Bring a UK-to-EU adapter.',
          es: 'Lanzarote usa enchufes europeos de dos clavijas. Si vienes de Reino Unido, trae un adaptador.',
        } as Bi,
      },
    ],
  },
  forecast: {
    heading: { en: 'Checking the Lanzarote Weather Forecast', es: 'Consultar la previsión del tiempo en Lanzarote' } as Bi,
    paragraphs: [
      {
        en: "Most major weather apps give generalised forecasts for Lanzarote that don't reflect conditions on the ground — especially in the south. For more accurate, local forecasts, we recommend Windguru (windguru.cz/8202). It provides detailed wind and temperature data for 14 spots across the island and is the resource most locals rely on.",
        es: 'La mayoría de las apps de tiempo dan previsiones generales de Lanzarote que no reflejan bien las condiciones reales, sobre todo en el sur. Para previsiones locales más precisas, recomendamos Windguru (windguru.cz/8202), que ofrece datos detallados de viento y temperatura para 14 puntos de la isla y es el recurso que más usan los locales.',
      } as Bi,
      {
        en: "AEMET (Spain's national weather service, aemet.es) is another reliable option for official forecasts.",
        es: 'AEMET (el servicio meteorológico nacional de España, aemet.es) es otra opción fiable para previsiones oficiales.',
      } as Bi,
    ],
    links: [
      { label: 'Windguru', href: 'https://www.windguru.cz/8202' },
      { label: 'AEMET', href: 'https://www.aemet.es' },
    ],
  },
  timezone: {
    heading: { en: 'Time Zone', es: 'Zona horaria' } as Bi,
    body: {
      en: 'Despite being close to Africa, Lanzarote is on Greenwich Mean Time (GMT) — the same as the UK. The clocks change on the same dates too. So there\'s no jet lag and no time adjustment needed for British and Irish visitors.',
      es: 'A pesar de estar cerca de África, Lanzarote está en el huso horario GMT — el mismo que el Reino Unido. El cambio de hora también ocurre en las mismas fechas, así que no hay jet lag ni ajuste horario para visitantes británicos e irlandeses.',
    } as Bi,
  },
}

// ---------------------------------------------------------------------
// /guides/ferries
// ---------------------------------------------------------------------

export const ferriesGuide = {
  hero: {
    title: { en: 'Ferry Services from Lanzarote', es: 'Ferris desde Lanzarote' } as Bi,
    subtitle: {
      en: 'Daily connections to Fuerteventura & La Graciosa',
      es: 'Conexiones diarias a Fuerteventura y La Graciosa',
    } as Bi,
    image: '/lanzarote11.jpg',
  },
  intro: {
    paragraphs: [
      {
        en: "The Playa Blanca to Fuerteventura ferry is one of the most popular day trips in Lanzarote. The ferry port is right in the centre of Playa Blanca, and the crossing to Corralejo takes just 25–35 minutes. With up to 30 sailings a day between three operators, it's easy to hop across for a few hours or a full day out.",
        es: 'El ferry de Playa Blanca a Fuerteventura es una de las excursiones de un día más populares de Lanzarote. El puerto está en pleno centro de Playa Blanca, y la travesía hasta Corralejo dura solo 25–35 minutos. Con hasta 30 salidas diarias entre tres compañías, es muy fácil cruzar unas horas o pasar el día completo.',
      } as Bi,
      {
        en: "Fuerteventura is the second largest of the Canary Islands. It's known for its vast sandy beaches, dramatic sand dunes at Corralejo Natural Park, and a quieter, more laid-back pace of life than Lanzarote. The port town of Corralejo itself has a charming old town with shops, restaurants and bars. Don't miss the local goat's cheese — it's considered the best in the Canaries.",
        es: 'Fuerteventura es la segunda isla más grande de Canarias. Es conocida por sus extensas playas de arena, las espectaculares dunas del Parque Natural de Corralejo y un ritmo de vida más tranquilo que en Lanzarote. El pueblo portuario de Corralejo tiene un casco antiguo con encanto, con tiendas, restaurantes y bares. No te pierdas el queso de cabra local — está considerado el mejor de Canarias.',
      } as Bi,
    ],
  },
  operatorsHeading: { en: 'Ferry Operators & Timetables', es: 'Compañías y horarios' } as Bi,
  operatorsIntro: {
    en: 'Three companies operate the Playa Blanca to Corralejo ferry route. Schedules vary by season and day of the week.',
    es: 'Tres compañías cubren la ruta Playa Blanca–Corralejo. Los horarios varían según la temporada y el día de la semana.',
  } as Bi,
  operators: [
    {
      name: 'Fred Olsen Express',
      description: {
        en: 'The largest operator on this route, with up to 16 sailings per day. Fred Olsen runs both high-speed ferries (25 minutes) and conventional car ferries (around 35 minutes).',
        es: 'La mayor compañía de esta ruta, con hasta 16 salidas al día. Fred Olsen opera tanto ferris de alta velocidad (25 minutos) como ferris convencionales para vehículos (unos 35 minutos).',
      } as Bi,
      crossing: { en: '25–35 minutes', es: '25–35 minutos' } as Bi,
      frequency: { en: 'Up to 16 sailings daily', es: 'Hasta 16 salidas al día' } as Bi,
      vehicles: { en: 'Yes — cars, motorbikes, campervans', es: 'Sí — coches, motos, autocaravanas' } as Bi,
      pets: { en: 'Allowed (leash and muzzle required; "Pet Sofa" option available)', es: 'Permitidas (correa y bozal obligatorios; opción "Pet Sofa" disponible)' } as Bi,
      luggage: { en: 'Up to 20 kg per person included', es: 'Hasta 20 kg por persona incluidos' } as Bi,
      checkIn: { en: 'Arrive at least 1 hour before departure', es: 'Llegar al menos 1 hora antes de la salida' } as Bi,
      note: { en: 'Book online for discounts; Canary Island residents get special rates (€5.12!)', es: 'Reserva online para descuentos; los residentes canarios tienen tarifas especiales (¡5,12 €!)' } as Bi,
      website: 'https://www.fredolsen.es',
      phone: '+34 928 51 16 16',
    },
    {
      name: 'Naviera Armas Trasmediterránea',
      description: {
        en: 'Naviera Armas operates up to 8 daily sailings on the conventional car ferry Volcán de Tindaya. The crossing is slightly longer at around 35 minutes. The ferries are large and comfortable, with onboard catering available.',
        es: 'Naviera Armas opera hasta 8 salidas diarias con el ferry convencional Volcán de Tindaya. La travesía es algo más larga, unos 35 minutos. Son ferris grandes y cómodos, con servicio de restauración a bordo.',
      } as Bi,
      crossing: { en: '35 minutes', es: '35 minutos' } as Bi,
      frequency: { en: 'Up to 8 sailings daily', es: 'Hasta 8 salidas al día' } as Bi,
      vehicles: { en: 'Yes — cars, motorbikes, bicycles, campervans', es: 'Sí — coches, motos, bicicletas, autocaravanas' } as Bi,
      pets: { en: 'Allowed (carrier or leash and muzzle)', es: 'Permitidas (transportín o correa y bozal)' } as Bi,
      luggage: { en: 'Up to 60 kg (4 items) per person included', es: 'Hasta 60 kg (4 bultos) por persona incluidos' } as Bi,
      checkIn: { en: '30 minutes before for foot passengers; 60 minutes with a vehicle', es: '30 minutos antes para pasajeros a pie; 60 minutos con vehículo' } as Bi,
      note: { en: 'Most flexible for vehicle transport', es: 'La opción más flexible para transportar vehículos' } as Bi,
      website: 'https://www.navieraarmas.com',
      phone: '+34 928 30 16 10',
    },
    {
      name: 'Líneas Romero',
      description: {
        en: 'A smaller operator running up to 6 high-speed sailings per day. Líneas Romero is a popular choice for foot passengers looking for a quick, affordable crossing.',
        es: 'Una compañía más pequeña con hasta 6 salidas de alta velocidad al día. Líneas Romero es una opción popular para pasajeros a pie que buscan una travesía rápida y económica.',
      } as Bi,
      crossing: { en: '25 minutes', es: '25 minutos' } as Bi,
      frequency: { en: 'Up to 6 sailings daily', es: 'Hasta 6 salidas al día' } as Bi,
      vehicles: { en: 'Yes', es: 'Sí' } as Bi,
      pets: { en: 'Allowed', es: 'Permitidas' } as Bi,
      luggage: { en: 'Up to 20 kg per person included', es: 'Hasta 20 kg por persona incluidos' } as Bi,
      checkIn: null,
      note: null,
      website: 'https://www.lineasromero.com',
      phone: '+34 928 49 96 77',
    },
  ],
  pricing: {
    heading: { en: 'Playa Blanca to Fuerteventura Ferry Prices', es: 'Precios del ferry a Fuerteventura' } as Bi,
    intro: {
      en: "Ferry prices vary by operator, season and whether you're travelling with a vehicle.",
      es: 'Los precios varían según la compañía, la temporada y si viajas con vehículo.',
    } as Bi,
    columns: {
      type: { en: 'Ticket Type', es: 'Tipo de billete' } as Bi,
      price: { en: 'Approx. Price (one way)', es: 'Precio aprox. (ida)' } as Bi,
    },
    rows: [
      { type: { en: 'Adult foot passenger', es: 'Adulto a pie' } as Bi, price: '€17–€35' },
      { type: { en: 'Child foot passenger', es: 'Niño a pie' } as Bi, price: '€10–€20' },
      { type: { en: 'Car + driver', es: 'Coche + conductor' } as Bi, price: '€60–€160' },
      { type: { en: 'Motorbike + rider', es: 'Moto + conductor' } as Bi, price: { en: 'From €18', es: 'Desde 18 €' } as Bi },
      { type: { en: 'Bicycle', es: 'Bicicleta' } as Bi, price: { en: 'Free or small surcharge', es: 'Gratis o pequeño suplemento' } as Bi },
    ],
    note: {
      en: 'Prices are approximate and vary by season and operator. Book online for the best rates. Compare all three operators on aggregator sites such as Direct Ferries or Ferryhopper.',
      es: 'Los precios son aproximados y varían según temporada y compañía. Reserva online para las mejores tarifas. Compara las tres compañías en agregadores como Direct Ferries o Ferryhopper.',
    } as Bi,
  },
  tips: {
    heading: { en: 'Practical Tips for the Ferry', es: 'Consejos prácticos para el ferry' } as Bi,
    items: [
      {
        en: 'Book in advance during peak season. Ferries can sell out over Christmas, Easter and the summer months — especially if taking a vehicle. At quieter times, you can usually buy a ticket at the port on the day.',
        es: 'Reserva con antelación en temporada alta. Los ferris pueden agotarse en Navidad, Semana Santa y verano — sobre todo con vehículo. En temporada baja normalmente se puede comprar el billete en el puerto el mismo día.',
      } as Bi,
      {
        en: 'The first ferry departs around 06:50 and the last sailing is typically around 20:00. This gives you a full day on Fuerteventura if you catch an early crossing.',
        es: 'El primer ferry sale sobre las 06:50 y el último suele ser sobre las 20:00. Cogiendo uno temprano tendrás el día completo en Fuerteventura.',
      } as Bi,
      {
        en: 'Arrive early. Fred Olsen recommends arriving 1 hour before departure. Naviera Armas requires 30 minutes for foot passengers and 60 minutes with a vehicle.',
        es: 'Llega con tiempo. Fred Olsen recomienda llegar 1 hora antes. Naviera Armas exige 30 minutos para pasajeros a pie y 60 minutos con vehículo.',
      } as Bi,
      {
        en: "Bring ID. You'll need a passport or national ID card when boarding.",
        es: 'Lleva identificación. Necesitarás pasaporte o DNI para embarcar.',
      } as Bi,
      {
        en: "Take a car if you want to explore. Corralejo is walkable, but to reach the sand dunes, El Cotillo or the southern beaches, you'll need wheels. Alternatively, you can hire a car in Corralejo for the day.",
        es: 'Lleva coche si quieres explorar más allá. Corralejo se puede recorrer a pie, pero para llegar a las dunas, El Cotillo o las playas del sur necesitarás vehículo. También puedes alquilar uno en Corralejo por el día.',
      } as Bi,
      {
        en: 'The crossing is usually very smooth. The Bocaina Strait is sheltered between the two islands. However, on windy days the sea can be choppier — take travel sickness precautions if prone.',
        es: 'La travesía suele ser muy tranquila. El estrecho de La Bocaina está protegido entre las dos islas. En días de viento el mar puede estar más agitado — toma precauciones si te mareas fácilmente.',
      } as Bi,
    ],
  },
  corralejo: {
    heading: { en: 'What to Do in Corralejo', es: 'Qué hacer en Corralejo' } as Bi,
    items: [
      {
        title: { en: 'Corralejo old town', es: 'Casco antiguo de Corralejo' } as Bi,
        body: {
          en: 'Wander the colourful streets, browse the shops and stop for a coffee or a beer overlooking the harbour.',
          es: 'Pasea por las calles llenas de color, curiosea en las tiendas y para a tomar un café o una cerveza con vistas al puerto.',
        } as Bi,
      },
      {
        title: { en: 'Corralejo Natural Park & sand dunes', es: 'Parque Natural de Corralejo y sus dunas' } as Bi,
        body: {
          en: 'Vast golden dunes stretching along the coast, with some of the best beaches in the Canary Islands. A short drive or taxi ride from the port.',
          es: 'Enormes dunas doradas a lo largo de la costa, con algunas de las mejores playas de Canarias. A poca distancia en coche o taxi desde el puerto.',
        } as Bi,
      },
      {
        title: { en: 'El Cotillo', es: 'El Cotillo' } as Bi,
        body: {
          en: 'A charming fishing village on the northwest coast with dramatic cliffs, a historic lighthouse and sheltered lagoon-style beaches. Around 30 minutes by car from Corralejo.',
          es: 'Un encantador pueblo pesquero en la costa noroeste, con acantilados espectaculares, un faro histórico y playas protegidas en forma de laguna. A unos 30 minutos en coche de Corralejo.',
        } as Bi,
      },
      {
        title: { en: 'Isla de Lobos', es: 'Isla de Lobos' } as Bi,
        body: {
          en: 'A tiny uninhabited island just off Corralejo. Take a short boat trip across for a peaceful beach day and hiking. Permits are required and can be booked online.',
          es: 'Una pequeña isla deshabitada frente a Corralejo. Un breve trayecto en barco te lleva a un día de playa tranquilo y senderismo. Se requiere permiso, reservable online.',
        } as Bi,
      },
    ],
  },
  gettingToPort: {
    heading: { en: 'Getting to the Ferry Port in Playa Blanca', es: 'Cómo llegar al puerto en Playa Blanca' } as Bi,
    body: {
      en: "The ferry port is in the centre of Playa Blanca, at the harbour. It's walkable from most parts of the resort. The number 30 bus stops nearby, and the 161 and 60 bus routes from the airport and Arrecife both terminate at the harbour. There is parking available at the port, but spaces can fill up on busy days — arrive early if driving.",
      es: 'El puerto del ferry está en el centro de Playa Blanca. Se puede llegar caminando desde la mayor parte del resort. La línea 30 para cerca, y las líneas 161 y 60 desde el aeropuerto y Arrecife terminan en el puerto. Hay aparcamiento disponible, pero puede llenarse en días de mucha afluencia — llega con tiempo si vas en coche.',
    } as Bi,
  },
  laGraciosa: {
    heading: { en: 'La Graciosa Ferry', es: 'Ferry a La Graciosa' } as Bi,
    facts: {
      duration: { en: '25 minutes', es: '25 minutos' } as Bi,
      frequency: { en: '~13 daily sailings', es: '~13 salidas diarias' } as Bi,
      departure: { en: 'Órzola (north coast)', es: 'Órzola (costa norte)' } as Bi,
      arrival: { en: 'Caleta del Sebo (La Graciosa)', es: 'Caleta del Sebo (La Graciosa)' } as Bi,
      type: { en: 'Pristine, traffic-free island', es: 'Isla virgen, sin tráfico rodado' } as Bi,
    },
    operator: {
      name: 'Líneas Romero',
      website: 'https://www.lineasromero.com',
      port: { en: 'Órzola, north coast (1 hour from Playa Blanca)', es: 'Órzola, costa norte (1 hora desde Playa Blanca)' } as Bi,
      amenities: { en: 'Simple, no-frills passenger ferry', es: 'Ferry de pasajeros sencillo, sin lujos' } as Bi,
      price: { en: '~€10–15 p/p', es: '~10–15 € p/p' } as Bi,
    },
    whatToDo: {
      heading: { en: 'What to Do in La Graciosa', es: 'Qué hacer en La Graciosa' } as Bi,
      items: [
        { en: 'Playas de las Conchas: pristine sandy beaches', es: 'Playas de las Conchas: playas de arena vírgenes' } as Bi,
        { en: 'Walk through the village: very small, car-free', es: 'Pasear por el pueblo: muy pequeño, sin coches' } as Bi,
        { en: 'Snorkel/swim: bring your own supplies', es: 'Snorkel/baño: trae tu propio equipo' } as Bi,
        { en: 'Hike and explore: natural landscape', es: 'Senderismo y exploración: paisaje natural' } as Bi,
        { en: 'Lunch: basic village restaurants', es: 'Comer: restaurantes sencillos del pueblo' } as Bi,
      ],
    },
  },
}

// ---------------------------------------------------------------------
// /guides/beaches
// ---------------------------------------------------------------------

export type BeachCategory = 'family' | 'surf' | 'scenic' | 'secluded'

export interface Beach {
  id: string
  name: Bi
  tagline: Bi
  categories: BeachCategory[]
  location: Bi
  distance: Bi
  sand: Bi
  water: Bi
  rating: number
  facts: { label: Bi; value: Bi }[]
  tips: Bi
  image: string
}

export const beaches: Beach[] = [
  {
    id: 'papagayo',
    name: { en: 'Playa de Papagayo', es: 'Playa de Papagayo' } as Bi,
    tagline: { en: 'Scenic, families, snorkeling', es: 'Paisaje, familias, esnórquel' } as Bi,
    categories: ['scenic', 'family'],
    location: { en: 'South coast, Los Ajaches National Monument', es: 'Costa sur, Monumento Natural de Los Ajaches' } as Bi,
    distance: { en: '10 km from Playa Blanca (15–40 min)', es: '10 km desde Playa Blanca (15–40 min)' } as Bi,
    sand: { en: 'Golden', es: 'Dorada' } as Bi,
    water: { en: 'Crystal clear, turquoise, calm', es: 'Cristalina, turquesa, tranquila' } as Bi,
    rating: 5,
    facts: [
      { label: { en: 'Access', es: 'Acceso' } as Bi, value: { en: '€3 fee via dirt track, or free 40-min walk', es: '3 € en pista de tierra, o 40 min caminando gratis' } as Bi },
    ],
    tips: { en: 'Arrive early, bring water/food, respect the protected area.', es: 'Llega temprano, lleva agua y comida, respeta el espacio protegido.' } as Bi,
    image: '/lanzarote4.jpg',
  },
  {
    id: 'famara',
    name: { en: 'Playa de Famara', es: 'Playa de Famara' } as Bi,
    tagline: { en: 'Surfers, wild, active', es: 'Surf, salvaje, activa' } as Bi,
    categories: ['surf'],
    location: { en: 'Northwest coast', es: 'Costa noroeste' } as Bi,
    distance: { en: '45 km from Playa Blanca (~1 hr drive)', es: '45 km desde Playa Blanca (~1 h en coche)' } as Bi,
    sand: { en: 'Golden / black volcanic', es: 'Dorada / volcánica negra' } as Bi,
    water: { en: 'Strong currents — not for casual swimming', es: 'Corrientes fuertes — no apta para bañistas casuales' } as Bi,
    rating: 5,
    facts: [
      { label: { en: 'Waves', es: 'Olas' } as Bi, value: { en: 'Consistent, 1–3m typical', es: 'Constantes, 1–3 m habitual' } as Bi },
      { label: { en: 'Season', es: 'Temporada' } as Bi, value: { en: 'Best Mar–Oct; winter has bigger swells', es: 'Mejor de marzo a octubre; en invierno el oleaje es mayor' } as Bi },
    ],
    tips: { en: 'Bars, restaurants, surf and windsurf schools nearby.', es: 'Bares, restaurantes y escuelas de surf/windsurf cerca.' } as Bi,
    image: '/lanzarote9.jpg',
  },
  {
    id: 'dorada',
    name: { en: 'Playa Dorada', es: 'Playa Dorada' } as Bi,
    tagline: { en: 'Families, calm', es: 'Familias, tranquila' } as Bi,
    categories: ['family'],
    location: { en: 'Playa Blanca', es: 'Playa Blanca' } as Bi,
    distance: { en: '0 km', es: '0 km' } as Bi,
    sand: { en: 'Golden', es: 'Dorada' } as Bi,
    water: { en: 'Calm, shallow', es: 'Tranquila, poco profunda' } as Bi,
    rating: 4.5,
    facts: [
      { label: { en: 'Depth', es: 'Profundidad' } as Bi, value: { en: 'Very shallow — perfect for toddlers', es: 'Muy poco profunda — perfecta para peques' } as Bi },
      { label: { en: 'Amenities', es: 'Servicios' } as Bi, value: { en: 'Lifeguards (summer), bars, parking, showers, loungers', es: 'Socorristas (verano), bares, parking, duchas, hamacas' } as Bi },
    ],
    tips: { en: 'Book loungers early in summer; great access to promenade shops.', es: 'Reserva hamacas pronto en verano; buen acceso a las tiendas del paseo.' } as Bi,
    image: '/lanzarote3.jpg',
  },
  {
    id: 'flamingo',
    name: { en: 'Playa Flamingo', es: 'Playa Flamingo' } as Bi,
    tagline: { en: 'Families, shade', es: 'Familias, sombra' } as Bi,
    categories: ['family'],
    location: { en: 'Playa Blanca (behind hotel strip)', es: 'Playa Blanca (tras la zona de hoteles)' } as Bi,
    distance: { en: '0 km', es: '0 km' } as Bi,
    sand: { en: 'Golden', es: 'Dorada' } as Bi,
    water: { en: 'Calm, shallow', es: 'Tranquila, poco profunda' } as Bi,
    rating: 4.5,
    facts: [
      { label: { en: 'Special', es: 'Especial' } as Bi, value: { en: 'Natural shade from palm trees — unique in Playa Blanca', es: 'Sombra natural de palmeras — única en Playa Blanca' } as Bi },
    ],
    tips: { en: 'Sand gets very hot — bring flip-flops.', es: 'La arena se calienta mucho — lleva chanclas.' } as Bi,
    image: '/lanzarote6.jpg',
  },
  {
    id: 'mujeres',
    name: { en: 'Playa Mujeres', es: 'Playa Mujeres' } as Bi,
    tagline: { en: 'Scenic, turquoise', es: 'Paisaje, turquesa' } as Bi,
    categories: ['scenic', 'family'],
    location: { en: 'Papagayo area', es: 'Zona de Papagayo' } as Bi,
    distance: { en: '12 km from Playa Blanca', es: '12 km desde Playa Blanca' } as Bi,
    sand: { en: 'Golden', es: 'Dorada' } as Bi,
    water: { en: 'Turquoise, clear', es: 'Turquesa, cristalina' } as Bi,
    rating: 4.5,
    facts: [
      { label: { en: 'Access', es: 'Acceso' } as Bi, value: { en: 'Car via dirt track (€3) or walk', es: 'Coche por pista de tierra (3 €) o caminando' } as Bi },
    ],
    tips: { en: '400m of golden sand, less crowded than main Papagayo.', es: '400 m de arena dorada, menos concurrida que la playa principal de Papagayo.' } as Bi,
    image: '/lanzarote4.jpg',
  },
  {
    id: 'grande',
    name: { en: 'Playa Grande (Puerto del Carmen)', es: 'Playa Grande (Puerto del Carmen)' } as Bi,
    tagline: { en: 'Families, beginners, all-rounder', es: 'Familias, principiantes, todoterreno' } as Bi,
    categories: ['family'],
    location: { en: 'East coast', es: 'Costa este' } as Bi,
    distance: { en: '25 km from Playa Blanca (~30 min)', es: '25 km desde Playa Blanca (~30 min)' } as Bi,
    sand: { en: 'Golden', es: 'Dorada' } as Bi,
    water: { en: 'Calm to medium swell', es: 'De tranquila a oleaje moderado' } as Bi,
    rating: 4,
    facts: [
      { label: { en: 'Extension', es: 'Continuación' } as Bi, value: { en: 'Playa Chica just south (busier, shallower)', es: 'Playa Chica justo al sur (más concurrida, menos profunda)' } as Bi },
    ],
    tips: { en: 'Very busy in summer & weekends; nightlife on the promenade.', es: 'Muy concurrida en verano y fines de semana; ambiente nocturno en el paseo.' } as Bi,
    image: '/lanzarote13.jpg',
  },
  {
    id: 'conchas',
    name: { en: 'Playa de las Conchas (La Graciosa)', es: 'Playa de las Conchas (La Graciosa)' } as Bi,
    tagline: { en: 'Secluded, pristine, paradise beach', es: 'Aislada, virgen, playa de ensueño' } as Bi,
    categories: ['secluded', 'scenic'],
    location: { en: 'La Graciosa island', es: 'Isla de La Graciosa' } as Bi,
    distance: { en: '45 km drive + 25 min ferry', es: '45 km en coche + 25 min de ferry' } as Bi,
    sand: { en: 'White — finest in the Canaries', es: 'Blanca — la más fina de Canarias' } as Bi,
    water: { en: 'Calm, clear', es: 'Tranquila, cristalina' } as Bi,
    rating: 5,
    facts: [
      { label: { en: 'Ferry', es: 'Ferry' } as Bi, value: { en: '25 min from Órzola', es: '25 min desde Órzola' } as Bi },
    ],
    tips: { en: 'Plan a full-day trip and bring your own supplies — the island has no cars.', es: 'Planea una excursión de día completo y lleva tus propias provisiones — la isla no tiene coches.' } as Bi,
    image: '/lanzarote14.jpg',
  },
  {
    id: 'caleton-blanco',
    name: { en: 'Caletón Blanco', es: 'Caletón Blanco' } as Bi,
    tagline: { en: 'Natural pool, families', es: 'Piscina natural, familias' } as Bi,
    categories: ['family', 'secluded'],
    location: { en: 'North coast, near Órzola', es: 'Costa norte, cerca de Órzola' } as Bi,
    distance: { en: '50 km from Playa Blanca', es: '50 km desde Playa Blanca' } as Bi,
    sand: { en: 'White / light', es: 'Blanca / clara' } as Bi,
    water: { en: 'Shallow lagoon, calm, turquoise (1–2m max)', es: 'Laguna poco profunda, tranquila, turquesa (máx. 1–2 m)' } as Bi,
    rating: 4,
    facts: [
      { label: { en: 'Special', es: 'Especial' } as Bi, value: { en: 'Framed by black volcanic rock', es: 'Enmarcada por roca volcánica negra' } as Bi },
    ],
    tips: { en: 'No amenities — bring all supplies. Great for small kids.', es: 'Sin servicios — lleva todo lo necesario. Ideal para niños pequeños.' } as Bi,
    image: '/lanzarote16.jpg',
  },
  {
    id: 'canteria',
    name: { en: 'Playa de la Cantería', es: 'Playa de la Cantería' } as Bi,
    tagline: { en: 'Wild beauty', es: 'Belleza salvaje' } as Bi,
    categories: ['secluded', 'scenic'],
    location: { en: 'North coast, amongst volcanic cliffs', es: 'Costa norte, entre acantilados volcánicos' } as Bi,
    distance: { en: '55 km from Playa Blanca', es: '55 km desde Playa Blanca' } as Bi,
    sand: { en: 'Dark volcanic', es: 'Volcánica oscura' } as Bi,
    water: { en: 'Exposed, dramatic swell', es: 'Expuesta, oleaje pronunciado' } as Bi,
    rating: 4,
    facts: [],
    tips: { en: 'Dramatic volcanic scenery, quiet and unspoilt — bring water.', es: 'Paisaje volcánico espectacular, tranquilo e intacto — lleva agua.' } as Bi,
    image: '/lanzarote17.jpg',
  },
  {
    id: 'playa-blanca-town',
    name: { en: 'Playa Blanca (Town Beach)', es: 'Playa Blanca (playa del pueblo)' } as Bi,
    tagline: { en: 'Local favourite', es: 'Favorita de los locales' } as Bi,
    categories: ['family'],
    location: { en: 'Playa Blanca town centre', es: 'Centro de Playa Blanca' } as Bi,
    distance: { en: '0 km', es: '0 km' } as Bi,
    sand: { en: 'Golden', es: 'Dorada' } as Bi,
    water: { en: 'Calm', es: 'Tranquila' } as Bi,
    rating: 4,
    facts: [
      { label: { en: 'Amenities', es: 'Servicios' } as Bi, value: { en: 'Bars, restaurants, parking, showers, town services', es: 'Bares, restaurantes, parking, duchas, servicios del pueblo' } as Bi },
    ],
    tips: { en: 'Popular with locals; easy access to the marina and promenade.', es: 'Popular entre los locales; fácil acceso a la marina y el paseo.' } as Bi,
    image: '/lanzarote2.jpg',
  },
]

export const beachesGuide = {
  hero: {
    title: { en: "Lanzarote's Best Beaches", es: 'Las mejores playas de Lanzarote' } as Bi,
    subtitle: {
      en: 'From family-friendly to wild escapes',
      es: 'Desde playas familiares hasta escapadas salvajes',
    } as Bi,
    image: '/lanzarote4.jpg',
  },
  overview: {
    en: 'Lanzarote has 40+ named beaches with something for everyone — family, surfer, scenic, secluded. Swimming is possible year-round, with sea temperatures of 18–23°C.',
    es: 'Lanzarote tiene más de 40 playas con nombre propio, para todos los gustos — familiares, de surf, paisajísticas, escondidas. Se puede nadar todo el año, con temperaturas del mar de 18–23°C.',
  } as Bi,
  filters: {
    all: { en: 'All', es: 'Todas' } as Bi,
    family: { en: 'Family', es: 'Familia' } as Bi,
    surf: { en: 'Surf', es: 'Surf' } as Bi,
    scenic: { en: 'Scenic', es: 'Paisaje' } as Bi,
    secluded: { en: 'Secluded', es: 'Aislada' } as Bi,
  },
  quickPicks: {
    heading: { en: 'Beach Categories & Quick Picks', es: 'Categorías y recomendaciones rápidas' } as Bi,
    items: [
      { label: { en: 'Best for Families', es: 'Mejores para familias' } as Bi, value: { en: 'Playa Dorada, Playa Flamingo, Caletón Blanco, Playa Grande', es: 'Playa Dorada, Playa Flamingo, Caletón Blanco, Playa Grande' } as Bi },
      { label: { en: 'Best for Surfers', es: 'Mejores para surfistas' } as Bi, value: { en: 'Playa de Famara, Papagayo (depending on swell)', es: 'Playa de Famara, Papagayo (según el oleaje)' } as Bi },
      { label: { en: 'Best for Scenery', es: 'Mejores paisajes' } as Bi, value: { en: 'Papagayo, Playa Mujeres, Las Conchas', es: 'Papagayo, Playa Mujeres, Las Conchas' } as Bi },
      { label: { en: 'Best for Quiet/Secluded', es: 'Más tranquilas y aisladas' } as Bi, value: { en: 'Las Conchas, Playa de la Cantería, Caletón Blanco', es: 'Las Conchas, Playa de la Cantería, Caletón Blanco' } as Bi },
      { label: { en: 'Best for Water Sports', es: 'Mejores para deportes acuáticos' } as Bi, value: { en: 'Playa de Famara, Playa Grande, Papagayo (snorkeling)', es: 'Playa de Famara, Playa Grande, Papagayo (esnórquel)' } as Bi },
    ],
  },
  practicalTips: {
    heading: { en: 'Practical Tips (All Beaches)', es: 'Consejos prácticos (todas las playas)' } as Bi,
    whatToBring: {
      title: { en: 'What to Bring', es: 'Qué llevar' } as Bi,
      items: [
        { en: 'High-factor sunscreen', es: 'Protector solar de factor alto' } as Bi,
        { en: 'Water (1.5L+ per person)', es: 'Agua (1,5 L+ por persona)' } as Bi,
        { en: 'Hat/cap', es: 'Gorra o sombrero' } as Bi,
        { en: 'Beach towel', es: 'Toalla de playa' } as Bi,
        { en: 'Flip-flops (sand very hot)', es: 'Chanclas (la arena quema)' } as Bi,
        { en: 'Waterproof phone bag', es: 'Funda estanca para el móvil' } as Bi,
        { en: 'Snacks', es: 'Snacks' } as Bi,
      ],
    },
    safety: {
      title: { en: 'Safety Tips', es: 'Consejos de seguridad' } as Bi,
      items: [
        { en: 'Check water conditions before entering', es: 'Comprueba las condiciones del mar antes de entrar' } as Bi,
        { en: 'Respect red flags (no swimming)', es: 'Respeta la bandera roja (prohibido el baño)' } as Bi,
        { en: 'Never swim alone', es: 'No nades solo' } as Bi,
        { en: 'Watch for strong currents (north coast)', es: 'Cuidado con las corrientes fuertes (costa norte)' } as Bi,
        { en: 'Sunburn risk: very high, even on cloudy days', es: 'Riesgo de quemadura solar: muy alto, incluso con nubes' } as Bi,
        { en: 'Hydration is essential year-round', es: 'Hidratarse es esencial todo el año' } as Bi,
      ],
    },
    timing: {
      title: { en: 'Timing', es: 'Cuándo ir' } as Bi,
      items: [
        { en: 'Morning: calmest water, fewer crowds', es: 'Mañana: agua más tranquila, menos gente' } as Bi,
        { en: 'Midday: hottest, busiest', es: 'Mediodía: más calor, más concurrido' } as Bi,
        { en: 'Afternoon: can be windy (trade winds)', es: 'Tarde: puede haber viento (alisios)' } as Bi,
        { en: 'Sunset: beautiful light, moderate crowds', es: 'Atardecer: luz preciosa, afluencia moderada' } as Bi,
        { en: 'Evening: refreshing after-dinner swim', es: 'Noche: un baño refrescante después de cenar' } as Bi,
      ],
    },
  },
  seasonal: {
    heading: { en: 'Seasonal Considerations', es: 'Consideraciones estacionales' } as Bi,
    items: [
      { season: { en: 'Summer (Jun–Sep)', es: 'Verano (jun–sep)' } as Bi, body: { en: 'Hot, sunny, calm water (22–23°C), peak crowds', es: 'Caluroso, soleado, mar en calma (22–23°C), máxima afluencia' } as Bi },
      { season: { en: 'Autumn (Oct–Nov)', es: 'Otoño (oct–nov)' } as Bi, body: { en: 'Still warm (24–26°C air), fewer crowds, increased swell', es: 'Todavía cálido (24–26°C), menos gente, más oleaje' } as Bi },
      { season: { en: 'Winter (Dec–Feb)', es: 'Invierno (dic–feb)' } as Bi, body: { en: 'Mild (20–21°C), quiet, large waves for surfers', es: 'Templado (20–21°C), tranquilo, buenas olas para surfistas' } as Bi },
      { season: { en: 'Spring (Mar–May)', es: 'Primavera (mar–may)' } as Bi, body: { en: 'Warming (22–24°C), building crowds, variable winds', es: 'Calentando (22–24°C), más afluencia, viento variable' } as Bi },
    ],
  },
}

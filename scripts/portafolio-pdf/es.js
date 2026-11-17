// Traducción al español del portafolio (render.js --es). Cada par es
// [texto exacto en render.js, texto en español]. Se aplica en una sola pasada
// sobre el HTML de cada página, de la cadena más larga a la más corta, así
// que un fragmento corto nunca pisa a uno largo ni a un texto ya traducido.
// Si cambias un texto en render.js, cámbialo aquí también: lo que no esté en
// la lista sale en inglés.

const PARES = [
  // Portada y marco
  ['Portfolio 2026 · Rubén Rivera · Querétaro, Mexico', 'Portafolio 2026 · Rubén Rivera · Querétaro, México'],
  ['NotMan · Rubén Rivera · Querétaro, Mexico', 'NotMan · Rubén Rivera · Querétaro, México'],
  ['Sports design &amp; motion', 'Diseño y motion deportivo'],
  ['Matchday graphics, athlete branding and motion for clubs, agencies and players.', 'Gráficos de partido, branding de atletas y motion para clubes, agencias y jugadores.'],
  ['Design × Animation × Web', 'Diseño × Animación × Web'],
  ['Identity, lettering, motion graphics and web design, end to end.', 'Identidad, lettering, motion graphics y diseño web, de principio a fin.'],
  ['<span>years in agencies</span>', '<span>años en agencias</span>'],
  ['<span>markets</span>', '<span>mercados</span>'],

  // Intro
  ['01 · Profile', '01 · Perfil'],
  ['Animated ads, player intros, broadcast graphics packages and vertical pieces for Reels and TikTok.', 'Anuncios animados, intros de jugadores, paquetes gráficos para transmisión y piezas verticales para Reels y TikTok.'],
  ['Sports video editing', 'Edición de video deportivo'],
  ['Ad reels, matchday content, athlete highlights and video case studies that turn results into a story.', 'Reels publicitarios, contenido de partido, highlights de atletas y casos en video que convierten resultados en una historia.'],
  ['Interactive landing pages and media kits, so the digital presence matches the talent you represent.', 'Landing pages interactivas y media kits, para que la presencia digital esté a la altura del talento que representas.'],
  ['White-label support', 'Soporte de marca blanca'],
  ['External ally for agencies: I absorb workload peaks without you raising fixed costs or over-hiring.', 'Aliado externo para agencias: absorbo los picos de trabajo sin que subas tus costos fijos ni contrates de más.'],
  ['Identity &amp; lettering', 'Identidad y lettering'],
  ['Identity & lettering', 'Identidad y lettering'],
  ['Logos, custom lettering and visual systems that hold up across every touchpoint, plus art direction.', 'Logos, lettering a medida y sistemas visuales que funcionan en todos los puntos de contacto, además de dirección de arte.'],
  ['Animated identities, ads, intros and vertical pieces for Reels and TikTok (After Effects, Blender).', 'Identidades animadas, anuncios, intros y piezas verticales para Reels y TikTok (After Effects, Blender).'],
  ['Video editing', 'Edición de video'],
  ['Ad reels, social content, highlights and video case studies that turn results into a story.', 'Reels publicitarios, contenido para redes, highlights y casos en video que convierten resultados en una historia.'],
  ['Sites designed and built end to end, from structure and layout to implementation.', 'Sitios diseñados y construidos de principio a fin, desde la estructura y el diseño hasta la implementación.'],
  ['Sports marketing specialist', 'Especialista en marketing deportivo'],
  ['Graphic designer · Motion designer · Web', 'Diseñador gráfico · Motion designer · Web'],
  ['The tactical backup<br>your agency needs', 'El refuerzo táctico<br>que tu agencia necesita'],
  ['Design, animation<br>and web, end to end', 'Diseño, animación<br>y web, de principio a fin'],
  ['9+ years designing and animating for agencies, elite players and their representatives. When your team runs out of capacity or time, I step in: motion graphics, video and web design, ready for deployment.', 'Más de 9 años diseñando y animando para agencias, jugadores de élite y sus representantes. Cuando a tu equipo le falta capacidad o tiempo, entro yo: motion graphics, video y diseño web, listos para salir.'],
  ['I’m Rubén Rivera, a designer and animator based in Querétaro, Mexico, with 9+ years across 7 studios and agencies. I build identities, set them in motion and put them online: from my own lettered mark to season-long graphics systems and working ecommerce sites.', 'Soy Rubén Rivera, diseñador y animador en Querétaro, México, con más de 9 años en 7 estudios y agencias. Creo identidades, las pongo en movimiento y las llevo a la web: desde mi propio logo hecho a mano hasta sistemas gráficos para toda una temporada y tiendas en línea funcionando.'],
  ['<p class="kicker">Inside</p>', '<p class="kicker">Contenido</p>'],

  // Botones y QR
  ['Full case study →', 'Ver el caso completo →'],
  ['Scan for the full case<br>and the videos in motion<br>', 'Escanea para ver el caso<br>completo y los videos<br>'],

  // Rol en Victorem
  ['<b>My role:</b> design, compositing and animation, end to end. Every piece was produced by me; the work shipped under the name of Victorem Sports Marketing, the agency I was with at the time.', '<b>Mi rol:</b> diseño, composición y animación, de principio a fin. Todas las piezas las produje yo; el trabajo se entregó bajo el nombre de Victorem Sports Marketing, la agencia donde estaba en ese momento.'],

  // Encabezados de sección
  ['Case study · ', 'Caso · '],
  ['Athlete branding', 'Branding de atleta'],
  ['Al-Arabi SC · The system', 'Al-Arabi SC · El sistema'],
  ['Hugo González · Season', 'Hugo González · Temporada'],
  ['Women’s football · Players', 'Fútbol femenil · Jugadoras'],
  ['Women’s football · In motion', 'Fútbol femenil · En movimiento'],
  ['Women’s football', 'Fútbol femenil'],
  ['More sports work', 'Más trabajo deportivo'],
  ['Self-initiated · Lettering', 'Proyecto propio · Lettering'],
  ['The NotMan mark · Construction', 'El logo de NotMan · Construcción'],
  ['The NotMan mark', 'El logo de NotMan'],
  ['Web design · More sites', 'Diseño web · Más sitios'],
  ['Web design UI/UX', 'Diseño web UI/UX'],
  ['UI/UX web design · design and development', 'Diseño web UI/UX · diseño y desarrollo'],
  ['Web design', 'Diseño web'],
  ['>Profile<', '>Perfil<'],
  ['>Contact<', '>Contacto<'],

  // Al-Arabi
  ['2D/3D motion graphics · while at Victorem Sports Marketing', 'Motion graphics 2D/3D · en Victorem Sports Marketing'],
  ['A matchday graphics system for a volleyball team in Qatar', 'Un sistema de gráficos de partido para un equipo de voleibol en Catar'],
  ['Al-Arabi Sports Club is a multi-sport club in Qatar; the brief was for its volleyball team at the West Asian Clubs Championship 2024. Not a one-off piece, but a reusable system the club’s content team could feed match after match without the identity drifting.', 'Al-Arabi Sports Club es un club multideportivo de Catar; el encargo fue para su equipo de voleibol en el West Asian Clubs Championship 2024. No una pieza suelta, sino un sistema reutilizable que el equipo de contenido del club pudiera alimentar partido tras partido sin que la identidad se perdiera.'],
  ['<b>What it covers:</b> starting lineup, next-opponent announcement, the full group-stage schedule and matchday graphics against Alsalam Club, Qadsia SC, Al Rayyan SC and Alahli Club, plus one animated video per match.', '<b>Qué incluye:</b> alineación titular, anuncio del próximo rival, el calendario completo de la fase de grupos y gráficos de partido contra Alsalam Club, Qadsia SC, Al Rayyan SC y Alahli Club, más un video animado por partido.'],
  ['<b>The bar:</b> not “good for volleyball”, but holding its own in the same feed as the biggest leagues in the world.', '<b>La vara:</b> no “bien para ser voleibol”, sino sostenerse en el mismo feed que las ligas más grandes del mundo.'],
  ['Same skeleton, every matchday · opponent, venue and date change', 'El mismo esqueleto en cada jornada · cambian rival, sede y fecha'],
  ['Group stage', 'Fase de grupos'],
  ['Line-up', 'Alineación'],
  ['Next match', 'Próximo partido'],
  ['Full schedule', 'Calendario completo'],
  ['Matchday piece', 'Pieza de partido'],

  // Hugo González
  ['Sports branding · while at Victorem Sports Marketing', 'Branding deportivo · en Victorem Sports Marketing'],
  ['Digital image for a professional goalkeeper', 'Imagen digital para un portero profesional'],
  ['Personal social media branding for the Mazatlán FC goalkeeper during his time at the club: the player’s own brand, not official club content, timed to every relevant match of the season in Liga MX and Leagues Cup.', 'Branding personal en redes para el portero de Mazatlán FC durante su etapa en el club: la marca propia del jugador, no contenido oficial del club, al ritmo de cada partido relevante de la temporada en Liga MX y Leagues Cup.'],
  ['<b>Match by match:</b> his presence in the game, the result, a recap. The same pattern against Tijuana, Puebla, Monterrey, Pachuca, Necaxa and Juárez, plus two editions of Leagues Cup. One animated video for every significant match.', '<b>Partido a partido:</b> su presencia en el juego, el resultado, un resumen. El mismo patrón contra Tijuana, Puebla, Monterrey, Pachuca, Necaxa y Juárez, más dos ediciones de Leagues Cup. Un video animado por cada partido importante.'],
  ['<b>Why it matters:</b> a player’s personal brand is part of their commercial value. Sustaining it, match after match, is the work.', '<b>Por qué importa:</b> la marca personal de un jugador es parte de su valor comercial. Sostenerla, partido tras partido, es el trabajo.'],
  ['One identity across a Liga MX season and Leagues Cup', 'Una sola identidad en una temporada de Liga MX y en Leagues Cup'],

  // Fútbol femenil
  ['Pieces that follow a career, not a campaign', 'Piezas que siguen una carrera, no una campaña'],
  ['Signings, presentations, matchday and goal graphics for players in Liga MX Femenil, its Under-19 category and Queens League Américas. Some players were followed for years, from a first contract to a top-flight debut.', 'Fichajes, presentaciones, gráficos de partido y de gol para jugadoras de Liga MX Femenil, su categoría Sub-19 y Queens League Américas. A algunas jugadoras las acompañé durante años, de un primer contrato a su debut en primera.'],
  ['<b>The four moments a club communicates:</b> the signing, the presentation with the new badge, the matchday and the goal. The goal piece is a reusable template: swap name and photo and it goes out the same night.', '<b>Los cuatro momentos que comunica un club:</b> el fichaje, la presentación con el escudo nuevo, el partido y el gol. La pieza de gol es una plantilla reutilizable: cambias nombre y foto y sale esa misma noche.'],
  ['<b>Register:</b> Queens League called for black and gold. Knowing when not to apply your own template is part of the craft.', '<b>Registro:</b> Queens League pedía negro y oro. Saber cuándo no aplicar tu propia plantilla también es parte del oficio.'],
  ['Liga MX Femenil · U-19 · Queens League Américas · Argentina · New Zealand', 'Liga MX Femenil · Sub-19 · Queens League Américas · Argentina · Nueva Zelanda'],
  ['<p class="kicker">In motion</p>', '<p class="kicker">En movimiento</p>'],
  ['Five clubs, three competitions, two divisions', 'Cinco clubes, tres competencias, dos divisiones'],
  ['Complete pieces as they went out on social, with their audio and pacing.', 'Piezas completas tal como salieron en redes, con su audio y su ritmo.'],
  [' Tap any of them to watch.', ' Toca cualquiera para verla.'],
  ['<b>One career in three chapters:</b> Nayrobi García appears at her signing, on a U-19 matchday with Guadalajara and at her top-flight debut. Each piece had to look like part of the same story, even with seasons and a change of club in between.', '<b>Una carrera en tres capítulos:</b> Nayrobi García aparece en su fichaje, en una jornada Sub-19 con Guadalajara y en su debut en primera. Cada pieza tenía que verse como parte de la misma historia, aun con temporadas y un cambio de club de por medio.'],
  ['Liga MX Femenil U-19', 'Liga MX Femenil Sub-19'],
  ['Hanna Osorio · Goal', 'Hanna Osorio · Gol'],
  ['Cruz Azul · reusable template', 'Cruz Azul · plantilla reutilizable'],
  [' · Signing', ' · Fichaje'],
  [' · Top-flight debut', ' · Debut en primera'],
  [' · First pro contract', ' · Primer contrato profesional'],
  [' · Presentation', ' · Presentación'],

  // Más trabajo deportivo
  ['Players · signings and presentations', 'Jugadores · fichajes y presentaciones'],
  ['Showcase pieces · Victorem, no end client', 'Piezas de exhibición · Victorem, sin cliente final'],
  ['Self-initiated showcase work, not commissioned by UEFA or the player.', 'Trabajo de exhibición por iniciativa propia, sin encargo de la UEFA ni del jugador.'],

  // Lettering
  ['Personal project · Custom lettering', 'Proyecto personal · Lettering a medida'],
  ['My own logo, built letter by letter', 'Mi propio logo, hecho letra por letra'],
  ['The name came first: Anthrax’s mascot, then my nickname, then my signature. Around 2020 I added “The”, the way comic book characters are named, and started sketching in pencil: I wanted a word that sat on a curve, like the retro <b>Silver Surfer</b> mastheads.', 'Primero fue el nombre: la mascota de Anthrax, luego mi apodo, luego mi firma. Alrededor de 2020 le agregué “The”, como se nombra a los personajes de cómic, y empecé a bocetar a lápiz: quería una palabra montada sobre una curva, como los logos retro de <b>Silver Surfer</b>.'],
  ['It reads <b>THE NOTMAN</b>: nine letters drawn as individual shapes and locked into one block, with the T’s crossbar sweeping over the whole word. The chrome comes from the Surfer; the gradient version from Thanos and my favorite shade of purple.', 'Dice <b>THE NOTMAN</b>: nueve letras dibujadas como formas independientes y encajadas en un solo bloque, con el travesaño de la T barriendo toda la palabra. El cromo viene de Silver Surfer; la versión en degradado, de Thanos y de mi tono de morado favorito.'],
  ['It’s the same skill that goes into a club’s matchday system: one strong idea, built to repeat everywhere without losing its shape.', 'Es la misma habilidad que lleva el sistema de partido de un club: una idea fuerte, hecha para repetirse en todos lados sin perder su forma.'],
  ['On the next page: the construction and how the mark adapts to different backgrounds and sizes.', 'En la siguiente página: la construcción y cómo se adapta el logo a distintos fondos y tamaños.'],
  ['Vector construction · 9 shapes, one per letter', 'Construcción vectorial · 9 formas, una por letra'],
  ['Chrome on black · primary', 'Cromo sobre negro · principal'],
  ['Gradient version', 'Versión en degradado'],
  ['<span>One color</span>', '<span>Una tinta</span>'],
  ['Small sizes · app icon and favicon', 'Tamaños chicos · ícono de app y favicon'],

  // Web
  ['Six industries, one standard', 'Seis industrias, un mismo estándar'],
  ['Web design isn’t a template you repeat: every industry solves different problems, while the visual and usability standard stays the same.', 'El diseño web no es una plantilla que se repite: cada industria resuelve problemas distintos, mientras el estándar visual y de usabilidad se mantiene.'],
  ['<b>My role:</b> design and development end to end, working directly with each client: structure, visual identity, layout and implementation, across seven sites.', '<b>Mi rol:</b> diseño y desarrollo de principio a fin, trabajando directo con cada cliente: estructura, identidad visual, diseño e implementación, en siete sitios.'],
  ['Beyond matchday: the web', 'Más allá del partido: la web'],
  ['I also design and build sites end to end: seven projects across six industries, from an ecommerce with B2B checkout to a real estate developer and a creative studio.', 'También diseño y construyo sitios de principio a fin: siete proyectos en seis industrias, desde una tienda en línea con compra B2B hasta una inmobiliaria y un estudio creativo.'],
  ['For sports clients that means landing pages and media kits that match the level of the talent they represent.', 'Para clientes deportivos eso significa landing pages y media kits a la altura del talento que representan.'],
  ['2019 · Jazz café', '2019 · Café de jazz'],
  ['Website and social media kit for a café that doubles as a live jazz venue: coffee shop by day, venue by night.', 'Sitio web y kit para redes de un café que también es foro de jazz en vivo: cafetería de día, foro de noche.'],
  ['2019 · Restaurant', '2019 · Restaurante'],
  ['Responsive website where the menu and location read fast on any screen.', 'Sitio responsivo donde el menú y la ubicación se leen rápido en cualquier pantalla.'],
  ['2020 · Brand holding', '2020 · Grupo de marcas'],
  ['Corporate site that makes clear what the group is and what each of its brands is.', 'Sitio corporativo que deja claro qué es el grupo y qué es cada una de sus marcas.'],
  ['2020 · Saxophone quartet', '2020 · Cuarteto de saxofones'],
  ['Website and app to book dates and showcase repertoire.', 'Sitio web y app para agendar fechas y mostrar su repertorio.'],
  ['2021 · Dental supplies', '2021 · Insumos dentales'],
  ['Ecommerce and app: catalog, cart and checkout for B2B buyers.', 'Tienda en línea y app: catálogo, carrito y pago para compradores B2B.'],
  ['2023 · Real estate', '2023 · Inmobiliaria'],
  ['Website and app where every property’s photos and floor plans look good and load fast.', 'Sitio web y app donde las fotos y los planos de cada propiedad se ven bien y cargan rápido.'],
  ['2023 · Creative studio', '2023 · Estudio creativo'],
  ['Web portfolio where the site itself is the piece on display.', 'Portafolio web donde el sitio mismo es la pieza en exhibición.'],

  // Perfil
  ['<p class="kicker">Track record</p>', '<p class="kicker">Trayectoria</p>'],
  ['9 years · 7 studios and agencies', '9 años · 7 estudios y agencias'],
  ['Agency experience specialized in sports at <b>Victorem Sports Marketing</b>: matchday systems for Al-Arabi SC (Qatar), the digital image of goalkeeper Hugo González (Mazatlán FC) and players across Liga MX Femenil and Queens League Américas.', 'Experiencia en agencia especializada en deporte en <b>Victorem Sports Marketing</b>: sistemas de partido para Al-Arabi SC (Catar), la imagen digital del portero Hugo González (Mazatlán FC) y jugadoras de Liga MX Femenil y Queens League Américas.'],
  ['<p class="kicker mt">Education</p>', '<p class="kicker mt">Formación</p>'],
  ['<b>BA in Graphic Design</b><br>Universidad Autónoma de Querétaro · Fine Arts · 2011–2016', '<b>Licenciatura en Diseño Gráfico</b><br>Universidad Autónoma de Querétaro · Bellas Artes · 2011–2016'],
  ['<b>Diploma in Filmmaking</b><br>UAQ · Political and Social Sciences · 2017', '<b>Diplomado en Cine</b><br>UAQ · Ciencias Políticas y Sociales · 2017'],
  ['<p class="kicker mt">Based in</p>', '<p class="kicker mt">Base</p>'],
  ['Querétaro, Mexico · Native Spanish · Professional English · Remote, used to working across time zones', 'Querétaro, México · Español nativo · Inglés profesional · Remoto, acostumbrado a trabajar con otros husos horarios'],
  ['<p class="kicker">Toolkit</p>', '<p class="kicker">Herramientas</p>'],
  ['Also: Blender (3D), WordPress, Elementor, HTML/CSS', 'También: Blender (3D), WordPress, Elementor, HTML/CSS'],
  ['“Rubén is a very talented and creative designer. He masters every Adobe tool. He takes initiative and is very responsible. The results always exceeded expectations.”', '“Rubén es un diseñador muy talentoso y creativo. Maneja todas las herramientas de Adobe a la perfección. Tiene iniciativa y es muy responsable. Los resultados siempre superaban la expectativa.”'],
  ['Victor Trejo · Managing Director, Victorem<em>Translated from the Spanish original</em>', 'Victor Trejo · Director General, Victorem'],

  // Contacto
  ['Clubs, agencies, representatives and players', 'Clubes, agencias, representantes y jugadores'],
  ['Studios, agencies and brands', 'Estudios, agencias y marcas'],
  ['Let’s work<br>together', 'Trabajemos<br>juntos'],
  ['Available for projects, white-label support and remote roles.', 'Disponible para proyectos, soporte de marca blanca y puestos remotos.'],
];

const ORDEN = [...PARES].sort((a, b) => b[0].length - a[0].length);
const MAPA = new Map(ORDEN);
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const RE = new RegExp(ORDEN.map(([en]) => escRe(en)).join('|'), 'g');

// Traduce el HTML de una página y manda las ligas del sitio a las páginas en
// español (/en/ -> /, /casos/x/en/ -> /casos/x/).
function traducir(html) {
  return html
    .replace(RE, (m) => MAPA.get(m))
    .replace(/\bMatchday (\d+)/g, 'Jornada $1')
    .replace(/(notmanrivera\.com(?:\/casos\/[a-z0-9-]+)?)\/en\//g, '$1/')
    .replace(/notmanrivera\.com\/en(?=<)/g, 'notmanrivera.com');
}

module.exports = { traducir, PARES };

#!/usr/bin/env python3
"""Genera public/casos/notman/ (es) y public/casos/notman/en/ (en).

Es la versión corta del manual de identidad (scripts/portafolio-pdf/manual.js,
que es solo para Rubén): historia del nombre, inspiración, construcción,
versiones, movimiento y dónde vive el logo.

Toma el <head>/<style> de un caso existente (hugo-gonzalez) para que la página
se vea igual que los demás casos, y le suma los estilos propios de este. Las
rutas del logo salen de fuente/logo-vector.svg, igual que el trazo del hero.

Se corre a mano cuando cambia algo:  python3 scripts/caso-notman.py
"""
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
PUB = RAIZ / 'public'
BASE = (PUB / 'casos' / 'hugo-gonzalez' / 'index.html').read_text(encoding='utf-8')

# Estilos de los casos (todo lo que hay dentro de <style>) y el script de GA4.
ESTILOS = BASE[BASE.index('<style>') + len('<style>'):BASE.index('</style>')]
GTAG = BASE[BASE.index('<!-- Google tag'):BASE.index('<meta charset')]
def _aside(html):
    return html[html.index('<aside class="flotantes"'):html.index('</aside>') + len('</aside>')]


# El botón de WhatsApp lleva su texto y su mensaje en el idioma de la página.
WHATSAPP = {'es': _aside(BASE), 'en': _aside((PUB / 'casos' / 'hugo-gonzalez' / 'en' / 'index.html').read_text(encoding='utf-8'))}

RUTAS = {m.group(1): m.group(0) for m in re.finditer(r'<path id="([^"]+)"[^>]*/>', (RAIZ / 'fuente' / 'logo-vector.svg').read_text())}
ORDEN = ['T', 'H', 'E', 'N', 'O', 'T1', 'M', 'A', 'N1']  # orden de lectura
CAJA = 'viewBox="0 0 945 520"'


def logo(relleno='none', trazo='none', grosor=0, clase='', tonos=None):
    rutas = []
    for i, k in enumerate(ORDEN):
        r = re.sub(r'\s(class|style|fill|stroke)="[^"]*"', '', RUTAS[k]).replace(f' id="{k}"', '')
        if tonos:
            r = r.replace('<path', f'<path fill="{tonos[i]}" stroke="#000" stroke-width="2" style="--i:{i}"')
        rutas.append(r)
    g = '' if tonos else f' fill="{relleno}" stroke="{trazo}" stroke-width="{grosor}"'
    return f'<svg class="{clase}" {CAJA} aria-hidden="true" focusable="false"><g{g}>{"".join(rutas)}</g></svg>'


TONOS = ['#FFFFFF', '#CFCFCF', '#9E9E9E', '#E6E6E6', '#B3B3B3', '#808080', '#D9D9D9', '#A6A6A6', '#737373']
CROMO = 'linear-gradient(180deg,#9FA3B9,#D5D9F4,#E1E5FC,#ACAFC6,#9FA3B9)'
THANOS = 'linear-gradient(180deg,#4E88EA,#596BEA,#936AF1,#DD95F7,#F5A0F9)'

CSS = """
  /* ===== CASO NOTMAN =====
     Versión corta del manual de identidad. Lo propio de este caso: el logo
     grande con su brillo violeta, la línea del tiempo, las tres tarjetas de
     inspiración, el logo por letras, las versiones y el trazo animado. */
  .logo-hero{padding-bottom:40px}
  .logo-hero figure{position:relative;padding:28px 0}
  .logo-hero figure::before{
    content:"";position:absolute;inset:8% 10%;z-index:-1;
    background:radial-gradient(ellipse at center,rgba(139,63,255,.42),transparent 68%);
  }
  .logo-hero img{display:block;width:100%;max-width:760px;height:auto;margin:0 auto}
  .tiempo{list-style:none;margin:6px 0 34px;padding:0 0 0 22px;border-left:2px solid var(--violet);max-width:66ch}
  .tiempo li{position:relative;margin-bottom:16px;color:#e8e2f2}
  .tiempo li::before{
    content:"";position:absolute;left:-29px;top:.45em;width:11px;height:11px;
    background:var(--rojo);transform:rotate(45deg);
  }
  .tiempo b{
    display:block;font-family:var(--ui);font-weight:900;text-transform:uppercase;
    font-size:.72rem;letter-spacing:.12em;color:#fff;
  }
  .tarjetas{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:4px 0 38px}
  .tarjeta{border:1px solid var(--line);background:var(--ink-2);padding:14px}
  .tarjeta .muestra{height:120px;border:1px solid var(--line);margin-bottom:12px;display:flex;align-items:center;justify-content:center;background:#000;position:relative}
  .tarjeta .muestra svg{width:82%;height:auto}
  .tarjeta .arco{position:absolute;left:8%;right:8%;bottom:10px;height:30px;border-top:3px dashed var(--rojo);border-radius:50% 50% 0 0}
  .tarjeta h3{font-family:var(--ui);font-weight:900;text-transform:uppercase;font-size:.72rem;letter-spacing:.12em;margin-bottom:6px}
  .tarjeta p{font-size:.92rem;color:#d9d2e8;margin:0}
  .letras{margin:6px 0 14px}
  .letras svg{display:block;width:100%;max-width:720px;height:auto}
  .leyenda{display:flex;flex-wrap:wrap;gap:10px;margin:0 0 26px;padding:0;list-style:none}
  .leyenda li{display:flex;align-items:center;gap:5px;font-family:var(--ui);font-weight:900;font-size:.7rem}
  .leyenda i{width:13px;height:13px;display:inline-block}
  .versiones{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:6px 0 38px}
  .versiones figure{margin:0}
  .versiones .caja{height:120px;display:flex;align-items:center;justify-content:center;padding:14px;border:1px solid var(--line)}
  .versiones .caja img,.versiones .caja svg{width:100%;height:auto}
  .versiones figcaption{margin-top:8px;font-family:var(--ui);font-weight:300;text-transform:uppercase;font-size:.62rem;letter-spacing:.08em;color:var(--muted)}
  .c-negro{background:#000}.c-oscuro{background:#0b0416}.c-violeta{background:#4A1391}.c-blanco{background:#fff}
  /* El trazo se dibuja una vez cuando entra a la pantalla (clase .ve, la pone
     el script de abajo). Sin JS o con movimiento reducido se ve completo. */
  .trazo-caso{margin:6px 0 10px;max-width:720px}
  .trazo-caso svg{display:block;width:100%;height:auto}
  .trazo-caso path{fill:none;stroke:var(--violet-hi);stroke-width:2.4;stroke-linecap:round}
  .js .trazo-caso path{stroke-dasharray:1;stroke-dashoffset:1}
  .js .trazo-caso.ve path{animation:dibuja 1.6s cubic-bezier(.5,0,.2,1) forwards}
  @keyframes dibuja{to{stroke-dashoffset:0}}
  .usos{display:grid;grid-template-columns:1.4fr 1fr;gap:14px;margin:6px 0 10px}
  .usos figure{margin:0}
  .usos img{display:block;width:100%;height:auto;border:1px solid var(--line)}
  .usos figcaption{margin-top:8px;font-family:var(--ui);font-weight:300;text-transform:uppercase;font-size:.62rem;letter-spacing:.08em;color:var(--muted)}
  @media(max-width:700px){
    .tarjetas,.usos{grid-template-columns:1fr}
    .versiones{grid-template-columns:1fr 1fr}
  }

  /* ===== ANIMACION =====
     Solo transform y opacity (salvo el trazo, que ya corre una sola vez).
     Todo arranca visible sin JS: los estados iniciales cuelgan de .js, que
     pone el <head>. .ve la pone el IntersectionObserver del final. */

  /* Entrada del logo y un destello que lo recorre cada tantos segundos. El
     destello vive en .brillo, recortado con la silueta del propio logo
     (mask), asi que solo brilla el cromo y no el fondo. */
  .logo-hero .marco{position:relative;max-width:760px;margin:0 auto}
  .logo-hero .marco img{animation:entraLogo 1.1s cubic-bezier(.2,.8,.2,1) both}
  @keyframes entraLogo{from{opacity:0;transform:scale(.88) translateY(18px)}}
  .brillo{position:absolute;inset:0;overflow:hidden;pointer-events:none;
    -webkit-mask:url(/assets/logo-lg.webp) center/100% 100% no-repeat;mask:url(/assets/logo-lg.webp) center/100% 100% no-repeat}
  .brillo::before{content:"";position:absolute;top:-10%;bottom:-10%;left:-45%;width:32%;
    background:linear-gradient(100deg,transparent,rgba(255,255,255,.9),transparent);
    transform:translateX(0) skewX(-16deg);animation:barre 6s ease-in-out 1.2s infinite}
  @keyframes barre{0%{transform:translateX(0) skewX(-16deg)}30%,100%{transform:translateX(520%) skewX(-16deg)}}
  .logo-hero figure::before{animation:respiraGlow 5s ease-in-out infinite}
  @keyframes respiraGlow{50%{opacity:.6}}

  /* Aparecer al hacer scroll, escalonado con --i. */
  .js .rv{opacity:0;transform:translateY(26px)}
  .js .rv.ve{opacity:1;transform:none;transition:opacity .7s ease,transform .7s cubic-bezier(.2,.8,.2,1);
    transition-delay:calc(var(--i,0) * 110ms)}
  .tiempo li.ve::before{animation:rombo .5s cubic-bezier(.2,.9,.3,1.6) both;animation-delay:calc(var(--i,0) * 110ms + .2s)}
  @keyframes rombo{from{transform:rotate(45deg) scale(0)}}

  /* Las letras se encienden una por una en orden de lectura, se quedan un
     momento y se apagan juntas en ola; en loop. Solo opacidad: sin
     deslizamiento. Arranca cuando el bloque entra a la pantalla (.ve). */
  .js .letras path{opacity:.12}
  .js .letras.ve path{animation:enciende 5.4s ease-in-out infinite;animation-delay:calc(var(--i) * 180ms)}
  @keyframes enciende{0%{opacity:.12}14%{opacity:1}68%{opacity:1}86%{opacity:.12}100%{opacity:.12}}

  /* Brillo lento sobre las muestras de cromo y degradado. */
  .muestra.brilla{overflow:hidden}
  .muestra.brilla::after{content:"";position:absolute;top:0;bottom:0;left:-50%;width:40%;
    background:linear-gradient(100deg,transparent,rgba(255,255,255,.55),transparent);
    transform:translateX(0) skewX(-16deg);animation:barre 4.5s ease-in-out infinite}
  .tarjeta:nth-child(3) .muestra.brilla::after{animation-delay:1.4s}

  .versiones .caja{transition:transform .25s cubic-bezier(.2,.8,.2,1)}
  .versiones figure:hover .caja{transform:translateY(-6px) rotate(-1.5deg)}

  @media(prefers-reduced-motion:reduce){
    .js .trazo-caso path{stroke-dasharray:none;animation:none}
    .logo-hero .marco img,.brillo::before,.logo-hero figure::before,.muestra.brilla::after,.tiempo li.ve::before{animation:none}
    .js .rv,.js .letras path,.js .letras.ve path{opacity:1;transform:none;transition:none;animation:none}
  }
"""

T = {
    'es': {
        'lang': 'es', 'url': 'https://notmanrivera.com/casos/notman/', 'otro': '/casos/notman/en/', 'otro_txt': 'EN',
        'locale': 'es_MX',
        'title': 'NotMan: un logo hecho de cómics — lettering personal | NotMan Rivera',
        'og': 'NotMan: un logo hecho de cómics',
        'desc': 'El logo de NotMan, proyecto personal de lettering de Rubén Rivera: de dónde viene el nombre, la inspiración en los cómics (Silver Surfer y Thanos), cómo está construido y dónde vive.',
        'volver': '← Ver todo el trabajo', 'volver_href': '/#trabajo',
        'kicker': 'Proyecto personal · Lettering',
        'h1': 'NotMan: un logo hecho de cómics',
        'dek': 'Mi propia marca, dibujada letra por letra. Dice THE NOTMAN: nueve letras trabadas en un solo bloque que se sienta sobre una curva, con el acabado cromado de Silver Surfer.',
        'alt_logo': 'Logo de NotMan: THE NOTMAN en lettering cromado',
        'rol_t': 'Mi rol',
        'rol': 'Todo: concepto, bocetos a lápiz, lettering, vectorización y acabado. Es un proyecto personal, sin cliente: el logo con el que firmo mi trabajo.',
        'h_nombre': 'El nombre llegó antes que el logo',
        'tiempo': [
            ('En la prepa', 'Era fanático de Anthrax, y la mascota de la banda se llama NotMan.'),
            ('En Facebook', 'Me puse “NotMan” de apellido y la gente me empezó a ubicar así.'),
            ('En mi trabajo', 'Empecé a firmar mis piezas como NotMan.'),
            ('Por ahí de 2020', 'Le agregué “The”, como se llaman los personajes de cómics, y dibujé el logo.'),
        ],
        'h_insp': 'Todo sale de los cómics',
        'p_insp': 'Del nombre para adelante, cada decisión visual viene de los cómics, de los que soy muy fan.',
        'cards': [
            ('La forma', 'Bocetos a lápiz buscando una palabra que se sentara sobre una curva, como los logos retro de Silver Surfer.'),
            ('El cromo', 'El acabado principal viene directo de Silver Surfer: metálico, frío, con la luz en el centro.'),
            ('El degradado', 'La versión secundaria está basada en Thanos y en mi color favorito: ese tono de morado.'),
        ],
        'h_const': 'Nueve letras, un solo bloque',
        'p_const': [
            '<strong>THE</strong> va apilado a la izquierda, dentro del espacio de la T grande; <strong>NOTMAN</strong> corre abajo y a la derecha.',
            'El travesaño de la T barre toda la palabra: es el techo del logo y su gesto más reconocible. Cada letra es una forma propia, pero los huecos entre ellas son angostos y parejos, así que la palabra se lee como una sola pieza.',
        ],
        'h_vers': 'Versiones',
        'vers': ['Principal · cromo', 'Secundaria · degradado Thanos', 'Una tinta · blanco', 'Una tinta · negro'],
        'h_mov': 'El logo se dibuja solo',
        'p_mov': 'En la portada de mi sitio, las nueve letras se trazan en violeta, una por una, antes de que aparezca el cromo. Es el único efecto que un logo en imagen no puede dar: necesita la geometría real de cada letra.',
        'h_usos': 'Dónde vive',
        'p_usos': 'De este logo sale toda mi identidad: la paleta negro, violeta y rojo, el sitio, la firma de correo, el portafolio en PDF y mi foto de perfil.',
        'usos': ['notmanrivera.com', 'Portafolio en PDF'],
        'otros': 'Otros casos',
        'casos': [('/casos/al-arabi-sc/', 'Al-Arabi SC', 'Motion graphics de matchday'), ('/casos/hugo-gonzalez/', 'Hugo González', 'Branding deportivo'), ('/casos/futbol-femenil/', 'Fútbol femenil', 'Carreras seguidas, no campañas'), ('/casos/diseno-web/', 'Diseño web', 'Seis industrias, un estándar')],
        'cta': '¿Necesitas una identidad con personalidad? Hablemos', 'cta_href': '/#contacto',
        'pie': 'NotMan Rivera — Motion graphics, video y diseño web', 'privacidad': 'Aviso de privacidad',
    },
    'en': {
        'lang': 'en', 'url': 'https://notmanrivera.com/casos/notman/en/', 'otro': '/casos/notman/', 'otro_txt': 'ES',
        'locale': 'en_US',
        'title': 'NotMan: a logo made of comics — personal lettering | NotMan Rivera',
        'og': 'NotMan: a logo made of comics',
        'desc': 'The NotMan logo, a personal lettering project by Rubén Rivera: where the name comes from, the comic book inspiration (Silver Surfer and Thanos), how it is built and where it lives.',
        'volver': '← See all work', 'volver_href': '/en/#trabajo',
        'kicker': 'Personal project · Lettering',
        'h1': 'NotMan: a logo made of comics',
        'dek': 'My own mark, drawn letter by letter. It reads THE NOTMAN: nine letters locked into a single block that sits on a curve, with a Silver Surfer chrome finish.',
        'alt_logo': 'NotMan logo: THE NOTMAN in chrome lettering',
        'rol_t': 'My role',
        'rol': 'Everything: concept, pencil sketches, lettering, vectorizing and finish. A personal project with no client: the mark I sign my work with.',
        'h_nombre': 'The name came before the logo',
        'tiempo': [
            ('High school', 'I was obsessed with Anthrax, and the band’s mascot is called the Not Man.'),
            ('Facebook', 'I set “NotMan” as my last name, and people started calling me that.'),
            ('My work', 'I started signing my pieces as NotMan.'),
            ('Around 2020', 'I added “The”, the way comic book characters are named, and drew the logo.'),
        ],
        'h_insp': 'It all comes from comics',
        'p_insp': 'From the name on, every visual decision comes from comic books. I’m a huge fan.',
        'cards': [
            ('The shape', 'Pencil sketches looking for a word that sits on a curve, like the retro Silver Surfer mastheads.'),
            ('The chrome', 'The primary finish comes straight from the Silver Surfer: metallic, cold, lit from the middle.'),
            ('The gradient', 'The secondary version is based on Thanos and on my favorite color: that exact shade of purple.'),
        ],
        'h_const': 'Nine letters, one block',
        'p_const': [
            '<strong>THE</strong> is stacked on the left, inside the space of the big T; <strong>NOTMAN</strong> runs underneath and to the right.',
            'The T’s crossbar sweeps over the whole word: it is the roof of the mark and its most recognizable gesture. Each letter is its own shape, but the gaps between them are narrow and even, so the word reads as a single piece.',
        ],
        'h_vers': 'Versions',
        'vers': ['Primary · chrome', 'Secondary · Thanos gradient', 'One color · white', 'One color · black'],
        'h_mov': 'The logo draws itself',
        'p_mov': 'On my site’s home page, the nine letters are traced in violet, one by one, before the chrome appears. It is the one effect a logo image can’t do: it needs the real geometry of every letter.',
        'h_usos': 'Where it lives',
        'p_usos': 'My whole identity grows from this logo: the black, violet and red palette, the website, the email signature, the PDF portfolio and my profile picture.',
        'usos': ['notmanrivera.com', 'PDF portfolio'],
        'otros': 'More case studies',
        'casos': [('/casos/al-arabi-sc/en/', 'Al-Arabi SC', 'Matchday motion graphics'), ('/casos/hugo-gonzalez/en/', 'Hugo González', 'Sports branding'), ('/casos/futbol-femenil/en/', 'Women’s football', 'Careers followed, not campaigns'), ('/casos/diseno-web/en/', 'Web design', 'Six industries, one standard')],
        'cta': 'Need an identity with personality? Let’s talk', 'cta_href': '/en/#contacto',
        'pie': 'NotMan Rivera — Motion graphics, video and web design', 'privacidad': 'Privacy notice',
    },
}


def pagina(t):
    tiempo = ''.join(f'<li class="rv" style="--i:{i}"><b>{a}</b>{b}</li>' for i, (a, b) in enumerate(t['tiempo']))
    muestras = [
        f'<div class="muestra">{logo(trazo="#A96BFF", grosor=3)}<span class="arco"></span></div>',
        f'<div class="muestra brilla" style="background:{CROMO}"></div>',
        f'<div class="muestra brilla" style="background:{THANOS}"></div>',
    ]
    tarjetas = ''.join(f'<div class="tarjeta rv" style="--i:{i}">{m}<h3>{h}</h3><p>{p}</p></div>' for i, (m, (h, p)) in enumerate(zip(muestras, t['cards'])))
    leyenda = ''.join(f'<li><i style="background:{c}"></i>{k[0]}</li>' for k, c in zip(ORDEN, TONOS))
    cajas = [
        ('c-negro', '<img src="/assets/logo-lg-480.webp" alt="" width="480" height="270" loading="lazy">'),
        ('c-oscuro', '<img src="/assets/logo-morado.webp" alt="" width="1200" height="675" loading="lazy">'),
        ('c-violeta', logo(relleno='#fff')),
        ('c-blanco', logo(relleno='#000')),
    ]
    versiones = ''.join(f'<figure class="rv" style="--i:{i}"><div class="caja {c}">{x}</div><figcaption>{n}</figcaption></figure>' for i, ((c, x), n) in enumerate(zip(cajas, t['vers'])))
    otros = ''.join(f'<li><a href="{h}">{n}<span>{s}</span></a></li>' for h, n, s in t['casos'])
    p_const = ''.join(f'<p>{p}</p>' for p in t['p_const'])
    return f'''<!doctype html>
<html lang="{t["lang"]}">
<head>
{GTAG}<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{t["title"]}</title>
<meta name="description" content="{t["desc"]}">

<meta property="og:title" content="{t["og"]}">
<meta property="og:description" content="{t["desc"]}">
<meta property="og:type" content="article">
<meta property="og:url" content="{t["url"]}">
<meta property="og:image" content="https://notmanrivera.com/assets/og-caso-notman.jpg">
<meta property="og:locale" content="{t["locale"]}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{t["og"]}">
<meta name="twitter:description" content="{t["desc"]}">
<meta name="twitter:image" content="https://notmanrivera.com/assets/og-caso-notman.jpg">
<link rel="canonical" href="{t["url"]}">
<link rel="alternate" hreflang="es" href="https://notmanrivera.com/casos/notman/">
<link rel="alternate" hreflang="en" href="https://notmanrivera.com/casos/notman/en/">
<link rel="alternate" hreflang="x-default" href="https://notmanrivera.com/casos/notman/">
<link rel="icon" type="image/png" href="/assets/favicon.png">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<meta name="theme-color" content="#000000">

<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  "name": "{t["og"]}",
  "url": "{t["url"]}",
  "inLanguage": "{t["lang"]}",
  "image": "https://notmanrivera.com/assets/og-caso-notman.jpg",
  "about": "{t["desc"]}",
  "creator": {{
    "@type": "Person",
    "name": "Rubén Núñez Rivera",
    "alternateName": "NotMan Rivera",
    "url": "https://notmanrivera.com/"
  }}
}}
</script>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
<link rel="preload" href="/assets/kenyan-coffee.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/monument-black.woff2" as="font" type="font/woff2" crossorigin>

<style>{ESTILOS}{CSS}</style>
<script>document.documentElement.classList.add('js')</script>
</head>
<body>

<header>
  <div class="wrap">
    <a class="marca-link" href="{"/" if t["lang"] == "es" else "/en/"}" aria-label="NotMan Rivera">
      <img src="/assets/logo.webp" alt="NotMan" width="120" height="67">
    </a>
    <nav class="header-links">
      <a class="idioma" href="{t["otro"]}">{t["otro_txt"]}</a>
      <a class="volver" href="{t["volver_href"]}">{t["volver"]}</a>
    </nav>
  </div>
</header>

<main>
  <section class="caso-hero wrap">
    <span class="num-caso" aria-hidden="true">05</span>
    <span class="kicker">{t["kicker"]}</span>
    <h1>{t["h1"]}</h1>
    <p class="dek">{t["dek"]}</p>
  </section>

  <section class="logo-hero wrap">
    <figure><div class="marco"><img src="/assets/logo-lg.webp" alt="{t["alt_logo"]}" width="1200" height="675"><span class="brillo" aria-hidden="true"></span></div></figure>
  </section>

  <section class="caso-cuerpo wrap">
    <div class="caso-rol rv">
      <h2>{t["rol_t"]}</h2>
      <p>{t["rol"]}</p>
    </div>

    <h2 class="rv">{t["h_nombre"]}</h2>
    <ol class="tiempo">{tiempo}</ol>

    <h2 class="rv">{t["h_insp"]}</h2>
    <p>{t["p_insp"]}</p>
    <div class="tarjetas">{tarjetas}</div>

    <h2 class="rv">{t["h_const"]}</h2>
    <div class="letras">{logo(tonos=TONOS)}</div>
    <ul class="leyenda" aria-hidden="true">{leyenda}</ul>
    {p_const}

    <h2 class="rv" style="margin-top:34px">{t["h_vers"]}</h2>
    <div class="versiones">{versiones}</div>

    <h2 class="rv">{t["h_mov"]}</h2>
    <div class="trazo-caso">{logo(clase="trazo-svg").replace("<path", '<path pathLength="1"')}</div>
    <p>{t["p_mov"]}</p>

    <h2 class="rv" style="margin-top:34px">{t["h_usos"]}</h2>
    <p>{t["p_usos"]}</p>
    <div class="usos">
      <figure class="rv"><img src="/assets/caso-notman/sitio.webp" alt="" width="1200" height="750" loading="lazy"><figcaption>{t["usos"][0]}</figcaption></figure>
      <figure class="rv" style="--i:1"><img src="/assets/caso-notman/portafolio.webp" alt="" width="900" height="506" loading="lazy"><figcaption>{t["usos"][1]}</figcaption></figure>
    </div>
  </section>

  <section class="casos-otros wrap">
    <h2>{t["otros"]}</h2>
    <ul>{otros}</ul>
  </section>

  <section class="caso-cta wrap">
    <a class="btn" href="{t["cta_href"]}">{t["cta"]}</a>
  </section>
</main>

<footer>
  <div class="wrap">
    <span>{t["pie"]}</span>
    <span><a href="/">notmanrivera.com</a> · <a href="/aviso-de-privacidad/">{t["privacidad"]}</a></span>
  </div>
</footer>

{WHATSAPP[t["lang"]]}

<script>
/* Pone .ve a cada bloque animado cuando entra a la pantalla, una sola vez:
   aparecer (.rv), armar las letras (.letras) y dibujar el trazo. */
(function(){{
  var els = document.querySelectorAll('.rv, .letras, .trazo-caso');
  if (!('IntersectionObserver' in window)) {{ els.forEach(function(el){{ el.classList.add('ve'); }}); return; }}
  var io = new IntersectionObserver(function(es){{
    es.forEach(function(e){{ if (e.isIntersecting) {{ e.target.classList.add('ve'); io.unobserve(e.target); }} }});
  }}, {{threshold: .25, rootMargin: '0px 0px -8% 0px'}});
  els.forEach(function(el){{ io.observe(el); }});
}})();
</script>
<script src="/assets/proteccion-v1.js" defer></script>
</body>
</html>
'''


for clave, ruta in (('es', PUB / 'casos' / 'notman' / 'index.html'), ('en', PUB / 'casos' / 'notman' / 'en' / 'index.html')):
    ruta.parent.mkdir(parents=True, exist_ok=True)
    ruta.write_text(pagina(T[clave]), encoding='utf-8')
    print('OK:', ruta.relative_to(RAIZ))

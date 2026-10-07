# Mapa del sistema

Qué hace cada pieza, con qué cuenta se abre y qué hacer cuando algo falla.

**Regla de oro:** todo lo de prospección se abre con **hola@notmanrivera.com**,
nunca con rnrivera93@gmail.com. Lo ideal es un perfil de Chrome solo para hola@.

## El día, hora por hora (Querétaro)

| Hora | Qué pasa | Quién |
|---|---|---|
| 7:00 | Se actualiza la pestaña **Analytics**; si alguien leyó tu sitio ayer desde un correo, te llega **"Lead caliente"** | Script *Analytics notmanrivera.com* |
| 7:45 | La **rutina** revisa la bandeja, agrega prospectos verificados, corrige reseñas y te manda el resumen | Rutina de Claude "Prospección diaria NotMan" (lunes a viernes) |
| ≈8:15 | Te llega **"Por aprobar hoy"** con el botón a la página de aprobar (prospectos, seguimientos y posts de LinkedIn; martes y jueves, también el post que toca publicar) | Script *Reseñas notmanrivera.com* |
| 9:00 | Salen los primeros correos (solo filas con "sí" y Verificación `safe`) | Apps Script de la hoja |
| 11:00 | Se generan seguimientos y últimos toques, dentro del hilo original | Apps Script de la hoja |
| 1:00 pm | Segundo envío de primeros correos: lo que aprobaste después de las 9 (tope de 10 al día entre los dos) | Apps Script de la hoja |
| ≈2:30 pm | **Revisión de salud**: solo te escribe si algo falló (y los lunes, "todo en orden") | Script *Reseñas notmanrivera.com* |
| 4:47 pm | Se mandan esos seguimientos | Apps Script de la hoja |
| Cada 2 h | Las reseñas con "sí" se publican en la portada | GitHub Action `resenas.yml` |
| Lunes 6:07 | Se prueba que la credencial de clasp siga viva | GitHub Action `salud.yml` |

## Las piezas

### Hoja "Prospección deportiva"
Dueña: rnrivera93@gmail.com (hola@ es editora). Pestañas:

- **Prospectos**: cada prospecto y su correo. Columna Aprobado: "sí" / "no".
  Columnas Q y R: el **seguimiento personalizado** que escribe la rutina y tu
  aprobación. Aprobado antes de las 11, sale a las 4:47 en vez de la
  plantilla; si no decides en 3 días, sale la plantilla.
- **Pipeline**: tratos en curso. Ganado / Perdido y Valor estimado solo los cambias tú.
  La columna **Origen** dice de dónde salió cada trato (segmento y fila); con
  ella el reporte de los lunes calcula cuánto dinero trae cada segmento. Cuando
  un trato pasa a Ganado, la rutina crea su invitación de reseña.
- **Invitaciones** y **Reseñas**: reseñas de clientes (ver abajo).
- **Analytics**: de solo lectura, se reescribe a las 7 am.
- **LinkedIn**: un post por fila (Publicar el, Idioma, Tema, Texto, Medio,
  Aprobado, Estado, Notas). Los escribe la rutina de los lunes para el martes
  (español) y el jueves (inglés).
- **Medios LinkedIn**: los clips e imágenes del sitio que se pueden usar, con
  qué muestra cada uno y en qué post ya salió.
- **Bitácora**.

⚠️ El acceso general debe ser **Restringido** (Compartir → Acceso general).
"Cualquiera con el enlace puede editar" deja que cualquiera apruebe envíos.

### Proyectos de Apps Script (tres)
Los tres se suben solos desde este repo con GitHub Actions; lo que edites a
mano en el editor se pierde en la siguiente subida.

| Proyecto | Carpeta | Dueño | Qué hace |
|---|---|---|---|
| Apps Script de la hoja | `scripts/apps-script/` | rnrivera93 (dentro de la hoja) | Envío de las 9, seguimientos, rebotes, menú Prospección (incluye "Nueva invitación de reseña") |
| Reseñas notmanrivera.com | `scripts/resenas-webapp/` | hola@ | Web app pública: formulario de reseñas, página de aprobar, correo "Por aprobar", revisión de salud, filtros de Gmail |
| Analytics notmanrivera.com | `scripts/analytics/` | hola@ | GA4 → pestaña Analytics y avisos de lead caliente |

Por qué hay proyectos aparte: la hoja es de rnrivera93 y Google no deja que
hola@ publique una web app en un proyecto ajeno.

### Páginas privadas del sitio
- `notmanrivera.com/resena/?c=<código>`: formulario de reseñas por invitación.
- `notmanrivera.com/aprobar/#t=<token>`: aprobar o descartar prospectos. La
  liga llega en el correo de la mañana y vale ese día y el siguiente.

### GitHub Actions (`.github/workflows/`)
| Archivo | Cuándo | Qué hace |
|---|---|---|
| `deploy.yml` | cada push a main | Publica el sitio en Cloudflare Pages |
| `apps-script.yml` | cambios en `scripts/apps-script/` | Sube el Apps Script de la hoja |
| `resenas-webapp.yml` | cambios en `scripts/resenas-webapp/` | Sube y redespliega la web app (la URL no cambia) |
| `analytics.yml` | cambios en `scripts/analytics/` | Sube el script de Analytics |
| `resenas.yml` | cada 2 h | Publica las reseñas aprobadas |
| `salud.yml` | lunes | Prueba la credencial de clasp |

### Rutina diaria de Claude
"Prospección diaria NotMan", lunes a viernes 7:45. Nunca manda correos ni
pone "sí": solo deja borradores, agrega filas y te resume. Conectores: Gmail,
Sheets, Drive y Calendar de hola@.

## LinkedIn, paso a paso
1. El lunes, la rutina escribe dos posts en la pestaña LinkedIn, con un clip o
   imagen de la pestaña Medios LinkedIn. Todo sale de los casos del sitio: no
   inventa anécdotas ni números.
2. Te llegan en "Por aprobar hoy". En la página de aprobar ves el video y el
   texto; Aprobar o Descartar.
3. El martes y el jueves, el post aprobado vuelve a llegar como "Publicar hoy":
   **Copiar texto**, **Abrir el video** (en el iPhone: compartir → Guardar
   video), publícalo en LinkedIn y toca **Ya lo publiqué**.
4. Publicar es manual a propósito: la API de LinkedIn pide renovar el permiso
   cada 60 días y subir video por ahí es frágil.

Los clips viven en `public/assets/video/` y las imágenes, ya en JPG (LinkedIn no
siempre acepta WebP), en `public/assets/linkedin/`. Las de "calidad baja" son
miniaturas de 440 px: solo sirven en carrusel; si un post las necesita grandes,
hay que subir el original.

## Correos en inglés

EE. UU. (CAN-SPAM) y Canadá (CASL) exigen una dirección postal en el correo
comercial. Va en `CONFIG.DIRECCION_POSTAL` de `scripts/apps-script/Código.gs`:
se agrega sola al pie de los correos en inglés. Mientras esté vacía no sale.

## Reseñas, paso a paso
1. Menú Prospección → **Nueva invitación de reseña** → copias la liga y se la mandas al cliente.
2. Lo que escribe llega a la pestaña Reseñas y te avisa por correo.
3. La rutina propone la corrección de estilo (columna Texto corregido).
4. Pones "sí" en Aprobada → en menos de 2 h está en la portada.

## Cuando algo falla

**La credencial de clasp caducó** (`invalid_grant` o `invalid_rapt` en una Action):
1. En la MacBook: `clasp logout && clasp login` con hola@.
2. `cat ~/.clasprc.json | pbcopy`
3. GitHub → repo → Settings → Secrets and variables → Actions → `CLASPRC_JSON` → Update.
4. Si vuelve a pasar en días, revisa en admin.google.com: Seguridad → Control
   de acceso y datos → Control de sesión de Google Cloud → "No requerir reautenticación".

**El formulario de reseñas o la página de aprobar dicen "no se pudo conectar"**:
casi siempre faltan permisos tras un cambio. Abre el proyecto *Reseñas
notmanrivera.com* con hola@, corre `instalarAutomatizaciones` y acepta.

**No salieron los correos de las 9**: menú Prospección → Instalar envío diario
(con hola@). Revisa que las filas tengan "sí" y Verificación `safe`.

**La pestaña Analytics no se actualizó**: abre *Analytics notmanrivera.com* con
hola@ y corre `instalar`.

**Correos que salieron desde rnrivera93**: alguien corrió el menú con la cuenta
personal. Ciérralo y vuelve a abrir la hoja con hola@.

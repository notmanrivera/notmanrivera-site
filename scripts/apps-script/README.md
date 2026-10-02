# Apps Script de prospección

Código del proyecto de Apps Script ligado a la hoja **Prospección deportiva**.
Esta carpeta es la fuente oficial: lo que se edite a mano en el editor de
Apps Script se pierde en el siguiente `clasp push`.

| Archivo | Qué hace |
|---|---|
| `Código.gs` | Configuración, envío del primer correo (`procesarPendientes`, 9 am), UTM, menú |
| `Seguimientos.gs` | Seguimiento dentro de la conversación original (11 am genera, 4:47 pm manda) |
| `Rebotes.gs` | Marca rebotes en la hoja (a mano, desde el menú) |
| `Verificar.gs` | Revisa que el dominio de filas agregadas a mano reciba correo |
| `Resenas.gs` | Web app del formulario de reseñas (`/resena/`): recibe, guarda en la pestaña Reseñas y entrega las aprobadas al sitio |
| `appsscript.json` | Manifiesto: zona horaria, servicio avanzado de Gmail (lo usa `Seguimientos.gs`) y acceso público de la web app |

Las filas nuevas las agrega una rutina diaria de Claude (7:45 am) con
Verificación `safe`. `procesarPendientes` solo manda filas aprobadas **y** `safe`.

## Cómo se sube

**Solo.** Cada push a `main` que toque esta carpeta corre
`.github/workflows/apps-script.yml`: revisa la sintaxis de los 4 archivos
juntos y hace `clasp push`. Necesita el secreto `CLASPRC_JSON` en GitHub
(contenido de `~/.clasprc.json` después de `clasp login` con hola@).

Si cambió `Resenas.gs` o el manifiesto, la misma Action vuelve a desplegar la
web app sobre el despliegue "Reseñas web" (la URL `/exec` no cambia).

`clasp push` **reemplaza todo el proyecto** con lo que hay en esta carpeta: un
archivo que exista en el editor y no aquí se borra. Los triggers y las
propiedades del proyecto no se tocan.

A mano, solo si la automatización falla (desde la Mac, con hola@):

```
cd /Users/rubenrivera/Desktop/notmanrivera-site && git pull && cd scripts/apps-script && clasp push
```

## Aprobación

Hoy cada fila necesita "sí" en Aprobado para salir.

`APROBACION_AUTOMATICA` (Código.gs) existe pero está **apagada**: con `true`,
las filas que agrega la rutina con Verificación `safe` saldrían a las 9 am sin
"sí", y "no" las frenaría. Encenderla es decisión de Rubén; si se enciende,
también hay que cambiar las instrucciones de la rutina, que hoy asumen que él
aprueba cada fila.

## Reseñas

1. Menú Prospección → **Nueva invitación de reseña**: da la liga personal
   (`notmanrivera.com/resena/?c=<código>`) para mandársela al cliente.
2. Lo que escribe llega a la pestaña **Reseñas** tal cual, y un aviso a hola@.
3. La rutina diaria propone en "Texto corregido" solo ajustes de estilo.
4. "sí" en Aprobada → la Action `resenas.yml` la publica en la portada en
   menos de una hora. "no" (o borrar el "sí") la retira.

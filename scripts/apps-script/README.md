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
| `appsscript.json` | Manifiesto: zona horaria y servicio avanzado de Gmail (lo usa `Seguimientos.gs`) |

Las filas nuevas las agrega una rutina diaria de Claude (7:45 am) con
Verificación `safe`. `procesarPendientes` solo manda filas aprobadas **y** `safe`.

## Cómo se sube

**Solo.** Cada push a `main` que toque esta carpeta corre
`.github/workflows/apps-script.yml`: revisa la sintaxis de los 4 archivos
juntos y hace `clasp push`. Necesita el secreto `CLASPRC_JSON` en GitHub
(contenido de `~/.clasprc.json` después de `clasp login` con hola@).

`clasp push` **reemplaza todo el proyecto** con lo que hay en esta carpeta: un
archivo que exista en el editor y no aquí se borra. Los triggers y las
propiedades del proyecto no se tocan.

A mano, solo si la automatización falla (desde la Mac, con hola@):

```
cd /Users/rubenrivera/Desktop/notmanrivera-site && git pull && cd scripts/apps-script && clasp push
```

## Aprobación

Con `APROBACION_AUTOMATICA` (Código.gs), las filas que agrega la rutina diaria
con Verificación `safe` salen a las 9 am sin "sí". Para frenar una: "no" en
Aprobado. Las filas viejas o agregadas a mano siguen necesitando "sí".

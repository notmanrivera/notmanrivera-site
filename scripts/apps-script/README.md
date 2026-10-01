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

## Subir cambios (desde la Mac)

⚠️ Todo con la cuenta **hola@notmanrivera.com**. Con otra cuenta, clasp sube
a otro proyecto o el script manda correos desde otra bandeja (pasó el 29/9).

Una sola vez:

1. Instala Node.js (nodejs.org) y luego `npm install -g @google/clasp`.
2. Entra a https://script.google.com/home/usersettings con hola@ y activa
   **Google Apps Script API**.
3. `clasp login` y elige hola@notmanrivera.com.
`.clasp.json` ya trae el ID del proyecto (Configuración del proyecto → ID de
la secuencia de comandos).

Cada vez que haya cambios:

```
cd notmanrivera-site
git pull
cd scripts/apps-script
clasp push
```

`clasp push` **reemplaza todo el proyecto** con lo que hay en esta carpeta: un
archivo que exista en el editor y no aquí se borra. Los triggers y las
propiedades del proyecto no se tocan.

Después del push, en el editor corre `ensayoUtm` y `ensayoEnvioBorradores`;
ninguno manda nada y los dos tienen que terminar sin errores.

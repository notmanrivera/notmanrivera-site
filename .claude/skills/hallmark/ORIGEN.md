# De dónde salió esto

Hallmark v1.1.0 — https://github.com/nutlope/hallmark — MIT, por Together AI.

Instalado el 2026-09-18 a petición de Rubén, copiando `skills/hallmark/SKILL.md`
y `references/` como indica el README del proyecto.

## Por qué vive en el repo y no en ~/.claude/skills/

Las sesiones de Claude Code en la nube corren en contenedores efímeros: lo que
se instala en el home del contenedor se pierde al reciclarse. Aquí, versionado
junto al proyecto, cualquier sesión futura sobre este repo lo carga sola.

No toca el sitio: el despliegue solo publica `public/`, así que nada de esto
llega a notmanrivera.com.

## Para actualizarlo

    git clone --depth 1 https://github.com/nutlope/hallmark /tmp/hallmark
    cp -r /tmp/hallmark/skills/hallmark/SKILL.md /tmp/hallmark/skills/hallmark/references .claude/skills/hallmark/

## ⚠️ Cuidado al usarlo en este proyecto

Hallmark existe para que una IA no genere interfaces genéricas. notmanrivera.com
NO tiene ese problema: tiene identidad propia, documentada en PROJECT.md —
paleta con reglas (el verde ácido está prohibido), tipografías propias, sistema
de placas inclinadas. Esa identidad manda sobre cualquier tema que Hallmark
proponga.

Donde sí sirve: páginas nuevas desde cero, y el verbo `audit` para medir código
existente contra sus antipatrones.

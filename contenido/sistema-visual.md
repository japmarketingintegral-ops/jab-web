# Sistema visual de Jab — reglas para placas

Extraído del CSS del sitio (`public/assets/css/styles.css`, que cita un manual oficial en las páginas 07 y 09) y de las placas publicadas en `@jabmarketing_`. Es la referencia para que el equipo de diseño produzca sin inventar.

⚠️ Falta el manual de marca original. Si aparece, manda él y este documento se corrige.

## Paleta

| Token | Hex | Uso | Regla |
|---|---|---|---|
| `navy-900` | `#00002e` | Base oscura dominante | Fondo o texto. Es el color de la marca. |
| `celeste-100` | `#e0f4fb` | Base clara | Fondo o texto. **Reemplaza al blanco.** |
| `blue-600` | `#3d6af1` | Azul de marca | Acento. **Un solo elemento por placa.** |
| `lime-500` | `#d5ff3c` | Verde | **Exclusivo para llamados a la acción.** Nunca decorativo. |
| `white` | `#ffffff` | Base clara alternativa | Vale como fondo, sola o en degradé con el celeste — así está resuelto el reel de animación. **No como color de texto sobre navy.** |

**Las dos reglas que más se rompen:**

1. **Texto sobre navy va en celeste, nunca en blanco puro.** Está escrito así en el CSS. El blanco sobre navy vibra y ensucia. (El blanco sí vale como fondo.)
2. **El lime es del botón.** Si aparece en una placa que no pide una acción, pierde la función de señal. En las 6 placas publicadas no hay una sola mancha de lime — el equipo ya lo viene respetando.

**Sobre los fondos claros:** el sistema admite tres bases —navy, celeste y blanco— y el blanco puede ir en degradé suave con el celeste, como está resuelto el reel de animación. Lo que no cambia es que **el navy es la base dominante**: si una pieza no tiene una razón para ir clara, va oscura.

## Tipografía

- **Titulares:** `Funnel Display`, peso alto, interlineado ajustado.
- **Cuerpo y etiquetas:** `Funnel Sans`.
- Alineación a la izquierda. Frase capitalizada, **nunca todo en mayúscula** (salvo la etiqueta `[MARKETING]`).
- Titulares de **3 o 4 palabras por renglón**, cortados a propósito para que el quiebre de línea acompañe la idea:

```
Tus ventas          Sin propósito       El Marketing
no van              no hay              empieza por entender
a crecer            dirección           el negocio.
```

## Elementos de identidad

- **`[MARKETING]`** — etiqueta chica, mayúscula, muy espaciada. Va arriba a la izquierda como copete, o abajo a la derecha como firma. Es el eco del logotipo *Jab [Marketing]* y el elemento que más identifica al sistema.
- **Isotipo angular** — el cuadrado rotado y quebrado. Se usa grande como elemento gráfico, o chico en el bloque de firma.
- **Barras en paralelogramo** — rectángulos inclinados, navy sobre celeste, con texto adentro. Es el recurso para listas, pasos y procesos (como el "ABC de nuestro trabajo"). Es la firma visual más distintiva de Jab.
- **Firma al pie:** logo Jab abajo a la izquierda, `[MARKETING]` abajo a la derecha.

## Fotografía

Blanco y negro o muy desaturada. Documental, gente y lugares reales — nunca banco de imágenes sonriendo a cámara. Si una foto entra a color, tiene que traer azul de marca adentro (como la del libro *Strategy Matters*).

## Ritmo de la grilla

Las placas alternan fondo **celeste** y fondo **navy**. Eso arma un damero en la grilla del perfil. Al programar, hay que mirar cómo cae cada placa en la grilla, no sólo cómo se ve sola.

Regla simple: **nunca tres seguidas del mismo fondo.**

## Formatos

| Pieza | Medida | Nota |
|---|---|---|
| Placa de feed | 1080 × 1350 (4:5) | Formato por defecto, ocupa más pantalla |
| Carrusel | 1080 × 1350 | Portada con el titular, 4 a 7 placas |
| Historia / reel | 1080 × 1920 | Zona segura: 250 px arriba y abajo |
| LinkedIn | 1200 × 1200 (1:1) | Se reencuadra la placa de IG, no se rehace |

## Lista de control antes de publicar

- [ ] ¿El texto sobre navy es celeste y no blanco?
- [ ] ¿El lime aparece sólo si hay un llamado a la acción?
- [ ] ¿Hay un solo elemento en azul `#3d6af1`?
- [ ] ¿Está la etiqueta `[MARKETING]`?
- [ ] ¿La firma está al pie?
- [ ] ¿El titular entra en 3 o 4 palabras por renglón?
- [ ] ¿Cómo queda en la grilla junto a las dos anteriores?

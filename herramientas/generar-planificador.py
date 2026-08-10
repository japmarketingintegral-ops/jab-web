"""Arma el planificador de contenido que se entrega como recurso gratuito.

Para alguien que tiene un negocio y publica solo, sin agencia. Lo que resuelve
no es la falta de tiempo: es la pantalla en blanco. Por eso el corazón del
archivo es el banco de ideas, con la adaptación a TikTok ya escrita al lado.
"""
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import CellIsRule
from openpyxl.utils import get_column_letter
from datetime import date, timedelta

NAVY = '00002E'
AZUL = '3D6AF1'
GRIS = 'F2F4F8'
BLANCO = 'FFFFFF'
AMARILLO = 'FFF3C4'

SALIDA = '/Users/santiagociarniello/WEB/public/recursos/planificador-de-contenido-jab.xlsx'

PILARES = ['Mostrar', 'Enseñar', 'Probar', 'Vender']
FORMATOS = ['Reel', 'Carrusel', 'Foto', 'Historia']
ESTADOS = ['Para hacer', 'Grabado', 'Editado', 'Publicado']

wb = Workbook()

titulo_f = Font(name='Arial', size=16, bold=True, color=BLANCO)
cab_f = Font(name='Arial', size=10, bold=True, color=BLANCO)
normal_f = Font(name='Arial', size=10)
chico_f = Font(name='Arial', size=9, color='5A5F73')
negrita_f = Font(name='Arial', size=10, bold=True)

navy_fill = PatternFill('solid', fgColor=NAVY)
azul_fill = PatternFill('solid', fgColor=AZUL)
gris_fill = PatternFill('solid', fgColor=GRIS)
amarillo_fill = PatternFill('solid', fgColor=AMARILLO)
borde = Border(bottom=Side(style='thin', color='D5DAE5'))


# ---------------------------------------------------------------- Empezá acá
ini = wb.active
ini.title = 'Empezá acá'
ini.sheet_view.showGridLines = False
ini.column_dimensions['A'].width = 3
ini.column_dimensions['B'].width = 108

ini['B2'] = 'Planificador de contenido'
ini['B2'].font = Font(name='Arial', size=22, bold=True, color=NAVY)
ini['B3'] = 'Para negocios que publican solos  ·  Jab Marketing  ·  jabmarketing.site'
ini['B3'].font = Font(name='Arial', size=11, color=AZUL)

bloques = [
    ('Para qué sirve', [
        'Para no volver a abrir Instagram sin saber qué publicar. Traés el mes planificado de antes',
        'y el día que toca solamente ejecutás: no decidís y producís al mismo tiempo, que es lo que agota.',
    ]),
    ('Los cuatro pilares', [
        'MOSTRAR    cómo se hace lo que hacés. El detrás de escena, el taller, las manos trabajando.',
        'ENSEÑAR    resolvés una duda real de tu cliente. Lo que te preguntan siempre.',
        'PROBAR     que funciona. Clientes, trabajos terminados, antes y después.',
        'VENDER     qué vendés, cuánto sale, cómo se compra. Sin vueltas.',
    ]),
    ('La proporción que funciona', [
        'De cada 10 publicaciones: 3 mostrar, 3 enseñar, 2 probar, 2 vender.',
        'El error más común es publicar 10 de vender. El segundo es no vender nunca y esperar que compren solos.',
        'La hoja CALENDARIO cuenta sola cuántas llevás de cada pilar.',
    ]),
    ('Cómo se usa', [
        '1.  Abrí BANCO DE IDEAS y elegí las de este mes. Hay cuarenta, con la versión de TikTok al lado.',
        '2.  Pasalas al CALENDARIO. Ya viene con un mes sugerido: cambiá lo que no te sirva.',
        '3.  Grabá todo junto un día. Producir de a una es cuatro veces más lento.',
        '4.  Después de publicar, anotá guardados y comentarios. En dos meses vas a saber qué te funciona.',
    ]),
    ('Lo único que hay que mirar', [
        'No los "me gusta". GUARDADOS y COMPARTIDOS: son los que le dicen al algoritmo que valió la pena,',
        'y los únicos que se parecen a la intención de compra. Un posteo con pocos likes y muchos guardados',
        'es un buen posteo.',
    ]),
]

fila = 5
for titulo, lineas in bloques:
    ini.cell(fila, 2, titulo).font = Font(name='Arial', size=12, bold=True, color=NAVY)
    ini.cell(fila, 2).fill = gris_fill
    fila += 1
    for l in lineas:
        ini.cell(fila, 2, l).font = normal_f
        fila += 1
    fila += 1

ini.cell(fila, 2, '¿Se te hace mucho sostenerlo todos los meses?').font = negrita_f
ini.cell(fila + 1, 2, 'Es exactamente lo que hacemos en jabmarketing.site/servicios/social-media').font = normal_f


# ------------------------------------------------------------------- Listas
lis = wb.create_sheet('Listas')
lis.sheet_view.showGridLines = False
for i, (nombre, valores) in enumerate([('PILARES', PILARES), ('FORMATOS', FORMATOS), ('ESTADOS', ESTADOS)]):
    col = i + 1
    c = lis.cell(1, col, nombre)
    c.font = cab_f
    c.fill = navy_fill
    lis.column_dimensions[get_column_letter(col)].width = 18
    for j, v in enumerate(valores, start=2):
        lis.cell(j, col, v).font = normal_f


# --------------------------------------------------------------- Calendario
cal = wb.create_sheet('Calendario', 1)
cal.sheet_view.showGridLines = False

COLS = [
    ('Fecha', 12, 'DD/MM'), ('Pilar', 13, None), ('Qué publico', 42, None),
    ('Formato', 12, None), ('Gancho: los primeros 3 segundos', 40, None),
    ('¿Va a TikTok?', 13, None), ('Estado', 13, None),
    ('Guardados', 11, '0'), ('Comentarios', 12, '0'), ('Qué aprendí', 30, None),
]

cal.merge_cells('A1:J1')
cal['A1'] = 'CALENDARIO     ·     tu mes, decidido de antes'
cal['A1'].font = titulo_f
cal['A1'].fill = navy_fill
cal['A1'].alignment = Alignment(vertical='center', indent=1)
cal.row_dimensions[1].height = 30

for i, (n, w, _) in enumerate(COLS, start=1):
    c = cal.cell(2, i, n)
    c.font = cab_f
    c.fill = azul_fill
    c.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
    cal.column_dimensions[get_column_letter(i)].width = w
cal.row_dimensions[2].height = 32

# Un mes armado: tres por semana, respetando la proporción 3-3-2-2
hoy = date.today()
lunes = hoy + timedelta(days=(7 - hoy.weekday()) % 7 or 7)
PLAN = [
    (0, 'Mostrar', 'Cómo preparo un pedido, de principio a fin', 'Reel', '"Así sale un pedido de acá"', 'Sí'),
    (2, 'Enseñar', 'Los 3 errores que veo siempre en mi rubro', 'Carrusel', '"El error nº1 te cuesta plata"', 'Sí'),
    (4, 'Probar', 'Trabajo terminado de esta semana', 'Foto', 'El antes, sin decir nada', 'No'),
    (7, 'Vender', 'Qué incluye mi servicio y cuánto sale', 'Carrusel', '"Cuánto sale, sin vueltas"', 'No'),
    (9, 'Mostrar', 'Un día de trabajo en 30 segundos', 'Reel', 'Arranco a las 6 de la mañana', 'Sí'),
    (11, 'Enseñar', 'Cómo elegir bien antes de comprar', 'Reel', '"Fijate esto antes de pagar"', 'Sí'),
    (14, 'Probar', 'Lo que me dijo un cliente esta semana', 'Foto', 'La captura del mensaje', 'No'),
    (16, 'Enseñar', 'Respondo la pregunta que más me hacen', 'Reel', 'La pregunta en pantalla', 'Sí'),
    (18, 'Vender', 'Tengo lugar para dos trabajos más este mes', 'Historia', '"Me quedan dos lugares"', 'No'),
    (21, 'Mostrar', 'Quién soy y por qué hago esto', 'Reel', 'Mi cara, hablando a cámara', 'Sí'),
    (23, 'Probar', 'Antes y después de un trabajo', 'Carrusel', 'El después primero', 'Sí'),
    (25, 'Enseñar', 'Un truco que uso todos los días', 'Reel', 'Empiezo haciéndolo, sin presentación', 'Sí'),
]

FILAS = 60
for n, (dias, pilar, idea, formato, gancho, tiktok) in enumerate(PLAN):
    f = 3 + n
    cal.cell(f, 1, lunes + timedelta(days=dias))
    cal.cell(f, 2, pilar)
    cal.cell(f, 3, idea)
    cal.cell(f, 4, formato)
    cal.cell(f, 5, gancho)
    cal.cell(f, 6, tiktok)
    cal.cell(f, 7, 'Para hacer')

for f in range(3, 3 + FILAS):
    for i in range(1, 11):
        c = cal.cell(f, i)
        c.font = normal_f
        c.border = borde
        c.alignment = Alignment(vertical='center', wrap_text=(i in (3, 5, 10)))
        fmt = COLS[i - 1][2]
        if fmt:
            c.number_format = fmt
    for i in (3, 5):
        cal.cell(f, i).fill = amarillo_fill

dvs = [
    (DataValidation(type='list', formula1=f'Listas!$A$2:$A${len(PILARES)+1}', allow_blank=True), f'B3:B{2+FILAS}'),
    (DataValidation(type='list', formula1=f'Listas!$B$2:$B${len(FORMATOS)+1}', allow_blank=True), f'D3:D{2+FILAS}'),
    (DataValidation(type='list', formula1='"Sí,No"', allow_blank=True), f'F3:F{2+FILAS}'),
    (DataValidation(type='list', formula1=f'Listas!$C$2:$C${len(ESTADOS)+1}', allow_blank=True), f'G3:G{2+FILAS}'),
]
for dv, rango in dvs:
    cal.add_data_validation(dv)
    dv.add(rango)

est = f'G3:G{2+FILAS}'
cal.conditional_formatting.add(est, CellIsRule(operator='equal', formula=['"Publicado"'],
    fill=PatternFill('solid', fgColor='DCF3E3'), font=Font(name='Arial', size=10, bold=True, color='1B6E3C')))
cal.conditional_formatting.add(est, CellIsRule(operator='equal', formula=['"Para hacer"'],
    fill=PatternFill('solid', fgColor='FFF0C2'), font=Font(name='Arial', size=10, color='8A6100')))

cal.freeze_panes = 'C3'
cal.auto_filter.ref = f'A2:J{2+FILAS}'

# El balance del mes, calculado
bal_f = 3 + FILAS + 2
cal.cell(bal_f, 2, 'BALANCE').font = Font(name='Arial', size=12, bold=True, color=NAVY)
cal.cell(bal_f, 3, 'Lo ideal de cada 10: 3 mostrar · 3 enseñar · 2 probar · 2 vender').font = chico_f
R = f'$B$3:$B${2+FILAS}'
for i, p in enumerate(PILARES):
    f = bal_f + 1 + i
    cal.cell(f, 2, p).font = normal_f
    c = cal.cell(f, 3, f'=COUNTIF({R},$B{f})')
    c.font = negrita_f
    c.number_format = '0'
cal.cell(bal_f + 5, 2, 'Publicadas').font = normal_f
cal.cell(bal_f + 5, 3, f'=COUNTIF($G$3:$G${2+FILAS},"Publicado")').font = negrita_f


# ------------------------------------------------------------ Banco de ideas
ban = wb.create_sheet('Banco de ideas', 2)
ban.sheet_view.showGridLines = False
ban.merge_cells('A1:D1')
ban['A1'] = 'BANCO DE IDEAS     ·     cuarenta, para que nunca mires la pantalla en blanco'
ban['A1'].font = titulo_f
ban['A1'].fill = navy_fill
ban['A1'].alignment = Alignment(vertical='center', indent=1)
ban.row_dimensions[1].height = 30

for i, (n, w) in enumerate([('Pilar', 13), ('La idea', 46), ('Cómo se ve en Instagram', 44),
                            ('Cómo se adapta a TikTok', 44)], start=1):
    c = ban.cell(2, i, n)
    c.font = cab_f
    c.fill = azul_fill
    c.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
    ban.column_dimensions[get_column_letter(i)].width = w
ban.row_dimensions[2].height = 30

IDEAS = [
    ('Mostrar', 'Cómo se hace lo que vendés, de principio a fin', 'Reel de 30 seg con música, cortes prolijos', 'Lo mismo pero hablando vos encima, sin música'),
    ('Mostrar', 'Un día tuyo de trabajo', 'Varias tomas cortas del día, texto en pantalla', 'Empezá con lo más raro del día, no con el despertador'),
    ('Mostrar', 'El lugar donde trabajás', 'Recorrido prolijo, luz cuidada', 'Recorrido en la mano, mostrando lo desordenado también'),
    ('Mostrar', 'Cómo llega la materia prima', 'Carrusel con fotos del proceso', 'Reel rápido con el ruido real de fondo'),
    ('Mostrar', 'Las herramientas que usás y para qué', 'Foto cenital ordenada + texto', 'Agarrá cada una y explicá en 5 segundos'),
    ('Mostrar', 'Un error tuyo y cómo lo arreglaste', 'Carrusel: el error, la causa, la solución', 'Contalo a cámara, sin edición'),
    ('Mostrar', 'Lo que nadie ve de tu trabajo', 'Reel con voz en off', 'Lo mismo, pero arrancá por lo más impactante'),
    ('Mostrar', 'Cómo empaquetás o entregás', 'Reel satisfactorio de empaque', 'Igual, pero más rápido y con audio en tendencia'),
    ('Mostrar', 'Presentá a alguien de tu equipo', 'Foto + texto largo contando su historia', 'Que hable la persona, 20 segundos'),
    ('Mostrar', 'Cuánto tarda de verdad hacer lo que hacés', 'Time-lapse con el reloj en pantalla', 'Time-lapse igual, pero decí el número al principio'),
    ('Enseñar', 'Los 3 errores más comunes de tu rubro', 'Carrusel de 4 placas', 'Reel: un error cada 5 segundos, sin intro'),
    ('Enseñar', 'Cómo elegir bien antes de comprar', 'Carrusel con criterios', 'A cámara, empezando por "no compres hasta ver esto"'),
    ('Enseñar', 'La pregunta que más te hacen, respondida', 'Reel a cámara de 40 seg', 'La pregunta en pantalla los primeros 2 segundos'),
    ('Enseñar', 'Un truco que usás todos los días', 'Reel mostrando el truco', 'Arrancá haciéndolo, sin presentarte'),
    ('Enseñar', 'Cómo cuidar o mantener lo que vendiste', 'Carrusel paso a paso', 'Reel de 3 pasos, uno por corte'),
    ('Enseñar', 'Qué significan los términos de tu rubro', 'Carrusel glosario', 'Uno solo por video, la palabra grande en pantalla'),
    ('Enseñar', 'Barato vs. caro: en qué se diferencian', 'Comparación lado a lado', 'Los dos en la mano, mostrando la diferencia'),
    ('Enseñar', 'Cuándo NO conviene comprarte a vos', 'Texto honesto sobre foto', 'A cámara. Este formato funciona muy bien en TikTok'),
    ('Enseñar', 'Cómo se calcula el precio en tu rubro', 'Carrusel desglosando', 'Reel con los números en pantalla'),
    ('Enseñar', 'Lo que aprendiste en tus primeros años', 'Carrusel de aprendizajes', 'Contá uno solo, bien contado'),
    ('Probar', 'Trabajo terminado de esta semana', 'Foto cuidada del resultado', 'El proceso acelerado terminando en el resultado'),
    ('Probar', 'Antes y después', 'Carrusel: antes, proceso, después', 'Empezá por el después y volvé al antes'),
    ('Probar', 'Un mensaje de un cliente contento', 'Captura sobre fondo de marca', 'Leelo en voz alta a cámara'),
    ('Probar', 'Un cliente contando qué le pasó', 'Video testimonio editado', 'Que lo grabe él con el celular, sin editar'),
    ('Probar', 'Un caso difícil que resolviste', 'Carrusel contando la historia', 'Contalo como historia, empezando por el problema'),
    ('Probar', 'Cuántos trabajos llevás este año', 'Placa con el número', 'Decí el número en el primer segundo'),
    ('Probar', 'Un cliente que vuelve después de años', 'Foto + la historia en el texto', 'Contala a cámara, 30 segundos'),
    ('Probar', 'Comparación con lo que hacía la competencia', 'Carrusel, sin nombrar a nadie', 'Igual, y en TikTok se puede ser más directo'),
    ('Probar', 'El trabajo del que estás más orgulloso', 'Fotos buenas + por qué', 'Contá por qué, con las imágenes de fondo'),
    ('Probar', 'Números concretos de un resultado', 'Placa con la cifra', 'La cifra en pantalla en el segundo uno'),
    ('Vender', 'Qué incluye tu servicio, exactamente', 'Carrusel con la lista', 'Reel enumerando rápido, con texto en pantalla'),
    ('Vender', 'Cuánto sale, sin vueltas', 'Placa con el precio o el desde', 'Decí el precio en los primeros 3 segundos'),
    ('Vender', 'Cómo se compra, paso a paso', 'Carrusel de 3 pasos', 'Reel de 15 seg mostrando el chat real'),
    ('Vender', 'Tenés lugar para X trabajos este mes', 'Historia con encuesta', 'Reel corto, tono urgente pero sin exagerar'),
    ('Vender', 'Novedad: producto o servicio nuevo', 'Carrusel de presentación', 'Reel mostrándolo en uso, no en góndola'),
    ('Vender', 'Promoción con fecha de cierre', 'Placa clara con la fecha', 'Reel de 10 seg, la fecha grande'),
    ('Vender', 'Por qué elegirte a vos y no a otro', 'Carrusel con tus tres razones', 'A cámara, sin sonar a publicidad'),
    ('Vender', 'Lo más vendido del mes', 'Foto del producto estrella', 'Reel mostrándolo funcionando'),
    ('Vender', 'Financiación o formas de pago', 'Carrusel con las opciones', 'Placa simple, es info que se busca'),
    ('Vender', 'Respondé a "está caro"', 'Carrusel explicando el valor', 'A cámara. Es de los que más se comparten'),
]

for n, (pilar, idea, ig, tt) in enumerate(IDEAS):
    f = 3 + n
    for col, v in enumerate((pilar, idea, ig, tt), start=1):
        c = ban.cell(f, col, v)
        c.font = negrita_f if col == 1 else normal_f
        c.alignment = Alignment(vertical='center', wrap_text=(col > 1))
        c.border = borde
    ban.row_dimensions[f].height = 30

ban.freeze_panes = 'A3'
ban.auto_filter.ref = f'A2:D{2 + len(IDEAS)}'

wb.save(SALIDA)
print('guardado ·', len(IDEAS), 'ideas ·', len(PLAN), 'publicaciones planificadas')

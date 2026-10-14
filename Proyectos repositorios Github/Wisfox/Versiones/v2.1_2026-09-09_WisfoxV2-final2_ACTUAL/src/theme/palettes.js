/*
 * theme/palettes.js — Definiciones de paletas de color
 * =========================================================
 * Origen: wisfo_19.backup.html líneas 1683-1709 (const PALETAS).
 *
 * Cada entrada es una familia de color (Violeta/Bosque/Océano/Atardecer/
 * Rosa) con una variante `claro` y otra `oscuro`, cada una con el
 * conjunto completo de propiedades personalizadas CSS del bloque :root
 * de styles/base.css. Ver `applyTheme(key)` en theme/theme.js, que hace:
 *   Object.entries(PALETAS[paleta][modo]).forEach(([k,v]) => root.style.setProperty(k,v))
 * es decir, sobrescribe los tokens de :root en tiempo de ejecución —
 * base.css solo provee los valores por defecto "bosque/claro" para que
 * la página no quede sin estilo antes de que corra el JS.
 */

export const PALETAS = {
  violeta:{name:'Violeta',name_en:'Violet',accent:'#7c5ce6',
    claro:{'--green':'#7c5ce6','--green-dark':'#5f42c4','--green-light':'#efebfd','--green-soft':'#f7f4fe',
           '--bg':'#f7f6fc','--card':'#ffffff','--text':'#272440','--muted':'#8a85a3','--border':'#ebe7f6'},
    oscuro:{'--green':'#a68cf5','--green-dark':'#c4b2fb','--green-light':'#2c2545','--green-soft':'#241f39',
           '--bg':'#15132a','--card':'#1e1b38','--text':'#eceafa','--muted':'#9b95bb','--border':'#312b52'}},
  bosque:{name:'Bosque',name_en:'Forest',accent:'#3d9960',
    claro:{'--green':'#3d9960','--green-dark':'#2e7d4f','--green-light':'#e8f3ec','--green-soft':'#f0f7f2',
           '--bg':'#f6f8f4','--card':'#ffffff','--text':'#26352b','--muted':'#7b8a80','--border':'#e5ece7'},
    oscuro:{'--green':'#4fbd7d','--green-dark':'#82d9a8','--green-light':'#213328','--green-soft':'#1b2a21',
           '--bg':'#111a14','--card':'#19241d','--text':'#e6eee8','--muted':'#8ba394','--border':'#26362c'}},
  oceano:{name:'Océano',name_en:'Ocean',accent:'#4a7fd4',
    claro:{'--green':'#4a7fd4','--green-dark':'#3563ad','--green-light':'#e7eefb','--green-soft':'#f1f6fc',
           '--bg':'#f4f7fb','--card':'#ffffff','--text':'#26303d','--muted':'#7d8898','--border':'#e2e9f2'},
    oscuro:{'--green':'#5f9bea','--green-dark':'#93c1f7','--green-light':'#1d2b40','--green-soft':'#182334',
           '--bg':'#0f1622','--card':'#17202e','--text':'#e4ecf7','--muted':'#8b9bb2','--border':'#243248'}},
  atardecer:{name:'Atardecer',name_en:'Sunset',accent:'#e0705f',
    claro:{'--green':'#e0705f','--green-dark':'#bb5546','--green-light':'#fcebe8','--green-soft':'#fdf3f0',
           '--bg':'#faf5f2','--card':'#ffffff','--text':'#3c2d28','--muted':'#9b8680','--border':'#f0e2dc'},
    oscuro:{'--green':'#f0897a','--green-dark':'#f8b3a8','--green-light':'#3a2420','--green-soft':'#2e1d1a',
           '--bg':'#1c1310','--card':'#271a17','--text':'#f6e9e5','--muted':'#b0958e','--border':'#3c2823'}},
  rosa:{name:'Rosa',name_en:'Rose',accent:'#d4599b',
    claro:{'--green':'#d4599b','--green-dark':'#b03f7e','--green-light':'#fce9f3','--green-soft':'#fdf3f8',
           '--bg':'#fbf5f9','--card':'#ffffff','--text':'#3a2632','--muted':'#9c8290','--border':'#f2e0ea'},
    oscuro:{'--green':'#e97cb4','--green-dark':'#f4a8ce','--green-light':'#3a2130','--green-soft':'#2e1a26',
           '--bg':'#1b1017','--card':'#26161f','--text':'#f8e8f1','--muted':'#b28fa2','--border':'#3b2430'}}
};

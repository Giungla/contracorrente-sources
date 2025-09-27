
module.exports = {
  compress: {
    booleans: true,            // true → !0, false → !1
    conditionals: true,        // if/else → expressões ternárias quando possível
    dead_code: true,           // remove código não usado
    drop_console: true,        // remove console.* (produção)
    drop_debugger: true,       // remove debugger
    evaluate: true,            // calcula constantes em tempo de build
    keep_infinity: true,       // preserva Infinity (evita 1/0 que pode ser mais lento)
    reduce_vars: true,         // substitui variáveis usadas uma vez
    sequences: true,           // combina instruções em sequência
    passes: 3,                 // roda mais de uma vez para compressão melhor
    unsafe: false,             // não ativa otimizações potencialmente perigosas
    comparisons: true,         // otimiza comparações
    collapse_vars: true,       // inlining de variáveis
    typeofs: true,             // simplifica typeof 'x'
    toplevel: true,            // remove variáveis globais não usadas
  },
  mangle: {
    toplevel: true,            // reduz nomes no escopo global
    safari10: true,            // evita bugs no Safari 10
  },
  output: {
    comments: false            // remove comentários
  }
}


import { build } from 'tsup'
import crypto from 'crypto'
import * as fs from 'node:fs'

const hash = crypto
  .randomBytes(6)
  .toString('hex')

// Captura argumentos passados: ex: node build.js --name=custom
const args = Object.fromEntries(
  process.argv.slice(2).map(arg => {
    const [key, value] = arg
    .replace(/^--/, '')
    .split('=')

    return [key, value ?? true]
  })
);

const entry = args.name

if (typeof entry !== 'string') {
  throw new Error(`You must specify a name`);
}

const filename = `${entry}.${hash}.js`

await fs.readdir('dist', async (err, files) => {
  if (err) throw err;

  const filteredFiles = files.filter((file) => file.startsWith(entry));

  if (filteredFiles.length > 0) {
    for (const file of filteredFiles) {
      await fs.unlink(`dist/${file}`, (err) => {
        if (!err) {
          return console.log(file, 'removed');
        }

        console.log(`Unable to remove ${file}`, err)
      })
    }

    return
  }

  console.log('No file found.');
})

await build({
  entry: [`src/${entry}.ts`],
  format: ['iife'],
  minify: 'terser',
  outDir: 'dist',
  treeshake: true,
  outExtension: () => ({
    js: `.${hash}.js`,
  }),
  drop: [
    'console',
    'debugger',
  ],
  terserOptions: {
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
    },
    safari10: true,

  },
});

console.log(`Generated file: dist/${filename}`);

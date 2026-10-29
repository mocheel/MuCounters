# Memória da Turma do Bento (protótipo)

Jogo da memória com os personagens da Turma do Bento, feito para celular Android.

- 3 níveis: Fácil (4 pares), Médio (6 pares), Difícil (8 pares)
- Contador de jogadas, tempo, estrelas no final e recorde por nível
- Vibra ao achar um par (em aparelhos que suportam)

## Colocar os personagens de verdade

Edite `personagens.js`. Para cada personagem, troque o `nome` e, se tiver a arte,
salve a imagem em `personagens/` e preencha `imagem` (ex.: `"personagens/bento.png"`).
Imagens quadradas com fundo transparente ficam melhores. Sem imagem, a carta mostra
um avatar provisório com a cor e as iniciais.

## Jogar no Android

**Opção 1: pelo navegador (mais rápido).** Publique a pasta (ex.: GitHub Pages) e
abra `.../memoria-turma-do-bento/` no Chrome do celular. No menu ⋮, toque em
"Adicionar à tela inicial": o jogo vira um app com ícone e funciona offline.

**Opção 2: APK.** A pasta `android/` é um projeto Android Studio que embute o jogo
num WebView. Abra `android/` no Android Studio e use *Build > Build APK(s)*. O build
copia `index.html`, `jogo.js`, `personagens.js`, `personagens/` e `icons/` para dentro
do APK, então basta editar os arquivos do jogo e gerar o APK de novo.

**Opção 3: APK pela linha de comando (sem Android Studio).** No Ubuntu:

```bash
sudo apt install aapt dalvik-exchange zipalign apksigner android-sdk-platform-23
ANDROID_JAR=/usr/lib/android-sdk/platforms/android-23/android.jar android/build-apk.sh
```

O APK sai em `android/build/memoria-turma-do-bento.apk`, assinado com uma chave de
debug. Para instalar no celular, copie o arquivo e permita "instalar apps de fontes
desconhecidas" quando o Android pedir.

## Testar no computador

Abra `index.html` no navegador (use o modo celular das ferramentas de desenvolvedor).

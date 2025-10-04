# Budget-árukereső

Ez a projekt a Szoftverfejlesztési módszertanok órára készült. A nevétől adódóan a projekt egy [árukereső](https://www.arukereso.hu/?utm_source=google&utm_medium=cpc&utm_campaign=HU>PRF>ALL>Self_promo>SERP>OTH>%28KW%29&utm_id=170299665&gad_source=1&gad_campaignid=170299665&gclid=CjwKCAjwi4PHBhA-EiwAnjTHuTo00ouPrTTxwZmVJERCDJGZaNiYmvmh1TP4C7EU8y4i71vrKIdGABoCMJoQAvD_BwE) másolata, de míg az eredeti a technikai eszközökre koncentrál, a mi keresőnk ruhákat listáz.
A weboldal számos szűrési lehetőséget kínál:

- Ár szerint(minimum/maximum) skála
- Mérten alapján
- Hány oldalt mutasson a kereső
- Melyik oldalt mutassa a kereső

A jövőben további funkciók is várhatók, például bejelentkezés, regisztráció, kedvencek kezelése és értékelési lehetőség.

# Telepítés

1. Klónozd a repót

```
git clone https://github.com/gmark1337/budget-arukereso
```

2. Lépj be a klónozott mappába

```
cd budget-arukereso
```

3. Telepítsd a függőségeket

```
npm install
```

# Futtatás

1. Inditsd el a server.mjs-t

```
node .\server.mjs
```

2. Nyisd meg a böngészőben a megfelelő portor,
   pl.:

```
http://localhost:8080
```

3. A felületnek ekkor már meg kell jelennie

# Könyvtárak

[cheerio](https://www.npmjs.com/package/cheerio)<br>
Egy könnyű, gyors HTML-átalakító könyvtár. A weboldalak tartalmát jQuery-szerű módon lehet feldolgozni, amit a tesztek megírásához használtunk.

[dotenv](https://www.npmjs.com/package/dotenv)<br>
Lehetőséget biztosít a környezeti változók egyszereű kezelésére. Segítségével api kulcsokat, konfiguráció beállításokat biztonságosan tudtunk tárolni.

[ejs](https://www.npmjs.com/package/ejs)<br>
Egy sablonmotor, amivel dinamikus HTML-oldalakat tudunk generálni. Segíti a szerver oldalon kapott adatokat beilleszteni a weboldal felületére.

[express](https://www.npmjs.com/package/express)<br>
Minimalista webkeretrendszer Node.js-hez. Gyorsan és egyszerűen lehet szervert létrehozni, kéréseket és válaszokat kezelni.

[p-limit](https://www.npmjs.com/package/p-limit)<br>
Korlátozni lehet a párhuzamosan futó aszinkron műveletek számát, biztosítva hogy a webscraping nem terheli túl a gépet vagy a céloldalakat.

[puppeteer](https://www.npmjs.com/package/puppeteer)<br>
Egy böngészőautomatizáló eszköz, ami lehetővé teszi, hogy programból vezéreljük a Chrome-ot vagy a Chromiumot. Ezzel könnyedén letölthetjük és feldolgozhatjuk a weboldalak tartalmát, mintha valódi felhasználó böngészne.

# Szolgáltatások

## Webscraping

A weboldal fő funkciója a keresés, amit webscraping technikával valósítottunk meg. Ez azt jelenti, hogy a rendszer egy felhasználót imitálva lép fel más weboldalakra és gyűjti össze az adatokat. A teljesítmény optimalizálása és a túlterhelés elkerülése érdekében a kereső egyszerre legfeljebb 3 oldalt dolgoz fel.

### Modellek

Minden modell ugyanarra a felépítésre épül fel ezért csak 1-et sorolunk fel

- Szűrés

```
const filters = {
	minPrice: "4000",
	maxPrice: "5000",
	size: "M",
	numberOfPagesToFetch: {
		hervis: 1,
		sinsay: 2,
		sportissimo: 3
	},
	blackListedWebsite: [
	]
};
```

- Hervis.js

    - Szűrés
     A szűrési URL-t az adott weboldal kódolásával hozzuk létre amire a getImageAsync algoritmus használ.
        - SearchedItem -> keresett szó
        - url -> a weboldal kereső URL-je
        - filters -> ha nincs feltétel akkor üres és csak a keresett szót kódol.

```
encodeSearchItemWithFilteringAsync(searchedItem, url, filters = {})
```

    - Kereső funckió
        Itt hívjuk meg a encodeSearchItemWithFilteringAsync, getImageAsync majd az az eredményt tömbösíve visszaadjuk.
        - searchword -> keresett szó
        - page -> adott oldal
        - numberOfItemsToFetch -> mennyi oldalt gyüjtsön be az oldal
```
fetchHervisImagesAsync(searchword, page, numberOfItemsToFetch)
```
### Függvények

#### ImageScraperService.js

- Sleep
  Manuális késleltetés az adott oldalon. Megakadályozva a túl gyors navigálást és esetleges összeomlást.

```
async function sleep(ms): int
```

- Kép kigyűjtés
  Az adott oldalon kiválasztja a termékeket és elmenti a képüknek az URL-ét, az adott termékenek az URL-ét és az adott termék árát.

```
async function getImagesAsync(page, divSelector, linkSelector, priceSelector, priceSelector, priceFilter, productImageSelector)
```

| Név                  | Felelősség                                                                         | Típus  |
| -------------------- | ---------------------------------------------------------------------------------- | ------ |
| page                 | Az adott weboldal                                                                  | string |
| divSelector          | Kiválasztja a termékeknek a konténerét                                             | string |
| linkSelector         | Kiválasztja minden termékhez az URL-t                                              | string |
| priceSelector        | Kiválasztja minden terméknek az árá-t                                              | string |
| priceFilter          | Egy regex ami alapján kiszűri az árat a priceSelector által kiválasztott szövegből | regex  |
| productImageSelector | Kiválasztja a terméknek a képét                                                    | string |

- Search
  Ez a függvény hívja meg a többi weboldalt. Egy kereső szót vár el argumentomként.

```
async function Search(searchword) -> string
```
 Vissza adja az össze képet json formátumban. 
 pl.:
 ```
{
   "Websites":[
      {
         "WebsiteName":"Website1",
         "FoundImages":[
            {
               "Item":"Blue jeans",
               "URl":"URL",
               "Price":8500
            }
         ]
      },
      {
         "WebsiteName":"Website2",
         "FoundImages":[
            {
               "Item":"Blue jeans",
               "URl":"URL",
               "Price":9000
            }
         ]
      }
   ]
}
```

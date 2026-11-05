# Obsah webu (data/)

Každý súbor je JSON v UTF-8. Stránky ho čítajú funkciou `obsah(meno)` zo `spolocne/obsah.js`.
Neskôr ho môže vracať administrácia (WordPress REST alebo jednoduché CMS) v rovnakom tvare; zmení sa len `OBSAH_ZDROJ`.
`"ukazka": true` znamená ukážkový obsah, ktorý sa nahradí skutočným. Cesty k obrázkom sú relatívne ku koreňu webu.

## preteky.json
Zoznam pretekov (pole objektov).

| Pole | Typ | Popis |
|---|---|---|
| slug | text | Kľúč preteku; zhoduje sa s kľúčom webu vo `weby.json` |
| nazov, podnadpis, popis, stav | text | Názov, riadok nad názvom, krátky popis, stav ročníka |
| hlavny | áno/nie | Hlavný pretek (výkladná skriňa): prvý v zozname, výrazná trasa v pozadí |
| logo | text | Obrázok namiesto názvu (prázdne = text) |
| mesiac, miesto | text | Na karte preteku na úvode |
| datum | dátum `RRRR-MM-DD` | Dátum posledného ročníka |
| trasa | text | Kľúč trasy v `trate.json` |
| gpx, registracia | adresa | GPX trate a registrácia na ZASRUN |
| itra | číslo alebo null | ITRA body |
| liga | text | Liga, ktorej je pretek súčasťou (prázdne = žiadna) |
| cisla[] | {hodnota, popis} | Veľké čísla v detaile preteku |
| karta.cisla[] | {hodnota, popis} | Čísla na karte na úvode |
| karta.zvyraznenie | {nadpis, meno, doplnok, cas, tempo} | Rekord alebo víťaz na karte |
| karta.vysledky | {rok, url} | Odkaz na výsledky |
| obcerstvovacky[] | {km_trasy, nazov, popis} | Občerstvovačky na mape a profile |
| body_na_mape[] | {km_trasy, nazov, strana} | Ďalšie body na mape; strana `end` = popis vľavo |
| start, ciel | text | Popis štartu a cieľa na mape (prázdny cieľ = rovnaký ako štart) |
| propozicie[], doprava[] | {nazov, hodnota} | Riadky propozícií a dopravy |
| harmonogram[] | {cas, popis} | Časový program |
| rekordy.muzi, rekordy.zeny | {cas, meno, klub, rok} | Traťové rekordy |
| archiv[] | {rocnik, datum, v_cieli, vitaz{meno, cas}, vitazka{meno, cas}, vysledky} | Archív ročníkov |
| organizatori[] | {nazov, rola} | Organizátori a partneri |

## trate.json
Body trás: `{"<trasa>": [[km, šírka, dĺžka, výška m], …]}`. Generujú sa z GPX na ZASRUN, ručne sa needitujú.

## novinky.json
Články (pole objektov).

| Pole | Typ | Popis |
|---|---|---|
| slug | text | Adresa článku: `novinky/#<slug>` |
| nazov, perex | text | Nadpis a úvod |
| datum | dátum alebo "" | Dátum zverejnenia (prázdne pri ukážke) |
| kategoria | text | Kategória pre filter (napr. Preteky, Klub) |
| obrazok, obrazok_popis | text | Fotka a jej popis (prázdne = bez fotky) |
| obsah | HTML | Text článku |
| ukazka | áno/nie | Ukážkový článok |

## galeria.json
| Pole | Typ | Popis |
|---|---|---|
| nazov | text | Nadpis galérie na úvode |
| fotky[] | {subor, popis, titulok, vyrez} | Fotka, alternatívny text, popisok, výrez (`object-position`, napr. "50% 35%") |

## klub.json
| Pole | Typ | Popis |
|---|---|---|
| nazov | text | Názov združenia |
| zalozenie | dátum | Vznik klubu |
| clenovia | číslo | Počet členov |
| ico | text | IČO pre 2 % dane (prázdne = doplníme) |
| uvod, poslanie | text | Úvod a poslanie klubu |
| pribeh | HTML | Príbeh klubu (prázdne = výzva na doplnenie) |
| fotka | {subor, popis, titulok, ukazka} | Spoločná fotka |
| kontakt | {meno, telefon, email} | Kontakt |
| odkazy | {strava, facebook} | Odkazy na Strava klub a Facebook |
| podpora[] | objekt | Tabuľa podpory (napr. PSK): program, rok, projekt, prijimatel, poskytovatel, dotacia, tabula |

## vybehy.json
Spoločné výbehy (pole objektov); zobrazia sa najbližšie štyri budúce.

| Pole | Typ | Popis |
|---|---|---|
| id | text | Jedinečný kľúč |
| nazov, miesto, poznamka | text | Názov, miesto stretnutia, poznámka |
| zaciatok | `RRRR-MM-DDTHH:MM` | Začiatok |
| km, stupanie | číslo alebo null | Dĺžka a stúpanie |
| odkaz | adresa | Viac informácií (inak Strava klub) |
| ukazka | áno/nie | Ukážkový výbeh |

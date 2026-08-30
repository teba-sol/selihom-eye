// Region, Zone, Woreda, Kebele dataset for Selihom Eye Clinic
export const REGION_DATA: Record<string, Record<string, string[]>> = {
  "Tigray": {
    "North Western Tigray": ["Tahtay Adiyabo", "Laelay Adiyabo", "Medebay Zana", "Tahtay Koraro", "Asegede Tsimbila", "Tselemti", "Shire Endaselassie (Town)", "Shiraro (Town)"],
    "Central Tigray": ["Mereb Lehe", "Ahiferom", "Were Lehe", "Adwa", "Laelay Maychew", "Tahtay Maychew", "Nader Adet", "Kola Temben", "Dega Temben", "Tanqua Abergele", "Abi Adi (Town)", "Adwa (Town)", "Axum (Town)"],
    "Eastern Tigray": ["Gulo Meheda", "Erob", "Saesi Tsadamba", "Ganta Afeshum", "Hawuzen", "Kilte Awlalo", "Atsbi Wonberta", "Adigrat (Town)", "Wukro (Town)"],
    "Southern Tigray": ["Seharti Samre", "Enderta", "Hintalo Wajirat", "Alaje", "Endamehoni", "Raya Azebo", "Alamata", "Ofla", "Maychew (Town)", "Korem (Town)", "Alamata (Town)"],
    "Western Tigray": ["Kafta Humera", "Welkayit", "Tsegede", "Humera (Town)"],
    "Mekele Special Zone": ["Mekelle Debub Sub-city", "Mekelle Semien Sub-city"]
  },
  "Afar": {
    "Zone 1 (Awsi Rasu)": ["Dubti", "Elidar", "Asayita", "Afambo", "Mile", "Chifra", "Kori"],
    "Zone 2 (Kilbet Rasu)": ["Erebti", "Kunoba", "Abala", "Megale", "Berahile", "Dalol", "Afdera"],
    "Zone 3 (Gabi Rasu)": ["Amibara", "Awash Fentale", "Gewane", "Dulacha", "Bure Mudayitu", "Argoba Liyu"],
    "Zone 4 (Fanti Rasu)": ["Awra", "Ewa", "Teru", "Yalo", "Golina"],
    "Zone 5 (Hari Rasu)": ["Telalak", "Sumu Robi", "Dawe", "Dalifage", "Hadele Ele"]
  },
  "Amhara": {
    "North Gondar": ["Adi Arkay", "Beyeda", "Janamora", "Debark", "Dabat", "Merab Armachoho", "Tegede", "Lay Armachoho", "Wegera", "Gondar Zuria", "Dembia", "Chilga", "Metema", "Quara", "Alefa", "Merab Belsa", "Misrak Belesa", "Gondar (Town)", "Tselemet", "Tach Armachoho", "Takusa"],
    "South Gondar": ["Ebinat", "Libokemkem", "Fogera", "Farta", "Lay Gayint", "Tach Gayint", "Simada", "Misrak Este", "Dera", "Debre Tabor (Town)", "Merab Este"],
    "North Wollo": ["Bugna", "Kobo", "Gidan", "Meket", "Wadla", "Delanta", "Gubalafto", "Habru", "Woldiya (Town)", "Lasta", "Dawunt"],
    "South Wollo": ["Mekdela", "Tenta", "Kutaber", "Ambasel", "Tehuledere", "Werebabu", "Kalu", "Albuko", "Dessie Zuria", "Legambo", "Sayint", "Debresina", "Kelela", "Jama", "Were Ilu", "Wegidi", "Kombolcha (Town)", "Dessie (Town)", "Mehal Saynt", "Legahida"],
    "North Shewa (Amhara)": ["Mida Woremo", "Merhabete", "Ensaro", "Moretna Jiru", "Menz Gera Midir", "Gishe", "Antsokiya Gemza", "Efrata Gidim", "Menz Mama Midir", "Tarma Ber", "Mojana Wadera", "Kewet", "Angolala Tera", "Asagirt", "Ankober", "Hagere Mariam Kesem", "Berehet", "Minjar Shenkora", "Basona Werana", "Debre Berhan (Town)", "Menz Keya Gebreal", "Menz Lalo Midir", "Saya Debirna Wayu"],
    "East Gojjam": ["Bibugn", "Hulet Ej Enese", "Goncha Siso Enese", "Enebse Sar Midir", "Enarj Enawga", "Enemay", "Debay Tilatgen", "Debre Elias", "Machakel", "Gozamin", "Baso Liben", "Awabel", "Dejen", "Shebel Berenta", "Debre Markos (Town)", "Sinan", "Aneded"],
    "West Gojjam": ["Semen Achefer", "Bahir Dar Zuria", "Yilma Na Densa", "Mecha", "Sekela", "Quarit", "Dega Damot", "Dembecha", "Jabi Tehnan", "Bure", "Wonberma", "Goncha", "Debub Achefer", "Finote Selam (Town)"],
    "Wag Hemra": ["Ziquala", "Sekota", "Dehena", "Gazgibla", "Abergele", "Sehala", "Sekota (Town)"],
    "Awi": ["Dangila", "Banja Shekudad", "Ankasha Guagusa", "Guangua", "Fagita Lekoma", "Jawi", "Guagusa Shikudad"],
    "Oromia Zone (Amhara)": ["Dawa Chefa", "Bati", "Jile Timuga", "Artuma Fursi", "Dawe Harewa", "Kemisie (Town)", "Argoba Special Woreda"],
    "Bahir Dar Special Zone": ["Bahir Dar (Town)"]
  },
  "Oromia": {
    "West Wellega": ["Menesibu", "Nejo", "Gimbi", "Lalo Asabi", "Kiltu Kara", "Boji Dirmeji", "Guliso", "Jarso", "Kondala", "Boji Chekorsa", "Babo Gambel", "Yubdo", "Genji", "Haru", "Nole Kaba", "Begi", "Gimbi (Town)", "Seyo Nole", "Homa", "Ayira"],
    "East Wellega": ["Limu", "Ibantu", "Gida Kiremu", "Haro Limu", "Boneya Bushe", "Wayu Tuka", "Gudeya Bila", "Gobu Seyo", "Sibu Sire", "Diga", "Sasiga", "Leka Dulecha", "Guto Gida", "Jima Arjo", "Nunu Kumba", "Wama Hagelo", "Nekemte (Town)"],
    "Illu Aba Bora": ["Darimu", "Alge Sachi", "Chora", "Dega", "Dabo Hana", "Gechi", "Borecha", "Dedesa", "Yayu", "Metu Zuria", "Ale", "Bure", "Nono Sele", "Bicho", "Bilo Nopha", "Hurumu", "Didu", "Mako", "Huka (Halu)", "Metu (Town)", "Bedele (Town)", "Bedele Zuria (Town)", "Chewaka", "Doreni"],
    "Jimma": ["Limu Seka", "Limu Kosa", "Sokoru", "Tiro Afeta", "Kersa", "Mana", "Gomma", "Gera", "Seka Chekorsa", "Dedo", "Omonada", "Sigamo", "Setema", "Shebe Senbo", "Chora Botor", "Guma", "Agaro (Town)"],
    "West Shewa": ["Ginde Beret", "Jeldu", "Ambo Zuria", "Midakegn", "Cheliya", "Bako Tibe", "Dano", "Nono", "Tikur Enchini", "Dendi", "Ejere", "Wolmera", "Ada Berga", "Meta Robi", "Ambo (Town)", "Abuna Gindeberet", "Toke Kutayu", "Jibat", "Elfata", "Holeta (Town)"],
    "North Shewa (Oromia)": ["Were Jarso", "Dera", "Hidabu Abote", "Kuyu", "Degem", "Girar Jarso", "Debere Libanos", "Wuchale", "Abichuna Gnaa", "Kimbibit", "Bereh", "Sululta", "Fiche (Town)", "Yaya Gulele", "Jida", "Mulo", "Aleltu", "Sendafa (Town)"],
    "East Shewa": ["Fentale", "Boset", "Adama", "Lome", "Gimbichu", "Ada'a", "Dugda", "Adami Tulu Jido Kombolcha", "Bishoftu (Town)", "Bora", "Liben", "Akaki", "Ziway (Town)"],
    "Arsi": ["Merti", "Aseko", "Gololcha", "Jeju", "Dodota", "Ziway Dugda", "Hitosa", "Sude", "Chole", "Amigna", "Seru", "Robe", "Tena", "Shirka", "Digluna Tijo", "Tiyo", "Munesa", "Limuna Bilbilo", "Guna", "Sire", "Lude Hitosa", "Deksis", "Bale Gasegar", "Enkelo Wabe", "Asela (Town)"],
    "West Hararghe": ["Mieso", "Doba", "Tulo", "Mesela", "Chiro (Town)", "Anchar", "Guba Koricha", "Habro", "Daro Lebu", "Boke", "Kuni", "Gemches", "Chiro Zuria", "Bedesa (Town)"],
    "East Hararghe": ["Kombolcha", "Jarso", "Gursum", "Babile", "Fedis", "Haro Maya", "Kurfa Chele", "Kersa", "Meta", "Goro Gutu", "Deder", "Melka Belo", "Bedeno", "Midga Tola", "Chinaksan", "Girawa", "Gola Oda", "Meyu"],
    "Bale": ["Agarfa", "Gololcha", "Gasera", "Legehida", "Ginir", "Sinana", "Goba", "Harena Buluk", "Dolo Mena", "Meda Welabu", "Berbere", "Guradamole", "Goro", "Rayitu", "Seweyna", "Robe (Town)", "Goba (Town)", "Dawe Kachen", "Dinsho", "Dawe Serer"],
    "Borena": ["Bule Hora", "Yabelo", "Arero", "Moyale", "Dire", "Teletele", "Abaya", "Dugida Dawa", "Miyu", "Gelana"],
    "South West Shewa": ["Ameya", "Wonchi", "Woliso", "Dawo", "Ilu", "Sebeta Hawas", "Kersa Ena Malima", "Tole", "Becho", "Seden Sodo", "Woliso (Town)", "Goro", "Sodo Dacha", "Sebeta (Town)"],
    "Guji": ["Uraga", "Bore", "Adola", "Wadera", "Odo Shakiso", "Kercha", "Liben", "Dima", "Hambela Wamena", "Girja", "Negele (Town)", "Adola (Town)"],
    "West Arsi": ["Siraro", "Shala", "Arsi Negele", "Kofele", "Kore", "Gedeb Asasa", "Dodola", "Kokosa", "Nensebo", "Adaba", "Shashemene (Town)", "Shashemene Zuria"],
    "Kelem Wellega": ["Hawa Gelan", "Yemalogi Welel", "Dale Wabera", "Gawo Kebe", "Seyo", "Denbi Dollo (Town)", "Anfilo", "Dale Sadi", "Gidami", "Jimma Horo", "Lalo Kile"],
    "Horo Gudru Wellega": ["Horo", "Shambu (Town)", "Guduru", "Hababo Guduru", "Abey Chomen", "Jima Genete", "Jima Rare", "Jardega Jarte", "Amuru", "Abe Dongoro"],
    "Finfinne Special Zone": ["Sebeta Surrounding", "Sululta Surrounding", "Burayu Special Woreda"]
  },
  "Somali": {
    "Sitti (Shinile)": ["Ayisha", "Denbel", "Shinile", "Erer", "Mulo", "Afdem"],
    "Fafan (Jijiga)": ["Babile", "Gursum", "Jijiga", "Awubere", "Kebri Beyah", "Harshin"],
    "Jarar (Degehabur)": ["Degehamedo", "Degehabur", "Aware", "Gashamo", "Gunagudo"],
    "Dollo (Warder)": ["Danot", "Boh", "Geladin", "Warder"],
    "Korahe": ["Shekosh", "Kebridehar", "Shilabo", "Debewoin"],
    "Nogob (Fik)": ["Selehad", "Fik", "Gerbo", "Hamero", "Segeg", "Dihun", "Legehida", "Meyu Muluke"],
    "Shabelle (Gode)": ["Imiberi", "Adadilo", "Danan", "Gode", "Kelafo", "Mustahil", "Ferfer"],
    "Afder": ["Guradamole", "Weyib", "Goro Bekeksa", "Serer", "Mirab Imi", "Afker", "Bare", "Bdolobay", "Kersa Dula"],
    "Liben": ["Filtu", "Dolo Odo", "Moyale", "Udet"]
  },
  "Benishangul-Gumuz": {
    "Metekel": ["Dangur", "Guba", "Wenbera", "Mandura", "Dibate", "Bulen"],
    "Asosa": ["Menge", "Kurmuk", "Asosa", "Sherkole", "Bambasi", "Odabuldi-Guli", "Homesha"],
    "Kamashi": ["Yaso", "Sirba Abay", "Kamashi", "Agelo Meti", "Belojegonfoy"],
    "Pawe Special Zone": ["Pawe"],
    "Mao Komo Special Zone": ["Mao Komo"]
  },
  "Central Ethiopia Regional State": {
    "Gurage": ["Kebena", "Abeshge", "Ezha", "Kokir Gedabano", "Sodo", "Mesekan", "Mareko", "Endegagn", "Gumer", "Cheha", "Enemorna Ener", "Muhor Na Aklil", "Geta", "Welkite (Town)", "Butajira (Town)"],
    "Hadiya": ["Misha", "Gibe", "Lemo", "Shashago", "Misrak Badawacho", "Soro", "Duna", "Analimo", "Merab Badwacho", "Gomibora", "Hosaena (Town)"],
    "Kembata Tembaro": ["Tembaro", "Angacha", "Kedida Gamela", "Kacha Bira", "Hadero Tunito", "Doyo Gena", "Deniboya", "Durame (Town)"],
    "Silte": ["Alicho Werero", "Silti", "Lanfuro", "Merab Azernet", "Dalocha", "Sankura", "Misrak Azernet", "Wulbareg", "Alaba Special Woreda"],
    "Yem Special Zone": ["Yem"]
  },
  "South Ethiopia Regional State": {
    "Gedeo": ["Wenago", "Yirgachefe", "Kochire", "Bule", "Dila Zuria", "Gedeb", "Dila (Town)"],
    "Wolayita": ["Boloso Sore", "Damot Gale", "Damot Woyide", "Humbo", "Sodo Zuria", "Kindo Koyisha", "Ofa", "Boloso Bonibe", "Damot Sore", "Kindo Didaye", "Damot Pulasa", "Deguna Fanigo", "Sodo (Town)"],
    "Gamo": ["Melekoza", "Denibu Gofa", "Kucha", "Boreda", "Merab Abaya", "Arba Minch Zuriya", "Chencha", "Dita", "Deramalo", "Zala", "Uba Debre Tsehay", "Kemba", "Bonke", "Ayida", "Arba Minch (Town)"],
    "Gofa": ["Genabosa", "Sawla (Town)", "Gezegofa"],
    "South Omo": ["Selamago", "Debub Ari", "Semen Ari", "Hamer", "Bena Tsemay", "Dasenech", "Male", "Nyangatom"],
    "Amaro Special Woreda": ["Amaro"],
    "Burji Special Woreda": ["Burji"],
    "Konso Special Woreda": ["Konso"],
    "Derashe Special Woreda": ["Derashe"]
  },
  "South West Ethiopia Peoples' Region": {
    "Keffa Zone": ["Bonga Town Administration", "Wacha Town Administration", "Awurada Town Administration", "Deka Town Administration", "Shishinda Town Administration", "Gimbo Woreda", "Chena Woreda", "Adiyo Woreda", "Bita Woreda", "Cheta Woreda", "Decha Woreda", "Gesha Woreda", "Gewata Woreda", "Menjiwo Woreda", "Sayilem Woreda", "Shisho Ende Woreda", "Telo Woreda", "Goba Woreda"],
    "Bench Sheko Zone": ["Mizan Aman City Administration", "Siz Town Administration", "Semen Bench Woreda", "Debub Bench Woreda", "Shay Bench Woreda", "Gidi Bench Woreda", "Sheko Woreda", "Guraferda Woreda", "Kyef Woreda"],
    "Sheka Zone": ["Masha Town Administration", "Tepi City Administration", "Gecha Town Administration", "Masha Woreda", "Anderacha Woreda", "Yeki Woreda"],
    "Dawro Zone": ["Tarcha Town Administration", "Gesa Town Administration", "Waka Town Administration", "Mareka Woreda", "Loma Woreda", "Gena Bosa Woreda", "Isara Woreda", "Tocha Woreda", "Disa Woreda", "Mari Mansa Woreda", "Kechi Woreda", "Tercha Zuriya Woreda", "Zaba Gazo Woreda"],
    "West Omo Zone": ["Jemu Town Administration", "Bachuma Town Administration", "Maji Woreda", "Surma Woreda", "Meinit Shasha Woreda", "Meinit Goldiya Woreda", "Bero Woreda", "Gachit Woreda", "Gori Gesha Woreda"],
    "Konta Zone": ["Amaya Town Administration", "Amaya Zuria Woreda", "Ela Hanchano Woreda", "Konta Koysha Woreda", "Konta Special Woreda"]
  },
  "South West Shewa Zone": {
    "South West Shewa": ["Ameya", "Wonchi", "Woliso", "Dawo", "Ilu", "Sebeta Hawas", "Kersa Ena Malima", "Tole", "Becho", "Seden Sodo", "Woliso (Town)", "Goro", "Sodo Dacha", "Sebeta (Town)"]
  },
  "Sidama": {
    "Sidama Zone": ["Shebedino", "Hawassa Zuria", "Arbegona", "Dale", "Aleta Wendo", "Dara", "Hula", "Bensa", "Aroresa", "Boricha", "Gorche", "Malga", "Wensho", "Loko Abeya", "Chere", "Bursa", "Cheko", "Bona Zuria", "Wendo Genet", "Hawassa (Town)"]
  },
  "Gambela": {
    "Agnewak (Anuak) Zone": ["Gambella Zuria", "Abobo", "Gog", "Jor", "Dima", "Gambella (Town)"],
    "Nuwer (Nuer) Zone": ["Lare", "Jikawo", "Wantawa", "Akobo"],
    "Mezhenger (Majang) Zone": ["Godare", "Mengesh"],
    "Etang Special Zone": ["Itang"]
  },
  "Harari": {
    "Harari": ["Harari Town / Sub-cities"]
  },
  "Addis Ababa": {
    "Sub-Cities": ["Akaki Kaliti", "Nefas Silk-Lafto", "Kolfe Keranio", "Gulele", "Lideta", "Kirkos", "Arada", "Addis Ketema", "Yeka", "Bole", "Lemi Kura"]
  },
  "Dire Dawa": {
    "Dire Dawa": ["Dire Dawa Town"]
  }
};

export const SW_REGION_KEY = "South West Ethiopia Peoples' Region";

export interface KebeleDetail {
  name: string;
  ketenas: string[];
}

export const SW_KEBELE_DATA: Record<string, KebeleDetail[]> = {
  // Keffa Zone
  "Bonga Town Administration": [
    { name: "Kebele 01 (Central)", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03", "Ketena 04"] },
    { name: "Kebele 02 (Barta)", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03"] },
    { name: "Kebele 03 (Mesereta)", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03", "Ketena 04"] },
    { name: "Kebele 04 (Ketta)", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03"] },
    { name: "Kebele 05 (Shomba)", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03"] }
  ],
  "Wacha Town Administration": [
    { name: "Kebele 01", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Kebele 02", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Kebele 03", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Awurada Town Administration": [
    { name: "Kebele 01", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Kebele 02", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Deka Town Administration": [
    { name: "Kebele 01", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Kebele 02", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Shishinda Town Administration": [
    { name: "Kebele 01", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Kebele 02", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Gimbo Woreda": [
    { name: "Wushwush", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03"] },
    { name: "Dega Shocha", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Mankira", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03"] },
    { name: "Gojeb", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Koba", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Ufa Zuria", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03"] },
    { name: "Fegeba", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Kayakela", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Beda", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Chena Woreda": [
    { name: "Wacha Zuria", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Shoba", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03"] },
    { name: "Hinfilo", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Shama", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Ditto", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Yada", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Kaja", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Adiyo Woreda": [
    { name: "Boka", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Kaka Zuria", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03"] },
    { name: "Awurado", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Chiralo", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Gaya", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Saja", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Alarigeta", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Bita Woreda": [
    { name: "Bita Genet Town", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03"] },
    { name: "Sisgota", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Soba", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Goba", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Bita Zuria", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Kasha", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Cheta Woreda": [
    { name: "Shama Town", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Goba", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Gola", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Gadi", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Cheta Zuria", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Decha Woreda": [
    { name: "Awurada Zuria", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Modio", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03"] },
    { name: "Shena", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Chiri", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Goba", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Bonga Rural", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Yadeta", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Gesha Woreda": [
    { name: "Daka Town", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Buttalo", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Godere", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Gesha Zuria", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Yina", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Gewata Woreda": [
    { name: "Qonda Town", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Gewata Zuria", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Koda", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Sheka", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Azemer", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Menjiwo Woreda": [
    { name: "Adiya Kaka Town", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Menjiwo Zuria", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Shapa", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Koba", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Sayilem Woreda": [
    { name: "Yadota Town", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Sayilem Zuria", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Gura", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Yango", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Shisho Ende Woreda": [
    { name: "Shishinda Town", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03"] },
    { name: "Shisho Zuria", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Ende Town", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Zaja", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Telo Woreda": [
    { name: "Oda Town", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Telo Zuria", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Fegeba", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Zephe", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Goba Woreda": [
    { name: "Uda Dish Town", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Goba Zuria", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Mera", ketenas: ["Ketena 01", "Ketena 02"] }
  ],

  // Bench Sheko Zone
  "Mizan Aman City Administration": [
    { name: "Addis Ketema", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03", "Ketena 04", "Ketena 05"] },
    { name: "Shesheka", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03"] },
    { name: "Hibret", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03", "Ketena 04"] },
    { name: "Kometa", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03"] },
    { name: "Aman 01", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03", "Ketena 04"] },
    { name: "Mizan 02", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03"] },
    { name: "Edget", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03"] }
  ],
  "Siz Town Administration": [
    { name: "Siz 01", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03"] },
    { name: "Siz 02", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Siz 03", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Semen Bench Woreda": [
    { name: "Gidi", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Size", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Semen Zuria", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03"] },
    { name: "Kite", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Biya", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Yayu", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Debub Bench Woreda": [
    { name: "Kou", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Bowu", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Goba", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Debub Zuria", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03"] },
    { name: "Jaba", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Shay Bench Woreda": [
    { name: "Shay Town", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "She Zuria", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03"] },
    { name: "Muka", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Biti", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Gidi Bench Woreda": [
    { name: "Gidi Town", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Gidi Zuria", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Temen", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Sheko Woreda": [
    { name: "Sheko Town", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03"] },
    { name: "Shimi", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Ganza", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Goba", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Shaita", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Bajeket", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Guraferda Woreda": [
    { name: "Kuja Town", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03"] },
    { name: "Gabika", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Biftu", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Shuki", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Berji", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Biyaf", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Kyef Woreda": [
    { name: "Kyef Town", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Kyef Zuria", ketenas: ["Ketena 01", "Ketena 02"] }
  ],

  // Sheka Zone
  "Masha Town Administration": [
    { name: "Masha 01", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03"] },
    { name: "Masha 02", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Masha 03", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Gecha Town Administration": [
    { name: "Gecha 01", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Gecha 02", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Masha Woreda": [
    { name: "Abelo", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03"] },
    { name: "Gatimo", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Beto", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Masha Zuria", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03"] },
    { name: "Keja", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Sali", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Yina", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Tepi City Administration": [
    { name: "Tepi 01", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03", "Ketena 04"] },
    { name: "Tepi 02", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03"] },
    { name: "Tepi 03", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03", "Ketena 04"] },
    { name: "Kubito", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Selam", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Anderacha Woreda": [
    { name: "Gecha Town", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03"] },
    { name: "Anderacha Zuria", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Shaki", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Chege", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Yina", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Yeki Woreda": [
    { name: "Tepi Zuria", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03"] },
    { name: "Alidu", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Sefi", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Kubito Rural", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Shoba", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Beki", ketenas: ["Ketena 01", "Ketena 02"] }
  ],

  // Dawro Zone
  "Tarcha Town Administration": [
    { name: "Tarcha 01", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03", "Ketena 04"] },
    { name: "Tarcha 02", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03"] },
    { name: "Tarcha 03", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Gesa Town Administration": [
    { name: "Gesa 01", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Gesa 02", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Waka Town Administration": [
    { name: "Waka 01", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03"] },
    { name: "Waka 02", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Mareka Woreda": [
    { name: "Waka Zuria", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Mareka Zuria", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03"] },
    { name: "Tercha Rural", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Goba", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Daza", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Loma Woreda": [
    { name: "Gesa Rural", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Loma Zuria", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03"] },
    { name: "Halala", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Bala", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Yina", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Gena Bosa Woreda": [
    { name: "Qisra Town", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Gena Zuria", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Bosa Town", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Zaba", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Isara Woreda": [
    { name: "Bale Town", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Isara Zuria", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Disa Rural", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Tocha Woreda": [
    { name: "Tocha Town", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Tocha Zuria", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03"] },
    { name: "Amba", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Disa Woreda": [
    { name: "Disa Town", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Disa Zuria", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Mari Mansa Woreda": [
    { name: "Mansa Town", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Mari Zuria", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Kechi Woreda": [
    { name: "Kechi Town", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Kechi Zuria", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Tercha Zuriya Woreda": [
    { name: "Zuria 01", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Zuria 02", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Zuria 03", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Zaba Gazo Woreda": [
    { name: "Gazo Town", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Zaba Zuria", ketenas: ["Ketena 01", "Ketena 02"] }
  ],

  // West Omo Zone
  "Jemu Town Administration": [
    { name: "Jemu 01", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03"] },
    { name: "Jemu 02", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Jemu 03", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Bachuma Town Administration": [
    { name: "Bachuma 01", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Bachuma 02", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Maji Woreda": [
    { name: "Maji Town", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Maji Zuria", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03"] },
    { name: "Tum", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Gesi", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Cheber", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Surma Woreda": [
    { name: "Kibish Town", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Surma Zuria", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Tulgit", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Koka", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Meinit Shasha Woreda": [
    { name: "Shasha Town", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Jemu Rural", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03"] },
    { name: "Dizi", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Meinit Goldiya Woreda": [
    { name: "Bachuma Town", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03"] },
    { name: "Goldiya Zuria", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Chiri Rural", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Komi", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Bero Woreda": [
    { name: "Chiri Town", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Bero Zuria", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03"] },
    { name: "Shama", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Gachit Woreda": [
    { name: "Gachit Town", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Gachit Zuria", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Gori Gesha Woreda": [
    { name: "Gori Town", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Gesha Rural", ketenas: ["Ketena 01", "Ketena 02"] }
  ],

  // Konta Zone
  "Amaya Town Administration": [
    { name: "Amaya 01", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03"] },
    { name: "Amaya 02", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Amaya 03", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Amaya Zuria Woreda": [
    { name: "Amaya Rural", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03"] },
    { name: "Chembela", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Chida", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03"] },
    { name: "Yina", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Ela Hanchano Woreda": [
    { name: "Hanchano Town", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Ela Zuria", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Boke", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Konta Koysha Woreda": [
    { name: "Koysha Rural", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Omo Valley Sector", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Goba", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Konta Special Woreda": [
    { name: "Konta Town", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Konta Zuria", ketenas: ["Ketena 01", "Ketena 02"] }
  ],

  // South West Shewa
  "Woliso (Town)": [
    { name: "Kebele 01", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03"] },
    { name: "Kebele 02", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03"] },
    { name: "Kebele 03", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Kebele 04", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Woliso": [
    { name: "Woliso Zuria", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Oba", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Bedesa", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Dilla", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Sebeta (Town)": [
    { name: "Kebele 01", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03"] },
    { name: "Kebele 02", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Kebele 03", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Alamgana", ketenas: ["Ketena 01", "Ketena 02", "Ketena 03"] }
  ],
  "Sebeta Hawas": [
    { name: "Sebeta Zuria", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Dima", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Hawas", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Wechecha", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Ameya": [
    { name: "Gedo", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Ameya Zuria", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Chiracha", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Wonchi": [
    { name: "Chitu Town", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Wonchi Zuria", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Haro", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Lemman", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Dawo": [
    { name: "Bacheno", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Dawo Zuria", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Dega", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Ilu": [
    { name: "Teji Town", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Ilu Zuria", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Tole", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Kersa Ena Malima": [
    { name: "Kersa Town", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Malima Zuria", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Tole": [
    { name: "Tole Town", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Tole Zuria", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Becho": [
    { name: "Awash Buntala", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Becho Zuria", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Busa", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Seden Sodo": [
    { name: "Harbu Town", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Seden Zuria", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Goro": [
    { name: "Goro Town", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Goro Zuria", ketenas: ["Ketena 01", "Ketena 02"] }
  ],
  "Sodo Dacha": [
    { name: "Dacha Town", ketenas: ["Ketena 01", "Ketena 02"] },
    { name: "Sodo Zuria", ketenas: ["Ketena 01", "Ketena 02"] }
  ]
};

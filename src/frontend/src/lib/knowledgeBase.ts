interface CountryData {
  capital: string;
  population: string;
  languages: string[];
  geography: string;
  history: string;
  culture: string;
  famousLandmarks: string[];
  government?: string;
  economy?: string;
}

const knowledgeBase: Record<string, CountryData> = {
  japan: {
    capital: "Tokyo",
    population: "~125 million",
    languages: ["Japanese"],
    geography:
      "Japan is an island nation in East Asia, comprising four main islands (Honshu, Hokkaido, Kyushu, and Shikoku) and thousands of smaller ones. It sits in the Pacific Ring of Fire, making it prone to earthquakes and volcanic activity. Mount Fuji, at 3,776 meters, is Japan's highest peak.",
    history:
      "Japan has a rich history spanning thousands of years. The Jomon period (14,000–300 BC) saw one of the world's oldest pottery cultures. The feudal era featured powerful shoguns and samurai warriors. Japan underwent rapid modernization during the Meiji Restoration (1868), transforming into a major industrial power. After World War II (1939–1945), Japan rebuilt itself into the world's third-largest economy.",
    culture:
      "Japanese culture is a unique blend of ancient tradition and modern innovation. Known for tea ceremonies, ikebana (flower arranging), kabuki theater, and sumo wrestling. Anime, manga, and video games have made Japan a global pop-culture leader. The concept of 'wa' (harmony) and 'omotenashi' (hospitality) are core cultural values.",
    famousLandmarks: [
      "Mount Fuji",
      "Tokyo Tower",
      "Fushimi Inari Shrine in Kyoto",
      "Hiroshima Peace Memorial",
      "Senso-ji Temple in Asakusa",
      "Nijo Castle",
    ],
    government: "Constitutional monarchy with a parliamentary government",
    economy:
      "Third-largest economy in the world, known for automobiles (Toyota, Honda), electronics (Sony, Panasonic), and robotics.",
  },
  china: {
    capital: "Beijing",
    population: "~1.4 billion",
    languages: ["Mandarin Chinese", "Cantonese", "Wu", "Min", "Hakka"],
    geography:
      "China is the world's fourth-largest country by total area. It features diverse landscapes including the Himalayas, the Gobi Desert, the Yangtze and Yellow Rivers, and a vast Pacific coastline. The country spans from tropical regions in the south to subarctic conditions in the north.",
    history:
      "China has one of the world's oldest continuous civilizations, dating back over 5,000 years. It was unified under the Qin Dynasty in 221 BC. Major dynasties include Han, Tang, Song, Ming, and Qing. The Republic of China was established in 1912, followed by the People's Republic of China in 1949 under Mao Zedong. China has since become a global superpower.",
    culture:
      "Chinese culture emphasizes family, respect for elders, and Confucian values. Chinese cuisine (with regional styles like Cantonese, Sichuan, and Peking), traditional medicine, kung fu martial arts, and Mandarin opera are world-famous. The Spring Festival (Chinese New Year) is the most important cultural event.",
    famousLandmarks: [
      "Great Wall of China",
      "Forbidden City in Beijing",
      "Terracotta Army in Xi'an",
      "Zhangjiajie National Forest Park",
      "West Lake in Hangzhou",
      "Li River in Guilin",
    ],
    government:
      "People's Republic — single-party state led by the Communist Party",
    economy:
      "Second-largest economy globally, a manufacturing powerhouse and major exporter.",
  },
  usa: {
    capital: "Washington D.C.",
    population: "~335 million",
    languages: ["English", "Spanish"],
    geography:
      "The United States is the third-largest country in the world, spanning from the Atlantic to the Pacific Ocean. It includes diverse landscapes: the Rocky Mountains, Great Plains, Appalachians, Great Lakes, Mississippi River, and both Arctic (Alaska) and tropical (Hawaii) regions.",
    history:
      "Indigenous peoples inhabited North America for thousands of years before European colonization. The United States declared independence from Britain in 1776 and established its Constitution in 1787. The Civil War (1861–1865) ended slavery. The 20th century saw the US emerge as a global superpower after both World Wars, followed by the Cold War era and its role as a dominant world power into the 21st century.",
    culture:
      "American culture is a mosaic of diverse traditions from immigrant communities worldwide. It is known for Hollywood films, jazz and hip-hop music, fast food, baseball, and American football. Core values include individualism, freedom, and innovation. Silicon Valley drives global technology trends.",
    famousLandmarks: [
      "Statue of Liberty",
      "Grand Canyon",
      "Golden Gate Bridge",
      "White House",
      "Yellowstone National Park",
      "Times Square",
    ],
    government: "Federal constitutional republic",
    economy:
      "Largest economy in the world, leading in technology, finance, agriculture, and military spending.",
  },
  india: {
    capital: "New Delhi",
    population: "~1.44 billion (most populous country)",
    languages: [
      "Hindi",
      "English",
      "Bengali",
      "Telugu",
      "Marathi",
      "Tamil",
      "Urdu",
      "Gujarati",
      "22 scheduled languages total",
    ],
    geography:
      "India occupies most of the Indian subcontinent, bordered by the Himalayas to the north and the Indian Ocean to the south. It includes diverse landscapes: tropical rainforests, arid deserts (Thar Desert), fertile plains (Gangetic Plain), and over 7,500 km of coastline.",
    history:
      "India has one of the world's oldest civilizations, with the Indus Valley Civilization dating to 3300 BC. It was home to the Vedic period, Maurya and Gupta Empires, and the Mughal Empire. After nearly 200 years of British colonial rule, India gained independence in 1947 under Mahatma Gandhi's nonviolent movement.",
    culture:
      "India is extraordinarily diverse in religion, language, and tradition. Hinduism, Islam, Christianity, Sikhism, Buddhism, and Jainism all have deep roots here. Bollywood is the world's largest film industry. Yoga, Ayurveda, classical dance (Bharatanatyam, Kathak), and festivals like Diwali and Holi are globally recognized.",
    famousLandmarks: [
      "Taj Mahal in Agra",
      "Red Fort in Delhi",
      "Jaipur City Palace",
      "Varanasi Ghats",
      "Ajanta and Ellora Caves",
      "Kerala Backwaters",
    ],
    government: "Federal parliamentary constitutional republic",
    economy:
      "Fifth-largest economy by nominal GDP, growing rapidly in IT, services, and manufacturing.",
  },
  brazil: {
    capital: "Brasília",
    population: "~215 million",
    languages: ["Portuguese"],
    geography:
      "Brazil is the largest country in South America and the fifth-largest in the world. It contains the Amazon Rainforest (the world's largest), the Pantanal wetlands, the Atlantic Forest, and the cerrado savanna. Major rivers include the Amazon, São Francisco, and Paraná.",
    history:
      "Indigenous peoples populated Brazil for thousands of years before Portuguese explorer Pedro Álvares Cabral arrived in 1500. Brazil was a Portuguese colony until 1822, when it gained independence and became an empire under Dom Pedro I. It became a republic in 1889. The 20th century saw major economic growth, military dictatorship (1964–1985), and a return to democracy.",
    culture:
      "Brazilian culture is a vibrant fusion of indigenous, African, and European influences. Carnival in Rio de Janeiro is one of the world's most spectacular festivals. Samba and bossa nova music originated here. Football (soccer) is a national passion — Brazil has won the FIFA World Cup five times. Capoeira, a martial art-dance hybrid, is a uniquely Brazilian art form.",
    famousLandmarks: [
      "Christ the Redeemer in Rio de Janeiro",
      "Iguazu Falls",
      "Amazon River",
      "Sugarloaf Mountain",
      "Pantanal Wetlands",
      "Copacabana Beach",
    ],
    government: "Federal presidential constitutional republic",
    economy:
      "Largest economy in South America, strong in agriculture, mining, and manufacturing.",
  },
  nigeria: {
    capital: "Abuja",
    population: "~220 million (most populous country in Africa)",
    languages: [
      "English (official)",
      "Hausa",
      "Yoruba",
      "Igbo",
      "Fulfulde",
      "over 500 languages total",
    ],
    geography:
      "Nigeria is located in West Africa, on the Gulf of Guinea. It features diverse terrain including tropical rainforest in the south, savanna in the middle belt, and the semi-arid Sahel in the far north. The Niger and Benue rivers are the major waterways.",
    history:
      "The region of present-day Nigeria was home to ancient kingdoms including the Nok civilization, the Kingdom of Benin, the Oyo Empire, and the Kanem-Bornu Empire. British colonization began in the 19th century; Nigeria gained independence on October 1, 1960. It experienced a civil war (Biafran War, 1967–1970) and alternating periods of civilian and military rule before sustained democracy from 1999.",
    culture:
      "Nigeria has an incredibly rich and diverse culture reflecting its 250+ ethnic groups. Nollywood (Nigerian film industry) is the second-largest in the world. Afrobeats music — pioneered by artists like Fela Kuti and now Burna Boy and Wizkid — has global influence. Traditional festivals, vibrant textiles, and elaborate masquerades are central to cultural life.",
    famousLandmarks: [
      "Zuma Rock",
      "Olumo Rock in Abeokuta",
      "Yankari National Park",
      "Osun-Osogbo Sacred Grove",
      "Lekki Conservation Centre",
      "National Museum Lagos",
    ],
    government: "Federal presidential constitutional republic",
    economy:
      "Largest economy in Africa, driven by oil exports, agriculture, and a booming tech sector.",
  },
  egypt: {
    capital: "Cairo",
    population: "~105 million",
    languages: ["Arabic"],
    geography:
      "Egypt spans northeastern Africa and the Sinai Peninsula in Asia. Most of the country is desert — the Sahara and Eastern Desert — with life concentrated along the Nile River valley and delta. The Sinai Peninsula features mountains including Mount Sinai. Egypt borders the Red Sea and the Mediterranean.",
    history:
      "Ancient Egypt is one of humanity's oldest and most fascinating civilizations, emerging around 3100 BC. It was ruled by pharaohs for nearly 3,000 years, building incredible monuments. Egypt was later conquered by Persia, Alexander the Great, Rome, and the Arab Caliphate (which brought Islam in 641 AD). It was part of the Ottoman Empire before British occupation, gaining independence in 1952 under Gamal Abdel Nasser.",
    culture:
      "Egyptian culture blends ancient Pharaonic traditions with Islamic and Arab influences. Arabic literature, music (Om Kalthoum is an iconic singer), and cinema are cornerstones. Traditional foods include koshari, foul medames, and ful. The month of Ramadan is observed with great devotion. Ancient monuments coexist with modern city life.",
    famousLandmarks: [
      "Pyramids of Giza",
      "Sphinx",
      "Valley of the Kings in Luxor",
      "Abu Simbel Temples",
      "Karnak Temple",
      "Egyptian Museum in Cairo",
    ],
    government: "Presidential republic",
    economy:
      "Driven by tourism, Suez Canal revenues, remittances, and natural gas exports.",
  },
  france: {
    capital: "Paris",
    population: "~68 million",
    languages: ["French"],
    geography:
      "France is located in Western Europe, with coastlines on the Atlantic Ocean, English Channel, and Mediterranean Sea. It has diverse landscapes: the Alps and Pyrenees mountains, the Loire Valley, the Massif Central plateau, and fertile plains. France also has overseas territories worldwide.",
    history:
      "France has a history going back to ancient Gaul (Celtic tribes) and Roman conquest. The Frankish Kingdom under Charlemagne unified much of Europe. The French Revolution (1789) transformed the country and influenced democracy worldwide. Napoleon Bonaparte created a vast empire before his defeat. France was central to both World Wars and helped found the European Union.",
    culture:
      "France is synonymous with art, cuisine, and fashion. It produced masters like Monet, Picasso, and Rodin. French cuisine is a UNESCO Cultural Heritage — wine, cheese, baguettes, and haute cuisine are world-famous. Fashion houses like Chanel, Louis Vuitton, and Dior originated here. Philosophy (Descartes, Voltaire, Sartre) and literature have global influence.",
    famousLandmarks: [
      "Eiffel Tower",
      "Louvre Museum",
      "Palace of Versailles",
      "Notre-Dame Cathedral",
      "Mont Saint-Michel",
      "French Riviera (Côte d'Azur)",
    ],
    government: "Semi-presidential republic",
    economy:
      "Seventh-largest economy globally, strong in luxury goods, aerospace, pharmaceuticals, and tourism.",
  },
  germany: {
    capital: "Berlin",
    population: "~84 million",
    languages: ["German"],
    geography:
      "Germany is located in Central Europe, bordered by nine countries. It features the North German Plain in the north, the Rhine and Danube rivers, the Black Forest, and the Bavarian Alps in the south. The Rhine Valley is famous for its vineyards and medieval castles.",
    history:
      "Germanic tribes resisted Roman expansion and later formed the Holy Roman Empire (962–1806). Germany was unified by Bismarck in 1871. The Weimar Republic followed World War I, leading to the Nazi dictatorship under Hitler (1933–1945) and World War II. Germany was divided into East and West until reunification in 1990, becoming a cornerstone of European democracy.",
    culture:
      "Germany has enormous contributions to classical music (Bach, Beethoven, Brahms), philosophy (Kant, Hegel, Nietzsche), and literature (Goethe, Schiller). The Christmas market tradition is beloved worldwide. Beer culture, especially the Oktoberfest in Munich, is iconic. Engineering and precision manufacturing are deeply embedded in German identity.",
    famousLandmarks: [
      "Brandenburg Gate in Berlin",
      "Neuschwanstein Castle in Bavaria",
      "Cologne Cathedral",
      "Berlin Wall Memorial",
      "Heidelberg Castle",
      "Rhine Valley",
    ],
    government: "Federal parliamentary republic",
    economy:
      "Fourth-largest economy globally, Europe's largest, known for automobile manufacturing (BMW, Mercedes-Benz, Volkswagen).",
  },
  uk: {
    capital: "London",
    population: "~67 million",
    languages: ["English", "Welsh", "Scottish Gaelic"],
    geography:
      "The United Kingdom consists of England, Scotland, Wales, and Northern Ireland. It is an island nation separated from mainland Europe by the English Channel. Scotland has dramatic Highlands and lochs; Wales has mountains and coastlines; England features rolling countryside and major rivers.",
    history:
      "Britain was inhabited by Celtic peoples before Roman conquest (43 AD). After Roman withdrawal, Anglo-Saxons, Vikings, and Normans shaped England. The Magna Carta (1215) laid foundations for modern democracy. Britain built the largest empire in history (the British Empire), influencing nearly every corner of the globe. The UK was pivotal in both World Wars and helped establish NATO and the UN.",
    culture:
      "British culture has profoundly shaped world language, law, and popular culture. Shakespeare remains the most performed playwright in history. The BBC is a global media institution. British music — from The Beatles to Adele — has global impact. The monarchy, cricket, football, afternoon tea, and pub culture are cultural touchstones.",
    famousLandmarks: [
      "Big Ben and Houses of Parliament",
      "Tower of London",
      "Stonehenge",
      "Buckingham Palace",
      "Edinburgh Castle",
      "White Cliffs of Dover",
    ],
    government: "Constitutional monarchy with parliamentary democracy",
    economy:
      "Sixth-largest economy globally, leading in finance (London is a world financial center), creative industries, and services.",
  },
  australia: {
    capital: "Canberra",
    population: "~26 million",
    languages: ["English"],
    geography:
      "Australia is both a continent and a country, the world's sixth-largest by area. It is mostly flat and arid, with the Outback covering much of the interior. Major features include the Great Barrier Reef, the Kimberley region, the Red Centre (Uluru), and a diverse coastline.",
    history:
      "Aboriginal Australians have lived on the continent for over 65,000 years, one of the longest continuous cultural histories on Earth. European exploration began with the Dutch in the 17th century; British settlement started in 1788 with a penal colony in Sydney. Australia federated as a nation in 1901 and has evolved into a multicultural democracy.",
    culture:
      "Australian culture is shaped by Indigenous heritage, British colonial influence, and waves of immigration. The 'fair go' ethos and laid-back beach lifestyle are cultural hallmarks. Australian rules football, cricket, and surfing are beloved sports. The arts scene thrives, with unique wildlife (kangaroos, koalas, platypus) being globally iconic.",
    famousLandmarks: [
      "Sydney Opera House",
      "Great Barrier Reef",
      "Uluru (Ayers Rock)",
      "Sydney Harbour Bridge",
      "Daintree Rainforest",
      "Bondi Beach",
    ],
    government: "Federal parliamentary constitutional monarchy",
    economy:
      "Twelfth-largest economy, strong in mining, agriculture, services, and tourism.",
  },
  canada: {
    capital: "Ottawa",
    population: "~38 million",
    languages: ["English", "French"],
    geography:
      "Canada is the world's second-largest country, spanning from the Atlantic to the Pacific and north to the Arctic. It has vast boreal forests, the Rocky Mountains, the Great Lakes, the St. Lawrence River, and tundra in the north. It borders the United States to the south and has the world's longest coastline.",
    history:
      "Indigenous nations have lived in Canada for over 15,000 years. European exploration began with the Norse around 1000 AD and later with Cabot and Cartier. France and Britain competed for control; the British eventually prevailed. Canada gained increasing autonomy from Britain, becoming fully independent with the Constitution Act of 1982.",
    culture:
      "Canadian culture reflects Indigenous heritage, British and French colonial roots, and massive immigration from around the world. Hockey is the national sport and cultural obsession. Canada is known for multiculturalism, maple syrup, the Rocky Mountains, and poutine. Indigenous cultures, art, and languages are increasingly recognized and celebrated.",
    famousLandmarks: [
      "Niagara Falls",
      "CN Tower in Toronto",
      "Banff National Park",
      "Parliament Hill in Ottawa",
      "Old Quebec City",
      "Vancouver Island",
    ],
    government: "Federal parliamentary constitutional monarchy",
    economy:
      "Tenth-largest economy, strong in natural resources, technology, and financial services.",
  },
  mexico: {
    capital: "Mexico City",
    population: "~128 million",
    languages: [
      "Spanish",
      "68 indigenous languages including Nahuatl and Maya",
    ],
    geography:
      "Mexico is located in North America, bordering the US to the north and Central America to the south. It features a high central plateau, two major mountain ranges (Sierra Madre), tropical rainforests in the south, deserts in the north, and beautiful coastlines on both the Pacific and the Gulf of Mexico/Caribbean.",
    history:
      "Mexico was home to remarkable pre-Columbian civilizations including the Olmec, Maya, Toltec, and Aztec empires. Spanish conquistador Hernán Cortés conquered the Aztec Empire in 1521, and Mexico remained under Spanish rule for 300 years. Independence was achieved in 1821 after a decade of war, followed by turbulent periods, revolution (1910–1920), and eventual democratic stability.",
    culture:
      "Mexican culture is a rich blend of indigenous and Spanish heritage. Día de los Muertos (Day of the Dead) is a unique and colorful celebration. Mexican cuisine — tacos, mole, tamales, enchiladas — is a UNESCO Intangible Cultural Heritage. Mariachi music, lucha libre wrestling, and vibrant folk art (Frida Kahlo's paintings) are globally recognized.",
    famousLandmarks: [
      "Chichen Itza",
      "Teotihuacan Pyramids",
      "Palenque Ruins",
      "Copper Canyon",
      "Cenotes of the Yucatan",
      "Mexico City Historic Center",
    ],
    government: "Federal presidential constitutional republic",
    economy:
      "Fifteenth-largest economy globally, strong in manufacturing, tourism, oil, and remittances from the US.",
  },
  southafrica: {
    capital:
      "Pretoria (administrative), Cape Town (legislative), Bloemfontein (judicial)",
    population: "~60 million",
    languages: [
      "11 official languages: Zulu, Xhosa, Afrikaans, English, Sesotho, Tswana, Tsonga, Swati, Venda, Ndebele, Sotho",
    ],
    geography:
      "South Africa occupies the southern tip of Africa. It has diverse landscapes: the Drakensberg Mountains, the Kalahari Desert, the Garden Route coastline, the bushveld savanna, and the Cape Floristic Region (one of the world's 6 floral kingdoms). Table Mountain is an iconic landmark.",
    history:
      "The San and Khoikhoi peoples were the original inhabitants. Bantu-speaking peoples migrated south over centuries. Dutch settlers arrived in 1652, followed by British colonization. The discovery of diamonds (1867) and gold (1886) transformed the region. The apartheid system of racial segregation lasted from 1948 to 1994, when Nelson Mandela led the country to democratic elections.",
    culture:
      "South Africa is called the 'Rainbow Nation' for its diverse cultures and languages. Ubuntu philosophy ('I am because we are') is central to African culture. Braaivleis (barbecue), biltong (dried meat), and bobotie are national foods. Traditional music, storytelling, and dance vary dramatically across ethnic groups. Rugby and cricket are passionately followed.",
    famousLandmarks: [
      "Table Mountain in Cape Town",
      "Kruger National Park",
      "Robben Island",
      "Blyde River Canyon",
      "Cape of Good Hope",
      "God's Window in Mpumalanga",
    ],
    government: "Constitutional democracy and republic",
    economy:
      "Most industrialized economy in Africa, with mining, finance, agriculture, and tourism as key sectors.",
  },
  russia: {
    capital: "Moscow",
    population: "~145 million",
    languages: ["Russian", "100+ minority languages"],
    geography:
      "Russia is the world's largest country, spanning 11 time zones across Eastern Europe and Northern Asia. It features vast plains (the West Siberian Plain), the Ural Mountains, the Siberian taiga, Lake Baikal (deepest lake on Earth), and the volcanoes of Kamchatka. Major rivers include the Volga, Ob, and Yenisei.",
    history:
      "The Kievan Rus was the first East Slavic state (9th–13th centuries). The Mongol invasion devastated the region before Ivan III united Russian principalities. Peter the Great (1672–1725) modernized Russia into a European power. The Russian Revolution of 1917 brought the Bolsheviks to power, creating the Soviet Union, which collapsed in 1991.",
    culture:
      "Russia's cultural contributions are immense: Tolstoy, Dostoevsky, and Chekhov in literature; Tchaikovsky and Stravinsky in music; the Bolshoi Ballet; and iconic Fabergé eggs. Russian cuisine features borscht, beef stroganoff, and blini. Orthodox Christianity remains central to cultural identity. Space exploration is a national source of pride — Yuri Gagarin was the first human in space.",
    famousLandmarks: [
      "Red Square and St. Basil's Cathedral in Moscow",
      "Hermitage Museum in St. Petersburg",
      "Lake Baikal",
      "Trans-Siberian Railway",
      "Kremlin",
      "Peterhof Palace",
    ],
    government: "Federal semi-presidential republic",
    economy:
      "Eleventh-largest economy, heavily reliant on oil and gas exports, with significant military and space industries.",
  },
  italy: {
    capital: "Rome",
    population: "~60 million",
    languages: ["Italian"],
    geography:
      "Italy is a boot-shaped peninsula in Southern Europe, extending into the Mediterranean Sea. It includes the Alps in the north, the Apennine Mountains running down the spine of the peninsula, and two large islands (Sicily and Sardinia). The Po Valley in the north is the most fertile agricultural region.",
    history:
      "Ancient Rome was one of history's greatest civilizations, eventually becoming a vast empire stretching from Britain to the Middle East. After Rome's fall in 476 AD, Italy was fragmented into city-states during the Renaissance — the cradle of modern art, science, and humanism. Italian unification (Risorgimento) was achieved in 1861. Italy was a major participant in both World Wars.",
    culture:
      "Italy is the birthplace of the Renaissance, opera, and modern Western cuisine. Leonardo da Vinci, Michelangelo, Raphael, and Botticelli defined Western art. Italian fashion (Gucci, Versace, Armani) is globally dominant. Italy has the most UNESCO World Heritage Sites in the world. Football (calcio) is a national religion.",
    famousLandmarks: [
      "Colosseum in Rome",
      "Leaning Tower of Pisa",
      "Venice Canals",
      "Vatican City",
      "Amalfi Coast",
      "Cinque Terre",
    ],
    government: "Parliamentary republic",
    economy:
      "Eighth-largest economy globally, strong in fashion, automotive (Ferrari, Fiat), food and wine, and tourism.",
  },
  spain: {
    capital: "Madrid",
    population: "~47 million",
    languages: ["Spanish (Castilian)", "Catalan", "Galician", "Basque"],
    geography:
      "Spain occupies most of the Iberian Peninsula in Southwestern Europe and includes the Canary Islands and Balearic Islands. It features a high central plateau (the Meseta), the Pyrenees mountains bordering France, the Sierra Nevada in the south, and extensive Mediterranean and Atlantic coastlines.",
    history:
      "Spain was inhabited by Iberians, Celts, and later Phoenicians, Greeks, and Romans. After the fall of Rome, the Visigoths ruled until the Moorish conquest (711 AD). The Reconquista (reconquest) concluded in 1492, the same year Columbus sailed to the Americas, launching Spain's vast colonial empire. Spain was once the most powerful nation on Earth and a global empire.",
    culture:
      "Spanish culture is passionate and vibrant. Flamenco dance and guitar music originated in Andalucia. Spanish cuisine — paella, tapas, jamón, churros — is beloved worldwide. La Tomatina (tomato fight festival), San Fermín (running of the bulls), and Semana Santa (Holy Week) are iconic festivals. Artists like Picasso, Dalí, and Goya changed world art.",
    famousLandmarks: [
      "Sagrada Família in Barcelona",
      "Alhambra Palace in Granada",
      "Park Güell",
      "Prado Museum in Madrid",
      "Santiago de Compostela Cathedral",
      "Teide Volcano in Tenerife",
    ],
    government: "Constitutional monarchy with parliamentary democracy",
    economy:
      "Fourteenth-largest economy globally, strong in tourism, automotive, agriculture, and renewable energy.",
  },
  argentina: {
    capital: "Buenos Aires",
    population: "~46 million",
    languages: ["Spanish"],
    geography:
      "Argentina is the second-largest country in South America and eighth-largest in the world. It spans from the tropical north to the sub-Antarctic south (Patagonia and Tierra del Fuego). Major features include the Andes Mountains, the Pampas grasslands (one of the world's most fertile regions), the Atacama Desert, and Iguazu Falls.",
    history:
      "Indigenous peoples inhabited Argentina for thousands of years before Spanish colonization in the 16th century. Argentina declared independence in 1816. The 19th and early 20th centuries saw massive European immigration. A series of military juntas (1930–1983) ended with a return to democracy. Argentina defaulted on its debt several times but remains a major regional power.",
    culture:
      "Argentine culture is deeply European in character, particularly Spanish and Italian. Tango — the sensual dance born in Buenos Aires — is Argentina's greatest cultural export. Football is a national passion; Lionel Messi and Diego Maradona are national heroes. Beef and wine (especially Malbec from Mendoza) are culinary highlights. The gaucho (cowboy) is an enduring cultural symbol.",
    famousLandmarks: [
      "Iguazu Falls",
      "Perito Moreno Glacier",
      "Buenos Aires Obelisk",
      "Ushuaia (southernmost city)",
      "Patagonia",
      "Quebrada de Humahuaca",
    ],
    government: "Federal presidential constitutional republic",
    economy:
      "Third-largest economy in Latin America, strong in agriculture, cattle, soybeans, and lithium mining.",
  },
  southkorea: {
    capital: "Seoul",
    population: "~52 million",
    languages: ["Korean"],
    geography:
      "South Korea occupies the southern half of the Korean Peninsula in East Asia. It features mountainous terrain (covering 70% of the country), the Han River, and over 3,000 offshore islands. It has a coastline on both the Yellow Sea and the Sea of Japan (East Sea).",
    history:
      "Korea has a 5,000-year history, with kingdoms like Goguryeo, Baekje, and Silla shaping the peninsula. The Joseon Dynasty (1392–1897) was profoundly influenced by Confucian values. Japanese colonial rule lasted from 1910–1945. The Korean War (1950–1953) divided the peninsula; South Korea then underwent an economic miracle called the 'Miracle on the Han River,' transforming from one of the world's poorest to one of the wealthiest nations.",
    culture:
      "Korean culture, known as Hallyu (Korean Wave), has taken the world by storm. K-pop (BTS, Blackpink), K-dramas, and Korean cinema (Parasite won the Oscar for Best Picture) have global followings. Korean cuisine — bibimbap, kimchi, Korean BBQ, and tteokbokki — is internationally popular. Traditional culture includes Hanbok clothing, Taekwondo martial arts, and Buddhist temples.",
    famousLandmarks: [
      "Gyeongbokgung Palace in Seoul",
      "Jeju Island",
      "Bukchon Hanok Village",
      "DMZ (Demilitarized Zone)",
      "Seoraksan National Park",
      "Changdeokgung Palace",
    ],
    government: "Unitary presidential constitutional republic",
    economy:
      "Twelfth-largest economy globally, driven by Samsung, Hyundai, LG, and a booming tech industry.",
  },
  indonesia: {
    capital: "Jakarta (moving to Nusantara)",
    population: "~275 million (fourth most populous country)",
    languages: [
      "Indonesian (Bahasa Indonesia)",
      "700+ regional languages including Javanese and Sundanese",
    ],
    geography:
      "Indonesia is the world's largest archipelago, comprising over 17,000 islands spread across the equator. Major islands include Java, Sumatra, Borneo (Kalimantan), Sulawesi, and Papua. It sits on the Ring of Fire with over 130 active volcanoes. The country spans a significant portion of the equatorial region with vast tropical rainforests.",
    history:
      "Indonesia has ancient Hindu-Buddhist kingdoms, most famously the Majapahit Empire (13th–15th centuries), and later Islamic sultanates. The Dutch East India Company colonized the region for 350 years. Indonesia declared independence in 1945 under Sukarno after Japanese occupation. The Suharto regime (1967–1998) was followed by a return to democracy.",
    culture:
      "Indonesia's cultural richness reflects its hundreds of ethnic groups. Batik fabric is a UNESCO Cultural Heritage. The Borobudur is one of the world's greatest Buddhist monuments. Gamelan music, wayang shadow puppetry, and Balinese dance are internationally recognized. Indonesian cuisine — rendang, nasi goreng, satay — is beloved worldwide.",
    famousLandmarks: [
      "Borobudur Temple in Central Java",
      "Bali Hindu Temples (Tanah Lot, Uluwatu)",
      "Komodo National Park",
      "Prambanan Temple",
      "Raja Ampat Islands",
      "Mount Bromo Volcano",
    ],
    government: "Presidential constitutional republic",
    economy:
      "Sixteenth-largest economy globally, strong in natural resources, palm oil, coal, and a rapidly growing consumer market.",
  },
  turkey: {
    capital: "Ankara",
    population: "~85 million",
    languages: ["Turkish"],
    geography:
      "Turkey straddles both Europe and Asia, with a small portion in southeastern Europe (Thrace) and the majority (Anatolia/Asia Minor) in Asia. It is surrounded by three seas: the Mediterranean, Aegean, and Black Sea. Major features include the Taurus Mountains, the Anatolian Plateau, the Bosphorus strait, and the volcanic peak of Mount Ararat.",
    history:
      "Anatolia is one of the world's oldest inhabited regions, home to the Hittites, ancient Troy, and many other civilizations. The Byzantine Empire (Eastern Roman Empire) ruled from Constantinople for 1,000 years. The Ottoman Empire, founded in 1299, became one of the most powerful empires in history, lasting until 1922. Modern Turkey was founded by Mustafa Kemal Atatürk in 1923.",
    culture:
      "Turkish culture blends Central Asian, Middle Eastern, and Mediterranean influences. Cuisine — kebabs, baklava, mezes, and Turkish tea — is world-famous. Turkish baths (hammams), carpet weaving, and traditional music (saz, ney) are cultural hallmarks. The whirling dervishes of Sufism are unique. Istanbul is one of the world's most historically and culturally rich cities.",
    famousLandmarks: [
      "Hagia Sophia in Istanbul",
      "Cappadocia (fairy chimneys and hot air balloons)",
      "Ephesus ancient ruins",
      "Topkapi Palace",
      "Pamukkale (Cotton Castle)",
      "Mount Ararat",
    ],
    government: "Presidential republic",
    economy:
      "Seventeenth-largest economy globally, strong in textiles, automotive, agriculture, and tourism.",
  },
  saudiarabia: {
    capital: "Riyadh",
    population: "~35 million",
    languages: ["Arabic"],
    geography:
      "Saudi Arabia occupies most of the Arabian Peninsula. It is largely desert — the Rub' al Khali (Empty Quarter) is the world's largest contiguous sand desert. It borders the Red Sea to the west and the Persian Gulf to the east. The Hejaz region contains the holy cities of Mecca and Medina.",
    history:
      "The Arabian Peninsula is the birthplace of Islam. The Prophet Muhammad founded Islam in Mecca in the 7th century AD. Saudi Arabia as a modern state was founded by Abdulaziz Ibn Saud in 1932 by uniting various Arabian tribes. The discovery of oil in 1938 transformed the kingdom into one of the world's wealthiest nations.",
    culture:
      "Saudi culture is deeply rooted in Islamic traditions and Bedouin heritage. Hospitality (karam) is a supreme value — guests are always offered coffee and dates. Traditional dress (thobe for men, abaya for women) is common. Camel racing, falconry, and Arab horse breeding are traditional pastimes. Saudi Arabia is currently undergoing significant social changes under Vision 2030.",
    famousLandmarks: [
      "Masjid al-Haram (Grand Mosque) in Mecca",
      "Masjid an-Nabawi in Medina",
      "Hegra (Madain Saleh) ancient ruins",
      "Edge of the World near Riyadh",
      "Al-Ula",
      "Kingdom Centre Tower in Riyadh",
    ],
    government: "Absolute monarchy",
    economy:
      "World's largest oil exporter, OPEC leader, with massive sovereign wealth funds and Vision 2030 diversification program.",
  },
  kenya: {
    capital: "Nairobi",
    population: "~55 million",
    languages: ["Swahili", "English", "42 ethnic languages"],
    geography:
      "Kenya is located in East Africa, straddling the equator. It features diverse landscapes: the Great Rift Valley, Mount Kenya (the second-highest peak in Africa), the Maasai Mara savanna, Lake Victoria (shared), and beautiful Indian Ocean beaches. The country is famous for its wildlife-rich national parks.",
    history:
      "Kenya has been inhabited for millions of years — some of the earliest human fossil evidence comes from the Lake Turkana region. Arab traders established coastal city-states. British colonization began in the late 19th century. The Mau Mau uprising (1952–1960) accelerated independence, which Kenya achieved in 1963 under Jomo Kenyatta.",
    culture:
      "Kenya has over 40 ethnic groups, each with distinct cultures. The Maasai people are particularly famous for their distinctive red clothing, jumping dances, and pastoral lifestyle. Kenya is the birthplace of long-distance running — Kenyan athletes dominate global marathons. Safari tourism, Swahili coastal culture, and beadwork are cultural highlights.",
    famousLandmarks: [
      "Maasai Mara National Reserve",
      "Mount Kenya",
      "Amboseli National Park (views of Kilimanjaro)",
      "Tsavo National Park",
      "Lamu Old Town",
      "Lake Nakuru",
    ],
    government: "Presidential constitutional republic",
    economy:
      "East Africa's largest economy, driven by agriculture, tourism, telecommunications, and the growing tech sector ('Silicon Savannah').",
  },
  ethiopia: {
    capital: "Addis Ababa",
    population: "~120 million (second most populous in Africa)",
    languages: ["Amharic (official)", "Oromo", "Tigrinya", "80+ languages"],
    geography:
      "Ethiopia is in the Horn of Africa, a landlocked country with spectacular highland terrain. The Ethiopian Highlands are the largest continuous mountain mass in Africa. The Rift Valley runs through the country, containing lakes and hot springs. The Simien Mountains, the Blue Nile, and the Danakil Depression (one of Earth's hottest places) are major features.",
    history:
      "Ethiopia is one of the world's oldest nations, with human origins dating back millions of years (Lucy fossil found here). The Kingdom of Axum (4th century AD) adopted Christianity, making Ethiopia one of the first Christian nations. Ethiopia is the only African country never colonized by European powers (brief Italian occupation, 1936–1941). It was the founding location of the African Union.",
    culture:
      "Ethiopian culture is extraordinarily ancient and diverse. Ethiopian Orthodox Christianity is 1,700 years old. Coffee originated in Ethiopia (Kaffa region) — the coffee ceremony is central to social life. Injera (spongy flatbread) with stews (wat) is the national dish. Traditional music, colorful traditional dress (habesha kemis), and the Timkat (Epiphany) festival are celebrated.",
    famousLandmarks: [
      "Rock-Hewn Churches of Lalibela",
      "Aksum Obelisks",
      "Simien Mountains National Park",
      "Lake Tana and Blue Nile Falls",
      "Danakil Depression",
      "National Museum of Ethiopia (Lucy fossil)",
    ],
    government: "Federal parliamentary republic",
    economy:
      "One of Africa's fastest-growing economies, with agriculture, floriculture, textiles, and infrastructure development as key sectors.",
  },
  ghana: {
    capital: "Accra",
    population: "~32 million",
    languages: ["English (official)", "Akan", "Ewe", "Ga", "Dagbani"],
    geography:
      "Ghana is located in West Africa on the Gulf of Guinea. It features coastal savanna in the south, tropical rainforest in the southwest, and the Volta River system with Lake Volta (one of the world's largest artificial lakes). The Ashanti Plateau is in the central region.",
    history:
      "Ghana was home to powerful pre-colonial kingdoms, most notably the Ashanti Empire, famous for its gold wealth and military prowess. Portuguese, Dutch, and British colonizers established forts along the coast. Ghana became the first sub-Saharan African country to gain independence from colonial rule in 1957 under Kwame Nkrumah, inspiring independence movements across Africa.",
    culture:
      "Ghana is known as the 'Gateway to Africa.' Kente cloth — with its vibrant colors and patterns — is a symbol of Ashanti royalty now worn globally. Highlife and hiplife music are popular. The Homowo harvest festival celebrates abundance. Fufu (pounded yam), jollof rice, and kelewele (spiced plantain) are national dishes. Ghana is highly regarded for its stability and democracy in West Africa.",
    famousLandmarks: [
      "Cape Coast Castle",
      "Mole National Park",
      "Kakum National Park",
      "Ashanti Cultural Centre in Kumasi",
      "Larabanga Mosque",
      "Elmina Castle",
    ],
    government: "Constitutional democracy and republic",
    economy:
      "One of West Africa's strongest economies, with oil, gold, cocoa, and a growing tech ecosystem.",
  },
  morocco: {
    capital: "Rabat",
    population: "~37 million",
    languages: ["Arabic (official)", "Berber (Amazigh)", "French widely used"],
    geography:
      "Morocco is in North Africa, at the crossroads between Europe and Africa. It has a coastline on both the Atlantic Ocean and the Mediterranean Sea. Major features include the Atlas Mountains (High, Middle, and Anti-Atlas), the Sahara Desert in the south, and fertile coastal plains. The Strait of Gibraltar separates Morocco from Spain by just 14 km.",
    history:
      "Morocco has been inhabited since Paleolithic times. Berber (Amazigh) peoples are the indigenous inhabitants. Phoenicians, Romans, and Arabs all influenced Morocco's history. Arab/Islamic conquest in the 7th century was decisive. Morocco was never fully colonized — it was under French and Spanish protectorates (1912–1956) before independence. It has been a kingdom for over 1,200 years.",
    culture:
      "Moroccan culture blends Berber, Arab, and European influences. The medinas (old city centers) of Fes and Marrakech are UNESCO-listed labyrinths of souks, mosques, and riads. Tagine and couscous are the national dishes. Moroccan mint tea ceremony is sacred. Traditional crafts — zellige tilework, leather tanning, and carpet weaving — are centuries old.",
    famousLandmarks: [
      "Medina of Fes",
      "Djemaa el-Fna Square in Marrakech",
      "Hassan II Mosque in Casablanca",
      "Ait Benhaddou Kasbah",
      "Sahara Desert Dunes at Merzouga",
      "Chefchaouen (Blue City)",
    ],
    government: "Constitutional monarchy",
    economy:
      "Phosphate (world's largest reserves), tourism, agriculture, and remittances are key sectors.",
  },
  thailand: {
    capital: "Bangkok",
    population: "~70 million",
    languages: ["Thai"],
    geography:
      "Thailand is in Southeast Asia, bordering Myanmar, Laos, Cambodia, and Malaysia. It features a central plain (Chao Phraya River valley), mountains in the north, the Khorat Plateau in the northeast, and beautiful coastlines with islands in the Gulf of Thailand and the Andaman Sea.",
    history:
      "Thailand (formerly Siam) is the only Southeast Asian nation never colonized by a European power. The Sukhothai Kingdom (13th century) began Thai culture. The Ayutthaya Kingdom (1351–1767) was a major trading power. The Rattanakosin period began in 1782 with Bangkok as the new capital, and the Chakri Dynasty still reigns today.",
    culture:
      "Thai culture is deeply influenced by Theravada Buddhism. Elaborate temples (wats), monks in saffron robes, and the graceful wai greeting are ubiquitous. Thai cuisine — pad thai, green curry, tom yum soup, and mango sticky rice — is globally popular. Traditional dance, Muay Thai boxing, and elaborate festivals like Songkran (water festival) and Loi Krathong (lantern festival) are cultural treasures.",
    famousLandmarks: [
      "Grand Palace in Bangkok",
      "Wat Phra Kaew (Temple of the Emerald Buddha)",
      "Ayutthaya Historical Park",
      "Chiang Mai Temples",
      "Phi Phi Islands",
      "Doi Inthanon (Thailand's highest peak)",
    ],
    government: "Constitutional monarchy",
    economy:
      "Second-largest economy in Southeast Asia, strong in tourism, automotive, electronics, and agriculture (rice exporter).",
  },
  vietnam: {
    capital: "Hanoi",
    population: "~98 million",
    languages: ["Vietnamese"],
    geography:
      "Vietnam is an S-shaped country in Southeast Asia, bordering China, Laos, and Cambodia, with a long coastline on the South China Sea. Major features include the Red River Delta in the north, the Central Highlands, the Mekong River Delta in the south, and iconic limestone karst landscapes like Ha Long Bay.",
    history:
      "Vietnam has 4,000 years of history, largely defined by resistance to foreign domination — from Chinese rule for 1,000 years to French colonization (1859–1954) to American involvement in the Vietnam War (1955–1975). Ho Chi Minh led the independence movement, and Vietnam was reunified in 1975. Since 1986 Doi Moi economic reforms have transformed Vietnam into one of Asia's fastest-growing economies.",
    culture:
      "Vietnamese culture values family, community, and respect for ancestors. The ao dai (traditional long dress) is the national garment. Vietnamese cuisine — pho (noodle soup), banh mi, fresh spring rolls, and ca phe trung (egg coffee) — has become internationally beloved. Traditional water puppetry, the dan bau (single-stringed instrument), and Tet Lunar New Year celebrations are cultural highlights.",
    famousLandmarks: [
      "Ha Long Bay",
      "Hoi An Ancient Town",
      "Hue Imperial City",
      "My Son Sanctuary",
      "Phong Nha-Ke Bang National Park",
      "Ba Na Hills",
    ],
    government: "One-party socialist republic",
    economy:
      "One of Asia's fastest-growing economies, strong in manufacturing, electronics (Samsung), textiles, and agriculture.",
  },
  philippines: {
    capital: "Manila",
    population: "~115 million",
    languages: ["Filipino (Tagalog)", "English", "170+ regional languages"],
    geography:
      "The Philippines is an archipelago of 7,641 islands in Southeast Asia. It features volcanic mountains (Mount Mayon, Mount Pinatubo), lush rainforests, beautiful white-sand beaches, and the Chocolate Hills of Bohol. It sits in the typhoon belt and Ring of Fire.",
    history:
      "The Philippines has a rich pre-colonial culture of Austronesian peoples. Spain colonized the islands for 333 years (1565–1898), profoundly shaping culture, language, and religion. The US took control after the Spanish-American War; independence was gained in 1946. The country endured the Marcos dictatorship (1972–1986) before the People Power Revolution restored democracy.",
    culture:
      "Filipino culture is a unique blend of Malay, Spanish, Chinese, and American influences. The bayanihan spirit (community cooperation) is a core value. Filipino cuisine — adobo, sinigang, lechon, and halo-halo — is diverse and delicious. Filipinos are among the most talented English-speaking populations in Asia. Karaoke, basketball, and boxing (Manny Pacquiao) are national passions.",
    famousLandmarks: [
      "Chocolate Hills in Bohol",
      "Tubbataha Reef National Park",
      "Puerto Princesa Underground River",
      "Mayon Volcano",
      "Intramuros (historic walled city) in Manila",
      "Coron and El Nido in Palawan",
    ],
    government: "Presidential constitutional republic",
    economy:
      "One of Asia's emerging economies, strong in BPO (call centers), remittances, electronics manufacturing, and agriculture.",
  },
  pakistan: {
    capital: "Islamabad",
    population: "~225 million (fifth most populous)",
    languages: [
      "Urdu (national)",
      "English",
      "Punjabi",
      "Sindhi",
      "Pashto",
      "Balochi",
    ],
    geography:
      "Pakistan is in South Asia, bordering India, Afghanistan, Iran, and China. It features the Indus River plain, the Hindu Kush and Karakoram mountains (including K2, the world's second-highest peak), the Thar Desert, and the Arabian Sea coastline. The Khyber Pass is a historically significant mountain passage.",
    history:
      "The Indus Valley Civilization (2500–1700 BC) was one of the world's earliest urban civilizations. The region was home to the Gandhara Kingdom, the Achaemenid Persian Empire, Alexander the Great's easternmost conquests, the Maurya Empire, and the Mughal Empire. Pakistan was created as a separate Muslim-majority state when British India was partitioned in 1947.",
    culture:
      "Pakistani culture reflects its diverse ethnic heritage. Punjabi culture features bhangra music and vibrant festivals. The Sufi tradition, with qawwali devotional music (Nusrat Fateh Ali Khan), is powerful. Pakistani cuisine — biryani, nihari, seekh kebabs, and haleem — is celebrated worldwide. Cricket is almost a religion — Pakistan has won the Cricket World Cup. The truck art tradition is uniquely Pakistani.",
    famousLandmarks: [
      "K2 (second-highest mountain in the world)",
      "Mohenjo-daro ancient ruins",
      "Badshahi Mosque in Lahore",
      "Lahore Fort",
      "Fairy Meadows (near Nanga Parbat)",
      "Faisal Mosque in Islamabad",
    ],
    government: "Federal parliamentary constitutional republic",
    economy:
      "Major agricultural producer (cotton, wheat, sugarcane), growing textile industry, and strategic location for regional trade.",
  },
};

const generalTopics: Record<string, string> = {
  "world history":
    "World history spans over 5,000 years of recorded civilization. Key epochs include: the rise of ancient civilizations in Mesopotamia, Egypt, the Indus Valley, and China (3000–500 BC); the Classical Age of Greece, Rome, Persia, India, and Han China (500 BC–500 AD); the Middle Ages featuring feudalism, Islamic Golden Age, and the Byzantine Empire; the Renaissance and Age of Exploration (1400–1600); the Scientific Revolution and Enlightenment; European colonialism and the Industrial Revolution (1700–1900); the two World Wars (1914–1945); the Cold War between the USA and USSR (1947–1991); and the modern globalized era.",
  geography:
    "Earth has 7 continents: Asia (largest, ~44.6 million km²), Africa (second largest), North America, South America, Antarctica, Europe, and Australia/Oceania. The world's highest point is Mount Everest (8,849m) in the Himalayas. The lowest natural land point is the Dead Sea shore (−430m). The Pacific Ocean is the world's largest ocean, covering 165 million km². The Amazon in South America is the world's largest river by water flow; the Nile is the longest.",
  languages:
    "There are approximately 7,000 languages spoken in the world today. The most widely spoken languages are: Mandarin Chinese (1.1 billion speakers), English (1.5 billion including second-language speakers), Hindi (600 million), Spanish (560 million), French (300 million), Arabic (274 million), Bengali (270 million), Russian (258 million), Portuguese (250 million), and Urdu (230 million). About 40% of the world's languages are endangered, with fewer than 1,000 speakers each.",
  "famous landmarks":
    "The world's most famous landmarks include: the Great Wall of China (21,196 km long), the Pyramids of Giza (built ~2560 BC), the Eiffel Tower in Paris (330m), the Colosseum in Rome (built 70–80 AD), Machu Picchu in Peru (15th-century Inca city), the Taj Mahal in India (17th-century Mughal mausoleum), Angkor Wat in Cambodia (largest religious monument on Earth), the Parthenon in Athens, Chichen Itza in Mexico, and Stonehenge in England.",
  cultures:
    "The world's cultural diversity is staggering — there are approximately 195 countries, 7,000+ languages, thousands of ethnic groups, and countless religious and artistic traditions. Major world religions include Christianity (2.3 billion followers), Islam (1.9 billion), Hinduism (1.2 billion), Buddhism (500 million), Judaism (15 million), and Sikhism (26 million). Each culture has unique art, music, food, clothing, and festivals that reflect its history and environment.",
  governments:
    "The world's countries have diverse government systems. Democracies include republics (USA, France, India) and constitutional monarchies (UK, Japan, Sweden). Authoritarian systems include single-party states (China, Cuba, Vietnam), absolute monarchies (Saudi Arabia, Qatar), and theocracies (Iran). About 50% of the world's population lives under some form of democratic government.",
  economies:
    "The world's largest economies (by GDP) are: USA ($25 trillion), China ($18 trillion), Germany ($4 trillion), Japan ($4.2 trillion), India ($3.4 trillion), UK ($3.1 trillion), France ($2.8 trillion), Canada ($2.1 trillion), Italy ($2.0 trillion), and Brazil ($2.1 trillion). The world's poorest nations by GDP per capita are mostly in Sub-Saharan Africa and parts of South Asia.",
};

function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const countryAliases: Record<string, string> = {
  "united states": "usa",
  "united states of america": "usa",
  "u.s.": "usa",
  "u.s.a.": "usa",
  american: "usa",
  "south korea": "southkorea",
  korean: "southkorea",
  "south african": "southafrica",
  saudi: "saudiarabia",
  "saudi arabia": "saudiarabia",
  uk: "uk",
  "united kingdom": "uk",
  british: "uk",
  england: "uk",
  "great britain": "uk",
  french: "france",
  italian: "italy",
  german: "germany",
  spanish: "spain",
  japanese: "japan",
  chinese: "china",
  indian: "india",
  brazilian: "brazil",
  nigerian: "nigeria",
  egyptian: "egypt",
  australian: "australia",
  canadian: "canada",
  mexican: "mexico",
  russian: "russia",
  argentinian: "argentina",
  argentinean: "argentina",
  indonesian: "indonesia",
  turkish: "turkey",
  kenyan: "kenya",
  ethiopian: "ethiopia",
  ghanaian: "ghana",
  moroccan: "morocco",
  thai: "thailand",
  vietnamese: "vietnam",
  filipino: "philippines",
  philippine: "philippines",
  pakistani: "pakistan",
};

const topicKeywords: Record<string, string[]> = {
  "world history": [
    "world history",
    "ancient history",
    "human history",
    "historical",
  ],
  geography: ["geography", "continents", "oceans", "mountains", "rivers"],
  languages: [
    "languages of the world",
    "world languages",
    "most spoken languages",
  ],
  "famous landmarks": [
    "famous landmarks",
    "wonders of the world",
    "world wonders",
  ],
  cultures: [
    "world cultures",
    "cultures of the world",
    "religion",
    "traditions",
  ],
  governments: [
    "world governments",
    "types of government",
    "democracy",
    "political systems",
  ],
  economies: ["world economy", "world economies", "gdp", "richest countries"],
};

function detectTopic(query: string): string | null {
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    for (const kw of keywords) {
      if (query.includes(kw)) return topic;
    }
  }
  return null;
}

function detectAspect(query: string): string | null {
  if (/history|historical|ancient|founded|independence/.test(query))
    return "history";
  if (/culture|tradition|festival|food|cuisine|music|dance|art/.test(query))
    return "culture";
  if (/language|speak|spoken|official language/.test(query)) return "languages";
  if (/capital|capital city/.test(query)) return "capital";
  if (/population|people|how many/.test(query)) return "population";
  if (/geography|location|where is|landscape|terrain|climate/.test(query))
    return "geography";
  if (/landmark|famous|site|monument|visit|tourist/.test(query))
    return "famousLandmarks";
  if (/government|political|president|prime minister|ruled/.test(query))
    return "government";
  if (/economy|economic|gdp|trade|industry|rich|poor/.test(query))
    return "economy";
  return null;
}

function composeResponse(
  country: string,
  data: CountryData,
  aspect: string | null,
): string {
  const name = country.charAt(0).toUpperCase() + country.slice(1);

  if (aspect === "capital") {
    return `The capital of ${name === "Usa" ? "the United States" : name === "Uk" ? "the United Kingdom" : name} is **${data.capital}**.`;
  }
  if (aspect === "population") {
    return `The population of ${name === "Usa" ? "the United States" : name === "Uk" ? "the United Kingdom" : name} is approximately **${data.population}**.`;
  }
  if (aspect === "languages") {
    return `The languages spoken in ${name === "Usa" ? "the United States" : name === "Uk" ? "the United Kingdom" : name} include: **${data.languages.join(", ")}**. ${data.culture.slice(0, 120)}...`;
  }
  if (aspect === "history") {
    return `📜 **History of ${name === "Usa" ? "the United States" : name === "Southkorea" ? "South Korea" : name === "Southafrica" ? "South Africa" : name === "Saudiarabia" ? "Saudi Arabia" : name}:**\n\n${data.history}`;
  }
  if (aspect === "culture") {
    return `🎭 **Culture of ${name === "Southkorea" ? "South Korea" : name === "Southafrica" ? "South Africa" : name === "Saudiarabia" ? "Saudi Arabia" : name === "Usa" ? "the USA" : name}:**\n\n${data.culture}`;
  }
  if (aspect === "geography") {
    return `🗺️ **Geography of ${name === "Southkorea" ? "South Korea" : name === "Southafrica" ? "South Africa" : name === "Saudiarabia" ? "Saudi Arabia" : name === "Usa" ? "the USA" : name}:**\n\n${data.geography}`;
  }
  if (aspect === "famousLandmarks") {
    return `🏛️ **Famous Landmarks in ${name === "Southkorea" ? "South Korea" : name === "Southafrica" ? "South Africa" : name === "Saudiarabia" ? "Saudi Arabia" : name === "Usa" ? "the USA" : name}:**\n\n${data.famousLandmarks.map((l) => `• ${l}`).join("\n")}`;
  }
  if (aspect === "government") {
    return `🏛️ The government of ${name === "Usa" ? "the USA" : name === "Uk" ? "the UK" : name === "Southkorea" ? "South Korea" : name} is a **${data.government}**.`;
  }
  if (aspect === "economy") {
    return `💰 **Economy of ${name === "Usa" ? "the USA" : name === "Uk" ? "the UK" : name === "Southkorea" ? "South Korea" : name === "Saudiarabia" ? "Saudi Arabia" : name}:**\n\n${data.economy ?? "A significant economy with various industries and trade sectors."}`;
  }

  // General overview
  const displayName =
    name === "Usa"
      ? "the United States of America"
      : name === "Uk"
        ? "the United Kingdom"
        : name === "Southkorea"
          ? "South Korea"
          : name === "Southafrica"
            ? "South Africa"
            : name === "Saudiarabia"
              ? "Saudi Arabia"
              : name;

  return `🌍 **${displayName}**\n\n🏙️ **Capital:** ${data.capital}\n👥 **Population:** ${data.population}\n🗣️ **Languages:** ${data.languages.slice(0, 3).join(", ")}\n\n📖 **History:** ${data.history.slice(0, 200)}...\n\n🎭 **Culture:** ${data.culture.slice(0, 200)}...\n\n🏛️ **Famous Landmarks:** ${data.famousLandmarks.slice(0, 3).join(", ")}`;
}

export function getAIResponse(query: string): string {
  const q = normalizeQuery(query);

  // Check for general topic match first
  const topic = detectTopic(q);
  if (topic && generalTopics[topic]) {
    return `📚 **${topic.charAt(0).toUpperCase() + topic.slice(1)}**\n\n${generalTopics[topic]}`;
  }

  // Check for country match
  let matchedCountry: string | null = null;

  // Check aliases first
  for (const [alias, key] of Object.entries(countryAliases)) {
    if (q.includes(alias)) {
      matchedCountry = key;
      break;
    }
  }

  // Check direct country name match
  if (!matchedCountry) {
    for (const country of Object.keys(knowledgeBase)) {
      if (q.includes(country)) {
        matchedCountry = country;
        break;
      }
    }
  }

  if (matchedCountry && knowledgeBase[matchedCountry]) {
    const aspect = detectAspect(q);
    return composeResponse(
      matchedCountry,
      knowledgeBase[matchedCountry],
      aspect,
    );
  }

  // Fallback response
  return "I have knowledge about world history, geography, cultures, and all 195 recognized countries. Try asking about a specific country or topic like:\n\n• 'Tell me about the history of Egypt'\n• 'What languages are spoken in India?'\n• 'What are famous landmarks in Japan?'\n• 'Tell me about the culture of Brazil'\n• 'What is world geography?'";
}

"""
Updates `progress.html` so that Step 2 (Milestone 1) lists all 42 distinct
Singapore Tourism, Souvenir Gifts & National Identity 3D Relics
(`Relic_01` through `Relic_42`) individually 1-by-1 alongside the 27 non-relic
3D models (69 individual 3D models + 5 overview sheets in total).
"""

import os
import html

RELICS_42_DATA = [
    # Category 1: National Icons & Skyline Souvenirs (#01 - #10)
    (1, "Relic_01", "RISIS Gold-Plated Vanda Miss Joaquim", "orchids", "🦁 Icons & Skyline (#01–#10)", "Floral Fantasy",
     "24K gold-plated 5-petal hybrid orchid brooch (`Relic_01_GoldPetals`) with coral-enamel ruffled labellum lip (`Relic_01_CoralLip`) and stamped gold RISIS gift tag (`Relic_01_RisisTag`).",
     "Since 1976, Singapore artisans have electroplated real Vanda Miss Joaquim orchids in 24-karat gold as the nation’s signature RISIS keepsake."),
    (2, "Relic_02", "Merlion Park Spouting Snowglobe", "orchids", "🦁 Icons & Skyline (#01–#10)", "Dragonfly Lake",
     "Carved ivory Merlion statue (`Relic_02_Merlion`) spouting a crystalline cyan water arc (`Relic_02_WaterArc`) inside a clear glass dome snowglobe on a brass Singapore Souvenir plinth (`Relic_02_BrassBase`).",
     "Designed in 1964 by Alec Fraser-Brunner and sculpted by Lim Nang Seng, the half-lion, half-fish Merlion recalls Singapura’s ancient sea-town roots."),
    (3, "Relic_03", "Marina Bay Sands Skypark Ship Trophy", "orchids", "🦁 Icons & Skyline (#01–#10)", "Bayfront Plaza",
     "Three raked silver-glass hotel towers (`Relic_03_ThreeTowers`) supporting the cantilevered golden SkyPark hull (`Relic_03_SkyParkBoat`) with a glowing cyan infinity-pool strip (`Relic_03_InfinityPool`).",
     "Crowning three 55-storey hotel towers, the 340-metre cantilevered SkyPark links Marina Bay to Gardens by the Bay via the Lions Bridge."),
    (4, "Relic_04", "Changi Jewel Rain Vortex Crystal Dome", "orchids", "🦁 Icons & Skyline (#01–#10)", "Cloud Forest",
     "Toroidal faceted glass-and-steel gridshell dome (`Relic_04_ToroidDome`) framing a central glowing cyan water funnel (`Relic_04_RainVortex`) surrounded by terraced emerald forest tiers (`Relic_04_ForestTiers`).",
     "At 40 metres high, the HSBC Rain Vortex inside Jewel Changi Airport is the world’s tallest indoor waterfall, greeting millions of travellers."),
    (5, "Relic_05", "Singapore Flyer Capsule Wheel Keepsake", "orchids", "🦁 Icons & Skyline (#01–#10)", "OCBC Skyway",
     "Vertical golden observation wheel rim with spoke lattice (`Relic_05_WheelRim`) and 12 glowing cyan passenger capsules (`Relic_05_Capsules`) mounted on twin A-frame struts (`Relic_05_SupportStruts`).",
     "Standing 165 metres above Marina Bay, the Singapore Flyer’s 28 air-conditioned glass capsules offer panoramic views across three countries."),
    (6, "Relic_06", "Supertree Grove Solar Harmony Music Box", "orchids", "🦁 Icons & Skyline (#01–#10)", "Supertree Grove",
     "Polished rosewood wind-up music box (`Relic_06_MusicBoxBase`) with a golden winding key (`Relic_06_WindingKey`) and three miniature glowing purple-and-gold Supertrees (`Relic_06_MiniSupertrees`).",
     "Each evening, the 18 Supertrees come alive during the Garden Rhapsody light-and-sound show, powered by solar photovoltaic cells."),
    (7, "Relic_07", "Helix Bridge Double-Spiral Desk Sculpture", "orchids", "🦁 Icons & Skyline (#01–#10)", "Waterfront Promenade",
     "Intertwined counter-rotating stainless-steel & gold double-helix spiral tubes (`Relic_07_DoubleHelix`) spanning a curved azure promenade deck (`Relic_07_BridgeDeck`) with 4 viewing pods.",
     "Inspired by the structure of human DNA, the 280-metre Helix pedestrian bridge symbolises life, continuity, and renewal along Marina Bay."),
    (8, "Relic_08", "Raffles Hotel Doorman Turban Bell", "orchids", "🦁 Icons & Skyline (#01–#10)", "Colonial Garden",
     "Polished colonial brass service handbell (`Relic_08_BrassBell`) crowned with a pleated ivory Sikh turban finial and gold crest (`Relic_08_TurbanCrown`).",
     "Opened in 1887 and named after Sir Stamford Raffles, the historic Beach Road grand hotel is famous for its hospitality and heritage architecture."),
    (9, "Relic_09", "Singapore Airlines Sarong Kebaya Doll", "orchids", "🦁 Icons & Skyline (#01–#10)", "Floral Fantasy",
     "Stylised porcelain figurine (`Relic_09_PorcelainFigure`) dressed in a royal-blue and gold floral batik Sarong Kebaya (`Relic_09_BatikKebaya`).",
     "Designed by Pierre Balmain in 1968 using traditional Indonesian and Peranakan batik motifs, the Singapore Girl kebaya is an enduring aviation icon."),
    (10, "Relic_10", "Cavenagh Suspension Bridge Pewter Plaque", "orchids", "🦁 Icons & Skyline (#01–#10)", "Heritage Gardens",
     "Brushed Royal Selangor-style pewter relief plaque (`Relic_10_PewterPlaque`) showcasing twin gothic suspension pylons and cables (`Relic_10_BridgePylons`) on a dark teak stand.",
     "Forged in Glasgow and opened in 1869 across the Singapore River, Cavenagh Bridge is the city’s oldest surviving suspension bridge."),

    # Category 2: UNESCO Hawker Culture & Culinary Gifts (#11 - #18)
    (11, "Relic_11", "Kaya Toast, Soft-Boiled Eggs & Kopi Set", "supertrees", "☕ Hawker & Food (#11–#18)", "Supertree Dining",
     "Round kopitiam tray (`Relic_11_Tray`) holding two golden-brown toasted bread slices with pandan kaya & butter (`Relic_11_KayaToast`), two cracked soft-boiled eggs in a saucer (`Relic_11_SoftEggs`), and a floral porcelain kopi cup (`Relic_11_KopiCup`).",
     "Singapore’s quintessential kopitiam breakfast pairs charcoal-grilled coconut-pandan jam toast with runny soft-boiled eggs and sock-brewed coffee."),
    (12, "Relic_12", "Nanyang Kopi Tarik Tin & Sock Brewer", "supertrees", "☕ Hawker & Food (#11–#18)", "Golden Garden",
     "Vintage red-and-gold condensed milk tin (`Relic_12_MilkTin`) with a brass wire handle and tall cotton coffee sock filter (`Relic_12_CoffeeSock`) pouring a high arc of frothy kopi (`Relic_12_KopiStream`).",
     "Traditional Nanyang coffee beans are roasted with butter and sugar, brewed through a cotton sock, and ‘pulled’ (tarik) between tins for frothy aroma."),
    (13, "Relic_13", "Hainanese Chicken Rice Rooster Tiffin", "supertrees", "☕ Hawker & Food (#11–#18)", "Chinese Garden",
     "3-tier ivory enamel tiffin carrier (`Relic_13_EnamelTiffin`) hand-painted with a crimson rooster motif (`Relic_13_RoosterMotif`), brass locking clasp frame (`Relic_13_BrassFrame`), and trio of chilli, ginger & dark soy dip bowls (`Relic_13_SauceTriad`).",
     "Poached silky chicken with fragrant pandan-ginger rice and fiery red chilli dip is celebrated worldwide as one of Singapore’s national dishes."),
    (14, "Relic_14", "Chilli Crab Golden Mantou Cauldron", "supertrees", "☕ Hawker & Food (#11–#18)", "Waterfront Promenade",
     "Glossy scarlet mud crab with raised pincers (`Relic_14_ScarletCrab`) simmering in a matte-black cast-iron wok (`Relic_14_BlackWok`) alongside three golden fried mantou buns (`Relic_14_GoldenMantou`).",
     "Created along Singapore’s east coast in the 1950s, sweet-savory-spicy Chilli Crab is always served with golden fried mantou buns to mop up the gravy."),
    (15, "Relic_15", "Katong Laksa Porcelain Spoon & Bowl", "supertrees", "☕ Hawker & Food (#11–#18)", "Malay Garden",
     "Peranakan scalloped bowl (`Relic_15_LaksaBowl`) filled with rich coral-orange coconut gravy, white rice noodles, crimson prawns (`Relic_15_Prawns`), and a perched ceramic soup spoon (`Relic_15_SoupSpoon`).",
     "In Katong, thick rice vermicelli is cut into short pieces so the entire spicy coconut-shrimp broth can be eaten solely with a Chinese porcelain spoon."),
    (16, "Relic_16", "Pandan Chiffon Cake Slice Box", "supertrees", "☕ Hawker & Food (#11–#18)", "Flower Dome",
     "Fluffy pastel-emerald pandan chiffon ring cake (`Relic_16_PandanCake`) with a wedge slice lifted out (`Relic_16_CakeSlice`) beside a tied fragrant screwpine pandan leaf knot (`Relic_16_PandanKnot`).",
     "Light, airy, and naturally tinted bright green with freshly squeezed screwpine (pandan) leaf juice and coconut milk—Singapore’s favourite bakery gift."),
    (17, "Relic_17", "Ice Kacang Rainbow Mountain Bowl", "supertrees", "☕ Hawker & Food (#11–#18)", "Children’s Garden",
     "Tall conical shaved-ice peak (`Relic_17_IcePeak`) drizzled in rose-pink bandung, pandan-green, and gula melaka syrups (`Relic_17_RainbowSyrup`), crowned with sweetcorn and red attap seeds (`Relic_17_Toppings`).",
     "Once grated by hand from giant ice blocks, this towering shaved-ice dessert hides red beans, grass jelly, and attap chee beneath rainbow syrups."),
    (18, "Relic_18", "Singapore Sling Raffles Hurricane Glass", "supertrees", "☕ Hawker & Food (#11–#18)", "Silver Garden",
     "Tulip-curved crystal hurricane glass (`Relic_18_SlingGlass`) filled with ruby-rose cocktail (`Relic_18_RubySling`), foamy white head, and a golden pineapple wedge & red cherry garnish (`Relic_18_PineappleCherry`).",
     "First mixed in 1915 by bartender Ngiam Tong Boon at the Raffles Hotel Long Bar using gin, cherry brandy, pineapple juice, and lime."),

    # Category 3: Peranakan Heritage & Cultural Crafts (#19 - #26)
    (19, "Relic_19", "Nyonya Porcelain Tingkat Tiffin Carrier", "domes", "🏺 Peranakan & Culture (#19–#26)", "Heritage Gardens",
     "4-tier stacked turquoise, rose-pink, and imperial-yellow enamel tingkat carrier (`Relic_19_TingkatTiers`) decorated with pink peonies (`Relic_19_PeonyMedallions`) and a brass top handle (`Relic_19_BrassHandle`).",
     "Pastel-hued enamel tiffin carriers (tingkat) have carried home-cooked Peranakan stews and curries across generations in sustainable zero-waste style."),
    (20, "Relic_20", "Peranakan Beaded Kasut Manek Slippers", "domes", "🏺 Peranakan & Culture (#19–#26)", "Floral Fantasy",
     "Pair of upturned velvet Nyonya slippers (`Relic_20_SlipperSoles`) intricately mosaicked with hundreds of tiny gold, ruby, and turquoise glass cut-beads (`Relic_20_Beadwork`).",
     "Hand-stitched using thousands of faceted glass seed beads (manek potong) smaller than a millimetre, each pair of Nyonya slippers took months to craft."),
    (21, "Relic_21", "Joo Chiat Pastel Shophouse Façade Tile", "domes", "🏺 Peranakan & Culture (#19–#26)", "Colonial Garden",
     "Framed relief ceramic tile (`Relic_21_TileFrame`) depicting two pastel turquoise-and-pink two-storey shophouses (`Relic_21_ShophouseFront`), louvered timber shutters (`Relic_21_Shutters`), and terracotta roofs.",
     "Conserved Peranakan shophouses along Koon Seng Road in Joo Chiat dazzle visitors with plaster relief pilasters, floral majolica tiles, and timber shutters."),
    (22, "Relic_22", "Nyonya Kueh Lapis & Ang Ku Kueh Platter", "domes", "🏺 Peranakan & Culture (#19–#26)", "Chinese Garden",
     "Woven bamboo kueh tray (`Relic_22_BambooTray`) lined with banana leaf, holding 9-layer rainbow Kueh Lapis Sagu (`Relic_22_KuehLapis`) and two glossy red tortoise-shell Ang Ku Kueh (`Relic_22_AngKuKueh`).",
     "Bite-sized Nyonya kueh are steamed in rainbow layers (peeled one by one!) or moulded like red tortoises to wish longevity and good fortune."),
    (23, "Relic_23", "Chinatown Red Silk Shophouse Lantern", "domes", "🏺 Peranakan & Culture (#19–#26)", "Chinese Garden",
     "Ribbed crimson silk festive lantern (`Relic_23_CrimsonBalloon`) with brushed gold top/bottom collars (`Relic_23_GoldCollars`), auspicious gold emblems, and a hanging red-and-gold silk tassel (`Relic_23_SilkTassel`).",
     "Suspended along Pagoda Street and Kreta Ayer, glowing crimson silk lanterns with golden calligraphy herald reunion and prosperity."),
    (24, "Relic_24", "Little India Jasmine Garland & Brass Deepam", "domes", "🏺 Peranakan & Culture (#19–#26)", "Indian Garden",
     "Tiered polished-brass Kuthu Vilakku oil lamp (`Relic_24_BrassLamp`) with a glowing golden flame (`Relic_24_SacredFlame`), draped in a fragrant ivory jasmine & orange marigold garland (`Relic_24_FlowerGarland`).",
     "Along Serangoon Road, flower-garland stalls string fragrant jasmine buds and bright marigolds by the metre beside gleaming brass oil lamps."),
    (25, "Relic_25", "Kampong Glam Golden Sultan Dome Keepsake", "domes", "🏺 Peranakan & Culture (#19–#26)", "Malay Garden",
     "Burnished 24K-gold onion dome (`Relic_25_GoldenDome`) with a crescent-and-star spire (`Relic_25_CrescentFinial`), resting on a dark ring of miniature glass bottle ends (`Relic_25_BottleRing`) and white arches.",
     "Beneath the Sultan Mosque’s gleaming golden domes runs a dark base ring made of thousands of glass soy-sauce bottle ends donated by the community in 1932."),
    (26, "Relic_26", "Classic Peranakan Floral Majolica Tile", "domes", "🏺 Peranakan & Culture (#19–#26)", "Heritage Gardens",
     "Square glazed ceramic Peranakan tile (`Relic_26_CeramicSquare`) with high-relief sculpted pink rose blossoms (`Relic_26_RoseRelief`), emerald leaves (`Relic_26_EmeraldLeaves`), and golden corner scrolls.",
     "Imported during the late 19th and early 20th centuries, glazed floral relief tiles adorn the lower walls (dado) of traditional Straits Chinese homes."),

    # Category 4: Heartland Nostalgia & Everyday Icons (#27 - #34)
    (27, "Relic_27", "Toa Payoh Orange Mosaic Dragon Playground", "dragonfly", "🐉 Heartland Nostalgia (#27–#34)", "Children’s Garden",
     "Iconic geometric orange terrazzo mosaic dragon head (`Relic_27_DragonHead`) with white-and-black tile eyes, followed by colorful red, blue, and yellow steel climbing rib rings (`Relic_27_SpineRings`) on a sandpit base.",
     "Designed in 1979 by HDB interior designer Khor Ean Ghee, the Toa Payoh Lorong 6 mosaic Dragon Playground is Singapore’s most beloved childhood landmark."),
    (28, "Relic_28", "Iced Gem Biscuits Nostalgic Tin", "dragonfly", "🐉 Heartland Nostalgia (#27–#34)", "The Meadow",
     "Square brass mama-shop biscuit tin (`Relic_28_BiscuitTin`) with a round glass viewing window, topped with 5 buttery biscuit rounds crowned by swirled pink, yellow, green, and white sugar meringues (`Relic_28_IcedGems`).",
     "Sold by weight from tall brass mama-shop tins, these bite-sized biscuits topped with hard pastel sugar swirls have delighted children for decades."),
    (29, "Relic_29", "Good Morning 96 Red-Letter Cotton Towel", "dragonfly", "🐉 Heartland Nostalgia (#27–#34)", "Supertree Understorey",
     "Folded ivory-white cotton face towel (`Relic_29_WhiteTowel`) with woven pink striped borders and crimson embossed ‘GOOD MORNING’ & ‘祝君早安’ lettering (`Relic_29_CrimsonText`).",
     "Printed with ‘Good Morning 祝君早安’, this humble white cotton towel is a badge of industriousness worn by hawkers, bakers, and trishaw riders."),
    (30, "Relic_30", "Classic Green-and-White ERP Gantry Toy", "dragonfly", "🐉 Heartland Nostalgia (#27–#34)", "Bayfront Plaza",
     "Twin curved silver highway gantry columns (`Relic_30_GantryPoles`) supporting an overhead crossbeam with dual blue-and-amber LED signs (`Relic_30_BlueSign`) and two miniature toy cars (`Relic_30_MiniCars`) below.",
     "Introduced in 1998 as the world’s first Electronic Road Pricing system, the overhead gantry and In-Vehicle Unit beep are unmistakable Singapore road icons."),
    (31, "Relic_31", "HDB Void Deck Blue Chess Stone Table", "dragonfly", "🐉 Heartland Nostalgia (#27–#34)", "Serene Garden",
     "Round ocean-blue terrazzo table (`Relic_31_ChessTable`) inlaid with an ivory Chinese Xiangqi chessboard grid (`Relic_31_XiangqiGrid`), chess pieces, and 4 matching blue cylindrical stone stools (`Relic_31_RoundStools`).",
     "Found in HDB heartland void decks across the island, round terrazzo tables inlaid with Chinese chess or international chess grids foster community camaraderie."),
    (32, "Relic_32", "Orchard Road Rainbow Ice-Cream Pushcart", "dragonfly", "🐉 Heartland Nostalgia (#27–#34)", "Waterfront Promenade",
     "Blue stainless-steel street freezer cart (`Relic_32_FreezerCart`) on spoked wheels beneath a red-and-yellow striped umbrella (`Relic_32_Umbrella`), topped with a rainbow bread ice-cream sandwich (`Relic_32_RainbowBread`).",
     "Under a bright umbrella along Orchard Road, generations of uncles have served blocks of durian, raspberry ripple, or mint chocolate chip wrapped in rainbow bread."),
    (33, "Relic_33", "Vintage Trishaw With Red Canopy", "dragonfly", "🐉 Heartland Nostalgia (#27–#34)", "Dragonfly Bridge",
     "Three-wheeled heritage passenger cycle (`Relic_33_CycleFrame`) with a crimson pleated convertible hood (`Relic_33_CrimsonHood`), cushioned bench seat, and a brass bulb horn (`Relic_33_BrassHorn`).",
     "Once the primary mode of street transport in post-war Singapore, vibrant three-wheeled trishaws still take visitors through historic civic and cultural quarters."),
    (34, "Relic_34", "Red Lion City Passport & Changi Stamp", "dragonfly", "🐉 Heartland Nostalgia (#27–#34)", "Flower Dome",
     "Standing biometric scarlet-red Singapore Passport booklet (`Relic_34_RedPassport`) embossed with the golden national Coat of Arms (`Relic_34_GoldCrest`) and a boarding pass with Changi control tower (`Relic_34_BoardingPass`).",
     "Consistently ranked among the world’s most powerful travel documents, the crimson biometric Singapore passport bears the golden national Coat of Arms."),

    # Category 5: Island Wildlife, Tropical Fruit & Maritime Keepsakes (#35 - #42)
    (35, "Relic_35", "Marina Bay Smooth-Coated Otter Family", "wetlands", "🦦 Wildlife & Island (#35–#42)", "Kingfisher Wetlands",
     "Three sleek cocoa-brown river otters (`Relic_35_OtterTrio`)—a standing parent holding a silver fish (`Relic_35_SilverFish`) and two playful pups—on an azure water-splash wave base (`Relic_35_WaveSplash`).",
     "Thanks to decades of waterway clean-ups, families of wild smooth-coated otters—like the famous Bishan and Marina clans—now romp right through Gardens by the Bay."),
    (36, "Relic_36", "Mao Shan Wang Golden Durian Gift Box", "wetlands", "🦦 Wildlife & Island (#35–#42)", "World of Plants",
     "Split thorny olive-green durian shell (`Relic_36_ThornyHusk`) nestled in a crimson-and-gold presentation box (`Relic_36_GiftBox`), revealing 4 plump golden custard Mao Shan Wang pods (`Relic_36_GoldenPods`).",
     "Revered as the ‘King of Fruits’, rich and bittersweet Mao Shan Wang durian is so beloved in Singapore that the Esplanade concert halls were modelled after its spiky shell!"),
    (37, "Relic_37", "Purple Mangosteen Queen of Fruits", "wetlands", "🦦 Wildlife & Island (#35–#42)", "World of Plants",
     "Deep aubergine-purple mangosteen rind (`Relic_37_PurpleRind`) crowned by a 4-leaf green calyx (`Relic_37_GreenCalyx`), opened in half to showcase 6 snow-white citrusy fruit segments (`Relic_37_WhiteCloves`).",
     "Paired with fiery durian as its cooling ‘Queen of Fruits’, the deep-purple mangosteen hides snow-white, sweet-tangy segments counted by the petals on its base."),
    (38, "Relic_38", "Tembusu Five-Dollar Note Heritage Tree", "wetlands", "🦦 Wildlife & Island (#35–#42)", "Heritage Gardens",
     "Deeply fissured bronze Tembusu trunk (`Relic_38_TembusuTrunk`) with its famous low horizontal branch (`Relic_38_HorizontalBough`), lush emerald canopy pads, and a miniature green $5 portrait note plaque (`Relic_38_FiveDollarNote`).",
     "Immortalised on the back of Singapore’s green $5 portrait banknote, the 150-year-old Tembusu tree is beloved for its dramatic horizontal lower branch."),
    (39, "Relic_39", "Sentosa Cable Car Sky Cabin", "wetlands", "🦦 Wildlife & Island (#35–#42)", "OCBC Skyway",
     "Ruby-red panoramic aerial cableway cabin (`Relic_39_RedCabin`) with wrap-around cyan windows (`Relic_39_GlassWindows`), suspended from a silver overhead grip arm and golden cable (`Relic_39_CableWire`).",
     "Since 1974, the Singapore Cable Car has glided high above Keppel Harbour from Mount Faber to Sentosa Island."),
    (40, "Relic_40", "Sungei Buloh Collared Kingfisher Totem", "wetlands", "🦦 Wildlife & Island (#35–#42)", "Kingfisher Wetlands",
     "Iridescent cobalt-blue and turquoise kingfisher (`Relic_40_BlueKingfisher`) with a crisp white collar (`Relic_40_WhiteCollar`) and dagger bill, perched atop braided mangrove prop roots (`Relic_40_MangroveRoots`).",
     "With electric cobalt-blue plumage and a sharp white collar, the Collared Kingfisher is a star resident of Kingfisher Wetlands and Sungei Buloh."),
    (41, "Relic_41", "Singapore River Bumboat (Tongkang)", "wetlands", "🦦 Wildlife & Island (#35–#42)", "Dragonfly Lake",
     "Teak-hull river bumboat (`Relic_41_TeakHull`) with a green bow painted with lucky red eyes (`Relic_41_PaintedEyes`), corrugated canopy roof (`Relic_41_CanopyRoof`), and glowing golden lantern.",
     "Painted with pairs of eyes on the bow so the boat can ‘see’ danger ahead, traditional wooden bumboats once ferried cargo along the Singapore River and now cruise Marina Bay."),
    (42, "Relic_42", "Crimson Vanda Lion City Key of Singapura", "wetlands", "🦦 Wildlife & Island (#35–#42)", "Supertree Grove",
     "Ceremonial 24K-gold skeleton key (`Relic_42_GoldenKey`) featuring a sculpted Merlion-and-Orchid bow (`Relic_42_LionOrchidBow`), 5-star crescent ring, and a glowing ruby-red Singapura heart gem (`Relic_42_RubyGem`).",
     "The ultimate master keepsake uniting the Lion Crest, Vanda Miss Joaquim, and the five stars of Singapura—awarded to explorers who discover every treasure in the Gardens.")
]


def generate_42_relic_cards_html():
    cards = []
    cards.append("        <!-- ============================================================== -->")
    cards.append("        <!-- BUNDLE 4B: ALL 42 SINGAPORE SOUVENIR & TOURISM RELICS (#01-#42) -->")
    cards.append("        <!-- ============================================================== -->")
    for idx, node_name, title, cat_slug, cat_badge, zone, mesh_desc, fact in RELICS_42_DATA:
        num_str = f"{idx:02d}"
        img_path = f"assets/renders/relics42/relic_{num_str}.png"
        caption = f"Relic #{num_str} • {node_name} — {title} ({zone} • treasures_foliage.glb)"
        card_html = f"""        <article class="shot-card" data-ver="v2" data-m1cat="relics42" data-reliccat="relics_{cat_slug}">
          <div class="shot-img-wrap" data-lightbox="{img_path}" data-caption="{html.escape(caption, quote=True)}">
            <img src="{img_path}" alt="Relic #{num_str} {html.escape(title, quote=True)}" loading="lazy" />
            <div class="shot-badges-overlay">
              <span class="angle-tag">{cat_badge} • {html.escape(zone)}</span>
              <span class="ver-tag v2">Relic #{num_str} (`{node_name}`)</span>
            </div>
          </div>
          <div class="shot-body">
            <h3 class="shot-title">Relic #{num_str} — {html.escape(title)} (`{node_name}`)</h3>
            <p class="shot-desc"><strong>3D Mesh:</strong> {mesh_desc}<br/><span style="color:#047857;font-weight:600;font-size:11.5px;">🇸🇬 {html.escape(fact)}</span></p>
            <div class="shot-meta">
              <span>GLB: treasures_foliage.glb • Node: {node_name}</span>
              <span>Zone: {html.escape(zone)}</span>
            </div>
          </div>
        </article>"""
        cards.append(card_html)
    return "\n\n".join(cards)


def main():
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    html_path = os.path.join(repo_root, "progress.html")
    with open(html_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Update Step 2 pill & filter button label for m1
    content = content.replace(
        '<span class="step-sub">33 Blender .GLB Models</span>',
        '<span class="step-sub">42 SG Relics + 27 Models</span>'
    )
    content = content.replace(
        '<button type="button" class="filter-btn" data-filter="m1">Step 2 • 3D Models (38)</button>',
        '<button type="button" class="filter-btn" data-filter="m1">Step 2 • 3D Models (69 + 5 Sheets)</button>'
    )

    # 2. Update Step 2 / Milestone 1 section header & sub-filter bar
    new_m1_header = """    <!-- ================================================================== -->
    <!-- STEP 2: 3D ASSET MODELING IN BLENDER (42 SG RELICS + 27 MODELS)    -->
    <!-- ================================================================== -->
    <section class="milestone-section" data-section="m1">
      <div class="milestone-header">
        <h2>
          Step 2 — 3D Asset Modeling: 42 Singapore Souvenir Relics + 27 World Models
          <span class="m-badge">69 .GLB Models + 5 Sheets</span>
        </h2>
        <p>Using automated Python scripts in Blender 4.3, we generated 69 bespoke 3D models — including all <strong>42 Singapore Tourism, Souvenir Gifts &amp; National Identity Relics (`Relic_01`–`Relic_42`)</strong> alongside 27 architectural buildings, chibi explorers, sculptures, and tropical trees.</p>
      </div>

      <div class="m1-subfilter-bar" aria-label="Step 2 Model Category Filter">
        <span class="m1-subfilter-label">Filter Models:</span>
        <button type="button" class="m1-sub-btn active" data-m1cat="all">All (69 Models + 5 Sheets)</button>
        <button type="button" class="m1-sub-btn" data-m1cat="relics42">💎 All 42 SG Souvenir Relics (#01–#42)</button>
        <button type="button" class="m1-sub-btn" data-m1cat="relics_orchids">🦁 #01–#10: Icons &amp; Skyline (10)</button>
        <button type="button" class="m1-sub-btn" data-m1cat="relics_supertrees">☕ #11–#18: Hawker &amp; Food (8)</button>
        <button type="button" class="m1-sub-btn" data-m1cat="relics_domes">🏺 #19–#26: Peranakan &amp; Culture (8)</button>
        <button type="button" class="m1-sub-btn" data-m1cat="relics_dragonfly">🐉 #27–#34: Heartland Nostalgia (8)</button>
        <button type="button" class="m1-sub-btn" data-m1cat="relics_wetlands">🦦 #35–#42: Wildlife &amp; Island (8)</button>
        <button type="button" class="m1-sub-btn" data-m1cat="buildings">🏛️ Buildings (6)</button>
        <button type="button" class="m1-sub-btn" data-m1cat="characters">🧭 Explorers &amp; Gadgets (7)</button>
        <button type="button" class="m1-sub-btn" data-m1cat="sculptures">🗿 Sculptures &amp; Plinth (8)</button>
        <button type="button" class="m1-sub-btn" data-m1cat="trees">🌴 Trees (6)</button>
        <button type="button" class="m1-sub-btn" data-m1cat="sheets">🖼️ Overview Sheets (5)</button>
      </div>

      <div class="cards-grid" id="m1CardsGrid">"""

    header_start_candidates = [
        "    <!-- ================================================================== -->\n    <!-- STEP 2: 3D ASSET MODELING",
        "    <!-- MILESTONE 1:"
    ]
    header_end_marker = '      <div class="cards-grid" id="m1CardsGrid">'
    h_start = None
    for cand in header_start_candidates:
        if cand in content:
            h_start = content.index(cand)
            break
    assert h_start is not None and header_end_marker in content, "Could not locate Step 2 / Milestone 1 header block"
    h_end = content.index(header_end_marker) + len(header_end_marker)
    content = content[:h_start] + new_m1_header + content[h_end:]

    # 3. Replace the old relic cards (#21-#27) with Model #21 (`Relic_Pedestal`) + all 42 Singapore Souvenir Relic cards (#01-#42)
    start_candidates = [
        "        <!-- Treasures & Pedestals (21-27) -->",
        "        <!-- ============================================================== -->\n        <!-- BUNDLE 4A:"
    ]
    end_candidates = [
        "        <!-- Tropical Trees (28-33) -->",
        "        <!-- ============================================================== -->\n        <!-- BUNDLE 4B: treasures_foliage.glb — Trees"
    ]
    s_idx = None
    for cand in start_candidates:
        if cand in content:
            s_idx = content.index(cand)
            break
    e_idx = None
    for cand in end_candidates:
        if cand in content:
            e_idx = content.index(cand)
            break
    assert s_idx is not None and e_idx is not None, "Could not find Treasures & Pedestals / Tropical Trees markers"

    pedestal_plus_42_html = """        <!-- ============================================================== -->
        <!-- BUNDLE 4A: treasures_foliage.glb — Relic Pedestal (Model #21)  -->
        <!-- ============================================================== -->
        <article class="shot-card" data-ver="v2" data-m1cat="sculptures">
          <div class="shot-img-wrap" data-lightbox="assets/renders/models/model_21_relic_pedestal.png" data-caption="Model #21 • Relic_Pedestal (treasures_foliage.glb)">
            <img src="assets/renders/models/model_21_relic_pedestal.png" alt="Model #21 Relic_Pedestal" loading="lazy" />
            <div class="shot-badges-overlay">
              <span class="angle-tag">🏛️ Relic Plinth • Relic_Pedestal</span>
              <span class="ver-tag v2">Model #21</span>
            </div>
          </div>
          <div class="shot-body">
            <h3 class="shot-title">#21 • `Relic_Pedestal` (Singapore Keepsake Display Plinth)</h3>
            <p class="shot-desc">Tiered cream limestone plinth (`Relic_Pedestal_Plinth`), burnished brass trim collars (`Relic_Pedestal_GoldTrim`), and glowing emerald rune ring supporting all 42 distinct Singapore keepsake relics.</p>
            <div class="shot-meta">
              <span>GLB: treasures_foliage.glb</span>
              <span>Node: Relic_Pedestal</span>
            </div>
          </div>
        </article>

""" + generate_42_relic_cards_html() + "\n\n"

    content = content[:s_idx] + pedestal_plus_42_html + content[e_idx:]

    # 4. Update JS sub-filter logic so clicking `relics42` matches `data-m1cat="relics42"` and clicking `relics_orchids` etc. matches `data-reliccat`
    if "function matchesM1SubCat" not in content:
        old_sub_js = """    m1SubBtns.forEach((subBtn) => {
      subBtn.addEventListener('click', () => {
        m1SubBtns.forEach((b) => b.classList.remove('active'));
        subBtn.classList.add('active');
        const subCat = subBtn.dataset.m1cat;
        m1Cards.forEach((card) => {
          card.style.display = (subCat === 'all' || card.dataset.m1cat === subCat) ? 'flex' : 'none';
        });
      });
    });"""

        new_sub_js = """    function matchesM1SubCat(card, subCat) {
      if (!subCat || subCat === 'all') return true;
      return card.dataset.m1cat === subCat || card.dataset.reliccat === subCat;
    }

    m1SubBtns.forEach((subBtn) => {
      subBtn.addEventListener('click', () => {
        m1SubBtns.forEach((b) => b.classList.remove('active'));
        subBtn.classList.add('active');
        const subCat = subBtn.dataset.m1cat;
        m1Cards.forEach((card) => {
          card.style.display = matchesM1SubCat(card, subCat) ? 'flex' : 'none';
        });
      });
    });"""

        assert old_sub_js in content, "Could not find old_sub_js"
        content = content.replace(old_sub_js, new_sub_js, 1)
        content = content.replace(
            "c.style.display = (c.dataset.m1cat === subCat) ? 'flex' : 'none';",
            "c.style.display = matchesM1SubCat(c, subCat) ? 'flex' : 'none';"
        )

    with open(html_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Successfully updated progress.html with all 42 distinct Singapore Souvenir 3D Relics!")


if __name__ == "__main__":
    main()

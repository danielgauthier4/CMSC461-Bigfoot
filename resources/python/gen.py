"""
	DESIGNED FOR TESTING PURPOSES (until we get Apache up and running)
	
	Generates a file called "dummydates.json" in the execution folder when run.
	The file contains <date, count> pairs for counties and prisons.
	Counties use their FIPS code as keys.
	Prisons use their IDS.
"""

import sys
import random

FIPSMap = {
	"Alameda": "06001",
	"Alpine": "06003",
	"Amador": "06005",
	"Butte": "06007",
	"Calaveras": "06009",
	"Colusa": "06011",
	"Contra Costa": "06013",
	"Del Norte": "06015",
	"El Dorado": "06017",
	"Fresno": "06019",
	"Glenn": "06021",
	"Humboldt": "06023",
	"Imperial": "06025",
	"Inyo": "06027",
	"Kern": "06029",
	"Kings": "06031",
	"Lake": "06033",
	"Lassen": "06035",
	"Los Angeles": "06037",
	"Madera": "06039",
	"Marin": "06041",
	"Mariposa": "06043",
	"Mendocino": "06045",
	"Merced": "06047",
	"Modoc": "06049",
	"Mono": "06051",
	"Monterey": "06053",
	"Napa": "06055",
	"Nevada": "06057",
	
	"Orange": "06059",
	"Placer": "06061",
	"Plumas": "06063",
	"Riverside": "06065",
	"Sacramento": "06067",
	"San Benito": "06069",
	"San Bernardino": "06071",
	"San Diego": "06073",
	"San Francisco": "06075",
	"Joaquin": "06077",
	"San Luis Obispo": "06079",
	"San Mateo": "06081",
	"Santa Barbara": "06083",
	"Santa Clara": "06085",
	"Santa Cruz": "06087",
	"Shasta": "06089",
	"Sierra": "06091",
	"Siskiyou": "06093",
	"Solano": "06095",
	"Sonoma": "06097",
	"Stanislaus": "06099",
	"Sutter": "06101",
	"Tehama": "06103",
	"Trinity": "06105",
	"Tulare": "06107",
	"Tuolumne": "06109",
	"Ventura": "06111",
	"Yolo": "06113",
	"Yuba": "06115",
}

facilityIDs = [
    83, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101,
    102, 111, 112, 113, 115, 116, 120, 128, 129, 131, 135, 139, 140,
    141, 142, 143, 144, 145, 147, 148, 150, 152, 158, 161, 164, 171,
    1724, 1725, 1726, 1727, 1879, 2178, 2340, 2361, 2381, 2390, 2392,
    2402, 2428, 2439, 2445,
]

def RandomDateAndCount():
    out = "";
    
    out += '{"date": "';
    out += str(random.randrange(2020, 2021)).rjust(4, '0') + '-'
    out += str(random.randrange(1, 12)).rjust(2, '0') + '-'
    out += str(random.randrange(1, 31)).rjust(2, '0') + '"'
    
    out += ', "count": ';
    out += str(random.randrange(0, 100))
    out += '}';
    return out;

def MakeDates():
    out = '{\n';
    
    countycount = len(FIPSMap);
    prisoncount = len(facilityIDs);
    
    # Counties ------------------------------------
    out += '\t"counties": {\n'
    keys = [];
    while len(keys) < countycount:
        k = [x for x in FIPSMap.values()][random.randrange(0, len(FIPSMap))];
        if k not in keys:
            keys.append(k);
    
    for i, k in enumerate(set(keys)):
        out += '\t\t"' + str(k) + '": ' + RandomDateAndCount();
        out += ',\n' if i < countycount-1 else '\n';
    out += '\t},\n';
    
    # Prisons ------------------------------------
    out += '\t"prisons": {\n'
    keys = facilityIDs[:];
            
    for i, k in enumerate(keys):
        out += '\t\t"' + str(k) + '": ' + RandomDateAndCount();
        out += ',\n' if i < prisoncount-1 else '\n';
    out += '\t}\n';
    
    out += '}\n';
    
    # Output to file
    f = open("./dummydates.json", 'w');
    f.write(out);
    f.close();
    
print('*'*80)
MakeDates();

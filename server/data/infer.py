import pandas as pd
from geopy.distance import great_circle
from sklearn.preprocessing import StandardScaler
from sklearn.preprocessing import OneHotEncoder
from torch.utils.data import DataLoader, Dataset
import torch.nn as nn
import numpy as np
import torch
import joblib

# Features
NUM_FEATS = [
    'floor_area_sqm','age_of_bldg','Nearest MRT Distance','Nearest Mall Distance',
    'Nearest NPC Distance','Nearest School Distance','Nearest Green Area Distance',
    'flat_model_index','town_index','mrt_index','mall_index'
]
CAT_FEATS = [
    'month','year','max_floor_lvl','residential','commercial','market_hawker',
    'miscellaneous','multistorey_carpark','precinct_pavilion','flat_type_int'
]
TARGET = 'monthly_rent'

# Indices

town_index_all = {'BUKIT TIMAH': 1.0,
 'CENTRAL': 1.0,
 'BISHAN': 0.8181818181818182,
 'BUKIT MERAH': 0.8181818181818182,
 'QUEENSTOWN': 0.7272727272727273,
 'PUNGGOL': 0.6363636363636364,
 'SENGKANG': 0.6363636363636364,
 'PASIR RIS': 0.5454545454545454,
 'CLEMENTI': 0.5454545454545454,
 'KALLANG/WHAMPOA': 0.4545454545454546,
 'JURONG WEST': 0.45454545454545453,
 'TAMPINES': 0.45454545454545453,
 'SERANGOON': 0.45454545454545453,
 'MARINE PARADE': 0.2727272727272727,
 'SEMBAWANG': 0.2727272727272727,
 'JURONG EAST': 0.2727272727272727,
 'CHOA CHU KANG': 0.2727272727272727,
 'BUKIT PANJANG': 0.2727272727272727,
 'TOA PAYOH': 0.18181818181818185,
 'WOODLANDS': 0.09090909090909091,
 'ANG MO KIO': 0.09090909090909091,
 'BEDOK': 0.09090909090909091,
 'HOUGANG': 0.09090909090909091,
 'GEYLANG': 0.09090909090909091,
 'BUKIT BATOK': 0.09090909090909091,
 'YISHUN': 0.0}

mrt_index_all = {'GREAT WORLD MRT STATION (TE15)': 1.0,
 'LABRADOR PARK MRT STATION (CC27)': 1.0,
 'BENDEMEER MRT STATION (DT23)': 0.9411764705882353,
 'CALDECOTT MRT STATION (TE9)': 0.8823529411764707,
 'OUTRAM PARK MRT STATION (NE3)': 0.8823529411764706,
 'ESPLANADE MRT STATION (CC3)': 0.8235294117647058,
 'BOTANIC GARDENS MRT STATION (CC19)': 0.7647058823529411,
 'BUKIT PANJANG MRT STATION (DT1)': 0.75,
 'SUMANG LRT STATION (PW6)': 0.7058823529411765,
 'BRAS BASAH MRT STATION (CC2)': 0.7058823529411765,
 'PUNGGOL LRT STATION (PTC)': 0.7058823529411764,
 'DOVER MRT STATION (EW22)': 0.6470588235294118,
 'BENCOOLEN MRT STATION (DT21)': 0.6470588235294118,
 'REDHILL MRT STATION (EW18)': 0.6176470588235294,
 'BISHAN MRT STATION (NS17)': 0.5882352941176471,
 'THANGGAM LRT STATION (SW4)': 0.5882352941176471,
 'TIONG BAHRU MRT STATION (EW17)': 0.5882352941176471,
 'CHENG LIM LRT STATION (SW1)': 0.5882352941176471,
 'PASIR PANJANG MRT STATION (CC26)': 0.5882352941176471,
 'QUEENSTOWN MRT STATION (EW19)': 0.5882352941176471,
 'HAVELOCK MRT STATION (TE16)': 0.5882352941176471,
 'BEAUTY WORLD MRT STATION (DT5)': 0.5882352941176471,
 'HOLLAND VILLAGE MRT STATION (CC21)': 0.5882352941176471,
 'BISHAN MRT STATION (CC15)': 0.5882352941176471,
 'KADALOOR LRT STATION (PE5)': 0.5882352941176471,
 'SOO TECK LRT STATION (PW7)': 0.5882352941176471,
 'LITTLE INDIA MRT STATION (NE7)': 0.5882352941176471,
 'TANJONG PAGAR MRT STATION (EW15)': 0.5882352941176471,
 'SENGKANG MRT STATION (NE16)': 0.5882352941176471,
 'BUGIS MRT STATION (EW12)': 0.5588235294117647,
 'PUNGGOL MRT STATION (NE17)': 0.5588235294117647,
 'CHINATOWN MRT STATION (DT19)': 0.5294117647058824,
 'SENGKANG LRT STATION (STC)': 0.5294117647058824,
 'UPPER CHANGI MRT STATION (DT34)': 0.5294117647058824,
 'BRIGHT HILL MRT STATION (TE7)': 0.5,
 'FARRER PARK MRT STATION (NE8)': 0.4852941176470588,
 'PAYA LEBAR MRT STATION (EW8)': 0.4705882352941177,
 'LAYAR LRT STATION (SW6)': 0.4705882352941177,
 'LAVENDER MRT STATION (EW11)': 0.47058823529411764,
 'FARRER ROAD MRT STATION (CC20)': 0.47058823529411764,
 'BOON LAY MRT STATION (EW27)': 0.47058823529411764,
 'TELOK BLANGAH MRT STATION (CC28)': 0.47058823529411764,
 'KANGKAR LRT STATION (SE4)': 0.47058823529411764,
 'RANGGUNG LRT STATION (SE5)': 0.47058823529411764,
 'MAXWELL MRT STATION (TE18)': 0.47058823529411764,
 'BARTLEY MRT STATION (CC12)': 0.47058823529411764,
 'BUKIT PANJANG LRT STATION (BP6)': 0.47058823529411764,
 'BUONA VISTA MRT STATION (EW21)': 0.47058823529411764,
 'FERNVALE LRT STATION (SW5)': 0.47058823529411764,
 'NOVENA MRT STATION (NS20)': 0.47058823529411764,
 'PIONEER MRT STATION (EW28)': 0.47058823529411764,
 'COVE LRT STATION (PE1)': 0.47058823529411764,
 'CORAL EDGE LRT STATION (PE3)': 0.47058823529411764,
 'DAMAI LRT STATION (PE7)': 0.47058823529411764,
 'OASIS LRT STATION (PE6)': 0.47058823529411764,
 'MERIDIAN LRT STATION (PE2)': 0.4705882352941176,
 'BUANGKOK MRT STATION (NE15)': 0.4705882352941176,
 'KALLANG MRT STATION (EW10)': 0.4705882352941176,
 'SERANGOON MRT STATION (NE12)': 0.4705882352941176,
 'FARMWAY LRT STATION (SW2)': 0.4705882352941176,
 'RUMBIA LRT STATION (SE2)': 0.4705882352941176,
 'BAKAU LRT STATION (SE3)': 0.4411764705882353,
 'TAMPINES MRT STATION (DT32)': 0.4411764705882353,
 'PASIR RIS MRT STATION (EW1)': 0.4411764705882353,
 'CHOA CHU KANG LRT STATION (BP1)': 0.411764705882353,
 'WOODLANDS SOUTH MRT STATION (TE3)': 0.411764705882353,
 'NICOLL HIGHWAY MRT STATION (CC5)': 0.4117647058823529,
 'WOODLEIGH MRT STATION (NE11)': 0.4117647058823529,
 'NIBONG LRT STATION (PW5)': 0.4117647058823529,
 'RENJONG LRT STATION (SW8)': 0.4117647058823529,
 'CLEMENTI MRT STATION (EW23)': 0.4117647058823529,
 'BUONA VISTA MRT STATION (CC22)': 0.4117647058823529,
 'COMPASSVALE LRT STATION (SE1)': 0.4117647058823529,
 'CHOA CHU KANG MRT STATION (NS4)': 0.4117647058823529,
 'TOA PAYOH MRT STATION (NS19)': 0.4117647058823529,
 'KUPANG LRT STATION (SW3)': 0.4117647058823529,
 'EUNOS MRT STATION (EW7)': 0.4117647058823529,
 'SENJA LRT STATION (BP13)': 0.4117647058823529,
 'SIMEI MRT STATION (EW3)': 0.4117647058823529,
 'UBI MRT STATION (DT27)': 0.4117647058823529,
 'JURONG EAST MRT STATION (EW24 / NS1)': 0.4117647058823529,
 'SOUTH VIEW LRT STATION (BP2)': 0.4117647058823529,
 'TAMPINES EAST MRT STATION (DT33)': 0.4117647058823529,
 'MOUNTBATTEN MRT STATION (CC7)': 0.41176470588235287,
 'JALAN BESAR MRT STATION (DT22)': 0.38235294117647056,
 'SERANGOON MRT STATION (CC13)': 0.38235294117647056,
 'RIVIERA LRT STATION (PE4)': 0.38235294117647056,
 'BOON KENG MRT STATION (NE9)': 0.38235294117647056,
 'ONE-NORTH MRT STATION (CC23)': 0.3676470588235295,
 'TONGKANG LRT STATION (SW7)': 0.35294117647058826,
 'SEMBAWANG MRT STATION (NS11)': 0.35294117647058826,
 'TAMPINES WEST MRT STATION (DT31)': 0.35294117647058826,
 'WOODLANDS MRT STATION (TE2)': 0.35294117647058826,
 'SEGAR LRT STATION (BP11)': 0.35294117647058826,
 'YEW TEE MRT STATION (NS5)': 0.35294117647058826,
 'UPPER THOMSON MRT STATION (TE8)': 0.35294117647058826,
 'ADMIRALTY MRT STATION (NS10)': 0.35294117647058826,
 'KEAT HONG LRT STATION (BP3)': 0.35294117647058826,
 'FAJAR LRT STATION (BP10)': 0.35294117647058826,
 'KAKI BUKIT MRT STATION (DT28)': 0.35294117647058826,
 'JELAPANG LRT STATION (BP12)': 0.35294117647058826,
 'LORONG CHUAN MRT STATION (CC14)': 0.35294117647058826,
 'MARYMOUNT MRT STATION (CC16)': 0.35294117647058826,
 'TAMPINES MRT STATION (EW2)': 0.3382352941176471,
 'KEMBANGAN MRT STATION (EW6)': 0.3235294117647059,
 'PETIR LRT STATION (BP7)': 0.3088235294117647,
 'COMMONWEALTH MRT STATION (EW20)': 0.3088235294117647,
 'GEYLANG BAHRU MRT STATION (DT24)': 0.2941176470588236,
 'TANAH MERAH MRT STATION (EW4)': 0.29411764705882354,
 'HARBOURFRONT MRT STATION (NE1 / CC29)': 0.29411764705882354,
 'DAKOTA MRT STATION (CC8)': 0.29411764705882354,
 'HOUGANG MRT STATION (NE14)': 0.29411764705882354,
 'CANBERRA MRT STATION (NS12)': 0.29411764705882354,
 'PHOENIX LRT STATION (BP5)': 0.29411764705882354,
 'BUKIT GOMBAK MRT STATION (NS3)': 0.29411764705882354,
 'KHATIB MRT STATION (NS14)': 0.29411764705882354,
 'CHINATOWN MRT STATION (NE4)': 0.29411764705882354,
 'KOVAN MRT STATION (NE13)': 0.29411764705882354,
 'LAKESIDE MRT STATION (EW26)': 0.29411764705882354,
 'ALJUNIED MRT STATION (EW9)': 0.29411764705882354,
 'BUKIT BATOK MRT STATION (NS2)': 0.29411764705882354,
 'BEDOK RESERVOIR MRT STATION (DT30)': 0.29411764705882354,
 'WOODLANDS MRT STATION (NS9)': 0.29411764705882354,
 'BEDOK MRT STATION (EW5)': 0.29411764705882354,
 'BANGKIT LRT STATION (BP9)': 0.29411764705882354,
 'ANG MO KIO MRT STATION (NS16)': 0.29411764705882354,
 'YIO CHU KANG MRT STATION (NS15)': 0.29411764705882354,
 'POTONG PASIR MRT STATION (NE10)': 0.29411764705882354,
 'CHINESE GARDEN MRT STATION (EW25)': 0.29411764705882354,
 'ROCHOR MRT STATION (DT13)': 0.2647058823529412,
 'YISHUN MRT STATION (NS13)': 0.23529411764705882,
 'MAYFLOWER MRT STATION (TE6)': 0.23529411764705882,
 'PAYA LEBAR MRT STATION (CC9)': 0.23529411764705882,
 'BRADDELL MRT STATION (NS18)': 0.2352941176470588,
 'LENTOR MRT STATION (TE5)': 0.22058823529411764,
 'MACPHERSON MRT STATION (DT26)': 0.17647058823529413,
 'MARSILING MRT STATION (NS8)': 0.17647058823529413,
 'BEDOK NORTH MRT STATION (DT29)': 0.17647058823529413,
 'WOODLANDS NORTH MRT STATION (TE1)': 0.17647058823529413,
 'MATTAR MRT STATION (DT25)': 0.17647058823529413,
 'PENDING LRT STATION (BP8)': 0.17647058823529413,
 'TECK WHYE LRT STATION (BP4)': 0.11764705882352941,
 'KING ALBERT PARK MRT STATION (DT6)': 0.058823529411764705,
 'TAI SENG MRT STATION (CC11)': 0.0}

mall_index_all = {'100 AM': 1.0,
 'PLQ MALL': 1.0,
 'DAWSON PLACE': 1.0,
 'JW MARRIOTT SINGAPORE SOUTH BEACH': 0.9285714285714286,
 'RAFFLES CITY SHOPPING CENTRE': 0.857142857142857,
 'IMM BUILDING': 0.7857142857142857,
 'HOLLAND PIAZZA': 0.7857142857142857,
 'BUGIS JUNCTION': 0.7857142857142856,
 'TIONG BAHRU PLAZA': 0.7142857142857143,
 'SHAW THEATRES WATERWAY POINT': 0.7142857142857143,
 'GREAT WORLD CITY': 0.7142857142857143,
 'ZHUJIAO CENTRE (TEKKA MARKET)': 0.7142857142857143,
 'BEAUTY WORLD PLAZA': 0.7142857142857143,
 'FU LU SHOU COMPLEX': 0.6785714285714286,
 'MUSTAFA CENTRE': 0.6428571428571429,
 'JUNCTION 8': 0.6428571428571429,
 'VALLEY POINT': 0.6428571428571429,
 'AMAR KIDZ @ ELIAS MALL PTE. LTD.': 0.6428571428571429,
 'BUGIS MRT STATION': 0.6428571428571429,
 'CHINATOWN POINT': 0.6428571428571429,
 'ROCHESTER MALL': 0.6428571428571429,
 'COMPASS ONE': 0.6071428571428571,
 'PIONEER MALL': 0.5714285714285714,
 '321 CLEMENTI': 0.5714285714285714,
 'LOYANG POINT': 0.5714285714285714,
 'OASIS TERRACES': 0.5714285714285714,
 'PASIR RIS WEST PLAZA': 0.5714285714285714,
 'RIVERVALE MALL': 0.5714285714285714,
 'ALEXANDRA RETAIL CENTRE (ARC)': 0.5714285714285714,
 'PUNGGOL PLAZA': 0.5714285714285714,
 'HEART OF YEW TEE': 0.5714285714285714,
 'RIVERVALE PLAZA': 0.5714285714285714,
 'SENGKANG GRAND MALL': 0.5714285714285714,
 'THE CLEMENTI MALL': 0.5714285714285714,
 'THE SELETAR MALL': 0.5714285714285714,
 'THE STAR VISTA': 0.5714285714285714,
 'UNITED SQUARE': 0.5714285714285714,
 'WISMA GEYLANG SERAI': 0.5714285714285714,
 'HILLION MALL': 0.5714285714285714,
 'KALLANG WAVE MALL': 0.5714285714285714,
 'CITY SQUARE MALL': 0.5714285714285714,
 'HDB HUB': 0.5714285714285714,
 'EASTPOINT MALL': 0.5714285714285714,
 'DEPOT HEIGHTS SHOPPING CENTRE': 0.5714285714285714,
 'CENTURY SQUARE': 0.5357142857142857,
 'CANBERRA PLAZA': 0.5267857142857143,
 'SINGAPORE POST CENTRE': 0.5,
 'FILMGARDE AT LEISURE PARK KALLANG': 0.5,
 'LEARNING LEAP PTE LTD (WHITE SANDS PRIMARY SCHOOL)': 0.5,
 'GEK POH SHOPPING CENTRE': 0.5,
 'SUNSHINE PLACE': 0.5,
 'NEX': 0.5,
 'LIMBANG SHOPPING CENTRE': 0.5,
 'HAWKER CENTRE @ OUR TAMPINES HUB': 0.5,
 'VISTA POINT': 0.5,
 'HOUGANG MALL': 0.5,
 'HOLLAND ROAD SHOPPING CENTRE': 0.5,
 'SHAW THEATRES LOT ONE': 0.48214285714285715,
 'GOLDEN VILLAGE (GV JURONG POINT)': 0.4642857142857143,
 'THOMSON PLAZA': 0.4642857142857143,
 'GREENRIDGE SHOPPING CENTRE': 0.4285714285714286,
 '888 PLAZA': 0.42857142857142855,
 'PCF TAMPINES EAST 3-IN-1 FAMILY CENTRE (STUDENT CARE)': 0.42857142857142855,
 "PEOPLE'S PARK CENTRE": 0.42857142857142855,
 'NOVENA SQUARE': 0.42857142857142855,
 'BUANGKOK SQUARE': 0.42857142857142855,
 'SUN PLAZA': 0.42857142857142855,
 'CATHAY CINEPLEX PARKWAY PARADE': 0.42857142857142855,
 'BUKIT PANJANG PLAZA': 0.42857142857142855,
 'HOUGANG 1': 0.42857142857142855,
 'YEW TEE SQUARE': 0.42857142857142855,
 'ADMIRALTY PLACE': 0.42857142857142855,
 'SIM LIM TOWER': 0.4285714285714285,
 'BUKIT TIMAH SEVEN MILE FLYOVER': 0.4285714285714285,
 'MINDCHAMPS PRESCHOOL @ WEST COAST PLAZA PTE. LIMITED': 0.39285714285714285,
 'TAMAN JURONG SHOPPING CENTRE': 0.39285714285714285,
 'VIVOCITY': 0.38928571428571423,
 'HEARTLAND MALL-KOVAN': 0.3571428571428572,
 "PEOPLE'S PARK COMPLEX": 0.3571428571428572,
 'GOLDEN VILLAGE (GV YISHUN)': 0.35714285714285715,
 'AMK HUB': 0.35714285714285715,
 'JUNCTION 10': 0.35714285714285715,
 'QUEENSWAY SHOPPING CENTRE': 0.35714285714285715,
 'UPPER SERANGOON SHOPPING CENTRE': 0.35714285714285715,
 'CATHAY CINEPLEX WEST MALL': 0.35714285714285715,
 'JEM': 0.35714285714285715,
 'TAMPINES MALL': 0.35714285714285715,
 'WESTGATE': 0.35714285714285715,
 '600 @ TOA PAYOH': 0.35714285714285715,
 'WISTERIA MALL': 0.35714285714285715,
 'NORTHSHORE PLAZA I': 0.35714285714285715,
 'FAJAR SHOPPING CENTRE': 0.35714285714285715,
 'WOODLANDS NORTH PLAZA': 0.35714285714285715,
 'ERA APAC CENTRE': 0.35714285714285715,
 'ANCHORPOINT SHOPPING CENTRE': 0.35714285714285715,
 'THE WOODLEIGH MALL': 0.35714285714285715,
 'DJITSUN MALL BEDOK': 0.3571428571428571,
 'TEKKA PLACE': 0.32142857142857145,
 'BEDOK MALL': 0.32142857142857145,
 'KINEX': 0.30357142857142855,
 'JUNCTION NINE': 0.2857142857142857,
 'CATHAY CINEPLEX CAUSEWAY POINT': 0.2857142857142857,
 'MYVILLAGE AT SERANGOON GARDEN': 0.2857142857142857,
 'NORTHPOINT CITY': 0.2857142857142857,
 'SEMBAWANG SHOPPING CENTRE': 0.2857142857142857,
 'HOUGANG RIVERCOURT': 0.21428571428571427,
 'PAYA LEBAR SQUARE': 0.21428571428571427,
 'THE MAJESTIC': 0.14285714285714285,
 'JEWEL CHANGI AIRPORT': 0.0}

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def get_prediction(addr_lat, addr_long, flat_type, area_sqft, month, year):

    # Hardcoded, based on median value observed in dataset
    max_floor_lvl = 13.0
    residential = 1
    commercial = 0
    market_hawker = 0
    miscellaneous = 0
    multistorey_carpark = 0
    precinct_pavilion = 0

    # Convert to sq.m.
    floor_area_sqm = round((area_sqft/10.764), 2)

    age_of_bldg = 38

    # With address, get nearest MRT, Mall, NPC, School, Green Area
    mrt = pd.read_csv("data/csvs/mrt_data.csv")
    mall = pd.read_csv("data/csvs/mall_data.csv")
    mall = mall.drop(mall[mall["Mall Name"] == "NIL"].index)
    npc = pd.read_csv("data/csvs/npc_data.csv")
    school = pd.read_csv("data/csvs/school_data.csv")
    green = pd.read_csv("data/csvs/green_data.csv")

    d_mrt = 0
    n_mrt = ""
    d_mall = 0
    n_mall = ""
    d_npc = 0
    n_npc = ""
    d_school = 0
    n_school = ""
    d_green = 0
    n_green = ""

    d_to_mrt = 99
    n_to_mrt = ""
    d_to_mall = 99
    n_to_mall = ""
    d_to_npc = 99
    n_to_npc = ""
    d_to_school = 99
    n_to_school = ""
    d_to_green = 99
    n_to_green = ""
    temp = 0

    for mrt_name, mrt_lat, mrt_long in zip(mrt["Station Name"], mrt["Station Lat"], mrt["Station Long"]):
        temp = great_circle((addr_lat, addr_long), (mrt_lat, mrt_long)).km
        if d_to_mrt > temp:
            d_to_mrt = temp
            n_to_mrt = mrt_name

    for mall_name, mall_lat, mall_long in zip(mall["Mall Name"], mall["Mall Lat"], mall["Mall Long"]):
        temp = great_circle((addr_lat, addr_long), (mall_lat, mall_long)).km
        if d_to_mall > temp:
            d_to_mall = temp
            n_to_mall = mall_name

    for npc_name, npc_lat, npc_long in zip(npc["NPC"], npc["NPC Lat"], npc["NPC Long"]):
        temp = great_circle((addr_lat, addr_long), (npc_lat, npc_long)).km
        if d_to_npc > temp:
            d_to_npc = temp
            n_to_npc = npc_name

    for school_name, school_lat, school_long in zip(school["Search Name"], school["School Lat"],school["School Long"]):
        temp = great_circle((addr_lat, addr_long), (school_lat, school_long)).km
        if d_to_school > temp:
            d_to_school = temp
            n_to_school = school_name

    for green_name, green_lat, green_long in zip(green["Green Area"], green["Green Lat"], green["Green Long"]):
        temp = great_circle((addr_lat, addr_long), (green_lat, green_long)).km
        if d_to_green > temp:
            d_to_green = temp
            n_to_green = green_name

    d_mrt = d_to_mrt
    n_mrt = n_to_mrt
    d_mall = d_to_mall
    n_mall = n_to_mall
    d_npc = d_to_npc
    n_npc = n_to_npc
    d_school = d_to_school
    n_school = n_to_school
    d_green = d_to_green
    n_green = n_to_green 

    # Converting flat_type into int
    flat_type_int = 1
    if flat_type == "EXECUTIVE":
        flat_type_int = int(0)
    else:
        flat_type_int = int(flat_type[0])

    flat_model_index = 0.150943
    town_index = 0.454545
    mrt_index = mrt_index_all[n_mrt]
    mall_index = mall_index_all[n_mall]

    values = [max_floor_lvl, residential, commercial,
       market_hawker, miscellaneous, multistorey_carpark,
       precinct_pavilion, floor_area_sqm, age_of_bldg,
       d_mrt, d_mall, d_npc, d_school, d_green,
       flat_type_int, flat_model_index, town_index, mrt_index,
       mall_index, month, year]
    
    columns = ['max_floor_lvl', 'residential', 'commercial',
       'market_hawker', 'miscellaneous', 'multistorey_carpark',
       'precinct_pavilion', 'floor_area_sqm', 'age_of_bldg',
       'Nearest MRT Distance', 'Nearest Mall Distance', 'Nearest NPC Distance',
       'Nearest School Distance', 'Nearest Green Area Distance',
       'flat_type_int', 'flat_model_index', 'town_index', 'mrt_index',
       'mall_index', 'month', 'year']

    # Inference
    df = pd.read_csv('data/csvs/df_random_train.csv')
    df['month'] = df[[f'month_{i}' for i in range(1,13)]].idxmax(axis=1).str.extract('(\d+)').astype(int)
    df['year']  = df[[f'year_{y}' for y in [2021,2022,2023,2024,2025]]].idxmax(axis=1).str[-4:].astype(int)
    df.drop(columns=[*[f'month_{i}' for i in range(1,13)], *[f'year_{y}' for y in [2021,2022,2023,2024,2025]]], inplace=True)
    train_df = df.sample(frac=0.8, random_state=42).reset_index(drop=True)
    scaler = StandardScaler().fit(train_df[NUM_FEATS])

    df_test = pd.DataFrame([values], columns=columns)
    df_test[NUM_FEATS] = scaler.transform(df_test[NUM_FEATS])

    X_lgb_test = df_test[NUM_FEATS+CAT_FEATS]
    lgbm = joblib.load('models/lgbm_model.pkl')
    pred_lgb_test = lgbm.predict(X_lgb_test)

    # MLP test
    oh = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
    oh.fit(train_df[CAT_FEATS])
    Xcat_test = oh.transform(df_test[CAT_FEATS])
    Xnum_test = df_test[NUM_FEATS].values
    X_test_mlp = np.hstack([Xnum_test, Xcat_test])
    class MLPRegressorPT(nn.Module):
        def __init__(self, input_dim):
            super().__init__()
            self.net = nn.Sequential(
                nn.Linear(input_dim,256), nn.BatchNorm1d(256), nn.ReLU(), nn.Dropout(0.3),
                nn.Linear(256,128), nn.BatchNorm1d(128), nn.ReLU(), nn.Dropout(0.3),
                nn.Linear(128,64), nn.BatchNorm1d(64),  nn.ReLU(), nn.Dropout(0.3),
                nn.Linear(64,1), nn.Softplus()
            )
        def forward(self,x): 
            return self.net(x)
    mlp_pt = MLPRegressorPT(X_test_mlp.shape[1])
    mlp_pt.load_state_dict(torch.load('models/best_mlp.pt', map_location='cpu'))
    mlp_pt.eval()
    with torch.no_grad():
        pred_mlp_test = mlp_pt(torch.tensor(X_test_mlp, dtype=torch.float32).to(device)).cpu().numpy().ravel()

    # TT test
    class TabularDataset(Dataset):
        def __init__(self,df, target=True):
            self.X_num = torch.tensor(df[NUM_FEATS].values, dtype=torch.float32)
            self.X_cat = [torch.tensor(pd.Categorical(df[c]).codes, dtype=torch.long) for c in CAT_FEATS]
            self.y = torch.tensor(df[TARGET].values, dtype=torch.float32).unsqueeze(1) if target else None
        def __len__(self): return len(self.X_num)
        def __getitem__(self, i):
            x = self.X_num[i]
            cats = [c[i] for c in self.X_cat]
            if self.y is not None:
                return (x, *cats), self.y[i]
            else:
                return x, *cats
            
    class TabTransformerRegressor(nn.Module):
        def __init__(self,num_cont,cat_cards,emb_dim=32,n_heads=4,depth=2,dropout=0.2):
            super().__init__()
            self.embs = nn.ModuleList([nn.Embedding(cards,emb_dim) for cards in cat_cards])
            self.cont_proj = nn.Linear(num_cont,emb_dim)
            encoder = nn.TransformerEncoderLayer(d_model=emb_dim,nhead=n_heads,dropout=dropout,batch_first=True)
            self.transformer = nn.TransformerEncoder(encoder,num_layers=depth)
            self.head = nn.Sequential(nn.LayerNorm(emb_dim),nn.Dropout(dropout),nn.Linear(emb_dim,1),nn.Softplus())
        def forward(self, x_cont, *x_cats):
            toks = [emb(x).unsqueeze(1) for emb, x in zip(self.embs, x_cats)]
            cont = self.cont_proj(x_cont).unsqueeze(1)
            x = torch.cat(toks + [cont], dim=1)
            x = self.transformer(x).mean(dim=1)
            return self.head(x)       

    cat_cards = [df[c].nunique() for c in CAT_FEATS]
    tt_model = TabTransformerRegressor(len(NUM_FEATS), cat_cards)
    tt_model.load_state_dict(torch.load('models/best_tt.pt', map_location='cpu'))
    tt_model.eval()
    tt_ds_test = TabularDataset(df_test, target=False)
    test_loader = DataLoader(tt_ds_test, batch_size=256, shuffle=False)
    tt_model = tt_model.to(device)
    preds = []
    tt_model.eval()
    with torch.no_grad():
        for batch in test_loader:
            x_num = batch[0].to(device)
            x_cats = [t.to(device) for t in batch[1:]]
            out = tt_model(x_num, *x_cats)
            preds.append(out.cpu().numpy())

    pred_tt_test = np.vstack(preds).ravel()


    # final blend
    w_lgb = 0.36412041775425485 
    w_mlp = 0.3179397911228726 
    w_tt = 0.3179397911228726
    final_preds = w_lgb*pred_lgb_test + w_mlp*pred_mlp_test + w_tt*pred_tt_test
    predicted_rent = float(final_preds[0])
    predicted_rent = round(predicted_rent, 2)

    return predicted_rent
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
import time
import undetected_chromedriver as uc

team_abbreviations = {
    "Cardinals": ["ARI", "Arizona"],
    "Falcons": ["ATL", "Atlanta"],
    "Ravens": ["BAL", "Baltimore"],
    "Bills": ["BUF", "Buffalo"],
    "Panthers": ["CAR", "Carolina"],
    "Bears": ["CHI", "Chicago"],
    "Bengals": ["CIN", "Cincinnati"],
    "Browns": ["CLE", "Cleveland"],
    "Cowboys": ["DAL", "Dallas"],
    "Broncos": ["DEN", "Denver"],
    "Lions": ["DET", "Detroit"],
    "Packers": ["GB", "Green Bay"],
    "Texans": ["HOU", "Houston"],
    "Colts": ["IND", "Indianapolis"],
    "Jaguars": ["JAC", "Jacksonville"],
    "Chiefs": ["KC", "Kansas City"],
    "Raiders": ["LV", "Las Vegas"],
    "Chargers": ["LAC", "Los Angeles"],
    "Rams": ["LAR", "Los Angeles"],
    "Dolphins": ["MIA", "Miami"],
    "Vikings": ["MIN", "Minnesota"],
    "Patriots": ["NE", "New England"],
    "Saints": ["NO", "New Orleans"],
    "Giants": ["NYG", "New York"],
    "Jets": ["NYJ", "New York"],
    "Eagles": ["PHI", "Philadelphia"],
    "Steelers": ["PIT", "Pittsburgh"],
    "49ers": ["SF", "San Francisco"],
    "Seahawks": ["SEA", "Seattle"],
    "Buccaneers": ["TB", "Tampa Bay"],
    "Titans": ["TEN", "Tennessee"],
    "Commanders": ["WAS", "Washington"]
}

def scrape_espn_rankings():
    options = webdriver.ChromeOptions()
    options.add_argument("--headless=new")  # Use the new headless mode
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                        "AppleWebKit/537.36 (KHTML, like Gecko) "
                        "Chrome/114.0.5735.90 Safari/537.36")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    
    driver = driver = uc.Chrome(headless=True)
    time.sleep(2)
    
    URLbody = 'https://fantasy.espn.com/football/players/projections?leagueFormatId='

    allPlayers = []
    formats = {'1':'Standard','3':'PPR'}

    for key in formats:

        URL = URLbody+key
        driver.get(URL)

        page = 0
        rank = 1

        while page<6:
            time.sleep(5)
            html_content = driver.page_source

            soup = BeautifulSoup(html_content, "html.parser")
            rows = soup.select(".player-info-section")
            
            for row in rows:
                player = {}
                
                player['image'] = row.select_one("img")["src"]
                player['name'] = row.select_one(".player-name").text

                if 'D/ST' in player['name']:
                    player['name'] = player['name'].split(' ')[0]
                    player['position'] = 'DST'
                    player['team'] = team_abbreviations[player['name']][0]
                    player['name'] = team_abbreviations[player['name']][1] + ' ' + player['name']
                    
                else:
                    player['position'] = row.select_one(".position-eligibility").text
                    player['team'] = row.select_one('.player-teamname').text
                    if player['team']!='FA':
                        player['team'] = team_abbreviations[player['team']][0]

                player['rank'] = rank
                player['format'] = formats[key]
                player['source'] = 'ESPN'

                rank+=1

                allPlayers.append(player)

            driver.find_element(By.CLASS_NAME,"Pagination__Button--next").click()
            page+=1

    driver.quit()
    return allPlayers
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
import undetected_chromedriver as uc
import time

def scrape_fantasypros_rankings():
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
    
    formats = {'PPR':'ppr','Half-PPR':'half-point-ppr','Standard':'consensus'}
    allPlayers = []
    for key in formats:
        URL = 'https://www.fantasypros.com/nfl/rankings/'+formats[key]+'-cheatsheets.php'
        driver.get(URL)
        time.sleep(10)

        html_content = driver.page_source

        soup = BeautifulSoup(html_content, "html.parser")
        rows = soup.select("table#ranking-table tbody tr")

        players = []
        for row in rows:
            if len(players)>=300:
                break
            cols = row.find_all("td")
            if len(cols) < 5:
                continue

            rank = int(cols[0].text.strip())
            name = cols[2].find("a").text

            # Example: "KC RB"
            positionData = cols[3].text
            if 'DST' in positionData:
                position = 'DST'
            elif 'K' in positionData:
                position = 'K'
            else:
                position = positionData[:2]
            team = cols[2].find('span').text.replace('(','').replace(')','')
            players.append({
                "rank": rank,
                "name": name,
                "team": team,
                "position": position,
                "source": "FantasyPros",
                "format": key
            })

        allPlayers = allPlayers+players

    driver.quit()

    return allPlayers
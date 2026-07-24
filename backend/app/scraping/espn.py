from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
import time

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

    
    URLbody = 'https://fantasy.espn.com/football/players/projections?leagueFormatId='

    allPlayers = []
    formats = {'1':'Standard','3':'PPR'}

    for key in formats:
        pages = []
        URL = URLbody+key

        pageNumber = 0
        rank = 1

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(URL)
            while pageNumber<6:
                time.sleep(5)
                html_content = page.content()
                pages.append(html_content)
                page.wait_for_selector(".Pagination__Button--next:not([aria-disabled='true'])", state="visible")
                page.locator(".Pagination__Button--next").click(force=True)
                pageNumber+=1
            browser.close()

        for page in pages:
            soup = BeautifulSoup(page, "html.parser")
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

    return allPlayers
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

def scrape_fantasypros_rankings():
    
    formats = {'PPR':'ppr','Half-PPR':'half-point-ppr','Standard':'consensus'}
    allPlayers = []
    for key in formats:
        URL = 'https://www.fantasypros.com/nfl/rankings/'+formats[key]+'-cheatsheets.php'
        
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(URL)
            selector = "table#ranking-table tbody tr"
            page.wait_for_function(
                f"selector => document.querySelectorAll(selector).length > {400}",
                arg=selector,
                timeout=10000
            )
            html_content = page.content()
            browser.close()

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

    return allPlayers
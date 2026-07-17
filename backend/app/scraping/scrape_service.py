from sqlalchemy.orm import Session
from sqlalchemy import update
from app.models.player import Player
from app.models.ranking import Ranking
from app.scraping.fantasypros import scrape_fantasypros_rankings
from app.scraping.espn import scrape_espn_rankings
import re

def run_all_scrapers(db: Session):
    data = scrape_fantasypros_rankings()

    for item in data:
        # Check if player exists
        item['name'] = canonical_name(item['name'])

        player = find_player(item,db)

        if player == None:
            player = Player(
                name=item["name"],
                team=item["team"],
                position=item["position"],
                image=None
            )
            db.add(player)
            db.commit()
            db.refresh(player)

        # Add ranking
        ranking = Ranking(
            player_id=player.id,
            source=item["source"],
            rank=item["rank"],
            format=item["format"]
        )
        db.add(ranking)
    
    data = scrape_espn_rankings()

    for item in data:
        
        item['name'] = canonical_name(item['name'])

        if item['name']=='Travis Hunter':
            item['position'] = 'WR'

        player = find_player(item,db)

        if player == None:
            player = Player(
                name=item["name"],
                team=item["team"],
                position=item["position"],
                image=item['image']
            )
            db.add(player)
            db.commit()
            db.refresh(player)
        else:
            db.execute(update(Player).where(Player.id == player.id).values(image=item['image']))
            db.commit()

        ranking = Ranking(
            player_id=player.id,
            source=item["source"],
            rank=item["rank"],
            format=item["format"]
        )
        db.add(ranking)
    
    espnPPR = db.query(Ranking).filter(
        Ranking.source == "ESPN",
        Ranking.format == "PPR"
    )
    unranked = 301
    halfRanks = []
    for ranking in espnPPR:
        halfPPR = {}

        halfPPR['player_id'] = ranking.player_id
        halfPPR['source'] = 'ESPN'
        halfPPR['format'] = 'Half-PPR'

        espnStandard = db.query(Ranking).filter(
            Ranking.player_id == halfPPR['player_id'],
            Ranking.source == "ESPN",
            Ranking.format == "Standard"
        ).one_or_none()

        if espnStandard!=None:

            halfPPR['avg'] = (ranking.rank + espnStandard.rank) /2
            halfPPR['lowest'] = min(ranking.rank, espnStandard.rank)
        
        else:
            halfPPR['avg'] = (ranking.rank + unranked) /2
            halfPPR['lowest'] = ranking.rank
            unranked+=1

        index = len(halfRanks)
        halfRanks.append(halfPPR)
        while halfRanks[index]['avg']<halfRanks[index-1]['avg'] or (halfRanks[index]['avg']==halfRanks[index-1]['avg'] and halfRanks[index]['lowest']<halfRanks[index-1]['lowest']):
            swap = halfRanks[index]
            halfRanks[index] = halfRanks[index-1]
            halfRanks[index-1] = swap
            index-=1
            if index ==0:
                break
    for i in range(0,len(halfRanks)):
        ranking = Ranking(
            player_id=halfRanks[i]['player_id'],
            source=halfRanks[i]["source"],
            rank=i+1,
            format=halfRanks[i]['format']
        )
        db.add(ranking)
    db.commit()

    return

def genrateAVGranks(db: Session):

    formats = ['PPR','Half-PPR','Standard']
    for scoring in formats:

        #get all of the rankings for specific scoring format
        allRanks =db.query(Ranking).filter(
            Ranking.format == scoring
        ).all()

        #add all players to a dictionary and all their ranks as the associated value in a list
        players = {}
        for rank in allRanks:

            if players.get(rank.player_id):
                players[rank.player_id].append(rank.rank)
            else:
                players[rank.player_id] = [rank.rank]

        dbEntries = []
        extras = []
        for player in players:

            #add all players with one associated rank to a list and sort that list lowest to highest
            if len(players[player])==1:

                index = len(extras)
                extras.append(player)
                while index-1>=0 and players[extras[index-1]][0]>players[player][0]:

                    extras[index] = extras[index-1]
                    index -= 1

                extras[index] = player
            
            #add all players with two associated ranks to a list and sort that list by avg rank lowest to highest
            elif len(players[player])==2:

                index = len(dbEntries)
                dbEntries.append(player)
                avg = (players[player][0]+players[player][1])/2
                avgComp = (players[dbEntries[index-1]][0]+players[dbEntries[index-1]][1])/2
                while index-1 >= 0 and avgComp > avg:

                    dbEntries[index] = dbEntries[index-1]
                    index -= 1
                    avgComp = (players[dbEntries[index-1]][0]+players[dbEntries[index-1]][1])/2

                dbEntries[index] = player
            
            else:
                print(players[player])
        
        #add each player with one associated rank to the sorted list of players with two ranks, adjusting for the absence of a ranking
        extraRank = 301
        for extra in extras:
            print(players[extra])

        #add sorted avg ranks to the database
        for i in range(0,len(dbEntries)):
            ranking = Ranking(
                player_id=dbEntries[i],
                source="AVG",
                rank=i+1,
                format=scoring
            )
            db.add(ranking)
    db.commit()
    return



SUFFIXES = ["Jr", "Jr.", "Sr", "Sr.", "II", "III", "IV", "V"]

def remove_suffix(name: str):
    parts = name.split()
    if parts[-1] in SUFFIXES:
        return " ".join(parts[:-1])
    return name

def normalize_initials(name: str):
    parts = name.split()
    if len(parts[0]) == 2 and parts[0].endswith("."):
        # "C." → "C"
        parts[0] = parts[0][0]
    return " ".join(parts)

def remove_punctuation(name: str):
    return re.sub(r"[^\w\s]", "", name)

def canonical_name(name: str):
    name = remove_suffix(name)
    name = normalize_initials(name)
    name = remove_punctuation(name)
    return name

def find_player(player, db: Session):
    nameFilters =  [Player.name.contains(word) for word in player['name']]

    options = db.query(Player).filter(
        Player.position == player['position'],
        Player.team == player['team'],
        *nameFilters
    ).all()

    if len(options)==1:

        return options[0]
    
    elif len(options)>1:
        min = 200
        for option in options:
            rankings = db.query(Ranking).filter(
                Ranking.player_id == option['id']
            )

            for ranking in rankings:
                diff = abs(ranking['rank']-player['rank'])

                if diff<min:
                    min = diff
                    selectedOption = option
                    
        return selectedOption
    
    return None
    

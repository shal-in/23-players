import json
import random

def create_game():
    with open("questions.json") as file:
        questions = json.load(file)

    taken = []
    for i in range(23):
        index = random.randint(0,len(questions)-1)
        while index in taken:
            index = random.randint(0,len(questions)-1)

        taken.append(index)

    game = []
    for index in taken:
        question = questions[index]
        game.append(question)

    return game


def add_game_to_db(db, data):
    doc_ref = db.collection('Test').document()
    doc_ref.set(data)
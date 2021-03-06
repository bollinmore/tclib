import datetime
import os
from flask import render_template, Blueprint, request, jsonify
import pytz
from app import line_chatbot
from app.tasks.add import add
from app.tasks.fetch import fetch

main_blueprint = Blueprint('main', __name__)

@main_blueprint.route('/')
def index():
    return render_template('index.html')


@main_blueprint.route('/callback', methods=['POST'])
def callback():
    line_chatbot.callback_handler(body=request.get_data(
            as_text=True), signature=request.headers['X-Line-Signature'])

    return 'OK'
    
@main_blueprint.route('/fetch-books')
def fetch_books():
    r = fetch.delay()
    return 'ok'

@main_blueprint.route('/testadd')
def test_add():
    r = add.delay(1, 1)
    return jsonify({'result':r.get()})

@main_blueprint.route('/barcode/<string:id>')
def barcode(id):
    info = os.environ.get(id).split(";")
    name = info[0]
    cardId = info[1]
    today = datetime.datetime.now(pytz.timezone(
        'Asia/Taipei')).date().strftime("%m/%d/%Y")
    return render_template('card_barcode.html', name=name, cardId=cardId, today=today)

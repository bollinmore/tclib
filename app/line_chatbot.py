import logging
import os

from linebot import (
    LineBotApi, WebhookHandler
)
from linebot.exceptions import (
    InvalidSignatureError
)
from linebot.models import TextSendMessage, MessageEvent, TextMessage
from flask import request, abort

line_bot_api = LineBotApi(os.environ.get('LINE_TOKEN'))
handler = WebhookHandler(os.environ.get('LINE_SECRET'))

class chatbot():

    def __init__(self, token, secret) -> None:
        self.line_bot_api = LineBotApi(token)
        self.handler = WebhookHandler(secret)

    def send(self, uid, msg) -> bool:
        try:
            self.line_bot_api.push_message(
                uid, [
                    TextSendMessage(text=msg),
                ]
            )
        except Exception as e:
            logging.debug(str(e))

    def brocast(self, msg) -> bool:
        try:
            self.line_bot_api.broadcast([
                TextSendMessage(text=msg),
            ]
            )
        except Exception as e:
            logging.debug(str(e))
            return False

        return True

def callback_handler(body, signature):
    try:
        handler.handle(body, signature)  # handle webhook body
    except InvalidSignatureError:
        print("Invalid signature. Please check your channel access token/channel secret.")
        abort(400)

    return 'OK'

@handler.add(MessageEvent, message=TextMessage)
def handle_text_message(event):
    text = event.message.text

    if text == '/refresh':
        from app.tasks.fetch import fetch
        line_bot_api.reply_message(
            event.reply_token, TextSendMessage(text="Scanning"))
        fetch.delay()
    else:
        line_bot_api.reply_message(
            event.reply_token, TextSendMessage(text=event.message.text))
        

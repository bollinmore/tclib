import logging

from linebot import (
    LineBotApi, WebhookHandler
)
from linebot.models import TextSendMessage

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

        